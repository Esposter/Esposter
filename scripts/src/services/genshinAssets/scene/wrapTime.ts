import { CurveWrapMode } from "#src/models/genshinAssets/scene/CurveWrapMode";

// A time outside a curve's keys brought within them by the wrap mode on its side: repeated from the first key or
// Mirrored back and forth, and left as it is to clamp or within them
export const wrapTime = (time: number, first: number, last: number, mode: CurveWrapMode): number => {
  const span = last - first;
  if (span === 0 || mode === CurveWrapMode.Clamp || (time >= first && time <= last)) return time;
  const period = mode === CurveWrapMode.Repeat ? span : 2 * span;
  const phase = (((time - first) % period) + period) % period;
  return first + (phase <= span ? phase : period - phase);
};
