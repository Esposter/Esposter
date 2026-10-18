import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { takeOne } from "@esposter/shared";

const TRANSCENDENCE_ID = "transcendence";
const TRANSCENDENCE_COOLDOWN_SECONDS = 0.2;
const TRANSCENDENCE_MAXIMUM_STACKS = 3;

// White Fairy's Queening at its rank: its ATK line is the passive's own. Each Charged Attack the wielder lands on an opponent
// Adds a stack of Transcendence, raising its Stellar-Conduct and Stellar Swirl reaction DMG by the rank's amount for the
// Rank's seconds, once every 0.2 seconds and up to three stacks
export const createWhiteFairysQueeningPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercent = takeOne(params, 0);
  const stackAmount = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  return {
    getPassiveBonuses: () => [{ amount: attackPercent, attribute: Attribute.AttackPercent }],
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ChargedAttack
      )
        return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        cooldownSeconds: TRANSCENDENCE_COOLDOWN_SECONDS,
        id: TRANSCENDENCE_ID,
        maximumStacks: TRANSCENDENCE_MAXIMUM_STACKS,
        perStackBonuses: [{ amount: stackAmount, attribute: Attribute.StellarGlimmerReactionDamageBonus }],
        seconds,
      });
    },
  };
};
