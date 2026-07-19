import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

export interface ResourceProcedureOptions<TContent> {
  // Runs after saveResourceContent persists, receiving the prior content for diffing (undefined on the
  // first save). Best-effort and fire-and-forget: it must never fail or delay the user's save.
  afterSaveResourceContent?: (
    ctx: AuthedContext,
    resource: Resource,
    content: TContent,
    previousContent: TContent | undefined,
  ) => Promise<void>;
}
