import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";

export interface PublishableResourceProcedureOptions<TContent> {
  // Rewrite content on the public read (e.g. merge live collection settings over the immutable snapshot).
  // The caller is anonymous, so this hook gets the unauthed context
  transformPublicReadContent?: (ctx: Context, resource: Resource, content: TContent) => Promise<TContent>;
  // Rewrite content at publish time with the owner's authority (e.g. bake dataset snapshots, clone asset blobs)
  transformPublishedContent?: (ctx: AuthedContext, resource: Resource, content: TContent) => Promise<TContent>;
  // Rewrite content on owner read (e.g. refresh SAS asset URLs)
  transformReadContent?: (ctx: AuthedContext, resource: Resource, content: TContent) => Promise<TContent>;
}
