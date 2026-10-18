import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitField } from "#src/services/kit/effects/castKitField";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";

export const MIKA_CHARACTER_ID = 10_000_080;

// Mika's behaviour: Skyfeather Song's initial heal on the character on the field, which gcsim makes depend on ping and the
// Kit takes at its constant frame. The Rimestar Shard, Eagleplume's heals on each party member's normal attack and the
// Team's ATK SPD bonus are not built, nor are his passives or constellations
// Constellation 1 needs the Soulwind's ATK SPD and the Eagleplume's heal interval, which are not built
// Constellation 2 needs Detector stacks from the Suppressive Barrage Ascension talent, which are not built
// Constellation 4 needs the Eagleplume's heals on party members, which are not built
// Constellation 6 needs Detector stacks, which are not built, and a CRIT DMG bonus the kit cannot apply
export const createMikaKitBehaviour = ({ readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const flatHeal = readParameter("initialHealFlatHealth");
  const maxHealthShare = readParameter("initialHealMaxHealthShare");
  const initialHealSeconds = readSeconds("initialHeal");
  return {
    // Its initial heal lands on the active character at its frame, and the field that carries it ticks once then, healing
    // By its flat part plus its share of the healer's Max HP
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitField(kitEffectState, combatant.characterId, body.position, {
          nextTickSeconds: initialHealSeconds,
          onTick: (tick) =>
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              flatHeal + maxHealthShare * combatant.attributes.maxHealth,
            ),
          secondsRemaining: 1,
          tickIntervalSeconds: 1,
        });
      },
    },
  };
};
