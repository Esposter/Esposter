import type { Resource } from "@esposter/db-schema";
import type { z } from "zod";

import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { RestError } from "@azure/storage-blob";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, streamToText } from "@esposter/shared";

export const readResourceContent = async <TSchema extends z.ZodType>(
  contentSchema: TSchema,
  id: Resource["id"],
): Promise<undefined | z.infer<TSchema>> => {
  // BlobClient.download() rejects on a missing blob, so treat a genuine 404 as "no content yet"
  // While letting transient Azure or parse failures surface as an internal error instead of a false empty.
  const { readableStreamBody } = await getResultAsync(() =>
    useDownload(AzureContainer.ResourceAssets, getContentBlobName(id)),
  ).match(
    (response) => response,
    (error) => {
      if (error instanceof RestError && error.statusCode === 404) return { readableStreamBody: undefined };
      throw error;
    },
  );
  if (!readableStreamBody) return undefined;
  // Parse the blob as plain JSON: the content schema owns date coercion (z.coerce.date()) on its
  // Genuine date fields, so ISO-datetime strings in free-text fields (e.g. Sheet cells) survive as strings.
  return contentSchema.parse(JSON.parse(await streamToText(readableStreamBody)));
};
