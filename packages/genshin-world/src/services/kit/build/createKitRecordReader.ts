import type { Kit } from "#src/models/kit/Kit";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStanceBehaviour } from "#src/models/kit/KitStanceBehaviour";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";
import type { createKitRecordResolver } from "#src/services/kit/build/createKitRecordResolver";

import { applyKitActionBehaviour } from "#src/services/kit/build/applyKitActionBehaviour";
import { applyKitHitBehaviour } from "#src/services/kit/build/applyKitHitBehaviour";
import { checkIsKitHitIncomplete } from "#src/services/kit/build/checkIsKitHitIncomplete";
import { checkIsKitHitShortOf } from "#src/services/kit/build/checkIsKitHitShortOf";
import { InvalidOperationError, Operation } from "@esposter/shared";

const readEntry = <T>(bag: string, bagValueMap: Record<string, T> | undefined, name: string): T => {
  const value = bagValueMap?.[name];
  if (value === undefined)
    throw new InvalidOperationError(Operation.Read, `${bag}.${name}`, "is not in its kit's record");
  return value;
};

const readOne = <T>(bag: string, bagValueMap: Record<string, T | T[]> | undefined, name: string): T => {
  const value = readEntry(bag, bagValueMap, name);
  if (Array.isArray(value)) throw new InvalidOperationError(Operation.Read, `${bag}.${name}`, "is a list");
  return value;
};

const readList = <T>(bag: string, bagValueMap: Record<string, T | T[]> | undefined, name: string): T[] => {
  const value = readEntry(bag, bagValueMap, name);
  if (!Array.isArray(value)) throw new InvalidOperationError(Operation.Read, `${bag}.${name}`, "is not a list");
  return value;
};

// A kit's record as its behaviour reads it, over the kit its slots built: each value of a bag by its name, resolved as
// The slots are, failing on a name the bag does not hold or holds in the other shape
export const createKitRecordReader = (
  record: KitRecord,
  { toAction, toHit, toHitFields, toParameter, toSeconds }: ReturnType<typeof createKitRecordResolver>,
  kit: Kit,
): KitRecordReader => {
  const buildAction = (actionRecord: KitActionRecord, behaviour: KitActionBehaviour | undefined, path: string) =>
    applyKitActionBehaviour(toAction(actionRecord), behaviour, path);
  const readStance = (name: string, behaviour: KitStanceBehaviour = {}) => {
    const path = `stances.${name}`;
    const stance = readEntry("stances", record.stances, name);
    const normalAttackBehaviours = behaviour.normalAttacks ?? [];
    if (
      (behaviour.burst && !stance.burst) ||
      (behaviour.chargedAttack && !stance.chargedAttack) ||
      (behaviour.skill && !stance.skill) ||
      normalAttackBehaviours.length > (stance.normalAttacks?.length ?? 0)
    )
      throw new InvalidOperationError(Operation.Read, path, "its behaviour names an action it plays as its kit does");
    return {
      chargedAttack: stance.chargedAttack
        ? buildAction(stance.chargedAttack, behaviour.chargedAttack, `${path}.chargedAttack`)
        : kit.chargedAttack,
      chargedAttackStamina:
        stance.chargedAttackStamina === undefined ? kit.chargedAttackStamina : toParameter(stance.chargedAttackStamina),
      elementalBurst: stance.burst ? buildAction(stance.burst, behaviour.burst, `${path}.burst`) : kit.elementalBurst,
      elementalSkill: stance.skill ? buildAction(stance.skill, behaviour.skill, `${path}.skill`) : kit.elementalSkill,
      normalAttacks:
        stance.normalAttacks?.map((actionRecord, index) =>
          buildAction(actionRecord, normalAttackBehaviours[index], `${path}.normalAttacks.${index}`),
        ) ?? kit.normalAttacks,
    };
  };
  return {
    kit,
    readAction: (name, behaviour) =>
      buildAction(readOne("actions", record.actions, name), behaviour, `actions.${name}`),
    readActions: (name, behaviour) =>
      readList("actions", record.actions, name).map((actionRecord, index) =>
        buildAction(actionRecord, behaviour, `actions.${name}.${index}`),
      ),
    readArea: (name) => readOne("areas", record.areas, name),
    readAreas: (name) => readList("areas", record.areas, name),
    readHit: (name, behaviour = {}) =>
      applyKitHitBehaviour(toHit(readOne("hits", record.hits, name)), behaviour, `hits.${name}`),
    readHitFields: (name, shortFields) => {
      const path = `hitFields.${name}`;
      const fields = toHitFields(readEntry("hitFields", record.hitFields, name));
      // No behaviour completes a hit's fields, so a bubble, a party heal or a stacked hit among them fails
      if (checkIsKitHitIncomplete(fields))
        throw new InvalidOperationError(Operation.Read, path, "holds what only a behaviour completes");
      if (!checkIsKitHitShortOf(fields, shortFields))
        throw new InvalidOperationError(Operation.Read, path, "is not a hit short of exactly what its behaviour gives");
      return fields;
    },
    readHits: (name, behaviour = {}) =>
      readList("hits", record.hits, name).map((hitRecord, index) =>
        applyKitHitBehaviour(toHit(hitRecord), behaviour, `hits.${name}.${index}`),
      ),
    readParameter: (name) => toParameter(readOne("parameters", record.parameters, name)),
    readParameters: (name) =>
      readList("parameters", record.parameters, name).map((parameter) => toParameter(parameter)),
    readSeconds: (name) => toSeconds(readOne("frames", record.frames, name)),
    readSecondsList: (name) => readList("frames", record.frames, name).map((frames) => toSeconds(frames)),
    readStance,
  };
};
