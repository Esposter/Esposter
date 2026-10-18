import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim (MIT) raiden/skill.go, the Eye reaching the deployed team from a task after the cast, and a member
// Holding it who deals damage setting off its coordinated attack once every 0.9 seconds across the team
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/skill.go
const EYE_STATUS_ID = "raiden-eye";
const EYE_PENDING_TASK_ID = "raiden-eye-pending";
const COORDINATED_ATTACK_ICD_SECONDS = 0.9;
const COORDINATED_ATTACK_ICD_ID = "raiden-eye-icd";

// Measured: gcsim (MIT) raiden/burst.go, the Resolve stacks the burst spends, and Musou Isshin's strikes restoring the
// Team's energy once a second, five times a cast
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/burst.go
const RESOLVE_RESOURCE_ID = "raiden-resolve";
// Measured: gcsim (MIT) raiden/burst.go, Constellation 1 raising the Resolve another member's burst gives her by 80% for
// An Electro member's burst and 20% for any other's, and Resolve's cap of 60 stacks
const RESOLVE_MAX_STACKS = 60;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ELECTRO_RESOLVE_MULTIPLIER = 1.8;
const CONSTELLATION_1_RESOLVE_MULTIPLIER = 1.2;
const RESTORE_ICD_SECONDS = 1;
const RESTORE_ICD_ID = "raiden-restore-icd";
const RESTORE_COUNT_ID = "raiden-restore-count";
const RESTORE_MAX_COUNT = 5;

// Measured: gcsim (MIT) raiden/asc.go, Ascension 1's 2 Resolve stacks as the party gains particles or orbs, once every 3
// Seconds
const ASCENSION_1 = 1;
const ASCENSION_1_RESOLVE_STACKS = 2;
const ASCENSION_1_ICD_SECONDS = 3;
const ASCENSION_1_ICD_ID = "raiden-a1-icd";
// Measured: gcsim (MIT) raiden/asc.go, Ascension 4's 0.6% more energy restored by Musou Isshin for each whole 1% of Energy
// Recharge past 100%, and its 0.4% Electro DMG Bonus for each 1% of it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_RESTORE_BONUS_PER_PERCENT = 0.006;
const ASCENSION_4_ELECTRO_BONUS_PER_SHARE = 0.4;
// Measured: gcsim (MIT) raiden/cons.go, Constellation 4's 30% ATK for 10 seconds to the team but Raiden as Musou Isshin
// Ends, and Constellation 6's second off the other members' burst cooldowns on the strikes that restore energy
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ATTACK_SHARE = 0.3;
const CONSTELLATION_4_SECONDS = 10;
const CONSTELLATION_4_SOURCE = "raiden-c4";
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_COOLDOWN_SECONDS = 1;

// Whether she holds the Eye, or her skill's task is about to give it
const checkHasEye = (effects: readonly KitEffect[], characterId: number): boolean =>
  checkHasKitStatus(effects, characterId, EYE_STATUS_ID) ||
  effects.some(
    (effect) => effect.kind === "field" && effect.characterId === characterId && effect.id === EYE_PENDING_TASK_ID,
  );

// Ascension 4's Electro DMG Bonus, which a hit reads as it is priced, from her Energy Recharge past 100%
const getPassiveBonuses = (combatant: Combatant): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_4
    ? []
    : [
        {
          amount:
            ASCENSION_4_ELECTRO_BONUS_PER_SHARE *
            Math.max(combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge] - 1, 0),
          attribute: Attribute.ElectroDamageBonus,
        },
      ];

export const RAIDEN_CHARACTER_ID = 10_000_052;

// The Raiden Shogun's behaviour: Eye of Stormy Judgment's hit lands from a summon, and the Eye it gives the team sets off
// Its coordinated attacks. Another member's burst gives her Resolve by its energy cost, and Musou Shinsetsu spends her
// Resolve stacks into Musou no Hitotachi and every attack of the Musou Isshin stance it takes, whose strikes restore the
// Team's energy. The Eye's Elemental Burst DMG Bonus raises her own burst hits, read as the burst is cast. Ascension 1's
// Resolve from particles, Ascension 4 and Constellations 1, 4 and 6 are built. The Eye's bonus to another member's
// Burst, Constellation 2's DEF ignored, the Musou Isshin plunges and the skill's particles are not, as no kit reaches
// Another kit's pricing, a hit's DEF ignored, a stance's plunges or a particle a skill makes
// Constellation 2 needs a DEF ignore on the Musou no Hitotachi strikes, which no strike hook carries
export const createRaidenKitBehaviour = ({
  kit,
  readHit,
  readParameter,
  readSeconds,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const skillHit = readHit("skill");
  // The Eye's coordinated attack, which sets off no other
  const coordinatedAttack = readHit("coordinatedAttack");
  const eyeDelaySeconds = readSeconds("eyeDelay");
  const eyeSeconds = readParameter("eyeSeconds");
  // The Eye's Elemental Burst DMG Bonus is the table's bonus per point of the burst's energy cost
  const eyeBurstDamageBonus = readParameter("eyeBurstDamageBonus") * kit.burstEnergyCost;
  const musouNoHitotachi = readHit("musouNoHitotachi");
  const resolveBurstBonus = readParameter("musouNoHitotachiResolveBonus");
  const resolveAttackBonus = readParameter("resolveAttackBonus");
  const resolveStackGain = readParameter("resolveStackGain");
  const restoreEnergy = readParameter("restoreEnergy");
  const musouIsshinSeconds = readParameter("musouIsshinSeconds");
  // Musou Isshin's strikes and charged attack are Elemental Burst DMG, gcsim's AttackTagElementalBurst in
  // `raiden/attack.go`'s swordAttack and `raiden/charge.go`'s swordCharge
  const musouIsshin = readStance("musouIsshin");
  // A Musou Isshin attack with each multiplier raised by the Resolve stacks the burst spent and each DMG Bonus the Eye's,
  // If she held it as she cast
  const raiseMusouIsshinAction = (action: KitAction, stacks: number, damageBonus: number): KitAction => ({
    ...action,
    hits: action.hits.map((hit) => ({
      ...hit,
      damageBonus,
      talentMultiplier: hit.talentMultiplier + resolveAttackBonus * stacks,
    })),
  });
  return {
    // The burst spends Resolve's stacks as it is cast, where gcsim spends them at the hit 98 frames on, Musou no Hitotachi
    // Landing from a summon at the body, and takes the Musou Isshin stance from the cast until its seconds past that
    // Hit, whose skill and burst stay the kit's own
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { characterId } = combatant;
        const stacks = spendKitResource(kitEffectState, characterId, RESOLVE_RESOURCE_ID);
        removeKitEffects(
          kitEffectState,
          (effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === RESTORE_COUNT_ID,
        );
        const damageBonus = checkHasEye(kitEffectState.effects, characterId) ? eyeBurstDamageBonus : 0;
        castKitSummon(kitEffectState, body, combatant, [
          {
            ...musouNoHitotachi,
            damageBonus,
            talentMultiplier: musouNoHitotachi.talentMultiplier + resolveBurstBonus * stacks,
          },
        ]);
        enterKitStance(
          kitEffectState,
          combatant,
          {
            ...musouIsshin,
            chargedAttack: raiseMusouIsshinAction(musouIsshin.chargedAttack, stacks, damageBonus),
            normalAttacks: musouIsshin.normalAttacks.map((action) =>
              raiseMusouIsshinAction(action, stacks, damageBonus),
            ),
          },
          musouNoHitotachi.hitmarkSeconds + musouIsshinSeconds,
          { isEndedOnSwap: true },
        );
      },
    },
    getPassiveBonuses,
    // Another member's burst gives her Resolve, and from Ascension 1 the party's particles and orbs give her 2 stacks
    // Once every 3 seconds. The end of Musou Isshin, which leaving the field brings, gives the rest of the team
    // Constellation 4's ATK. A Musou Isshin attack that lands restores the team's energy, and from Constellation 6 cuts
    // The others' burst cooldowns, once a second and five times a cast, as gcsim's two callbacks keep the same interval
    // And count. A member holding the Eye who deals damage sets off its coordinated attack on the enemy struck
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      const { ascension, characterId, constellationCount } = combatant;
      const musouIsshinStance = findKitStance(kitEffectState.effects, characterId);
      if (event.kind === KitEventKind.BurstUsed) {
        if (event.characterId === characterId) return;
        const isElectro = characterIdCombatantMap.get(event.characterId)?.element === Element.Electro;
        const multiplier =
          constellationCount < CONSTELLATION_1
            ? 1
            : isElectro
              ? CONSTELLATION_1_ELECTRO_RESOLVE_MULTIPLIER
              : CONSTELLATION_1_RESOLVE_MULTIPLIER;
        gainKitResource(
          kitEffectState,
          characterId,
          RESOLVE_RESOURCE_ID,
          resolveStackGain * event.energyCost * multiplier,
          RESOLVE_MAX_STACKS,
        );
        return;
      }

      if (event.kind === KitEventKind.EnergyParticleCollected) {
        if (
          ascension < ASCENSION_1 ||
          !startKitCooldown(kitEffectState, characterId, ASCENSION_1_ICD_ID, ASCENSION_1_ICD_SECONDS)
        )
          return;
        gainKitResource(
          kitEffectState,
          characterId,
          RESOLVE_RESOURCE_ID,
          ASCENSION_1_RESOLVE_STACKS,
          RESOLVE_MAX_STACKS,
        );
        return;
      }

      const memberIds = getDeployedCharacterIds(party);
      const otherMemberIds = memberIds.filter((memberId) => memberId !== characterId);
      if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (effect.kind !== "stance" || effect.characterId !== characterId || constellationCount < CONSTELLATION_4)
          return;
        for (const memberId of otherMemberIds) {
          const member = characterIdCombatantMap.get(memberId);
          if (member)
            buffKitMember(kitEffectState, memberId, {
              amount: CONSTELLATION_4_ATTACK_SHARE * member.attributes.attributeTotalMap[Attribute.BaseAttack],
              attribute: Attribute.Attack,
              secondsRemaining: CONSTELLATION_4_SECONDS,
              source: CONSTELLATION_4_SOURCE,
            });
        }
        return;
      }

      if (event.kind !== KitEventKind.DamageTaken) return;
      const { enemy, hit, striker } = event;
      const restoreCount = findKitStatus(kitEffectState.effects, characterId, RESTORE_COUNT_ID)?.stacks ?? 0;
      if (
        musouIsshinStance &&
        striker.characterId === characterId &&
        [...musouIsshinStance.combatant.kit.normalAttacks, musouIsshinStance.combatant.kit.chargedAttack].some(
          ({ hits }) => hits.includes(hit),
        ) &&
        restoreCount < RESTORE_MAX_COUNT &&
        startKitCooldown(kitEffectState, characterId, RESTORE_ICD_ID, RESTORE_ICD_SECONDS)
      ) {
        // The count lasts as long as the stance, so the next cast starts its own
        addKitStatus(kitEffectState, characterId, {
          id: RESTORE_COUNT_ID,
          secondsRemaining: musouIsshinStance.secondsRemaining,
          stacks: restoreCount + 1,
        });
        // Ascension 4 raises the energy by each whole 1% of her Energy Recharge past 100%
        const excessEnergyRecharge = Math.max(combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge] - 1, 0);
        const energy =
          restoreEnergy *
          (1 +
            (ascension >= ASCENSION_4
              ? Math.floor(excessEnergyRecharge * 100) * ASCENSION_4_RESTORE_BONUS_PER_PERCENT
              : 0));
        // A fallen member gains none, as it has lost its energy
        for (const memberId of memberIds) {
          const member = characterIdCombatantMap.get(memberId);
          if (member && !checkIsCharacterDown(party, memberId)) gainPartyMemberEnergy(party, member, energy);
        }
        if (constellationCount >= CONSTELLATION_6)
          for (const memberId of otherMemberIds) {
            const partyMember = getPartyMember(party, memberId);
            partyMember.burstCooldownSeconds = Math.max(
              partyMember.burstCooldownSeconds - CONSTELLATION_6_COOLDOWN_SECONDS,
              0,
            );
          }
      }
      // A hit of no multiplier deals no damage of its own, and the coordinated attack sets off no other
      if (
        hit === coordinatedAttack ||
        hit.talentMultiplier === 0 ||
        !checkHasKitStatus(kitEffectState.effects, striker.characterId, EYE_STATUS_ID) ||
        !startKitCooldown(kitEffectState, characterId, COORDINATED_ATTACK_ICD_ID, COORDINATED_ATTACK_ICD_SECONDS)
      )
        return;
      castKitSummon(kitEffectState, { facing: 0, height: 0, position: enemy.position }, combatant, [coordinatedAttack]);
    },
    // The skill's hit lands from a summon at the body, and the Eye reaches every member of the deployed team from a task
    // That gives it as it runs
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, [skillHit]);
        scheduleKitTask(
          kitEffectState,
          combatant.characterId,
          eyeDelaySeconds,
          ({ kitEffectState: tickEffectState, party }) => {
            for (const characterId of getDeployedCharacterIds(party))
              addKitStatus(tickEffectState, characterId, { id: EYE_STATUS_ID, secondsRemaining: eyeSeconds });
          },
          { id: EYE_PENDING_TASK_ID },
        );
      },
    },
  };
};
