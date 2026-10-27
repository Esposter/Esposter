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
import { createNocturnalDreamsPassiveModule } from "#src/services/weapon/passives/createNocturnalDreamsPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createNocturnalDreamsPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Nocturnal Dreams with synthetic params: 90 for ten seconds after a charged attack, 60 for ten seconds after a skill
  const nocturnalDreamsPassiveModule = createNocturnalDreamsPassiveModule([90, 10, 60, 10]);
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a charged attack hit raises the wielder's Elemental Mastery by the rank's first amount", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    nocturnalDreamsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.ElementalMastery)).toStrictEqual({
      amount: 90,
      attribute: Attribute.ElementalMastery,
      characterId: wielder.characterId,
      kind: "buff",
      secondsRemaining: 10,
      source: "nocturnalDreamsChargedAttack",
    });
  });

  test("an elemental skill hit raises the wielder's Elemental Mastery by the rank's second amount", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    nocturnalDreamsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(getBuff(kitEffectState, Attribute.ElementalMastery)).toStrictEqual({
      amount: 60,
      attribute: Attribute.ElementalMastery,
      characterId: wielder.characterId,
      kind: "buff",
      secondsRemaining: 10,
      source: "nocturnalDreamsSkill",
    });
  });

  test("a normal attack hit raises no Elemental Mastery", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    nocturnalDreamsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.ElementalMastery)).toBeUndefined();
  });
});
