import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetLights } from "#src/models/genshinParity/witness/SetLights";
import type { Vector } from "#src/models/shared/Vector";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { computeOtsuThreshold } from "#src/services/genshinAssets/shared/computeOtsuThreshold";
import { SHADOW_WIDTH } from "#src/services/genshinParity/passes/constants";
import { LUMINANCE, PARITY_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { removeMaskSpecks } from "#src/services/genshinParity/shared/removeMaskSpecks";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { checkIsPartInterior } from "#src/services/genshinParity/sky/checkIsPartInterior";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { computeEdgeDistance } from "#src/services/genshinParity/witness/computeEdgeDistance";
import { findShadowEdges } from "#src/services/genshinParity/witness/findShadowEdges";
import { getSkyGridDirections } from "#src/services/genshinParity/witness/getSkyGridDirections";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { solveCameraPose } from "#src/services/genshinParity/witness/solveCameraPose";
import { toSunDirection } from "#src/services/genshinParity/witness/toSunDirection";
import { BYTE } from "#src/services/shared/constants";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { MathUtils } from "three";

// A flat receiver is a face turned within about 25 degrees of up, past what the walkway's carved relief bends its
// Normals by, so a shadow's edge across it is the occluder's and not the face's own turn
const RECEIVER_UP = 0.9;
// The share of the sun under which a pixel of ours stands in shadow, the middle of its soft edge
const SHADOWED_VISIBILITY = 0.5;
// A run of shadow or light smaller than this many pixels at the reading's width is a texel's misreading rather than a
// Shadow, where a tower's shadow across the walkway covers thousands
const SHADOW_SPECK_AREA = 64;
// The solve's first step about each angle, in degrees, and how many steps of the simplex it takes from each start
const SOLVE_STEP_DEGREES = 5;
const SOLVE_ITERATION_COUNT = 40;
// The grid's best directions the simplex starts from, and how many of the grid's best a solve reports
const SOLVE_START_COUNT = 3;
const GRID_REPORT_COUNT = 5;
// The directions a solve prices first about the scene's, its heading and its height each turned either way, in degrees,
// So an objective no direction moves shows before the simplex settles on its start
const PROBE_TURNS_DEGREES: readonly [number, number][] = [
  [-15, 0],
  [15, 0],
  [0, -10],
  [0, 10],
];
// A sun direction priced: its edges' distance from the reference's and how many edge pixels ours draws
interface PricedDirection {
  direction: Vector;
  distance: number;
  ourEdgeCount: number;
}
const toAngles = ([x, y, z]: Readonly<Vector>): number[] => [
  MathUtils.radToDeg(Math.atan2(z, x)),
  MathUtils.radToDeg(Math.asin(y / Math.hypot(x, y, z))),
];
const countSetPixels = (mask: Uint8Array): number => mask.reduce((count, isSet) => count + isSet, 0);
const toLuminance = (red: number, green: number, blue: number): number =>
  LUMINANCE[0] * red + LUMINANCE[1] * green + LUMINANCE[2] * blue;
// The light pass's shadows on a reference: its flat receivers are the interior pixels of the exports' parts that face
// Up, where the reference's shading, its colour over the exports' albedo, splits by Otsu's threshold into shadow and
// Light, and the shadow's edges are those (`findShadowEdges`). The exports' occluders are cast onto the same receivers
// From a direction by the scene's own shadow map (the witness's shadow target, the sun cast from it for that read
// Alone), and their edges priced against the reference's both ways, the mean of each edge's distance to the other's
// Nearest, in the reference's pixels (`computeEdgeDistance`). The scene's own direction is priced, and when told, a few
// Directions about it, then every direction of the sky's grid (`getSkyGridDirections`) priced; the grid's best few each
// Start a simplex over their heading and their height above the horizon, and the best of those solved where the edges
// Meet best. Each priced direction reports how many edge pixels ours draws, and the grid's best few are reported beside
// The solved. A current build's reference is seen
// From the scene's own camera, which the camera pass holds; an older build's from its own, solved on its landmarks. An
// Image of the reference with its edges in green, the scene's in red and the solved in blue is written beside the
// References
export const solveReferenceShadows = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  isSolved: boolean,
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
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  const [{ close, checkIsScored, image, page }, { width: referenceWidth }] = await Promise.all([
    openWitnessPage(referenceId, witness, SHADOW_WIDTH),
    sharp(referencePath).metadata(),
  ]);
  return withFinalizerAsync(
    async () => {
      if (ParityReferenceMap[referenceId]?.isOtherBuild) {
        const { correspondences, height, width } = await readReferenceLandmarks(page, referenceId, witness);
        const { pose } = solveCameraPose(correspondences, width, height);
        await setPageWitnessView(page, { camera: toPageCamera(pose) });
      } else await setPageWitnessView(page, {});
      const {
        height,
        targets: { albedo = new Float32Array(), normal = new Float32Array(), part = new Float32Array() },
        width,
      } = await readWitnessTargets(page, [WitnessTargetName.Albedo, WitnessTargetName.Normal, WitnessTargetName.Part]);
      const { direction } = await page.evaluate(() => (Reflect.get(window, "setSceneLights") as SetLights)({}));
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
      const scale = referenceWidth / width;
      const priceDirection = async (candidate: Readonly<Vector>): Promise<{ distance: number; edges: Uint8Array }> => {
        const {
          targets: { shadow = new Float32Array() },
        } = await readWitnessTargets(page, [WitnessTargetName.Shadow], false, candidate);
        const isOursShadowed = Uint8Array.from(isReceiver, (isSet, pixel) =>
          Number(Boolean(isSet) && (shadow[pixel * 4] ?? 0) < SHADOWED_VISIBILITY),
        );
        const edges = findShadowEdges(isOursShadowed, isReceiver, width, height);
        return { distance: computeEdgeDistance(edges, referenceEdges, width, height) * scale, edges };
      };
      const shipped = await priceDirection(direction);
      const probes: PricedDirection[] = [];
      const [azimuth = 0, elevation = 0] = toAngles(direction);
      if (isSolved)
        for (const [headingTurn, heightTurn] of PROBE_TURNS_DEGREES) {
          const probeDirection = toSunDirection([azimuth + headingTurn, elevation + heightTurn]);
          // oxlint-disable-next-line no-await-in-loop -- the page draws one direction's shadows at a time
          const { distance, edges } = await priceDirection(probeDirection);
          probes.push({ direction: probeDirection, distance, ourEdgeCount: countSetPixels(edges) });
        }
      const grid: PricedDirection[] = [];
      if (isSolved)
        for (const gridDirection of getSkyGridDirections()) {
          // oxlint-disable-next-line no-await-in-loop -- the page draws one direction's shadows at a time
          const { distance, edges } = await priceDirection(gridDirection);
          grid.push({ direction: gridDirection, distance, ourEdgeCount: countSetPixels(edges) });
        }
      const gridBest = grid.toSorted((firstReading, secondReading) => firstReading.distance - secondReading.distance);
      const simplexResults: { cost: number; point: number[] }[] = [];
      if (isSolved)
        for (const { direction: startDirection } of gridBest.slice(0, SOLVE_START_COUNT)) {
          const [startAzimuth = 0, startElevation = 0] = toAngles(startDirection);
          // oxlint-disable-next-line no-await-in-loop -- the page draws one direction's shadows at a time
          const simplexResult = await minimizeNelderMead(
            async (angles) => {
              const [, angleElevation = 0] = angles;
              return angleElevation <= 0 || angleElevation >= 90
                ? Infinity
                : (await priceDirection(toSunDirection(angles))).distance;
            },
            [startAzimuth, startElevation],
            [SOLVE_STEP_DEGREES, SOLVE_STEP_DEGREES],
            SOLVE_ITERATION_COUNT,
          );
          simplexResults.push(simplexResult);
        }
      const [simplexBest] = simplexResults.toSorted(
        (firstResult, secondResult) => firstResult.cost - secondResult.cost,
      );
      const solvedDirection = simplexBest ? toSunDirection(simplexBest.point) : undefined;
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
    () => close(),
  );
};
