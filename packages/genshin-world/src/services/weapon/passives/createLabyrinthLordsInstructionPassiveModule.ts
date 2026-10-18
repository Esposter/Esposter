import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHitbox } from "#src/models/kit/KitHitbox";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { selectNearestEnemy } from "#src/services/kit/selectNearestEnemy";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const TEACHINGS_OF_THE_FOREST_ID = "teachingsOfTheForest";
const TEACHINGS_OF_THE_FOREST_COOLDOWN_ID = "teachingsOfTheForestCooldown";
// The reach about the member on the field within which its hit finds the nearest enemy, as gcsim's 15-metre circle on
// The player does
const TEACHINGS_OF_THE_FOREST_REACH = 15;
// The circle its hit strikes about that enemy, as gcsim's 1.6-metre circle on its target does
const TEACHINGS_OF_THE_FOREST_HITBOX: KitHitbox = { offset: { x: 0, z: 0 }, shape: { kind: "circle", radius: 1.6 } };

// Labyrinth Lord's Instruction (King's Squire) at its rank: the wielder's Elemental Skill or Burst gives it Teachings
// Of the Forest for the rank's seconds, once every rank's cooldown, raising its Elemental Mastery by the rank's amount.
// Its leaving the field ends the effect, and as the effect ends or runs out the wielder deals a Physical hit at the
// Rank's multiplier of ATK about the enemy nearest the member on the field within 15 metres, as gcsim's triggerAttack
// Does on its swap and its timer alike
export const createLabyrinthLordsInstructionPassiveModule = (params: number[]): PassiveModule => {
  const elementalMastery = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const talentMultiplier = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  const strikeNearestEnemy = (context: KitContext, combatant: Combatant): void => {
    const enemy = selectNearestEnemy(context.body.position, context.enemyMap.values(), TEACHINGS_OF_THE_FOREST_REACH);
    if (enemy === undefined) return;
    queueKitPassiveHit(
      context,
      combatant,
      { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier },
      enemy,
      TEACHINGS_OF_THE_FOREST_HITBOX,
    );
  };
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) =>
      checkIsKitStatusActive(effects, characterId, TEACHINGS_OF_THE_FOREST_ID)
        ? [{ amount: elementalMastery, attribute: Attribute.ElementalMastery }]
        : [],
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (effect.kind === "status" && effect.characterId === characterId && effect.id === TEACHINGS_OF_THE_FOREST_ID)
          strikeNearestEnemy(context, combatant);
        return;
      }
      if (
        (event.kind !== KitEventKind.SkillUsed && event.kind !== KitEventKind.BurstUsed) ||
        event.characterId !== characterId ||
        !startKitCooldown(context.kitEffectState, characterId, TEACHINGS_OF_THE_FOREST_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      addKitStatus(context.kitEffectState, characterId, {
        id: TEACHINGS_OF_THE_FOREST_ID,
        isEndedOnSwap: true,
        secondsRemaining: seconds,
      });
    },
  };
};
