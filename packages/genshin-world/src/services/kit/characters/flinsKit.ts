import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";

export const FLINS_CHARACTER_ID = 10_000_120;

// Whispering Flame, from Ascension 4: his Elemental Mastery rises by 8% of his ATK, to at most 160
const ASCENSION_4 = 4;
const WHISPERING_FLAME_ATTACK_SHARE = 0.08;
const WHISPERING_FLAME_MAX_BONUS = 160;

// Constellation 4, Night on Bald Mountain: Flins's ATK is raised by this share
const CONSTELLATION_4_ATTACK_PERCENT = 0.2;

// Flins's behaviour: Manifest Flame's press plays no hit of its own, as gcsim's Arcane Light deals no damage; it starts a
// Stance for the Manifest Flame's seconds, ending as he leaves the field, whose strikes and charged attack are the Electro
// Ones. Not built yet: Thunderous Symphony, the burst Northland Spearstorm arms for six seconds, whose hits are
// Lunar-Charged; Northland Spearstorm, the stance's skill, which waits on a stance's own skill cooldown, so the stance
// Keeps the kit's own skill as Raiden's Musou Isshin does; Cometh the Night's middle hits, which are Lunar-Charged; and
// Constellation 4's ATK is built; its Elemental Mastery part needs the ATK total, which a passive bonus does not read.
// His passives, and Constellations 1, 2 and 6, read the Lunar-Charged reaction or the Manifest Flame's own skill
// Constellation 1 needs Spearstorm's four-second cooldown and party members' Lunar-Charged reactions, not built
// Constellation 2 needs the six seconds after Northland Spearstorm and his next Normal Attack's hit, not built
// Constellation 6 needs the Lunar-Charged reactions' DMG as a special DMG boost, which the kit does not read, not built
export const createFlinsKitBehaviour = ({ readParameter, readStance }: KitRecordReader): KitBehaviour => {
  const manifestFlameSeconds = readParameter("manifestFlameSeconds");
  // The Electro strikes are Normal Attack DMG and the charged attack Extra, gcsim's AttackTagNormal and AttackTagExtra in
  // Flins/attack.go and charge.go, so each group takes its kit tag
  const manifestFlame = readStance("manifestFlame");
  return {
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
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, manifestFlame, manifestFlameSeconds, { isEndedOnSwap: true }),
    },
  };
};
