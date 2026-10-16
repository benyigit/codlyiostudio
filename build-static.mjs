import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(root, "dist");
const staticFiles = [
  "index.html",
  "office.html",
  "app.js",
  "office3d.js",
  "workspace-store.js",
  "styles.css",
  "landing.css",
  "favicon.svg"
];

await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, "vendor/three"), { recursive: true });

for (const file of staticFiles) {
  await cp(resolve(root, file), resolve(output, file));
}

const officePath = resolve(output, "office.html");
const officeHtml = (await readFile(officePath, "utf8")).replace(
  "/node_modules/@supabase/supabase-js/dist/umd/supabase.js",
  "/vendor/supabase.js"
);
await writeFile(officePath, officeHtml);

const office3dPath = resolve(output, "office3d.js");
const office3d = (await readFile(office3dPath, "utf8")).replace(
  "./node_modules/three/build/three.module.js",
  "/vendor/three/three.module.js"
);
await writeFile(office3dPath, office3d);

await cp(
  resolve(root, "node_modules/@supabase/supabase-js/dist/umd/supabase.js"),
  resolve(output, "vendor/supabase.js")
);
await cp(resolve(root, "node_modules/three/build"), resolve(output, "vendor/three"), { recursive: true });

console.log(`Vercel static site built in ${output}`);
