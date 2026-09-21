import type { Resource } from "@esposter/db-schema";

import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { checkIsNotFound, getContentBlobName } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, streamToText } from "@esposter/shared";

// The working copy as the bytes it is stored as. A missing blob rejects, so a genuine 404 reads as "no content
// Yet" — a resource created and never saved — while transient Azure failures surface as an internal error rather
// Than a false empty
export const readSerializedResourceContent = async (id: Resource["id"]): Promise<string | undefined> => {
  const contentStream = await getResultAsync(() =>
    useDownload(AzureContainer.ResourceAssets, getContentBlobName(id)),
  ).match(
    ({ readableStreamBody }) => readableStreamBody,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  if (contentStream) return streamToText(contentStream);
  else return undefined;
};
