import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ShadowSolve } from "#src/models/genshinParity/witness/ShadowSolve";

import { SHADOW_WIDTH } from "#src/services/genshinParity/passes/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { withReferencePage } from "#src/services/genshinParity/shared/withReferencePage";
import { computeDistanceTransform } from "#src/services/genshinParity/witness/computeDistanceTransform";
import { computeReferenceShadow } from "#src/services/genshinParity/witness/computeReferenceShadow";
import { countSetPixels } from "#src/services/genshinParity/witness/countSetPixels";
import { createShadowPricer } from "#src/services/genshinParity/witness/createShadowPricer";
import { findShadowEdges } from "#src/services/genshinParity/witness/findShadowEdges";
import { searchShadowDirections } from "#src/services/genshinParity/witness/searchShadowDirections";
import { setReferenceView } from "#src/services/genshinParity/witness/setReferenceView";
import { writeShadowImage } from "#src/services/genshinParity/witness/writeShadowImage";
import { WitnessTarget } from "genshin-world/sceneExport";
import sharp from "sharp";

// How many of the grid's best a solve reports
const GRID_REPORT_COUNT = 5;

// The light pass's shadows on a reference: the shadow is `computeReferenceShadow`'s, and its edges are priced against
// The Exports' own, cast onto the same receivers from a direction by the scene's shadow map (`createShadowPricer`). The
// Scene's own direction is priced, and when told, the directions about it and of the sky's grid
// (`searchShadowDirections`). The reference's view is `setReferenceView`'s, and its edges are written beside it
// (`writeShadowImage`)
export const solveReferenceShadows = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  { isSolved, pageRoot }: { isSolved: boolean; pageRoot?: string | undefined },
): Promise<ShadowSolve> => {
  await fetchReferences();
  const referencePath = await getReferencePath(referenceId);
  return withReferencePage(
    referenceId,
    witness,
    async ({ checkIsScored, image, page }) => {
      const { width: referenceWidth } = await sharp(referencePath).metadata();
      await setReferenceView(page, referenceId, witness);
      const {
        height,
        targets: { albedo = new Float32Array(), normal = new Float32Array(), part = new Float32Array() },
        width,
      } = await readWitnessTargets(page, [WitnessTarget.Albedo, WitnessTarget.Normal, WitnessTarget.Part]);
      const { direction } = await page.evaluate(() => window.setSceneLights({}));
      const shot = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const { isReceiver, isShadowed } = computeReferenceShadow({
        albedo,
        checkIsScored,
        height,
        normal,
        part,
        shot,
        width,
      });
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
      const imagePath = await writeShadowImage({
        height,
        referenceEdges,
        referenceId,
        shippedEdges: shipped.edges,
        shot,
        solvedEdges: solved?.edges,
        width,
      });
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
