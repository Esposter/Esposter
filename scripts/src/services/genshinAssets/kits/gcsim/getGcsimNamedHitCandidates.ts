import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { GcsimTalentTypeCombatTalentMap } from "#src/services/genshinAssets/kits/gcsim/GcsimTalentTypeCombatTalentMap";
import { SKILL_TARGETING_AREA } from "genshin-world";

// The hit each multiplier of a talent variable joins to, keyed by its proud skill group and index: the multiplier's own
// Talent row, and the variable's attack's element, gauge, tag, poise and strike type where the variable's one literal is
// Every attack of it. A named list's hit takes these by its multiplier, so a variable with two literals gives its fields none
export const getGcsimNamedHitCandidates = (gcsim: GcsimCharacter, tables: KitTables): NamedHitCandidateMap => {
  const { attacks, config, talentParameterMap } = gcsim;
  const namedHitCandidateMap: NamedHitCandidateMap = new Map();
  for (const { leaves, name: variable } of config.talentVariables) {
    const variableAttacks = attacks.filter(({ talentVariable }) => talentVariable === variable);
    if (variableAttacks.length === 0) continue;
    const [attack] = variableAttacks;
    const joinedAttack = variableAttacks.length === 1 ? attack : undefined;
    for (const leaf of leaves) {
      const { reference } = leaf;
      const parameter = talentParameterMap.get(`${reference.type}|${reference.label}`);
      const index = parameter?.indexes[reference.selector] ?? parameter?.indexes[0];
      const key = `${tables.talentGroupIdMap[GcsimTalentTypeCombatTalentMap[reference.type]]}|${index}`;
      if (index === undefined || namedHitCandidateMap.has(key)) continue;
      const candidateMap = new Map<string, KitCandidate[]>();
      createGcsimKitCandidateWriter(candidateMap, gcsim, tables).addHit(
        key,
        { attack: joinedAttack, talentLeaf: leaf },
        SKILL_TARGETING_AREA,
      );
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
