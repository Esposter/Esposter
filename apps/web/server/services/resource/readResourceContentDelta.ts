import type { Resource } from "@esposter/db-schema";

import {
  CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE,
  MAX_RESOURCE_CONTENT_SIZE,
} from "#shared/services/resource/constants";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { getContentBlobName, readJsonBlob } from "@esposter/db";
import { AzureContainer, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, getWindowLog, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { constants, zstdDecompress } from "node:zlib";

const decompress = promisify(zstdDecompress);
// The document a delta save describes: the stored content, decoded, is the dictionary, so the baseline the client
// Compressed against has to be exactly those bytes. The row's hash refuses a stale baseline before anything is
// Read, and the blob's own hash settles the one case the row cannot — a blob a failed transaction left behind it.
// The output is capped at the content limit, so a small frame that inflates past it stops there
// A mismatch is CONFLICT, the one code here errorLink does not alert: the client retries it as a full save, and the
// Owner has nothing to be told
export const readResourceContentDelta = async (
  resource: Resource,
  baselineHash: string,
  delta: string,
): Promise<unknown> => {
  if (resource.contentHash !== baselineHash)
    throw new TRPCError({ code: "CONFLICT", message: CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE });

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const baseline = await readJsonBlob(containerClient, getContentBlobName(resource.id));
  if (!baseline || createHash("sha256").update(baseline).digest("hex") !== baselineHash)
    throw new TRPCError({ code: "CONFLICT", message: CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE });

  const serializedContent = await getResultAsync(() =>
    decompress(Uint8Array.fromBase64(delta), {
      dictionary: baseline,
      maxOutputLength: MAX_RESOURCE_CONTENT_SIZE,
      params: { [constants.ZSTD_d_windowLogMax]: getWindowLog(baseline.byteLength, MAX_RESOURCE_CONTENT_SIZE) },
    }),
  ).match(
    (content) => content.toString(),
    () => {
      throw getInvalidOperationError(
        Operation.Update,
        DatabaseEntityType.Resource,
        `content delta is not a zstd frame of at most ${MAX_RESOURCE_CONTENT_SIZE} bytes against its baseline`,
      );
    },
  );
  // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, so free-text ISO strings survive
  return JSON.parse(serializedContent);
};
