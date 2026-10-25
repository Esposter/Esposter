import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";

export const readNames = (directory: string): Promise<string[]> =>
  existsSync(directory) ? readdir(directory) : Promise.resolve([]);
