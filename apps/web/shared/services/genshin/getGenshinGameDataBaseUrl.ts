import { AzureContainer } from "@esposter/db-schema";

// Where the hosted game data sits under a storage account's container base URL, which the world reads its tables, its
// Words and its characters' names from
export const getGenshinGameDataBaseUrl = (containerBaseUrl: string): string =>
  `${containerBaseUrl}/${AzureContainer.PublicGenshinAssets}`;
