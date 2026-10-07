import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";
import type { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";

// A scanned curve's value at a time as Unity evaluates it: the cubic Hermite between the keys either side, each key's
// Slope out of it and the next's into it scaled by the span, held at the first key's value where a slope is infinite (a
// Step), and clamped to the first and last keys' values outside them
export const sampleSerializedCurve = (
  { keys }: Extract<SerializedField, { kind: SerializedFieldKind.Curve }>,
  time: number,
): number => {
  const upper = keys.findIndex((key) => key.time >= time);
  if (upper === 0) return keys[0]?.value ?? 0;
  if (upper === -1) return keys.at(-1)?.value ?? 0;
  const [start, end] = [keys[upper - 1], keys[upper]];
  if (!start || !end) return 0;
  if (!Number.isFinite(start.outSlope) || !Number.isFinite(end.inSlope)) return start.value;
  const span = end.time - start.time;
  const share = (time - start.time) / span;
  const [squared, cubed] = [share ** 2, share ** 3];
  return (
    (2 * cubed - 3 * squared + 1) * start.value +
    (cubed - 2 * squared + share) * start.outSlope * span +
    (-2 * cubed + 3 * squared) * end.value +
    (cubed - squared) * end.inSlope * span
  );
};
