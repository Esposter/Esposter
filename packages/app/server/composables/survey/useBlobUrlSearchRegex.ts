import { useContainerBaseUrl } from "@@/server/composables/azure/container/useContainerBaseUrl";
import { AzureContainer } from "@esposter/db-schema";
import { escapeRegExp } from "@esposter/shared";

export const useBlobUrlSearchRegex = (blobUrl?: string) => {
  const containerBaseUrl = useContainerBaseUrl();
  return new RegExp(
    // Match until we reach a character that ends with "
    `${blobUrl ? escapeRegExp(blobUrl) : `${containerBaseUrl}/${AzureContainer.SurveyAssets}`}[^"]*`,
    "g",
  );
};
