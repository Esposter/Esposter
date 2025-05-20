import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { extractBlobUrls } from "#shared/services/surveyer/extractBlobUrls";
import { Mimetype } from "@/models/file/Mimetype";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { ContainerSASPermissions } from "@azure/storage-blob";
import dayjs from "dayjs";
import { extname } from "node:path";

export const useUpdateBlobUrls = async (model: string) => {
  const blobUrls = extractBlobUrls(model);
  const containerClient = await useContainerClient(AzureContainer.SurveyerAssets);
  const blobNames = blobUrls.map((blobUrl) => blobUrl.substring(`${containerClient.url}/`.length));
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

  let updatedModel = model;
  for (let i = 0; i < blobUrls.length; i++) {
    const blobUrl = blobUrls[i];
    const updatedBlobUrl = updatedBlobUrls[i];
    updatedModel = updatedModel.replaceAll(blobUrl, updatedBlobUrl);
  }
  return updatedModel;
};
