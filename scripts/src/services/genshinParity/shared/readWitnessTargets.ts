import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";

// A colour output clips what falls below 0, so the normal target is drawn encoded into 0 to 1 and let down to -1 to 1
// Again, and the position target is drawn lifted by the lift the page hands back and let down by it, each pixel's
// Fourth channel left as it is
const decodeTarget = (name: string, values: Float32Array, positionLift: number): Float32Array => {
  if (name === WitnessTargetName.Normal) return values.map((value, index) => (index % 4 === 3 ? value : value * 2 - 1));
  if (name === WitnessTargetName.Position)
    return values.map((value, index) => (index % 4 === 3 ? value : value - positionLift));
  return values;
};
// The witness page's targets at the view last set, as its `renderWitnessTargets` reads them back from the renderer,
// Drawing only the ones named, each handed over as base64 and read here as its floats; told to, of the scene's own parts
// In place of the exports', and given a direction, under the sun cast from it for this read alone
export const readWitnessTargets = async (
  page: Page,
  names: readonly WitnessTargetName[],
  isScene = false,
  lightDirection?: Readonly<Vector>,
): Promise<
  Pick<WitnessGbuffer, "families" | "height" | "parts" | "width"> & {
    targets: Partial<Record<WitnessTargetName, Float32Array>>;
  }
> => {
  const { families, height, parts, positionLift, targets, width } = await page.evaluate(
    ([targetNames, isSceneDrawn, direction]) =>
      (
        Reflect.get(window, "renderWitnessTargets") as (
          targetNames: readonly string[],
          isScene: boolean,
          lightDirection?: Readonly<Vector>,
        ) => Promise<{
          families: string[];
          height: number;
          parts: WitnessGbuffer["parts"];
          positionLift: number;
          targets: Partial<Record<WitnessTargetName, string>>;
          width: number;
        }>
      )(targetNames, isSceneDrawn, direction),
    [[...names], isScene, lightDirection] as const,
  );
  return {
    families,
    height,
    parts,
    targets: Object.fromEntries(
      Object.entries(targets).map(([name, base64 = ""]) => {
        const bytes = Buffer.from(base64, "base64");
        return [
          name,
          decodeTarget(
            name,
            new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / Float32Array.BYTES_PER_ELEMENT),
            positionLift,
          ),
        ];
      }),
    ),
    width,
  };
};
