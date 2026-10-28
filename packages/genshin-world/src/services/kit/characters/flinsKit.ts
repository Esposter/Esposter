import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsAscendantGleam } from "#src/services/kit/checkIsAscendantGleam";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

export const FLINS_CHARACTER_ID = 10_000_120;

// Whispering Flame, from Ascension 4: his Elemental Mastery rises by 8% of his ATK, to at most 160
const ASCENSION_4 = 4;
const WHISPERING_FLAME_ATTACK_SHARE = 0.08;
const WHISPERING_FLAME_MAX_BONUS = 160;

// Constellation 4, Night on Bald Mountain: Flins's ATK is raised by this share
const CONSTELLATION_4_ATTACK_PERCENT = 0.2;

// Measured: gcsim v2.47.2 (MIT) flins/cons.go, Constellation 1: each Lunar-Charged reaction on an enemy, from any member of
// The team, gives Flins 8 Energy, once every 5.5 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/flins/cons.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ENERGY = 8;
const CONSTELLATION_1_ICD_SECONDS = 5.5;
const CONSTELLATION_1_ICD_ID = "flins-c1-icd";

// Flins's behaviour: Manifest Flame's press plays no hit of its own, as gcsim's Arcane Light deals no damage; it starts a
// Stance for the Manifest Flame's seconds, ending as he leaves the field, whose strikes and charged attack are the Electro
// Ones. Not built yet: Thunderous Symphony, the burst Northland Spearstorm arms for six seconds, whose hits are
// Lunar-Charged; Northland Spearstorm, the stance's skill, which waits on a stance's own skill cooldown, so the stance
// Keeps the kit's own skill as Raiden's Musou Isshin does; Cometh the Night's middle hits' Lunar-Charged reaction, which the builder sources for the first middle hit only; and
// Constellation 4's ATK is built; its Elemental Mastery part needs the ATK total, which a passive bonus does not read.
// His passives, and Constellations 2 and 6, read the Lunar-Charged reaction or the Manifest Flame's own skill
// Constellation 1's Energy from the team's Lunar-Charged reactions is built; its shorter Spearstorm cooldown needs Spearstorm,
// Not built
// Constellation 2 needs the six seconds after Northland Spearstorm and his next Normal Attack's hit, not built
// Constellation 6 needs the Lunar-Charged reactions' DMG as a special DMG boost, which the kit does not read, not built
export const createFlinsKitBehaviour = ({ readParameter, readStance }: KitRecordReader): KitBehaviour => {
  const manifestFlameSeconds = readParameter("manifestFlameSeconds");
  // The Electro strikes are Normal Attack DMG and the charged attack Extra, gcsim's AttackTagNormal and AttackTagExtra in
  // Flins/attack.go and charge.go, so each group takes its kit tag
  const manifestFlame = readStance("manifestFlame");
  return {
    // Cometh the Night's middle hits: two land always, and two more at Ascendant Gleam, as gcsim's burst reads the Moonsign
    // Level when its initial hit lands, the team's composition not changing within the burst
    burst: { hits: [{}, {}, {}, { landsWhen: checkIsAscendantGleam }, { landsWhen: checkIsAscendantGleam }, {}] },
    getPassiveBonuses: (combatant) => [
      ...(combatant.ascension < ASCENSION_4
        ? []
        : [
            {
              amount: Math.min(combatant.attributes.attack * WHISPERING_FLAME_ATTACK_SHARE, WHISPERING_FLAME_MAX_BONUS),
              attribute: Attribute.ElementalMastery,
            },
          ]),
      ...(combatant.constellationCount >= 4
        ? [{ amount: CONSTELLATION_4_ATTACK_PERCENT, attribute: Attribute.AttackPercent }]
        : []),
    ],
    // Constellation 1: a Lunar-Charged reaction the team's hits trigger gives Energy, once every 5.5 seconds
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (
        combatant.constellationCount < CONSTELLATION_1 ||
        event.kind !== KitEventKind.ReactionTriggered ||
        !event.reactions.some(({ reactionType }) => reactionType === ReactionType.LunarCharged) ||
        !startKitCooldown(kitEffectState, combatant.characterId, CONSTELLATION_1_ICD_ID, CONSTELLATION_1_ICD_SECONDS)
      )
        return;
      gainPartyMemberEnergy(party, combatant, CONSTELLATION_1_ENERGY);
    },
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        enterKitStance(kitEffectState, combatant, manifestFlame, manifestFlameSeconds, { isEndedOnSwap: true });
      },
    },
  };
};
