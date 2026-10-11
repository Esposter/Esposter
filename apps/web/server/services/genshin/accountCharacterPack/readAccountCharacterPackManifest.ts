import type { AccountCharacterPackRecord } from "#server/models/genshin/AccountCharacterPackRecord";
import type { ContainerClient } from "@azure/storage-blob";

import { accountCharacterPackRecordSchema } from "#server/models/genshin/AccountCharacterPackRecord";
import { readBlobState } from "#server/services/blobState/readBlobState";
import { getAccountCharacterPacksBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPacksBlobName";
import { jsonDateParse } from "@esposter/shared";
import { z } from "zod";

// The account's list of its packs under the ETag it was read under, which the next write of the list is conditioned on.
// A list that no longer parses is an error, not an empty account, so a write never replaces it with nothing
export const readAccountCharacterPackManifest = async (
  containerClient: ContainerClient,
  userId: string,
): Promise<{ etag?: string; packs: AccountCharacterPackRecord[] }> => {
  const { etag, json } = await readBlobState(containerClient, getAccountCharacterPacksBlobName(userId));
  if (!json) return { etag, packs: [] };
  return { etag, packs: z.array(accountCharacterPackRecordSchema).parse(jsonDateParse(json.toString())) };
};
