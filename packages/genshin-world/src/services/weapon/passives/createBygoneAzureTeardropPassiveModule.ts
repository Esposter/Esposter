import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const AZURE_TEARDROP_RISE_ID = "azureTeardropRise";
const AZURE_TEARDROP_RISE_CLOCK_ID = "azureTeardropRiseClock";
const AZURE_TEARDROP_HIT_COOLDOWN_ID = "azureTeardropHitCooldown";
// The rise ticks once a second, each tick adding the rank's seconds units
const TICK_SECONDS = 1;

const countRiseUnits = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, AZURE_TEARDROP_RISE_ID)?.stacks ?? 0;

// Adds units to the rise while it stands, up to the rank's maximum
const addRiseUnits = (
  kitEffectState: KitEffectState,
  characterId: number,
  units: number,
  maximumUnits: number,
): void => {
  const rise = findKitStatus(kitEffectState.effects, characterId, AZURE_TEARDROP_RISE_ID);
  if (rise) rise.stacks = Math.min(maximumUnits, (rise.stacks ?? 0) + units);
};

// Bygone Azure Teardrop at its rank: the wielder's Normal Attack SPD rises by the rank's first share. After her Elemental Skill,
// Her Normal Attack DMG rises by the rank's unit a second for the rank's seconds, and each Normal Attack hit she lands while it
// Stands adds the rank's hit units, once every cooldown. The rise's total is at most the rank's maximum units, and it ends when she
// Leaves the field. Another Elemental Skill restarts it
export const createBygoneAzureTeardropPassiveModule = (params: number[]): PassiveModule => {
  const normalAttackSpeed = takeOne(params, 0);
  const damagePerUnit = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const secondUnits = takeOne(params, 3);
  const hitUnits = takeOne(params, 4);
  const hitCooldownSeconds = takeOne(params, 5);
  const maximumUnits = takeOne(params, 6);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => {
      const units = countRiseUnits(effects, characterId);
      return [
        { amount: normalAttackSpeed, attribute: Attribute.NormalAttackSpeed },
        ...(units === 0 ? [] : [{ amount: units * damagePerUnit, attribute: Attribute.NormalAttackDamageBonus }]),
      ];
    },
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind === KitEventKind.SkillUsed && event.characterId === characterId) {
        addKitStatus(kitEffectState, characterId, { id: AZURE_TEARDROP_RISE_ID, secondsRemaining: seconds });
        castKitField(
          kitEffectState,
          characterId,
          { x: 0, z: 0 },
          {
            id: AZURE_TEARDROP_RISE_CLOCK_ID,
            nextTickSeconds: TICK_SECONDS,
            onTick: ({ kitEffectState: tickKitEffectState }) => {
              addRiseUnits(tickKitEffectState, characterId, secondUnits, maximumUnits);
            },
            secondsRemaining: seconds,
            tickIntervalSeconds: TICK_SECONDS,
          },
        );
        return;
      }
      if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.NormalAttack &&
        checkIsKitStatusActive(kitEffectState.effects, characterId, AZURE_TEARDROP_RISE_ID) &&
        startKitCooldown(kitEffectState, characterId, AZURE_TEARDROP_HIT_COOLDOWN_ID, hitCooldownSeconds)
      )
        addRiseUnits(kitEffectState, characterId, hitUnits, maximumUnits);
    },
    onStep: ({ activeCombatant, kitEffectState }, { characterId }) => {
      if (activeCombatant.characterId === characterId) return;
      removeKitEffects(
        kitEffectState,
        (effect) =>
          effect.kind === "status" && effect.characterId === characterId && effect.id === AZURE_TEARDROP_RISE_ID,
      );
    },
  };
};
