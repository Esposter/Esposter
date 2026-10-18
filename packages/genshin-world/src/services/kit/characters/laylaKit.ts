import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Measured: gcsim (MIT) layla/burst.go, Starlight Slug's field holds a circle of radius 12 round the body. Each tick strikes
// The closest enemy in the circle, which the kit cannot pick, so each tick reaches every enemy in its reach, which
// Overstates a tick against several enemies
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/layla
const STARLIGHT_SLUG_RADIUS = 12;

export const LAYLA_CHARACTER_ID = 10_000_074;
// The resource of the Night Stars her shield and burst strikes add, and the status of the Shooting Stars they fire
export const LAYLA_NIGHT_STARS_ID = "layla-night-stars";
export const LAYLA_SHOOTING_STARS_ID = "layla-shooting-stars";
const LAYLA_NIGHT_STAR_TICK_ID = "layla-night-star-tick";

const ASCENSION_4 = 4;
// Gcsim's a4: a Shooting Star adds 1.5% of Max HP, flat, to its damage from Ascension 4
const ASCENSION_4_MAX_HEALTH_SHARE = 0.015;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_SHIELD_ABSORPTION_BONUS = 0.2;
const CONSTELLATION_2 = 2;

// Gcsim's shield.go: four Night Stars fire the Shooting Stars, and a shield's tick adds one each 1.5 seconds while it lasts.
// A skill adds two and a burst strike one, each on its own internal cooldown
const NIGHT_STARS_MAXIMUM = 4;
const NIGHT_STAR_TICK_SECONDS = 1.5;
const SKILL_NIGHT_STAR_ICD = { id: "layla-night-star-skill-icd", seconds: 0.3 };
const BURST_NIGHT_STAR_ICD = { id: "layla-night-star-burst-icd", seconds: 0.5 };
// Gcsim's shootStars: the search for an enemy in reach is run again 0.1 seconds on, the first Shooting Star is cast 0.5
// Seconds after an enemy is found, and each one after that 0.45 seconds on. Its enemy is the closest within 10 metres
const SHOOTING_STAR_SEARCH_SECONDS = 0.1;
const SHOOTING_STAR_FIRST_SECONDS = 0.5;
const SHOOTING_STAR_INTERVAL_SECONDS = 0.45;
const SHOOTING_STAR_REACH = 10;

// Whether Layla's shield holds on the team, the one her skill sets, which the Night Stars need
const checkIsLaylaShieldLive = (effects: readonly KitEffect[]): boolean =>
  effects.some((effect) => checkIsKitShieldLive(effect) && effect.characterId === LAYLA_CHARACTER_ID);

// The enemy a Shooting Star flies at: the closest living one within its reach of the body, or none
const findShootingStarTarget = ({ body, enemyMap }: KitContext): Enemy | undefined => {
  let target: Enemy | undefined;
  let targetDistance = Number.POSITIVE_INFINITY;
  for (const enemy of enemyMap.values()) {
    if ([EnemyState.Dead, EnemyState.Return].includes(enemy.state)) continue;
    const distance = Math.hypot(enemy.position.x - body.position.x, enemy.position.z - body.position.z);
    if (distance <= SHOOTING_STAR_REACH && distance < targetDistance) {
      target = enemy;
      targetDistance = distance;
    }
  }
  return target;
};

// Layla's behaviour: Nights of Formal Focus sets her Cryo shield, its health its flat HP plus its share of her Max HP, as
// It is cast. Starlight Slug casts its field where she stands, each tick striking from there with a flat damage of its share
// Of her Max HP as the burst was cast, which its talent multiplier does not scale. Her shield's tick, her skill's and her
// Burst strikes' Night Stars fire Shooting Stars at the nearest enemy in reach, each striking its circle after its travel,
// Her Ascension 4 adds to each, and Constellation 2 gives her energy on each one's first strike. Her other Ascension
// Passives and Constellations 1, 4 and 6, the Curtain and Dawn Star and the shorter Night Stars interval, are not built
// Constellation 1's shields for members not under a Curtain need the Cryo effectiveness a shield does not carry
// Constellation 4 needs Dawn Star on nearby members' Normal and Charged Attacks, which is not built
// Constellation 6 needs 40% more DMG on Shooting Stars and Starlight Slugs, and a shorter Night Stars interval
export const createLaylaKitBehaviour = ({
  readFramesList,
  readHit,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const shieldFlatHealth = readParameter("nightsOfFormalFocusShieldFlatHealth");
  const shieldMaxHealthShare = readParameter("nightsOfFormalFocusShieldMaxHealthShare");
  const shieldSeconds = readParameter("nightsOfFormalFocusShieldSeconds");
  // The strike as its record holds it, before its share of her Max HP is priced in
  const starlightSlugBaseStrike = readHit("starlightSlugStrike");
  const starlightSlugMaxHealthShare = readParameter("starlightSlugMaxHealthShare");
  const starlightSlugStartSeconds = readSeconds("starlightSlugStart");
  const starlightSlugSeconds = readSeconds("starlightSlugDuration");
  const starlightSlugTickIntervalSeconds = readSeconds("starlightSlugTickInterval");
  const createStarlightSlugStrike = (): KitHit => ({
    ...starlightSlugBaseStrike,
    additiveBaseDamageBonus: createMaxHealthScaledBonus(starlightSlugMaxHealthShare),
  });
  // The Shooting Star as its record holds it, its travel in frames by the Night Stars it is fired with, four first
  const shootingStarStrike = readHit("shootingStarStrike");
  const shootingStarTravelFrames = readFramesList("shootingStarTravels");

  // Adds Night Stars to the team's effects, as gcsim's addNightStars does: none while Shooting Stars fire, none inside the
  // Cooldown of the source they come from, and four starts the Shooting Stars
  const addNightStars = (
    kitEffectState: KitEffectState,
    combatant: Combatant,
    count: number,
    icd?: { id: string; seconds: number },
  ) => {
    if (checkIsKitStatusActive(kitEffectState.effects, LAYLA_CHARACTER_ID, LAYLA_SHOOTING_STARS_ID)) return;
    if (icd) {
      if (checkIsKitStatusActive(kitEffectState.effects, LAYLA_CHARACTER_ID, icd.id)) return;
      addKitStatus(kitEffectState, LAYLA_CHARACTER_ID, { id: icd.id, secondsRemaining: icd.seconds });
    }
    const stars = gainKitResource(kitEffectState, LAYLA_CHARACTER_ID, LAYLA_NIGHT_STARS_ID, count, NIGHT_STARS_MAXIMUM);
    if (stars === NIGHT_STARS_MAXIMUM) startShootingStars(kitEffectState, combatant);
  };

  const startShootingStars = (kitEffectState: KitEffectState, combatant: Combatant) => {
    addKitStatus(kitEffectState, LAYLA_CHARACTER_ID, {
      id: LAYLA_SHOOTING_STARS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    scheduleKitTask(kitEffectState, LAYLA_CHARACTER_ID, SHOOTING_STAR_SEARCH_SECONDS, (context) =>
      searchForShootingStar(context, combatant),
    );
  };

  // The search before the first Shooting Star: one found is fired at after 0.5 seconds, none is searched for again
  const searchForShootingStar = (context: KitContext, combatant: Combatant) => {
    const target = findShootingStarTarget(context);
    if (target)
      scheduleKitTask(context.kitEffectState, LAYLA_CHARACTER_ID, SHOOTING_STAR_FIRST_SECONDS, (tickContext) =>
        fireShootingStar(tickContext, combatant, target),
      );
    else
      scheduleKitTask(context.kitEffectState, LAYLA_CHARACTER_ID, SHOOTING_STAR_SEARCH_SECONDS, (tickContext) =>
        searchForShootingStar(tickContext, combatant),
      );
  };

  // One Shooting Star, fired at the closest enemy in reach, or at the last one fired at when none is in reach. It spends a
  // Night Star, its travel the frames the Night Stars left before it allow, and the next one is fired 0.45 seconds on. The
  // Last one ends the Shooting Stars, and restarts the tick that adds Night Stars while the shield lasts
  const fireShootingStar = (context: KitContext, combatant: Combatant, lastTarget: Enemy) => {
    const { kitEffectState } = context;
    const target = findShootingStarTarget(context) ?? lastTarget;
    const stars = countKitResource(kitEffectState.effects, LAYLA_CHARACTER_ID, LAYLA_NIGHT_STARS_ID);
    const travelFrames = shootingStarTravelFrames[NIGHT_STARS_MAXIMUM - stars];
    if (travelFrames !== undefined) castShootingStar(kitEffectState, combatant, target, travelFrames);
    spendKitResource(kitEffectState, LAYLA_CHARACTER_ID, LAYLA_NIGHT_STARS_ID);
    if (stars > 1) {
      gainKitResource(kitEffectState, LAYLA_CHARACTER_ID, LAYLA_NIGHT_STARS_ID, stars - 1, NIGHT_STARS_MAXIMUM);
      scheduleKitTask(kitEffectState, LAYLA_CHARACTER_ID, SHOOTING_STAR_INTERVAL_SECONDS, (tickContext) =>
        fireShootingStar(tickContext, combatant, target),
      );
      return;
    }
    spendKitResource(kitEffectState, LAYLA_CHARACTER_ID, LAYLA_SHOOTING_STARS_ID);
    if (checkIsLaylaShieldLive(kitEffectState.effects)) startNightStarTick(kitEffectState, combatant);
  };

  // A Shooting Star cast where its target stands, its hit landing from there after its travel. From Ascension 4 it adds to
  // Its damage, and from Constellation 2 its first strike gives Layla energy, once
  const castShootingStar = (
    kitEffectState: KitEffectState,
    combatant: Combatant,
    target: Enemy,
    travelFrames: number,
  ) => {
    let isStruck = false;
    const hit: KitHit = {
      ...shootingStarStrike,
      hitmarkSeconds: toKitSeconds(travelFrames),
      ...(combatant.ascension >= ASCENSION_4 && {
        additiveBaseDamageBonus: ({ attributes: { maxHealth } }: Combatant) => ASCENSION_4_MAX_HEALTH_SHARE * maxHealth,
      }),
      onStrike: ({ party }) => {
        if (isStruck) return;
        isStruck = true;
        if (combatant.constellationCount >= CONSTELLATION_2) gainPartyMemberEnergy(party, combatant, 1);
      },
    };
    castKitSummon(kitEffectState, { facing: 0, height: 0, position: target.position }, combatant, [hit], {
      attackTag: AttackTag.ElementalSkill,
    });
  };

  // Restarts the tick that adds a Night Star each 1.5 seconds while the shield lasts, as gcsim's tickNightStar re-arms it
  // When the skill is used and when the Shooting Stars end. The shield's end ends it
  const startNightStarTick = (kitEffectState: KitEffectState, combatant: Combatant) => {
    removeKitEffects(kitEffectState, (effect) => effect.kind === "field" && effect.id === LAYLA_NIGHT_STAR_TICK_ID);
    castKitField(
      kitEffectState,
      LAYLA_CHARACTER_ID,
      { x: 0, z: 0 },
      {
        id: LAYLA_NIGHT_STAR_TICK_ID,
        nextTickSeconds: NIGHT_STAR_TICK_SECONDS,
        onTick: (context) => {
          if (checkIsLaylaShieldLive(context.kitEffectState.effects))
            addNightStars(context.kitEffectState, combatant, 1, SKILL_NIGHT_STAR_ICD);
        },
        secondsRemaining: Number.POSITIVE_INFINITY,
        tickIntervalSeconds: NIGHT_STAR_TICK_SECONDS,
      },
    );
  };

  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        const starlightSlugStrike = createStarlightSlugStrike();
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: starlightSlugStartSeconds,
          onTick: ({ kitEffectState: tickEffectState }) => {
            // The tick's first enemy strike adds a Night Star, as gcsim's burst callback does, once per tick
            let isStruck = false;
            castKitSummon(
              tickEffectState,
              { facing, height, position: field.centre },
              combatant,
              [
                {
                  ...starlightSlugStrike,
                  onStrike: ({ kitEffectState: strikeEffectState }) => {
                    if (isStruck) return;
                    isStruck = true;
                    if (checkIsLaylaShieldLive(strikeEffectState.effects))
                      addNightStars(strikeEffectState, combatant, 1, BURST_NIGHT_STAR_ICD);
                  },
                },
              ],
              { attackTag: AttackTag.ElementalBurst },
            );
          },
          radius: STARLIGHT_SLUG_RADIUS,
          secondsRemaining: starlightSlugSeconds,
          tickIntervalSeconds: starlightSlugTickIntervalSeconds,
        });
      },
    },
    onKitEvent: (event, context, combatant) => {
      const { kitEffectState } = context;
      // Any member's skill adds two Night Stars while the shield holds, as gcsim subscribes to every skill's use
      if (event.kind === KitEventKind.SkillUsed) {
        if (checkIsLaylaShieldLive(kitEffectState.effects))
          addNightStars(kitEffectState, combatant, 2, SKILL_NIGHT_STAR_ICD);
      } else if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "shield" &&
        event.effect.characterId === LAYLA_CHARACTER_ID
      ) {
        // The shield's end clears the Night Stars, unless Shooting Stars are firing, and ends its tick
        if (!checkIsKitStatusActive(kitEffectState.effects, LAYLA_CHARACTER_ID, LAYLA_SHOOTING_STARS_ID))
          spendKitResource(kitEffectState, LAYLA_CHARACTER_ID, LAYLA_NIGHT_STARS_ID);
        removeKitEffects(kitEffectState, (effect) => effect.kind === "field" && effect.id === LAYLA_NIGHT_STAR_TICK_ID);
      }
    },
    skill: {
      onStart: ({ activeCombatant: combatant, characterIdCombatantMap, kitEffectState, party }) => {
        const curtainBonus =
          combatant.constellationCount >= CONSTELLATION_1 ? 1 + CONSTELLATION_1_SHIELD_ABSORPTION_BONUS : 1;
        const maxHealth = getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
        castKitShield(kitEffectState, combatant.characterId, {
          element: Element.Cryo,
          health: (shieldFlatHealth + shieldMaxHealthShare * maxHealth) * curtainBonus,
          secondsRemaining: shieldSeconds,
        });
        startNightStarTick(kitEffectState, combatant);
      },
    },
  };
};
