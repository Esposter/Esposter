import type { AuthSession } from "#server/models/auth/AuthSession";
import type { Context } from "#server/trpc/context";

// A procedure's context past the authed middleware, where the caller is known
export type AuthedContext = AuthSession & Context;
