import type { Survey } from "@esposter/db-schema";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useBlobUrlSearchRegex } from "@@/server/composables/survey/useBlobUrlSearchRegex";
import { extractBlobUrls } from "@@/server/services/survey/extractBlobUrls";
import { getPublishDirectory } from "@@/server/services/survey/getPublishDirectory";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { AzureContainer } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import dayjs from "dayjs";
import { lookup } from "mime-types";
import { extname } from "node:path";

export const useUpdateBlobUrls = async (survey: Survey, isPublish?: true) => {
  const blobUrls = extractBlobUrls(survey.model);
  if (blobUrls.length === 0) return survey.model;

  const containerClient = await useContainerClient(AzureContainer.SurveyAssets);
  const blobNames: string[] = [];

  if (isPublish) {
    const publishDirectory = getPublishDirectory(survey);

    for (const blobUrl of blobUrls) {
      const blobName = `${publishDirectory}/${blobUrl.slice(`${containerClient.url}/${survey.id}/`.length)}`;
      blobNames.push(blobName);
    }
  } else
    for (const blobUrl of blobUrls) {
      const blobName = blobUrl.slice(`${containerClient.url}/`.length);
      blobNames.push(blobName);
    }

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
  let updatedModel = survey.model;

  for (let i = 0; i < blobUrls.length; i++) {
    const blobUrl = takeOne(blobUrls, i);
    const updatedBlobUrl = takeOne(updatedBlobUrls, i);
    updatedModel = updatedModel.replaceAll(useBlobUrlSearchRegex(blobUrl), updatedBlobUrl);
  }

  return updatedModel;
};
