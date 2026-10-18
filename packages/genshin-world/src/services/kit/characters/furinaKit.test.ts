import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createFurinaKitBehaviour, FURINA_CHARACTER_ID } from "#src/services/kit/characters/furinaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const FURINA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, FURINA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createEnemyAt = (x: number): Enemy => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  position: { x, z: 0 },
});

const getFieldIds = ({ effects }: KitEffectState): (string | undefined)[] =>
  effects.flatMap((effect) => (effect.kind === "field" ? [effect.id] : []));

// Runs the team's effects a frame at a time
const stepFrames = (frames: number, context: KitContext): void => {
  for (let frame = 0; frame < frames; frame++) stepKitEffects(1 / 60, context);
};

describe(createFurinaKitBehaviour, () => {
  const createFurinaCombatant = (combatant: Partial<Combatant> = {}): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: FURINA_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: FURINA_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
    ...combatant,
  });

  const MAX_HEALTH = 20_000;
  const TEAMMATE_CHARACTER_ID = 1;
  const LOW_TEAMMATE_CHARACTER_ID = 2;

  test("the charged attack turns her to Pneuma a frame after its hit, handing Salon Solitaire's members to the Singer", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createFurinaCombatant());
    const { kitEffectState } = context;
    FURINA_KIT.elementalSkill.onStart?.(context);
    stepFrames(60, context);
    FURINA_KIT.chargedAttack.onStart?.(context);
    stepFrames(30, context);
    const beforeSwitch = getFieldIds(kitEffectState).filter(Boolean);
    stepFrames(10, context);

    expect(beforeSwitch).toStrictEqual(["furina-salon-member", "furina-salon-member", "furina-salon-member"]);
    expect(getFieldIds(kitEffectState).filter(Boolean)).toStrictEqual(["furina-singer"]);
  });

  test("a Salon member's attack drains each member above half HP and strikes a tenth harder for each one drained", () => {
    expect.hasAssertions();
    const furina = createFurinaCombatant();
    const teammate = createFurinaCombatant({ characterId: TEAMMATE_CHARACTER_ID });
    const lowTeammate = createFurinaCombatant({ characterId: LOW_TEAMMATE_CHARACTER_ID });
    const party = createParty([FURINA_CHARACTER_ID, TEAMMATE_CHARACTER_ID, LOW_TEAMMATE_CHARACTER_ID]);
    getPartyMember(party, LOW_TEAMMATE_CHARACTER_ID).healthShare = 0.4;
    const context = createKitTestContext(furina, {
      characterIdCombatantMap: new Map([
        [FURINA_CHARACTER_ID, furina],
        [LOW_TEAMMATE_CHARACTER_ID, lowTeammate],
        [TEAMMATE_CHARACTER_ID, teammate],
      ]),
      enemyMap: new Map([["", createEnemyAt(3)]]),
      party,
    });
    const { kitEffectState } = context;
    FURINA_KIT.elementalSkill.onStart?.(context);
    // Mademoiselle Crabaletta attacks first, 18 frames for the bubble and 71.6 for its first tick
    stepFrames(90, context);
    const attack = kitEffectState.effects.find(
      (effect) => effect.kind === "summon" && effect.id === "furina-salon-attack",
    );

    expect(party.healthChanges.map(({ characterId }) => characterId)).toStrictEqual([
      FURINA_CHARACTER_ID,
      TEAMMATE_CHARACTER_ID,
    ]);
    expect(party.healthChanges.every(({ healthShare }) => Math.abs(healthShare + 0.036) < 1e-9)).toBe(true);
    expect(attack?.kind === "summon" ? attack.hits[0]?.additiveBaseDamageBonus?.(furina) : undefined).toBeCloseTo(
      0.08288 * 1.2 * MAX_HEALTH,
    );
  });

  test("the Salon drains no one and strikes nothing with no enemy in reach", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createFurinaCombatant(), { enemyMap: new Map([["", createEnemyAt(100)]]) });
    FURINA_KIT.elementalSkill.onStart?.(context);
    stepFrames(300, context);

    expect(context.party.healthChanges).toStrictEqual([]);
  });

  test("the burst's Fanfare gains a point for each 1% of HP changed and gives every member its DMG Bonus, a change within the debounce landing as it closes", () => {
    expect.hasAssertions();
    const furina = createFurinaCombatant();
    const teammate = createFurinaCombatant({ characterId: TEAMMATE_CHARACTER_ID });
    const context = createKitTestContext(furina, {
      characterIdCombatantMap: new Map([
        [FURINA_CHARACTER_ID, furina],
        [TEAMMATE_CHARACTER_ID, teammate],
      ]),
      party: createParty([FURINA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });
    const { kitEffectState } = context;
    const drain: KitHealthChangedEvent = {
      characterId: TEAMMATE_CHARACTER_ID,
      healthShare: -0.1,
      kind: KitEventKind.HealthChanged,
      overflowHealthShare: 0,
    };
    const readFanfare = (): number | undefined =>
      findKitStatus(kitEffectState.effects, FURINA_CHARACTER_ID, "furina-fanfare")?.stacks;
    FURINA_KIT.elementalBurst.onStart?.(context);
    stepFrames(100, context);
    FURINA_KIT.onKitEvent?.(drain, context, furina);
    stepFrames(10, context);
    const afterFirst = readFanfare();
    FURINA_KIT.onKitEvent?.(drain, context, furina);
    stepFrames(20, context);
    const withinDebounce = readFanfare();
    stepFrames(10, context);
    const teammateHydroBonus = kitEffectState.effects.find(
      (effect) =>
        effect.kind === "buff" &&
        effect.characterId === TEAMMATE_CHARACTER_ID &&
        effect.attribute === Attribute.HydroDamageBonus,
    );

    expect([afterFirst, withinDebounce, readFanfare()]).toStrictEqual([10, 10, 20]);
    expect(teammateHydroBonus?.kind === "buff" ? teammateHydroBonus.amount : undefined).toBeCloseTo(20 * 0.0007);
  });

  // Endless Waltz heals every member 2% of Max HP every two seconds while another's heal past full HP on the character on the field is under four seconds old
  test("the Ascension 1 passive, Endless Waltz, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const furina = createFurinaCombatant({ ascension: 1 });
    const teammate = createFurinaCombatant({ characterId: TEAMMATE_CHARACTER_ID });
    const party = createParty([FURINA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]);
    getPartyMember(party, TEAMMATE_CHARACTER_ID).healthShare = 0.5;
    const context = createKitTestContext(furina, {
      characterIdCombatantMap: new Map([
        [FURINA_CHARACTER_ID, furina],
        [TEAMMATE_CHARACTER_ID, teammate],
      ]),
      party,
    });
    const overheal: KitHealthChangedEvent = {
      characterId: FURINA_CHARACTER_ID,
      healthShare: 0,
      kind: KitEventKind.HealthChanged,
      overflowHealthShare: 0.1,
      sourceCharacterId: TEAMMATE_CHARACTER_ID,
    };
    FURINA_KIT.onKitEvent?.(overheal, context, furina);
    stepFrames(60, context);
    // A second overheal a second in keeps the regeneration's ticks at two and four seconds, and none at six
    FURINA_KIT.onKitEvent?.(overheal, context, furina);
    stepFrames(360, context);

    expect(getPartyMember(party, TEAMMATE_CHARACTER_ID).healthShare).toBeCloseTo(0.54);
  });

  test("the Ascension 1 passive, Endless Waltz, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const furina = createFurinaCombatant({ ascension: 0 });
    const teammate = createFurinaCombatant({ characterId: TEAMMATE_CHARACTER_ID });
    const party = createParty([FURINA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]);
    getPartyMember(party, TEAMMATE_CHARACTER_ID).healthShare = 0.5;
    const context = createKitTestContext(furina, {
      characterIdCombatantMap: new Map([
        [FURINA_CHARACTER_ID, furina],
        [TEAMMATE_CHARACTER_ID, teammate],
      ]),
      party,
    });
    FURINA_KIT.onKitEvent?.(
      {
        characterId: FURINA_CHARACTER_ID,
        healthShare: 0,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0.1,
        sourceCharacterId: TEAMMATE_CHARACTER_ID,
      },
      context,
      furina,
    );
    stepFrames(360, context);

    expect(getPartyMember(party, TEAMMATE_CHARACTER_ID).healthShare).toBe(0.5);
  });

  test("a strike that lands opens the Arkhe's hit as a normal attack, once within each Arkhe's cooldown", () => {
    expect.hasAssertions();
    const combatant = createFurinaCombatant();
    const context = createKitTestContext(combatant);
    const { kitEffectState } = context;
    const hit = takeOne(takeOne(FURINA_KIT.normalAttacks).hits);
    const strike = (): void => hit.onStrike?.(context, { body: context.body, combatant, hit });
    const countArkheHits = (): number =>
      kitEffectState.effects.filter((effect) => effect.kind === "summon" && effect.attackTag === AttackTag.NormalAttack)
        .length;
    strike();
    strike();
    const inOusia = countArkheHits();
    FURINA_KIT.chargedAttack.onStart?.(context);
    stepFrames(40, context);
    strike();

    expect([inOusia, countArkheHits()]).toStrictEqual([1, 1]);
    expect(findKitStatus(kitEffectState.effects, FURINA_CHARACTER_ID, "furina-surging-blade-cooldown")).toBeDefined();
  });

  // The first attack of the Salon, 90 frames after the skill, at the ascension stood, with a teammate and an enemy in reach
  const getSalonAttackDamageBonus = (ascension: number): number => {
    const furina = createFurinaCombatant({ ascension });
    const context = createKitTestContext(furina, {
      characterIdCombatantMap: new Map([
        [FURINA_CHARACTER_ID, furina],
        [TEAMMATE_CHARACTER_ID, createFurinaCombatant({ characterId: TEAMMATE_CHARACTER_ID })],
      ]),
      enemyMap: new Map([["", createEnemyAt(3)]]),
      party: createParty([FURINA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });
    FURINA_KIT.elementalSkill.onStart?.(context);
    stepFrames(90, context);
    const attack = context.kitEffectState.effects.find(
      (effect) => effect.kind === "summon" && effect.id === "furina-salon-attack",
    );
    if (attack?.kind !== "summon") throw new Error("the Salon's attack is not cast");
    return attack.hits[0]?.damageBonus ?? 0;
  };

  // The Singer's tick interval, read off its field once the charged attack turns her to Pneuma
  const getSingerInterval = (ascension: number): number => {
    const context = createKitTestContext(createFurinaCombatant({ ascension }));
    FURINA_KIT.elementalSkill.onStart?.(context);
    stepFrames(60, context);
    FURINA_KIT.chargedAttack.onStart?.(context);
    stepFrames(40, context);
    const singer = context.kitEffectState.effects.find(
      (effect) => effect.kind === "field" && effect.id === "furina-singer",
    );
    if (singer?.kind !== "field") throw new Error("the Singer's field is not set going");
    return singer.tickIntervalSeconds;
  };

  test("the Ascension 4 passive, Unheard Confession, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(getSalonAttackDamageBonus(4)).toBeCloseTo(0.14, 5);
    expect(getSingerInterval(4)).toBeLessThan(getSingerInterval(3));
  });

  test("the Ascension 4 passive, Unheard Confession, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getSalonAttackDamageBonus(3)).toBe(0);
    expect(getSingerInterval(3)).toBe(getSingerInterval(0));
  });
});
