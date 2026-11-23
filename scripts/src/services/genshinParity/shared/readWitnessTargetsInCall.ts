import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { Vector } from "#src/models/shared/Vector";
import type { WitnessTarget } from "genshin-world/sceneExport";
import type { Page } from "playwright";

import { decodeTarget } from "#src/services/genshinParity/shared/decodeTarget";
import { readFloat32Array } from "#src/services/shared/readFloat32Array";

declare global {
  interface Window {
    renderWitnessTargets: (
      targetNames: readonly string[],
      isScene: boolean,
      lightDirection?: Readonly<Vector>,
    ) => Promise<{
      families: string[];
      height: number;
      parts: WitnessGbuffer["parts"];
      positionLift: number;
      targets: Partial<Record<WitnessTarget, string>>;
      width: number;
    }>;
  }
}

// One call of the witness page's `renderWitnessTargets`, drawing the names given and reading them back as floats: each
// Handed over as base64 and decoded here, along with the parts and the view's size the page draws them at
export const readWitnessTargetsInCall = async (
  page: Page,
  names: readonly WitnessTarget[],
  isScene: boolean,
  lightDirection?: Readonly<Vector>,
): Promise<
  { targets: Partial<Record<WitnessTarget, Float32Array>> } & Pick<
    WitnessGbuffer,
    "families" | "height" | "parts" | "width"
  >
> => {
  const { families, height, parts, positionLift, targets, width } = await page.evaluate(
    ([targetNames, isSceneDrawn, direction]) => window.renderWitnessTargets(targetNames, isSceneDrawn, direction),
    [[...names], isScene, lightDirection] as const,
  );
  return {
    families,
    height,
    parts,
    targets: Object.fromEntries(
      Object.entries(targets).map(([name, base64 = ""]) => {
        const bytes = Buffer.from(base64, "base64");
        return [name, decodeTarget(name, readFloat32Array(bytes), positionLift)];
      }),
    ),
    width,
  };
};
