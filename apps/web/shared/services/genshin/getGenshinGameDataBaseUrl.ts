import { AzureContainer } from "@esposter/db-schema";

// Where the hosted game data sits under a storage account's container base URL, which the world reads its tables and
// Words from and the development server reads a character's names from
export const getGenshinGameDataBaseUrl = (containerBaseUrl: string): string =>
  `${containerBaseUrl}/${AzureContainer.PublicGenshinAssets}`;
