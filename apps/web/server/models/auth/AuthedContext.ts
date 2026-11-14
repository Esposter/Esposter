import type { Context } from "#server/trpc/context";
import type { Session, User } from "better-auth";

// A procedure's context past the authed middleware, where the caller is known
export type AuthedContext = Context & { session: Session; user: User };
