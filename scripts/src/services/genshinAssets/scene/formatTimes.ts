import { formatNumbers } from "#src/services/genshinAssets/shared/formatNumbers";

// What a curve or a gradient reads at each time, after an arrow, or nothing with no times
export const formatTimes = (times: readonly number[], read: (time: number) => string): string =>
  times.length === 0 ? "" : ` → ${times.map((time) => `${formatNumbers([time])}:${read(time)}`).join(" ")}`;
