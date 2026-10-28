import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitShieldInfusion } from "#src/services/kit/effects/castKitShieldInfusion";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { collectDelayedKitEnergy } from "#src/services/kit/effects/collectDelayedKitEnergy";
import { delayKitEnergy } from "#src/services/kit/effects/delayKitEnergy";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// Measured: gcsim v2.47.2 (MIT) thoma/burst.go, thoma.go and shield.go, Fiery Collapse: for the burst's seconds, a normal
// Attack the character on the field starts sets one off from its body, at most once in the table's seconds. The first
// Enemy it strikes gives the team Thoma's shield, its share of his Max HP and its flat HP added to his shield already
// Standing, up to the most Blazing Blessing's shield may hold, for the table's seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/thoma/burst.go
const FIERY_COLLAPSE_COOLDOWN_STATUS_ID = "thoma-fiery-collapse-cooldown";
// Flaming Assault, as the dump's Tohma_PermanentSkill_2 row (promote 4) and gcsim v2.47.2 (MIT) thoma/asc.go give it: a
// Fiery Collapse deals 2.2% of Thoma's Max HP more DMG. gcsim gates it at Ascension 1, but the talent table names
// Ascension 4, so the table's phase stands
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/thoma/asc.go
const FLAMING_ASSAULT_ASCENSION = 4;
const FLAMING_ASSAULT_MAX_HEALTH_SHARE = 0.022;
// Measured: gcsim v2.47.2 (MIT) thoma/burst.go, Constellation 2 holds Crimson Ooyoroi for 18 seconds, three past its 15, and
// Constellation 4 restores 15 energy to Thoma 8 frames into the burst, which a delayed energy gives as its status runs out
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/thoma/burst.go
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_OOYOROI_EXTRA_SECONDS = 3;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ENERGY = 15;
const CONSTELLATION_4_ENERGY_SECONDS = 8 * FIXED_STEP_SECONDS;
const CONSTELLATION_4_ENERGY_STATUS_ID = "thoma-c4-energy";
// Measured: gcsim v2.47.2 (MIT) thoma/shield.go and thoma.go, Constellation 6 gives the team 15% DMG for normal, charged and
// Plunging attacks for six seconds each time a Blazing Blessing sets its shield. The wiki's Burning Heart gives the same
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/thoma/shield.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_DAMAGE_BONUS = 0.15;
const CONSTELLATION_6_SECONDS = 6;
const CONSTELLATION_6_STATUS_ID = "thoma-c6-damage";
const CONSTELLATION_6_ATTACK_TAGS = new Set<AttackTag | undefined>([
  AttackTag.ChargedAttack,
  AttackTag.NormalAttack,
  AttackTag.PlungingAttack,
]);

export const THOMA_CHARACTER_ID = 10_000_050;

// The DMG Bonus Constellation 6 gives a normal, charged or plunging attack while Thoma's status stands, zero for other attacks
const getConstellation6DamageBonus = (
  thomaCharacterId: number,
  strike: KitStrike,
  effects: readonly KitEffect[],
): number =>
  checkIsKitStatusActive(effects, thomaCharacterId, CONSTELLATION_6_STATUS_ID) &&
  CONSTELLATION_6_ATTACK_TAGS.has(strike.attackTag)
    ? CONSTELLATION_6_DAMAGE_BONUS
    : 0;

// Thoma's behaviour: Blazing Blessing sets its shield as it starts and infuses his own attacks with Pyro, and Crimson
// Ooyoroi stands for its seconds, setting off a Fiery Collapse from each normal attack the character on the field starts,
// At most once in the table's seconds, whose first strike stacks Thoma's shield up to the most Blazing Blessing's may
// Hold. From Ascension 4 a Fiery Collapse adds a share of his Max HP to its DMG. His Ascension 1 passive is not built yet.
// Constellations 2, 4 and 6 are built, as the burst's seconds, its energy and the Blazing Barrier's party DMG Bonus
// Constellation 1 needs the Blazing Barrier's protected-ally attacks and the cooldown cuts they give, not built
export const createThomaKitBehaviour = ({ readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const blazingBlessingShieldMaxHealthShare = readParameter("blazingBlessingShieldMaxHealthShare");
  const blazingBlessingShieldFlatHealth = readParameter("blazingBlessingShieldFlatHealth");
  const blazingBlessingShieldSeconds = readParameter("blazingBlessingShieldSeconds");
  const blazingBlessingInfusionSeconds = readSeconds("blazingBlessingInfusion");
  const maxShieldMaxHealthShare = readParameter("blazingBlessingMaxShieldMaxHealthShare");
  const maxShieldFlatHealth = readParameter("blazingBlessingMaxShieldFlatHealth");
  const fieryCollapse = readHit("fieryCollapse");
  const fieryCollapseShieldMaxHealthShare = readParameter("fieryCollapseShieldMaxHealthShare");
  const fieryCollapseShieldFlatHealth = readParameter("fieryCollapseShieldFlatHealth");
  const fieryCollapseShieldSeconds = readParameter("fieryCollapseShieldSeconds");
  const fieryCollapseIntervalSeconds = readParameter("fieryCollapseIntervalSeconds");
  const ooyoroiSeconds = readParameter("crimsonOoyoroiSeconds");
  // A Fiery Collapse's hit, whose first strike stacks Thoma's shield, since a collapse shields the team once
  const createFieryCollapseHit = (): KitHit => {
    let isShielded = false;
    return {
      ...fieryCollapse,
      additiveBaseDamageBonus: (striker) =>
        striker.ascension >= FLAMING_ASSAULT_ASCENSION
          ? FLAMING_ASSAULT_MAX_HEALTH_SHARE * striker.attributes.maxHealth
          : 0,
      onStrike: (context, { combatant }) => {
        const { characterIdCombatantMap, kitEffectState, party } = context;
        if (isShielded) return;
        isShielded = true;
        const { characterId } = combatant;
        const combatantMaxHealth = getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
        const standingHealth =
          kitEffectState.effects.find(
            (effect): effect is KitShield =>
              checkIsKitShieldLive(effect) && !effect.isCrystallize && effect.characterId === characterId,
          )?.health ?? 0;
        const maxHealth = maxShieldMaxHealthShare * combatantMaxHealth + maxShieldFlatHealth;
        castKitShield(context, characterId, {
          element: Element.Pyro,
          health: Math.min(
            standingHealth + fieryCollapseShieldMaxHealthShare * combatantMaxHealth + fieryCollapseShieldFlatHealth,
            maxHealth,
          ),
          secondsRemaining: fieryCollapseShieldSeconds,
        });
      },
    };
  };
  // Sets off a Fiery Collapse from the body on the field, priced by Thoma as he cast the burst, unless one was set off
  // Within the table's seconds
  const setOffFieryCollapse = (ooyoroi: KitSummon, { body, kitEffectState }: KitContext): void => {
    const { combatant } = ooyoroi;
    if (
      !startKitCooldown(
        kitEffectState,
        combatant.characterId,
        FIERY_COLLAPSE_COOLDOWN_STATUS_ID,
        fieryCollapseIntervalSeconds,
      )
    )
      return;
    castKitSummon(kitEffectState, body, combatant, [createFieryCollapseHit()], { attackTag: AttackTag.ElementalBurst });
  };
  return {
    // The burst stands the Ooyoroi for its seconds, which the normal attacks of the character on the field set off
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const ooyoroi = castKitSummon(kitEffectState, body, combatant, [], {
          onNormalAttackStart: (context) => {
            setOffFieryCollapse(ooyoroi, context);
          },
          secondsRemaining:
            combatant.constellationCount >= CONSTELLATION_2
              ? ooyoroiSeconds + CONSTELLATION_2_OOYOROI_EXTRA_SECONDS
              : ooyoroiSeconds,
        });
        if (combatant.constellationCount >= CONSTELLATION_4)
          delayKitEnergy(kitEffectState, combatant.characterId, {
            energy: CONSTELLATION_4_ENERGY,
            id: CONSTELLATION_4_ENERGY_STATUS_ID,
            seconds: CONSTELLATION_4_ENERGY_SECONDS,
          });
      },
    },
    // Constellation 6's DMG Bonus on Thoma's own attacks, and on the attacks of each other member through the party hook
    getPartyStrikeBonus: (member, strike, _enemy, _party, effects) => ({
      damageBonus: getConstellation6DamageBonus(member.characterId, strike, effects),
    }),
    getStrikeDamageBonus: (strike, _enemy, _party, effects) =>
      getConstellation6DamageBonus(strike.combatant.characterId, strike, effects),
    // Constellation 4's energy goes to Thoma when its delay runs out
    onKitEvent: (event, context, combatant) => {
      collectDelayedKitEnergy(event, context, combatant, CONSTELLATION_4_ENERGY_STATUS_ID);
    },
    // Blazing Blessing sets its shield as it starts, from Thoma's Max HP and the table's share and flat HP, for its
    // Seconds. It also infuses his own attacks with Pyro for the infusion's seconds
    skill: {
      onStart: (context) => {
        const { activeCombatant: combatant, kitEffectState } = context;
        castKitShieldInfusion(context, combatant, {
          element: Element.Pyro,
          getShieldHealth: (maxHealth) =>
            blazingBlessingShieldMaxHealthShare * maxHealth + blazingBlessingShieldFlatHealth,
          infusionSeconds: blazingBlessingInfusionSeconds,
          shieldSeconds: blazingBlessingShieldSeconds,
        });
        // Each shield set restarts Constellation 6's status, as the game restarts the Blazing Barrier's
        if (combatant.constellationCount >= CONSTELLATION_6)
          addKitStatus(kitEffectState, combatant.characterId, {
            id: CONSTELLATION_6_STATUS_ID,
            secondsRemaining: CONSTELLATION_6_SECONDS,
          });
      },
    },
  };
};
