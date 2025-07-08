import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { getBlobUrl } from "#shared/util/azure/getBlobUrl";
import { escapeRegExp } from "#shared/util/regex/escapeRegExp";

export const getBlobUrlSearchRegex = (blobUrl?: string) =>
  new RegExp(
    // Match until we reach a character that ends with "
    `${blobUrl ? escapeRegExp(blobUrl) : `${getBlobUrl()}/${AzureContainer.SurveyerAssets}`}[^"]*`,
    "g",
  );
