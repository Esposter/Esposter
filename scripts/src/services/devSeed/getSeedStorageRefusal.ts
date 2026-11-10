import { SeedRefusal } from "#src/models/devSeed/SeedRefusal";
import { DEVELOPMENT_STORAGE_CONNECTION_STRING } from "#src/services/devSeed/constants";
import { readStorageTableEndpoint } from "#src/services/devSeed/readStorageTableEndpoint";
import { LOCAL_HOSTNAMES } from "@esposter/shared";

// The default development emulator is the owner's, and an endpoint off this machine is not a run's emulator, so either
// Stops the seed before its first write. A connection string that names no table endpoint is refused on the same ground
export const getSeedStorageRefusal = (storageConnectionString: string): SeedRefusal | undefined => {
  if (storageConnectionString === DEVELOPMENT_STORAGE_CONNECTION_STRING) return SeedRefusal.DevelopmentStorage;
  const tableEndpoint = readStorageTableEndpoint(storageConnectionString);
  const isLocal =
    tableEndpoint !== undefined &&
    URL.canParse(tableEndpoint) &&
    LOCAL_HOSTNAMES.includes(new URL(tableEndpoint).hostname);
  return isLocal ? undefined : SeedRefusal.NonLocalStorage;
};
