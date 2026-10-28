import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim (MIT) sayu/burst.go, Muji-Muji Daruma a field of radius 10 a metre and a half ahead, each of its ticks a
// Strike on the nearest enemy in it and a heal of the active character at 70% HP or under. The Daruma's strike is a
// Summon here, its every tick striking whatever is in reach, as gcsim strikes one enemy
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sayu/burst.go
const BURST_FIELD_CENTRE_METRES = 1.5;
const BURST_FIELD_RADIUS = 10;
const BURST_HEAL_HP_SHARE = 0.7;
// Measured: gcsim v2.47.2 (MIT) sayu/asc.go, and burst.go for the Daruma's strike. Ascension 1: a Swirl Sayu triggers while
// On the field heals the active character by 300 and 1.2 Elemental Mastery, once every 2 seconds. Ascension 4: the Daruma's
// Ticks strike within 3.5 metres, where they strike within 1 below it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sayu/asc.go
const ASCENSION_1 = 1;
const ASCENSION_1_HEAL_FLAT = 300;
const ASCENSION_1_HEAL_ELEMENTAL_MASTERY_SHARE = 1.2;
const ASCENSION_1_COOLDOWN_STATUS_ID = "sayu-a1-cooldown";
const ASCENSION_1_COOLDOWN_SECONDS = 2;
const ASCENSION_4 = 4;
const ASCENSION_4_DARUMA_RADIUS = 3.5;

export const SAYU_CHARACTER_ID = 10_000_053;

// Ascension 4 widens each Daruma tick's reach to the radius gcsim strikes within, as the tick hits are otherwise read
const withAscension4Radius = (hit: KitHit): KitHit => ({
  ...hit,
  hitArea: { ...hit.hitArea, radius: ASCENSION_4_DARUMA_RADIUS },
});

const CONSTELLATION_1 = 1;
// Constellation 1 and 6, as gcsim v2.47.2 (MIT) sayu/burst.go gives them: from Constellation 1 the Daruma's heal ignores the
// HP threshold. From Constellation 6 each of its ticks adds ATK times 0.2% of Elemental Mastery, at most 400% of ATK, to its
// DMG and heals by 3 Elemental Mastery, at most 6000, read from Sayu as she stood at the cast
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sayu/burst.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_DAMAGE_ELEMENTAL_MASTERY_SHARE = 0.002;
const CONSTELLATION_6_DAMAGE_ATTACK_SHARE_MAX = 4;
const CONSTELLATION_6_HEAL_ELEMENTAL_MASTERY_SHARE = 3;
const CONSTELLATION_6_HEAL_MAX = 6000;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_COOLDOWN_ID = "sayu-constellation-4-cooldown";
const CONSTELLATION_4_ENERGY = 1.2;
const CONSTELLATION_4_SECONDS = 2;

// Constellation 6's flat DMG on each of the Daruma's ticks, from the striker's ATK and Elemental Mastery as it stands
const getConstellation6DamageBonus = (striker: Combatant): number => {
  if (striker.constellationCount < CONSTELLATION_6) return 0;
  const attackShare = Math.min(
    elementalMasteryMultiplier(striker, CONSTELLATION_6_DAMAGE_ELEMENTAL_MASTERY_SHARE),
    CONSTELLATION_6_DAMAGE_ATTACK_SHARE_MAX,
  );
  return striker.attributes.attack * attackShare;
};

const withConstellation6Damage = (hit: KitHit): KitHit => ({
  ...hit,
  additiveBaseDamageBonus: getConstellation6DamageBonus,
});

// Constellation 6's heal on each of the Daruma's ticks, from Sayu's Elemental Mastery at the cast
const getConstellation6TickHeal = (combatant: Combatant): number => {
  if (combatant.constellationCount < CONSTELLATION_6) return 0;
  return Math.min(
    elementalMasteryMultiplier(combatant, CONSTELLATION_6_HEAL_ELEMENTAL_MASTERY_SHARE),
    CONSTELLATION_6_HEAL_MAX,
  );
};

// Sayu's behaviour: Yoohoo Art: Mujina Flurry heals the active character as it is cast, and casts Muji-Muji Daruma, whose
// Ticks strike as a summon and heal as a field. Ascension 1's heal on a Swirl, Ascension 4's wider Daruma, Constellation 1's
// Heal at any HP, Constellation 4's Energy on a Swirl and Constellation 6's Elemental Mastery on the Daruma are built. Her
// Constellation 2 is not built: it needs the roll's time spent rolling for the kick's DMG, and the roll's elemental kick,
// Which takes the element a roll absorbs, is not built, as the kit has no absorption check to read it
export const createSayuKitBehaviour = ({ readHits, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  // Mujina Flurry's heal and Muji-Muji Daruma's heal are each a flat amount and a share of Sayu's ATK, read at the cast
  const burstInitialHealFlat = readParameter("mujinaFlurryFlatHealing");
  const burstInitialHealAttackShare = readParameter("mujinaFlurryHealingAttackShare");
  const burstTickHealFlat = readParameter("mujiMujiDarumaFlatHealing");
  const burstTickHealAttackShare = readParameter("mujiMujiDarumaHealingAttackShare");
  const darumaTicks = readHits("mujiMujiDarumaTicks").map((hit) => withConstellation6Damage(hit));
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
        const tickHeal = burstTickHealFlat + attack * burstTickHealAttackShare + getConstellation6TickHeal(combatant);
        scheduleKitTask(kitEffectState, combatant.characterId, 0, (tick) => {
          changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, initialHeal);
        });
        castKitSummon(
          kitEffectState,
          body,
          combatant,
          combatant.ascension >= ASCENSION_4 ? darumaTicks.map((hit) => withAscension4Radius(hit)) : darumaTicks,
          { attackTag: AttackTag.ElementalBurst },
        );
        const ahead = createAheadBody(body, BURST_FIELD_CENTRE_METRES);
        castKitField(kitEffectState, combatant.characterId, ahead.position, {
          nextTickSeconds: darumaFirstTickSeconds,
          onTick: (tick) => {
            const { characterId } = tick.activeCombatant;
            // Constellation 1 heals the active character whatever its HP
            if (
              combatant.constellationCount < CONSTELLATION_1 &&
              getPartyMember(tick.party, characterId).healthShare > BURST_HEAL_HP_SHARE
            )
              return;
            changeKitMemberHealth(tick, combatant, characterId, tickHeal);
          },
          radius: BURST_FIELD_RADIUS,
          secondsRemaining: darumaSeconds,
          tickIntervalSeconds: darumaTickIntervalSeconds,
        });
      },
    },
    // Ascension 1: a Swirl Sayu triggers while she is on the field heals the active character, which is her, once every 2
    // Seconds, from the Elemental Mastery she stands with
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      const { activeCombatant, kitEffectState, party } = context;
      // Skiving: New and Improved, from Constellation 4: a Swirl Sayu triggers on the field restores 1.2 Energy to her,
      // Once every 2 seconds
      if (
        combatant.constellationCount >= CONSTELLATION_4 &&
        event.striker.characterId === combatant.characterId &&
        activeCombatant.characterId === combatant.characterId &&
        event.reactions.some(({ reactionType }) => reactionType === ReactionType.Swirl) &&
        startKitCooldown(kitEffectState, combatant.characterId, CONSTELLATION_4_COOLDOWN_ID, CONSTELLATION_4_SECONDS)
      )
        gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
      if (
        combatant.ascension < ASCENSION_1 ||
        event.striker.characterId !== combatant.characterId ||
        activeCombatant.characterId !== combatant.characterId ||
        !event.reactions.some(({ reactionType }) => reactionType === ReactionType.Swirl)
      )
        return;
      if (
        !startKitCooldown(
          kitEffectState,
          combatant.characterId,
          ASCENSION_1_COOLDOWN_STATUS_ID,
          ASCENSION_1_COOLDOWN_SECONDS,
        )
      )
        return;
      changeKitMemberHealth(
        context,
        combatant,
        activeCombatant.characterId,
        ASCENSION_1_HEAL_FLAT + elementalMasteryMultiplier(combatant, ASCENSION_1_HEAL_ELEMENTAL_MASTERY_SHARE),
      );
    },
  };
};
