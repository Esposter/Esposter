import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { escapeRegExp } from "@/util/regex/escapeRegExp";

export const getBlobUrlSearchRegex = (blobUrl?: string) =>
  new RegExp(
    // We want {protocol}{hostname}{pathname without query params} and
    // match until we reach a character that ends with "
    `${blobUrl ? escapeRegExp(blobUrl) : `${process.env.AZURE_BLOB_URL}/${AzureContainer.SurveyerAssets}`}[^"]*`,
    "g",
  );
