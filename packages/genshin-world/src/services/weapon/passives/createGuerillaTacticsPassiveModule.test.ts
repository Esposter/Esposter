import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createGuerillaTacticsPassiveModule } from "#src/services/weapon/passives/createGuerillaTacticsPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Guerilla Tactics at its first rank: its percentage and its seconds
const guerillaTacticsPassiveModule = createGuerillaTacticsPassiveModule([0.12, 15]);
const getBuff = (kitEffectState: KitEffectState, attribute: Attribute): KitBuff | undefined =>
  kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === attribute);

describe(createGuerillaTacticsPassiveModule, () => {
  test("defeating an opponent raises the wielder's ATK and Movement SPD by the rank's percentage for its seconds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    guerillaTacticsPassiveModule.onKitEvent?.(
      { enemy, kind: KitEventKind.EnemyDefeated, striker: wielder },
      context,
      wielder,
    );

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.12);
    expect(getBuff(kitEffectState, Attribute.MovementSpeed)?.amount).toBeCloseTo(0.12);
  });

  test("a defeat with no striker raises nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    guerillaTacticsPassiveModule.onKitEvent?.(
      { enemy, kind: KitEventKind.EnemyDefeated, striker: undefined },
      context,
      wielder,
    );

    expect(getBuff(kitEffectState, Attribute.AttackPercent)).toBeUndefined();
  });
});
