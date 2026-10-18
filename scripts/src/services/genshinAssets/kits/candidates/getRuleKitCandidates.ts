import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { KIT_LENGTH_KEY, UNMEASURED_HOLD_SECONDS } from "#src/services/genshinAssets/kits/constants";
import { Element, KitPlunge, KitTargeting } from "genshin-world";

// The values the builder's rules give a kit's record, by their paths, over the actions and hits its sources and overlay
// Already give it: each action's targeting zone by its slot, a hit's poise where no source gives one, no hold, a hold's
// Threshold and the collision's hitmark. A rule is the last candidate for its path, so it holds only where no source
// Does
// Every stance's normal attacks, whichever stance a kit names, by the length its normal attacks carry
const STANCE_NORMAL_ATTACKS_LENGTH_REGEX = /^(?<actionsPath>stances\.[^.]+\.normalAttacks)\.length$/u;
// The stance a path names, read from the path's first two segments
const STANCE_PATH_REGEX = /^(?<stance>stances\.[^.]+)\./u;

export const getRuleKitCandidates = (
  valueMap: ReadonlyMap<string, unknown>,
  element: Element | undefined,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const add = (path: string, value: unknown, rule: KitRule, cause?: KitProvisionalCause) =>
    addKitCandidate(candidateMap, path, {
      provenance: { ...(cause && { cause }), rule, source: KitSource.Rule },
      value,
    });
  const readLength = (path: string) => {
    const length = valueMap.get(`${path}.${KIT_LENGTH_KEY}`);
    return typeof length === "number" ? length : 0;
  };
  const nodePaths = [...valueMap].flatMap(([path, value]) => (value === undefined ? [] : [path]));
  const checkHasNode = (path: string) => nodePaths.some((nodePath) => nodePath.startsWith(`${path}.`));
  const stanceNormalAttackPaths = [...valueMap.keys()].flatMap((path) => {
    const actionsPath = STANCE_NORMAL_ATTACKS_LENGTH_REGEX.exec(path)?.groups?.actionsPath;
    return actionsPath === undefined
      ? []
      : Array.from({ length: readLength(actionsPath) }, (_value, index) => `${actionsPath}.${index}`);
  });
  const stanceSkillPaths = [
    ...new Set(nodePaths.flatMap((path) => STANCE_PATH_REGEX.exec(path)?.groups?.stance ?? [])),
  ].map((stance) => `${stance}.skill`);
  const actionTargetingEntries: [string, KitTargeting][] = [
    ...Array.from({ length: readLength("normalAttacks") }, (_value, index): [string, KitTargeting] => [
      `normalAttacks.${index}`,
      KitTargeting.Strike,
    ]),
    ...stanceNormalAttackPaths.map((path): [string, KitTargeting] => [path, KitTargeting.Strike]),
    ...stanceSkillPaths.map((path): [string, KitTargeting] => [path, KitTargeting.Skill]),
    ["chargedAttack", KitTargeting.Strike],
    [`plunges.${KitPlunge.Low}`, KitTargeting.Strike],
    [`plunges.${KitPlunge.High}`, KitTargeting.Strike],
    ["skill", KitTargeting.Skill],
    ["burst", KitTargeting.Skill],
    ...Array.from({ length: readLength("skillHolds") }, (_value, index): [string, KitTargeting][] => [
      [`skillHolds.${index}.action`, KitTargeting.Skill],
      [`skillHolds.${index}.variant`, KitTargeting.Skill],
    ]).flat(),
    ["burstVariant", KitTargeting.Skill],
    ...Array.from({ length: readLength("skillChain.followUps") }, (_value, index): [string, KitTargeting] => [
      `skillChain.followUps.${index}`,
      KitTargeting.Skill,
    ]),
  ];
  for (const [path, targeting] of actionTargetingEntries) {
    if (!checkHasNode(path)) continue;
    add(`${path}.targeting`, targeting, KitRule.Targeting);
    for (let hitIndex = 0; hitIndex < readLength(`${path}.hits`); hitIndex++)
      add(`${path}.hits.${hitIndex}.poiseDamage`, 0, KitRule.NoPoiseSource, KitProvisionalCause.NoPoiseSource);
  }
  add("plungeCollision.poiseDamage", 0, KitRule.NoPoiseSource, KitProvisionalCause.NoPoiseSource);
  add(`skillHolds.${KIT_LENGTH_KEY}`, 0, KitRule.NoHold);
  add("plungeCollision.hitmarkFrames", 0, KitRule.CollisionHitmark);
  if (readLength("burst.hits") > 0 && element !== undefined)
    add("burst.hits.0.element", element, KitRule.EnergyElement);
  for (let holdIndex = 0; holdIndex < readLength("skillHolds"); holdIndex++)
    add(
      `skillHolds.${holdIndex}.minimumHeldSeconds`,
      UNMEASURED_HOLD_SECONDS,
      KitRule.UnmeasuredHold,
      KitProvisionalCause.UnmeasuredHold,
    );
  return candidateMap;
};
