import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { existsSync, readFileSync } from "node:fs";

// The export lines a barrel holds, or none when the barrel is not there, as a package generating none has
export const readBarrelLines = (barrelPath: string): string[] => {
  if (!existsSync(barrelPath)) return [];
  return getNonEmptyLines(readFileSync(barrelPath, "utf8"));
};
