import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { GroundPoint } from "genshin-engine";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) ningguang/skill.go, the screen standing 3 metres ahead of the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ningguang/skill.go
const JADE_SCREEN_OFFSET = 3;
// Each strike fires two gems, as gcsim v2.47.2 (MIT) ningguang/attack.go does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ningguang/attack.go
const STRIKE_GEM_COUNT = 2;
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

// A Star Jade: a field with no edge, standing until a charged attack fires it. Leaving the field loses it through the
// Swap's kit event, as gcsim clears the jades on a swap
const castStarJade = (kitEffectState: KitEffectState, characterId: number, centre: GroundPoint): void => {
  castKitField(kitEffectState, characterId, centre, {
    nextTickSeconds: 0,
    onTick: () => undefined,
    secondsRemaining: Number.POSITIVE_INFINITY,
    tickIntervalSeconds: FIXED_STEP_SECONDS,
  });
};

// Shock Effect: a field with no edge that ticks once as the screen shatters and resets the skill's cooldown if it runs,
// Then stands its 6 seconds. With no cooldown running it resets nothing and ends there, as gcsim marks no reset then
const castShockEffect = (kitEffectState: KitEffectState, characterId: number, centre: GroundPoint): void => {
  const shockEffect = castKitField(kitEffectState, characterId, centre, {
    nextTickSeconds: 0,
    onTick: ({ party }) => {
      const partyMember = getPartyMember(party, characterId);
      if (partyMember.skillCooldownSeconds > 0) partyMember.skillCooldownSeconds = 0;
      else shockEffect.secondsRemaining = 0;
    },
    secondsRemaining: SHOCK_EFFECT_SECONDS,
    tickIntervalSeconds: Number.POSITIVE_INFINITY,
  });
};

export const NINGGUANG_CHARACTER_ID = 10_000_027;

// Ningguang's behaviour: each strike's two gems land from a summon cast where she stands, widened by Piercing Fragments
// From one constellation, and the first of them to strike an enemy gives her a Star Jade up to 3, as gcsim's one guarded
// Callback over both gems does. A charged attack fires its gem and a shot for each Star Jade she holds, spending them,
// And spends no stamina from Ascension 1 while she holds one. Jade Screen stands ahead of her, and a recast or Starshatter
// Shatters it, setting Shock Effect going from two constellations. Starshatter's gems land from a summon where she
// Stands, a standing screen adding its own, and from six constellations she holds 7 Star Jades
export const createNingguangKitBehaviour = ({ readHit, readHits, readSeconds }: KitRecordReader): KitBehaviour => {
  const gems = readHits("strikeGem");
  const piercingFragmentsGems = readHits("piercingFragmentsStrikeGem");
  const chargedAttackGem = readHit("chargedAttackGem");
  const starJadeShot = readHit("starJadeShot");
  const grandeurStarJadeShot = readHit("grandeurStarJadeShot");
  const jadeScreenHit = readHit("jadeScreen");
  const jadeScreenSeconds = readSeconds("jadeScreen");
  const burstGems = readHits("starshatterGem");
  const jadeScreenGems = readHits("jadeScreenGem");
  const normalAttacks = gems.map((gem, index): KitActionBehaviour => {
    const piercingFragmentsGem = takeOne(piercingFragmentsGems, index);
    return {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        let isStarJadeGiven = false;
        const strikeGem: KitHit = {
          ...(combatant.constellationCount >= PIERCING_FRAGMENTS_CONSTELLATION ? piercingFragmentsGem : gem),
          onStrike: (strikeContext, strike) => {
            if (isStarJadeGiven) return;
            isStarJadeGiven = true;
            const starJadeCount = strikeContext.kitEffectState.effects.filter((effect) =>
              checkIsStarJade(effect, strike.combatant.characterId),
            ).length;
            if (starJadeCount < STAR_JADE_MAX_COUNT)
              castStarJade(strikeContext.kitEffectState, strike.combatant.characterId, strike.body.position);
          },
        };
        castKitSummon(
          kitEffectState,
          body,
          combatant,
          Array.from({ length: STRIKE_GEM_COUNT }, () => strikeGem),
        );
      },
    };
  });
  const checkIsJadeScreen = (effect: KitEffect, characterId: number): effect is KitSummon =>
    effect.kind === "summon" && effect.combatant.characterId === characterId && effect.hits.includes(jadeScreenHit);
  // Shatters the screen Ningguang has standing, if any, and returns it. From two constellations the shatter sets Shock
  // Effect going unless one already stands
  const shatterJadeScreen = ({
    activeCombatant: combatant,
    body,
    kitEffectState,
  }: KitContext): KitSummon | undefined => {
    const jadeScreen = kitEffectState.effects.find((effect) => checkIsJadeScreen(effect, combatant.characterId));
    if (jadeScreen === undefined) return undefined;
    removeKitEffects(kitEffectState, (effect) => effect === jadeScreen);
    if (
      combatant.constellationCount >= SHOCK_EFFECT_CONSTELLATION &&
      !kitEffectState.effects.some((effect) => checkIsShockEffect(effect, combatant.characterId))
    )
      castShockEffect(kitEffectState, combatant.characterId, body.position);
    return jadeScreen;
  };
  return {
    // Starshatter's gems land from a summon cast where Ningguang stands. A screen standing shatters into its own gems,
    // Priced as she stood when she cast it, as gcsim snapshots them with the skill. From six constellations the burst
    // Replaces the Star Jades she holds with 7, which her strikes add none to
    burst: {
      onStart: (context) => {
        const { activeCombatant: combatant, body, kitEffectState } = context;
        castKitSummon(kitEffectState, body, combatant, burstGems);
        const jadeScreen = shatterJadeScreen(context);
        if (jadeScreen !== undefined) castKitSummon(kitEffectState, body, jadeScreen.combatant, jadeScreenGems);
        if (combatant.constellationCount < GRANDEUR_CONSTELLATION) return;
        removeKitEffects(kitEffectState, (effect) => checkIsStarJade(effect, combatant.characterId));
        for (let index = 0; index < GRANDEUR_STAR_JADE_COUNT; index++)
          castStarJade(kitEffectState, combatant.characterId, body.position);
      },
    },
    // The charged attack's gem and a shot for each Star Jade Ningguang holds land from a summon cast where she stands,
    // And the jades are spent
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const starJades = kitEffectState.effects.filter((effect) => checkIsStarJade(effect, combatant.characterId));
        removeKitEffects(kitEffectState, (effect) => checkIsStarJade(effect, combatant.characterId));
        const shot = starJades.length === GRANDEUR_STAR_JADE_COUNT ? grandeurStarJadeShot : starJadeShot;
        castKitSummon(kitEffectState, body, combatant, [chargedAttackGem, ...starJades.map(() => shot)]);
      },
    },
    getChargedAttackStaminaMultiplier: ({ activeCombatant: combatant, kitEffectState }) =>
      combatant.ascension >= BACKUP_PLAN_ASCENSION &&
      kitEffectState.effects.some((effect) => checkIsStarJade(effect, combatant.characterId))
        ? 0
        : 1,
    normalAttacks,
    // Leaving the field loses the Star Jades, as gcsim clears them on a swap
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      removeKitEffects(kitEffectState, (effect) => checkIsStarJade(effect, combatant.characterId));
    },
    // Jade Screen is a summon standing 3 metres ahead of Ningguang for its seconds, which lands the skill's hit round it.
    // Only one stands, so a recast shatters the one before
    skill: {
      onStart: (context) => {
        shatterJadeScreen(context);
        const {
          activeCombatant: combatant,
          body: { facing, height, position },
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
        castKitSummon(kitEffectState, screenBody, combatant, [jadeScreenHit], { secondsRemaining: jadeScreenSeconds });
      },
    },
  };
};
