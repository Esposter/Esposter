import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { checkIsReactionNamed } from "#src/services/weapon/passives/checkIsReactionNamed";
import { takeOne } from "@esposter/shared";

const BRIGHT_DAWN_STACK_ID = "brightDawnOverture";
const BRIGHT_DAWN_ENERGY_COOLDOWN_ID = "brightDawnOvertureEnergyCooldown";
const BURNING_REACTIONS = [{ reactionType: ReactionType.Burning }];
const MAXIMUM_STACKS = 2;

// Bright Dawn Overture at its rank: a Burning the wielder triggers, or a Dendro hit it deals on a Burning enemy, adds a
// Stack That raises the wielder's DMG by the rank's amount for the rank's seconds, up to two stacks. Two stacks, or the
// Second Refreshed, restore the rank's Energy at most once per the rank's cooldown in seconds. The rank's ATK is its
// Attribute line's
export const createBrightDawnOverturePassiveModule = (params: number[]): PassiveModule => {
  const damageBonusPerStack = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const energy = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  const addStack = (context: KitContext, combatant: Combatant) => {
    const { kitEffectState, party } = context;
    if (
      !addPassiveStack(kitEffectState, combatant.characterId, {
        id: BRIGHT_DAWN_STACK_ID,
        maximumStacks: MAXIMUM_STACKS,
        seconds,
      })
    )
      return;
    if (
      countKitStatusStacks(kitEffectState.effects, combatant.characterId, BRIGHT_DAWN_STACK_ID) === MAXIMUM_STACKS &&
      startKitCooldown(kitEffectState, combatant.characterId, BRIGHT_DAWN_ENERGY_COOLDOWN_ID, cooldownSeconds)
    )
      gainPartyMemberEnergy(party, combatant, energy);
  };
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      damageBonusPerStack * countKitStatusStacks(effects, strike.combatant.characterId, BRIGHT_DAWN_STACK_ID),
    onKitEvent: (event, context, combatant) => {
      if (
        (event.kind === KitEventKind.ReactionTriggered &&
          checkIsOwnReactionTriggered(event, combatant) &&
          checkIsReactionNamed(event.reactions, BURNING_REACTIONS)) ||
        (event.kind === KitEventKind.EnemyHit &&
          event.striker.characterId === combatant.characterId &&
          event.element === Element.Dendro &&
          event.enemy.burningCombatant !== undefined)
      )
        addStack(context, combatant);
    },
  };
};
