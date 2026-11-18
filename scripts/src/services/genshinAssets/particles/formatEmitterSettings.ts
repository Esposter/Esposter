import type { EmitterSettings } from "#src/models/genshinAssets/particles/EmitterSettings";
import type { EmitterValue } from "#src/models/genshinAssets/particles/EmitterValue";

import { formatNumbers } from "#src/services/genshinAssets/shared/formatNumbers";

// One field as text: its numbers, or the reason it is not held
const formatValue = <T>(value: EmitterValue<T>, format: (read: T) => string): string =>
  value.kind === "read" ? format(value.value) : `not held: ${value.reason}`;
// A particle system's four settings, each on its own indented line beneath its game object
export const formatEmitterSettings = ({ colour, life, rate, size }: EmitterSettings): string =>
  [
    `colour ${formatValue(colour, (value) => formatNumbers(value))}`,
    `life ${formatValue(life, (value) => formatNumbers([value]))}`,
    `rate ${formatValue(rate, (value) => formatNumbers([value]))}`,
    `size ${formatValue(size, (value) => formatNumbers([value]))}`,
  ]
    .map((line) => `  ${line}`)
    .join("\n");
