import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const SURVEY_NAME_MAX_LENGTH = 100;

export const BLOB_URL_SEARCH_REGEX = new RegExp(
  `${process.env.AZURE_BLOB_URL}/${AzureContainer.SurveyerAssets}[^\\]*`,
  "g",
);
