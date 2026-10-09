import type { GenshinSave } from "genshin-world/save";

import { startGenshinSession } from "#server/services/genshin/startGenshinSession";
import { readGenshinSaveState } from "#server/services/genshin/readGenshinSaveState";
import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { AzureContainer } from "@esposter/db-schema";
import { writeJsonBlob } from "@esposter/db";

export interface StartGenshinResult {
  etag: string | undefined;
  save: GenshinSave;
  serverNow: string;
  sessionId: string;
}

// Takes the lease for this user's game: a new session id replaces the one the save held, and the save it returns is
// The one the player resumes, which the write below stores under the new id
export const startGenshin = async (userId: string): Promise<StartGenshinResult> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const { envelope, etag } = await readGenshinSaveState(containerClient, userId);
  const startedEnvelope = startGenshinSession(envelope, crypto.randomUUID());
  const written = await writeJsonBlob(
    containerClient,
    getSaveBlobName(userId),
    JSON.stringify(startedEnvelope),
    etag ? { ifMatch: etag } : { ifNoneMatch: "*" },
  );
  return {
    etag: written.etag,
    save: startedEnvelope.save,
    serverNow: Temporal.Now.instant().toString(),
    sessionId: startedEnvelope.sessionId,
  };
};
