import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { Party } from "#src/models/party/Party";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import {
  createLaylaKitBehaviour,
  LAYLA_CHARACTER_ID,
  LAYLA_DAWN_STAR_ID,
  LAYLA_NIGHT_STARS_ID,
  LAYLA_SHOOTING_STARS_ID,
} from "#src/services/kit/characters/laylaKit";
import { YELAN_CHARACTER_ID } from "#src/services/kit/characters/yelanKit";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import {
  createKitTestContext,
  stepKitSeconds,
  stepKitSecondsSendingExpiries,
} from "#src/services/kit/createKitTestContext.test";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const LAYLA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LAYLA_CHARACTER_ID);
const ENEMY_TABLES = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createEnemyAt = (x: number, z: number): Enemy => ({
  ...createEnemy(ENEMY_TABLES, [], ENEMY_CAMP_MEMBER, ""),
  position: { x, z },
});

const countNightStars = (kitEffectState: KitEffectState) =>
  countKitResource(kitEffectState.effects, LAYLA_CHARACTER_ID, LAYLA_NIGHT_STARS_ID);

// The Dawn Star statuses the team holds, one on each deployed member
const findDawnStars = (kitEffectState: KitEffectState): KitStatus[] =>
  kitEffectState.effects.filter(
    (effect): effect is KitStatus => effect.kind === "status" && effect.id === LAYLA_DAWN_STAR_ID,
  );

const sendSkillUsed = (context: KitContext) =>
  LAYLA_KIT.onKitEvent?.(
    { characterId: LAYLA_CHARACTER_ID, kind: KitEventKind.SkillUsed },
    context,
    context.activeCombatant,
  );

// Steps the team's effects frame by frame, recording the frame each Shooting Star is cast on, from `fromFrame` on
const stepRecordingCasts = (context: KitContext, frames: number, fromFrame = 0) => {
  const casts: { frame: number; hit: KitHit; summon: KitSummon }[] = [];
  const seenHits = new WeakSet<KitHit[]>();
  for (let frame = 1; frame <= frames; frame++) {
    stepKitEffects(FIXED_STEP_SECONDS, context);
    for (const effect of context.kitEffectState.effects)
      if (effect.kind === "summon" && !seenHits.has(effect.hits)) {
        seenHits.add(effect.hits);
        casts.push({ frame: fromFrame + frame, hit: takeOne(effect.hits, 0), summon: effect });
      }
  }
  return casts;
};

describe(createLaylaKitBehaviour, () => {
  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitTestContext(createLaylaCombatant(), { kitEffectState }));
    return kitEffectState;
  };

  const createLaylaCombatant = (overrides: Partial<Combatant> = {}): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: LAYLA_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: LAYLA_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
    ...overrides,
  });

  const MAX_HEALTH = 10_000;

  // Layla on the team with the given enemies in the world, the enemies standing at the given places, on the team given
  const createLaylaContext = (
    kitEffectState: KitEffectState = { effects: [] },
    overrides: Partial<Combatant> = {},
    enemies: Enemy[] = [],
    party: Party = createParty([LAYLA_CHARACTER_ID]),
  ): KitContext =>
    createKitTestContext(createLaylaCombatant(overrides), {
      enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
      enemyTables: ENEMY_TABLES,
      kitEffectState,
      party,
    });

  // Layla with her shield and two skill uses, so four Night Stars and the Shooting Stars, stepped to the first Shooting
  // Star's cast from the one enemy in reach
  const castFirstShootingStar = (overrides: Partial<Combatant> = {}, enemy = createEnemyAt(3, 0)) => {
    const context = createLaylaContext({ effects: [] }, overrides, [enemy]);
    LAYLA_KIT.elementalSkill.onStart?.(context);
    sendSkillUsed(context);
    stepKitSeconds(context, 0.31);
    sendSkillUsed(context);
    const [cast] = stepRecordingCasts(context, 40);
    if (!cast) throw new Error("the first Shooting Star was not cast");
    return { cast, context, enemy };
  };

  test("reads the strikes', charged attack's, plunges' and skill's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LAYLA_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      ...LAYLA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      LAYLA_KIT.plungeCollision.talentMultiplier,
      LAYLA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      LAYLA_KIT.highPlunge.hits[0]?.talentMultiplier,
      LAYLA_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.512173, 0.484834, 0.729736, 0.4773, 0.52546, 0.639324, 1.278377, 1.596762, 0.128,
    ]);
  });

  test("the charged attack costs 20 stamina, her burst costs 40 energy and cools for 12 seconds, and her skill cools for 12 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: LAYLA_KIT.burstCooldownSeconds,
      burstEnergyCost: LAYLA_KIT.burstEnergyCost,
      chargedAttackStamina: LAYLA_KIT.chargedAttackStamina,
      skillCooldownSeconds: LAYLA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 12,
      burstEnergyCost: 40,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 12,
    });
  });

  test("nights of Formal Focus sets a shield of its flat share and its Max HP share for 12 seconds", () => {
    expect.hasAssertions();
    const shield = castAction(LAYLA_KIT.elementalSkill).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );
    expect({ health: shield?.health, secondsRemaining: shield?.secondsRemaining }).toStrictEqual({
      health: 1040.007 + 0.108 * MAX_HEALTH,
      secondsRemaining: 12,
    });
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    LAYLA_KIT.elementalSkill.onStart?.(
      createKitTestContext({ ...createLaylaCombatant(), constellationCount: 1 }, { kitEffectState }),
    );
    const shield = kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
    const baseShield = castAction(LAYLA_KIT.elementalSkill).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );

    expect(shield?.health).toBeCloseTo((baseShield?.health ?? 0) * 1.2);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    LAYLA_KIT.elementalSkill.onStart?.(
      createKitTestContext({ ...createLaylaCombatant(), constellationCount: 0 }, { kitEffectState }),
    );
    const shield = kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
    const baseShield = castAction(LAYLA_KIT.elementalSkill).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );

    expect(shield?.health).toBe(baseShield?.health);
  });

  test("starlight Slug's field ticks first at 36 frames and every 90 frames after, for 12 seconds", () => {
    expect.hasAssertions();
    const field = castAction(LAYLA_KIT.elementalBurst).effects.find(
      (effect): effect is KitField => effect.kind === "field",
    );
    expect({
      nextTickFrames: Math.round((field?.nextTickSeconds ?? 0) * 60),
      radius: field?.radius,
      tickIntervalFrames: Math.round((field?.tickIntervalSeconds ?? 0) * 60),
    }).toStrictEqual({ nextTickFrames: 36, radius: 12, tickIntervalFrames: 90 });
  });

  test("the shield's tick adds a Night Star every 1.5 seconds while the shield lasts", () => {
    expect.hasAssertions();
    const context = createLaylaContext();
    LAYLA_KIT.elementalSkill.onStart?.(context);

    stepKitSeconds(context, 1.6);
    expect(countNightStars(context.kitEffectState)).toBe(1);
    stepKitSeconds(context, 1.5);
    expect(countNightStars(context.kitEffectState)).toBe(2);
  });

  test("the Night Stars clear when the shield runs out, and no tick adds one after", () => {
    expect.hasAssertions();
    // The enemy lets the four stars the tick builds fire, so the stars left after they do build again on the restarted tick
    const context = createLaylaContext({ effects: [] }, {}, [createEnemyAt(3, 0)]);
    LAYLA_KIT.elementalSkill.onStart?.(context);

    stepKitSecondsSendingExpiries(context, 11.5);
    expect(countNightStars(context.kitEffectState)).toBe(2);
    stepKitSecondsSendingExpiries(context, 1.5);
    expect(countNightStars(context.kitEffectState)).toBe(0);
    stepKitSecondsSendingExpiries(context, 3);
    expect(countNightStars(context.kitEffectState)).toBe(0);
  });

  test("the Night Stars outlast the shield while Shooting Stars wait for an enemy", () => {
    expect.hasAssertions();
    const context = createLaylaContext();
    LAYLA_KIT.elementalSkill.onStart?.(context);

    stepKitSeconds(context, 13);
    expect({
      isShooting: checkIsKitStatusActive(context.kitEffectState.effects, LAYLA_CHARACTER_ID, LAYLA_SHOOTING_STARS_ID),
      nightStars: countNightStars(context.kitEffectState),
    }).toStrictEqual({ isShooting: true, nightStars: 4 });
  });

  test("a skill used while the shield lasts adds two Night Stars, and none without a shield", () => {
    expect.hasAssertions();
    const unshielded = createLaylaContext();
    sendSkillUsed(unshielded);
    expect(countNightStars(unshielded.kitEffectState)).toBe(0);

    const shielded = createLaylaContext();
    LAYLA_KIT.elementalSkill.onStart?.(shielded);
    sendSkillUsed(shielded);
    expect(countNightStars(shielded.kitEffectState)).toBe(2);
  });

  test("starlight Slug's first enemy hit in each tick adds a Night Star while the shield lasts", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(0, 0);
    const context = createLaylaContext({ effects: [] }, {}, [enemy]);
    LAYLA_KIT.elementalSkill.onStart?.(context);
    LAYLA_KIT.elementalBurst.onStart?.(context);
    // The tick casts its strike at 36 frames, and the strike lands at 42, which the step does not reach
    stepKitSeconds(context, 0.62);

    const starlightSlug = context.kitEffectState.effects.find(
      (effect): effect is KitSummon => effect.kind === "summon",
    );
    assert.exists(starlightSlug);
    const [strike] = starlightSlug.hits;
    const strikeEnemy = () =>
      strike?.onStrike?.(context, { body: context.body, combatant: starlightSlug.combatant, hit: strike }, enemy);
    strikeEnemy();
    strikeEnemy();
    expect(countNightStars(context.kitEffectState)).toBe(1);
  });

  test("four Night Stars fire four Shooting Stars at gcsim's spacing, each travelling the frames its stars allow", () => {
    expect.hasAssertions();
    const context = createLaylaContext({ effects: [] }, {}, [createEnemyAt(3, 0)]);
    LAYLA_KIT.elementalSkill.onStart?.(context);
    sendSkillUsed(context);
    stepKitSeconds(context, 0.31);
    sendSkillUsed(context);

    const casts = stepRecordingCasts(context, 130);
    expect({
      frames: casts.map(({ frame }) => frame),
      travelFrames: casts.map(({ hit }) => Math.round(hit.hitmarkSeconds * 60)),
    }).toStrictEqual({ frames: [36, 63, 90, 117], travelFrames: [35, 33, 30, 28] });
    expect({
      isShooting: checkIsKitStatusActive(context.kitEffectState.effects, LAYLA_CHARACTER_ID, LAYLA_SHOOTING_STARS_ID),
      nightStars: countNightStars(context.kitEffectState),
    }).toStrictEqual({ isShooting: false, nightStars: 0 });
  });

  test("each Shooting Star flies at the nearest enemy within 10 metres", () => {
    expect.hasAssertions();
    const near = createEnemyAt(3, 0);
    const context = createLaylaContext({ effects: [] }, {}, [near, createEnemyAt(6, 0), createEnemyAt(12, 0)]);
    LAYLA_KIT.elementalSkill.onStart?.(context);
    sendSkillUsed(context);
    stepKitSeconds(context, 0.31);
    sendSkillUsed(context);

    const casts = stepRecordingCasts(context, 130);
    expect(casts.map(({ summon }) => summon.body.position)).toStrictEqual([
      { x: 3, z: 0 },
      { x: 3, z: 0 },
      { x: 3, z: 0 },
      { x: 3, z: 0 },
    ]);
  });

  test("no Shooting Star fires until an enemy is within 10 metres, and the first waits half a second for it", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(12, 0);
    const context = createLaylaContext({ effects: [] }, {}, [enemy]);
    LAYLA_KIT.elementalSkill.onStart?.(context);
    sendSkillUsed(context);
    stepKitSeconds(context, 0.31);
    sendSkillUsed(context);
    stepKitSeconds(context, 0.25);
    enemy.position = { x: 3, z: 0 };

    const [firstCast] = stepRecordingCasts(context, 60, 15);
    // The search finds the enemy at 0.3 seconds, and the first Shooting Star is cast 0.5 seconds on from there
    expect(firstCast?.frame).toBe(48);
  });

  test("a passive takes effect at its ascension phase: Ascension 4 adds 1.5% of her Max HP to each Shooting Star", () => {
    expect.hasAssertions();
    const { cast } = castFirstShootingStar({ ascension: 4 });
    expect(cast.hit.additiveBaseDamageBonus?.(cast.summon.combatant)).toBeCloseTo(0.015 * MAX_HEALTH);
  });

  test("does not take effect below its ascension phase: Ascension 3 adds nothing to a Shooting Star", () => {
    expect.hasAssertions();
    const { cast } = castFirstShootingStar({ ascension: 3 });
    expect(cast.hit.additiveBaseDamageBonus?.(cast.summon.combatant) ?? 0).toBe(0);
  });

  test("a passive takes effect at its constellation: Constellation 2 gives her 1 Energy on a Shooting Star's first hit", () => {
    expect.hasAssertions();
    const { cast, context, enemy } = castFirstShootingStar({ constellationCount: 2 });
    const { energy } = getPartyMember(context.party, LAYLA_CHARACTER_ID);
    const strike = () =>
      cast.hit.onStrike?.(context, { body: context.body, combatant: cast.summon.combatant, hit: cast.hit }, enemy);
    strike();
    strike();
    expect(getPartyMember(context.party, LAYLA_CHARACTER_ID).energy - energy).toBe(1);
  });

  test("does not take effect below its constellation: Constellation 1 gives no Energy on a Shooting Star's hit", () => {
    expect.hasAssertions();
    const { cast, context, enemy } = castFirstShootingStar({ constellationCount: 1 });
    const { energy } = getPartyMember(context.party, LAYLA_CHARACTER_ID);
    cast.hit.onStrike?.(context, { body: context.body, combatant: cast.summon.combatant, hit: cast.hit }, enemy);
    expect(getPartyMember(context.party, LAYLA_CHARACTER_ID).energy - energy).toBe(0);
  });

  test("starlight Slug's damage is priced from the Max HP of the striker it hits, with its buffs on", () => {
    expect.hasAssertions();
    const kitEffectState = castAction(LAYLA_KIT.elementalBurst);
    const field = kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    field?.onTick(createKitTestContext(createLaylaCombatant(), { kitEffectState }), 0);
    const slugStrike = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon")?.hits[0];
    const buffedStriker: Combatant = {
      ...createLaylaCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
        { attribute: Attribute.HealthPercent, value: 0.5 },
      ]),
    };
    const damageBonusOf = (striker: Combatant) => slugStrike?.additiveBaseDamageBonus?.(striker) ?? 0;

    expect(damageBonusOf(buffedStriker)).toBeCloseTo(1.5 * damageBonusOf(createLaylaCombatant()));
  });

  test("the first Shooting Star gives each deployed member Dawn Star for 3 seconds", () => {
    expect.hasAssertions();
    const context = createLaylaContext(
      { effects: [] },
      { constellationCount: 4 },
      [createEnemyAt(3, 0)],
      createParty([LAYLA_CHARACTER_ID, YELAN_CHARACTER_ID]),
    );
    LAYLA_KIT.elementalSkill.onStart?.(context);
    sendSkillUsed(context);
    stepKitSeconds(context, 0.31);
    sendSkillUsed(context);

    // The first Shooting Star is cast on the 36th frame, the frame it gives Dawn Star on, before any step runs it down
    const casts = stepRecordingCasts(context, 36);
    expect({
      castFrames: casts.map(({ frame }) => frame),
      dawnStars: findDawnStars(context.kitEffectState).map(({ characterId, secondsRemaining }) => ({
        characterId,
        secondsRemaining,
      })),
    }).toStrictEqual({
      castFrames: [36],
      dawnStars: [
        { characterId: LAYLA_CHARACTER_ID, secondsRemaining: 3 },
        { characterId: YELAN_CHARACTER_ID, secondsRemaining: 3 },
      ],
    });
  });

  test("dawn Star adds 5 percent of Layla's Max HP to a holder's Normal Attack until it lands, then ends 0.05 seconds later", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(3, 0);
    const context = createLaylaContext({ effects: [] }, { constellationCount: 4 }, [enemy]);
    const holder = context.activeCombatant;
    LAYLA_KIT.elementalSkill.onStart?.(context);
    sendSkillUsed(context);
    stepKitSeconds(context, 0.31);
    sendSkillUsed(context);
    stepRecordingCasts(context, 36);
    const bonusOf = (attackTag: AttackTag) =>
      LAYLA_KIT.getStrikeAdditiveBaseDamageBonus?.(
        createKitStrike(holder, attackTag),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ) ?? 0;

    expect(bonusOf(AttackTag.NormalAttack)).toBeCloseTo(0.05 * MAX_HEALTH);
    expect(bonusOf(AttackTag.ElementalSkill)).toBe(0);

    LAYLA_KIT.onKitEvent?.(
      { attackTag: AttackTag.NormalAttack, enemy, kind: KitEventKind.EnemyHit, striker: holder },
      context,
      holder,
    );
    // The removal is scheduled 0.05 seconds on from the hit, so it has not run at 0.04 seconds and has at 0.05
    stepKitSeconds(context, 0.04);
    expect(findDawnStars(context.kitEffectState)).toHaveLength(1);
    stepKitSeconds(context, 0.01);
    expect(findDawnStars(context.kitEffectState)).toStrictEqual([]);
  });
});
