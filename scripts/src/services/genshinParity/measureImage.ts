import { parseNumbers } from "#src/services/shared/parseNumbers";
import sharp from "sharp";

// An image's size, then the colour under each `x,y`, one `x,y #rrggbb` a line, read off the file rather than guessed
// From a look
export const measureImage = async (path: string, points: string[]): Promise<void> => {
  const { data, info } = await sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  console.log(`${info.width}x${info.height}`);
  for (const point of points) {
    const [x = 0, y = 0] = parseNumbers(point, "point", 2);
    const offset = (y * info.width + x) * info.channels;
    const hex = [0, 1, 2].map((channel) => (data[offset + channel] ?? 0).toString(16).padStart(2, "0")).join("");
    console.log(`${x},${y} #${hex}`);
  }
};
