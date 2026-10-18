import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// Blizzard Blade Seki no To, from two constellations, casts two smaller storms beside the storm, as the wiki's
// Constellation page and gcsim v2.47.2 (MIT) ayaka/burst.go give it
// https://genshin-impact.fandom.com/wiki/Blizzard_Blade_Seki_no_To
const BLIZZARD_BLADE_SEKI_NO_TO_CONSTELLATION = 2;
// Kamisato Art: Senho infuses Ayaka's attacks with Cryo for 5 seconds as she reappears, as the wiki's Senho page and gcsim
// V2.47.2 (MIT) ayaka/dash.go's 300 frames give. Each step of the sprint restarts it, so it runs out 5 seconds after the
// Sprint ends
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/dash.go
const SENHO_INFUSION_SECONDS = 5;
// Constellation 1, Snowswept Sakura: each of her normal or charged attacks' hits on an enemy has a 50% chance to cut Kamisato
// Art: Hyouka's running cooldown by 0.3 seconds, once every 0.1 seconds, from the wiki's constellation table
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CHANCE = 0.5;
const CONSTELLATION_1_CUT_SECONDS = 0.3;
const CONSTELLATION_1_ICD_SECONDS = 0.1;
const CONSTELLATION_1_ICD_STATUS_ID = "ayaka-snowswept-sakura-icd";
// Amatsumi Kunitsumi Sanctification, from Ascension 1: after Kamisato Art: Hyouka her Normal and Charged attacks deal 30%
// Increased DMG for 6 seconds, as gcsim v2.47.2 (MIT) ayaka/asc.go gives it: an additive DMG Bonus on each Normal and Extra
// (Charged) attack, for 360 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/asc.go
const ASCENSION_1 = 1;
const AMATSUMI_KUNITSUMI_SANCTIFICATION_DAMAGE_BONUS = 0.3;
const AMATSUMI_KUNITSUMI_SANCTIFICATION_SECONDS = 6;
const AMATSUMI_KUNITSUMI_SANCTIFICATION_STATUS_ID = "ayaka-amatsumi-kunitsumi-sanctification";
// Constellation 4, from gcsim v2.47.2 (MIT) ayaka/cons.go: an opponent Kamisato Art: Soumetsu's storms damage has its DEF
// Reduced by 30% for 6 seconds, which the defence multiplier reads as an enemy status
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_DEFENCE_REDUCTION = 0.3;
const CONSTELLATION_4_SECONDS = 6;
const CONSTELLATION_4_STATUS_ID = "ayaka-frostflake-defence-reduction";
// Constellation 6, Dance of Suigetsu, from gcsim v2.47.2 (MIT) ayaka/cons.go: the first Charged Attack hit on an enemy clears
// Usurahi Butou's 298% DMG bonus 0.5 seconds on, and it returns 10 seconds after that clear
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/cons.go
const CONSTELLATION_6 = 6;
const USURAHI_BUTOU_DAMAGE_BONUS = 2.98;
const USURAHI_BUTOU_CLEAR_SECONDS = 0.5;
const USURAHI_BUTOU_RECHARGE_SECONDS = 10;
const USURAHI_BUTOU_STATUS_ID = "ayaka-usurahi-butou-recharge";

export const AYAKA_CHARACTER_ID = 10_000_002;

// Kamisato Ayaka's behaviour: Kamisato Art: Soumetsu casts its storm, a summon standing where she cast it and priced by
// Her, and from two constellations Blizzard Blade Seki no To's two smaller storms beside it, and Kamisato Art: Senho
// Infuses her attacks with Cryo as she sprints. Constellation 1 cuts Hyouka's running cooldown on her normal and charged
// Hits. Senho's Cryo application and movement, and A4's effect, are not built. Constellations 4 and 6 are built: 4's DEF
// Reduction is an enemy status on the storm hits, and 6's charged attack bonus runs on its own clear and recharge
// Constellation 4's DEF cut, on each storm hit that strikes an enemy
const getFrostflakeDefenceReduction = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= CONSTELLATION_4
    ? {
        damageTakenBonus: 0,
        defenseReduction: CONSTELLATION_4_DEFENCE_REDUCTION,
        id: CONSTELLATION_4_STATUS_ID,
        secondsRemaining: CONSTELLATION_4_SECONDS,
      }
    : undefined;
const withFrostflakeDefenceReduction = (hits: KitHit[]): KitHit[] =>
  hits.map((hit) => ({ ...hit, enemyStatus: getFrostflakeDefenceReduction }));
// Usurahi Butou stays on until a Charged Attack's first hit starts its status, and through the 0.5 seconds the status's
// Clear takes, so the status's time left above the recharge is when the bonus still applies
const checkIsUsurahiButouOn = (effects: readonly KitEffect[], characterId: number): boolean => {
  const status = findKitStatus(effects, characterId, USURAHI_BUTOU_STATUS_ID);
  return !status || status.secondsRemaining > USURAHI_BUTOU_RECHARGE_SECONDS;
};
// Constellation 1's roll on a hit of her normal or charged attack, read as the hit strikes an enemy
const snowsweptSakuraHit: KitHitBehaviour = {
  onStrike: ({ kitEffectState, party, random }, { combatant }) => {
    if (combatant.constellationCount < CONSTELLATION_1) return;
    if (
      !startKitCooldown(
        kitEffectState,
        combatant.characterId,
        CONSTELLATION_1_ICD_STATUS_ID,
        CONSTELLATION_1_ICD_SECONDS,
      )
    )
      return;
    if (random() < CONSTELLATION_1_CHANCE)
      changeKitSkillCooldown(party, combatant.characterId, -CONSTELLATION_1_CUT_SECONDS);
  },
};

// Constellation 6's start on a Charged Attack hit, as the hit strikes an enemy; Constellation 1's roll rides with it
const chargedAttackHit: KitHitBehaviour = {
  onStrike: (context, strike) => {
    snowsweptSakuraHit.onStrike?.(context, strike);
    const { combatant } = strike;
    if (combatant.constellationCount < CONSTELLATION_6) return;
    if (findKitStatus(context.kitEffectState.effects, combatant.characterId, USURAHI_BUTOU_STATUS_ID)) return;
    addKitStatus(context.kitEffectState, combatant.characterId, {
      id: USURAHI_BUTOU_STATUS_ID,
      secondsRemaining: USURAHI_BUTOU_CLEAR_SECONDS + USURAHI_BUTOU_RECHARGE_SECONDS,
    });
  },
};

export const createAyakaKitBehaviour = ({ kit, readHits }: KitRecordReader): KitBehaviour => {
  const frostflakeHits = withFrostflakeDefenceReduction(readHits("frostflake"));
  const smallFrostflakeHits = withFrostflakeDefenceReduction(readHits("smallFrostflake"));
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, frostflakeHits);
        if (combatant.constellationCount < BLIZZARD_BLADE_SEKI_NO_TO_CONSTELLATION) return;
        castKitSummon(kitEffectState, body, combatant, smallFrostflakeHits);
        castKitSummon(kitEffectState, body, combatant, smallFrostflakeHits);
      },
    },
    chargedAttack: { hits: kit.chargedAttack.hits.map(() => chargedAttackHit) },
    getStrikeDamageBonus: ({ attackTag, combatant }, _enemy, _party, effects) => {
      const amatsumiKunitsumiSanctificationBonus =
        (attackTag === AttackTag.NormalAttack || attackTag === AttackTag.ChargedAttack) &&
        findKitStatus(effects, combatant.characterId, AMATSUMI_KUNITSUMI_SANCTIFICATION_STATUS_ID)
          ? AMATSUMI_KUNITSUMI_SANCTIFICATION_DAMAGE_BONUS
          : 0;
      const usurahiButouBonus =
        attackTag === AttackTag.ChargedAttack &&
        combatant.constellationCount >= CONSTELLATION_6 &&
        checkIsUsurahiButouOn(effects, combatant.characterId)
          ? USURAHI_BUTOU_DAMAGE_BONUS
          : 0;
      return amatsumiKunitsumiSanctificationBonus + usurahiButouBonus;
    },
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => snowsweptSakuraHit) })),
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        if (combatant.ascension < ASCENSION_1) return;
        addKitStatus(kitEffectState, combatant.characterId, {
          id: AMATSUMI_KUNITSUMI_SANCTIFICATION_STATUS_ID,
          secondsRemaining: AMATSUMI_KUNITSUMI_SANCTIFICATION_SECONDS,
        });
      },
    },
    onSprint: ({ activeCombatant: combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Cryo,
        kind: "infusion",
        secondsRemaining: SENHO_INFUSION_SECONDS,
      }),
  };
};
