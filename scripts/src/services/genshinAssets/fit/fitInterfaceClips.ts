import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { DecodedCurve } from "#src/models/genshinAssets/shared/DecodedCurve";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { simplifyPath } from "#src/services/genshinAssets/fit/simplifyPath";

// A decoded clip's curve kept within this share of its own range, over its span, when its keyframes are simplified
const KEYFRAME_TOLERANCE = 0.005;
// The properties an interface clip moves, by the Unity property a curve drives: an alpha as opacity, a Transform's
// Scale by its x, and an anchored position's offset in canvas units, its y running up the screen
const toProperty = ({ component, property }: DecodedCurve): string => {
  if (property === "m_Alpha" || property === "m_Color.a") return "opacity";
  if (property === "scale" && component === "x") return "scale";
  if (property === "m_AnchoredPosition.x") return "x";
  if (property === "m_AnchoredPosition.y") return "y";
  return "";
};
// The interface clips a screen plays, from the component's decoded clips: each clip's span in milliseconds and a track
// For each curve that sets an interface piece its tree names (a path, not a hash) in a property the screen draws,
// Its keyframes simplified to where the curve bends, each an offset through the clip and a value
export const fitInterfaceClips = (
  clips: readonly DecodedClip[],
): Record<
  string,
  { durationMs: number; tracks: { keyframes: [number, number][]; property: string; target: string }[] }
> =>
  Object.fromEntries(
    clips.map(({ curves, duration, name }) => [
      name,
      {
        durationMs: Math.round(duration * 1000),
        tracks: curves.flatMap((curve) => {
          const property = toProperty(curve);
          const { path, samples } = curve;
          if (!property || /^\d+$/u.test(path)) return [];
          const target = path === "(the animator)" ? "" : path;
          const low = Math.min(...samples);
          const range = Math.max(...samples) - low;
          // A held curve still sets its piece's value, as a clip of no length (the white curtain's) does all it does
          if (range < 1e-3) {
            const value = roundFitted(low);
            const keyframes: [number, number][] = [
              [0, value],
              [1, value],
            ];
            return [{ keyframes, property, target }];
          }
          const span = Math.max(samples.length - 1, 1);
          const normalised = samples.map((sample, index): [number, number] => [index / span, (sample - low) / range]);
          const keyframes = simplifyPath(normalised, KEYFRAME_TOLERANCE).map(([offset, share]): [number, number] => [
            Math.round(offset * 1e4) / 1e4,
            roundFitted(low + share * range),
          ]);
          return [{ keyframes, property, target }];
        }),
      },
    ]),
  );
