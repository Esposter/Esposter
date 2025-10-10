import { escapeRegExp } from "#shared/util/regex/escapeRegExp";
import { AzureContainer, getBlobUrl } from "@esposter/db";

export const getBlobUrlSearchRegex = (blobUrl?: string) =>
  new RegExp(
    // Match until we reach a character that ends with "
    `${blobUrl ? escapeRegExp(blobUrl) : `${getBlobUrl()}/${AzureContainer.SurveyAssets}`}[^"]*`,
    "g",
  );
