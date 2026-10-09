import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { ContainerClient } from "@azure/storage-blob";

import { genshinSaveEnvelopeSchema } from "#server/models/genshin/GenshinSaveEnvelope";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { readBlobState } from "#server/services/blobState/readBlobState";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The blob's envelope and its ETag, the ETag the write that follows is conditioned on
export interface GenshinSaveState {
  envelope?: GenshinSaveEnvelope;
  etag?: string;
}

// A save that no longer parses is never read as none, since a start would then write a new player's save over the
// Player's progress. A save the server holds is backfilled to the latest shape instead, so one that does not parse is
// Refused until it is
const parseEnvelope = (blobName: string, json: Buffer | undefined): GenshinSaveEnvelope | undefined => {
  if (!json) return undefined;
  const parsedJson = getResult(() =>
    // oxlint-disable-next-line no-restricted-properties -- the save holds its instants as ISO strings a date revival would turn into Dates
    JSON.parse(json.toString()),
  ).unwrapOr(undefined);
  const result = genshinSaveEnvelopeSchema.safeParse(parsedJson);
  if (!result.success) throw new InvalidOperationError(Operation.Read, blobName, z.prettifyError(result.error));
  return result.data;
};

export const readGenshinSaveState = async (
  containerClient: ContainerClient,
  userId: string,
): Promise<GenshinSaveState> => {
  const blobName = getSaveBlobName(userId);
  const { etag, json } = await readBlobState(containerClient, blobName);
  return { envelope: parseEnvelope(blobName, json), etag };
};
