import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { drainKitSprintNightsoulPoints } from "#src/services/kit/effects/drainKitSprintNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";

export const XILONEN_CHARACTER_ID = 10_000_103;

// Her Blessing starts with 45 points, which drain five a second, and lasts nine seconds, and a sprint in it drains five
// More points, as gcsim (MIT) xilonen/skill.go enterNightsoul and nightsoulPointReduceTask and xilonen/dash.go do
const NIGHTSOUL_POINTS = 45;
const NIGHTSOUL_DRAIN_PER_SECOND = 5;
const NIGHTSOUL_SECONDS = 9;
const NIGHTSOUL_SPRINT_DRAIN = 5;

// Removes the Blade Roller stance the Blessing entered, which ends with the Blessing however the Blessing ends
const removeBladeRollerStance = (kitEffectState: KitEffectState, characterId: number): void =>
  removeKitEffects(kitEffectState, (effect) => effect.kind === "stance" && effect.characterId === characterId);

// Leaves the Blessing and the Blade Roller stance with it, as gcsim's exit does
const exitNightsoulBlessing = (kitEffectState: KitEffectState, characterId: number): void => {
  exitKitNightsoulBlessing(kitEffectState, characterId);
  removeBladeRollerStance(kitEffectState, characterId);
};

// Xilonen's behaviour: her skill's press enters the Nightsoul Blessing, which drains its points and ends after nine
// Seconds as gcsim does, with Blade Roller in place of her normal attacks for the same nine seconds, a press in it leaves
// The Blessing, and a sprint in it drains points. Leaving the field ends the Blessing, as gcsim's swap exit does. Points
// Drained to none end the Blessing with the expiry the step sends, which ends the stance with it. Not built: the strike
// Of the press that leaves the Blessing, which gcsim's exit press does not deal and Chasca's kit leaves out through the
// Skill's state-ending check. Ocelotlicue Point's damage is read only with fewer than two Samplers in the party, which
// A kit step cannot count yet, and its heal, which it gives with two or more, is a timed heal that is not built either
// Constellation 1 needs the Blessing's point and Phlogiston cuts, which the kit does not build
// Constellation 2 needs the Geo Source Sample off the field and its party effect, which the kit does not build
// Constellation 4 needs Yohual's Scratch to grant the Blooming Blessing effect, which the kit does not build
// Constellation 6 needs the Nightsoul's Blessing extension by sprinting or attacking, which the kit does not build
export const createXilonenKitBehaviour = ({ readStance }: KitRecordReader): KitBehaviour => {
  const bladeRoller = readStance("blessing");
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId === characterId && hasKitNightsoulBlessing(kitEffectState.effects, characterId))
          exitNightsoulBlessing(kitEffectState, characterId);
      } else if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.characterId === characterId &&
        event.effect.id === NIGHTSOUL_BLESSING_STATUS_ID
      )
        removeBladeRollerStance(kitEffectState, characterId);
    },
    onSprint: (context, kitState, stepSeconds) =>
      drainKitSprintNightsoulPoints(context, kitState, stepSeconds, NIGHTSOUL_SPRINT_DRAIN),
    skill: {
      onStart: ({ activeCombatant, kitEffectState }) => {
        const { characterId } = activeCombatant;
        if (hasKitNightsoulBlessing(kitEffectState.effects, characterId))
          exitNightsoulBlessing(kitEffectState, characterId);
        else {
          enterKitNightsoulBlessing(kitEffectState, characterId, {
            nightsoulRate: { maximum: NIGHTSOUL_POINTS, perSecond: -NIGHTSOUL_DRAIN_PER_SECOND },
            points: NIGHTSOUL_POINTS,
            secondsRemaining: NIGHTSOUL_SECONDS,
          });
          enterKitStance(kitEffectState, activeCombatant, bladeRoller, NIGHTSOUL_SECONDS, { isEndedOnSwap: true });
        }
      },
    },
  };
};
