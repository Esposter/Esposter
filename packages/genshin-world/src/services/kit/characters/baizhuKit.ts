import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Five Fortunes Forever, as the dump's Baizhuer_PermanentSkill_1 row (promote 1, params 0.5, 0.2 and 0.25) and
// Gcsim v2.47.2 (MIT) baizhu/asc.go give it: from Ascension 1, while the character on the field is at half their HP or
// More, Baizhu deals 25% more Dendro DMG
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/baizhu/asc.go
const FIVE_FORTUNES_FOREVER_ASCENSION = 1;
const FIVE_FORTUNES_FOREVER_HEALTH_SHARE = 0.5;
const FIVE_FORTUNES_FOREVER_DENDRO_DAMAGE_BONUS = 0.25;
// Gossamer Sprite: Splice, from Constellation 2: each hit an enemy takes from Baizhu's active member, or from Baizhu himself
// While he is on the field, sends a Splice of 250% of his ATK as Dendro DMG at the enemy it strikes, dealt as Elemental
// Skill DMG, once every five seconds, as gcsim v2.47.2 (MIT) baizhu/cons.go's c2 gives them, and as the dump's Constellation
// 2 row gives the multiplier and the cooldown. Its heal is not built
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/baizhu/cons.go
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_COOLDOWN_SECONDS = 5;
const CONSTELLATION_2_COOLDOWN_STATUS_ID = "baizhu-constellation-2-cooldown";
const CONSTELLATION_2_MULTIPLIER = 2.5;
// The Splice's circle reaches 0.6 metres about its target, as gcsim's NewCircleHitOnTarget gives it
const CONSTELLATION_2_RADIUS = 0.6;

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
// Stands when it goes off. Constellations 1 and 4 are built, and Constellation 2's Splice without its heal. From Ascension 1
// His Dendro hits deal more DMG while the character on the field is at half their HP or more. Not built yet: Constellation
// 2's heal, 20% of the Gossamer Sprite's normal healing, which the kit does not price; Constellation 6, which needs the
// Sprite's and the Splice's hits to make a Seamless Shield; Gossamer Sprite's bounces and healing; the Seamless Shield's
// Heals and its removal's heal; Ascension 1's Healing Bonus, which no heal of his reads and no passive hook reads the
// Field's HP for; and Ascension 4, which rides the Seamless Shield's heals
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/baizhu
// The Splice is queued at the enemy it strikes, so it lands in the step it is raised: gcsim gives it the skill's first
// Hitmark as a placeholder, a TODO in its source, which a passive's hit does not price
const gossamerSpliceHit: KitHit = {
  attackTag: AttackTag.ElementalSkill,
  element: Element.Dendro,
  hitArea: { angle: 2 * Math.PI, height: 2, radius: CONSTELLATION_2_RADIUS },
  hitmarkSeconds: 0,
  poiseDamage: 0,
  talentMultiplier: CONSTELLATION_2_MULTIPLIER,
};

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
    // Constellation 2: a hit the active member takes queues a Splice at its enemy, once the cooldown is off. The cooldown
    // Starts as the Splice is queued, so the Splice's own hit cannot queue another
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || combatant.constellationCount < CONSTELLATION_2) return;
      if (event.striker.characterId !== context.activeCombatant.characterId) return;
      if (
        !startKitCooldown(
          context.kitEffectState,
          combatant.characterId,
          CONSTELLATION_2_COOLDOWN_STATUS_ID,
          CONSTELLATION_2_COOLDOWN_SECONDS,
        )
      )
        return;
      queueKitPassiveHit(context, combatant, gossamerSpliceHit, event.enemy);
    },
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_1 ? 1 : 0),
  };
};
