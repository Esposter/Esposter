import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) gorou/skill.go, the General's War Banner placed two metres ahead of the body, where
// Inuzaka All-Round Defense's hit lands, its buffs reaching a circle of radius 8 round it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/gorou/skill.go
const SKILL_OFFSET_METRES = 2;
const BANNER_RADIUS = 8;
// The buffs a tick gives last 120 frames, which the game reads as two seconds
const BANNER_BUFF_SECONDS = 2;

// Measured: gcsim v2.47.2 (MIT) gorou/gorou.go and cons.go, Standing Firm's DEF and Crunch's 15% Geo DMG Bonus as the table
// Gives them, Crunch from the party's three Geo characters. Impregnable's interruption resistance has no kit effect to read
const CRUNCH_GEO_COUNT = 3;
const WAR_BANNER_ID = "gorou-war-banner";
const JUUGA_ID = "gorou-juuga";
const DEFENSE_SOURCE = "gorou-defense";
const CRUNCH_SOURCE = "gorou-crunch";
const A1_SOURCE = "gorou-a1";
const A1_DEFENSE_PERCENT = 0.25;
const A1_SECONDS = 12;
const DEFENSE_DAMAGE_ASCENSION = 4;
const SKILL_DEFENSE_SHARE = 1.56;
const BURST_DEFENSE_SHARE = 0.156;

// A hit's added base damage from Ascension 4: a share of the striker's DEF, as the passive gives it
const createDefenseDamageBonus =
  (share: number) =>
  (combatant: Combatant): number =>
    combatant.ascension >= DEFENSE_DAMAGE_ASCENSION ? combatant.attributes.defense * share : 0;

export const GOROU_CHARACTER_ID = 10_000_055;

// Gorou's behaviour: Inuzaka All-Round Defense places the General's War Banner ahead of him, unless Juuga's field
// Stands, and Juuga puts the banner out for its own field, which follows the body, and casts Crystal Collapse, one summon
// Following the body with its ticks set out at the cast. Each field's ticks buff the active character's DEF, and its Geo
// DMG Bonus from Crunch's count of Geo characters. Ascension 1 raises the party's DEF as Juuga is cast, and Ascension 4
// Adds a share of his DEF to the skill's and the burst's hits. His constellations are not built, as no kit event reaches
// Their values
// Constellation 1 needs nearby characters' Geo DMG in General's War Banner or Glory, which no kit reads
// Constellation 2 needs the Elemental Shard and Lunar-Crystallize events nearby, which no kit event reports
// Constellation 4 needs General's Glory's Impregnable and Crunch states, and a heal every 1.5 seconds
// Constellation 6 needs a CRIT DMG buff on nearby members' Geo DMG, scaled by the field's level, not built
export const createGorouKitBehaviour = ({
  kit,
  readHit,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const skillHitmarkSeconds = takeOne(kit.elementalSkill.hits).hitmarkSeconds;
  const burstHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const defenseBonus = readParameter("generalsWarBannerDefenseBonus");
  const crunchGeoDamageBonus = readParameter("crunchGeoDamageBonus");
  const bannerSeconds = readParameter("bannerSeconds");
  const juugaSeconds = readParameter("juugaSeconds");
  const warBannerNextTickSeconds = readSeconds("generalsWarBannerFirstTick");
  const juugaFieldNextTickSeconds = readSeconds("generalsGloryFirstTick");
  const bannerTickSeconds = readSeconds("bannerTick");
  const crystalCollapseFirstSeconds = readSeconds("crystalCollapseFirst");
  const crystalCollapseIntervalSeconds = readSeconds("crystalCollapseInterval");
  const burstDefenseDamageBonus = createDefenseDamageBonus(BURST_DEFENSE_SHARE);
  const crystalCollapseHit = readHit("crystalCollapse", { additiveBaseDamageBonus: burstDefenseDamageBonus });
  // Crystal Collapse ticks for as long as the field lasts, each its interval after the last from the first's seconds
  // After the burst's hit
  const crystalCollapseHits = Array.from(
    { length: Math.floor(juugaSeconds / crystalCollapseIntervalSeconds) },
    (_value, index) => ({
      ...crystalCollapseHit,
      hitmarkSeconds: burstHitmarkSeconds + (crystalCollapseFirstSeconds + crystalCollapseIntervalSeconds * index),
    }),
  );

  // The buffs a General's War Banner or General's Glory gives the active character on each tick: its DEF at the table's
  // Value, and the Geo DMG Bonus as well when the team holds the Crunch count of Geo characters
  const addFieldBuffs = ({ activeCombatant, characterIdCombatantMap, kitEffectState }: KitContext): void => {
    buffKitMember(kitEffectState, activeCombatant.characterId, {
      amount: defenseBonus,
      attribute: Attribute.Defense,
      secondsRemaining: BANNER_BUFF_SECONDS,
      source: DEFENSE_SOURCE,
    });
    const geoCount = [...characterIdCombatantMap.values()].filter(({ element }) => element === Element.Geo).length;
    if (geoCount >= CRUNCH_GEO_COUNT)
      buffKitMember(kitEffectState, activeCombatant.characterId, {
        amount: crunchGeoDamageBonus,
        attribute: Attribute.GeoDamageBonus,
        secondsRemaining: BANNER_BUFF_SECONDS,
        source: CRUNCH_SOURCE,
      });
  };

  return {
    burst: {
      hits: [{ additiveBaseDamageBonus: burstDefenseDamageBonus }],
      // Juuga takes the banner's place, so a banner standing is put out, and from Ascension 1 the party's DEF rises
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        for (const effect of kitEffectState.effects)
          if (effect.kind === "field" && effect.id === WAR_BANNER_ID) effect.secondsRemaining = 0;
        castKitField(kitEffectState, combatant.characterId, body.position, {
          id: JUUGA_ID,
          isFollowing: true,
          nextTickSeconds: juugaFieldNextTickSeconds,
          onTick: addFieldBuffs,
          secondsRemaining: burstHitmarkSeconds + juugaSeconds,
          tickIntervalSeconds: bannerTickSeconds,
        });
        castKitSummon(kitEffectState, body, combatant, crystalCollapseHits, {
          isFollowing: true,
          secondsRemaining: burstHitmarkSeconds + juugaSeconds,
        });
        if (combatant.ascension >= 1)
          buffKitTeam(kitEffectState, party, {
            amount: A1_DEFENSE_PERCENT,
            attribute: Attribute.DefensePercent,
            secondsRemaining: A1_SECONDS,
            source: A1_SOURCE,
          });
      },
    },
    skill: {
      hits: [{ additiveBaseDamageBonus: createDefenseDamageBonus(SKILL_DEFENSE_SHARE) }],
      // The banner is not placed while Juuga's field stands
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const isJuugaStanding = kitEffectState.effects.some(
          (effect) => effect.kind === "field" && effect.id === JUUGA_ID && effect.secondsRemaining > 0,
        );
        if (isJuugaStanding) return;
        castKitField(kitEffectState, combatant.characterId, createAheadBody(body, SKILL_OFFSET_METRES).position, {
          id: WAR_BANNER_ID,
          nextTickSeconds: warBannerNextTickSeconds,
          onTick: addFieldBuffs,
          radius: BANNER_RADIUS,
          secondsRemaining: skillHitmarkSeconds + bannerSeconds,
          tickIntervalSeconds: bannerTickSeconds,
        });
      },
    },
  };
};
