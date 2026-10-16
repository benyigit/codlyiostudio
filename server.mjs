import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));
const HOST = "127.0.0.1";
const PORT = Number(process.env.CODLY_OFFICE_PORT || 4321);

try {
  const localEnv = await readFile(resolve(ROOT, ".env.local"), "utf8");
  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^\s*(CODLY_SUPABASE_URL|CODLY_SUPABASE_PUBLISHABLE_KEY)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^(?:"(.*)"|'(.*)')$/, (_, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted);
  }
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const SUPABASE_URL = String(process.env.CODLY_SUPABASE_URL || "").trim();
const SUPABASE_PUBLISHABLE_KEY = String(process.env.CODLY_SUPABASE_PUBLISHABLE_KEY || "").trim();
const MAX_BODY = 1024 * 1024;
const routes = new Map();
const providers = new Set([
  "OpenAI-compatible", "Anthropic", "Google Gemini", "OpenRouter",
  "Ollama", "LM Studio", "Custom endpoint"
]);
const localProviders = new Set(["Ollama", "LM Studio"]);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function sendJson(response, status, data) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(data));
}

function readJson(request) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY) {
        reject(Object.assign(new Error("Request body is too large."), { status: 413 }));
        request.destroy();
      }
    });
    request.on("end", () => {
      try { resolveBody(JSON.parse(body || "{}")); }
      catch { reject(Object.assign(new Error("Request body must be valid JSON."), { status: 400 })); }
    });
    request.on("error", reject);
  });
}

function cleanText(value, maxLength = 4000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validateLocalRequest(request, response) {
  const host = String(request.headers.host || "").toLowerCase();
  const allowedHosts = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);
  if (!allowedHosts.has(host)) {
    sendJson(response, 403, { error: "This local service only accepts requests addressed to localhost." });
    return false;
  }
  const origin = request.headers.origin;
  if (origin && origin !== `http://127.0.0.1:${PORT}` && origin !== `http://localhost:${PORT}`) {
    sendJson(response, 403, { error: "Requests from this website are not allowed." });
    return false;
  }
  return true;
}

function routeSummary(route) {
  return {
    employeeId: route.employeeId,
    provider: route.provider,
    model: route.model,
    baseUrl: route.baseUrl,
    keyConfigured: Boolean(route.apiKey)
  };
}

function getProviderUrl(route) {
  const defaults = {
    "OpenAI-compatible": "https://api.openai.com/v1",
    Anthropic: "https://api.anthropic.com",
    "Google Gemini": "https://generativelanguage.googleapis.com",
    OpenRouter: "https://openrouter.ai/api/v1",
    Ollama: "http://127.0.0.1:11434/v1",
    "LM Studio": "http://127.0.0.1:1234/v1"
  };
  const value = route.baseUrl || defaults[route.provider];
  if (!value) throw Object.assign(new Error("Enter a base URL for this provider."), { status: 400 });
  let url;
  try { url = new URL(value); }
  catch { throw Object.assign(new Error("The provider base URL is not valid."), { status: 400 }); }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw Object.assign(new Error("Provider URLs must use HTTP or HTTPS."), { status: 400 });
  }
  return url;
}

function endpoint(baseUrl, suffix) {
  const url = new URL(baseUrl);
  const basePath = url.pathname.replace(/\/+$/, "");
  if (basePath.endsWith(suffix)) return url.toString();
  url.pathname = `${basePath}${suffix}`.replace(/\/+/g, "/");
  return url.toString();
}

async function readProviderResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Provider returned HTTP ${response.status}.`;
    throw Object.assign(new Error(String(message).slice(0, 800)), { status: 502 });
  }
  return data;
}

async function callOpenAICompatible(route, messages) {
  const base = getProviderUrl(route).toString();
  const url = endpoint(base, "/chat/completions");
  const headers = { "content-type": "application/json" };
  if (route.apiKey) headers.authorization = `Bearer ${route.apiKey}`;
  if (route.provider === "OpenRouter") {
    headers["http-referer"] = `http://127.0.0.1:${PORT}`;
    headers["x-title"] = "Codly Office";
  }
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: route.model, messages, temperature: 0.2 }),
    signal: AbortSignal.timeout(120_000)
  });
  const data = await readProviderResponse(response);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("The provider returned an empty response.");
  return { text: content, usage: data.usage || null };
}

async function callAnthropic(route, messages) {
  const base = getProviderUrl(route).toString();
  const url = endpoint(base, "/v1/messages");
  const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
  const conversation = messages.filter((message) => message.role !== "system");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": route.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({ model: route.model, max_tokens: 3000, system, messages: conversation }),
    signal: AbortSignal.timeout(120_000)
  });
  const data = await readProviderResponse(response);
  const content = Array.isArray(data.content) ? data.content.filter((item) => item.type === "text").map((item) => item.text).join("\n") : "";
  if (!content.trim()) throw new Error("The provider returned an empty response.");
  return { text: content, usage: data.usage || null };
}

async function callGemini(route, messages) {
  const base = getProviderUrl(route);
  const prefix = base.pathname.replace(/\/+$/, "");
  base.pathname = `${prefix}/v1beta/models/${encodeURIComponent(route.model)}:generateContent`.replace(/\/+/g, "/");
  base.searchParams.set("key", route.apiKey);
  const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
  const contents = messages.filter((message) => message.role !== "system").map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }]
  }));
  const payload = { contents, generationConfig: { temperature: 0.2 } };
  if (system) payload.systemInstruction = { parts: [{ text: system }] };
  const response = await fetch(base, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(120_000)
  });
  const data = await readProviderResponse(response);
  const content = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  if (!content.trim()) throw new Error("The provider returned an empty response.");
  return { text: content, usage: data.usageMetadata || null };
}

async function callModel(route, messages) {
  if (!route.model) throw Object.assign(new Error("Choose a model ID in this employee's profile."), { status: 400 });
  if (!route.apiKey && !localProviders.has(route.provider)) {
    throw Object.assign(new Error("Add an API key for this provider in the employee profile."), { status: 400 });
  }
  if (route.provider === "Anthropic") return callAnthropic(route, messages);
  if (route.provider === "Google Gemini") return callGemini(route, messages);
  return callOpenAICompatible(route, messages);
}

async function serveStatic(pathname, response) {
  const requested = pathname === "/"
    ? "/index.html"
    : pathname === "/office" || pathname === "/office/"
      ? "/office.html"
      : ["/privacy", "/privacy/", "/terms", "/terms/", "/cookies", "/cookies/"].includes(pathname)
        ? `/${pathname.split("/").filter(Boolean)[0]}.html`
      : decodeURIComponent(pathname);
  const filePath = resolve(ROOT, `.${requested}`);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
    sendJson(response, 403, { error: "Path is outside the application directory." });
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file.");
    const contents = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-cache",
      "x-content-type-options": "nosniff"
    });
    response.end(contents);
  } catch {
    sendJson(response, 404, { error: "File not found." });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
  if (request.method === "GET" && url.pathname === "/api/config") {
    sendJson(response, 200, {
      supabaseUrl: SUPABASE_URL,
      supabasePublishableKey: SUPABASE_PUBLISHABLE_KEY
    });
    return;
  }
  if (!validateLocalRequest(request, response)) return;

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, mode: "local", version: "0.1.0" });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/routes") {
      sendJson(response, 200, { routes: Array.from(routes.values(), routeSummary) });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/routes") {
      const body = await readJson(request);
      const employeeId = cleanText(body.employeeId, 80);
      const provider = cleanText(body.provider, 80);
      const model = cleanText(body.model, 200);
      const baseUrl = cleanText(body.baseUrl, 1000);
      const apiKey = cleanText(body.apiKey, 8000);
      if (!/^staff-\d+$/.test(employeeId)) throw Object.assign(new Error("Unknown employee ID."), { status: 400 });
      if (!providers.has(provider)) throw Object.assign(new Error("Choose a supported provider."), { status: 400 });
      if (baseUrl) getProviderUrl({ provider, baseUrl });
      const previous = routes.get(employeeId);
      const key = apiKey || (previous?.provider === provider ? previous.apiKey : "");
      const route = { employeeId, provider, model, baseUrl, apiKey: key };
      routes.set(employeeId, route);
      sendJson(response, 200, { route: routeSummary(route) });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/routes/clear-key") {
      const body = await readJson(request);
      const employeeId = cleanText(body.employeeId, 80);
      const route = routes.get(employeeId);
      if (route) route.apiKey = "";
      sendJson(response, 200, { route: route ? routeSummary(route) : null });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/chat") {
      const body = await readJson(request);
      const employeeId = cleanText(body.employeeId, 80);
      const route = routes.get(employeeId);
      if (!route) throw Object.assign(new Error("Save a provider route for this employee first."), { status: 400 });
      if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 30) {
        throw Object.assign(new Error("Send between 1 and 30 messages."), { status: 400 });
      }
      const messages = body.messages.map((item) => {
        const role = cleanText(item?.role, 20);
        const content = cleanText(item?.content, 100_000);
        if (!["system", "user", "assistant"].includes(role) || !content) {
          throw Object.assign(new Error("Messages need a supported role and non-empty text."), { status: 400 });
        }
        return { role, content };
      });
      const result = await callModel(route, messages);
      sendJson(response, 200, { text: result.text, usage: result.usage });
      return;
    }
    if (request.method === "GET" || request.method === "HEAD") {
      await serveStatic(url.pathname, response);
      return;
    }
    sendJson(response, 404, { error: "Endpoint not found." });
  } catch (error) {
    sendJson(response, error.status || 502, { error: error.message || "The request failed." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Codly Office is available at http://${HOST}:${PORT}`);
  console.log("Provider keys remain in server memory and are cleared when the process exits.");
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
