import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";

import { useUpdateBlobUrls } from "@@/server/composables/resource/useUpdateBlobUrls";

// Asset SAS urls baked into content expire, so every read — owner working copy or published snapshot —
// Re-signs them against the blobs the urls already point at (every string leaf is rewritten so any content
// Shape works without knowing where its urls live)
export const transformReadBlobUrls = <TContent>(
  _ctx: Context,
  _resource: Resource,
  content: TContent,
): Promise<TContent> => useUpdateBlobUrls(content);
