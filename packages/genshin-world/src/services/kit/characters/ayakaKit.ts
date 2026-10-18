import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// Blizzard Blade Seki no To, from two constellations, casts two smaller storms beside the storm, as the wiki's
// Constellation page and gcsim v2.47.2 (MIT) ayaka/burst.go give it
// https://genshin-impact.fandom.com/wiki/Blizzard_Blade_Seki_no_To
const BLIZZARD_BLADE_SEKI_NO_TO_CONSTELLATION = 2;
// Kamisato Art: Senho infuses Ayaka's attacks with Cryo for 5 seconds as she reappears, as the wiki's Senho page and gcsim
// V2.47.2 (MIT) ayaka/dash.go's 300 frames give. Each step of the sprint restarts it, so it runs out 5 seconds after the
// Sprint ends
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/dash.go
const SENHO_INFUSION_SECONDS = 5;
// Constellation 1, Snowswept Sakura: each of her normal or charged attacks' hits on an enemy has a 50% chance to cut Kamisato
// Art: Hyouka's running cooldown by 0.3 seconds, once every 0.1 seconds, from the wiki's constellation table
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CHANCE = 0.5;
const CONSTELLATION_1_CUT_SECONDS = 0.3;
const CONSTELLATION_1_ICD_SECONDS = 0.1;
const CONSTELLATION_1_ICD_STATUS_ID = "ayaka-snowswept-sakura-icd";

export const AYAKA_CHARACTER_ID = 10_000_002;

// Kamisato Ayaka's behaviour: Kamisato Art: Soumetsu casts its storm, a summon standing where she cast it and priced by
// Her, and from two constellations Blizzard Blade Seki no To's two smaller storms beside it, and Kamisato Art: Senho
// Infuses her attacks with Cryo as she sprints. Constellation 1 cuts Hyouka's running cooldown on her normal and charged
// Hits. Senho's Cryo application and movement, A1's and A4's effects, and Constellations 4 and 6 are not built: 4's DEF
// Reduction needs a status that changes an enemy's defence, and 6's charged attack bonus needs a DMG bonus that only her
// Charged attack reads
// Constellation 1's roll on a hit of her normal or charged attack, read as the hit strikes an enemy
const snowsweptSakuraHit: KitHitBehaviour = {
  onStrike: ({ kitEffectState, party, random }, { combatant }) => {
    if (combatant.constellationCount < CONSTELLATION_1) return;
    if (
      !startKitCooldown(
        kitEffectState,
        combatant.characterId,
        CONSTELLATION_1_ICD_STATUS_ID,
        CONSTELLATION_1_ICD_SECONDS,
      )
    )
      return;
    if (random() < CONSTELLATION_1_CHANCE)
      changeKitSkillCooldown(party, combatant.characterId, -CONSTELLATION_1_CUT_SECONDS);
  },
};

export const createAyakaKitBehaviour = ({ kit, readHits }: KitRecordReader): KitBehaviour => {
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
    chargedAttack: { hits: kit.chargedAttack.hits.map(() => snowsweptSakuraHit) },
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => snowsweptSakuraHit) })),
    onSprint: ({ activeCombatant: combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Cryo,
        kind: "infusion",
        secondsRemaining: SENHO_INFUSION_SECONDS,
      }),
  };
};
