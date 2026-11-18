import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { takeOne } from "@esposter/shared";

const SKILL_DAMAGE_ID = "dawnAndDuskSkillDamage";
const MAX_HEALTH_ID = "dawnAndDuskMaxHealth";
const SKILL_DAMAGE_MAXIMUM_STACKS = 3;
const MAX_HEALTH_MAXIMUM_STACKS = 2;

// Dawn and Dusk by the Lake (Splendor of Tranquil Waters) at its rank: each change of the wielder's own current HP stacks its
// Elemental Skill DMG by the rank's percentage, up to three, and each change of another member's HP stacks its Max HP by the
// Rank's percentage, up to two. Each stack lasts the rank's seconds and waits out the rank's cooldown, and both count off the field
export const createDawnAndDuskByTheLakePassiveModule = (params: number[]): PassiveModule => {
  const skillDamagePerStack = takeOne(params, 0);
  const skillDamageSeconds = takeOne(params, 1);
  const skillDamageCooldownSeconds = takeOne(params, 2);
  const maxHealthPerStack = takeOne(params, 3);
  const maxHealthSeconds = takeOne(params, 4);
  const maxHealthCooldownSeconds = takeOne(params, 5);
  return {
    getStrikeDamageBonus: ({ attackTag, combatant }, _enemy, _party, effects) =>
      attackTag === AttackTag.ElementalSkill
        ? skillDamagePerStack * countKitStatusStacks(effects, combatant.characterId, SKILL_DAMAGE_ID)
        : 0,
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.HealthChanged || event.healthShare === 0) return;
      if (event.characterId === characterId)
        addPassiveStack(kitEffectState, characterId, {
          cooldownSeconds: skillDamageCooldownSeconds,
          id: SKILL_DAMAGE_ID,
          maximumStacks: SKILL_DAMAGE_MAXIMUM_STACKS,
          seconds: skillDamageSeconds,
        });
      else
        addPassiveStack(kitEffectState, characterId, {
          cooldownSeconds: maxHealthCooldownSeconds,
          id: MAX_HEALTH_ID,
          maximumStacks: MAX_HEALTH_MAXIMUM_STACKS,
          perStackBonuses: [{ amount: maxHealthPerStack, attribute: Attribute.HealthPercent }],
          seconds: maxHealthSeconds,
        });
    },
  };
};
