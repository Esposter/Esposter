import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const HUSK_STACKS_ID = "huskStacks";
const HUSK_STACK_LOSS_ID = "huskStackLoss";
const HUSK_STACK_GAIN_COOLDOWN_ID = "huskStackGainCooldown";
const HUSK_OFF_FIELD_CLOCK_ID = "huskOffFieldClock";
// The most stacks the set gives, as its text says
const MAXIMUM_STACKS = 4;

const getStacks = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, HUSK_STACKS_ID)?.stacks ?? 0;

const setStacks = (kitEffectState: KitEffectState, characterId: number, stacks: number): void => {
  addKitStatus(kitEffectState, characterId, { id: HUSK_STACKS_ID, secondsRemaining: Number.POSITIVE_INFINITY, stacks });
};

// Husk of Opulent Dreams. Its four-piece bonus gives its wearer a Curiosity stack, up to four, each raising DEF and Geo DMG by the
// Third and fourth params. A stack comes on each Geo hit the wearer lands while it is the active character, no more than once every
// First param's seconds, and on each of the second param's seconds the wearer spends off the field, counted from its swap off. A
// Stack gained restarts the fifth param's seconds, and when they run out with no gain, one stack is lost, the count running on down
// By one every such span. The two-piece bonus is attributes only
export const createHuskOfOpulentDreamsSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const cooldownSeconds = takeOne(bonus.params, 0);
  const offFieldSeconds = takeOne(bonus.params, 1);
  const defensePercentPerStack = takeOne(bonus.params, 2);
  const geoDamageBonusPerStack = takeOne(bonus.params, 3);
  const lossSeconds = takeOne(bonus.params, 4);
  // Each stack gained restarts the seconds a stack lasts without another, as gcsim's loss check does
  const gainStack = (kitEffectState: KitEffectState, characterId: number): void => {
    setStacks(
      kitEffectState,
      characterId,
      Math.min(getStacks(kitEffectState.effects, characterId) + 1, MAXIMUM_STACKS),
    );
    addKitStatus(kitEffectState, characterId, { id: HUSK_STACK_LOSS_ID, secondsRemaining: lossSeconds });
  };
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => {
      const stacks = getStacks(effects, combatant.characterId);
      if (stacks === 0) return [];
      return [
        { amount: defensePercentPerStack * stacks, attribute: Attribute.DefensePercent },
        { amount: geoDamageBonusPerStack * stacks, attribute: Attribute.GeoDamageBonus },
      ];
    },
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState, party } = context;
      const isOnField = getActiveCharacterId(party) === characterId;
      if (event.kind === KitEventKind.CharacterSwapped) {
        // A swap off the field, or a battle that opens on another character, starts the clock of the off-field stacks
        if (
          event.characterId !== characterId &&
          (event.previousCharacterId === characterId || event.previousCharacterId === undefined)
        )
          addKitStatus(kitEffectState, characterId, { id: HUSK_OFF_FIELD_CLOCK_ID, secondsRemaining: offFieldSeconds });
        return;
      }
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.characterId === characterId
      ) {
        if (event.effect.id === HUSK_STACK_LOSS_ID) {
          const stacks = Math.max(getStacks(kitEffectState.effects, characterId) - 1, 0);
          setStacks(kitEffectState, characterId, stacks);
          if (stacks > 0)
            addKitStatus(kitEffectState, characterId, { id: HUSK_STACK_LOSS_ID, secondsRemaining: lossSeconds });
        } else if (event.effect.id === HUSK_OFF_FIELD_CLOCK_ID && !isOnField) {
          gainStack(kitEffectState, characterId);
          addKitStatus(kitEffectState, characterId, { id: HUSK_OFF_FIELD_CLOCK_ID, secondsRemaining: offFieldSeconds });
        }
        return;
      }
      if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === characterId &&
        isOnField &&
        getKitHitElement(event.hit, event.striker) === Element.Geo &&
        startKitCooldown(kitEffectState, characterId, HUSK_STACK_GAIN_COOLDOWN_ID, cooldownSeconds)
      )
        gainStack(kitEffectState, characterId);
    },
  };
};
