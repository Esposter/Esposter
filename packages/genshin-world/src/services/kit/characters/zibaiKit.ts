import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { isAscendantGleam } from "#src/services/kit/isAscendantGleam";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

export const ZIBAI_CHARACTER_ID = 10_000_126;
// The Phase Shift Radiance the shift accrues and Spirit Steed's Stride spends, the cooldowns that let each gain come once a
// Time, and the Strides a shift lasts for
export const PHASE_SHIFT_RADIANCE_STATUS_ID = "phase-shift-radiance";
const PHASE_SHIFT_RADIANCE_MAXIMUM = 100;
const RADIANCE_PER_SECOND = 10;
const RADIANCE_PER_NORMAL_ATTACK = 5;
const NORMAL_ATTACK_RADIANCE_STATUS_ID = "phase-shift-radiance-normal-attack";
const NORMAL_ATTACK_RADIANCE_COOLDOWN_SECONDS = 0.5;
const MOONSIGN_RADIANCE = 35;
const MOONSIGN_RADIANCE_STATUS_ID = "phase-shift-radiance-moonsign";
const MOONSIGN_RADIANCE_COOLDOWN_SECONDS = 4;
const SPIRIT_STEED_STRIDE_RADIANCE = 70;
const SPIRIT_STEED_STRIDE_COUNT_STATUS_ID = "spirit-steed-stride";
const SPIRIT_STEED_STRIDES_PER_SHIFT = 4;

// Whether Zibai's Lunar Phase Shift stands on her. Spirit Steed's Stride costs no cooldown within it.
// Radiance alone gates it, as gcsim v2.47.2 has no Zibai to read a cooldown from, and the cooldown her cast left
// Running on the party does not hold it back
const checkIsInLunarPhaseShift = ({ activeCombatant: { characterId }, kitEffectState }: KitContext): boolean =>
  findKitStance(kitEffectState.effects, characterId) !== undefined;

// Zibai's behaviour: Heaven and Earth Made Manifest enters the Lunar Phase Shift for its record's seconds, at most 15 as
// The wiki gives it, where her normal attacks and charged attack are Geo and her skill is Spirit Steed's Stride. The shift
// Accrues Phase Shift Radiance: 10 a second, 5 for a normal attack's hit once every half second, and 35 for each Lunar-
// Crystallize nearby party members trigger while Ascendant Gleam holds, once every four seconds. Spirit Steed's Stride
// Spends 70 of it, resets the cooldown on the Moonsign's Radiance, and the fourth Stride ends the shift. Her strikes outside
// The shift, her burst and her plunges are her record's alone, and her frames and areas are provisional, read from a
// Borrowed donor's gcsim hitmarks and areas.
// The fourth normal attack's extra instance of Geo DMG is the stance's second hit there, gated by Ascendant Gleam through
// Its landing condition. Not built, each waiting on its own rule: the normal attack's Radiance is read at the normal
// Attack's first hit's hitmark, not at a hit on an enemy, since no event tells the two apart
// Constellation 1 needs Heaven and Earth Made Manifest's effects, which the kit does not build
// Constellation 2 needs the Lunar Phase Shift's effects, which the kit does not build
// Constellation 4 needs the Lunar Phase Shift's effects, which the kit does not build
// Constellation 6 needs the Lunar Phase Shift's effects, which the kit does not build
export const createZibaiKitBehaviour = ({ readParameter, readStance }: KitRecordReader): KitBehaviour => {
  const lunarPhaseShiftSeconds = readParameter("lunarPhaseShiftSeconds");
  const spiritSteedStride: KitActionBehaviour = {
    canStart: ({ activeCombatant: { characterId }, kitEffectState }) =>
      countKitResource(kitEffectState.effects, characterId, PHASE_SHIFT_RADIANCE_STATUS_ID) >=
      SPIRIT_STEED_STRIDE_RADIANCE,
    onStart: ({ activeCombatant: { characterId }, kitEffectState }) => {
      gainKitResource(
        kitEffectState,
        characterId,
        PHASE_SHIFT_RADIANCE_STATUS_ID,
        -SPIRIT_STEED_STRIDE_RADIANCE,
        PHASE_SHIFT_RADIANCE_MAXIMUM,
      );
      removeKitEffects(
        kitEffectState,
        (effect) =>
          effect.kind === "status" && effect.characterId === characterId && effect.id === MOONSIGN_RADIANCE_STATUS_ID,
      );
      const strides = gainKitResource(
        kitEffectState,
        characterId,
        SPIRIT_STEED_STRIDE_COUNT_STATUS_ID,
        1,
        SPIRIT_STEED_STRIDES_PER_SHIFT,
      );
      if (strides >= SPIRIT_STEED_STRIDES_PER_SHIFT)
        removeKitEffects(kitEffectState, (effect) => effect.kind === "stance" && effect.characterId === characterId);
    },
  };
  const lunarPhaseShift = readStance("lunarPhaseShift", {
    normalAttacks: [{}, {}, {}, { hits: [{}, { landsWhen: isAscendantGleam }] }],
    skill: spiritSteedStride,
  });
  const heavenAndEarthMadeManifest: KitActionBehaviour = {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      spendKitResource(kitEffectState, combatant.characterId, SPIRIT_STEED_STRIDE_COUNT_STATUS_ID);
      enterKitStance(kitEffectState, combatant, lunarPhaseShift, lunarPhaseShiftSeconds);
    },
  };
  return {
    getSkillCooldownMultiplier: (context) => (checkIsInLunarPhaseShift(context) ? 0 : 1),
    isSkillCooldownWaived: checkIsInLunarPhaseShift,
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState } = context;
      if (!findKitStance(kitEffectState.effects, characterId)) return;
      if (event.kind === KitEventKind.NormalAttackLanded && context.activeCombatant.characterId === characterId) {
        if (
          startKitCooldown(
            kitEffectState,
            characterId,
            NORMAL_ATTACK_RADIANCE_STATUS_ID,
            NORMAL_ATTACK_RADIANCE_COOLDOWN_SECONDS,
          )
        )
          gainKitResource(
            kitEffectState,
            characterId,
            PHASE_SHIFT_RADIANCE_STATUS_ID,
            RADIANCE_PER_NORMAL_ATTACK,
            PHASE_SHIFT_RADIANCE_MAXIMUM,
          );
        return;
      }
      if (
        event.kind === KitEventKind.ReactionTriggered &&
        event.striker.characterId !== characterId &&
        event.reactions.some(({ reactionType }) => reactionType === LunarReactionType.LunarCrystallize) &&
        isAscendantGleam(context) &&
        startKitCooldown(kitEffectState, characterId, MOONSIGN_RADIANCE_STATUS_ID, MOONSIGN_RADIANCE_COOLDOWN_SECONDS)
      )
        gainKitResource(
          kitEffectState,
          characterId,
          PHASE_SHIFT_RADIANCE_STATUS_ID,
          MOONSIGN_RADIANCE,
          PHASE_SHIFT_RADIANCE_MAXIMUM,
        );
    },
    onStep: ({ kitEffectState }, { characterId }, stepSeconds) => {
      if (findKitStance(kitEffectState.effects, characterId))
        gainKitResource(
          kitEffectState,
          characterId,
          PHASE_SHIFT_RADIANCE_STATUS_ID,
          RADIANCE_PER_SECOND * stepSeconds,
          PHASE_SHIFT_RADIANCE_MAXIMUM,
        );
    },
    skill: heavenAndEarthMadeManifest,
  };
};
