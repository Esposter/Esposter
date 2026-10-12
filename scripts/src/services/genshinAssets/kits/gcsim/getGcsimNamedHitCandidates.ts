import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { GcsimTalentTypeCombatTalentMap } from "#src/services/genshinAssets/kits/gcsim/GcsimTalentTypeCombatTalentMap";
import { SKILL_TARGETING_AREA } from "genshin-world";

// The hit each multiplier of a talent variable joins to, keyed by its proud skill group and index: the variable's one
// Attack literal's element, gauge, tag, poise and strike type, for a variable every attack of which is one literal.
// A named list's hit takes these by its multiplier, so a variable with two literals gives none
export const getGcsimNamedHitCandidates = (gcsim: GcsimCharacter, tables: KitTables): NamedHitCandidateMap => {
  const { attacks, config, talentParameterMap } = gcsim;
  const namedHitCandidateMap: NamedHitCandidateMap = new Map();
  for (const { leaves, name: variable } of config.talentVariables) {
    const [attack, ...otherAttacks] = attacks.filter(({ talentVariable }) => talentVariable === variable);
    if (attack === undefined || otherAttacks.length > 0) continue;
    for (const { reference } of leaves) {
      const parameter = talentParameterMap.get(`${reference.type}|${reference.label}`);
      const index = parameter?.indexes[reference.selector] ?? parameter?.indexes[0];
      const key = `${tables.talentGroupIdMap[GcsimTalentTypeCombatTalentMap[reference.type]]}|${index}`;
      if (index === undefined || namedHitCandidateMap.has(key)) continue;
      const candidateMap = new Map<string, KitCandidate[]>();
      createGcsimKitCandidateWriter(candidateMap, gcsim, tables).addHit(key, { attack }, SKILL_TARGETING_AREA);
      namedHitCandidateMap.set(
        key,
        new Map(
          Array.from(candidateMap, ([path, candidates]): [string, KitCandidate[]] => [
            path.slice(key.length + 1),
            candidates,
          ]),
        ),
      );
    }
  }
  return namedHitCandidateMap;
};
