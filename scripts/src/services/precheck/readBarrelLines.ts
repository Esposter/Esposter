import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { BARREL_FILE } from "@esposter/configuration";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The export lines a package's barrel holds, or none when the package has no barrel, as a package generating none has
export const readBarrelLines = (sourceDirectory: string): string[] => {
  const barrelPath = join(sourceDirectory, BARREL_FILE);
  if (!existsSync(barrelPath)) return [];
  return getNonEmptyLines(readFileSync(barrelPath, "utf8"));
};
