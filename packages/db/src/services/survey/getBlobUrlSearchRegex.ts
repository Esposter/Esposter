import { AzureContainer, } from "@/models/azure/container/AzureContainer";
import { getBlobUrl } from "@/services/azure/container/getBlobUrl";
import { escapeRegExp } from "@esposter/shared";

export const getBlobUrlSearchRegex = (blobUrl?: string) =>
  new RegExp(
    // Match until we reach a character that ends with "
    `${blobUrl ? escapeRegExp(blobUrl) : `${getBlobUrl()}/${AzureContainer.SurveyAssets}`}[^"]*`,
    "g",
  );
