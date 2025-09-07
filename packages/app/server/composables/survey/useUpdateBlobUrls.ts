import type { Survey } from "#shared/db/schema/surveys";

import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { extractBlobUrls } from "#shared/services/survey/extractBlobUrls";
import { getBlobUrlSearchRegex } from "#shared/services/survey/getBlobUrlSearchRegex";
import { Mimetype } from "@/models/file/Mimetype";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { getPublishDirectory } from "@@/server/services/survey/getPublishDirectory";
import { ContainerSASPermissions } from "@azure/storage-blob";
import dayjs from "dayjs";
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
    updatedModel = updatedModel.replaceAll(getBlobUrlSearchRegex(blobUrl), updatedBlobUrl);
  }
  return updatedModel;
};
