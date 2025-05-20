import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const SURVEY_NAME_MAX_LENGTH = 100;

export const BLOB_URL_SEARCH_REGEX = new RegExp(
  // We want {protocol}{hostname}{pathname without query params} and
  // match until we reach a character that ends with " or ? or \ (from JSON escaping)
  `${process.env.AZURE_BLOB_URL}/${AzureContainer.SurveyerAssets}[^"|\\?|\\\\]*`,
  "g",
);
