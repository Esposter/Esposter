import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { dealKitEnemyDamage } from "#src/services/kit/dealKitEnemyDamage";
import { IANSAN_CHARACTER_ID } from "#src/services/kit/characters/iansanKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { NATLAN_REGION_ID } from "#src/services/natlan/constants";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const IANSAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, IANSAN_CHARACTER_ID);

// A Natlan member alone in the party, whose kit records the Nightsoul bursts the team's kits hear
const createNatlanTeam = () => {
  const bursts: KitEvent[] = [];
  const striker: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: IANSAN_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: {
      ...IANSAN_KIT,
      onKitEvent: (event: KitEvent) => {
        if (event.kind === KitEventKind.NightsoulBurst) bursts.push(event);
      },
    },
    level: 90,
    regionId: NATLAN_REGION_ID,
  };
  const context = createKitTestContext(striker, {
    characterIdCombatantMap: new Map([[striker.characterId, striker]]),
    enemyTables,
    party: createParty([striker.characterId]),
  });
  return { bursts, context, striker };
};

describe(dealKitEnemyDamage, () => {
  const STURDY_HEALTH = 1e9;

  const createSturdyEnemy = (): Enemy => ({
    ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x: 0, z: 0 } }, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
  });

  test("elemental damage a party member deals sets off the team's Nightsoul burst while a Natlan member is in the party, and the kits hear it", () => {
    expect.hasAssertions();
    const { bursts, context, striker } = createNatlanTeam();
    const enemy = createSturdyEnemy();
    dealKitEnemyDamage(enemy, { damage: 100, poiseDamage: 0 }, true, striker, context);
    expect(bursts).toStrictEqual([{ enemy, kind: KitEventKind.NightsoulBurst, striker }]);
  });

  test("damage that is not elemental, a physical hit's, sets off no Nightsoul burst", () => {
    expect.hasAssertions();
    const { bursts, context, striker } = createNatlanTeam();
    dealKitEnemyDamage(createSturdyEnemy(), { damage: 100, poiseDamage: 0 }, false, striker, context);
    expect(bursts).toHaveLength(0);
  });

  test("elemental damage that deals no health sets off no Nightsoul burst", () => {
    expect.hasAssertions();
    const { bursts, context, striker } = createNatlanTeam();
    dealKitEnemyDamage(createSturdyEnemy(), { damage: 0, poiseDamage: 0 }, true, striker, context);
    expect(bursts).toHaveLength(0);
  });

  test("elemental damage a shield takes whole sets off the team's Nightsoul burst", () => {
    expect.hasAssertions();
    const { bursts, context, striker } = createNatlanTeam();
    const enemy = { ...createSturdyEnemy(), shield: { health: 2, maxHealth: 2 } };
    dealKitEnemyDamage(enemy, { damage: 1, poiseDamage: 0 }, true, striker, context);
    expect(bursts).toHaveLength(1);
  });

  test("elemental damage on an enemy already Dead sets off no Nightsoul burst", () => {
    expect.hasAssertions();
    const { bursts, context, striker } = createNatlanTeam();
    const enemy = { ...createSturdyEnemy(), health: 0, state: EnemyState.Dead };
    dealKitEnemyDamage(enemy, { damage: 100, poiseDamage: 0 }, true, striker, context);
    expect(bursts).toHaveLength(0);
  });

  test("damage no party member dealt sets off no Nightsoul burst", () => {
    expect.hasAssertions();
    const { bursts, context } = createNatlanTeam();
    dealKitEnemyDamage(createSturdyEnemy(), { damage: 100, poiseDamage: 0 }, true, undefined, context);
    expect(bursts).toHaveLength(0);
  });
});
