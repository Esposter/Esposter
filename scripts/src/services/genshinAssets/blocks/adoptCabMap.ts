import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";

// The one-time move of a CAB map from AnimeStudio's Maps folder into the parity folder, for a machine that mapped before
// The map lived there. It moves only when the parity folder has none, so a map is never regenerated for it.
// It reports whether it moved one. It copies and then removes the old file, since a rename fails across volumes
export const adoptCabMap = (legacyPath: string, cabMapPath: string): boolean => {
  if (existsSync(cabMapPath) || !existsSync(legacyPath)) return false;
  mkdirSync(dirname(cabMapPath), { recursive: true });
  copyFileSync(legacyPath, cabMapPath);
  unlinkSync(legacyPath);
  return true;
};
