import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { DerivedAssetLandmarkMap } from "#src/services/genshinAssets/DerivedAssetLandmarkMap";
import { PARITY_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { projectWitnessPoint } from "#src/services/genshinParity/projectWitnessPoint";
import { refineCameraPose } from "#src/services/genshinParity/refineCameraPose";
import { snapToCorner } from "#src/services/genshinParity/snapToCorner";
import { solveCameraPose } from "#src/services/genshinParity/solveCameraPose";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// How far, in the reference's pixels, a landmark read by eye may move to the corner it snaps to
const SNAP_RADIUS = 6;
const MARKER_RADIUS = 6;
// A reference's camera pose solved from its component's landmarks: each landmark's place from the witness's own parts,
// Each pixel the reference names for it snapped to the nearest corner, then the pose in closed form and refined on the
// Reprojection error, printed per landmark; then, when asked, a few steps on the edges of the families given. The
// Landmarks can be a subset of the reference's, to solve one part's pose apart from another's. An image of every
// Landmark over the reference is written beside the references: the pixel given in blue, the corner it snapped to in
// Green, and where the pose projects it in red
export const solveReferencePose = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  {
    families = [],
    heldAxes = [],
    landmarkNames,
    refineIterations = 0,
    start,
  }: {
    families?: string[];
    heldAxes?: number[];
    landmarkNames?: string[];
    refineIterations?: number;
    start?: number[];
  },
): Promise<{
  errors: Record<string, number>;
  imagePath: string;
  pose: number[];
  refinement?: { after: number; before: number };
  rms: number;
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
  await fetchReferences();
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  const { data, info } = await sharp(referencePath).greyscale().raw().toBuffer({ resolveWithObject: true });
  const grey = Float32Array.from(data);
  const { height, width } = info;
  const { browser, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const points = await page.evaluate(
        (landmarks) =>
          (Reflect.get(window, "readWitnessPoints") as (landmarks: unknown) => [number, number, number][])(landmarks),
        definitions,
      );
      const snapped = seen.map(([, pixel]) => snapToCorner(grey, width, height, pixel, SNAP_RADIUS));
      const correspondences = points.map((point, index) => ({ pixel: snapped[index] ?? [0, 0], point }));
      const solved = solveCameraPose(correspondences, width, height, start, heldAxes);
      const markers = seen.flatMap(([, given], index) => {
        const {
          pixel: [u, v],
        } = projectWitnessPoint(solved.pose, points[index] ?? [0, 0, 0], width, height);
        const [snappedX = 0, snappedY = 0] = snapped[index] ?? [];
        return [
          `<circle cx="${given[0]}" cy="${given[1]}" r="${MARKER_RADIUS}" fill="none" stroke="#08f" stroke-width="2"/>`,
          `<circle cx="${snappedX}" cy="${snappedY}" r="${MARKER_RADIUS / 2}" fill="#0f0"/>`,
          `<circle cx="${u}" cy="${v}" r="${MARKER_RADIUS}" fill="none" stroke="#f00" stroke-width="2"/>`,
        ];
      });
      const directory = join(PARITY_DIRECTORY, "pose");
      await mkdir(directory, { recursive: true });
      const imagePath = join(directory, `${referenceId}.png`);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${markers.join("")}</svg>`;
      await sharp(referencePath)
        .composite([{ input: Buffer.from(svg) }])
        .png()
        .toFile(imagePath);
      const errors = Object.fromEntries(seen.map(([name], index) => [name, solved.errors[index] ?? 0]));
      if (refineIterations === 0) return { errors, imagePath, pose: solved.pose, rms: solved.rms };
      const { after, before, pose } = await refineCameraPose(page, image, solved.pose, families, refineIterations, {
        heldAxes,
      });
      return { errors, imagePath, pose, refinement: { after, before }, rms: solved.rms };
    },
    () => browser.close(),
  );
};
