import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { PricedDirection } from "#src/models/genshinParity/witness/PricedDirection";
import type { Vector } from "#src/models/shared/Vector";

import { SHADOW_WIDTH } from "#src/services/genshinParity/passes/constants";
import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { withReferencePage } from "#src/services/genshinParity/shared/withReferencePage";
import { checkIsPartInterior } from "#src/services/genshinParity/sky/checkIsPartInterior";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { computeDistanceTransform } from "#src/services/genshinParity/witness/computeDistanceTransform";
import { countSetPixels } from "#src/services/genshinParity/witness/countSetPixels";
import { createShadowPricer } from "#src/services/genshinParity/witness/createShadowPricer";
import { findShadowEdges } from "#src/services/genshinParity/witness/findShadowEdges";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { searchShadowDirections } from "#src/services/genshinParity/witness/searchShadowDirections";
import { solveCameraPose } from "#src/services/genshinParity/witness/solveCameraPose";
import { toLuminance } from "#src/services/genshinParity/witness/toLuminance";
import { removeMaskSpecks } from "#src/services/recreation/image/removeMaskSpecks";
import { computeOtsuThreshold } from "#src/services/recreation/statistics/computeOtsuThreshold";
import { BYTE } from "#src/services/shared/constants";
import { WitnessTarget } from "genshin-world/sceneExport";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A flat receiver is a face turned within about 25 degrees of up, past what the walkway's carved relief bends its
// Normals by, so a shadow's edge across it is the occluder's and not the face's own turn
const RECEIVER_UP = 0.9;
// A run of shadow or light smaller than this many pixels at the reading's width is a texel's misreading rather than a
// Shadow, where a tower's shadow across the walkway covers thousands
const SHADOW_SPECK_AREA = 64;
// How many of the grid's best a solve reports
const GRID_REPORT_COUNT = 5;

// The light pass's shadows on a reference: its flat receivers are the interior pixels of the exports' parts that face
// Up, where the reference's shading, its colour over the exports' albedo, splits by Otsu's threshold into shadow and
// Light, and the shadow's edges are those (`findShadowEdges`). The exports' occluders are cast onto the same receivers
// From a direction by the scene's own shadow map (the witness's shadow target, the sun cast from it for that read
// Alone), and their edges priced against the reference's both ways, the mean of each edge's distance to the other's
// Nearest, in the reference's pixels (`computeEdgeDistance`). The scene's own direction is priced, and when told, the
// Directions about it and of the sky's grid, and the simplexes from the grid's best (`searchShadowDirections`). Each
// Priced direction reports how many edge pixels ours draws, and the grid's best few are reported beside the solved. A
// Current build's reference is seen from the scene's own camera, which the camera pass holds; an older build's from its
// Own, solved on its landmarks. An image of the reference with its edges in green, the scene's in red and the solved in
// Blue is written beside the references
export const solveReferenceShadows = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  { isSolved, pageRoot }: { isSolved: boolean; pageRoot?: string | undefined },
): Promise<{
  direction: Vector;
  distance: number;
  edgeCount: number;
  grid: PricedDirection[];
  imagePath: string;
  ourEdgeCount: number;
  probes: PricedDirection[];
  solved?: PricedDirection;
}> => {
  await fetchReferences();
  const referencePath = await getReferencePath(referenceId);
  return withReferencePage(
    referenceId,
    witness,
    async ({ checkIsScored, image, page }) => {
      const { width: referenceWidth } = await sharp(referencePath).metadata();
      if (ParityReferenceMap[referenceId]?.isOtherBuild) {
        const { correspondences, height, width } = await readReferenceLandmarks(page, referenceId, witness);
        const { pose } = solveCameraPose(correspondences, width, height);
        await setPageWitnessView(page, { camera: toPageCamera(pose) });
      } else await setPageWitnessView(page, {});
      const {
        height,
        targets: { albedo = new Float32Array(), normal = new Float32Array(), part = new Float32Array() },
        width,
      } = await readWitnessTargets(page, [WitnessTarget.Albedo, WitnessTarget.Normal, WitnessTarget.Part]);
      const { direction } = await page.evaluate(() => window.setSceneLights({}));
      const shot = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const isReceiver = Uint8Array.from({ length: width * height }, (_value, pixel) =>
        Number(
          checkIsPartInterior(part, width, height, pixel) &&
            checkIsScored(pixel, width) &&
            (normal[pixel * 4 + 1] ?? 0) >= RECEIVER_UP,
        ),
      );
      // A receiver's shading as a logarithm, so a shadow over dark stone and over pale stone split alike
      const shadings = Array.from(isReceiver, (isSet, pixel) => {
        if (!isSet) return 0;
        const shown = toLuminance(...getPixelDisplayColor(shot, pixel));
        const unlit = toLuminance(albedo[pixel * 4] ?? 0, albedo[pixel * 4 + 1] ?? 0, albedo[pixel * 4 + 2] ?? 0);
        return Math.log(Math.max(shown, Number.EPSILON) / Math.max(unlit, Number.EPSILON));
      });
      const receiverShadings = shadings.filter((_shading, pixel) => isReceiver[pixel]);
      // A reduce rather than a spread, since a frame's receivers outnumber the arguments a call takes
      const [least, most] = receiverShadings.reduce<[number, number]>(
        ([low, high], shading) => [Math.min(low, shading), Math.max(high, shading)],
        [Infinity, -Infinity],
      );
      const toByte = (shading: number): number => ((shading - least) / Math.max(most - least, Number.EPSILON)) * BYTE;
      const threshold = computeOtsuThreshold(receiverShadings.map((shading) => toByte(shading)));
      const isShadowed = Uint8Array.from(shadings, (shading, pixel) =>
        Number(Boolean(isReceiver[pixel]) && toByte(shading) <= threshold),
      );
      removeMaskSpecks(isShadowed, width, height, SHADOW_SPECK_AREA);
      const referenceEdges = findShadowEdges(isShadowed, isReceiver, width, height);
      const priceDirection = createShadowPricer({
        height,
        isReceiver,
        page,
        referenceDistances: computeDistanceTransform(referenceEdges, width, height),
        referenceEdges,
        scale: referenceWidth / width,
        width,
      });
      const shipped = await priceDirection(direction);
      const { gridBest, probes, solvedDirection } = await searchShadowDirections(priceDirection, direction, isSolved);
      const solved = solvedDirection ? await priceDirection(solvedDirection) : undefined;
      const marked = Buffer.from(shot);
      for (const [edges, color] of [
        [referenceEdges, [0, BYTE, 0]],
        [shipped.edges, [BYTE, 0, 0]],
        [solved?.edges ?? new Uint8Array(), [0, 0, BYTE]],
      ] as const)
        for (const [pixel, isSet] of edges.entries()) if (isSet) marked.set(color, pixel * 3);
      const directory = join(PARITY_DIRECTORY, "shadows");
      await mkdir(directory, { recursive: true });
      const imagePath = join(directory, `${referenceId}.png`);
      await sharp(marked, { raw: { channels: 3, height, width } })
        .png()
        .toFile(imagePath);
      return {
        direction,
        distance: shipped.distance,
        edgeCount: countSetPixels(referenceEdges),
        grid: gridBest.slice(0, GRID_REPORT_COUNT),
        imagePath,
        ourEdgeCount: countSetPixels(shipped.edges),
        probes,
        ...(solvedDirection &&
          solved && {
            solved: {
              direction: solvedDirection,
              distance: solved.distance,
              ourEdgeCount: countSetPixels(solved.edges),
            },
          }),
      };
    },
    SHADOW_WIDTH,
    pageRoot,
  );
};
