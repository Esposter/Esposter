import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";

import { Element } from "#src/models/Element";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";

export const BAIZHU_CHARACTER_ID = 10_000_082;

// Baizhu's behaviour: Holistic Revivification sets a seamless shield at the cast that lasts to gcsim's expiry of the
// First, the gap-free window gcsim gives it, and casts a field that recasts the shield on gcsim's schedule wherever the
// Body stands, each recast exploding the shield it replaces as Spiritvein, priced by Baizhu as the body on the field
// Stands when it goes off. Not built yet: his first constellation's extra charge of Universal Diagnosis, Constellations
// 2 to 6, Gossamer Sprite's bounces and healing, the Seamless Shield's heals and its removal's heal, and the Ascension
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
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castShield(kitEffectState, combatant, firstShieldSeconds);
        // The field recasts the shield at each refresh, from wherever the body stands, so its radius reaches every body
        castKitField(kitEffectState, combatant.characterId, body.position, {
          nextTickSeconds: firstRefreshSeconds,
          onTick: ({ kitEffectState: tickKitEffectState }) => castShield(tickKitEffectState, combatant, shieldSeconds),
          secondsRemaining: refreshFieldSeconds,
          tickIntervalSeconds: refreshIntervalSeconds,
        });
      },
    },
  };
};
