import type { UsageTotal } from "#src/models/usage/UsageTotal";

import { formatFleetTable } from "#src/services/fleet/formatFleetTable";
import { formatMillions } from "#src/services/usage/formatMillions";
import { formatThousands } from "#src/services/usage/formatThousands";

// One row per bucket and family, the most cached reads first; the average context is an average turn's input and cache
export const formatUsageTotalRows = (totals: readonly UsageTotal[]): string[] =>
  formatFleetTable(
    ["bucket", "family", "turns", "output", "cached reads", "cache writes", "avg context"],
    totals
      .toSorted((firstTotal, secondTotal) => secondTotal.cacheRead - firstTotal.cacheRead)
      .map(({ bucket, cacheRead, cacheWrite, context, family, output, turns }) => [
        bucket,
        family,
        String(turns),
        formatMillions(output),
        formatMillions(cacheRead),
        formatMillions(cacheWrite),
        formatThousands(context / turns),
      ]),
  );
