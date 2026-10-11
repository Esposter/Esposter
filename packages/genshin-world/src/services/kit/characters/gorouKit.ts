import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createPeriodicKitHits } from "#src/services/kit/createPeriodicKitHits";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Gorou's proud skill groups, read at his talent level. The attack group holds the four strikes at 0 to 3, the fully charged
// Shot at 5 and the plunges' collision, low and high at 6, 7 and 8. The skill group holds Inuzaka All-Round Defense's hit at
// 0, the General's War Banner's DEF at 1, Crunch's Geo DMG Bonus at 2, the skill's cooldown at 3 and the banner's seconds at
// 4. The burst group holds Juuga's initial hit at 0, Crystal Collapse at 1, the field's seconds at 2, its cooldown at 3 and
// Its energy cost at 4
const GOROU_ATTACK_GROUP_ID = 5531;
const GOROU_SKILL_GROUP_ID = 5532;
const GOROU_BURST_GROUP_ID = 5539;

// Measured: gcsim v2.47.2 (MIT) gorou/attack.go, each arrow's hitmark and the frames its action cancels at, its arrow
// Travelling 10 frames to a box on the primary target, priced as a circle of a metre round the body as Ganyu's arrows are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/gorou/attack.go
const ARROW_TRAVEL_FRAMES = 10;
const ARROW_HIT_AREA: AttackArea = createCircleReach(0, 1);
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 21, hitmarkFrames: 17 },
  { cancelFrames: 26, hitmarkFrames: 12 },
  { cancelFrames: 43, hitmarkFrames: 27 },
  { cancelFrames: 55, hitmarkFrames: 31 },
];

// Measured: gcsim v2.47.2 (MIT) gorou/aimed.go, the fully charged shot's animation at 94 frames and its arrow at 86, which
// Travels 10 frames to the primary target as the strikes' do
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/gorou/aimed.go
const FULL_CHARGE_FRAMES = 94;
const FULL_CHARGE_HITMARK_FRAMES = 86 + ARROW_TRAVEL_FRAMES;

// Measured: gcsim v2.47.2 (MIT) gorou/skill.go, Inuzaka All-Round Defense's hit at 34 frames with an animation of 47, a Geo
// Circle of radius 5 two metres ahead of the body. The General's War Banner's first tick falls 17 frames after the hit and
// Its ticks every 18 frames, a circle of radius 8 round the same centre
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/gorou/skill.go
const SKILL_FRAMES = 47;
const SKILL_HITMARK_FRAMES = 34;
const SKILL_OFFSET_METRES = 2;
const SKILL_HIT_AREA: AttackArea = createCircleReach(SKILL_OFFSET_METRES, 5);
const BANNER_RADIUS = 8;
const BANNER_FIRST_TICK_FRAMES = 17;
const BANNER_TICK_FRAMES = 18;
// The buffs a tick gives last 120 frames, which the game reads as two seconds
const BANNER_BUFF_SECONDS = 2;

// Measured: gcsim v2.47.2 (MIT) gorou/burst.go, Juuga's initial hit at 31 frames with an animation of 56, a Geo circle of
// Radius 5 round the body. Its field follows the body and ticks its buffs as the banner's do, and Crystal Collapse ticks
// Every 90 frames from 90 frames after the hit, each striking the enemy nearest the body within 8 metres
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/gorou/burst.go
const BURST_FRAMES = 56;
const BURST_HITMARK_FRAMES = 31;
const JUUGA_HIT_AREA: AttackArea = createCircleReach(0, 5);
const CRYSTAL_COLLAPSE_RADIUS = 8;
const CRYSTAL_COLLAPSE_FIRST_FRAMES = 90;
const CRYSTAL_COLLAPSE_INTERVAL_FRAMES = 90;
// Provisional: gcsim strikes the one enemy nearest the body, a circle of radius 3.5 round it, and this prices the collapse as
// Each enemy in that reach, which overstates a fight with several enemies in it until the Mac measures the collapse's target
const CRYSTAL_COLLAPSE_HIT_AREA: AttackArea = createTargetedHitArea(createCircleReach(0, CRYSTAL_COLLAPSE_RADIUS), 3.5);

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

// Provisional: gcsim gives the plunges and the arrows no poise, so these stand at none until the Mac measures them. The
// Plunges' seconds are Ganyu's, until the Mac measures Gorou's
const PLUNGE_SECONDS = 0.4;

// A hit's added base damage from Ascension 4: a share of the striker's DEF, as the passive gives it
const createDefenseDamageBonus =
  (share: number) =>
  (combatant: Combatant): number =>
    combatant.ascension >= DEFENSE_DAMAGE_ASCENSION ? combatant.attributes.defense * share : 0;

export const GOROU_CHARACTER_ID = 10_000_055;

// Gorou's first kit, at talent level 1: four strikes, a fully charged shot, a collision and two plunges, Inuzaka All-Round
// Defense with its General's War Banner, and Juuga with its field that follows the body and its Crystal Collapse, which is
// One summon following the body with its six ticks set out at the cast. Ascension 1 and 4 are built. His constellations are
// Not, as no kit event reaches their values
export const createGorouKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, GOROU_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, GOROU_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, GOROU_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const defenseBonus = skillTalentMultiplier(1);
  const crunchGeoDamageBonus = skillTalentMultiplier(2);
  const bannerSeconds = skillTalentMultiplier(4);
  const juugaSeconds = burstTalentMultiplier(2);

  // The buffs a General's War Banner or General's Glory gives the active character on each tick: its DEF at the table's
  // Value, and the Geo DMG Bonus as well when the team holds the Crunch count of Geo characters
  const addFieldBuffs = ({ activeCombatant, characterIdCombatantMap, kitEffectState }: KitContext): void => {
    addKitEffect(kitEffectState, {
      amount: defenseBonus,
      attribute: Attribute.Defense,
      characterId: activeCombatant.characterId,
      kind: "buff",
      secondsRemaining: BANNER_BUFF_SECONDS,
      source: DEFENSE_SOURCE,
    });
    const geoCount = [...characterIdCombatantMap.values()].filter(({ element }) => element === Element.Geo).length;
    if (geoCount >= CRUNCH_GEO_COUNT)
      addKitEffect(kitEffectState, {
        amount: crunchGeoDamageBonus,
        attribute: Attribute.GeoDamageBonus,
        characterId: activeCombatant.characterId,
        kind: "buff",
        secondsRemaining: BANNER_BUFF_SECONDS,
        source: CRUNCH_SOURCE,
      });
  };

  const createWarBanner = (body: KitBody, combatant: Combatant): KitField => {
    const { position } = createAheadBody(body, SKILL_OFFSET_METRES);
    return {
      centre: { x: position.x, z: position.z },
      characterId: combatant.characterId,
      id: WAR_BANNER_ID,
      kind: "field",
      nextTickSeconds: (SKILL_HITMARK_FRAMES + BANNER_FIRST_TICK_FRAMES) / 60,
      onTick: addFieldBuffs,
      radius: BANNER_RADIUS,
      secondsRemaining: SKILL_HITMARK_FRAMES / 60 + bannerSeconds,
      tickIndex: 0,
      tickIntervalSeconds: BANNER_TICK_FRAMES / 60,
    };
  };

  const createJuugaField = (body: KitBody, combatant: Combatant): KitField => ({
    centre: { x: body.position.x, z: body.position.z },
    characterId: combatant.characterId,
    id: JUUGA_ID,
    isFollowing: true,
    kind: "field",
    nextTickSeconds: (BURST_HITMARK_FRAMES + BANNER_FIRST_TICK_FRAMES) / 60,
    onTick: addFieldBuffs,
    radius: UNBOUNDED_FIELD_RADIUS,
    secondsRemaining: BURST_HITMARK_FRAMES / 60 + juugaSeconds,
    tickIndex: 0,
    tickIntervalSeconds: BANNER_TICK_FRAMES / 60,
  });

  // Crystal Collapse ticks for as long as the field lasts, so the summon that follows the body holds every tick, set out at
  // The cast
  const createCrystalCollapse = (body: KitBody, combatant: Combatant): KitSummon => {
    const crystalCollapseHit: KitHit = {
      additiveBaseDamageBonus: createDefenseDamageBonus(BURST_DEFENSE_SHARE),
      element: Element.Geo,
      gauge: 1,
      hitArea: CRYSTAL_COLLAPSE_HIT_AREA,
      hitmarkSeconds: 0,
      internalCooldownTag: InternalCooldownTag.ElementalBurst,
      poiseDamage: 0,
      talentMultiplier: burstTalentMultiplier(1),
    };
    const tickCount = Math.floor((juugaSeconds * 60) / CRYSTAL_COLLAPSE_INTERVAL_FRAMES);
    const hits = createPeriodicKitHits(
      crystalCollapseHit,
      tickCount,
      BURST_HITMARK_FRAMES + CRYSTAL_COLLAPSE_FIRST_FRAMES,
      CRYSTAL_COLLAPSE_INTERVAL_FRAMES,
    );
    return createKitSummon(body, combatant, hits, {
      isFollowing: true,
      secondsRemaining: BURST_HITMARK_FRAMES / 60 + juugaSeconds,
    });
  };

  const normalAttacks: KitAction[] = NORMAL_ATTACK_FRAMES.map(({ cancelFrames, hitmarkFrames }, index) => ({
    hits: [
      {
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  return {
    burstCooldownSeconds: burstTalentMultiplier(3),
    burstEnergyCost: burstTalentMultiplier(4),
    chargedAttack: {
      hits: [
        {
          element: Element.Geo,
          gauge: 1,
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(5),
        },
      ],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [
        {
          additiveBaseDamageBonus: createDefenseDamageBonus(BURST_DEFENSE_SHARE),
          element: Element.Geo,
          gauge: 1,
          hitArea: JUUGA_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 40,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      // Juuga takes the banner's place, so a banner standing is put out, and from Ascension 1 the party's DEF rises
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        for (const effect of kitEffectState.effects)
          if (effect.kind === "field" && effect.id === WAR_BANNER_ID) effect.secondsRemaining = 0;
        addKitEffect(kitEffectState, createJuugaField(body, combatant));
        addKitEffect(kitEffectState, createCrystalCollapse(body, combatant));
        if (combatant.ascension >= 1)
          for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
            addKitEffect(kitEffectState, {
              amount: A1_DEFENSE_PERCENT,
              attribute: Attribute.DefensePercent,
              characterId,
              kind: "buff",
              secondsRemaining: A1_SECONDS,
              source: A1_SOURCE,
            });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          additiveBaseDamageBonus: createDefenseDamageBonus(SKILL_DEFENSE_SHARE),
          element: Element.Geo,
          gauge: 1,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: 80,
          talentMultiplier: skillTalentMultiplier(0),
        },
      ],
      // The banner is not placed while Juuga's field stands
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const isJuugaStanding = kitEffectState.effects.some(
          (effect) => effect.kind === "field" && effect.id === JUUGA_ID && effect.secondsRemaining > 0,
        );
        if (!isJuugaStanding) addKitEffect(kitEffectState, createWarBanner(body, combatant));
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(8),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(7),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(6),
    },
    skillCooldownSeconds: skillTalentMultiplier(3),
  };
};
