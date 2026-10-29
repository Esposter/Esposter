import { BARREL_FILE } from "@esposter/configuration";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The export lines a package's barrel holds, or none when the package has no barrel, as a package generating none has
export const readBarrelLines = (sourceDirectory: string): string[] => {
  const barrelPath = join(sourceDirectory, BARREL_FILE);
  if (!existsSync(barrelPath)) return [];
  return readFileSync(barrelPath, "utf8")
    .split(/\r?\n/u)
    .filter((line) => line !== "");
};
