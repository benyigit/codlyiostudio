export function createWorkspaceStore(config, sdk = window.supabase) {
  if (!sdk || typeof sdk.createClient !== "function") {
    throw new Error("Supabase client could not be loaded.");
  }

  const client = sdk.createClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true
    }
  });

  async function unwrap(request) {
    const result = await request;
    if (result.error) throw result.error;
    return result.data;
  }

  return {
    async getSession() {
      const data = await unwrap(client.auth.getSession());
      return data.session;
    },
    onAuthStateChange(callback) {
      const result = client.auth.onAuthStateChange((_event, session) => {
        callback(session ? session.user : null);
      });
      return result.data.subscription;
    },
    async signIn(email, password) {
      return unwrap(client.auth.signInWithPassword({ email, password }));
    },
    async signUp(email, password, redirectTo = new URL("/office", window.location.origin).toString()) {
      return unwrap(client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } }));
    },
    async signOut() {
      return unwrap(client.auth.signOut());
    },
    async loadSnapshot() {
      const data = await unwrap(
        client.from("workspace_snapshots").select("data, revision").maybeSingle()
      );
      return data ? { data: data.data, revision: Number(data.revision) } : null;
    },
    subscribeSnapshot(userId, callback) {
      const channel = client.channel("workspace-snapshot-" + userId)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "workspace_snapshots",
          filter: "user_id=eq." + userId
        }, (payload) => {
          if (payload.new && payload.new.data) {
            callback({ data: payload.new.data, revision: Number(payload.new.revision) });
          }
        })
        .subscribe();
      return { unsubscribe: () => client.removeChannel(channel) };
    },
    async saveSnapshot(snapshot, expectedUserId, expectedRevision) {
      const auth = await unwrap(client.auth.getUser());
      if (!auth.user) throw new Error("Sign in before saving workspace data.");
      if (expectedUserId && auth.user.id !== expectedUserId) {
        throw new Error("The signed-in account changed before workspace sync completed.");
      }
      if (expectedRevision == null) {
        await unwrap(client.from("workspace_snapshots").insert({
          user_id: auth.user.id,
          data: snapshot,
          revision: 1
        }));
        return 1;
      }
      const row = await unwrap(client.from("workspace_snapshots").update({
        data: snapshot,
        revision: expectedRevision + 1,
        updated_at: new Date().toISOString()
      }).eq("user_id", auth.user.id).eq("revision", expectedRevision).select("revision").maybeSingle());
      if (!row) {
        const error = new Error("This workspace was changed on another device. Reload it before saving more changes.");
        error.code = "WORKSPACE_CONFLICT";
        throw error;
      }
      return Number(row.revision);
    }
  };
}
