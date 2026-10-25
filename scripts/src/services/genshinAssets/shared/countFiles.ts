import { readdirSync } from "node:fs";

export const countFiles = (directory: string): number =>
  readdirSync(directory, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).length;
