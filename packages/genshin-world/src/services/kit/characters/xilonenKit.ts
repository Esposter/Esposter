import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { drainKitSprintNightsoulPoints } from "#src/services/kit/effects/drainKitSprintNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getKitDefense } from "#src/services/kit/effects/getKitDefense";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

export const XILONEN_CHARACTER_ID = 10_000_103;

// Her Blessing starts with 45 points, which drain five a second, and lasts nine seconds, and a sprint in it drains five
// More points, as gcsim (MIT) xilonen/skill.go enterNightsoul and nightsoulPointReduceTask and xilonen/dash.go do
const NIGHTSOUL_POINTS = 45;
const NIGHTSOUL_DRAIN_PER_SECOND = 5;
const NIGHTSOUL_SECONDS = 9;
const NIGHTSOUL_SPRINT_DRAIN = 5;
// Constellation 1, as gcsim (MIT) xilonen/cons.go gives it: the Blessing lasts 45% longer, and its points drain 30% less
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xilonen/cons.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_NIGHTSOUL_DURATION_MULTIPLIER = 1.45;
const CONSTELLATION_1_NIGHTSOUL_CONSUMPTION_MULTIPLIER = 0.7;
// Constellation 4, as gcsim gives it: from her skill, each deployed member's Normal Attacks, Charged Attacks and Plunges
// That hit an enemy add 65% of Xilonen's DEF as flat damage, six times, for 15 seconds
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_DEFENSE_SHARE = 0.65;
const CONSTELLATION_4_SECONDS = 15;
const CONSTELLATION_4_STACKS = 6;
const CONSTELLATION_4_STATUS_ID = "xilonen-constellation-4";
const CONSTELLATION_4_ATTACK_TAGS = new Set<AttackTag>([
  AttackTag.ChargedAttack,
  AttackTag.NormalAttack,
  AttackTag.PlungingAttack,
]);

// Removes the Blade Roller stance the Blessing entered, which ends with the Blessing however the Blessing ends
const removeBladeRollerStance = (kitEffectState: KitEffectState, characterId: number): void => {
  removeKitEffects(kitEffectState, (effect) => effect.kind === "stance" && effect.characterId === characterId);
};

// Leaves the Blessing and the Blade Roller stance with it, as gcsim's exit does
const exitNightsoulBlessing = (kitEffectState: KitEffectState, characterId: number): void => {
  exitKitNightsoulBlessing(kitEffectState, characterId);
  removeBladeRollerStance(kitEffectState, characterId);
};

// The seconds the Blessing lasts, which Constellation 1 lengthens
const getNightsoulSeconds = ({ constellationCount }: Combatant): number =>
  constellationCount >= CONSTELLATION_1
    ? NIGHTSOUL_SECONDS * CONSTELLATION_1_NIGHTSOUL_DURATION_MULTIPLIER
    : NIGHTSOUL_SECONDS;

// The factor the Blessing's points drain is multiplied by, which Constellation 1 cuts
const getNightsoulConsumptionMultiplier = ({ constellationCount }: Combatant): number =>
  constellationCount >= CONSTELLATION_1 ? CONSTELLATION_1_NIGHTSOUL_CONSUMPTION_MULTIPLIER : 1;

// Whether a character holds Constellation 4's stacks, one of which its strike spends
const checkIsConstellation4Standing = (effects: readonly KitEffect[], characterId: number): boolean =>
  checkIsKitStatusActive(effects, characterId, CONSTELLATION_4_STATUS_ID) &&
  countKitResource(effects, characterId, CONSTELLATION_4_STATUS_ID) > 0;

// Whether a strike is one Constellation 4 counts, by the attack it is and a striker who holds a stack
const checkIsConstellation4Strike = (
  attackTag: AttackTag | undefined,
  characterId: number,
  effects: readonly KitEffect[],
): boolean =>
  attackTag !== undefined &&
  CONSTELLATION_4_ATTACK_TAGS.has(attackTag) &&
  checkIsConstellation4Standing(effects, characterId);

// Spends one of a character's Constellation 4 stacks, as gcsim spends one on each enemy hit that strike lands
const spendConstellation4Stack = (effects: readonly KitEffect[], characterId: number): void => {
  const status = findKitStatus(effects, characterId, CONSTELLATION_4_STATUS_ID);
  if (status) status.stacks = countKitResource(effects, characterId, CONSTELLATION_4_STATUS_ID) - 1;
};

// Xilonen's behaviour: her skill's press enters the Nightsoul Blessing, which drains its points and ends after nine
// Seconds as gcsim does, with Blade Roller in place of her normal attacks for the same nine seconds, a press in it leaves
// The Blessing, and a sprint in it drains points. Leaving the field ends the Blessing, as gcsim's swap exit does. Points
// Drained to none end the Blessing with the expiry the step sends, which ends the stance with it. Not built: the strike
// Of the press that leaves the Blessing, which gcsim's exit press does not deal and Chasca's kit leaves out through the
// Skill's state-ending check. Ocelotlicue Point's damage is read only with fewer than two Samplers in the party, which
// A kit step cannot count yet, and its heal, which it gives with two or more, is a timed heal that is not built either
// Constellation 1 lengthens the Blessing and cuts its points' drain, and Constellation 4's stacks give each deployed
// Member's Normal, Charged and Plunge hits a share of her DEF as flat damage, both built
// Constellation 2 needs the Geo Source Sample off the field and its party effect, which the kit does not build
// Constellation 6 needs the Nightsoul's Blessing extension by sprinting or attacking, its heals and its Nightsoul-tagged
// Attacks, none of which the kit builds
export const createXilonenKitBehaviour = ({ readStance }: KitRecordReader): KitBehaviour => {
  const bladeRoller = readStance("blessing");
  return {
    // Constellation 4's flat damage on a teammate's strike, from Xilonen's DEF, while the striker holds a stack
    getPartyStrikeBonus: (member, strike, _enemy, party, effects, characterIdCombatantMap) =>
      checkIsConstellation4Strike(strike.attackTag, strike.combatant.characterId, effects)
        ? {
            additiveBaseDamageBonus:
              CONSTELLATION_4_DEFENSE_SHARE * getKitDefense(member, effects, party, characterIdCombatantMap),
          }
        : {},
    // Constellation 4's flat damage on her own strike, from her DEF, while she holds a stack
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, party, effects, characterIdCombatantMap) =>
      checkIsConstellation4Strike(strike.attackTag, strike.combatant.characterId, effects)
        ? CONSTELLATION_4_DEFENSE_SHARE * getKitDefense(strike.combatant, effects, party, characterIdCombatantMap)
        : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (
          event.previousCharacterId === characterId &&
          checkHasKitStatus(kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID)
        )
          exitNightsoulBlessing(kitEffectState, characterId);
      } else if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.characterId === characterId &&
        event.effect.id === NIGHTSOUL_BLESSING_STATUS_ID
      )
        removeBladeRollerStance(kitEffectState, characterId);
      else if (
        event.kind === KitEventKind.DamageTaken &&
        checkIsConstellation4Strike(event.attackTag, event.striker.characterId, kitEffectState.effects)
      )
        spendConstellation4Stack(kitEffectState.effects, event.striker.characterId);
    },
    onSprint: (context, kitState, stepSeconds) => {
      drainKitSprintNightsoulPoints(
        context,
        kitState,
        stepSeconds,
        NIGHTSOUL_SPRINT_DRAIN * getNightsoulConsumptionMultiplier(context.activeCombatant),
      );
    },
    skill: {
      onStart: ({ activeCombatant, kitEffectState, party }) => {
        const { characterId } = activeCombatant;
        if (checkHasKitStatus(kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID))
          exitNightsoulBlessing(kitEffectState, characterId);
        else {
          const secondsRemaining = getNightsoulSeconds(activeCombatant);
          enterKitNightsoulBlessing(kitEffectState, characterId, {
            nightsoulRate: {
              maximum: NIGHTSOUL_POINTS,
              perSecond: -NIGHTSOUL_DRAIN_PER_SECOND * getNightsoulConsumptionMultiplier(activeCombatant),
            },
            points: NIGHTSOUL_POINTS,
            secondsRemaining,
          });
          enterKitStance(kitEffectState, activeCombatant, bladeRoller, secondsRemaining, { isEndedOnSwap: true });
          if (activeCombatant.constellationCount >= CONSTELLATION_4)
            for (const deployedCharacterId of getDeployedCharacterIds(party))
              addKitStatus(kitEffectState, deployedCharacterId, {
                id: CONSTELLATION_4_STATUS_ID,
                secondsRemaining: CONSTELLATION_4_SECONDS,
                stacks: CONSTELLATION_4_STACKS,
              });
        }
      },
    },
  };
};
