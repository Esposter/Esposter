import { SeedRefusal } from "#src/models/devSeed/SeedRefusal";
import { DEFAULT_EMULATOR_TABLE_PORT, DEVELOPMENT_STORAGE_CONNECTION_STRING } from "#src/services/devSeed/constants";
import { readStorageTableEndpoint } from "#src/services/devSeed/readStorageTableEndpoint";
import { checkIsLocalUrl } from "@esposter/shared";

// The default development emulator is the owner's, and an endpoint off this machine is not a run's emulator, so either
// Stops the seed before its first write. The default is named by the SDK's own flag wherever it appears in the string,
// Or by the table port it answers on, so both are checked before an endpoint is judged local. A connection string that
// Names no table endpoint is refused on the same ground
export const getSeedStorageRefusal = (storageConnectionString: string): SeedRefusal | undefined => {
  if (storageConnectionString.toLowerCase().includes(DEVELOPMENT_STORAGE_CONNECTION_STRING.toLowerCase()))
    return SeedRefusal.DevelopmentStorage;
  const tableEndpoint = readStorageTableEndpoint(storageConnectionString);
  if (tableEndpoint === undefined) return SeedRefusal.NonLocalStorage;
  if (URL.canParse(tableEndpoint) && new URL(tableEndpoint).port === DEFAULT_EMULATOR_TABLE_PORT)
    return SeedRefusal.DevelopmentStorage;
  return checkIsLocalUrl(tableEndpoint) ? undefined : SeedRefusal.NonLocalStorage;
};
