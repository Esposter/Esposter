import { existsSync, mkdirSync, renameSync } from "node:fs";
import { dirname } from "node:path";

// The one-time move of a CAB map from AnimeStudio's Maps folder into the parity folder, for a machine that mapped before
// the map lived there. It moves only when the parity folder has none, so a map is never regenerated for it, and it
// Reports whether it moved one
export const adoptCabMap = (legacyPath: string, cabMapPath: string): boolean => {
  if (existsSync(cabMapPath) || !existsSync(legacyPath)) return false;
  mkdirSync(dirname(cabMapPath), { recursive: true });
  renameSync(legacyPath, cabMapPath);
  return true;
};
