import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { addGcsimChargedAttackCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimChargedAttackCandidates";
import { addGcsimFrameListCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimFrameListCandidates";
import { addGcsimNamedConstantCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimNamedConstantCandidates";
import { addGcsimNormalAttackCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimNormalAttackCandidates";
import { addGcsimPlungeCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimPlungeCandidates";
import { addGcsimSkillAndBurstCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimSkillAndBurstCandidates";
import { addGcsimSkillHoldCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimSkillHoldCandidates";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { findGcsimStanceNormalAttack } from "#src/services/genshinAssets/kits/gcsim/findGcsimStanceNormalAttack";

// Every value gcsim gives a character's kit at one ref, by its path in the record, read where gcsim's character folders
// Are regular: the normal attack's `attackHitmarks` and `attackFrames`, the charged attack's, plunges' and skill's and
// Burst's hitmark constants and frames, a projectile's hitmark as it lands after its travel, each hit's `AttackInfo`
// Fields and its talent parameter joined through the config's `talents` and the talent file's labels, and each hit's
// Area from the config's hitboxes by their names. A plunge with no file of its own, or a claymore's charged attack,
// Takes the shared rule: its frames are the ones the kits share, and a plunge borrows the fallback character's areas.
// A frames or parameters bag path the kit holds under one of the character's constants' names takes that constant
export const getGcsimKitCandidates = (
  gcsim: GcsimCharacter,
  tables: KitTables,
  plungeFallback: GcsimCharacter,
  bagPaths: ReadonlySet<string> = new Set(),
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const writer = createGcsimKitCandidateWriter(candidateMap, gcsim, tables);
  addGcsimNormalAttackCandidates(writer, gcsim);
  const stance = findGcsimStanceNormalAttack(gcsim.folder);
  if (stance !== undefined) addGcsimNormalAttackCandidates(writer, gcsim, stance);
  addGcsimChargedAttackCandidates(writer, gcsim, tables.weaponType);
  const plungeFallbackWriter = createGcsimKitCandidateWriter(
    candidateMap,
    plungeFallback,
    tables,
    KitProvisionalCause.NoActionFile,
  );
  addGcsimPlungeCandidates(writer, gcsim, plungeFallback, plungeFallbackWriter);
  addGcsimSkillAndBurstCandidates(writer, gcsim);
  addGcsimSkillHoldCandidates(writer, gcsim);
  addGcsimNamedConstantCandidates(writer, gcsim, bagPaths);
  addGcsimFrameListCandidates(writer, gcsim, bagPaths);
  return candidateMap;
};
