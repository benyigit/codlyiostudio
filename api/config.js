export default {
  fetch(request) {
    if (request.method !== "GET") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    return Response.json({
      supabaseUrl: process.env.CODLY_SUPABASE_URL || "",
      supabasePublishableKey: process.env.CODLY_SUPABASE_PUBLISHABLE_KEY || ""
    }, {
      headers: { "cache-control": "no-store" }
    });
  }
};
