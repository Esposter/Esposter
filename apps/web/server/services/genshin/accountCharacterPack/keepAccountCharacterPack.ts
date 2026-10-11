import type { AccountCharacterPackRecord } from "#server/models/genshin/AccountCharacterPackRecord";
import type { KeepCharacterPackInput } from "#server/models/genshin/KeepCharacterPackInput";
import type { ContainerClient } from "@azure/storage-blob";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { writeBlobState } from "#server/services/blobState/writeBlobState";
import {
  MAX_ACCOUNT_CHARACTER_PACKS_SIZE,
  MAX_CHARACTER_PACK_SIZE,
} from "#server/services/genshin/accountCharacterPack/constants";
import { downloadBlobBytes } from "#server/services/genshin/accountCharacterPack/downloadBlobBytes";
import { getAccountCharacterPackFileBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPackFileBlobName";
import { getAccountCharacterPacksBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPacksBlobName";
import { getAccountCharacterPackStagingBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPackStagingBlobName";
import { readAccountCharacterPackManifest } from "#server/services/genshin/accountCharacterPack/readAccountCharacterPackManifest";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { checkIsAlreadyStored } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, noop, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";

const getTotalSize = (packs: readonly AccountCharacterPackRecord[]): number =>
  packs.reduce((total, { files }) => total + files.reduce((packTotal, { size }) => packTotal + size, 0), 0);

// The file stored under its hash, created only where nothing is stored yet: a file another pack keeps is the same bytes
const storeFileIfAbsent = (containerClient: ContainerClient, sha256: string, bytes: Buffer) =>
  getResultAsync(() =>
    containerClient
      .getBlockBlobClient(getAccountCharacterPackFileBlobName(sha256))
      .upload(bytes, bytes.length, {
        blobHTTPHeaders: { blobContentType: "application/octet-stream" },
        conditions: { ifNoneMatch: "*" },
      }),
  ).match(noop, (error) => {
    if (!checkIsAlreadyStored(error)) throw error;
  });

// Keeps a pack for the account: each of its files must already be uploaded under its own hash, and is read and hashed here before it is stored, so a file is only ever referenced by a caller holding its bytes. The account's list names the pack only once every file is stored, and the uploads are deleted once the pack is kept
export const keepAccountCharacterPack = async (
  userId: string,
  { characterId, files, modelName, packHash }: KeepCharacterPackInput,
): Promise<void> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const { etag, packs } = await readAccountCharacterPackManifest(containerClient, userId);
  const nextPacks = [
    ...packs.filter((pack) => pack.characterId !== characterId),
    { characterId, files, modelName, packHash },
  ];
  if (getTotalSize([{ characterId, files, modelName, packHash }]) > MAX_CHARACTER_PACK_SIZE)
    throw getInvalidOperationError(
      Operation.Create,
      String(characterId),
      `is larger than ${MAX_CHARACTER_PACK_SIZE} bytes`,
    );
  if (getTotalSize(nextPacks) > MAX_ACCOUNT_CHARACTER_PACKS_SIZE)
    throw getInvalidOperationError(
      Operation.Create,
      String(characterId),
      "would take the account over its storage limit",
    );

  const uniqueFiles = [...new Map(files.map((file) => [file.sha256, file])).values()];
  await Promise.all(
    uniqueFiles.map(async ({ sha256, size }) => {
      const stagingBlobName = getAccountCharacterPackStagingBlobName(userId, sha256);
      const bytes = await downloadBlobBytes(containerClient, stagingBlobName);
      if (bytes === undefined || bytes.length !== size || createHash("sha256").update(bytes).digest("hex") !== sha256)
        throw getInvalidOperationError(Operation.Create, String(characterId), `holds a file not uploaded as ${sha256}`);
      await storeFileIfAbsent(containerClient, sha256, bytes);
    }),
  );
  await writeBlobState(containerClient, getAccountCharacterPacksBlobName(userId), JSON.stringify(nextPacks), etag);
  await Promise.all(
    uniqueFiles.map(({ sha256 }) =>
      containerClient.getBlockBlobClient(getAccountCharacterPackStagingBlobName(userId, sha256)).deleteIfExists(),
    ),
  );
};
