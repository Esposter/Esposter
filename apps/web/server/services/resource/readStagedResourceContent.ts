import type { Resource } from "@esposter/db-schema";

import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getStagingContentBlobName } from "@@/server/services/resource/getStagingContentBlobName";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { checkIsNotFound } from "@esposter/db";
import { AzureContainer, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { gunzip } from "node:zlib";

const decompress = promisify(gunzip);
// A write SAS carries no length, so the staged bytes are measured here rather than trusted: the size before the
// Download is allocated, the hash against what the client says it uploaded, and the inflation capped so a small
// Archive that expands past the content limit stops at it instead of filling the heap. The gzip of a document
// Under the limit is smaller than the document, so the limit bounds both
export const readStagedResourceContent = async (id: Resource["id"], hash: string): Promise<unknown> => {
  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const blockBlobClient = containerClient.getBlockBlobClient(getStagingContentBlobName(id));
  const { contentLength = 0 } = await getResultAsync(() => blockBlobClient.getProperties()).match(
    (properties) => properties,
    (error) => {
      if (checkIsNotFound(error))
        throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Resource, "no staged content to commit");
      throw error;
    },
  );
  if (contentLength > MAX_RESOURCE_CONTENT_SIZE)
    throw getInvalidOperationError(
      Operation.Update,
      DatabaseEntityType.Resource,
      `staged content is larger than ${MAX_RESOURCE_CONTENT_SIZE} bytes`,
    );

  const compressedContent = await blockBlobClient.downloadToBuffer(0, contentLength);
  // A mismatch is another device's upload landing on the same name between this one's PUT and its commit
  if (createHash("sha256").update(compressedContent).digest("hex") !== hash)
    throw getInvalidOperationError(
      Operation.Update,
      DatabaseEntityType.Resource,
      "staged content does not match its hash",
    );

  const serializedContent = await getResultAsync(() =>
    decompress(compressedContent, { maxOutputLength: MAX_RESOURCE_CONTENT_SIZE }),
  ).match(
    (content) => content.toString(),
    () => {
      throw getInvalidOperationError(
        Operation.Update,
        DatabaseEntityType.Resource,
        `staged content is not a gzip of at most ${MAX_RESOURCE_CONTENT_SIZE} bytes`,
      );
    },
  );
  // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, so free-text ISO strings survive
  return JSON.parse(serializedContent);
};
