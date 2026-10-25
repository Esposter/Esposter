import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

import { decodeTarget } from "#src/services/genshinParity/shared/decodeTarget";

// One call of the witness page's `renderWitnessTargets`, drawing the names given and reading them back as floats: each
// Handed over as base64 and decoded here, along with the parts and the view's size the page draws them at
export const readWitnessTargetsInCall = async (
  page: Page,
  names: readonly WitnessTargetName[],
  isScene: boolean,
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
