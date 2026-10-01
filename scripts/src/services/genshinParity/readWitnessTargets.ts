import type { WitnessGbuffer } from "#src/models/genshinParity/WitnessGbuffer";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/WitnessTargetName";

// The normal target is drawn encoded into 0 to 1, a colour output clipping what falls below 0, so it is let down to
// -1 to 1 again, its fourth channel left as it is
const decodeTarget = (name: string, values: Float32Array): Float32Array =>
  name === WitnessTargetName.Normal ? values.map((value, index) => (index % 4 === 3 ? value : value * 2 - 1)) : values;
// The witness page's targets at the view last set, as its `renderWitnessTargets` reads them back from the renderer,
// Drawing only the ones named, each handed over as base64 and read here as its floats
export const readWitnessTargets = async (
  page: Page,
  names: readonly WitnessTargetName[],
): Promise<
  Pick<WitnessGbuffer, "families" | "height" | "parts" | "width"> & {
    targets: Partial<Record<WitnessTargetName, Float32Array>>;
  }
> => {
  const { families, height, parts, targets, width } = await page.evaluate(
    (targetNames) =>
      (
        Reflect.get(window, "renderWitnessTargets") as (
          targetNames: string[],
        ) => Promise<{
          families: string[];
          height: number;
          parts: WitnessGbuffer["parts"];
          targets: Partial<Record<WitnessTargetName, string>>;
          width: number;
        }>
      )(targetNames),
    [...names],
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
          ),
        ];
      }),
    ),
    width,
  };
};
