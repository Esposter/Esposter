import { PHASER_ROOT_DIRECTORY } from "@@/scripts/phaser/constants";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const outputFile = async (file: string, data: Parameters<typeof writeFile>[1]) => {
  const path = file ? `/${file}` : file;
  const outputPath = `${PHASER_ROOT_DIRECTORY}${path}`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, data);
};
