import type { FittedSurface } from "#src/models/genshinAssets/fit/FittedSurface";
import type { ReadSurface } from "#src/models/genshinAssets/fit/ReadSurface";

import { withDetail } from "#src/services/genshinAssets/fit/withDetail";

// The part surfaces, each with the detail of the textures its own placed meshes drew
export const withPartDetails = (
  parts: Record<string, FittedSurface>,
  reads: readonly ReadSurface[],
): Record<string, FittedSurface> =>
  Object.fromEntries(
    Object.entries(parts).map(([part, surface]) => [
      part,
      withDetail(
        surface,
        reads.filter((read) => read.part === part),
      ),
    ]),
  );
