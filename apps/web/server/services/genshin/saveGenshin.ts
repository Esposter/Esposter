import type { SaveGenshinInput } from "#server/models/genshin/SaveGenshinInput";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { checkIsGenshinSessionCurrent } from "#server/services/genshin/checkIsGenshinSessionCurrent";
import { getGenshinSessionReplacedError } from "#server/services/genshin/getGenshinSessionReplacedError";
import { readGenshinSaveState } from "#server/services/genshin/readGenshinSaveState";
import { writeGenshinSaveEnvelope } from "#server/services/genshin/writeGenshinSaveEnvelope";
import { AzureContainer } from "@esposter/db-schema";

export interface SaveGenshinResult {
  etag?: string;
  serverNow: string;
}

// A write from a session that is no longer current is refused, never merged. The ETag is the safety net: a blob that
// Changed under the read is the same loss of the lease, so the write's CONFLICT is answered as a replacement too
export const saveGenshin = async (
  userId: string,
  { save, sessionId }: SaveGenshinInput,
): Promise<SaveGenshinResult> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const { envelope, etag } = await readGenshinSaveState(containerClient, userId);
  if (!etag || !checkIsGenshinSessionCurrent(envelope, sessionId)) throw getGenshinSessionReplacedError();

  const writtenEtag = await writeGenshinSaveEnvelope(containerClient, userId, { save, sessionId }, etag);
  return { etag: writtenEtag, serverNow: Temporal.Now.instant().toString() };
};
