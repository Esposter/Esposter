import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";

import { useUpdateBlobUrls } from "@@/server/composables/resource/useUpdateBlobUrls";
import { jsonDateParse } from "@esposter/shared";

// Asset SAS urls baked into content expire, so every read — owner working copy or published snapshot —
// Re-signs them against the blobs the urls already point at (the serialized form is rewritten so any
// Content shape works without knowing where its urls live)
export const transformReadBlobUrls = async <TContent>(
  _ctx: Context,
  _resource: Resource,
  content: TContent,
): Promise<TContent> => jsonDateParse(await useUpdateBlobUrls(JSON.stringify(content)));
