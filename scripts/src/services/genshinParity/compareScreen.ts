import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { ParityScore } from "#src/models/genshinParity/ParityScore";

import {
  COMPARISON_HEIGHT,
  COMPARISONS_DIRECTORY,
  REFERENCES_DIRECTORY,
  STRUCTURE_WIDTH,
} from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { readFlipErrorMap } from "#src/services/genshinParity/readFlipErrorMap";
import { readReferenceGbuffer } from "#src/services/genshinParity/readReferenceGbuffer";
import { scoreLayers } from "#src/services/genshinParity/scoreLayers";
import { scoreStructure } from "#src/services/genshinParity/scoreStructure";
import { shootScreen } from "#src/services/genshinParity/shootScreen";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const GRID_SIZE = 6;
const toPercent = (sum: number, count: number): number => (sum / Math.max(count, 1) / 255) * 100;
// The reference, ours and their difference side by side in one image, and how far apart they are: the mean over the
// Compared region, then the same over a grid of cells, row by row, so where they differ is read without looking; the
// Scores are handed back for the committed report, FLIP's perceptual error among them. With a witness, the scene draws
// That component's exports in place of its own parts, its image is kept apart from the scene's own, and each layer the
// Witness's part target gives is scored on its own
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
  const cellMeans = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({ count: 0, sum: 0 }));
  for (let index = 0; index < data.length; index++) {
    const column = Math.min(GRID_SIZE - 1, Math.floor(((index % region.width) / region.width) * GRID_SIZE));
    const row = Math.min(GRID_SIZE - 1, Math.floor((Math.floor(index / region.width) / region.height) * GRID_SIZE));
    const cell = cellMeans[row * GRID_SIZE + column];
    if (!cell) continue;
    cell.sum += data[index] ?? 0;
    cell.count++;
  }
  const total = cellMeans.reduce((sum, cell) => sum + cell.sum, 0);
  const meanDifference = toPercent(total, data.length);
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
  const { mean: flip } = await readFlipErrorMap(
    referenceRegion,
    shotRegion,
    STRUCTURE_WIDTH,
    Math.round((STRUCTURE_WIDTH / region.width) * region.height),
  );
  console.log(`FLIP ${flip.toFixed(4)} (perceptual, 0 is identical)`);
  if (witness) {
    const { gbuffer, image } = await readReferenceGbuffer(referenceId, witness);
    const shot = await sharp(shotPath).resize(gbuffer.width, gbuffer.height, { fit: "fill" }).png().toBuffer();
    // The frame's FLIP is its pixels' mean, so a layer drawn exactly would take its share times its own FLIP off the
    // Frame's: its ceiling, which ranks the layers by the most work on each could recover, largest first
    const layers = (await scoreLayers(image, shot, gbuffer)).map((layer) => ({
      ...layer,
      ceiling: layer.name === "frame" ? layer.flip : layer.coverage * layer.flip,
    }));
    for (const { ceiling, coverage, detail, flip: layerFlip, name, shape, tone } of layers.toSorted(
      (first, second) => second.ceiling - first.ceiling,
    ))
      console.log(
        `${name}: ${(coverage * 100).toFixed(1)}% of the frame, shape ${shape.toFixed(3)}, tone ${tone.toFixed(2)}%, detail ${detail.toFixed(2)}%, FLIP ${layerFlip.toFixed(4)}, ceiling ${ceiling.toFixed(4)}`,
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
  return { edgeScore, flip, meanDifference, screen: reference.screen, toneDifference };
};
