import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";
import type { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";

import { sampleKeys } from "#src/services/genshinAssets/scene/sampleKeys";

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
