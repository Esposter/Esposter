import type { EmitterSettings } from "#src/models/genshinAssets/particles/EmitterSettings";

import { formatEmitterValue } from "#src/services/genshinAssets/particles/formatEmitterValue";
import { formatScalar } from "#src/services/genshinAssets/particles/formatScalar";
import { formatNumbers } from "#src/services/genshinAssets/shared/formatNumbers";

// A particle system's four settings, each on its own indented line beneath its game object
export const formatEmitterSettings = ({ colour, life, rate, size }: EmitterSettings): string =>
  [
    `colour ${formatEmitterValue(colour, formatNumbers)}`,
    `life ${formatEmitterValue(life, formatScalar)}`,
    `rate ${formatEmitterValue(rate, formatScalar)}`,
    `size ${formatEmitterValue(size, formatScalar)}`,
  ]
    .map((line) => `  ${line}`)
    .join("\n");
