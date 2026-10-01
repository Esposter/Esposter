import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { Landmark } from "#src/models/genshinAssets/Landmark";

import { DerivedAssetLandmarkMap } from "#src/services/genshinAssets/DerivedAssetLandmarkMap";
import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { projectWitnessPoint } from "#src/services/genshinParity/projectWitnessPoint";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

type Vector = [number, number, number];
// The simplex's first steps, metres along each axis and degrees about the vertical, and how many it takes: the fit is
// A handful of points through a fixed camera, so it settles in well under a second
const PLACE_STEPS = [2, 2, 2, 2];
const PLACE_ITERATIONS = 400;
// Where a row of parts stands on a reference, from its landmarks alone, the camera held at the pose given: one offset in
// Three's axes and one turn about the vertical through the world's origin, shared by every landmark named (a row the
// Script moves as one), by least squares on their reprojection through that camera. No frame is drawn: the witness
// Reads each landmark's place once, and the fit is arithmetic, so a row the edges cannot settle (a reference's clouds
// And haze pulling its boundaries) is placed by what the reference shows of it
export const placeFamiliesOnLandmarks = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  { landmarkNames, pose }: { landmarkNames: readonly string[]; pose: readonly number[] },
): Promise<{
  errors: Record<string, number>;
  laidOutErrors: Record<string, number>;
  offset: Vector;
  rms: number;
  turn: number;
}> => {
  const referenceLandmarks = ParityReferenceMap[referenceId]?.landmarks ?? {};
  const definitions = landmarkNames.map((name): Landmark => {
    const landmark = DerivedAssetLandmarkMap[witness][name];
    if (!landmark || !referenceLandmarks[name])
      throw new InvalidOperationError(Operation.Read, name, `not a landmark of ${referenceId} and ${witness}`);
    return landmark;
  });
  const pixels = landmarkNames.map((name) => referenceLandmarks[name] ?? [0, 0]);
  await fetchReferences();
  const { height, width } = await sharp(join(REFERENCES_DIRECTORY, `${referenceId}.png`)).metadata();
  const { browser, page } = await openWitnessPage(referenceId, witness);
  const points = await withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {});
      return page.evaluate(
        (landmarks) => (Reflect.get(window, "readWitnessPoints") as (landmarks: unknown) => Vector[])(landmarks),
        definitions,
      );
    },
    () => browser.close(),
  );
  const readErrors = ([x = 0, y = 0, z = 0, turnDegrees = 0]: readonly number[]): number[] => {
    const cosine = Math.cos((turnDegrees * Math.PI) / 180);
    const sine = Math.sin((turnDegrees * Math.PI) / 180);
    return points.map(([pointX, pointY, pointZ], index) => {
      const placed: Vector = [pointX * cosine + pointZ * sine + x, pointY + y, -pointX * sine + pointZ * cosine + z];
      const {
        pixel: [u, v],
      } = projectWitnessPoint(pose, placed, width, height);
      const [givenU = 0, givenV = 0] = pixels[index] ?? [];
      return Math.hypot(u - givenU, v - givenV);
    });
  };
  const readRms = (values: readonly number[]): number =>
    Math.sqrt(readErrors(values).reduce((sum, error) => sum + error ** 2, 0) / Math.max(points.length, 1));
  const { point } = await minimizeNelderMead(
    (values) => Promise.resolve(readRms(values)),
    [0, 0, 0, 0],
    PLACE_STEPS,
    PLACE_ITERATIONS,
  );
  const [x = 0, y = 0, z = 0, turn = 0] = point;
  const errors = readErrors(point);
  const laidOutErrors = readErrors([0, 0, 0, 0]);
  return {
    errors: Object.fromEntries(landmarkNames.map((name, index) => [name, errors[index] ?? 0])),
    laidOutErrors: Object.fromEntries(landmarkNames.map((name, index) => [name, laidOutErrors[index] ?? 0])),
    offset: [x, y, z],
    rms: readRms(point),
    turn,
  };
};
