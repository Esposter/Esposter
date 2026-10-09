import { AzureContainer } from "@esposter/db-schema";
import { GAME_DATA_BLOB_PATH } from "genshin-world/characterPack";

// Where the hosted game data sits under a storage account's container base URL, which the world reads its tables and
// Words from and the development server reads a character's names from
export const getGenshinGameDataBaseUrl = (containerBaseUrl: string): string =>
  `${containerBaseUrl}/${AzureContainer.AppAssets}/${GAME_DATA_BLOB_PATH}`;
