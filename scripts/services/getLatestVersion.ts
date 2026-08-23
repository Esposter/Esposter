import type { PackumentVersion } from "#scripts/services/models/PackumentVersion";

import { fetchRegistry } from "#scripts/services/fetchRegistry";
import { getResultAsync } from "@esposter/shared";

export const getLatestVersion = (pkg: string): Promise<string> =>
  getResultAsync(() => fetchRegistry<PackumentVersion>(pkg, "/latest"))
    .orElse(() => getResultAsync(() => fetchRegistry<PackumentVersion>(pkg, "/latest")))
    .match(
      ({ version }) => version,
      (error) => {
        throw error;
      },
    );
