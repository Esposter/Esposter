import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ComparisonResult } from "#src/models/genshinParity/reference/ComparisonResult";
import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";

import { computeUnderBlackShare } from "#src/services/genshinParity/display/computeUnderBlackShare";
import { formatUnderBlackShare } from "#src/services/genshinParity/display/formatUnderBlackShare";
import { COMPARISON_HEIGHT } from "#src/services/genshinParity/reference/constants";
import { getCeiling } from "#src/services/genshinParity/reference/getCeiling";
import { getCellReadings } from "#src/services/genshinParity/reference/getCellReadings";
import { getCleanPlatePath } from "#src/services/genshinParity/reference/getCleanPlatePath";
import { getCleanPlateRegions } from "#src/services/genshinParity/reference/getCleanPlateRegions";
import { getLayerComponent } from "#src/services/genshinParity/reference/getLayerComponent";
import { getReferenceSoftness } from "#src/services/genshinParity/reference/getReferenceSoftness";
import { readScoredMask } from "#src/services/genshinParity/reference/readScoredMask";
import { readSilhouetteInks } from "#src/services/genshinParity/reference/readSilhouetteInks";
import { scoreLayers } from "#src/services/genshinParity/reference/scoreLayers";
import { scoreStructure } from "#src/services/genshinParity/reference/scoreStructure";
import { toPercent } from "#src/services/genshinParity/reference/toPercent";
import { COMPARISONS_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { getReferencePlatePath } from "#src/services/genshinParity/shared/getReferencePlatePath";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readFlipErrorMap } from "#src/services/genshinParity/shared/readFlipErrorMap";
import { readReferenceGbuffer } from "#src/services/genshinParity/shared/readReferenceGbuffer";
import { shootScreen } from "#src/services/genshinParity/shared/shootScreen";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const GRID_SIZE = 6;
// The least Gaussian sigma sharp blurs by, below which a recording's softness is too slight to draw
const MIN_BLUR_SIGMA = 0.3;
// The reference, ours and their difference side by side in one image, and how far apart they are: the mean over the
// Compared region, then the same over a grid of cells, row by row, so where they differ is read without looking; the
// Scores are handed back for the committed report, FLIP's perceptual error among them. A scene's shot is scored again
// Layer by layer over the families the witness's part target gives at the reference's view, over the region its row
// Scores, so a family that moves away from the reference shows on its own row even where the frame's score barely
// Moves, and the frame's layer is the row. With a witness, the scene draws that component's exports in place of its
// Own parts and its image is kept apart from the scene's own. The shot is taken on `pageRoot` when one is given, a page
// The caller started, and on the parity page otherwise. Every line is written to stderr, so stdout holds the command's own output
export const compareScreen = async (
  referenceId: string,
  witness?: DerivedAssetComponent,
  pageRoot?: string,
): Promise<ComparisonResult> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `not one of ${Object.keys(ParityReferenceMap).join(", ")}`,
    );
  await fetchReferences();
  // A reference the manifest does not hold is refused here, since there is no stored image to score against
  const referencePath = await getReferencePath(referenceId);
  const { height, width } = await sharp(referencePath).metadata();
  const region = reference.region ?? { height, width, x: 0, y: 0 };
  // A backdrop is the reference with its interface's pieces, its region unless it names them, filled from their
  // Surroundings, so the game's interface is not drawn behind ours; one with no border to fill from keeps the reference
  // A plate's pixels come from the reference, or from the screenshot beside it that the world a screen is laid over was
  // Sampled into
  // An entry that names its plate's source has one to find, so a missing one stops the compare rather than scoring
  // Against the reference's own world
  const platePath = reference.plateSource === undefined ? referencePath : await getReferencePlatePath(referenceId);
  const plateMetadata = await sharp(platePath).metadata();
  if (plateMetadata.width !== width || plateMetadata.height !== height)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `its plate is ${plateMetadata.width}×${plateMetadata.height}, not the reference's ${width}×${height}`,
    );
  const cleanPlateRegions = getCleanPlateRegions(reference, { height, width });
  const cleanPlatePath =
    cleanPlateRegions === undefined
      ? undefined
      : await getCleanPlatePath(referenceId, platePath, cleanPlateRegions, { height, width });
  const backdropPath = reference.isBackdrop ? (cleanPlatePath ?? platePath) : undefined;
  // A recording softens what it shows, so our shot is softened by its screenshot's own measured blur before it is scored
  const softness = reference.source === undefined ? undefined : await getReferenceSoftness(referenceId);
  const [shotPath = ""] = await shootScreen({
    backdropPath,
    height,
    pageRoot,
    pointer: reference.pointer,
    props: reference.props,
    screen: reference.screen,
    variant: reference.variant,
    width,
    windowLeft: reference.windowLeft,
    witness,
  });
  const extract = { height: region.height, left: region.x, top: region.y, width: region.width };
  const referenceRegion = await sharp(referencePath).removeAlpha().extract(extract).png().toBuffer();
  const shot = sharp(shotPath).resize(width, height, { fit: "fill" }).removeAlpha();
  const shotRegion = await (softness !== undefined && softness >= MIN_BLUR_SIGMA ? shot.blur(softness) : shot)
    .extract(extract)
    .png()
    .toBuffer();
  const difference = await sharp(referenceRegion)
    .composite([{ blend: "difference", input: shotRegion }])
    .png()
    .toBuffer();
  const { data } = await sharp(difference).greyscale().raw().toBuffer({ resolveWithObject: true });
  // The reference's and our pixels, read once for the cells' colours and the under-the-curve black below
  const [referenceRgb, shotRgb] = await Promise.all([
    sharp(referenceRegion).raw().toBuffer(),
    sharp(shotRegion).raw().toBuffer(),
  ]);
  // The scored pixels are the reference's own rectangles and glyphs, its whole region when it names none, so a mask's
  // Leftover never counts
  const silhouetteInks = await readSilhouetteInks(referencePath, region, reference.silhouettes ?? []);
  const scoredMask = readScoredMask(reference, silhouetteInks, region, region.width, region.height);
  const { cells, meanDifference } = getCellReadings({
    differences: data,
    gridSize: GRID_SIZE,
    height: region.height,
    referenceRgb,
    scoredMask,
    shotRgb,
    width: region.width,
  });
  console.error(`mean difference ${meanDifference.toFixed(2)}% (0 is identical)`);
  for (let row = 0; row < GRID_SIZE; row++)
    console.error(
      cells
        .slice(row * GRID_SIZE, (row + 1) * GRID_SIZE)
        .map(({ error }) => error.toFixed(2).padStart(6))
        .join(" "),
    );
  // A scene rebuilt from shapes never matches pixel for pixel, so its shape and its light are scored apart
  const { edgeScore, toneDifference } = await scoreStructure(referenceRegion, shotRegion);
  console.error(
    `shape ${edgeScore.toFixed(3)} (edges shared, 1 is identical), tone ${toneDifference.toFixed(2)}% (blurred colour)`,
  );
  // FLIP's error map read at the structure's raster, its mean taken over the scored pixels alone
  const flipHeight = Math.round((STRUCTURE_WIDTH / region.width) * region.height);
  const { errorMap } = await readFlipErrorMap(referenceRegion, shotRegion, STRUCTURE_WIDTH, flipHeight);
  const flipMask = readScoredMask(reference, silhouetteInks, region, STRUCTURE_WIDTH, flipHeight);
  const flipTotal = errorMap.reduce((sum, error, index) => sum + error * (flipMask[index] ?? 0), 0);
  const flip =
    flipTotal /
    Math.max(
      flipMask.reduce((count, scored) => count + scored, 0),
      1,
    );
  console.error(`FLIP ${flip.toFixed(4)} (perceptual, 0 is identical)`);
  // Where the reference shows channels under the tone curve's black at none, how many of ours do
  const referenceUnderBlack = computeUnderBlackShare(referenceRgb);
  const shotUnderBlack = computeUnderBlackShare(shotRgb);
  if (referenceUnderBlack.share > 0)
    console.error(
      `under the curve's black: reference ${formatUnderBlackShare(referenceUnderBlack)}, ours ${formatUnderBlackShare(shotUnderBlack)}`,
    );
  const layerComponent = getLayerComponent(referenceId, witness);
  let layers: LayerScore[] = [];
  if (layerComponent) {
    const { gbuffer } = await readReferenceGbuffer(referenceId, layerComponent);
    layers = await scoreLayers(referenceRegion, shotRegion, gbuffer, region, { height, width });
    for (const layer of layers.toSorted((firstLayer, secondLayer) => getCeiling(secondLayer) - getCeiling(firstLayer)))
      console.error(
        `${layer.name}: ${(layer.coverage * 100).toFixed(1)}% of the frame, colour ${layer.colour.toFixed(2)} ΔE, shape ${layer.shape.toFixed(3)}, tone ${layer.tone.toFixed(2)}%, detail ${layer.detail.toFixed(2)}%, FLIP ${layer.flip.toFixed(4)}, ceiling ${getCeiling(layer).toFixed(4)}`,
      );
  }
  const panelWidth = Math.round((region.width / region.height) * COMPARISON_HEIGHT);
  const panels = await Promise.all(
    [referenceRegion, shotRegion, difference].map((input) =>
      sharp(input).resize(panelWidth, COMPARISON_HEIGHT).png().toBuffer(),
    ),
  );
  await mkdir(COMPARISONS_DIRECTORY, { recursive: true });
  const outputPath = join(COMPARISONS_DIRECTORY, `${referenceId}${witness ? ".witness" : ""}.png`);
  await sharp({ create: { background: "#000", channels: 3, height: COMPARISON_HEIGHT, width: panelWidth * 3 } })
    .composite(panels.map((input, index) => ({ input, left: index * panelWidth, top: 0 })))
    .png()
    .toFile(outputPath);
  console.error(`reference | ours | difference: ${outputPath}`);
  return { cells, score: { edgeScore, flip, layers, meanDifference, screen: reference.screen, toneDifference } };
};
