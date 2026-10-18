import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { consumeKitNightingaleStacks } from "#src/services/kit/effects/consumeKitNightingaleStacks";
import { startKitHauntedNight } from "#src/services/kit/effects/startKitHauntedNight";

export const ILLUGA_CHARACTER_ID = 10_000_127;

// Shadowless Reflection, as the wiki's talent text gives it: the burst gains Haunted Night's Oriole-Song effect for 20
// Seconds, and while it is active Illuga gains 21 stacks of Nightingale's Song
const HAUNTED_NIGHT_SECONDS = 20;
const NIGHTINGALE_SONG_STACKS = 21;
// The stacks one Geo hit a nearby active party member lands on an enemy spends
const NIGHTINGALE_SONG_STACKS_PER_HIT = 1;

// Illuga's behaviour: Shadowless Reflection lights the lamp and starts Haunted Night's Oriole-Song. Each Geo hit a nearby
// Active party member lands on an enemy spends a stack of Nightingale's Song, Illuga's own hits aside. Her strikes, charged
// Attack, plunges, skill and burst's hits are her record's alone, and her frames and areas are provisional, read from
// Borrowed donors' gcsim hitmarks and areas.
// Not built: the Geo DMG bonus a stack gives, which the wiki gives as a share of Illuga's Elemental Mastery whose base
// Rate neither the wiki cache nor the dump's text holds; the stacks from Geo Constructs; the Lunar-Crystallize enhancement
// Constellation 1 needs his Geo reactions and their 15-second cooldown, which the kit does not read. The dump's text is
// Vigilant Sentinel: after a Geo-related reaction on the field, 12 Elemental Energy, at most once every 15 seconds
// Constellation 2 is Elk With Fanged Antlers, from the dump's TextMap: for every 7 stacks consumed, Aedon summons one
// Geo hit of 400% of Illuga's Elemental Mastery and 200% of his DEF on 1 nearby opponent, as Elemental Burst DMG, which
// The kit does not build, since that hit has no record
// Constellation 4 is Solarhunting Wolf, from the dump's TextMap: while Haunted Night's Oriole-Song is active, nearby active
// Party members gain 200 DEF, which the kit does not build
// Constellation 6 needs the Torchforger's Covenant Lightkeeper's Oath enhancement, which the kit does not build
export const createIllugaKitBehaviour = (): KitBehaviour => {
  const shadowlessReflection: KitActionBehaviour = {
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      startKitHauntedNight(kitEffectState, combatant.characterId, {
        secondsRemaining: HAUNTED_NIGHT_SECONDS,
        stacks: NIGHTINGALE_SONG_STACKS,
      }),
  };
  return {
    burst: shadowlessReflection,
    onKitEvent: (event, { activeCombatant, kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.EnemyHit ||
        event.element !== Element.Geo ||
        event.striker.characterId === combatant.characterId ||
        event.striker.characterId !== activeCombatant.characterId
      )
        return;
      consumeKitNightingaleStacks(kitEffectState, combatant.characterId, NIGHTINGALE_SONG_STACKS_PER_HIT);
    },
  };
};
