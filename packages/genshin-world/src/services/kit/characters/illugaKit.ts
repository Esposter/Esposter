import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { startKitHauntedNight } from "#src/services/kit/effects/startKitHauntedNight";

export const ILLUGA_CHARACTER_ID = 10_000_127;

// Shadowless Reflection, as the wiki's talent text gives it: the burst gains Haunted Night's Oriole-Song effect for 20
// Seconds, and while it is active Illuga gains 21 stacks of Nightingale's Song
const HAUNTED_NIGHT_SECONDS = 20;
const NIGHTINGALE_SONG_STACKS = 21;

// Illuga's behaviour: Shadowless Reflection lights the lamp and starts Haunted Night's Oriole-Song. Her strikes, charged
// Attack, plunges, skill and burst's hits are her record's alone, and her frames and areas are provisional, read from
// Borrowed donors' gcsim hitmarks and areas.
// Not built: Nightingale's Song's stacks are not spent on the Geo hits nearby party members deal, so neither the Geo DMG
// Bonus they give nor the stacks running out is read yet
// Constellation 1 needs his Geo reactions and their 15-second cooldown, which the kit does not read
// Constellation 2's text is not in the wiki cache, so the kit does not build it
// Constellation 4 needs Solarhunting Wolf's Oriole-Song stacks and damage, which the kit does not build
// Constellation 6 needs the Torchforger's Covenant Lightkeeper's Oath enhancement, which the kit does not build
export const createIllugaKitBehaviour = (): KitBehaviour => {
  const shadowlessReflection: KitActionBehaviour = {
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      startKitHauntedNight(kitEffectState, combatant.characterId, {
        secondsRemaining: HAUNTED_NIGHT_SECONDS,
        stacks: NIGHTINGALE_SONG_STACKS,
      }),
  };
  return { burst: shadowlessReflection };
};
