import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

export interface PublishableResourceProcedureOptions<TContent> {
  // Rewrite content at publish time with the owner's authority (e.g. bake dataset snapshots, clone asset blobs)
  transformPublishedContent?: (ctx: AuthedContext, resource: Resource, content: TContent) => Promise<TContent>;
  // Rewrite content on owner read (e.g. refresh SAS asset URLs)
  transformReadContent?: (ctx: AuthedContext, resource: Resource, content: TContent) => Promise<TContent>;
}
