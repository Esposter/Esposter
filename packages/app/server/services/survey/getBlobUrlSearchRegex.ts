import { AZURE_CONTAINER_BASE_URL } from "#shared/services/azure/container/constants";
import { AzureContainer } from "@esposter/db-schema";
import { escapeRegExp } from "@esposter/shared";

export const getBlobUrlSearchRegex = (blobUrl?: string) =>
  new RegExp(
    // Match until we reach a character that ends with "
    `${blobUrl ? escapeRegExp(blobUrl) : `${AZURE_CONTAINER_BASE_URL}/${AzureContainer.SurveyAssets}`}[^"]*`,
    "g",
  );
