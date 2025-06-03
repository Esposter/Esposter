import type { Types } from "phaser";

import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { trimFileExtension } from "@/util/trimFileExtension";
import { ContentTypePhaserMethodMap } from "@@/scripts/phaser/constants";
import { outputFile } from "@@/scripts/phaser/util/outputFile";
import { createEnumString } from "@@/scripts/util/createEnumString";
import { AZURE_MAX_PAGE_SIZE } from "@@/server/services/azure/table/constants";
import { BlobServiceClient } from "@azure/storage-blob";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { config } from "dotenv";
import { format, resolveConfig } from "prettier";

export const createFilePack = async () => {
  config();
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(AzureContainer.DungeonsAssets);
  const filePack: Types.Loader.FileTypes.PackFileSection = { baseURL: process.env.AZURE_BLOB_URL, files: [] };
  const fileKeys = new Set<string>();
  const enumName = "FileKey";

  for await (const { segment } of containerClient.listBlobsFlat().byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const blob of segment.blobItems) {
      if (!blob.properties.contentType)
        throw new InvalidOperationError(Operation.Read, "Content Type", `Missing Content Type: ${blob.name}`);

      for (const [contentType, phaserMethod] of Object.entries(ContentTypePhaserMethodMap))
        if (blob.properties.contentType.includes(contentType)) {
          const key = trimFileExtension(blob.name).replaceAll("/", "");
          if (fileKeys.has(key)) throw new InvalidOperationError(Operation.Push, enumName, `Duplicate key: ${key}`);

          fileKeys.add(key);
          files.push({ key, type: phaserMethod, url: blob.name });
        }
    }

  await Promise.all([
    outputFile(`${enumName}.ts`, createEnumString(enumName, [...fileKeys])),
    (async () => {
      const options = await resolveConfig(process.cwd());
      if (!options)
        throw new InvalidOperationError(Operation.Read, "Prettier Configuration", "Missing Prettier Configuration");

      const formatted = await format(JSON.stringify(filePack), { ...options, parser: "json" });
      await outputFile("filepack.json", formatted);
    })(),
  ]);
};
