import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Pixel } from "#src/models/genshinParity/witness/Pixel";
import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

import { DerivedAssetLandmarkMap } from "#src/services/genshinAssets/witness/DerivedAssetLandmarkMap";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { snapToCorner } from "#src/services/genshinParity/witness/snapToCorner";
import { InvalidOperationError, Operation } from "@esposter/shared";
import sharp from "sharp";

declare global {
  interface Window {
    computeWitnessPoints: (landmarks: unknown) => Vector[];
  }
}

// How far, in the reference's pixels, a landmark read by eye may move to the corner it snaps to
const SNAP_RADIUS = 6;
// A reference's landmarks, all of them or the ones named, matched to the witness's own parts on its open page: each
// One's place in the world, and the pixel the reference names for it, snapped to the nearest corner unless it stands on
// A silhouette or inside a face, where it is read as given. A landmark the witness holds no mesh for yet is waiting: the
// Reference names its pixel, but it stays out of the solve, and is named in `waiting`, until its mesh is named. The
// Caller fetches the references first
export const readReferenceLandmarks = async (
  page: Page,
  referenceId: string,
  witness: DerivedAssetComponent,
  landmarkNames?: readonly string[],
): Promise<{
  correspondences: { isEdge?: boolean | undefined; pixel: Pixel; point: Vector }[];
  given: Pixel[];
  height: number;
  names: string[];
  waiting: string[];
  width: number;
}> => {
  const referenceLandmarks = ParityReferenceMap[referenceId]?.landmarks ?? {};
  for (const name of landmarkNames ?? [])
    if (!(name in referenceLandmarks))
      throw new InvalidOperationError(Operation.Read, name, `not a landmark of ${referenceId}`);
  const namedEntries = Object.entries(referenceLandmarks).filter(
    ([name]) => !landmarkNames || landmarkNames.includes(name),
  );
  const witnessLandmarks = DerivedAssetLandmarkMap[witness];
  const waiting = namedEntries.filter(([name]) => !witnessLandmarks[name]).map(([name]) => name);
  const landmarkEntries = namedEntries.flatMap(([name, pixel]) => {
    const definition = witnessLandmarks[name];
    return definition ? [{ definition, name, pixel }] : [];
  });
  const { data, info } = await sharp(await getReferencePath(referenceId))
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const grey = Float32Array.from(data);
  const { height, width } = info;
  // With none of its landmarks held there is no point to ask the scene for
  const points: Vector[] =
    landmarkEntries.length === 0
      ? []
      : await page.evaluate(
          (landmarks) => window.computeWitnessPoints(landmarks),
          landmarkEntries.map(({ definition }) => definition),
        );
  const correspondences = landmarkEntries.map(({ definition, name, pixel }, index) => {
    const point = points[index];
    if (!point) throw new InvalidOperationError(Operation.Read, name, "the scene placed no point for it");
    return {
      isEdge: definition.isEdge,
      pixel: definition.isEdge || definition.isInterior ? pixel : snapToCorner(grey, width, height, pixel, SNAP_RADIUS),
      point,
    };
  });
  return {
    correspondences,
    given: landmarkEntries.map(({ pixel }) => pixel),
    height,
    names: landmarkEntries.map(({ name }) => name),
    waiting,
    width,
  };
};
