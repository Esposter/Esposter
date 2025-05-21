import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const getBlobUrlSearchRegex = (blobUrl?: string) =>
  new RegExp(
    // We want {protocol}{hostname}{pathname without query params} and
    // match until we reach a character that ends with "
    `${blobUrl ?? `${process.env.AZURE_BLOB_URL}/${AzureContainer.SurveyerAssets}`}[^"]*`,
    "g",
  );
