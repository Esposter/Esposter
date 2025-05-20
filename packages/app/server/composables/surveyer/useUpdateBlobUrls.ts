import type { Survey } from "#shared/db/schema/surveys";

import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { extractBlobUrls } from "#shared/services/surveyer/extractBlobUrls";
import { Mimetype } from "@/models/file/Mimetype";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { getPublishDirectory } from "@@/server/services/surveyer/getPublishDirectory";
import { ContainerSASPermissions } from "@azure/storage-blob";
import dayjs from "dayjs";
import { extname } from "node:path";

export const useUpdateBlobUrls = async (survey: Survey, isPublish?: true) => {
  const blobUrls = extractBlobUrls(survey.model);
  if (blobUrls.length === 0) return survey.model;

  const containerClient = await useContainerClient(AzureContainer.SurveyerAssets);
  const blobNames: string[] = [];

  if (isPublish) {
    const publishDirectory = getPublishDirectory(survey);

    for (const blobUrl of blobUrls) {
      const blobName = `${publishDirectory}/${decodeURIComponent(blobUrl.substring(`${containerClient.url}/${survey.id}/`.length, blobUrl.indexOf("?")))}`;
      blobNames.push(blobName);
    }
  } else
    for (const blobUrl of blobUrls) {
      const blobName = decodeURIComponent(blobUrl.substring(`${containerClient.url}/`.length, blobUrl.indexOf("?")));
      blobNames.push(blobName);
    }

  const updatedBlobUrls = await Promise.all(
    blobNames.map((blobName) => {
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const extension = extname(blobName).toLowerCase();
      return blockBlobClient.generateSasUrl({
        contentType: Object.keys(Mimetype).includes(extension)
          ? Mimetype[extension as keyof typeof Mimetype]
          : undefined,
        expiresOn: dayjs().add(1, "year").toDate(),
        permissions: ContainerSASPermissions.from({ read: true }),
      });
    }),
  );
  let updatedModel = survey.model;
  for (let i = 0; i < blobUrls.length; i++) {
    const blobUrl = blobUrls[i];
    const updatedBlobUrl = updatedBlobUrls[i];
    updatedModel = updatedModel.replaceAll(blobUrl, updatedBlobUrl);
  }
  return updatedModel;
};
