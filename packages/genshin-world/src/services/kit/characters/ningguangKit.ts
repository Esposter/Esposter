import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { GroundPoint } from "genshin-engine";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Ningguang's proud skill groups, read at her talent level. The attack group holds a strike's gem at 0, the charged
// Attack's gem at 1, a Star Jade at 2 and the charged attack's stamina at 3, and the plunges' collision, low and high at
// 4, 5 and 6. The skill group holds Jade Screen's damage at 1, the screen's share of her Max HP at 2, which nothing reads,
// And the skill's cooldown at 3. The burst group holds a Starshatter gem at 0, and the burst's cooldown and energy cost at
// 1 and 2
const NINGGUANG_ATTACK_GROUP_ID = 2731;
const NINGGUANG_SKILL_GROUP_ID = 2732;
const NINGGUANG_BURST_GROUP_ID = 2739;

// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });
// Measured: gcsim v2.47.2 (MIT) ningguang/attack.go, charge.go and burst.go. Each gem is a circle on the primary target, of
// Radius 0.5 for a strike's gem, a Star Jade and a Starshatter gem, 3.5 for a strike's gem from Piercing Fragments and 1.5
// For the charged attack's. An area does not hold a target, so each is priced round the body as the 5 metres an attack
// Targets within plus its radius
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ningguang/attack.go
const createGemReach = (radius: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: STRIKE_TARGETING_AREA.radius + radius });
const GEM_HIT_AREA = createGemReach(0.5);
const PIERCING_FRAGMENTS_HIT_AREA = createGemReach(3.5);
const CHARGED_ATTACK_HIT_AREA = createGemReach(1.5);
// Measured: gcsim v2.47.2 (MIT) ningguang/skill.go, the screen standing 3 metres ahead of the body, and the skill's hit a
// Circle of radius 5 round it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ningguang/skill.go
const JADE_SCREEN_OFFSET = 3;
const JADE_SCREEN_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Provisional: gcsim has no plunge file for Ningguang, so the plunges' reach is Mona's and Jean's until one measures it
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });

// Measured: gcsim v2.47.2 (MIT) ningguang/attack.go, the Left and Twirl strikes' two gems at 29 and 27 frames and their
// Animations of 61 and 66, each gem landing past gcsim's default travel of 10 frames. gcsim draws each strike at random
// From the two the last was not, and Left and Twirl in turn is one such draw
const GEM_TRAVEL_FRAMES = 10;
const STRIKE_GEM_COUNT = 2;
const NINGGUANG_STRIKES = [
  { frames: 61, hitmarkFrames: 29 },
  { frames: 66, hitmarkFrames: 27 },
];
// Measured: gcsim v2.47.2 (MIT) ningguang/charge.go, the Left charge gcsim plays after either strike, which skips 15
// Frames of its windup there: its gem at 35 frames, its Star Jades at 45, or 40 for Grandeur Be the Seven Stars' seven,
// Each past the travel, and its animation's 52
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ningguang/charge.go
const CHARGED_ATTACK_WINDUP_FRAMES = 15;
const CHARGED_ATTACK_HITMARK_FRAMES = 35;
const STAR_JADE_HITMARK_FRAMES = 45;
const GRANDEUR_STAR_JADE_HITMARK_FRAMES = 40;
const CHARGED_ATTACK_FRAMES = 52;
// Measured: gcsim v2.47.2 (MIT) ningguang/skill.go, the skill's hit at 17 frames, its animation's 62, and the screen's 1800
// Frames, the wiki's 30 seconds
const SKILL_HITMARK_FRAMES = 17;
const SKILL_FRAMES = 62;
const JADE_SCREEN_FRAMES = 1800;
// Measured: gcsim v2.47.2 (MIT) ningguang/burst.go, the six gems at 62, 97, 106, 110, 116 and 124 frames and the
// Animation's 127. A standing screen fires the wiki's six gems more, which gcsim lands 30 frames past the last gem
// Provisional: those 30 frames, which gcsim marks as still to measure
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ningguang/burst.go
const BURST_GEM_HITMARK_FRAMES = [62, 97, 106, 110, 116, 124];
const BURST_FRAMES = 127;
const JADE_SCREEN_GEM_COUNT = 6;
const JADE_SCREEN_GEM_HITMARK_FRAMES = 124 + 30;
// Ningguang holds up to 3 Star Jades from her strikes, as the wiki's Sparkling Scatter and gcsim's attack.go give it
// https://genshin-impact.fandom.com/wiki/Sparkling_Scatter
const STAR_JADE_MAX_COUNT = 3;
// Backup Plan, from Ascension 1, spends no stamina on a charged attack while Ningguang holds a Star Jade, as the wiki's
// Passive page and gcsim v2.47.2 (MIT) ningguang/ningguang.go give it
// https://genshin-impact.fandom.com/wiki/Backup_Plan
const BACKUP_PLAN_ASCENSION = 1;
// Piercing Fragments, from one constellation, widens a strike's gem to gcsim's circle of 3.5, as gcsim v2.47.2 (MIT)
// Ningguang/attack.go gives it
// https://genshin-impact.fandom.com/wiki/Piercing_Fragments
const PIERCING_FRAGMENTS_CONSTELLATION = 1;
// Shock Effect, from two constellations, resets Jade Screen's cooldown as the screen shatters, at most once every 6
// Seconds, as the wiki's constellation page gives it and gcsim v2.47.2 (MIT) ningguang/screen.go counts its 360 frames
// https://genshin-impact.fandom.com/wiki/Shock_Effect
const SHOCK_EFFECT_CONSTELLATION = 2;
const SHOCK_EFFECT_SECONDS = 6;
// Grandeur Be the Seven Stars, from six constellations, gives Ningguang 7 Star Jades as Starshatter is cast, as the wiki's
// Constellation page and gcsim v2.47.2 (MIT) ningguang/burst.go give it
// https://genshin-impact.fandom.com/wiki/Grandeur_Be_the_Seven_Stars
const GRANDEUR_CONSTELLATION = 6;
const GRANDEUR_STAR_JADE_COUNT = 7;

// Whether an effect is one of a character's Star Jades: a field of hers with no edge that ticks on every step
const checkIsStarJade = (effect: KitEffect, characterId: number): boolean =>
  effect.kind === "field" && effect.characterId === characterId && effect.tickIntervalSeconds === FIXED_STEP_SECONDS;

// Whether a character's Shock Effect stands, which no other reset passes while it does: her field that ticks once, as
// Her Star Jades tick on every step
const checkIsShockEffect = (effect: KitEffect, characterId: number): boolean =>
  effect.kind === "field" &&
  effect.characterId === characterId &&
  effect.tickIntervalSeconds === Number.POSITIVE_INFINITY;

// A Star Jade: a field with no edge, standing until a charged attack fires it, which ticks on every step and ends itself
// Once its character has left the field, as gcsim clears the jades on a swap
const createStarJade = (characterId: number, { x, z }: GroundPoint): KitField => {
  const starJade: KitField = {
    centre: { x, z },
    characterId,
    kind: "field",
    nextTickSeconds: 0,
    onTick: ({ activeCombatant }) => {
      if (activeCombatant.characterId !== characterId) starJade.secondsRemaining = 0;
    },
    radius: UNBOUNDED_FIELD_RADIUS,
    secondsRemaining: Number.POSITIVE_INFINITY,
    tickIndex: 0,
    tickIntervalSeconds: FIXED_STEP_SECONDS,
  };
  return starJade;
};

// Shock Effect: a field with no edge that ticks once as the screen shatters and resets the skill's cooldown if it runs,
// Then stands its 6 seconds. With no cooldown running it resets nothing and ends there, as gcsim marks no reset then
const createShockEffect = (characterId: number, { x, z }: GroundPoint): KitField => {
  const shockEffect: KitField = {
    centre: { x, z },
    characterId,
    kind: "field",
    nextTickSeconds: 0,
    onTick: ({ party }) => {
      const partyMember = getPartyMember(party, characterId);
      if (partyMember.skillCooldownSeconds > 0) partyMember.skillCooldownSeconds = 0;
      else shockEffect.secondsRemaining = 0;
    },
    radius: UNBOUNDED_FIELD_RADIUS,
    secondsRemaining: SHOCK_EFFECT_SECONDS,
    tickIndex: 0,
    tickIntervalSeconds: Number.POSITIVE_INFINITY,
  };
  return shockEffect;
};

// Ningguang's first kit, at talent level 1: two strikes in turn, each of two gems that give her a Star Jade, a charged
// Attack firing the jades she holds, a collision and two plunges, Jade Screen's hit and screen, and Starshatter's gems
// With the screen's. Its multipliers are read from her proud skill groups
export const createNingguangKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  // The wiki's Sparkling Scatter gives each strike's gem 1U of Geo under the Normal Attack internal cooldown, 45 poise and
  // Blunt. The gems land from a summon cast where Ningguang stands as the strike starts, and the first of them to strike
  // An enemy gives her a Star Jade up to 3, as gcsim's one guarded callback over both gems does
  const normalAttacks = NINGGUANG_STRIKES.map(({ frames, hitmarkFrames }): KitAction => {
    const gem: KitHit = {
      element: Element.Geo,
      gauge: 1,
      hitArea: GEM_HIT_AREA,
      hitmarkSeconds: (hitmarkFrames + GEM_TRAVEL_FRAMES) / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      isBlunt: true,
      poiseDamage: 45,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, NINGGUANG_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
    };
    const piercingFragmentsGem: KitHit = { ...gem, hitArea: PIERCING_FRAGMENTS_HIT_AREA };
    return {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        let isStarJadeGiven = false;
        const strikeGem: KitHit = {
          ...(combatant.constellationCount >= PIERCING_FRAGMENTS_CONSTELLATION ? piercingFragmentsGem : gem),
          onStrike: (strikeContext) => {
            if (isStarJadeGiven) return;
            isStarJadeGiven = true;
            const starJadeCount = strikeContext.kitEffectState.effects.filter((effect) =>
              checkIsStarJade(effect, strikeContext.combatant.characterId),
            ).length;
            if (starJadeCount < STAR_JADE_MAX_COUNT)
              addKitEffect(
                strikeContext.kitEffectState,
                createStarJade(strikeContext.combatant.characterId, strikeContext.body.position),
              );
          },
        };
        addKitEffect(
          kitEffectState,
          createKitSummon(
            body,
            combatant,
            Array.from({ length: STRIKE_GEM_COUNT }, () => strikeGem),
          ),
        );
      },
      seconds: frames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    };
  });
  // The wiki's Sparkling Scatter gives the charged attack's gem 1U of Geo with 45 poise and each Star Jade 1U with 30, all
  // Blunt under the Charged Attack internal cooldown
  const chargedAttackGem: KitHit = {
    element: Element.Geo,
    gauge: 1,
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: (CHARGED_ATTACK_HITMARK_FRAMES - CHARGED_ATTACK_WINDUP_FRAMES + GEM_TRAVEL_FRAMES) / 60,
    internalCooldownTag: InternalCooldownTag.ChargedAttack,
    isBlunt: true,
    poiseDamage: 45,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, NINGGUANG_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
  };
  const starJadeShot: KitHit = {
    element: Element.Geo,
    gauge: 1,
    hitArea: GEM_HIT_AREA,
    hitmarkSeconds: (STAR_JADE_HITMARK_FRAMES - CHARGED_ATTACK_WINDUP_FRAMES + GEM_TRAVEL_FRAMES) / 60,
    internalCooldownTag: InternalCooldownTag.ChargedAttack,
    isBlunt: true,
    poiseDamage: 30,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, NINGGUANG_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
  };
  const grandeurStarJadeShot: KitHit = {
    ...starJadeShot,
    hitmarkSeconds: (GRANDEUR_STAR_JADE_HITMARK_FRAMES - CHARGED_ATTACK_WINDUP_FRAMES + GEM_TRAVEL_FRAMES) / 60,
  };
  // The charged attack's gem and a shot for each Star Jade Ningguang holds land from a summon cast where she stands, and the
  // Jades are spent
  const fireChargedAttack = ({ body, combatant, kitEffectState }: KitStepContext): void => {
    const starJades = kitEffectState.effects.filter((effect) => checkIsStarJade(effect, combatant.characterId));
    kitEffectState.effects = kitEffectState.effects.filter((effect) => !starJades.includes(effect));
    const shot = starJades.length === GRANDEUR_STAR_JADE_COUNT ? grandeurStarJadeShot : starJadeShot;
    addKitEffect(kitEffectState, createKitSummon(body, combatant, [chargedAttackGem, ...starJades.map(() => shot)]));
  };
  // The wiki's Jade Screen gives the skill's hit 1U of Geo with no internal cooldown, 133.2 poise and blunt
  const jadeScreenHit: KitHit = {
    element: Element.Geo,
    gauge: 1,
    hitArea: JADE_SCREEN_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    isBlunt: true,
    poiseDamage: 133.2,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, NINGGUANG_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
  const checkIsJadeScreen = (effect: KitEffect, characterId: number): effect is KitSummon =>
    effect.kind === "summon" && effect.combatant.characterId === characterId && effect.hits.includes(jadeScreenHit);
  // Shatters the screen Ningguang has standing, if any, and returns it. From two constellations the shatter sets Shock
  // Effect going unless one already stands
  const shatterJadeScreen = ({ body, combatant, kitEffectState }: KitStepContext): KitSummon | undefined => {
    const jadeScreen = kitEffectState.effects.find((effect) => checkIsJadeScreen(effect, combatant.characterId));
    if (jadeScreen === undefined) return undefined;
    kitEffectState.effects = kitEffectState.effects.filter((effect) => effect !== jadeScreen);
    if (
      combatant.constellationCount >= SHOCK_EFFECT_CONSTELLATION &&
      !kitEffectState.effects.some((effect) => checkIsShockEffect(effect, combatant.characterId))
    )
      addKitEffect(kitEffectState, createShockEffect(combatant.characterId, body.position));
    return jadeScreen;
  };
  // Jade Screen is a summon standing 3 metres ahead of Ningguang for its seconds, which lands the skill's hit round it.
  // Only one stands, so a recast shatters the one before
  const castJadeScreen = (context: KitStepContext): void => {
    shatterJadeScreen(context);
    const {
      body: { facing, height, position },
      combatant,
      kitEffectState,
    } = context;
    // Ahead of a body at its facing lies the bearing -sin and -cos of that facing, as computeFacingAngle reads it
    const screenBody = {
      facing,
      height,
      position: {
        x: position.x - Math.sin(facing) * JADE_SCREEN_OFFSET,
        z: position.z - Math.cos(facing) * JADE_SCREEN_OFFSET,
      },
    };
    addKitEffect(kitEffectState, createKitSummon(screenBody, combatant, [jadeScreenHit], JADE_SCREEN_FRAMES / 60));
  };
  // The wiki's Starshatter gives each gem 1U of Geo under the Elemental Burst internal cooldown, 30 poise and blunt, where
  // Gcsim gives 2U
  const createBurstGem = (hitmarkFrames: number): KitHit => ({
    element: Element.Geo,
    gauge: 1,
    hitArea: GEM_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    isBlunt: true,
    poiseDamage: 30,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, NINGGUANG_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  });
  const burstGemHits = BURST_GEM_HITMARK_FRAMES.map((hitmarkFrames) => createBurstGem(hitmarkFrames));
  const jadeScreenGem = createBurstGem(JADE_SCREEN_GEM_HITMARK_FRAMES);
  const jadeScreenGemHits = Array.from({ length: JADE_SCREEN_GEM_COUNT }, () => jadeScreenGem);
  // Starshatter's gems land from a summon cast where Ningguang stands. A screen standing shatters into its own gems, priced
  // As she stood when she cast it, as gcsim snapshots them with the skill. From six constellations the burst replaces the
  // Star Jades she holds with 7, which her strikes add none to
  const castStarshatter = (context: KitStepContext): void => {
    const { body, combatant, kitEffectState } = context;
    addKitEffect(kitEffectState, createKitSummon(body, combatant, burstGemHits));
    const jadeScreen = shatterJadeScreen(context);
    if (jadeScreen !== undefined)
      addKitEffect(kitEffectState, createKitSummon(body, jadeScreen.combatant, jadeScreenGemHits));
    if (combatant.constellationCount < GRANDEUR_CONSTELLATION) return;
    kitEffectState.effects = kitEffectState.effects.filter((effect) => !checkIsStarJade(effect, combatant.characterId));
    for (let index = 0; index < GRANDEUR_STAR_JADE_COUNT; index++)
      addKitEffect(kitEffectState, createStarJade(combatant.characterId, body.position));
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, NINGGUANG_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, NINGGUANG_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    chargedAttack: {
      hits: [],
      onStart: fireChargedAttack,
      seconds: (CHARGED_ATTACK_FRAMES - CHARGED_ATTACK_WINDUP_FRAMES) / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // The table's, the wiki's and gcsim's 50 stamina, spent as the charged attack starts
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, NINGGUANG_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
    elementalBurst: {
      hits: [],
      onStart: castStarshatter,
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [],
      onStart: castJadeScreen,
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    getChargedAttackStaminaMultiplier: ({ combatant, kitEffectState }) =>
      combatant.ascension >= BACKUP_PLAN_ASCENSION &&
      kitEffectState.effects.some((effect) => checkIsStarJade(effect, combatant.characterId))
        ? 0
        : 1,
    // Provisional: gcsim has no plunge file for Ningguang and no source gives her plunges' landing frames, so each hits as
    // Its action starts, as Mona's do. The wiki's Sparkling Scatter gives them 1U of Geo with 50 and 100 poise
    highPlunge: {
      hits: [
        {
          element: Element.Geo,
          gauge: 1,
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NINGGUANG_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          element: Element.Geo,
          gauge: 1,
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: 50,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, NINGGUANG_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 5, and it deals Geo with no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      element: Element.Geo,
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 5,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, NINGGUANG_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
    },
    // The group's, the wiki's and gcsim's 12 seconds
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, NINGGUANG_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
  };
};
