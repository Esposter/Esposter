import type { Resource } from "@esposter/db-schema";
import type { z } from "zod";

import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { checkIsNotFound, getContentBlobName } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, streamToText } from "@esposter/shared";

// Reads the working copy and parses it with the type's content schema. A retained version is not a blob but
// An object, and `readSnapshotVersionContent` is what reconstructs one
export const readResourceContent = async <TSchema extends z.ZodType>(
  contentSchema: TSchema,
  id: Resource["id"],
): Promise<undefined | z.infer<TSchema>> => {
  // A missing blob rejects, so a genuine 404 reads as "no content yet" while transient Azure or parse failures
  // Surface as an internal error rather than a false empty
  const { readableStreamBody } = await getResultAsync(() =>
    useDownload(AzureContainer.ResourceAssets, getContentBlobName(id)),
  ).match(
    (response) => response,
    (error) => {
      if (checkIsNotFound(error)) return { readableStreamBody: undefined };
      throw error;
    },
  );
  // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, so free-text ISO strings survive
  if (readableStreamBody) return contentSchema.parse(JSON.parse(await streamToText(readableStreamBody)));
  else return undefined;
};
