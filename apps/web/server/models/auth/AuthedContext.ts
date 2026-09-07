import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

export type AuthedContext = Context & {
  getSessionPayload: GetSessionPayload;
};
