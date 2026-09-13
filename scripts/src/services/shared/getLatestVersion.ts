import type { PackumentVersion } from "#src/models/shared/PackumentVersion";

import { fetchRegistry } from "#src/services/shared/fetchRegistry";
import { getResultAsync } from "@esposter/shared";

// One retry, because the registry answers a cold request with a 5xx often enough to fail a release run that
// Would have succeeded a second later.
export const getLatestVersion = (pkg: string): Promise<string> => {
  const readLatest = () => getResultAsync(() => fetchRegistry<PackumentVersion>(pkg, "/latest"));
  return readLatest()
    .orElse(readLatest)
    .match(
      ({ version }) => version,
      (error) => {
        throw error;
      },
    );
};
