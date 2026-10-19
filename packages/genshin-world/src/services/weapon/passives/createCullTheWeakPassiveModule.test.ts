import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createCullTheWeakPassiveModule } from "#src/services/weapon/passives/createCullTheWeakPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createCullTheWeakPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.Health, value: 1000 }]);
  // Cull the Weak with synthetic params: 20% of Max HP for each defeat
  const cullTheWeakPassiveModule = createCullTheWeakPassiveModule([0.2]);

  test("defeating an opponent restores the wielder its share of Max HP", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    cullTheWeakPassiveModule.onKitEvent?.(
      { enemy, kind: KitEventKind.EnemyDefeated, striker: wielder },
      context,
      wielder,
    );

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("a defeat with no striker restores the wielder nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    cullTheWeakPassiveModule.onKitEvent?.(
      { enemy, kind: KitEventKind.EnemyDefeated, striker: undefined },
      context,
      wielder,
    );

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(0.5);
  });
});
