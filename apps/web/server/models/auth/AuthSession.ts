import type { auth } from "#server/auth";

// A signed-in caller as the app's auth reads one: the session the request carries and its user, with every field the
// App's auth adds to either
export type AuthSession = typeof auth.$Infer.Session;
