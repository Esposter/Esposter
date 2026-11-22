import sharp from "sharp";

// Images of one size laid left to right on a sheet of the background given, black by default, for the eye to compare
// The sheet is written as a PNG at the path given
export const writeSideBySide = async (
  panels: readonly Buffer[],
  { background = "#000", height, width }: { background?: string; height: number; width: number },
  path: string,
): Promise<void> => {
  await sharp({ create: { background, channels: 3, height, width: width * panels.length } })
    .composite(panels.map((input, index) => ({ input, left: index * width, top: 0 })))
    .png()
    .toFile(path);
};
