import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { AttackArea } from "genshin-world";

import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";

// The candidates a hit's writer gives at its key, by their field names
export const readFieldMap = (
  key: string,
  gcsim: GcsimCharacter,
  tables: KitTables,
  hit: Parameters<GcsimKitCandidateWriter["addHit"]>[1],
  targetingArea: AttackArea,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  createGcsimKitCandidateWriter(candidateMap, gcsim, tables).addHit(key, hit, targetingArea);
  // An attack gcsim gives no poise deals none, as the rule gives an action's hit that has none
  if (hit.attack !== undefined && !candidateMap.has(`${key}.poiseDamage`))
    addKitCandidate(candidateMap, `${key}.poiseDamage`, {
      provenance: { cause: KitProvisionalCause.NoPoiseSource, rule: KitRule.NoPoiseSource, source: KitSource.Rule },
      value: 0,
    });
  return new Map(
    Array.from(candidateMap, ([path, candidates]): [string, KitCandidate[]] => [
      path.slice(key.length + 1),
      candidates,
    ]),
  );
};
