import type { GenshinSave } from "genshin-world/save";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { genshinEventEmitter } from "#server/services/genshin/events/genshinEventEmitter";
import { readGenshinSaveState } from "#server/services/genshin/readGenshinSaveState";
import { startGenshinSession } from "#server/services/genshin/startGenshinSession";
import { writeGenshinSaveEnvelope } from "#server/services/genshin/writeGenshinSaveEnvelope";
import { AzureContainer } from "@esposter/db-schema";

export interface StartGenshinResult {
  etag?: string;
  // Whether the account had no save before, so a guest save the browser holds is the one to upload
  isNew: boolean;
  save: GenshinSave;
  serverNow: string;
  sessionId: string;
}

// Takes the lease for this user's game: a new session id replaces the one the save held, and the save it returns is
// The one the player resumes, which the write below stores under the new id. The session it replaced is told so at once
export const startGenshin = async (userId: string): Promise<StartGenshinResult> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const { envelope, etag } = await readGenshinSaveState(containerClient, userId);
  const startedEnvelope = startGenshinSession(envelope, crypto.randomUUID());
  const written = await writeGenshinSaveEnvelope(
    containerClient,
    userId,
    startedEnvelope,
    etag ? { ifMatch: etag } : { ifNoneMatch: "*" },
  );
  if (envelope) genshinEventEmitter.emit("replaceSession", [[userId, startedEnvelope.sessionId]]);
  return {
    etag: written.etag,
    isNew: envelope === undefined,
    save: startedEnvelope.save,
    serverNow: Temporal.Now.instant().toString(),
    sessionId: startedEnvelope.sessionId,
  };
};
