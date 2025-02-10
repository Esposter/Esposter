import type { Types } from "phaser";

import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { trimFileExtension } from "@/util/trimFileExtension";
import { CONTENT_TYPE_PHASER_METHOD_MAP } from "@@/scripts/phaser/constants";
import { outputFile } from "@@/scripts/phaser/util/outputFile";
import { generateEnumString } from "@@/scripts/util/generateEnumString";
import { AZURE_MAX_PAGE_SIZE } from "@@/server/services/azure/table/constants";
import { BlobServiceClient } from "@azure/storage-blob";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { config } from "dotenv";

export const generateFilePack = async () => {
  config();
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(AzureContainer.DungeonsAssets);
  const filePack: Types.Loader.FileTypes.PackFileSection = { baseURL: process.env.AZURE_BLOB_URL, files: [] };
  const fileKeys = new Set<string>();
  const enumName = "FileKey";

  for await (const response of containerClient.listBlobsFlat().byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const blob of response.segment.blobItems) {
      if (!blob.properties.contentType)
        throw new InvalidOperationError(Operation.Read, "Content Type", `Missing Content Type: ${blob.name}`);

      const addFileKey = (type: string) => {
        const key = trimFileExtension(blob.name).replaceAll("/", "");
        if (fileKeys.has(key)) throw new InvalidOperationError(Operation.Push, enumName, `Duplicate key: ${key}`);

        fileKeys.add(key);
        filePack.files.push({
          key,
          type,
          url: blob.name,
        });
      };

      for (const [contentType, phaserMethod] of Object.entries(CONTENT_TYPE_PHASER_METHOD_MAP))
        if (blob.properties.contentType.includes(contentType)) addFileKey(phaserMethod);
    }

  const filename = "filepack.json";
  await outputFile(`${enumName}.ts`, generateEnumString(enumName, [...fileKeys]));
  await outputFile(filename, JSON.stringify(filePack));
  await outputFile(".gitignore", filename);
};
