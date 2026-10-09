import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { ContainerClient } from "@azure/storage-blob";

import { genshinSaveEnvelopeSchema } from "#server/models/genshin/GenshinSaveEnvelope";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { checkIsNotFound, readJsonBlob } from "@esposter/db";
import { getResult, getResultAsync } from "@esposter/shared";

// The blob's envelope and its ETag. The ETag is read first, so a write that lands between the two reads makes the
// Next save a conflict, which the session treats as its lease being lost rather than merging anything
export interface GenshinSaveState {
  envelope: GenshinSaveEnvelope | undefined;
  etag: string | undefined;
}

// A save that no longer parses reads as none, so the game starts a new player's save over it, the reset the
// Latest-shape-only standard calls for
const parseEnvelope = (json: Buffer | undefined): GenshinSaveEnvelope | undefined => {
  if (!json) return undefined;
  // Parsed as plain JSON, because the save holds its instants as ISO strings a date revival would turn into Dates
  // eslint-disable-next-line no-restricted-properties -- the save keeps its instants as ISO strings, which a date revival would turn into Dates
  const parsedJson = getResult(() => JSON.parse(json.toString()))
    .orTee(console.error)
    .unwrapOr(undefined);
  const result = genshinSaveEnvelopeSchema.safeParse(parsedJson);
  return result.success ? result.data : undefined;
};

export const readGenshinSaveState = async (
  containerClient: ContainerClient,
  userId: string,
): Promise<GenshinSaveState> => {
  const blobName = getSaveBlobName(userId);
  const etag = await getResultAsync(() => containerClient.getBlockBlobClient(blobName).getProperties()).match(
    (properties) => properties.etag,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
  const json = await readJsonBlob(containerClient, blobName);
  return { envelope: parseEnvelope(json), etag };
};
