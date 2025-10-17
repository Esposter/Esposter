import { AzureContainer } from "@esposter/db-schema";
import { escapeRegExp } from "@esposter/shared";

export const useBlobUrlSearchRegex = (blobUrl?: string) => {
  const runtimeConfig = useRuntimeConfig();
  return new RegExp(
    // Match until we reach a character that ends with "
    `${blobUrl ? escapeRegExp(blobUrl) : `${runtimeConfig.public.azure.container.baseUrl}/${AzureContainer.SurveyAssets}`}[^"]*`,
    "g",
  );
};
