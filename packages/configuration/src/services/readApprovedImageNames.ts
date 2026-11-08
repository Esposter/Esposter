import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, extname } from "node:path";

// The approved images a screen's image stands for: the image itself, and every file that adds one segment to its
// Name, such as the per-platform `Index.win32.png` an earlier approval wrote beside `Index.png`. A variant's
// `Index-dusk.png` adds a hyphen instead, so it is another screen's image and is not read here
export const readApprovedImageNames = (screenshotPath: string): string[] => {
  const directory = dirname(screenshotPath);
  if (!existsSync(directory)) return [];

  const imageName = basename(screenshotPath);
  const extension = extname(screenshotPath);
  const stem = basename(screenshotPath, extension);

  return readdirSync(directory)
    .filter((name) => {
      if (name === imageName) return true;
      if (!name.startsWith(`${stem}.`) || !name.endsWith(extension)) return false;

      const segment = name.slice(stem.length + 1, -extension.length);
      return segment !== "" && !segment.includes(".");
    })
    .toSorted();
};
