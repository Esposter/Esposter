import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidate, NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { AttackArea } from "genshin-world";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { GcsimTalentTypeCombatTalentMap } from "#src/services/genshinAssets/kits/gcsim/GcsimTalentTypeCombatTalentMap";
import { findQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/findQueuedAttacks";
import { joinGcsimTalentArray } from "#src/services/genshinAssets/kits/gcsim/joinGcsimTalentArray";
import { CombatTalent, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "genshin-world";

// The candidates a hit's writer gives at its key, by their field names
const readFieldMap = (
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

// The hit each multiplier of a talent variable joins to, keyed by its proud skill group and index: the multiplier's own
// Talent row, the variable's attack's element, gauge, tag and poise where the variable's one literal is every
// Attack of it, and the hitbox and damage delay of each call that queues that attack. A named list's hit takes these by
// Its multiplier, so a variable with two literals gives its fields none. A variable no talent row names keys by the one
// Parameter its multiplier array joins to by value
export const getGcsimNamedHitCandidates = (gcsim: GcsimCharacter, tables: KitTables): NamedHitCandidateMap => {
  const { attacks, config, queuedAttacks, talentArrayMap, talentParameterMap } = gcsim;
  const namedHitCandidateMap: NamedHitCandidateMap = new Map();
  const variables = new Set(
    [...config.talentVariables.map(({ name }) => name), ...attacks.map(({ talentVariable }) => talentVariable)].filter(
      (variable): variable is string => variable !== undefined,
    ),
  );
  for (const variable of variables) {
    const variableAttacks = attacks.filter(({ talentVariable }) => talentVariable === variable);
    if (variableAttacks.length === 0) continue;
    const [attack] = variableAttacks;
    // Gcsim reassigns a literal's Mult in a closure, which reads as a second attack at the literal's own declaration, so the
    // Literals are counted by where they are declared, not by the attacks read from them
    const literalSites = new Set(variableAttacks.map(({ file, siteLine }) => `${file}:${siteLine}`));
    const joinedAttack = literalSites.size === 1 ? attack : undefined;
    // The calls firing any of the variable's attacks, each by the variable, since a named list's calls may fire its literals in turn.
    // A list's hits are taken in the order they land, so a call a loop makes early and one it makes late sort by their delays.
    // Each call carries the declaration its attack is made from, which a list may take the calls of several keys from
    const attackCalls = queuedAttacks
      .flatMap((queuedAttack) => {
        const callAttack = findQueuedAttacks(attacks, queuedAttack).find(
          (candidate) => candidate.talentVariable === variable,
        );
        return callAttack === undefined ? [] : [{ ...queuedAttack, site: `${callAttack.file}:${callAttack.siteLine}` }];
      })
      .toSorted((left, right) => (left.delay ?? Number.MAX_SAFE_INTEGER) - (right.delay ?? Number.MAX_SAFE_INTEGER));
    const addNamedHit = (proudSkillGroupId: number, index: number, talentLeaf?: GcsimTalentLeaf) => {
      const key = `${proudSkillGroupId}|${index}`;
      // The zone a hit's talent targets within, as its action's does: the strikes' for a normal attack's group, which a
      // Charged attack and a plunge belong to, and the skill's for a skill's or a burst's
      const targetingArea =
        proudSkillGroupId === tables.talentGroupIdMap[CombatTalent.NormalAttack]
          ? STRIKE_TARGETING_AREA
          : SKILL_TARGETING_AREA;
      const namedHitCandidate: NamedHitCandidate = {
        fieldMap: readFieldMap(key, gcsim, tables, { attack: joinedAttack, talentLeaf }, targetingArea),
        queuedCalls: attackCalls.map(({ delay, delayLine, file, hitbox, line, site }) => ({
          delay,
          fieldMap: readFieldMap(
            key,
            gcsim,
            tables,
            { areaHitbox: hitbox, hitmark: delay === undefined ? undefined : { file, line: delayLine, value: delay } },
            targetingArea,
          ),
          file,
          line,
          site,
        })),
      };
      namedHitCandidateMap.set(key, namedHitCandidate);
    };
    let isLabelled = false;
    for (const leaf of config.talentVariables.find(({ name }) => name === variable)?.leaves ?? []) {
      const { reference } = leaf;
      const parameter = talentParameterMap.get(`${reference.type}|${reference.label}`);
      const index = parameter?.indexes[reference.selector] ?? parameter?.indexes[0];
      const proudSkillGroupId = tables.talentGroupIdMap[GcsimTalentTypeCombatTalentMap[reference.type]];
      if (index === undefined || namedHitCandidateMap.has(`${proudSkillGroupId}|${index}`)) continue;
      addNamedHit(proudSkillGroupId, index, leaf);
      isLabelled = true;
    }
    const talentArray = talentArrayMap.get(variable);
    const joined =
      talentArray === undefined || isLabelled || joinedAttack === undefined
        ? undefined
        : joinGcsimTalentArray(talentArray, tables.talentMultiplierMap, Object.values(tables.talentGroupIdMap));
    if (joined === undefined) continue;
    if (!namedHitCandidateMap.has(`${joined.proudSkillGroupId}|${joined.index}`))
      addNamedHit(joined.proudSkillGroupId, joined.index);
  }
  return namedHitCandidateMap;
};
