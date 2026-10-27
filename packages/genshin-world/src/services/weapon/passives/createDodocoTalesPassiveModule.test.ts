import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDodocoTalesPassiveModule } from "#src/services/weapon/passives/createDodocoTalesPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createDodocoTalesPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Dodoco Tales with synthetic params: 32% charged attack DMG for six seconds after a normal attack, 16% ATK for six after a charged attack
  const dodocoTalesPassiveModule = createDodocoTalesPassiveModule([0.32, 6, 0.16, 6]);
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a normal attack hit raises the wielder's charged attack DMG by the rank's amount", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    dodocoTalesPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.ChargedAttackDamageBonus)).toStrictEqual({
      amount: 0.32,
      attribute: Attribute.ChargedAttackDamageBonus,
      characterId: wielder.characterId,
      kind: "buff",
      secondsRemaining: 6,
      source: "dodocoTalesNormalAttack",
    });
    expect(getBuff(kitEffectState, Attribute.AttackPercent)).toBeUndefined();
  });

  test("a charged attack hit raises the wielder's ATK by the rank's second amount", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    dodocoTalesPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)).toStrictEqual({
      amount: 0.16,
      attribute: Attribute.AttackPercent,
      characterId: wielder.characterId,
      kind: "buff",
      secondsRemaining: 6,
      source: "dodocoTalesChargedAttack",
    });
    expect(getBuff(kitEffectState, Attribute.ChargedAttackDamageBonus)).toBeUndefined();
  });
});
