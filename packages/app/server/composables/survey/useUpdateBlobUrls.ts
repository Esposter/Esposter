import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useBlobUrlSearchRegex } from "@@/server/composables/survey/useBlobUrlSearchRegex";
import { extractBlobUrls } from "@@/server/services/survey/extractBlobUrls";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { AzureContainer } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import dayjs from "dayjs";
import { lookup } from "mime-types";
import { extname } from "node:path";

export const useUpdateBlobUrls = async (model: SurveyResource["model"], publishedDirectoryName?: string) => {
  const blobUrls = extractBlobUrls(model);
  if (blobUrls.length === 0) return model;

  const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
  const blobNames = blobUrls.map((blobUrl) => {
    const blobName = blobUrl.slice(`${containerClient.url}/`.length);
    // Published snapshots serve the assets cloned under the publish directory, not the mutable working copies
    return publishedDirectoryName ? `${publishedDirectoryName}/${blobName.slice(blobName.indexOf("/") + 1)}` : blobName;
  });
  const updatedBlobUrls = await Promise.all(
    blobNames.map((blobName) => {
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const extension = extname(blobName).toLowerCase();
      return blockBlobClient.generateSasUrl({
        contentType: lookup(extension) || undefined,
        expiresOn: dayjs().add(1, "year").toDate(),
        permissions: ContainerSASPermissions.from({ read: true }),
      });
    }),
  );
  let updatedModel = model;

  for (const [i, blobUrl] of blobUrls.entries()) {
    const updatedBlobUrl = takeOne(updatedBlobUrls, i);
    updatedModel = updatedModel.replaceAll(useBlobUrlSearchRegex(blobUrl), updatedBlobUrl);
  }

  return updatedModel;
};
