import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createElementalMasteryPassiveModule } from "#src/services/weapon/passives/createElementalMasteryPassiveModule";
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
// Elemental Mastery at its first rank: the elemental DMG percentage per stack and its seconds
const elementalMasteryPassiveModule = createElementalMasteryPassiveModule([0.06, 6]);
const createNormalAttackHit = () => ({
  attackTag: AttackTag.NormalAttack,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});
const getBuff = (kitEffectState: KitEffectState, attribute: Attribute): KitBuff | undefined =>
  kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === attribute);

describe(createElementalMasteryPassiveModule, () => {
  test("a normal attack hit raises every elemental DMG bonus by the rank's percentage at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    elementalMasteryPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.PyroDamageBonus)?.amount).toBeCloseTo(0.06);
    expect(getBuff(kitEffectState, Attribute.HydroDamageBonus)?.amount).toBeCloseTo(0.06);
  });

  test("a third normal attack hit holds the stacks at two", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    elementalMasteryPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);
    elementalMasteryPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);
    elementalMasteryPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.PyroDamageBonus)?.amount).toBeCloseTo(0.12);
  });
});
