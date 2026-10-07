import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";
import type { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";

import { GradientMode } from "#src/models/genshinAssets/scene/GradientMode";

// Keys' channels at a time: linearly between the keys either side, or in the fixed mode the first key after the time
// Held, and clamped to the first and last keys' outside them
const sampleKeys = (
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
// A scanned gradient's colour and alpha at a time as Unity evaluates it, its colour keys and its alpha keys each read
// By the gradient's mode
export const sampleSerializedGradient = (
  { alphaKeys, colorKeys, mode }: Extract<SerializedField, { kind: SerializedFieldKind.Gradient }>,
  time: number,
): [number, number, number, number] => {
  const [red = 0, green = 0, blue = 0] = sampleKeys(
    colorKeys.map(({ color, ...key }) => ({ ...key, channels: color })),
    mode,
    time,
  );
  const [alpha = 0] = sampleKeys(
    alphaKeys.map(({ alpha: channel, ...key }) => ({ ...key, channels: [channel] })),
    mode,
    time,
  );
  return [red, green, blue, alpha];
};
