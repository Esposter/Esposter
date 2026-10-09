import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { ContainerClient } from "@azure/storage-blob";

import { genshinSaveEnvelopeSchema } from "#server/models/genshin/GenshinSaveEnvelope";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { readBlobState } from "#server/services/blobState/readBlobState";
import { getResult } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// The blob's envelope and its ETag, the ETag the write that follows is conditioned on
export interface GenshinSaveState {
  envelope?: GenshinSaveEnvelope;
  etag?: string;
}

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
        throw new TRPCError({
          cause: error,
          code: "INTERNAL_SERVER_ERROR",
          message: "The saved game could not be read",
        });
      },
    );

export const readGenshinSaveState = async (
  containerClient: ContainerClient,
  userId: string,
): Promise<GenshinSaveState> => {
  const { etag, json } = await readBlobState(containerClient, getSaveBlobName(userId));
  return { envelope: json ? parseEnvelope(json) : undefined, etag };
};
