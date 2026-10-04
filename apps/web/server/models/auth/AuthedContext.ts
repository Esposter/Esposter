import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

export type AuthedContext = Context & { getSessionPayload: GetSessionPayload };
