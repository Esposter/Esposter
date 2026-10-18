import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
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

export const HU_TAO_CHARACTER_ID = 10_000_046;

// Hu Tao's behaviour: Guide to Afterlife pays its HP cost from the party and holds the Paramita Papilio stance for its
// Seconds, which infuses her attacks with Pyro and adds ATK from her Max HP. The Paramita's charged attack
// Puts Blood Blossom on the enemies it hits, whose tick strikes each, and Spirit Soother plays its variant at half HP or
// Under. Flutter By and Sanguine Rouge are built; Spirit Soother's heal, and Constellations 2, 4 and 6, are not built
// Constellation 1's stamina is built as the charged attack's multiplier, while the Paramita stance holds her
// Constellation 2 needs Blood Blossom's DMG by 10% of her Max HP, and Spirit Soother applying it, not built
// Constellation 4 needs the defeat of an enemy her Blood Blossom marked, which no kit event reports
// Constellation 6 needs the lethal-strike check and the 10 seconds of RES, which the kit does not build
const getPassiveBonuses = (combatant: Combatant, healthShare: number): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_4 || healthShare > SANGUINE_ROUGE_HEALTH_SHARE
    ? []
    : [{ amount: SANGUINE_ROUGE_PYRO_DAMAGE_BONUS, attribute: Attribute.PyroDamageBonus }];

export const createHuTaoKitBehaviour = ({
  readHit,
  readParameter,
  readSeconds,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const lowHealthShare = readParameter("spiritSootherLowHealthShare");
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
  return {
    burstVariant: {
      checkIsActive: ({ activeCombatant: combatant, party }) =>
        getPartyMember(party, combatant.characterId).healthShare <= lowHealthShare,
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
