import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { GenshinSave } from "genshin-world/save";

import { readGenshinSaveState } from "#server/services/genshin/readGenshinSaveState";
import { startGenshinSession } from "#server/services/genshin/startGenshinSession";
import { writeGenshinSaveEnvelope } from "#server/services/genshin/writeGenshinSaveEnvelope";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { getBucket } from "#server/services/storage/getBucket";
import { StorageBucket } from "@esposter/db-schema";

export interface StartGenshinResult {
  etag?: string;
  // Whether no save existed before, so a guest save the browser holds is the one to upload
  isNew: boolean;
  // The session the save held before this start, which the start replaced
  previousSessionId?: string;
  save: GenshinSave;
  serverNow: string;
  sessionId: string;
}

const toStartResult = (envelope: GenshinSaveEnvelope, etag?: string): StartGenshinResult => ({
  etag,
  isNew: envelope.previousSessionId === undefined,
  previousSessionId: envelope.previousSessionId,
  save: envelope.save,
  serverNow: Temporal.Now.instant().toString(),
  sessionId: envelope.sessionId,
});

// Takes the lease for this user's game: the page's session id replaces the one the save held, and the save it returns is
// The one the player resumes, which the write below stores under that id. The session it replaced is told so at once.
// A concurrent start that wrote first makes this write a CONFLICT. A start the page retries after its write landed finds
// The blob already under the page's session, and answers what that write answered, without writing again
export const startGenshin = async (userId: string, sessionId: string): Promise<StartGenshinResult> => {
  const bucket = getBucket(StorageBucket.GenshinAssets);
  const { envelope, etag } = await readGenshinSaveState(bucket, userId);
  if (envelope?.sessionId === sessionId) return toStartResult(envelope, etag);

  const startedEnvelope = startGenshinSession(envelope, sessionId);
  const writtenEtag = await writeGenshinSaveEnvelope(bucket, userId, startedEnvelope, etag);
  if (envelope) await callUserObjects([userId], (userObject) => userObject.replaceSession(sessionId));
  return toStartResult(startedEnvelope, writtenEtag);
};
