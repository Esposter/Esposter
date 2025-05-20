import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const extractBlobUrls = (model: string): string[] => {
  const blobUrlToMatch = `${process.env.AZURE_BLOB_URL}/${AzureContainer.SurveyerAssets}`;
  return [
    ...new Set(Array.from(model.matchAll(new RegExp(`${blobUrlToMatch}[^\\]*`, "g"))).map(([blobUrl]) => blobUrl)),
  ];
};
