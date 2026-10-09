import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";
import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { computeUnderBlackShare } from "#src/services/genshinParity/display/computeUnderBlackShare";
import { formatUnderBlackShare } from "#src/services/genshinParity/display/formatUnderBlackShare";
import { computeScoredMask } from "#src/services/genshinParity/reference/computeScoredMask";
import { getLayerComponent } from "#src/services/genshinParity/reference/getLayerComponent";
import { scoreLayers } from "#src/services/genshinParity/reference/scoreLayers";
import { scoreStructure } from "#src/services/genshinParity/reference/scoreStructure";
import {
  COMPARISON_HEIGHT,
  COMPARISONS_DIRECTORY,
  FRAME_LAYER,
  REFERENCES_DIRECTORY,
  STRUCTURE_WIDTH,
} from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readFlipErrorMap } from "#src/services/genshinParity/shared/readFlipErrorMap";
import { readReferenceGbuffer } from "#src/services/genshinParity/shared/readReferenceGbuffer";
import { shootScreen } from "#src/services/genshinParity/shared/shootScreen";
import { BYTE } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const GRID_SIZE = 6;
// The frame's FLIP is its pixels' mean, so a layer drawn exactly would take its share times its own FLIP off the
// Frame's: its ceiling, which ranks the layers by the most work on each could recover, largest first
const getCeiling = ({ coverage, flip, name }: LayerScore): number => (name === FRAME_LAYER ? flip : coverage * flip);
const toPercent = (sum: number, count: number): number => (sum / Math.max(count, 1) / BYTE) * 100;
// The reference, ours and their difference side by side in one image, and how far apart they are: the mean over the
// Compared region, then the same over a grid of cells, row by row, so where they differ is read without looking; the
// Scores are handed back for the committed report, FLIP's perceptual error among them. A scene's shot is scored again
// Layer by layer over the families the witness's part target gives at the reference's view, over the region its row
// Scores, so a family that moves away from the reference shows on its own row even where the frame's score barely
// Moves, and the frame's layer is the row. With a witness, the scene draws that component's exports in place of its
// Own parts and its image is kept apart from the scene's own
export const compareScreen = async (referenceId: string, witness?: DerivedAssetComponent): Promise<ParityScore> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `not one of ${Object.keys(ParityReferenceMap).join(", ")}`,
    );
  await fetchReferences();
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  // FetchReferences only logs a reference the wiki lacks, so its absence is caught here rather than inside sharp
  if (!existsSync(referencePath))
    throw new InvalidOperationError(Operation.Read, referenceId, `no reference at ${referencePath}`);
  const { height, width } = await sharp(referencePath).metadata();
  const [shotPath = ""] = await shootScreen({
    backdropPath: reference.isBackdrop ? referencePath : undefined,
    height,
    props: reference.props,
    screen: reference.screen,
    width,
    witness,
  });
  const region = reference.region ?? { height, width, x: 0, y: 0 };
  const extract = { height: region.height, left: region.x, top: region.y, width: region.width };
  const referenceRegion = await sharp(referencePath).removeAlpha().extract(extract).png().toBuffer();
  const shotRegion = await sharp(shotPath)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .extract(extract)
    .png()
    .toBuffer();
  const difference = await sharp(referenceRegion)
    .composite([{ blend: "difference", input: shotRegion }])
    .png()
    .toBuffer();
  const { data } = await sharp(difference).greyscale().raw().toBuffer({ resolveWithObject: true });
  // The scored rectangles are the reference's own, its whole region when it names none, so a mask's leftover never counts
  const scoredRegions = reference.mask ?? [region];
  const scoredMask = computeScoredMask(scoredRegions, region, region.width, region.height);
  const cellMeans = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({ count: 0, sum: 0 }));
  for (let index = 0; index < data.length; index++) {
    if (!scoredMask[index]) continue;
    const column = Math.min(GRID_SIZE - 1, Math.floor(((index % region.width) / region.width) * GRID_SIZE));
    const row = Math.min(GRID_SIZE - 1, Math.floor((Math.floor(index / region.width) / region.height) * GRID_SIZE));
    const cell = cellMeans[row * GRID_SIZE + column];
    if (!cell) continue;
    cell.sum += data[index] ?? 0;
    cell.count++;
  }
  const total = cellMeans.reduce((sum, cell) => sum + cell.sum, 0);
  const scoredCount = cellMeans.reduce((count, cell) => count + cell.count, 0);
  const meanDifference = toPercent(total, scoredCount);
  console.log(`mean difference ${meanDifference.toFixed(2)}% (0 is identical)`);
  for (let row = 0; row < GRID_SIZE; row++)
    console.log(
      cellMeans
        .slice(row * GRID_SIZE, (row + 1) * GRID_SIZE)
        .map(({ count, sum }) => toPercent(sum, count).toFixed(2).padStart(6))
        .join(" "),
    );
  // A scene rebuilt from shapes never matches pixel for pixel, so its shape and its light are scored apart
  const { edgeScore, toneDifference } = await scoreStructure(referenceRegion, shotRegion);
  console.log(
    `shape ${edgeScore.toFixed(3)} (edges shared, 1 is identical), tone ${toneDifference.toFixed(2)}% (blurred colour)`,
  );
  // FLIP's error map read at the structure's raster, its mean taken over the scored pixels alone
  const flipHeight = Math.round((STRUCTURE_WIDTH / region.width) * region.height);
  const { errorMap } = await readFlipErrorMap(referenceRegion, shotRegion, STRUCTURE_WIDTH, flipHeight);
  const flipMask = computeScoredMask(scoredRegions, region, STRUCTURE_WIDTH, flipHeight);
  const flipTotal = errorMap.reduce((sum, error, index) => sum + error * (flipMask[index] ?? 0), 0);
  const flip =
    flipTotal /
    Math.max(
      flipMask.reduce((count, scored) => count + scored, 0),
      1,
    );
  console.log(`FLIP ${flip.toFixed(4)} (perceptual, 0 is identical)`);
  // Where the reference shows channels under the tone curve's black at none, how many of ours do
  const [referenceUnderBlack, shotUnderBlack] = await Promise.all(
    [referenceRegion, shotRegion].map(async (input) => computeUnderBlackShare(await sharp(input).raw().toBuffer())),
  );
  if (referenceUnderBlack && shotUnderBlack && referenceUnderBlack.share > 0)
    console.log(
      `under the curve's black: reference ${formatUnderBlackShare(referenceUnderBlack)}, ours ${formatUnderBlackShare(shotUnderBlack)}`,
    );
  const layerComponent = getLayerComponent(referenceId, witness);
  let layers: LayerScore[] = [];
  if (layerComponent) {
    const { gbuffer } = await readReferenceGbuffer(referenceId, layerComponent);
    layers = await scoreLayers(referenceRegion, shotRegion, gbuffer, region, { height, width });
    for (const layer of layers.toSorted((firstLayer, secondLayer) => getCeiling(secondLayer) - getCeiling(firstLayer)))
      console.log(
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
  console.log(`reference | ours | difference: ${outputPath}`);
  return { edgeScore, flip, layers, meanDifference, screen: reference.screen, toneDifference };
};
