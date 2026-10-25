import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

export const MIKA_CHARACTER_ID = 10_000_080;
export const EAGLEPLUME_ID = "eagleplume";
export const EAGLEPLUME_INTERVAL_ID = "eagleplume-interval";
export const SOULWIND_ID = "soulwind";
const CONSTELLATION_1 = 1;
// The seconds the Eagleplume state lasts, the interval between its heals and the seconds Soulwind lasts. The wiki leaves
// Them unstated, so gcsim's 15, 2.5 and 12 stand
const EAGLEPLUME_SECONDS = 15;
const EAGLEPLUME_INTERVAL_SECONDS = 2.5;
const SOULWIND_SECONDS = 12;

// Mika's behaviour: Skyfeather Song's initial heal on the character on the field, which grants every party member the
// Eagleplume state, and the heal that state gives a character on each of its normal attacks, once per interval. Starfrost
// Swirl's press and hold grant every party member Soulwind, its ATK SPD bonus, and Constellation 1 shortens the interval
// Under Soulwind by that bonus. The Rimestar Shard is not built, nor are Constellations 2, 4 and 6
// Constellation 2 needs Detector stacks from the Suppressive Barrage Ascension talent, which are not built
// Constellation 4 needs the Eagleplume's heals to restore Energy to Mika, which is not built
// Constellation 6 needs Detector stacks, which are not built, and a CRIT DMG bonus the kit cannot apply
export const createMikaKitBehaviour = ({ readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const flatHeal = readParameter("initialHealFlatHealth");
  const maxHealthShare = readParameter("initialHealMaxHealthShare");
  const initialHealSeconds = readSeconds("initialHeal");
  // Soulwind on every party member for its seconds, with the ATK SPD bonus the skill gives. Read when it casts, so the kit
  // Builds from a record that lacks the bonus
  const grantSoulwind = ({ kitEffectState, party }: KitContext) => {
    const atkSpdBonus = readParameter("atkSpdBuff");
    for (const characterId of getDeployedCharacterIds(party)) {
      buffKitMember(kitEffectState, characterId, {
        amount: atkSpdBonus,
        attribute: Attribute.NormalAttackSpeed,
        secondsRemaining: SOULWIND_SECONDS,
        source: SOULWIND_ID,
      });
      addKitStatus(kitEffectState, characterId, { id: SOULWIND_ID, secondsRemaining: SOULWIND_SECONDS });
    }
  };
  return {
    // Its initial heal lands on the active character at its frame, and the field that carries it ticks once then, healing
    // By its flat part plus its share of the healer's Max HP, and granting every party member the Eagleplume state
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitField(kitEffectState, combatant.characterId, body.position, {
          nextTickSeconds: initialHealSeconds,
          onTick: (tick) => {
            const maxHealth = getKitMaxHealth(
              combatant,
              tick.kitEffectState.effects,
              tick.party,
              tick.characterIdCombatantMap,
            );
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              flatHeal + maxHealthShare * maxHealth,
            );
            for (const characterId of getDeployedCharacterIds(tick.party))
              addKitStatus(tick.kitEffectState, characterId, {
                id: EAGLEPLUME_ID,
                secondsRemaining: EAGLEPLUME_SECONDS,
              });
          },
          secondsRemaining: 1,
          tickIntervalSeconds: 1,
        });
      },
    },
    // A character under the Eagleplume state heals by the flat part plus the share of Mika's Max HP on its normal attack,
    // Once per interval for that character alone
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.EnemyHit || event.attackTag !== AttackTag.NormalAttack) return;
      const { striker } = event;
      const { effects } = context.kitEffectState;
      if (!checkIsKitStatusActive(effects, striker.characterId, EAGLEPLUME_ID)) return;
      // Constellation 1's Soulwind shortens the interval by its ATK SPD bonus, for the character under it
      const interval =
        combatant.constellationCount >= CONSTELLATION_1 &&
        checkIsKitStatusActive(effects, striker.characterId, SOULWIND_ID)
          ? EAGLEPLUME_INTERVAL_SECONDS * (1 - readParameter("atkSpdBuff"))
          : EAGLEPLUME_INTERVAL_SECONDS;
      if (!startKitCooldown(context.kitEffectState, striker.characterId, EAGLEPLUME_INTERVAL_ID, interval)) return;
      const maxHealth = getKitMaxHealth(combatant, effects, context.party, context.characterIdCombatantMap);
      changeKitMemberHealth(
        context,
        combatant,
        striker.characterId,
        readParameter("burstHealF") + readParameter("burstHealP") * maxHealth,
      );
    },
    skill: { onStart: grantSoulwind },
    skillHolds: [{ onStart: grantSoulwind }],
  };
};
