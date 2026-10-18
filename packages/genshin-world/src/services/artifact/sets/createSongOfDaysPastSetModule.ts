import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { PassiveModule } from "#src/models/kit/PassiveModule";
import type { Party } from "#src/models/party/Party";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getKitHealedHp } from "#src/services/kit/getKitHealedHp";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

const YEARNING_ID = `songOfDaysPast${ID_SEPARATOR}yearning`;
const WAVES_ID = `songOfDaysPast${ID_SEPARATOR}waves`;
const SNAPSHOT_ID = `songOfDaysPast${ID_SEPARATOR}snapshot`;
// The attack tags a Waves stage's hits are counted from: a Normal, Charged or Plunging attack, or an elemental skill or burst
const WAVES_ATTACK_TAGS: readonly AttackTag[] = [
  AttackTag.NormalAttack,
  AttackTag.ChargedAttack,
  AttackTag.PlungingAttack,
  AttackTag.ElementalSkill,
  AttackTag.ElementalBurst,
];

const checkIsWavesAttackTag = (attackTag: AttackTag | undefined): boolean =>
  attackTag !== undefined && WAVES_ATTACK_TAGS.includes(attackTag);

// The Yearning is the team's one, opened by whichever wearer's heal came first, so it is found among the team's effects
const findYearning = (effects: readonly KitEffect[]): KitStatus | undefined =>
  effects.find((effect): effect is KitStatus => effect.kind === "status" && effect.id === YEARNING_ID);

// Song of Days Past. Its four-piece bonus records the HP its wearers' heals restore to the team, up to fifth param's HP, in a
// Yearning that lasts the first param's seconds, one at a time for the team. When it runs out, the record becomes a Waves
// Stage that lasts the second param's seconds and holds the third param's charges: each hit the active character lands with a
// Normal, Charged or Plunging attack, or an elemental skill or burst, adds the fourth param of the record as DMG, and spends one.
// The stage belongs to the wearer whose heal opened the Yearning, so its hooks read it from that wearer's kit alone and the
// Team's hits are priced and spent once
export const createSongOfDaysPastSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const yearningSeconds = takeOne(bonus.params, 0);
  const wavesSeconds = takeOne(bonus.params, 1);
  const wavesCharges = takeOne(bonus.params, 2);
  const damagePerRecord = takeOne(bonus.params, 3);
  const maximumRecord = takeOne(bonus.params, 4);

  // The flat base damage the stage the starter holds adds to a strike, if the strike is the active character's and a
  // Qualifying hit with charges left
  const getWavesDamage = (
    effects: readonly KitEffect[],
    starterCharacterId: number,
    strike: KitStrike,
    party: Party,
  ): number => {
    const charges = findKitStatus(effects, starterCharacterId, WAVES_ID)?.stacks ?? 0;
    if (
      charges === 0 ||
      strike.combatant.characterId !== getActiveCharacterId(party) ||
      !checkIsWavesAttackTag(strike.attackTag)
    )
      return 0;
    return (findKitStatus(effects, starterCharacterId, SNAPSHOT_ID)?.stacks ?? 0) * damagePerRecord;
  };

  return {
    getPartyStrikeBonus: (member, strike, _enemy, party, effects) => ({
      additiveBaseDamageBonus: getWavesDamage(effects, member.characterId, strike, party),
    }),
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, party, effects) =>
      getWavesDamage(effects, strike.combatant.characterId, strike, party),
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState, party } = context;
      // A heal its wearer gives records its HP into the Yearning, which it opens if none is running
      if (event.kind === KitEventKind.HealthChanged && event.sourceCharacterId === characterId) {
        const healed = getKitHealedHp(event, context.characterIdCombatantMap);
        if (healed <= 0) return;
        const yearning = findYearning(kitEffectState.effects);
        if (yearning) yearning.stacks = Math.min((yearning.stacks ?? 0) + healed, maximumRecord);
        else
          addKitStatus(kitEffectState, characterId, {
            id: YEARNING_ID,
            secondsRemaining: yearningSeconds,
            stacks: Math.min(healed, maximumRecord),
          });
        return;
      }
      // The record the Yearning ran out with is snapshotted into the Waves stage, which the wearer whose heal opened it holds
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.characterId === characterId &&
        event.effect.id === YEARNING_ID
      ) {
        const record = event.effect.stacks ?? 0;
        if (record === 0) return;
        addKitStatus(kitEffectState, characterId, { id: SNAPSHOT_ID, secondsRemaining: wavesSeconds, stacks: record });
        addKitStatus(kitEffectState, characterId, {
          id: WAVES_ID,
          secondsRemaining: wavesSeconds,
          stacks: wavesCharges,
        });
        return;
      }
      // Each qualifying hit the active character lands spends a charge of the stage
      if (
        event.kind === KitEventKind.EnemyHit &&
        event.striker.characterId === getActiveCharacterId(party) &&
        checkIsWavesAttackTag(event.attackTag)
      ) {
        const waves = findKitStatus(kitEffectState.effects, characterId, WAVES_ID);
        if (waves?.stacks) waves.stacks -= 1;
      }
    },
  };
};
