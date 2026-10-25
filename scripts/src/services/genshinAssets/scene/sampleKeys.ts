import { GradientMode } from "#src/models/genshinAssets/scene/GradientMode";

// Keys' channels at a time: linearly between the keys either side, or in the fixed mode the first key after the time
// Held, and clamped to the first and last keys' outside them
export const sampleKeys = (
  keys: readonly { channels: readonly number[]; time: number }[],
  mode: GradientMode,
  time: number,
): readonly number[] => {
  const upper = keys.findIndex((key) => key.time > time);
  if (upper === -1) return keys.at(-1)?.channels ?? [];
  const [start, end] = [keys[upper - 1], keys[upper]];
  if (!end) return [];
  if (!start || mode === GradientMode.Fixed) return end.channels;
  const share = (time - start.time) / (end.time - start.time);
  return start.channels.map((channel, index) => channel + ((end.channels[index] ?? 0) - channel) * share);
};
