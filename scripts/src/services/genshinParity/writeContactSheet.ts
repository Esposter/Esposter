import { CONTACT_SHEET_CELL_WIDTH, CONTACT_SHEET_COLUMNS } from "#src/services/genshinParity/constants";
import sharp from "sharp";

const LABEL_HEIGHT = 24;
// Every frame in one image, left to right and down, each labelled with its time, so a motion is read in one look
export const writeContactSheet = async (
  framePaths: string[],
  framesPerSecond: number,
  outputPath: string,
): Promise<void> => {
  const thumbnails = await Promise.all(
    framePaths.map((path) =>
      sharp(path).resize({ width: CONTACT_SHEET_CELL_WIDTH }).png().toBuffer({ resolveWithObject: true }),
    ),
  );
  const cellHeight = (thumbnails[0]?.info.height ?? 0) + LABEL_HEIGHT;
  const rowCount = Math.ceil(thumbnails.length / CONTACT_SHEET_COLUMNS);
  const composites = thumbnails.flatMap(({ data }, index) => {
    const left = (index % CONTACT_SHEET_COLUMNS) * CONTACT_SHEET_CELL_WIDTH;
    const top = Math.floor(index / CONTACT_SHEET_COLUMNS) * cellHeight;
    const seconds = (index / framesPerSecond).toFixed(2);
    const label = Buffer.from(
      `<svg width="${CONTACT_SHEET_CELL_WIDTH}" height="${LABEL_HEIGHT}"><text x="4" y="17" font-family="monospace" font-size="16" fill="#ff0">${index + 1} · ${seconds}s</text></svg>`,
    );
    return [
      { input: data, left, top: top + LABEL_HEIGHT },
      { input: label, left, top },
    ];
  });
  await sharp({
    create: {
      background: "#000",
      channels: 3,
      height: rowCount * cellHeight,
      width: CONTACT_SHEET_COLUMNS * CONTACT_SHEET_CELL_WIDTH,
    },
  })
    .composite(composites)
    .png()
    .toFile(outputPath);
};
