import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const extractBlobUrls = (model: string): string[] => {
  const blobUrlPrefix = `${process.env.AZURE_BLOB_URL}/${AzureContainer.SurveyerAssets}`;
  return [
    ...new Set(Array.from(model.matchAll(new RegExp(`${blobUrlPrefix}[^\\]*`, "g"))).map(([blobUrl]) => blobUrl)),
  ];
};
