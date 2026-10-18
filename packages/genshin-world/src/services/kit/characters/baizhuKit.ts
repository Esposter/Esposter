import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";

import { Element } from "#src/models/Element";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Five Fortunes Forever, as the dump's Baizhuer_PermanentSkill_1 row (promote 1, params 0.5, 0.2 and 0.25) and
// Gcsim v2.47.2 (MIT) baizhu/asc.go give it: from Ascension 1, while the character on the field is at half their HP or
// More, Baizhu deals 25% more Dendro DMG
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/baizhu/asc.go
const FIVE_FORTUNES_FOREVER_ASCENSION = 1;
const FIVE_FORTUNES_FOREVER_HEALTH_SHARE = 0.5;
const FIVE_FORTUNES_FOREVER_DENDRO_DAMAGE_BONUS = 0.25;

export const BAIZHU_CHARACTER_ID = 10_000_082;

// Baizhu's behaviour: Holistic Revivification sets a seamless shield at the cast that lasts to gcsim's expiry of the
// First, the gap-free window gcsim gives it, and casts a field that recasts the shield on gcsim's schedule wherever the
// Body stands, each recast exploding the shield it replaces as Spiritvein, priced by Baizhu as the body on the field
// Stands when it goes off. From Ascension 1 his Dendro hits deal more DMG while the character on the field is at half
// Their HP or more. Not built yet: his first constellation's extra charge of Universal Diagnosis, Constellations 2 to 6,
// Gossamer Sprite's bounces and healing, the Seamless Shield's heals and its removal's heal, Ascension 1's Healing Bonus,
// Which no heal of his reads and no passive hook reads the field's HP for, and Ascension 4, which rides the Seamless
// Shield's heals
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
    getStrikeDamageBonus: ({ combatant, hit }, _enemy, party) =>
      combatant.ascension >= FIVE_FORTUNES_FOREVER_ASCENSION &&
      getKitHitElement(hit, combatant) === Element.Dendro &&
      getPartyMember(party, getActiveCharacterId(party)).healthShare >= FIVE_FORTUNES_FOREVER_HEALTH_SHARE
        ? FIVE_FORTUNES_FOREVER_DENDRO_DAMAGE_BONUS
        : 0,
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
