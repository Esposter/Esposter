import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Pixel } from "#src/models/genshinParity/witness/Pixel";
import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

import { DerivedAssetLandmarkMap } from "#src/services/genshinAssets/witness/DerivedAssetLandmarkMap";
import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { snapToCorner } from "#src/services/genshinParity/witness/snapToCorner";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

// How far, in the reference's pixels, a landmark read by eye may move to the corner it snaps to
const SNAP_RADIUS = 6;
// A reference's landmarks, all of them or the ones named, matched to the witness's own parts on its open page: each
// One's place in the world, and the pixel the reference names for it, snapped to the nearest corner unless it stands on
// A silhouette or inside a face, where it is read as given. The caller fetches the references first
export const readReferenceLandmarks = async (
  page: Page,
  referenceId: string,
  witness: DerivedAssetComponent,
  landmarkNames?: readonly string[],
): Promise<{
  correspondences: { isEdge?: boolean; pixel: Pixel; point: Vector }[];
  given: Pixel[];
  height: number;
  names: string[];
  width: number;
}> => {
  const referenceLandmarks = ParityReferenceMap[referenceId]?.landmarks ?? {};
  for (const name of landmarkNames ?? [])
    if (!(name in referenceLandmarks))
      throw new InvalidOperationError(Operation.Read, name, `not a landmark of ${referenceId}`);
  const seen = Object.entries(referenceLandmarks).filter(([name]) => !landmarkNames || landmarkNames.includes(name));
  const definitions = seen.map(([name]) => {
    const landmark = DerivedAssetLandmarkMap[witness][name];
    if (!landmark) throw new InvalidOperationError(Operation.Read, name, `not a landmark of ${witness}`);
    return landmark;
  });
  const { data, info } = await sharp(join(REFERENCES_DIRECTORY, `${referenceId}.png`))
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const grey = Float32Array.from(data);
  const { height, width } = info;
  const points = await page.evaluate(
    (landmarks) => (Reflect.get(window, "computeWitnessPoints") as (landmarks: unknown) => Vector[])(landmarks),
    definitions,
  );
  const correspondences = seen.map(([, pixel], index) => {
    const definition = definitions[index];
    return {
      isEdge: definition?.isEdge,
      pixel:
        definition?.isEdge || definition?.isInterior ? pixel : snapToCorner(grey, width, height, pixel, SNAP_RADIUS),
      point: points[index] ?? [0, 0, 0],
    };
  });
  return { correspondences, given: seen.map(([, pixel]) => pixel), height, names: seen.map(([name]) => name), width };
};
