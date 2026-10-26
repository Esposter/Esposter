import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

const SESSHOU_SAKURA_ID = "yae-sesshou-sakura";

// Measured: gcsim v2.47.2 (MIT) yaemiko/kitsune.go, the totems stand at most three, and a fourth pops the oldest
const MAXIMUM_TOTEMS = 3;
// The Shrine's Sacred Shade, as the dump's Yae_PermanentSkill_1 row and gcsim v2.47.2 (MIT) yaemiko/asc.go give it: from
// Ascension 1, each totem the burst destroys resets the cooldown of one of Sesshou Sakura's charges, as kitsune.go calls
// A1 once for each totem it pops
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yaemiko/asc.go
const THE_SHRINES_SACRED_SHADE_ASCENSION = 1;
// Enlightened Blessing, as the dump's Yae_PermanentSkill_2 row and gcsim's asc.go give it: from Ascension 4, each point of
// Her Elemental Mastery raises the totems' DMG by 0.15%
const ENLIGHTENED_BLESSING_ASCENSION = 4;
const ENLIGHTENED_BLESSING_DAMAGE_PER_ELEMENTAL_MASTERY = 0.0015;
// Measured: gcsim (MIT) yaemiko/kitsune.go and cons.go, Constellation 6's DEF ignored on each Sesshou Sakura strike, which its
// Its c6DefIgnore gives 0.6, where the comment there says 45%, and the kit reads the code's value
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_DEFENCE_IGNORED = 0.6;
// Constellation 4, as gcsim (MIT) yaemiko/cons.go gives it: her Elemental Burst DMG rises 100%, and each lightning a
// Sesshou Sakura strikes gives the deployed team 20% Electro DMG Bonus for 5 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yaemiko/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_BURST_DAMAGE_BONUS = 1;
const CONSTELLATION_4_ELECTRO_DAMAGE_BONUS = 0.2;
const CONSTELLATION_4_ELECTRO_DAMAGE_SECONDS = 5;
const CONSTELLATION_4_ELECTRO_DAMAGE_SOURCE = "yae-constellation-4";

// A character's totems still standing, oldest first, as the effects are kept in the order they were added
const findStandingTotems = (effects: KitEffect[], characterId: number): KitSummon[] =>
  effects.filter(
    (effect): effect is KitSummon =>
      effect.kind === "summon" &&
      effect.id === SESSHOU_SAKURA_ID &&
      effect.combatant.characterId === characterId &&
      effect.secondsRemaining > 0,
  );

export const YAE_MIKO_CHARACTER_ID = 10_000_058;

// Each lightning Sesshou Sakura strikes gives the deployed team its Electro DMG Bonus from Constellation 4, a strike
// Restarting it for its seconds
const giveTeamElectroDamageBonus = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void => {
  if (combatant.constellationCount < CONSTELLATION_4) return;
  buffKitTeam(kitEffectState, party, {
    amount: CONSTELLATION_4_ELECTRO_DAMAGE_BONUS,
    attribute: Attribute.ElectroDamageBonus,
    secondsRemaining: CONSTELLATION_4_ELECTRO_DAMAGE_SECONDS,
    source: CONSTELLATION_4_ELECTRO_DAMAGE_SOURCE,
  });
};

// Yae Miko's behaviour: Sesshou Sakura's totems, which strike on their own schedule at a level by how many stand, and
// Great Secret Art: Tenko Kenshin, which destroys the totems for a Tenko Thunderbolt each. From Ascension 1 each totem the
// Burst destroys gives back a charge of the skill, and from Ascension 4 her Elemental Mastery raises the totems' DMG. From
// Constellation 4 her Elemental Burst DMG rises 100%, and each lightning a totem strikes gives the team Electro DMG Bonus.
// Constellation 4's 8 Energy per 5 seconds is not built, as the kit grants no energy a hit gives at once. Constellation 1
// Needs the Superconduct and Stellar-Conduct DMG Bonus the team takes from her, which the kit's Stellar-Conduct revelation
// Does not build, and Constellation 2 needs Sesshou Sakura's starting level, max level and range, none built
// Constellation 6's CRIT DMG needs the Stellar-Conduct hits her Radiance gives, read from the Polestar Field's
// RADIANCE_STELLAR_CONDUCT_STATUS_ID, which the kit does not deal, so only its DEF ignored is built
export const createYaeMikoKitBehaviour = ({
  kit,
  readHitFields,
  readHits,
  readParameters,
  readSeconds,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  const totemSeconds = readSeconds("totem");
  // A totem's strikes over its life, gcsim v2.47.2's (MIT) yaemiko/kitsune.go schedule from the press
  const totemStrikeSecondsList = readSecondsList("totemStrikes");
  const skillSpawnSeconds = readSeconds("sesshouSakuraSpawn");
  const totemStrikeFields = readHitFields("totemStrikes", ["hitmarkSeconds", "talentMultiplier"]);
  // A totem's strike multiplier at each of its levels, which the totems standing pick as it is cast
  const totemStrikeMultipliers = readParameters("totemStrikeMultipliers");
  // A Tenko Thunderbolt for each totem the burst can destroy, in the order it destroys them
  const thunderbolts = readHits("tenkoThunderbolts");
  // Each totem's strikes are fixed when it is cast, so its multiplier is the one its level gives then, as the level is
  // Read from the totems standing as it is cast
  const createTotemStrikes = (level: number): KitHit[] => {
    const talentMultiplier = takeOne(totemStrikeMultipliers, level - 1);
    const hits: KitHit[] = [];
    for (const hitmarkSeconds of totemStrikeSecondsList)
      hits.push({ ...totemStrikeFields, hitmarkSeconds, onStrike: giveTeamElectroDamageBonus, talentMultiplier });
    return hits;
  };
  return {
    // Destroys every totem standing, each one a Tenko Thunderbolt that strikes from the burst's own clock
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        const standingTotems = findStandingTotems(kitEffectState.effects, combatant.characterId);
        for (const totem of standingTotems) totem.secondsRemaining = 0;
        if (standingTotems.length === 0) return;
        if (combatant.ascension >= THE_SHRINES_SACRED_SHADE_ASCENSION) {
          const member = getPartyMember(party, combatant.characterId);
          member.skillCooldownSeconds = Math.max(
            0,
            member.skillCooldownSeconds - standingTotems.length * kit.skillCooldownSeconds,
          );
        }
        castKitSummon(kitEffectState, body, combatant, thunderbolts.slice(0, standingTotems.length), {
          attackTag: AttackTag.ElementalBurst,
        });
      },
    },
    // Constellation 4 raises her Elemental Burst DMG 100%, and Enlightened Blessing the totems' by her Elemental Mastery
    getStrikeDamageBonus: ({ attackTag, combatant }) => {
      if (attackTag === AttackTag.ElementalBurst && combatant.constellationCount >= CONSTELLATION_4)
        return CONSTELLATION_4_BURST_DAMAGE_BONUS;
      return combatant.ascension >= ENLIGHTENED_BLESSING_ASCENSION && attackTag === AttackTag.ElementalSkill
        ? elementalMasteryMultiplier(combatant, ENLIGHTENED_BLESSING_DAMAGE_PER_ELEMENTAL_MASTERY)
        : 0;
    },
    // Constellation 6 ignores a share of each enemy's DEF on Sesshou Sakura's strikes, which are Elemental Skill DMG
    getStrikeDefenceIgnored: ({ attackTag, combatant }) =>
      combatant.constellationCount >= CONSTELLATION_6 && attackTag === AttackTag.ElementalSkill
        ? CONSTELLATION_6_DEFENCE_IGNORED
        : 0,
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const standingTotems = findStandingTotems(kitEffectState.effects, combatant.characterId);
        // A fourth totem pops the oldest
        for (const oldestTotem of standingTotems.slice(0, Math.max(0, standingTotems.length - MAXIMUM_TOTEMS + 1)))
          oldestTotem.secondsRemaining = 0;
        const level = Math.min(standingTotems.length + 1, MAXIMUM_TOTEMS);
        // A totem's strikes are Elemental Skill DMG, as gcsim's kitsune.go tags them
        castKitSummon(kitEffectState, body, combatant, createTotemStrikes(level), {
          attackTag: AttackTag.ElementalSkill,
          id: SESSHOU_SAKURA_ID,
          secondsRemaining: totemSeconds,
          spawnSeconds: skillSpawnSeconds,
        });
      },
    },
  };
};
