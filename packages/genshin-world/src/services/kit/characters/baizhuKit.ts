import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { createConstellationSkillChargeBonus } from "#src/services/kit/createConstellationSkillChargeBonus";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";

export const BAIZHU_CHARACTER_ID = 10_000_082;

// Constellation 1 gives Universal Diagnosis a charge, and Constellation 4 raises the team's Elemental Mastery by 80 for 15
// Seconds after Holistic Revivification, as the wiki's constellation table gives them
const CONSTELLATION_1 = 1;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ELEMENTAL_MASTERY = 80;
const CONSTELLATION_4_SECONDS = 15;
const CONSTELLATION_4_SOURCE = "baizhu-ancient-art-of-perception";

// Baizhu's behaviour: Holistic Revivification sets a seamless shield at the cast that lasts to gcsim's expiry of the
// First, the gap-free window gcsim gives it, and casts a field that recasts the shield on gcsim's schedule wherever the
// Body stands, each recast exploding the shield it replaces as Spiritvein, priced by Baizhu as the body on the field
// Stands when it goes off. Constellations 1 and 4 are built. Not built yet: Constellations 2 and 6, which need a hook that
// Reads another member's hits for Gossamer Sprite: Splice and the Sprite's hits, Gossamer Sprite's bounces and healing, the Seamless Shield's heals and its removal's heal, and the Ascension
// Passives, which read the wearer's HP and the reactions the team deals
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/baizhu
export const createBaizhuKitBehaviour = ({ readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const shieldMaxHealthShare = readParameter("seamlessShieldMaxHealthShare");
  const shieldFlatHealth = readParameter("seamlessShieldFlatHealth");
  const firstShieldSeconds = readSeconds("firstSeamlessShield");
  const shieldSeconds = readSeconds("seamlessShield");
  const firstRefreshSeconds = readSeconds("firstSeamlessShieldRefresh");
  const refreshIntervalSeconds = readSeconds("seamlessShieldRefreshInterval");
  const refreshFieldSeconds = readSeconds("seamlessShieldRefreshField");
  const spiritvein = readHit("spiritvein");
  // The shield a cast or a recast sets on the team, its health the share of Max HP plus its flat amount, and its explosion
  const castShield = (kitEffectState: KitEffectState, combatant: Combatant, secondsRemaining: number): KitShield =>
    castKitShield(kitEffectState, combatant.characterId, {
      element: Element.Dendro,
      explosion: { combatant, hit: spiritvein },
      health: shieldMaxHealthShare * combatant.attributes.maxHealth + shieldFlatHealth,
      secondsRemaining,
    });
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        castShield(kitEffectState, combatant, firstShieldSeconds);
        if (combatant.constellationCount >= CONSTELLATION_4)
          buffKitTeam(kitEffectState, party, {
            amount: CONSTELLATION_4_ELEMENTAL_MASTERY,
            attribute: Attribute.ElementalMastery,
            secondsRemaining: CONSTELLATION_4_SECONDS,
            source: CONSTELLATION_4_SOURCE,
          });
        // The field recasts the shield at each refresh, from wherever the body stands, so its radius reaches every body
        castKitField(kitEffectState, combatant.characterId, body.position, {
          nextTickSeconds: firstRefreshSeconds,
          onTick: ({ kitEffectState: tickKitEffectState }) => castShield(tickKitEffectState, combatant, shieldSeconds),
          secondsRemaining: refreshFieldSeconds,
          tickIntervalSeconds: refreshIntervalSeconds,
        });
      },
    },
    getSkillChargeBonus: createConstellationSkillChargeBonus(CONSTELLATION_1),
  };
};
