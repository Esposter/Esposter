import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { healKitPerStrike } from "#src/services/kit/healKitPerStrike";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";

const PARAMITA_SOURCE = "hu-tao-paramita";
const FLUTTER_BY_SOURCE = "hu-tao-a1";
const ASCENSION_1 = 1;
const ASCENSION_4 = 4;
// Flutter By, as gcsim v2.47.2 (MIT) hutao/asc.go gives it: when the Paramita Guide to Afterlife activated ends, each ally
// Other than Hu Tao gains 12% CRIT Rate for 8 seconds, from Ascension 1
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/asc.go
const FLUTTER_BY_CRITICAL_RATE = 0.12;
const FLUTTER_BY_SECONDS = 8;
// Sanguine Rouge, as gcsim v2.47.2 hutao/asc.go gives it: from Ascension 4, her Pyro DMG Bonus is 33% while her HP is at
// Or under half
const SANGUINE_ROUGE_HEALTH_SHARE = 0.5;
const SANGUINE_ROUGE_PYRO_DAMAGE_BONUS = 0.33;
// Guide to Afterlife's HP cost never takes Hu Tao below this much HP
const GUIDE_MINIMUM_HP = 1;
// Measured: gcsim v2.47.2 (MIT) hutao/skill.go, Blood Blossom's status ticking on the one enemy it is put on, which the
// Paramita's charged attack gives each enemy it hits, from gcsim's hutao/charge.go
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/skill.go
const BLOOD_BLOSSOM_STATUS_ID = "hu-tao-blood-blossom";
// Spirit Soother heals Hu Tao a share of her Max HP for each enemy its hit strikes, up to five a cast, from the wiki.
// The variant's larger share is taken at or under half HP, as gcsim v2.47.2 (MIT) hutao/burst.go has it.
// The count of heals is a kit resource, which a cast's start clears.
const SPIRIT_SOOTHER_HEAL_RESOURCE = "hu-tao-spirit-soother-heals";
const SPIRIT_SOOTHER_MAXIMUM_HEALS = 5;
// Constellation 4, as gcsim v2.47.2 (MIT) hutao/cons.go gives it: upon defeating an enemy Blood Blossom marked, each ally
// Other than Hu Tao gains 12% CRIT Rate for 15 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/hutao/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_CRITICAL_RATE = 0.12;
const CONSTELLATION_4_SECONDS = 15;
const CONSTELLATION_4_SOURCE = "hu-tao-c4";
// Constellation 6, as gcsim v2.47.2 hutao/cons.go gives it: once a drain leaves her at a quarter of her HP or under, her
// CRIT Rate is 100% for 10 seconds, and it comes once in 60 seconds
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_HEALTH_SHARE = 0.25;
const CONSTELLATION_6_CRITICAL_RATE = 1;
const CONSTELLATION_6_SECONDS = 10;
const CONSTELLATION_6_COOLDOWN_SECONDS = 60;
const CONSTELLATION_6_COOLDOWN_STATUS_ID = "hu-tao-c6-cooldown";
const CONSTELLATION_6_SOURCE = "hu-tao-c6";

export const HU_TAO_CHARACTER_ID = 10_000_046;

// Hu Tao's behaviour: Guide to Afterlife pays its HP cost from the party and holds the Paramita Papilio stance for its
// Seconds, which infuses her attacks with Pyro and adds ATK from her Max HP. The Paramita's charged attack
// Puts Blood Blossom on the enemies it hits, whose tick strikes each, and Spirit Soother plays its variant at half HP or
// Under. Spirit Soother heals her on each enemy its hit strikes, up to five a cast. Flutter By, Sanguine Rouge and the CRIT
// Rate of Constellations 4 and 6 are built.
// Constellation 1's stamina is built as the charged attack's multiplier, while the Paramita stance holds her
// Constellation 2 needs Blood Blossom's DMG by 10% of her Max HP, and Spirit Soother applying it, not built
// Constellation 6's revive to 1 HP from a lethal drain needs the drain to stop at 1 HP, which the party's drain does not, not built
const getPassiveBonuses = (combatant: Combatant, healthShare: number): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_4 || healthShare > SANGUINE_ROUGE_HEALTH_SHARE
    ? []
    : [{ amount: SANGUINE_ROUGE_PYRO_DAMAGE_BONUS, attribute: Attribute.PyroDamageBonus }];

// A cast of Spirit Soother starts its count of heals again
const resetSpiritSootherHeals = ({ activeCombatant, kitEffectState }: KitContext) => {
  spendKitResource(kitEffectState, activeCombatant.characterId, SPIRIT_SOOTHER_HEAL_RESOURCE);
};

export const createHuTaoKitBehaviour = ({
  readHit,
  readParameter,
  readSeconds,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const lowHealthShare = readParameter("spiritSootherLowHealthShare");
  const regenShare = readParameter("spiritSootherRegen");
  const lowRegenShare = readParameter("spiritSootherLowRegen");
  const guideToAfterlifeHealthShare = readParameter("guideToAfterlifeHealthCost");
  const paramitaSeconds = readParameter("paramitaSeconds");
  const paramitaMaxHealthAttackShare = readParameter("paramitaMaxHealthAttackShare");
  const bloodBlossomSeconds = readSeconds("bloodBlossom");
  const bloodBlossomIntervalSeconds = readSeconds("bloodBlossomInterval");
  // Blood Blossom's tick, a Pyro hit on the one enemy it is put on
  const bloodBlossomHit = readHit("bloodBlossom");
  // Blood Blossom on an enemy, which the Paramita's charged attack gives each enemy it hits
  const createBloodBlossomStatus = (): EnemyStatus => ({
    damageTakenBonus: 0,
    id: BLOOD_BLOSSOM_STATUS_ID,
    nextTickSeconds: bloodBlossomIntervalSeconds,
    secondsRemaining: bloodBlossomSeconds,
    tickIntervalSeconds: bloodBlossomIntervalSeconds,
  });
  // Guide to Afterlife's Paramita Papilio: a stance on her for its seconds, playing her strikes and charged attack in its
  // Own reach, which infuses her normal attacks, charged attack and plunges with Pyro, and raises her ATK by her Max HP.
  // Its strikes are Normal Attack DMG and its charged attack Charged Attack DMG, gcsim's AttackTagNormal in
  // Hutao/attack.go's ppAttack and AttackTagExtra in hutao/charge.go's ppChargeAttack
  const paramita = readStance("paramita", { chargedAttack: { hits: [{ enemyStatus: createBloodBlossomStatus }] } });
  // Spirit Soother's heal from one enemy its hit strikes, the larger share at her HP at or under half, read as it strikes
  const healOnSpiritSootherStrike = (context: KitContext, strike: KitStrike) => {
    const { attributes, characterId } = strike.combatant;
    const { healthShare } = getPartyMember(context.party, characterId);
    healKitPerStrike(context, strike, {
      health: (healthShare <= lowHealthShare ? lowRegenShare : regenShare) * attributes.maxHealth,
      maximumHeals: SPIRIT_SOOTHER_MAXIMUM_HEALS,
      resourceId: SPIRIT_SOOTHER_HEAL_RESOURCE,
    });
  };
  return {
    burst: { hits: [{ onStrike: healOnSpiritSootherStrike }], onStart: resetSpiritSootherHeals },
    burstVariant: {
      checkIsActive: ({ activeCombatant: combatant, party }) =>
        getPartyMember(party, combatant.characterId).healthShare <= lowHealthShare,
      hits: [{ onStrike: healOnSpiritSootherStrike }],
      onStart: resetSpiritSootherHeals,
    },
    // Constellation 1, Crimson Bouquet: her charged attacks cost no stamina while Paramita Papilio holds her
    getChargedAttackStaminaMultiplier: ({ activeCombatant, kitEffectState }) =>
      activeCombatant.constellationCount >= 1 && findKitStance(kitEffectState.effects, activeCombatant.characterId)
        ? 0
        : 1,
    getPassiveBonuses,
    // Blood Blossom's tick strikes the enemy it is on, and the Paramita's end gives the allies Flutter By's CRIT Rate
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (event.kind === KitEventKind.EffectExpired) {
        if (
          combatant.ascension < ASCENSION_1 ||
          event.effect.kind !== "stance" ||
          event.effect.characterId !== combatant.characterId
        )
          return;
        for (const characterId of getDeployedCharacterIds(party))
          if (characterId !== combatant.characterId)
            buffKitMember(kitEffectState, characterId, {
              amount: FLUTTER_BY_CRITICAL_RATE,
              attribute: Attribute.CriticalRate,
              secondsRemaining: FLUTTER_BY_SECONDS,
              source: FLUTTER_BY_SOURCE,
            });
        return;
      }
      // Constellation 4: an enemy her Blood Blossom marked, defeated, gives each ally other than her CRIT Rate
      if (event.kind === KitEventKind.EnemyDefeated) {
        if (
          combatant.constellationCount < CONSTELLATION_4 ||
          !event.enemy.statuses.some(
            ({ id, secondsRemaining }) => id === BLOOD_BLOSSOM_STATUS_ID && secondsRemaining > 0,
          )
        )
          return;
        for (const characterId of getDeployedCharacterIds(party))
          if (characterId !== combatant.characterId)
            buffKitMember(kitEffectState, characterId, {
              amount: CONSTELLATION_4_CRITICAL_RATE,
              attribute: Attribute.CriticalRate,
              secondsRemaining: CONSTELLATION_4_SECONDS,
              source: CONSTELLATION_4_SOURCE,
            });
        return;
      }
      // Constellation 6: a drain that leaves her at a quarter of her HP or under gives her CRIT Rate, once a minute
      if (event.kind === KitEventKind.HealthChanged) {
        if (
          combatant.constellationCount < CONSTELLATION_6 ||
          event.characterId !== combatant.characterId ||
          event.healthShare >= 0 ||
          getPartyMember(party, combatant.characterId).healthShare > CONSTELLATION_6_HEALTH_SHARE ||
          !startKitCooldown(
            kitEffectState,
            combatant.characterId,
            CONSTELLATION_6_COOLDOWN_STATUS_ID,
            CONSTELLATION_6_COOLDOWN_SECONDS,
          )
        )
          return;
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: CONSTELLATION_6_CRITICAL_RATE,
          attribute: Attribute.CriticalRate,
          secondsRemaining: CONSTELLATION_6_SECONDS,
          source: CONSTELLATION_6_SOURCE,
        });
        return;
      }
      if (event.kind !== KitEventKind.StatusTicked || event.status.id !== BLOOD_BLOSSOM_STATUS_ID) return;
      castKitSummon(
        kitEffectState,
        { facing: 0, height: 0, position: event.enemy.position },
        combatant,
        [bloodBlossomHit],
        { target: event.enemy },
      );
    },
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState, party }) => {
        // Guide to Afterlife takes its HP share of her current HP, but never below GUIDE_MINIMUM_HP
        const { healthShare } = getPartyMember(party, combatant.characterId);
        const minimumHealthShare = GUIDE_MINIMUM_HP / combatant.attributes.maxHealth;
        const lostHealthShare = Math.max(
          0,
          Math.min(guideToAfterlifeHealthShare * healthShare, healthShare - minimumHealthShare),
        );
        damagePartyMember(party, combatant.characterId, lostHealthShare);
        // The stance, its Pyro infusion and its ATK end as she leaves the field, as gcsim's exit deletes the Paramita's
        // ATK, which its infusion reads
        enterKitStance(kitEffectState, combatant, paramita, paramitaSeconds, { isEndedOnSwap: true });
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Pyro,
          isEndedOnSwap: true,
          kind: "infusion",
          secondsRemaining: paramitaSeconds,
        });
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: paramitaMaxHealthAttackShare * combatant.attributes.maxHealth,
          attribute: Attribute.Attack,
          isEndedOnSwap: true,
          secondsRemaining: paramitaSeconds,
          source: PARAMITA_SOURCE,
        });
      },
    },
  };
};
