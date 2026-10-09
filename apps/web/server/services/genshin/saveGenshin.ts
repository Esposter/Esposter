import type { SaveGenshinInput } from "#server/models/genshin/SaveGenshinInput";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { checkIsGenshinSessionCurrent } from "#server/services/genshin/checkIsGenshinSessionCurrent";
import { getGenshinSessionReplacedError } from "#server/services/genshin/getGenshinSessionReplacedError";
import { readGenshinSaveState } from "#server/services/genshin/readGenshinSaveState";
import { checkIsPreconditionFailed, writeJsonBlob } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

export interface SaveGenshinResult {
  etag: string | undefined;
  serverNow: string;
}

// A write from a session that is no longer current is refused, never merged. The ETag is the safety net: a blob that
// Changed under the read is the same loss of the lease, so it is refused as a replacement too
export const saveGenshin = async (
  userId: string,
  { save, sessionId }: SaveGenshinInput,
): Promise<SaveGenshinResult> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const { envelope, etag } = await readGenshinSaveState(containerClient, userId);
  if (!etag || !checkIsGenshinSessionCurrent(envelope, sessionId)) throw getGenshinSessionReplacedError();

  const written = await getResultAsync(() =>
    writeJsonBlob(containerClient, getSaveBlobName(userId), JSON.stringify({ save, sessionId }), { ifMatch: etag }),
  ).match(
    (result) => result,
    (error) => {
      if (checkIsPreconditionFailed(error)) throw getGenshinSessionReplacedError();
      throw error;
    },
  );
  return { etag: written.etag, serverNow: Temporal.Now.instant().toString() };
};
