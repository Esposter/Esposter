import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";
import type { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";

import { CurveWrapMode } from "#src/models/genshinAssets/scene/CurveWrapMode";

// A time outside a curve's keys brought within them by the wrap mode on its side: repeated from the first key or
// Mirrored back and forth, and left as it is to clamp or within them
const wrapTime = (time: number, first: number, last: number, mode: CurveWrapMode): number => {
  const span = last - first;
  if (span === 0 || mode === CurveWrapMode.Clamp || (time >= first && time <= last)) return time;
  const period = mode === CurveWrapMode.Repeat ? span : 2 * span;
  const phase = (((time - first) % period) + period) % period;
  return first + (phase <= span ? phase : period - phase);
};
// A scanned curve's value at a time as Unity evaluates it: the time wrapped within the keys by its wrap modes, then the
// Cubic Hermite between the keys either side, each key's slope out of it and the next's into it scaled by the span,
// Held at the earlier key's value where a slope is infinite (a step), and clamped to the first and last keys' values
// Outside them
export const sampleSerializedCurve = (
  { keys, postWrap, preWrap }: Extract<SerializedField, { kind: SerializedFieldKind.Curve }>,
  time: number,
): number => {
  const [first = 0, last = 0] = [keys[0]?.time, keys.at(-1)?.time];
  const wrappedTime = wrapTime(time, first, last, time < first ? preWrap : postWrap);
  const upper = keys.findIndex((key) => key.time > wrappedTime);
  if (upper === 0) return keys[0]?.value ?? 0;
  if (upper === -1) return keys.at(-1)?.value ?? 0;
  const [start, end] = [keys[upper - 1], keys[upper]];
  if (!start || !end) return 0;
  if (!Number.isFinite(start.outSlope) || !Number.isFinite(end.inSlope)) return start.value;
  const span = end.time - start.time;
  const share = (wrappedTime - start.time) / span;
  const [squared, cubed] = [share ** 2, share ** 3];
  return (
    (2 * cubed - 3 * squared + 1) * start.value +
    (cubed - 2 * squared + share) * start.outSlope * span +
    (-2 * cubed + 3 * squared) * end.value +
    (cubed - squared) * end.inSlope * span
  );
};
