import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidate, NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { GcsimHitSource } from "#src/models/genshinAssets/kits/gcsim/GcsimHitSource";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { compareQueuedDelays } from "#src/services/genshinAssets/kits/compareQueuedDelays";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { GcsimTalentTypeCombatTalentMap } from "#src/services/genshinAssets/kits/gcsim/GcsimTalentTypeCombatTalentMap";
import { findQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/findQueuedAttacks";
import { joinGcsimVariableTalentArray } from "#src/services/genshinAssets/kits/gcsim/joinGcsimVariableTalentArray";
import { readGcsimQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueuedAttacks";
import { readNamedHitKey } from "#src/services/genshinAssets/kits/readNamedHitKey";
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
// Talent row, the variable's attack's element, gauge, tag, poise and strike type where the variable's one literal is every
// Attack of it, and the hitbox and damage delay of each call that queues that attack. A named list's hit takes these by
// Its multiplier, so a variable with two literals gives its fields none. A variable no talent row names keys by the one
// Parameter its multiplier array joins to by value. Each constellation given also keys the same hit at that
// Constellation, its calls read with the loop bounds the constellation gives and its multiplier naming it
export const getGcsimNamedHitCandidates = (
  gcsim: GcsimCharacter,
  tables: KitTables,
  constellations: readonly number[] = [],
): NamedHitCandidateMap => {
  const { attacks, config, queuedAttacks, talentArrayMap, talentParameterMap } = gcsim;
  const namedHitCandidateMap: NamedHitCandidateMap = new Map();
  const constellationQueuedAttacks = constellations.map((constellation) => ({
    constellation,
    queuedAttacks: readGcsimQueuedAttacks(gcsim.goSources, gcsim.constantMap, constellation),
  }));
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
    // Literals are counted by where they are declared and the loop iteration each is for, not by the attacks read from them
    const literalSites = new Set(
      variableAttacks.map(({ file, iteration, siteLine }) => JSON.stringify([file, siteLine, iteration])),
    );
    const joinedAttack = literalSites.size === 1 ? attack : undefined;
    // The calls firing any of the variable's attacks, each by the variable, since a named list's calls may fire its literals in turn.
    // A list's hits are taken in the order they land, so a call a loop makes early and one it makes late sort by their delays.
    // Each call carries the declaration its attack is made from, which a list may take the calls of several keys from
    const readAttackCalls = (calls: readonly GcsimQueuedAttack[]) =>
      calls
        .flatMap((queuedAttack) => {
          const callAttack = findQueuedAttacks(attacks, queuedAttack).find(
            (candidate) => candidate.talentVariable === variable,
          );
          return callAttack === undefined
            ? []
            : [{ ...queuedAttack, site: `${callAttack.file}:${callAttack.siteLine}` }];
        })
        .toSorted(compareQueuedDelays);
    const attackCalls = readAttackCalls(queuedAttacks);
    const constellationCalls = constellationQueuedAttacks.map(({ constellation, queuedAttacks: calls }) => ({
      calls: readAttackCalls(calls),
      constellation,
    }));
    const readNamedHit = (
      key: string,
      calls: ReturnType<typeof readAttackCalls>,
      hit: GcsimHitSource,
    ): NamedHitCandidate => ({
      fieldMap: readFieldMap(key, gcsim, tables, hit),
      queuedCalls: calls.map(({ delay, delayLine, file, hitbox, line, site }) => ({
        delay,
        fieldMap: readFieldMap(key, gcsim, tables, {
          areaHitbox: hitbox,
          hitmark: delay === undefined ? undefined : { file, line: delayLine, value: delay },
        }),
        file,
        line,
        site,
      })),
    });
    const addNamedHit = (parameter: { index: number; proudSkillGroupId: number }, talentLeaf?: GcsimTalentLeaf) => {
      const key = readNamedHitKey(parameter);
      namedHitCandidateMap.set(key, readNamedHit(key, attackCalls, { attack: joinedAttack, talentLeaf }));
      for (const { calls, constellation } of constellationCalls) {
        const constellationKey = readNamedHitKey({ ...parameter, constellation });
        namedHitCandidateMap.set(
          constellationKey,
          readNamedHit(constellationKey, calls, { attack: joinedAttack, constellation, talentLeaf }),
        );
      }
    };
    let isLabelled = false;
    for (const leaf of config.talentVariables.find(({ name }) => name === variable)?.leaves ?? []) {
      const { reference } = leaf;
      const parameter = talentParameterMap.get(`${reference.type}|${reference.label}`);
      const index = parameter?.indexes[reference.selector] ?? parameter?.indexes[0];
      if (index === undefined) continue;
      const proudSkillGroupId = tables.talentGroupIdMap[GcsimTalentTypeCombatTalentMap[reference.type]];
      if (!namedHitCandidateMap.has(readNamedHitKey({ index, proudSkillGroupId })))
        addNamedHit({ index, proudSkillGroupId }, leaf);
      // A leaf claimed by another variable's is still this variable's label, so its talent array joins none
      isLabelled = true;
    }
    const joined =
      isLabelled || joinedAttack === undefined
        ? undefined
        : joinGcsimVariableTalentArray(talentArrayMap, variable, tables);
    if (joined === undefined) continue;
    if (!namedHitCandidateMap.has(readNamedHitKey(joined.multiplier))) addNamedHit(joined.multiplier);
  }
  return namedHitCandidateMap;
};
