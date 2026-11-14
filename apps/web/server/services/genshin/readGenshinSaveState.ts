import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { GenshinSaveState } from "#server/models/genshin/GenshinSaveState";
import type { R2Bucket } from "@cloudflare/workers-types";

import { genshinSaveEnvelopeSchema } from "#server/models/genshin/GenshinSaveEnvelope";
import { getUnreadableSaveError } from "#server/services/blobState/getUnreadableSaveError";
import { readBlobState } from "#server/services/blobState/readBlobState";
import { getSaveBlobName } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";

// A blob that no longer parses is never overwritten: the start and the save answer this error and leave the blob as it
// Is, since the save is the player's only copy, and a fresh game written over it would be the loss
const parseEnvelope = (json: Buffer): GenshinSaveEnvelope =>
  // Parsed as plain JSON, because the save holds its instants as ISO strings a date revival would turn into Dates
  // oxlint-disable-next-line no-restricted-properties -- the envelope schema owns date coercion, so free-text ISO strings survive
  getResult(() => JSON.parse(json.toString()))
    .andThen((parsedJson) => getResult(() => genshinSaveEnvelopeSchema.parse(parsedJson)))
    .orTee(console.error)
    .match(
      (envelope) => envelope,
      (error) => {
        throw getUnreadableSaveError(error);
      },
    );

export const readGenshinSaveState = async (bucket: R2Bucket, userId: string): Promise<GenshinSaveState> => {
  const { etag, json } = await readBlobState(bucket, getSaveBlobName(userId));
  return { envelope: json ? parseEnvelope(json) : undefined, etag };
};
