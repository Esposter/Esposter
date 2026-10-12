import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const outputFile = async (rootDirectory: string, file: string, data: Parameters<typeof writeFile>[1]) => {
  const path = file ? `/${file}` : file;
  const outputPath = `${rootDirectory}${path}`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, data);
};
