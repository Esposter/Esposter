import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { PARITY_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { projectWitnessPoint } from "#src/services/genshinParity/witness/projectWitnessPoint";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { refineCameraPose } from "#src/services/genshinParity/witness/refineCameraPose";
import { solveCameraPose } from "#src/services/genshinParity/witness/solveCameraPose";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const MARKER_RADIUS = 6;
// A reference's camera pose solved from its component's landmarks (`readReferenceLandmarks`): the pose in closed form,
// Refined on the reprojection error and printed per landmark; then, when asked, a few steps on the edges of the
// Families given. The landmarks can be a subset of the reference's, to solve one part's pose apart from another's. An
// Image of every landmark over the reference is written beside the references: the pixel given in blue, the corner it
// Snapped to in green, and where the pose projects it in red. Given a top row, in the reference's pixels, the
// Refinement prices only the edges below it
export const solveReferencePose = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  {
    families = [],
    heldAxes = [],
    landmarkNames,
    refineIterations = 0,
    start,
    topRow = 0,
  }: {
    families?: string[];
    heldAxes?: number[];
    landmarkNames?: string[];
    refineIterations?: number;
    start?: number[];
    topRow?: number;
  },
): Promise<{
  errors: Record<string, number>;
  imagePath: string;
  pose: number[];
  refinement?: { after: number; before: number };
  rms: number;
}> => {
  await fetchReferences();
  const { close, height: pageHeight, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const { correspondences, given, height, names, width } = await readReferenceLandmarks(
        page,
        referenceId,
        witness,
        landmarkNames,
      );
      const solved = solveCameraPose(correspondences, width, height, start, heldAxes);
      const markers = correspondences.flatMap(({ pixel: [snappedX, snappedY], point }, index) => {
        const {
          pixel: [u, v],
        } = projectWitnessPoint(solved.pose, point, width, height);
        const [givenX = 0, givenY = 0] = given[index] ?? [];
        return [
          `<circle cx="${givenX}" cy="${givenY}" r="${MARKER_RADIUS}" fill="none" stroke="#08f" stroke-width="2"/>`,
          `<circle cx="${snappedX}" cy="${snappedY}" r="${MARKER_RADIUS / 2}" fill="#0f0"/>`,
          `<circle cx="${u}" cy="${v}" r="${MARKER_RADIUS}" fill="none" stroke="#f00" stroke-width="2"/>`,
        ];
      });
      const directory = join(PARITY_DIRECTORY, "pose");
      await mkdir(directory, { recursive: true });
      const imagePath = join(directory, `${referenceId}.png`);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${markers.join("")}</svg>`;
      await sharp(join(REFERENCES_DIRECTORY, `${referenceId}.png`))
        .composite([{ input: Buffer.from(svg) }])
        .png()
        .toFile(imagePath);
      const errors = Object.fromEntries(names.map((name, index) => [name, solved.errors[index] ?? 0]));
      if (refineIterations === 0) return { errors, imagePath, pose: solved.pose, rms: solved.rms };
      const { after, before, pose } = await refineCameraPose(page, image, solved.pose, families, refineIterations, {
        heldAxes,
        topRow: (topRow * pageHeight) / height,
      });
      return { errors, imagePath, pose, refinement: { after, before }, rms: solved.rms };
    },
    () => close(),
  );
};
