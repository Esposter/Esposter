import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { OCEAN_HUED_CLAM_ARTIFACT_SET_ID, OCEAN_HUED_CLAM_FOAM_ID } from "#src/services/artifact/constants";
import { createOceanHuedClamSetModule } from "#src/services/artifact/sets/createOceanHuedClamSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
// Sturdy, so no hit is clamped to the health the camp member starts with, and standing at the wearer's feet unless placed
const createSturdyEnemy = (id = "enemy", position = { x: 0, z: 0 }) => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  health: 1e9,
  id,
  maxHealth: 1e9,
  position,
});
const createWearer = (maxHealth = 10_000, characterId = TRAVELER_CHARACTER_ID): Combatant => {
  const attributes = computeCharacterAttributes([]);
  attributes.maxHealth = maxHealth;
  return {
    ascension: 0,
    attributes,
    characterId,
    constellationCount: 0,
    elementalResonances: [],
    kit: getPassiveKit(KIT, [
      createOceanHuedClamSetModule(getArtifactSetBonus(statTables, OCEAN_HUED_CLAM_ARTIFACT_SET_ID, 4)),
    ]),
    level: 1,
  };
};
// A heal of the given share of the healed member's Max HP, by the given source
const createHeal = (healthShare: number, sourceCharacterId: number): KitEvent => ({
  bondOfLifeShare: 0,
  characterId: TRAVELER_CHARACTER_ID,
  healthShare,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
  sourceCharacterId,
});
const countFoams = (kitEffectState: KitEffectState) =>
  kitEffectState.effects.filter((effect) => effect.kind === "field" && effect.id === OCEAN_HUED_CLAM_FOAM_ID).length;

describe(createOceanHuedClamSetModule, () => {
  test("a heal its wearer gives builds a foam that, three seconds on, deals 90% of the HP healed to each standing enemy as Physical DMG", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const enemy = createSturdyEnemy();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      enemyMap: new Map([[enemy.id, enemy]]),
      enemyTables,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID]),
    });
    const healthBefore = enemy.health;
    const healedHp = 0.2 * wearer.attributes.maxHealth;

    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    expect(countFoams(kitEffectState)).toBe(1);
    stepKitSeconds(context, 2.9);
    expect(enemy.health).toBe(healthBefore);

    stepKitSeconds(context, 0.2);
    const physicalMultiplier = getResistanceMultiplier(getEnemyResistance(kind, enemy, undefined));
    expect(healthBefore - enemy.health).toBeCloseTo(0.9 * healedHp * physicalMultiplier);
  });

  test("a foam holds up to 30,000 HP of its wearer's healing, and a heal another character gives adds nothing", () => {
    expect.hasAssertions();

    const damageFor = (heals: { healthShare: number; sourceCharacterId: number }[]) => {
      const wearer = createWearer(100_000);
      const enemy = createSturdyEnemy();
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(wearer, {
        enemyMap: new Map([[enemy.id, enemy]]),
        enemyTables,
        kitEffectState,
        party: createParty([TRAVELER_CHARACTER_ID]),
      });
      const healthBefore = enemy.health;
      for (const { healthShare, sourceCharacterId } of heals)
        emitKitEvent(createHeal(healthShare, sourceCharacterId), context);
      stepKitSeconds(context, 3);
      return healthBefore - enemy.health;
    };
    const capped = damageFor([{ healthShare: 1, sourceCharacterId: TRAVELER_CHARACTER_ID }]);

    expect(capped).toBeCloseTo(
      0.9 * 30_000 * getResistanceMultiplier(getEnemyResistance(kind, createSturdyEnemy(), undefined)),
    );
    expect(
      damageFor([
        { healthShare: 0.1, sourceCharacterId: TRAVELER_CHARACTER_ID },
        { healthShare: 0.5, sourceCharacterId: OTHER_CHARACTER_ID },
      ]),
    ).toBeCloseTo(damageFor([{ healthShare: 0.1, sourceCharacterId: TRAVELER_CHARACTER_ID }]));
  });

  test("a foam's burst reaches the enemies within six metres of its wearer, and spares one beyond that", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const near = createSturdyEnemy("near", { x: 3, z: 0 });
    const far = createSturdyEnemy("far", { x: 30, z: 0 });
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      enemyMap: new Map([
        [near.id, near],
        [far.id, far],
      ]),
      enemyTables,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID]),
    });

    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    stepKitSeconds(context, 3);
    const physicalMultiplier = getResistanceMultiplier(getEnemyResistance(kind, near, undefined));
    expect(1e9 - near.health).toBeCloseTo(0.9 * 0.2 * wearer.attributes.maxHealth * physicalMultiplier);
    expect(far.health).toBe(1e9);
  });

  test("a heal given inside the 3.5-second cooldown after a foam's start is kept for the next foam, which bursts on it", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const enemy = createSturdyEnemy();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      enemyMap: new Map([[enemy.id, enemy]]),
      enemyTables,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID]),
    });
    const physicalMultiplier = getResistanceMultiplier(getEnemyResistance(kind, enemy, undefined));
    const healedHp = 0.2 * wearer.attributes.maxHealth;

    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    expect(countFoams(kitEffectState)).toBe(1);

    // The foam has burst at three seconds, and the cooldown still runs for another half second
    stepKitSeconds(context, 3.2);
    expect(countFoams(kitEffectState)).toBe(0);
    const healthAfterFirstBurst = enemy.health;
    expect(1e9 - healthAfterFirstBurst).toBeCloseTo(0.9 * healedHp * physicalMultiplier);
    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    expect(countFoams(kitEffectState)).toBe(0);

    stepKitSeconds(context, 0.5);
    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    expect(countFoams(kitEffectState)).toBe(1);
    stepKitSeconds(context, 3);
    expect(healthAfterFirstBurst - enemy.health).toBeCloseTo(0.9 * 2 * healedHp * physicalMultiplier);
  });

  test("while a foam stands, another wearer's heal builds no foam and adds nothing to it", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const otherWearer = createWearer(10_000, OTHER_CHARACTER_ID);
    const enemy = createSturdyEnemy();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, wearer],
        [OTHER_CHARACTER_ID, otherWearer],
      ]),
      enemyMap: new Map([[enemy.id, enemy]]),
      enemyTables,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
    const physicalMultiplier = getResistanceMultiplier(getEnemyResistance(kind, enemy, undefined));

    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    emitKitEvent(createHeal(0.5, OTHER_CHARACTER_ID), context);
    expect(countFoams(kitEffectState)).toBe(1);

    stepKitSeconds(context, 3);
    expect(1e9 - enemy.health).toBeCloseTo(0.9 * 0.2 * wearer.attributes.maxHealth * physicalMultiplier);
  });
  test("a foam bursts about the active character where it pops, not where the foam was cast, as gcsim draws the burst about the player", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const atCast = createSturdyEnemy("atCast", { x: 3, z: 0 });
    const atPop = createSturdyEnemy("atPop", { x: 22, z: 0 });
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      enemyMap: new Map([
        [atCast.id, atCast],
        [atPop.id, atPop],
      ]),
      enemyTables,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID]),
    });

    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    context.body.position = { x: 20, z: 0 };
    stepKitSeconds(context, 3);
    expect(atCast.health).toBe(1e9);
    expect(atPop.health).toBeLessThan(1e9);
  });
});
