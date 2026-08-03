import type { z } from "zod";

import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { RestError } from "@azure/storage-blob";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, streamToText } from "@esposter/shared";

// Reads one content blob — a working copy or a published snapshot — and parses it with the type's content
// Schema. The blob name is the caller's, since the two live under different paths for the same resource.
export const readContentBlob = async <TSchema extends z.ZodType>(
  contentSchema: TSchema,
  blobName: string,
): Promise<undefined | z.infer<TSchema>> => {
  // BlobClient.download() rejects on a missing blob, so treat a genuine 404 as "no content yet"
  // While letting transient Azure or parse failures surface as an internal error instead of a false empty.
  const { readableStreamBody } = await getResultAsync(() => useDownload(AzureContainer.ResourceAssets, blobName)).match(
    (response) => response,
    (error) => {
      if (error instanceof RestError && error.statusCode === 404) return { readableStreamBody: undefined };
      throw error;
    },
  );
  if (!readableStreamBody) return undefined;
  // Parse the blob as plain JSON: the content schema owns date coercion (z.coerce.date()) on its
  // Genuine date fields, so ISO-datetime strings in free-text fields (e.g. Sheet cells) survive as strings.
  // eslint-disable-next-line no-restricted-syntax -- the content schema owns date coercion, so free-text ISO strings survive
  return contentSchema.parse(JSON.parse(await streamToText(readableStreamBody)));
};
