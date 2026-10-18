import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

export const COLLEI_CHARACTER_ID = 10_000_067;

// Constellation 4, Gift of the Woods: Trump-Card Kitty raises the Elemental Mastery of each other deployed member by 60 for 12
// Seconds, as the wiki's constellation page gives it
const CONSTELLATION_4 = 4;
// Constellation 1: off the field, Collei gains 20% Energy Recharge, as gcsim (MIT) collei/cons.go's c1 gives it
const CONSTELLATION_1 = 1;
const OFF_FIELD_ENERGY_RECHARGE = 0.2;
const TRUMP_CARD_KITTY_ELEMENTAL_MASTERY = 60;
const TRUMP_CARD_KITTY_BUFF_SECONDS = 12;

// Collei's behaviour: Trump-Card Kitty's leap, a field cast where the kitty was cast, which lands each leap's hit from
// There for the kitty's seconds past its explosion. Her passives are not built yet: Sprout and The
// Zone's extension wait on a reaction a party member's hit causes
// Constellation 2 needs the Ascension talent Floral Sidewinder, which is not built
// Constellation 6 needs the Floral Ring's hit to cast a miniature Cuilein-Anbar summon, which is not built
export const createColleiKitBehaviour = ({ kit, readHit, readSeconds }: KitRecordReader): KitBehaviour => {
  const explosionHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const leap = readHit("leap");
  const leapFirstTickSeconds = readSeconds("leapFirstTick");
  const leapTickIntervalSeconds = readSeconds("leapTickInterval");
  const trumpCardKittySeconds = readSeconds("trumpCardKitty");
  return {
    // Constellation 1's Energy Recharge reads whether Collei is on the field from the deployed team's flags
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants) => {
      const self = deployedCombatants.find(({ characterId }) => characterId === combatant.characterId);
      return combatant.constellationCount >= CONSTELLATION_1 && self !== undefined && !self.isOnField
        ? [{ amount: OFF_FIELD_ENERGY_RECHARGE, attribute: Attribute.EnergyRecharge }]
        : [];
    },
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState, party }) => {
        if (combatant.constellationCount >= CONSTELLATION_4)
          for (const characterId of getDeployedCharacterIds(party))
            if (characterId !== combatant.characterId)
              buffKitMember(kitEffectState, characterId, {
                amount: TRUMP_CARD_KITTY_ELEMENTAL_MASTERY,
                attribute: Attribute.ElementalMastery,
                secondsRemaining: TRUMP_CARD_KITTY_BUFF_SECONDS,
              });
        // The leap's field ticks from the kitty's first leap while its status lasts, and each tick's hit is cast where the
        // Kitty was cast, so it lands from there whatever the body does after
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: leapFirstTickSeconds,
          onTick: ({ kitEffectState: tickEffectState }) => {
            castKitSummon(tickEffectState, { facing, height, position: field.centre }, combatant, [leap]);
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining: explosionHitmarkSeconds + trumpCardKittySeconds,
          tickIntervalSeconds: leapTickIntervalSeconds,
        });
      },
    },
  };
};
