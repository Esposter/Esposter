import type { z } from "zod";

import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { checkIsNotFound } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, streamToText } from "@esposter/shared";

// Reads one content blob — a working copy or a published snapshot — and parses it with the type's content
// Schema. The blob name is the caller's, since the two live under different paths for the same resource.
export const readContentBlob = async <TSchema extends z.ZodType>(
  contentSchema: TSchema,
  blobName: string,
): Promise<undefined | z.infer<TSchema>> => {
  // A missing blob rejects, so a genuine 404 reads as "no content yet" while transient Azure or parse failures
  // Surface as an internal error rather than a false empty
  const { readableStreamBody } = await getResultAsync(() => useDownload(AzureContainer.ResourceAssets, blobName)).match(
    (response) => response,
    (error) => {
      if (checkIsNotFound(error)) return { readableStreamBody: undefined };
      throw error;
    },
  );
  if (!readableStreamBody) return undefined;
  // eslint-disable-next-line no-restricted-syntax -- the content schema owns date coercion, so free-text ISO strings survive
  return contentSchema.parse(JSON.parse(await streamToText(readableStreamBody)));
};
