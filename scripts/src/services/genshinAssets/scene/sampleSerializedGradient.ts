import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";
import type { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";

// A scanned gradient's colour at a time as Unity blends it: each channel linearly between the colour keys either side,
// Clamped to the first and last keys' colours outside them
export const sampleSerializedGradient = (
  { colorKeys }: Extract<SerializedField, { kind: SerializedFieldKind.Gradient }>,
  time: number,
): [number, number, number] => {
  const upper = colorKeys.findIndex((key) => key.time >= time);
  if (upper === 0) return colorKeys[0]?.color ?? [0, 0, 0];
  if (upper === -1) return colorKeys.at(-1)?.color ?? [0, 0, 0];
  const [start, end] = [colorKeys[upper - 1], colorKeys[upper]];
  if (!start || !end) return [0, 0, 0];
  const share = (time - start.time) / (end.time - start.time);
  return start.color.map((channel, index) => channel + ((end.color[index] ?? 0) - channel) * share) as [
    number,
    number,
    number,
  ];
};
