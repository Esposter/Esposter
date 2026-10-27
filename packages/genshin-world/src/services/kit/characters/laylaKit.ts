import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { createKitBody } from "#src/services/kit/createKitBody";
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
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";

// Measured: gcsim (MIT) layla/burst.go, Starlight Slug's field holds a circle of radius 12 round the body. Each tick strikes
// The closest enemy in the circle, which the kit cannot pick, so each tick reaches every enemy in its reach, which
// Overstates a tick against several enemies
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/layla
const STARLIGHT_SLUG_RADIUS = 12;

export const LAYLA_CHARACTER_ID = 10_000_074;
// The resource of the Night Stars her shield and burst strikes add, and the status of the Shooting Stars they fire
export const LAYLA_NIGHT_STARS_ID = "layla-night-stars";
export const LAYLA_SHOOTING_STARS_ID = "layla-shooting-stars";
const LAYLA_NIGHT_STAR_TICK_ID = "layla-night-star-tick";
export const LAYLA_DAWN_STAR_ID = "layla-dawn-star";

const ASCENSION_4 = 4;
// Gcsim's a4: a Shooting Star adds 1.5% of Max HP, flat, to its damage from Ascension 4
const ASCENSION_4_MAX_HEALTH_SHARE = 0.015;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_SHIELD_ABSORPTION_BONUS = 0.2;
const CONSTELLATION_2 = 2;
// Constellation 6: Shooting Stars and Starlight Slugs deal 40% more DMG, and the Night Stars' tick comes 20% sooner, as gcsim
// `v2.47.2` (MIT) layla/cons.go and shield.go give them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/layla/cons.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_DAMAGE_BONUS = 0.4;
const CONSTELLATION_6_NIGHT_STAR_TICK_SHARE = 0.8;
// Constellation 4's Dawn Star, as gcsim v2.47.2 (MIT) layla/cons.go gives it: the first Shooting Star gives every
// Deployed member the status for 3 seconds, which adds 5% of Layla's Max HP as flat damage to its Normal and Charged
// Attacks, and it is removed 0.05 seconds after one of them lands
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/layla/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_MAX_HEALTH_SHARE = 0.05;
const CONSTELLATION_4_SECONDS = 3;
const CONSTELLATION_4_REMOVAL_SECONDS = 0.05;

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

// The flat damage a Normal or Charged Attack adds while its striker carries Dawn Star, priced off Layla's Max HP
// Her own kit reads it for her strikes, and each member's kit for its own
const getDawnStarBonus = (
  layla: Combatant,
  { attackTag, combatant }: KitStrike,
  effects: readonly KitEffect[],
): number =>
  checkIsNormalOrChargedAttack(attackTag) && checkIsKitStatusActive(effects, combatant.characterId, LAYLA_DAWN_STAR_ID)
    ? createMaxHealthScaledBonus(CONSTELLATION_4_MAX_HEALTH_SHARE)(layla)
    : 0;

// Layla's behaviour: Nights of Formal Focus sets her Cryo shield, its health its flat HP plus its share of her Max HP, as
// It is cast. Starlight Slug casts its field where she stands, each tick striking from there with a flat damage of its share
// Of her Max HP as the burst was cast, which its talent multiplier does not scale. Her shield's tick, her skill's and her
// Burst strikes' Night Stars fire Shooting Stars at the nearest enemy in reach, each striking its circle after its travel,
// Her Ascension 4 adds to each, Constellation 2 gives her energy on each one's first strike, and Constellation 6 adds 40%
// DMG to them and to Starlight Slug and shortens the Night Stars' tick. The first Shooting Star gives each deployed
// Member Constellation 4's Dawn Star, which adds her Max HP's share to its Normal and Charged Attacks until one lands.
// Her Ascension 1 is not built, and neither are Constellation 1's team shields for members not under a Curtain, which
// Need the Cryo Effectiveness a shield does not carry
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
  const createStarlightSlugStrike = (constellationCount: number): KitHit => ({
    ...starlightSlugBaseStrike,
    additiveBaseDamageBonus: createMaxHealthScaledBonus(starlightSlugMaxHealthShare),
    ...(constellationCount >= CONSTELLATION_6 && { damageBonus: CONSTELLATION_6_DAMAGE_BONUS }),
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
    const { kitEffectState, party } = context;
    const target = findShootingStarTarget(context) ?? lastTarget;
    const stars = countKitResource(kitEffectState.effects, LAYLA_CHARACTER_ID, LAYLA_NIGHT_STARS_ID);
    // The first Shooting Star, fired at four stars, gives each deployed member Dawn Star from Constellation 4,
    // As gcsim's loop of Shooting Stars does on its first shot
    if (stars === NIGHT_STARS_MAXIMUM && combatant.constellationCount >= CONSTELLATION_4)
      for (const characterId of getDeployedCharacterIds(party))
        addKitStatus(kitEffectState, characterId, {
          id: LAYLA_DAWN_STAR_ID,
          secondsRemaining: CONSTELLATION_4_SECONDS,
        });
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
        additiveBaseDamageBonus: createMaxHealthScaledBonus(ASCENSION_4_MAX_HEALTH_SHARE),
      }),
      ...(combatant.constellationCount >= CONSTELLATION_6 && { damageBonus: CONSTELLATION_6_DAMAGE_BONUS }),
      onStrike: ({ party }) => {
        if (isStruck) return;
        isStruck = true;
        if (combatant.constellationCount >= CONSTELLATION_2) gainPartyMemberEnergy(party, combatant, 1);
      },
    };
    castKitSummon(kitEffectState, createKitBody(target.position), combatant, [hit], {
      attackTag: AttackTag.ElementalSkill,
    });
  };

  // Restarts the tick that adds a Night Star each 1.5 seconds while the shield lasts, as gcsim's tickNightStar re-arms it,
  // 1.2 seconds from Constellation 6. When the skill is used and when the Shooting Stars end. The shield's end ends it
  const startNightStarTick = (kitEffectState: KitEffectState, combatant: Combatant) => {
    removeKitEffects(kitEffectState, (effect) => effect.kind === "field" && effect.id === LAYLA_NIGHT_STAR_TICK_ID);
    const tickSeconds =
      combatant.constellationCount >= CONSTELLATION_6
        ? NIGHT_STAR_TICK_SECONDS * CONSTELLATION_6_NIGHT_STAR_TICK_SHARE
        : NIGHT_STAR_TICK_SECONDS;
    castKitField(
      kitEffectState,
      LAYLA_CHARACTER_ID,
      { x: 0, z: 0 },
      {
        id: LAYLA_NIGHT_STAR_TICK_ID,
        nextTickSeconds: tickSeconds,
        onTick: (context) => {
          if (checkIsLaylaShieldLive(context.kitEffectState.effects))
            addNightStars(context.kitEffectState, combatant, 1, SKILL_NIGHT_STAR_ICD);
        },
        secondsRemaining: Number.POSITIVE_INFINITY,
        tickIntervalSeconds: tickSeconds,
      },
    );
  };

  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        const starlightSlugStrike = createStarlightSlugStrike(combatant.constellationCount);
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
    // Dawn Star's flat damage on each deployed member's strikes, priced off her Max HP as the member whose kit this is
    getPartyStrikeBonus: (member, strike, _enemy, _party, effects) => ({
      additiveBaseDamageBonus: getDawnStarBonus(member, strike, effects),
    }),
    // Dawn Star's flat damage on her own strikes
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, _party, effects) =>
      getDawnStarBonus(strike.combatant, strike, effects),
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
      } else if (
        event.kind === KitEventKind.EnemyHit &&
        checkIsNormalOrChargedAttack(event.attackTag) &&
        checkIsKitStatusActive(kitEffectState.effects, event.striker.characterId, LAYLA_DAWN_STAR_ID)
      ) {
        // Once a holder's Normal or Charged Attack lands, its Dawn Star ends 0.05 seconds on, as gcsim queues it
        const { characterId } = event.striker;
        scheduleKitTask(kitEffectState, LAYLA_CHARACTER_ID, CONSTELLATION_4_REMOVAL_SECONDS, (tick) =>
          removeKitEffects(
            tick.kitEffectState,
            (effect) =>
              effect.kind === "status" && effect.characterId === characterId && effect.id === LAYLA_DAWN_STAR_ID,
          ),
        );
      }
    },
    skill: {
      onStart: (context) => {
        const { activeCombatant: combatant, characterIdCombatantMap, kitEffectState, party } = context;
        const curtainBonus =
          combatant.constellationCount >= CONSTELLATION_1 ? 1 + CONSTELLATION_1_SHIELD_ABSORPTION_BONUS : 1;
        const maxHealth = getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
        castKitShield(context, combatant.characterId, {
          element: Element.Cryo,
          health: (shieldFlatHealth + shieldMaxHealthShare * maxHealth) * curtainBonus,
          secondsRemaining: shieldSeconds,
        });
        startNightStarTick(kitEffectState, combatant);
      },
    },
  };
};
