import type { ReactionType } from "#src/models/combat/ReactionType";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { consumeKitResource } from "#src/services/kit/effects/consumeKitResource";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { countDew } from "#src/services/party/countDew";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { spendDew } from "#src/services/party/spendDew";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";

// Measured: gcsim (MIT) lauma/skill.go, the Frostgrove Sanctuary standing 15 seconds, and each of its ticks shedding the
// RES below for 10 seconds
// Https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lauma
const SANCTUARY_SECONDS = 15;
const SHRED_SECONDS = 10;
const SHRED_STATUS_ID = "lauma-skill-shred";

// Measured: gcsim (MIT) lauma/skill.go, Hymn of Eternal Rest's hold spends up to three Verdant Dew. The hold spends
// Dew, Verdant first and then Moonridge, through spendDew. The Dew is spent as the hold starts, where gcsim spends it
// At 29 frames, since the hit's multiplier is set on the cast. A hold with no Dew plays the press, as gcsim refuses it
// Https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lauma
const SKILL_HOLD_MAXIMUM_DEW_COUNT = 3;

// Measured: gcsim (MIT) lauma/asc.go, her Moonsign Benediction turns the party's Bloom into Lunar-Bloom and adds 0.0175%
// Base DMG Bonus to its Lunar-Bloom for each point of her Elemental Mastery, at most 14%
// Https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lauma
const BENEDICTION_BASE_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY = 0.000175;
const BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS = 0.14;
// Cleansing for the Spring, Lauma's Ascension 4 passive as its text gives it: her Elemental Skill's DMG rises by 0.04% for
// Each point of her Elemental Mastery, to at most 32%
const ASCENSION_4 = 4;
const CLEANSING_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY = 0.0004;
const CLEANSING_MAXIMUM_DAMAGE_BONUS = 0.32;

// Measured: gcsim (MIT) lauma/burst.go, her burst gives the party 18 Pale Hymn 96 frames after it starts, and the burst and
// Each Pale Hymn last 15 seconds. Each Bloom or Lunar-Bloom reaction then spends one, Moon Song's before the burst's
// Https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lauma
const BURST_SECONDS = 15;
const PALE_HYMN_SECONDS = 15;
const PALE_HYMN_BURST_STACKS = 18;
const PALE_HYMN_GAIN_FRAMES = 96;
// Measured: gcsim (MIT) lauma/skill.go, each Dew Hymn of Eternal Rest spends during her burst gives the Moon Song six Pale
// Hymn, once in each burst. A Dew spent outside it waits for the burst's gain, for 15 seconds
// Https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lauma
const MOON_SONG_PALE_HYMN_PER_DEW = 6;

export const LAUMA_CHARACTER_ID = 10_000_119;
export const LAUMA_PALE_HYMN_BURST_ID = "lauma-pale-hymn-burst";
export const LAUMA_PALE_HYMN_MOON_SONG_ID = "lauma-pale-hymn-moon-song";
const BURST_ID = "lauma-burst";
const MOON_SONG_DEW_ID = "lauma-moon-song-dew";
const MOON_SONG_ICD_ID = "lauma-moon-song-icd";
const PALE_HYMN_GAIN_ID = "lauma-pale-hymn-gain";
// Constellation 2 adds Elemental Mastery to each Bloom's and each Lunar-Bloom's Pale Hymn ratio, as gcsim v2.47.2 (MIT)
// Lauma/cons.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lauma/cons.go
const C2_CONSTELLATION = 2;
const C2_BLOOM_INCREASE = 5;
const C2_LUNAR_BLOOM_INCREASE = 4;
// The reactions a Pale Hymn is spent on: Bloom and its kin, and the Lunar-Bloom her Benediction turns Bloom into
const PALE_HYMN_REACTION_TYPES = new Set<ReactionType>([
  LunarReactionType.LunarBloom,
  TransformativeReactionType.Bloom,
  TransformativeReactionType.Burgeon,
  TransformativeReactionType.Hyperbloom,
]);

// Whether the team holds any Pale Hymn, the burst's or Moon Song's
const checkHasPaleHymn = (effects: readonly KitEffect[], characterId: number): boolean =>
  checkIsKitStatusActive(effects, characterId, LAUMA_PALE_HYMN_BURST_ID) ||
  checkIsKitStatusActive(effects, characterId, LAUMA_PALE_HYMN_MOON_SONG_ID);

// Whether a Dew can give the Moon Song now: her burst is up, and the Moon Song has not given one in this burst
const checkCanGiveMoonSong = ({ effects }: KitEffectState, characterId: number): boolean =>
  checkIsKitStatusActive(effects, characterId, BURST_ID) &&
  !checkIsKitStatusActive(effects, characterId, MOON_SONG_ICD_ID);

// The Moon Song's Pale Hymn, six a Dew spent, restarted for its 15 seconds, and the internal cooldown that keeps it to
// One in each burst, which lasts as long as the burst does
const giveMoonSongPaleHymn = (kitEffectState: KitEffectState, characterId: number, dewCount: number): void => {
  addKitStatus(kitEffectState, characterId, {
    id: LAUMA_PALE_HYMN_MOON_SONG_ID,
    secondsRemaining: PALE_HYMN_SECONDS,
    stacks: dewCount * MOON_SONG_PALE_HYMN_PER_DEW,
  });
  addKitStatus(kitEffectState, characterId, {
    id: MOON_SONG_ICD_ID,
    secondsRemaining: findKitStatus(kitEffectState.effects, characterId, BURST_ID)?.secondsRemaining ?? 0,
  });
  spendKitResource(kitEffectState, characterId, MOON_SONG_DEW_ID);
};

// The Moon Song a Dew spent gives, if her burst is up and has not yet given one, and waits for the burst otherwise
const giveMoonSong = (kitEffectState: KitEffectState, characterId: number, dewCount: number): void => {
  if (dewCount <= 0) return;
  if (checkCanGiveMoonSong(kitEffectState, characterId)) giveMoonSongPaleHymn(kitEffectState, characterId, dewCount);
  else
    addKitStatus(kitEffectState, characterId, {
      id: MOON_SONG_DEW_ID,
      secondsRemaining: PALE_HYMN_SECONDS,
      stacks: dewCount,
    });
};

// Her burst's gain 96 frames in: the burst is up for its 15 seconds, the burst's Pale Hymn is 18, and a Moon Song Dew
// That waited for the burst gives its Pale Hymn now
const gainBurstPaleHymn = (kitEffectState: KitEffectState, characterId: number): void => {
  addKitStatus(kitEffectState, characterId, { id: BURST_ID, secondsRemaining: BURST_SECONDS });
  addKitStatus(kitEffectState, characterId, {
    id: LAUMA_PALE_HYMN_BURST_ID,
    secondsRemaining: PALE_HYMN_SECONDS,
    stacks: PALE_HYMN_BURST_STACKS,
  });
  giveMoonSong(kitEffectState, characterId, countKitResource(kitEffectState.effects, characterId, MOON_SONG_DEW_ID));
};

// A Bloom or Lunar-Bloom reaction spends one Pale Hymn, the Moon Song's before the burst's
const spendPaleHymn = (kitEffectState: KitEffectState, characterId: number): void => {
  if (!consumeKitResource(kitEffectState, characterId, LAUMA_PALE_HYMN_MOON_SONG_ID, 1))
    consumeKitResource(kitEffectState, characterId, LAUMA_PALE_HYMN_BURST_ID, 1);
};

// The Elemental Mastery ratio Constellation 2 adds to a Pale Hymn Bloom, or to a Lunar-Bloom, from Constellation 2 onward
const readConstellationPaleHymnIncrease = (constellationCount: number, isLunar: boolean): number => {
  if (constellationCount < C2_CONSTELLATION) return 0;
  return isLunar ? C2_LUNAR_BLOOM_INCREASE : C2_BLOOM_INCREASE;
};

// Constellation 4 restores 5 energy to Lauma as a Frostgrove Sanctuary tick strikes an enemy, once every 5 seconds, as gcsim
// `v2.47.2` (MIT) lauma/skill.go's tick callback and lauma/cons.go give it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lauma/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_COOLDOWN_ID = "lauma-constellation-4-cooldown";
const CONSTELLATION_4_COOLDOWN_SECONDS = 5;
const CONSTELLATION_4_ENERGY = 5;

// Constellation 1's Threads of Life: while the status her burst gives from Constellation 1 holds for 20 seconds, each
// Lunar-Bloom reaction heals the active character for 5 times Lauma's Elemental Mastery, 5 frames later, once every 1.9
// Seconds, as gcsim v2.47.2 (MIT) lauma/cons.go gives it. The Spirit Envoy's deer is not built
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lauma/cons.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_COOLDOWN_ID = "lauma-constellation-1-cooldown";
const CONSTELLATION_1_COOLDOWN_SECONDS = 1.9;
const CONSTELLATION_1_HEAL_DELAY_SECONDS = toKitSeconds(5);
const CONSTELLATION_1_HEAL_ELEMENTAL_MASTERY_SHARE = 5;
const CONSTELLATION_1_SECONDS = 20;
const CONSTELLATION_1_STATUS_ID = "lauma-constellation-1";

// A Lunar-Bloom reaction's heal, given the cooldown has run out and the status her burst gave holds
const giveThreadsOfLifeHeal = (context: KitContext, combatant: Combatant): void => {
  const { kitEffectState } = context;
  const { characterId } = combatant;
  if (
    !checkIsKitStatusActive(kitEffectState.effects, characterId, CONSTELLATION_1_STATUS_ID) ||
    !startKitCooldown(kitEffectState, characterId, CONSTELLATION_1_COOLDOWN_ID, CONSTELLATION_1_COOLDOWN_SECONDS)
  )
    return;
  const health = elementalMasteryMultiplier(combatant, CONSTELLATION_1_HEAL_ELEMENTAL_MASTERY_SHARE);
  scheduleKitTask(kitEffectState, characterId, CONSTELLATION_1_HEAL_DELAY_SECONDS, (tick) => {
    changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, health);
  });
};

// A Sanctuary tick's strike gives its striker the energy, unless the cooldown from the last one has not run out
const restoreSanctuaryEnergy = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void => {
  if (combatant.constellationCount < CONSTELLATION_4) return;
  if (
    !startKitCooldown(
      kitEffectState,
      combatant.characterId,
      CONSTELLATION_4_COOLDOWN_ID,
      CONSTELLATION_4_COOLDOWN_SECONDS,
    )
  )
    return;
  gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
};

// Lauma's behaviour: Hymn of Hunting's press and its hold each plant the Frostgrove Sanctuary where she stands, whose
// Ticks add the table's share of her Elemental Mastery, and every hit of the skill's sheds the table's Dendro and Hydro
// RES. Hymn of Eternal Rest plays while the party holds Dew, spending up to three on a direct Lunar-Bloom hit
// Following her, its multiplier of her Elemental Mastery for each Dew spent. Her Moonsign Benediction adds Base DMG Bonus
// For her Elemental Mastery. Her burst gives the party Pale Hymn 96 frames in, a Dew Hymn of Eternal Rest spends during
// The burst gives the Moon Song its Pale Hymn, each Bloom or Lunar-Bloom reaction spends one, and the Pale Hymn adds her
// Elemental Mastery to each of those reactions the party makes. Not built yet: the Spirit Envoy state her charged
// Attack's first press enters, which waits on a stance that drains stamina; Light for the Frosty Night and her
// Constellations; the Spirit Envoy's cooldown reduction of Cleansing for the Spring, as the charged attack's cooldown is not
// Read by a kit
// Constellation 1's Threads of Life heal is built, from each Lunar-Bloom reaction; the Spirit Envoy's deer is not
// Constellation 4's energy is built, from each Sanctuary tick that strikes an enemy, once every 5 seconds
// Constellation 6 needs the Pale Hymn stacks it gives and an extra Lunar-Bloom Dendro hit per Sanctuary attack, not built
export const createLaumaKitBehaviour = ({ readHitFields, readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const shredResistanceReduction = readParameter("frostgroveSanctuaryResistanceDecrease");
  const sanctuaryTickElementalMasteryShare = readParameter("frostgroveSanctuaryElementalMasteryShare");
  // Pale Hymn's flat Elemental Mastery on Bloom, Hyperbloom and Burgeon, and on Lunar-Bloom, at her burst's talent level
  const paleHymnBloomIncrease = readParameter("paleHymnBloomDamageIncrease");
  const paleHymnLunarBloomIncrease = readParameter("paleHymnLunarBloomDamageIncrease");
  // The RES Dendro and Hydro enemies lose to a hit of the skill's, for its seconds
  const createShredStatus = (): EnemyStatus => ({
    damageTakenBonus: 0,
    id: SHRED_STATUS_ID,
    resistanceReduction: { [Element.Dendro]: shredResistanceReduction, [Element.Hydro]: shredResistanceReduction },
    secondsRemaining: SHRED_SECONDS,
  });
  const shredBehaviour: KitHitBehaviour = { enemyStatus: createShredStatus };
  // The Frostgrove Sanctuary's ticks, each a Dendro hit of the sanctuary's ATK share and its Elemental Mastery
  const sanctuaryTicks = readHits("frostgroveSanctuaryTicks", {
    additiveBaseDamageBonus: (striker) => elementalMasteryMultiplier(striker, sanctuaryTickElementalMasteryShare),
    enemyStatus: createShredStatus,
    onStrike: restoreSanctuaryEnergy,
  });
  // The hold's direct Lunar-Bloom hit, whose multiplier is set by the Dew it spends as it is cast
  const holdLunarBloomFields = readHitFields("hymnOfEternalRestLunarBloom", []);
  const createHoldLunarBloomHit = (dewCount: number): KitHit => ({
    ...holdLunarBloomFields,
    enemyStatus: createShredStatus,
    talentMultiplier: holdLunarBloomFields.talentMultiplier * dewCount,
  });
  // The Frostgrove Sanctuary the press and the hold each plant where she stands, its ticks striking as her Elemental Skill,
  // As gcsim v2.47.2 (MIT) lauma/skill.go tags them, so Cleansing for the Spring reaches them
  const plantSanctuary = ({ activeCombatant: combatant, body, kitEffectState }: KitContext): void => {
    castKitSummon(kitEffectState, body, combatant, sanctuaryTicks, {
      attackTag: AttackTag.ElementalSkill,
      secondsRemaining: SANCTUARY_SECONDS,
    });
  };
  const pressBehaviour: KitActionBehaviour = { hits: [shredBehaviour], onStart: plantSanctuary };
  return {
    // Her burst starts the Pale Hymn's gain, which comes 96 frames later as a status's expiry, and clears the Moon Song's
    // Internal cooldown from the last burst
    burst: {
      onStart: ({ activeCombatant, kitEffectState }) => {
        const { characterId } = activeCombatant;
        spendKitResource(kitEffectState, characterId, BURST_ID);
        spendKitResource(kitEffectState, characterId, MOON_SONG_ICD_ID);
        addKitStatus(kitEffectState, characterId, {
          id: PALE_HYMN_GAIN_ID,
          secondsRemaining: toKitSeconds(PALE_HYMN_GAIN_FRAMES),
        });
        if (activeCombatant.constellationCount >= CONSTELLATION_1)
          addKitStatus(kitEffectState, characterId, {
            id: CONSTELLATION_1_STATUS_ID,
            secondsRemaining: CONSTELLATION_1_SECONDS,
          });
      },
    },
    // Pale Hymn adds her Elemental Mastery to the base damage of each Bloom and Lunar-Bloom the party makes while it holds
    // Any, as gcsim (MIT) lauma/burst.go does, with her own Elemental Mastery, and Constellation 2 adds to each ratio as
    // Lauma/cons.go does
    getPartyReactionBonus: (member, { reactionType }, { kitEffectState }) => {
      if (!PALE_HYMN_REACTION_TYPES.has(reactionType) || !checkHasPaleHymn(kitEffectState.effects, member.characterId))
        return {};
      const isLunar = reactionType === LunarReactionType.LunarBloom;
      const increase =
        (isLunar ? paleHymnLunarBloomIncrease : paleHymnBloomIncrease) +
        readConstellationPaleHymnIncrease(member.constellationCount, isLunar);
      return { additiveBaseDamageBonus: elementalMasteryMultiplier(member, increase) };
    },
    getStrikeDamageBonus: ({ attackTag, combatant }) =>
      combatant.ascension < ASCENSION_4 || attackTag !== AttackTag.ElementalSkill
        ? 0
        : Math.min(
            CLEANSING_MAXIMUM_DAMAGE_BONUS,
            elementalMasteryMultiplier(combatant, CLEANSING_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY),
          ),
    moonsignBenediction: {
      getBaseDamageBonus: (combatant) =>
        Math.min(
          elementalMasteryMultiplier(combatant, BENEDICTION_BASE_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY),
          BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS,
        ),
    },
    onKitEvent: (event, context, combatant) => {
      const { kitEffectState } = context;
      const { characterId } = combatant;
      if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (effect.kind === "status" && effect.id === PALE_HYMN_GAIN_ID && effect.characterId === characterId)
          gainBurstPaleHymn(kitEffectState, characterId);
      } else if (event.kind === KitEventKind.ReactionTriggered) {
        const reactionCount = event.reactions.filter(({ reactionType }) =>
          PALE_HYMN_REACTION_TYPES.has(reactionType),
        ).length;
        for (let spendIndex = 0; spendIndex < reactionCount; spendIndex++) spendPaleHymn(kitEffectState, characterId);
        if (event.reactions.some(({ reactionType }) => reactionType === LunarReactionType.LunarBloom))
          giveThreadsOfLifeHeal(context, combatant);
      }
    },
    skill: pressBehaviour,
    // A hold with no Dew plays the press, and with Dew Hymn of Eternal Rest, spending it on its Lunar-Bloom hit
    skillHolds: [
      {
        ...pressBehaviour,
        variant: {
          checkIsActive: ({ party }) => countDew(party) > 0,
          hits: [shredBehaviour],
          onStart: (context) => {
            plantSanctuary(context);
            const dewCount = spendDew(context.party, SKILL_HOLD_MAXIMUM_DEW_COUNT);
            giveMoonSong(context.kitEffectState, context.activeCombatant.characterId, dewCount);
            castKitSummon(
              context.kitEffectState,
              context.body,
              context.activeCombatant,
              [createHoldLunarBloomHit(dewCount)],
              { isFollowing: true },
            );
          },
        },
      },
    ],
  };
};
