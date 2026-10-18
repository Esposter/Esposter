import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { addGcsimBladeRollerCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimBladeRollerCandidates";
import { addGcsimFieryPassionCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimFieryPassionCandidates";

// The per-character builder mappings, by a character's gcsim folder: the values a folder holds beyond the shapes every
// Folder is read by, each written on top of them. A folder with no mapping takes the shared readers alone
export const GcsimCharacterMappingMap: Partial<
  Record<string, (writer: GcsimKitCandidateWriter, gcsim: GcsimCharacter) => void>
> = { varesa: addGcsimFieryPassionCandidates, xilonen: addGcsimBladeRollerCandidates };
