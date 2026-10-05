import sharp from "sharp";

// Images of one size laid left to right on a black sheet and written as a PNG at the path given, for the eye to compare
export const writeSideBySide = async (
  panels: readonly Buffer[],
  { height, width }: { height: number; width: number },
  path: string,
): Promise<void> => {
  await sharp({ create: { background: "#000", channels: 3, height, width: width * panels.length } })
    .composite(panels.map((input, index) => ({ input, left: index * width, top: 0 })))
    .png()
    .toFile(path);
};
