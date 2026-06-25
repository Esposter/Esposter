import type { PackumentVersion } from "@/services/models/PackumentVersion";

import { fetchRegistry } from "@/services/fetchRegistry";
import { getResultAsync } from "@esposter/shared";

export const getLatestVersion = (pkg: string): Promise<string> =>
  Array.from({ length: 2 }, () => 0)
    .reduce(
      (result) => result.orElse(() => getResultAsync(() => fetchRegistry<PackumentVersion>(pkg, "/latest"))),
      getResultAsync(() => fetchRegistry<PackumentVersion>(pkg, "/latest")),
    )
    .match(
      ({ version }) => version,
      (error) => {
        throw error;
      },
    );
