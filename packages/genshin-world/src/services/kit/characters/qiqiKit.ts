import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { reviveParty } from "#src/services/party/reviveParty";

// Herald of Frost's regeneration ticks every 4.5 seconds from the press's hitmark, four times in all with the first,
// As gcsim v2.47.2 (MIT) qiqi/skill.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/skill.go
const REGENERATION_TICK_SECONDS = 4.5;
// The Fortune-Preserving Talisman on an enemy: damage it takes from the character on the field heals that character, at
// Most once a second for each enemy. Measured: gcsim v2.47.2 (MIT) qiqi/burst.go, and the wiki's notes that the active
// Character's own hits alone heal and that the burst's Talisman lands before its damage
// https://genshin-impact.fandom.com/wiki/Adeptus_Art:_Preserver_of_Fortune
const TALISMAN_STATUS_ID = "qiqi-talisman";
const TALISMAN_HEAL_COOLDOWN_STATUS_ID = "qiqi-talisman-heal-cooldown";
const TALISMAN_HEAL_COOLDOWN_SECONDS = 1;
// A Glimpse into Arcanum, from Ascension 4: Qiqi's Normal and Charged Attacks give the enemy they hit a Talisman of 6
// Seconds on a 50% roll, at most once every 30 seconds, unless it holds a longer one. Measured: gcsim v2.47.2 (MIT)
// Qiqi/burst.go. https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/burst.go
const A_GLIMPSE_INTO_ARCANUM_ASCENSION = 4;
// From Ascension 1, a reaction the character on the field triggers gives her 20% Healing Bonus for 8 seconds, unless Herald
// Of Frost stands, as gcsim v2.47.2 (MIT) qiqi/asc.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/asc.go
const ASCENSION_1 = 1;
const ASCENSION_1_HEALING_BONUS = 0.2;
const ASCENSION_1_SECONDS = 8;
const A_GLIMPSE_INTO_ARCANUM_CHANCE = 0.5;
const A_GLIMPSE_INTO_ARCANUM_TALISMAN_SECONDS = 6;
const A_GLIMPSE_INTO_ARCANUM_COOLDOWN_STATUS_ID = "qiqi-a-glimpse-into-arcanum-cooldown";
const A_GLIMPSE_INTO_ARCANUM_COOLDOWN_SECONDS = 30;
// Ascetics of Frost, from one constellation: the Herald's hits on an enemy holding a Talisman give Qiqi 2 energy
const ASCETICS_OF_FROST_CONSTELLATION = 1;
const ASCETICS_OF_FROST_ENERGY = 2;
// Frozen to the Bone, from two constellations: Qiqi's Normal and Charged Attack DMG against an enemy with Cryo on it,
// Or frozen, is raised by 15%
const FROZEN_TO_THE_BONE_CONSTELLATION = 2;
const FROZEN_TO_THE_BONE_DAMAGE_BONUS = 0.15;
// Divine Suppression, from four constellations: an enemy holding a Talisman strikes with 20% less ATK
const DIVINE_SUPPRESSION_CONSTELLATION = 4;
const DIVINE_SUPPRESSION_ATTACK_REDUCTION = 0.2;
// Rite of Resurrection, from six constellations: the burst revives the fallen members of the deployed team at 50% of
// Their Max HP, at most once every 15 minutes
const RITE_OF_RESURRECTION_CONSTELLATION = 6;
const RITE_OF_RESURRECTION_HEALTH_SHARE = 0.5;
const RITE_OF_RESURRECTION_COOLDOWN_STATUS_ID = "qiqi-rite-of-resurrection-cooldown";
const RITE_OF_RESURRECTION_COOLDOWN_SECONDS = 15 * 60;

// A Talisman for the seconds given, cutting the enemy's ATK from four constellations
const createTalisman = ({ constellationCount }: Combatant, secondsRemaining: number): EnemyStatus => ({
  ...(constellationCount >= DIVINE_SUPPRESSION_CONSTELLATION && {
    attackReduction: DIVINE_SUPPRESSION_ATTACK_REDUCTION,
  }),
  damageTakenBonus: 0,
  id: TALISMAN_STATUS_ID,
  secondsRemaining,
});

// Whether a Herald of Frost that Qiqi cast stands: her following summon still on the field
const checkIsHeraldStanding = (characterId: number, effects: readonly KitEffect[]): boolean =>
  effects.some(
    (effect) =>
      effect.kind === "summon" &&
      effect.isFollowing === true &&
      effect.combatant.characterId === characterId &&
      effect.secondsRemaining > 0,
  );

// Regeneration on hit: a Normal or Charged Attack hit heals every member of the party while Herald of Frost stands
const regenerationOnHit: KitHitBehaviour = {
  healPartyChance: (striker, effects) => (checkIsHeraldStanding(striker.characterId, effects) ? 1 : 0),
};

export const QIQI_CHARACTER_ID = 10_000_035;

// Qiqi's behaviour: her Normal and Charged Attack hits regenerate the party while Herald of Frost stands. Herald of
// Frost casts the Herald, a summon whose swipes follow her, and its continuous regeneration, which snapshots her ATK on
// Cast and heals the character on the field. Fortune-Preserving Talisman marks each enemy it strikes with the Talisman
// Before its damage, and from six constellations revives the fallen. The Talisman's heal, A Glimpse into Arcanum and the
// Constellations answer the kit's events, and Life-Prolonging Methods from Ascension 1 is built as a passive
export const createQiqiKitBehaviour = ({
  kit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const heraldHits = readHits("herald");
  const heraldHitmarkSeconds = readSeconds("heraldHitmark");
  const skillSeconds = readParameter("skillSeconds");
  const regenerationHealth = readParameter("heraldOfFrostRegenerationHealth");
  const regenerationAttackShare = readParameter("heraldOfFrostRegenerationAttackShare");
  const talismanHealAttackShare = readParameter("talismanHealAttackShare");
  const talismanHealHealth = readParameter("talismanHealHealth");
  const talismanSeconds = readParameter("talismanSeconds");
  return {
    // The Talisman goes on each enemy the burst strikes before its damage, so the burst's own hit heals Qiqi. From six
    // Constellations the burst revives the fallen members, a step after it starts
    burst: {
      hits: [{ enemyStatus: (combatant) => createTalisman(combatant, talismanSeconds) }],
      onStart: ({ activeCombatant: { characterId, constellationCount }, kitEffectState }) => {
        if (
          constellationCount < RITE_OF_RESURRECTION_CONSTELLATION ||
          !startKitCooldown(
            kitEffectState,
            characterId,
            RITE_OF_RESURRECTION_COOLDOWN_STATUS_ID,
            RITE_OF_RESURRECTION_COOLDOWN_SECONDS,
          )
        )
          return;
        scheduleKitTask(kitEffectState, characterId, 0, ({ party }) =>
          reviveParty(party, RITE_OF_RESURRECTION_HEALTH_SHARE),
        );
      },
    },
    chargedAttack: { hits: kit.chargedAttack.hits.map(() => regenerationOnHit) },
    getStrikeDamageBonus: ({ attackTag, combatant }, { elementalState: { auras } }) =>
      combatant.constellationCount >= FROZEN_TO_THE_BONE_CONSTELLATION &&
      (attackTag === AttackTag.NormalAttack || attackTag === AttackTag.ChargedAttack) &&
      (auras.has(AuraType.Cryo) || auras.has(AuraType.Freeze))
        ? FROZEN_TO_THE_BONE_DAMAGE_BONUS
        : 0,
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => regenerationOnHit) })),
    // Damage an enemy holding a Talisman takes from the character on the field heals that character, a Normal or Charged
    // Attack of Qiqi's may give the enemy a Talisman from Ascension 4, and the Herald's hits on it give her energy from
    // One constellation
    onKitEvent: (event, context, combatant) => {
      const { activeCombatant, kitEffectState, party, random } = context;
      if (event.kind === KitEventKind.ReactionTriggered) {
        if (
          combatant.ascension >= ASCENSION_1 &&
          event.striker.characterId === activeCombatant.characterId &&
          !checkIsHeraldStanding(combatant.characterId, kitEffectState.effects)
        )
          buffKitMember(kitEffectState, activeCombatant.characterId, {
            amount: ASCENSION_1_HEALING_BONUS,
            attribute: Attribute.HealingBonus,
            secondsRemaining: ASCENSION_1_SECONDS,
          });
        return;
      }
      if (event.kind !== KitEventKind.DamageTaken) return;
      const { attackTag, enemy, hit, striker } = event;
      const { ascension, characterId, constellationCount } = combatant;
      const talisman = enemy.statuses.find(({ id }) => id === TALISMAN_STATUS_ID);
      if (
        talisman &&
        striker.characterId === activeCombatant.characterId &&
        !enemy.statuses.some(({ id }) => id === TALISMAN_HEAL_COOLDOWN_STATUS_ID)
      ) {
        addEnemyStatus(enemy, {
          damageTakenBonus: 0,
          id: TALISMAN_HEAL_COOLDOWN_STATUS_ID,
          secondsRemaining: TALISMAN_HEAL_COOLDOWN_SECONDS,
        });
        changeKitMemberHealth(
          context,
          combatant,
          striker.characterId,
          talismanHealHealth + talismanHealAttackShare * combatant.attributes.attack,
        );
      }

      if (striker.characterId !== characterId) return;
      if (talisman && constellationCount >= ASCETICS_OF_FROST_CONSTELLATION && heraldHits.includes(hit))
        gainPartyMemberEnergy(party, combatant, ASCETICS_OF_FROST_ENERGY);
      if (
        ascension < A_GLIMPSE_INTO_ARCANUM_ASCENSION ||
        (attackTag !== AttackTag.NormalAttack && attackTag !== AttackTag.ChargedAttack) ||
        checkHasKitStatus(kitEffectState.effects, characterId, A_GLIMPSE_INTO_ARCANUM_COOLDOWN_STATUS_ID) ||
        random() >= A_GLIMPSE_INTO_ARCANUM_CHANCE ||
        (talisman?.secondsRemaining ?? 0) >= A_GLIMPSE_INTO_ARCANUM_TALISMAN_SECONDS
      )
        return;
      addEnemyStatus(enemy, createTalisman(combatant, A_GLIMPSE_INTO_ARCANUM_TALISMAN_SECONDS));
      addKitStatus(kitEffectState, characterId, {
        id: A_GLIMPSE_INTO_ARCANUM_COOLDOWN_STATUS_ID,
        secondsRemaining: A_GLIMPSE_INTO_ARCANUM_COOLDOWN_SECONDS,
      });
    },
    // Herald of Frost is cast where Qiqi stands: its swipes follow her, and its regeneration ticks from the press
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, heraldHits, {
          isFollowing: true,
          secondsRemaining: skillSeconds,
        });
        castKitField(kitEffectState, combatant.characterId, body.position, {
          nextTickSeconds: heraldHitmarkSeconds,
          onTick: (tick) =>
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              regenerationHealth + regenerationAttackShare * combatant.attributes.attack,
            ),
          secondsRemaining: skillSeconds,
          tickIntervalSeconds: REGENERATION_TICK_SECONDS,
        });
      },
    },
  };
};
