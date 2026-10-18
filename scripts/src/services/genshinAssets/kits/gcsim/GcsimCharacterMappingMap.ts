import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { addGcsimBladeRollerCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimBladeRollerCandidates";
import { addGcsimChargedAttackVariantCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimChargedAttackVariantCandidates";
import { addGcsimCloudCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimCloudCandidates";
import { addGcsimFieryPassionCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimFieryPassionCandidates";
import { addGcsimLoopShotCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimLoopShotCandidates";
import { addGcsimMoondewCleanseCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimMoondewCleanseCandidates";
import { addGcsimShellCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimShellCandidates";

// The per-character builder mappings, by a character's gcsim folder: the values a folder holds beyond the shapes every
// Folder is read by, each written on top of them. A folder with no mapping takes the shared readers alone
export const GcsimCharacterMappingMap: Partial<
  Record<string, (writer: GcsimKitCandidateWriter, gcsim: GcsimCharacter) => void>
> = {
  chasca: addGcsimShellCandidates,
  columbina: addGcsimMoondewCleanseCandidates,
  iansan: addGcsimChargedAttackVariantCandidates,
  kinich: addGcsimLoopShotCandidates,
  mizuki: addGcsimCloudCandidates,
  varesa: addGcsimFieryPassionCandidates,
  xilonen: addGcsimBladeRollerCandidates,
};
