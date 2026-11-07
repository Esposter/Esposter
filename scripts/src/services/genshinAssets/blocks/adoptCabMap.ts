import type { ProvenanceTool } from "#src/models/provenance/ProvenanceOptions";

import { checkIsVouchedBy } from "#src/services/provenance/checkIsVouchedBy";
import { copyFileProvenance } from "#src/services/provenance/copyFileProvenance";
import { getFileSha256 } from "#src/services/provenance/getFileSha256";
import { readFileProvenance } from "#src/services/provenance/readFileProvenance";
import { removeFileProvenance } from "#src/services/provenance/removeFileProvenance";
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";

// The one-time move of a CAB map from AnimeStudio's Maps folder into the parity folder, for a machine that mapped before
// The map lived there. It moves only when the parity folder has none, and only a map whose stamp beside it names the
// Install's game version and the tool's binary, so a map no stamp vouches for is mapped again rather than adopted.
// It reports whether it moved one. It copies and then removes the old file, since a rename fails across volumes
export const adoptCabMap = async (
  legacyPath: string,
  cabMapPath: string,
  gameVersion: string,
  tool: ProvenanceTool,
): Promise<boolean> => {
  if (existsSync(cabMapPath) || !existsSync(legacyPath)) return false;
  const provenance = await readFileProvenance(legacyPath);
  if (!checkIsVouchedBy(provenance, gameVersion)) return false;
  const sha256 = await getFileSha256(tool.path);
  if (!provenance?.tools.some(({ name, sha256: digest }) => name === tool.name && digest === sha256)) return false;
  mkdirSync(dirname(cabMapPath), { recursive: true });
  copyFileSync(legacyPath, cabMapPath);
  await copyFileProvenance(legacyPath, cabMapPath);
  await removeFileProvenance([legacyPath]);
  unlinkSync(legacyPath);
  return true;
};
