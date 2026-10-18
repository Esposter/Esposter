import type { AccountCharacterPackRecord } from "#server/models/genshin/AccountCharacterPackRecord";
import type { KeepCharacterPackInput } from "#server/models/genshin/KeepCharacterPackInput";
import type { Context } from "#server/trpc/context";
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
import { getBlobProperties } from "#server/services/genshin/accountCharacterPack/getBlobProperties";
import { readAccountCharacterPackManifest } from "#server/services/genshin/accountCharacterPack/readAccountCharacterPackManifest";
import { emitStorageUsage } from "#server/services/storage/emitStorageUsage";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { checkIsAlreadyStored, deleteStorageBlobs } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, noop, Operation, withFinalizerAsync } from "@esposter/shared";
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

// The staged uploads are deleted through deleteStorageBlobs, which gives back the hold each one took at its grant. Only the
// Uploads this keep's own grants named are released, so another keep of the same bytes keeps its upload and its hold. Best-effort,
// As deleteStagingContentBlob is: the keep has already landed or been refused, and a failure here only leaves a meter stale
const releaseStagingBlobs = (db: Context["db"], containerClient: ContainerClient, stagingBlobNames: string[]) =>
  getResultAsync(() =>
    deleteStorageBlobs(db, containerClient, AzureContainer.GenshinAssets, stagingBlobNames, async (userIds) => {
      await Promise.all(userIds.map((userId) => emitStorageUsage(db, userId)));
    }),
  ).match(noop, console.error);

// Keeps a pack for the account: each of its files must already be uploaded under the staging id its own grant minted, and is read and hashed here before it is stored, so a file is only ever referenced by a caller holding its bytes. The account's list names the pack only once every file is stored. The staged uploads are released whether the keep lands or is refused
export const keepAccountCharacterPack = async (
  db: Context["db"],
  userId: string,
  { characterId, files, modelName, packHash }: KeepCharacterPackInput,
): Promise<void> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const uniqueFiles = [...new Map(files.map((file) => [file.sha256, file])).values()];
  const stagingBlobNames = files.map(({ stagingId }) => getAccountCharacterPackStagingBlobName(userId, stagingId));
  return withFinalizerAsync(
    async () => {
      const { etag, packs } = await readAccountCharacterPackManifest(containerClient, userId);
      const pack = {
        characterId,
        files: files.map(({ path, sha256, size }) => ({ path, sha256, size })),
        modelName,
        packHash,
      };
      const nextPacks = [...packs.filter((otherPack) => otherPack.characterId !== characterId), pack];
      if (getTotalSize([pack]) > MAX_CHARACTER_PACK_SIZE)
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

      await Promise.all(
        uniqueFiles.map(async ({ sha256, size, stagingId }) => {
          const stagingBlobName = getAccountCharacterPackStagingBlobName(userId, stagingId);
          // The length is checked before the bytes are read, so a staged blob larger than it was granted for is never downloaded.
          // The download is conditioned on the etag that check read, so a blob replaced since then is refused rather than read
          const stagedProperties = await getBlobProperties(containerClient, stagingBlobName);
          const bytes =
            stagedProperties?.contentLength === size
              ? await downloadBlobBytes(containerClient, stagingBlobName, { ifMatch: stagedProperties.etag })
              : undefined;
          if (bytes === undefined || createHash("sha256").update(bytes).digest("hex") !== sha256)
            throw getInvalidOperationError(
              Operation.Create,
              String(characterId),
              `holds a file not uploaded as ${sha256}`,
            );
          await storeFileIfAbsent(containerClient, sha256, bytes);
        }),
      );
      await writeBlobState(containerClient, getAccountCharacterPacksBlobName(userId), JSON.stringify(nextPacks), etag);
    },
    () => releaseStagingBlobs(db, containerClient, stagingBlobNames),
  );
};
