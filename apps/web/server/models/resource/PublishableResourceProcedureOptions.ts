import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

// The read half of the snapshot boundary is not here: which parts of a type's content are live rather than
// Frozen is declared in `ResourceLiveContentMap`, where every path that reconstitutes a snapshot reads it
export interface PublishableResourceProcedureOptions<TContent> {
  // Rewrite content at publish time with the owner's authority (e.g. bake dataset snapshots, clone asset
  // Blobs and rewrite their stable urls under the publish directory). It runs before the publish transaction
  // Claims a version — and outside it, because a hook resolving a dataset reads through `ctx.db` — so nothing
  // It writes may be keyed by the version this publish is about to get
  transformPublishedContent?: (ctx: AuthedContext, resource: Resource, content: TContent) => Promise<TContent>;
}
