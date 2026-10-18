import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim (MIT) sayu/burst.go, Muji-Muji Daruma a field of radius 10 a metre and a half ahead, each of its ticks a
// Strike on the nearest enemy in it and a heal of the active character at 70% HP or under. The Daruma's strike is a
// Summon here, its every tick striking whatever is in reach, as gcsim strikes one enemy
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/sayu/burst.go
const BURST_FIELD_CENTRE_METRES = 1.5;
const BURST_FIELD_RADIUS = 10;
const BURST_HEAL_HP_SHARE = 0.7;

export const SAYU_CHARACTER_ID = 10_000_053;

// Sayu's behaviour: Yoohoo Art: Mujina Flurry heals the active character as it is cast, and casts Muji-Muji Daruma, whose
// Ticks strike as a summon and heal as a field. Her passives and constellations are not built, as no kit event reaches a
// Value the fetched sources give. The roll's Elemental kick, which takes the element a roll absorbs, is not built, as the
// Kit has no absorption check to read it
// Constellation 1 needs the Muji-Muji Daruma's attacks on nearby opponents and its heals, which the kit does not build
// Constellation 2 needs the roll's time spent rolling, which the kit does not read, for the kick's DMG
// Constellation 6 needs an Elemental Mastery bonus on the Muji-Muji Daruma's attacks and heals, not built
export const createSayuKitBehaviour = ({ readHits, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  // Mujina Flurry's heal and Muji-Muji Daruma's heal are each a flat amount and a share of Sayu's ATK, read at the cast
  const burstInitialHealFlat = readParameter("mujinaFlurryFlatHealing");
  const burstInitialHealAttackShare = readParameter("mujinaFlurryHealingAttackShare");
  const burstTickHealFlat = readParameter("mujiMujiDarumaFlatHealing");
  const burstTickHealAttackShare = readParameter("mujiMujiDarumaHealingAttackShare");
  const darumaTicks = readHits("mujiMujiDarumaTicks");
  const darumaFirstTickSeconds = readSeconds("mujiMujiDarumaFirstTick");
  const darumaTickIntervalSeconds = readSeconds("mujiMujiDarumaTickInterval");
  const darumaSeconds = readSeconds("mujiMujiDaruma");
  return {
    burst: {
      // The initial heal lands at the cast, on the active character, from the ATK the cast reads, and the Daruma is a field
      // Of its ticks, each a strike and a heal, cast where Sayu stands and priced by her as she stood then
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { attack } = combatant.attributes;
        const initialHeal = burstInitialHealFlat + attack * burstInitialHealAttackShare;
        scheduleKitTask(kitEffectState, combatant.characterId, 0, (tick) =>
          changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, initialHeal),
        );
        castKitSummon(kitEffectState, body, combatant, darumaTicks);
        const ahead = createAheadBody(body, BURST_FIELD_CENTRE_METRES);
        castKitField(kitEffectState, combatant.characterId, ahead.position, {
          nextTickSeconds: darumaFirstTickSeconds,
          onTick: (tick) => {
            const { characterId } = tick.activeCombatant;
            if (getPartyMember(tick.party, characterId).healthShare > BURST_HEAL_HP_SHARE) return;
            changeKitMemberHealth(tick, combatant, characterId, burstTickHealFlat + attack * burstTickHealAttackShare);
          },
          radius: BURST_FIELD_RADIUS,
          secondsRemaining: darumaSeconds,
          tickIntervalSeconds: darumaTickIntervalSeconds,
        });
      },
    },
  };
};
