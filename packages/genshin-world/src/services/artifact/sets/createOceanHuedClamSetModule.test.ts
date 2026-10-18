import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { OCEAN_HUED_CLAM_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createOceanHuedClamSetModule } from "#src/services/artifact/sets/createOceanHuedClamSetModule";
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
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const FOAM_ID = "oceanHuedClamFoam";
const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(OCEAN_HUED_CLAM_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
// Sturdy, so no hit is clamped to the health the camp member starts with
const createSturdyEnemy = () => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  health: 1e9,
  maxHealth: 1e9,
});
const createWearer = (maxHealth = 10_000): Combatant => {
  const attributes = computeCharacterAttributes([]);
  attributes.maxHealth = maxHealth;
  return {
    ascension: 0,
    attributes,
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: getPassiveKit(KIT, [createOceanHuedClamSetModule(bonusOf(4))]),
    level: 1,
  };
};
// A heal of the given share of the healed member's Max HP, by the given source
const createHeal = (healthShare: number, sourceCharacterId: number) => ({
  bondOfLifeShare: 0,
  characterId: TRAVELER_CHARACTER_ID,
  healthShare,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
  sourceCharacterId,
});
const countFoams = (kitEffectState: KitEffectState) =>
  kitEffectState.effects.filter((effect) => effect.kind === "field" && effect.id === FOAM_ID).length;

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
    const physicalMultiplier = getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Physical));
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
      0.9 * 30_000 * getResistanceMultiplier(getEnemyResistance(kind, createSturdyEnemy(), Element.Physical)),
    );
    expect(
      damageFor([
        { healthShare: 0.1, sourceCharacterId: TRAVELER_CHARACTER_ID },
        { healthShare: 0.5, sourceCharacterId: OTHER_CHARACTER_ID },
      ]),
    ).toBeCloseTo(damageFor([{ healthShare: 0.1, sourceCharacterId: TRAVELER_CHARACTER_ID }]));
  });

  test("a heal given inside the 3.5-second cooldown after a foam's start builds none, and one given after it does", () => {
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

    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    expect(countFoams(kitEffectState)).toBe(1);

    // The foam has burst at three seconds, and the cooldown still runs for another half second
    stepKitSeconds(context, 3.2);
    expect(countFoams(kitEffectState)).toBe(0);
    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    expect(countFoams(kitEffectState)).toBe(0);

    stepKitSeconds(context, 0.5);
    emitKitEvent(createHeal(0.2, TRAVELER_CHARACTER_ID), context);
    expect(countFoams(kitEffectState)).toBe(1);
  });
});
