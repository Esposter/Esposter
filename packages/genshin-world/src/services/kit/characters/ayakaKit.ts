import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

// Blizzard Blade Seki no To, from two constellations, casts two smaller storms beside the storm, as the wiki's
// Constellation page and gcsim v2.47.2 (MIT) ayaka/burst.go give it
// https://genshin-impact.fandom.com/wiki/Blizzard_Blade_Seki_no_To
const BLIZZARD_BLADE_SEKI_NO_TO_CONSTELLATION = 2;
// Kamisato Art: Senho infuses Ayaka's attacks with Cryo for 5 seconds as she reappears, as the wiki's Senho page and gcsim
// V2.47.2 (MIT) ayaka/dash.go's 300 frames give. Each step of the sprint restarts it, so it runs out 5 seconds after the
// Sprint ends
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/dash.go
const SENHO_INFUSION_SECONDS = 5;

export const AYAKA_CHARACTER_ID = 10_000_002;

// Kamisato Ayaka's behaviour: Kamisato Art: Soumetsu casts its storm, a summon standing where she cast it and priced by
// Her, and from two constellations Blizzard Blade Seki no To's two smaller storms beside it, and Kamisato Art: Senho
// Infuses her attacks with Cryo as she sprints. Senho's Cryo application and movement, A1's and A4's effects, and every
// Constellation but Blizzard Blade Seki no To are not built
export const createAyakaKitBehaviour = ({ readHits }: KitRecordReader): KitBehaviour => {
  const frostflakeHits = readHits("frostflake");
  const smallFrostflakeHits = readHits("smallFrostflake");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, frostflakeHits);
        if (combatant.constellationCount < BLIZZARD_BLADE_SEKI_NO_TO_CONSTELLATION) return;
        castKitSummon(kitEffectState, body, combatant, smallFrostflakeHits);
        castKitSummon(kitEffectState, body, combatant, smallFrostflakeHits);
      },
    },
    onSprint: ({ activeCombatant: combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Cryo,
        kind: "infusion",
        secondsRemaining: SENHO_INFUSION_SECONDS,
      }),
  };
};
