import { COMPARISON_HEIGHT, COMPARISONS_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { shootScreen } from "#src/services/genshinParity/shootScreen";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const GRID_SIZE = 6;
const toPercent = (sum: number, count: number): string => ((sum / Math.max(count, 1) / 255) * 100).toFixed(2);
// The reference, ours and their difference side by side in one image, and how far apart they are: the mean over the
// Compared region, then the same over a grid of cells, row by row, so where they differ is read without looking
export const compareScreen = async (referenceId: string): Promise<void> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `not one of ${Object.keys(ParityReferenceMap).join(", ")}`,
    );
  await fetchReferences();
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  const { height, width } = await sharp(referencePath).metadata();
  const [shotPath = ""] = await shootScreen(reference.screen, width, height, []);
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
  console.log(`mean difference ${toPercent(total, data.length)}% (0 is identical)`);
  for (let row = 0; row < GRID_SIZE; row++)
    console.log(
      cellMeans
        .slice(row * GRID_SIZE, (row + 1) * GRID_SIZE)
        .map(({ count, sum }) => toPercent(sum, count).padStart(6))
        .join(" "),
    );
  const panelWidth = Math.round((region.width / region.height) * COMPARISON_HEIGHT);
  const panels = await Promise.all(
    [referenceRegion, shotRegion, difference].map((input) =>
      sharp(input).resize(panelWidth, COMPARISON_HEIGHT).png().toBuffer(),
    ),
  );
  await mkdir(COMPARISONS_DIRECTORY, { recursive: true });
  const outputPath = join(COMPARISONS_DIRECTORY, `${referenceId}.png`);
  await sharp({ create: { background: "#000", channels: 3, height: COMPARISON_HEIGHT, width: panelWidth * 3 } })
    .composite(panels.map((input, index) => ({ input, left: index * panelWidth, top: 0 })))
    .png()
    .toFile(outputPath);
  console.log(`reference | ours | difference: ${outputPath}`);
};
