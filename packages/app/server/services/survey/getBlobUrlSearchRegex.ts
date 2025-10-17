import { getAzureContainerBaseUrl } from "#shared/services/azure/container/getAzureContainerBaseUrl";
import { AzureContainer } from "@esposter/db-schema";
import { escapeRegExp } from "@esposter/shared";

export const getBlobUrlSearchRegex = (blobUrl?: string) =>
  new RegExp(
    // Match until we reach a character that ends with "
    `${blobUrl ? escapeRegExp(blobUrl) : `${getAzureContainerBaseUrl()}/${AzureContainer.SurveyAssets}`}[^"]*`,
    "g",
  );
