import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidate, NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { GcsimTalentTypeCombatTalentMap } from "#src/services/genshinAssets/kits/gcsim/GcsimTalentTypeCombatTalentMap";
import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";
import { SKILL_TARGETING_AREA } from "genshin-world";

// The candidates a hit's writer gives at its key, by their field names
const readFieldMap = (
  key: string,
  gcsim: GcsimCharacter,
  tables: KitTables,
  hit: Parameters<GcsimKitCandidateWriter["addHit"]>[1],
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  createGcsimKitCandidateWriter(candidateMap, gcsim, tables).addHit(key, hit, SKILL_TARGETING_AREA);
  return new Map(
    Array.from(candidateMap, ([path, candidates]): [string, KitCandidate[]] => [
      path.slice(key.length + 1),
      candidates,
    ]),
  );
};

// The hit each multiplier of a talent variable joins to, keyed by its proud skill group and index: the multiplier's own
// Talent row, the variable's attack's element, gauge, tag, poise and strike type where the variable's one literal is every
// Attack of it, and the hitbox and damage delay of each call that queues that attack. A named list's hit takes these by
// Its multiplier, so a variable with two literals gives its fields none
export const getGcsimNamedHitCandidates = (gcsim: GcsimCharacter, tables: KitTables): NamedHitCandidateMap => {
  const { attacks, config, queuedAttacks, talentParameterMap } = gcsim;
  const namedHitCandidateMap: NamedHitCandidateMap = new Map();
  for (const { leaves, name: variable } of config.talentVariables) {
    const variableAttacks = attacks.filter(({ talentVariable }) => talentVariable === variable);
    if (variableAttacks.length === 0) continue;
    const [attack] = variableAttacks;
    const joinedAttack = variableAttacks.length === 1 ? attack : undefined;
    // The calls firing any of the variable's attacks, each by the variable, since a named list's calls may fire its literals in turn.
    // A list's hits are taken in the order they land, so a call a loop makes early and one it makes late sort by their delays
    const attackCalls = queuedAttacks
      .filter((queuedAttack) => findQueuedAttack(attacks, queuedAttack)?.talentVariable === variable)
      .toSorted((left, right) => (left.delay ?? Number.MAX_SAFE_INTEGER) - (right.delay ?? Number.MAX_SAFE_INTEGER));
    for (const leaf of leaves) {
      const { reference } = leaf;
      const parameter = talentParameterMap.get(`${reference.type}|${reference.label}`);
      const index = parameter?.indexes[reference.selector] ?? parameter?.indexes[0];
      const key = `${tables.talentGroupIdMap[GcsimTalentTypeCombatTalentMap[reference.type]]}|${index}`;
      if (index === undefined || namedHitCandidateMap.has(key)) continue;
      const namedHitCandidate: NamedHitCandidate = {
        fieldMap: readFieldMap(key, gcsim, tables, { attack: joinedAttack, talentLeaf: leaf }),
        queuedFieldMaps: attackCalls.map(({ delay, delayLine, file, hitbox }) =>
          readFieldMap(key, gcsim, tables, {
            areaHitbox: hitbox,
            hitmark: delay === undefined ? undefined : { file, line: delayLine, value: delay },
          }),
        ),
      };
      namedHitCandidateMap.set(key, namedHitCandidate);
    }
  }
  return namedHitCandidateMap;
};
