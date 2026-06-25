import type { PackumentVersion } from "@/services/models/PackumentVersion";

import { fetchRegistry } from "@/services/fetchRegistry";
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
