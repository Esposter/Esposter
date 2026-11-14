import { readSession } from "#server/services/auth/readSession";
import { middleware } from "#server/trpc";

// The caller, read once per call: a route that authenticated it another way, as the MCP route does an API key's owner,
// Hands it over, and any other call reads the session cookie. A caller with no session is a null user and session
export const sessionMiddleware = middleware(async ({ ctx, next }) => {
  if (ctx.session && ctx.user) return next({ ctx: { session: ctx.session, user: ctx.user } });

  const authSession = await readSession(ctx.headers, ctx.responseHeaders);
  return next({ ctx: { session: authSession?.session ?? null, user: authSession?.user ?? null } });
});
