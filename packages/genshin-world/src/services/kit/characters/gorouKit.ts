import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) gorou/skill.go, the General's War Banner placed two metres ahead of the body, where
// Inuzaka All-Round Defense's hit lands, its buffs reaching a circle of radius 8 round it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/gorou/skill.go
const SKILL_OFFSET_METRES = 2;
const BANNER_RADIUS = 8;
// The buffs a tick gives last 120 frames, which the game reads as two seconds
const BANNER_BUFF_SECONDS = 2;

// Measured: gcsim v2.47.2 (MIT) gorou/gorou.go and cons.go, Standing Firm's DEF and Crunch's 15% Geo DMG Bonus as the
// Table Gives them, Crunch from the party's three Geo characters. Impregnable's interruption resistance has no kit
// Effect to read
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
const CONSTELLATION_1 = 1;
// Constellation 1 cuts the skill's cooldown by 2 seconds, once every 10 seconds, for a nearby character's Geo hit in
// The field
const CONSTELLATION_1_COOLDOWN_CUT_SECONDS = 2;
const CONSTELLATION_1_ICD_ID = "gorou-c1-icd";
const CONSTELLATION_1_ICD_SECONDS = 10;
const CONSTELLATION_6 = 6;
// Constellation 6's CRIT DMG on Geo lasts 12 seconds from each skill or burst, at the level the team's Geo count sets
// Then
const CONSTELLATION_6_SECONDS = 12;
const CONSTELLATION_6_SOURCE = "gorou-c6";
const CONSTELLATION_6_GEO_COUNT = 3;
const CONSTELLATION_4 = 4;
// Constellation 4 heals the active character half his DEF at the cast, every 1.5 seconds from the burst's hit, while
// General's Glory stands
const CONSTELLATION_4_DEFENCE_SHARE = 0.5;
const CONSTELLATION_4_SECONDS = 1.5;
// The heal waits on two Geo characters at the cast, General's Glory's Impregnable state, as gcsim gates it
const CONSTELLATION_4_GEO_COUNT = 2;
const CONSTELLATION_4_HEAL_ID = "gorou-c4-heal";

// The Geo characters among a team's, which the Crunch count and Constellation 6's level read
const countGeoCharacters = (characterIdCombatantMap: KitContext["characterIdCombatantMap"]): number =>
  [...characterIdCombatantMap.values()].filter(({ element }) => element === Element.Geo).length;

// Constellation 6's CRIT DMG on Geo for a Geo count at the cast: one Geo character gives 10%, two 20%, three or more
// 40%
const getConstellation6CriticalDamage = (geoCount: number): number => {
  if (geoCount >= CONSTELLATION_6_GEO_COUNT) return 0.4;
  return geoCount === 2 ? 0.2 : 0.1;
};

// Constellation 6's CRIT DMG on Geo for every party member, at the level the team's Geo count sets at this cast, which
// A cast Restarts rather than stacks, as gcsim's buff takes its last instance
const addConstellation6CriticalDamage = ({ characterIdCombatantMap, kitEffectState, party }: KitContext): void => {
  const amount = getConstellation6CriticalDamage(countGeoCharacters(characterIdCombatantMap));
  for (const characterId of party.characterIdMemberMap.keys())
    addKitEffect(kitEffectState, {
      amount,
      characterId,
      element: Element.Geo,
      kind: "elementCriticalDamage",
      secondsRemaining: CONSTELLATION_6_SECONDS,
      source: CONSTELLATION_6_SOURCE,
    });
};

// A hit's added base damage from Ascension 4: a share of the striker's DEF, as the passive gives it
const createDefenseDamageBonus =
  (share: number) =>
  (combatant: Combatant): number =>
    combatant.ascension >= DEFENSE_DAMAGE_ASCENSION ? combatant.attributes.defense * share : 0;

export const GOROU_CHARACTER_ID = 10_000_055;

// Constellation 4's heal on the active character, the share of the DEF Gorou had at the cast, healed at his Healing
// Bonus as it lands
const createConstellation4Heal =
  (defenceAtCast: number) =>
  (context: KitContext): void => {
    const gorou = context.characterIdCombatantMap.get(GOROU_CHARACTER_ID);
    if (gorou)
      changeKitMemberHealth(
        context,
        gorou,
        context.activeCombatant.characterId,
        defenceAtCast * CONSTELLATION_4_DEFENCE_SHARE,
      );
  };

// Gorou's behaviour: Inuzaka All-Round Defense places the General's War Banner ahead of him, unless Juuga's field
// Stands, and Juuga puts the banner out for its own field, which follows the body, and casts Crystal Collapse, one
// Summon Following the body with its ticks set out at the cast. Each field's ticks buff the active character's DEF, and
// Its Geo DMG Bonus from Crunch's count of Geo characters. Ascension 1 raises the party's DEF as Juuga is cast, and
// Ascension 4 Adds a share of his DEF to the skill's and the burst's hits. Constellations 1, 4 and 6 are built.
// Constellation 1 counts the Geo hits in the field's circle, once every 10 seconds, and Constellation 6 reads the Geo
// Count at each cast. Constellation 4 heals the active character every 1.5 seconds on half his DEF at the cast, while
// General's Glory stands. Constellation 2 needs the Elemental Shard and Lunar-Crystallize events nearby, which no kit
// Event reports.
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
  const crystalCollapseIntervalSeconds = readSeconds("crystalCollapseInterval");
  const burstDefenseDamageBonus = createDefenseDamageBonus(BURST_DEFENSE_SHARE);
  const crystalCollapseHit = readHit("crystalCollapse", { additiveBaseDamageBonus: burstDefenseDamageBonus });
  // Crystal Collapse ticks from its own hitmark, the burst's hit with its task's 90 frames and its own 1, each its
  // Interval after the last, while the field stands: gcsim's task finds the field spent on its end frame, so a tick that
  // Falls there or past it is not set out
  const crystalCollapseHits = Array.from(
    {
      length: Math.ceil(
        (burstHitmarkSeconds + juugaSeconds - crystalCollapseHit.hitmarkSeconds) / crystalCollapseIntervalSeconds,
      ),
    },
    (_value, index) => ({
      ...crystalCollapseHit,
      hitmarkSeconds: crystalCollapseHit.hitmarkSeconds + crystalCollapseIntervalSeconds * index,
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
    if (countGeoCharacters(characterIdCombatantMap) >= CRUNCH_GEO_COUNT)
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
      onStart: (context) => {
        const { activeCombatant: combatant, body, characterIdCombatantMap, kitEffectState, party } = context;
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
          attackTag: AttackTag.ElementalBurst,
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
        // The heal chain is a non-stacked field keyed by its id, so a new burst replaces the one standing,
        // As gcsim's qFieldSrc does
        if (
          combatant.constellationCount >= CONSTELLATION_4 &&
          countGeoCharacters(characterIdCombatantMap) >= CONSTELLATION_4_GEO_COUNT
        )
          castKitField(kitEffectState, combatant.characterId, body.position, {
            id: CONSTELLATION_4_HEAL_ID,
            nextTickSeconds: burstHitmarkSeconds + CONSTELLATION_4_SECONDS,
            onTick: createConstellation4Heal(
              getBuffedCombatant(combatant, kitEffectState.effects, party, characterIdCombatantMap).attributes.defense,
            ),
            secondsRemaining: burstHitmarkSeconds + juugaSeconds,
            tickIntervalSeconds: CONSTELLATION_4_SECONDS,
          });
        if (combatant.constellationCount >= CONSTELLATION_6) addConstellation6CriticalDamage(context);
      },
    },
    onKitEvent: (event, context, combatant) => {
      // Constellation 1: a nearby character's Geo hit inside the banner's or Juuga's circle cuts the skill's cooldown,
      // Once every 10 seconds
      if (
        event.kind !== KitEventKind.EnemyHit ||
        event.element !== Element.Geo ||
        combatant.constellationCount < CONSTELLATION_1 ||
        event.striker.characterId === combatant.characterId ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, CONSTELLATION_1_ICD_ID) ||
        !context.kitEffectState.effects.some(
          (effect) =>
            effect.kind === "field" &&
            (effect.id === WAR_BANNER_ID || effect.id === JUUGA_ID) &&
            effect.secondsRemaining > 0 &&
            checkIsInKitField({ centre: effect.centre, radius: BANNER_RADIUS }, event.enemy.position),
        )
      )
        return;
      changeKitSkillCooldown(context.party, combatant.characterId, -CONSTELLATION_1_COOLDOWN_CUT_SECONDS);
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: CONSTELLATION_1_ICD_ID,
        secondsRemaining: CONSTELLATION_1_ICD_SECONDS,
      });
    },
    skill: {
      hits: [{ additiveBaseDamageBonus: createDefenseDamageBonus(SKILL_DEFENSE_SHARE) }],
      // The banner is not placed while Juuga's field stands
      onStart: (context) => {
        const { activeCombatant: combatant, body, kitEffectState } = context;
        if (combatant.constellationCount >= CONSTELLATION_6) addConstellation6CriticalDamage(context);
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
