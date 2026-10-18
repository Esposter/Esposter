import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createDaylightsAuguryPassiveModule } from "#src/services/weapon/passives/createDaylightsAuguryPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createDaylightsAuguryPassiveModule, () => {
  // Daylight's Augury at its first rank: 12% Elemental Skill and Burst DMG, a stack for each hit of a normal, charged,
  // Elemental Skill or Elemental Burst attack for twelve seconds, and 10%, 20%, 30% and 48% ATK for one to four stacks
  const daylightsAuguryPassiveModule = createDaylightsAuguryPassiveModule([0.12, 12, 0.1, 0.2, 0.3, 0.48]);
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
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });
  const createStrike = (attackTag: AttackTag) => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: TRAVELER_KIT.plungeCollision,
  });

  test("an Elemental Skill and an Elemental Burst the wielder deals are raised by the rank's percentage, and a normal attack is not", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);

    expect(
      daylightsAuguryPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, []),
    ).toBe(0.12);
    expect(
      daylightsAuguryPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ElementalBurst), enemy, party, []),
    ).toBe(0.12);
    expect(
      daylightsAuguryPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, []),
    ).toBe(0);
  });

  test("a hit of each kind gains a stack, four stacks raise ATK by the rank's fourth share, and a fifth stack is not gained", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (const attackTag of [
      AttackTag.NormalAttack,
      AttackTag.ChargedAttack,
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
    ])
      daylightsAuguryPassiveModule.onKitEvent?.(createDamageTaken(attackTag), context, wielder);

    expect(
      daylightsAuguryPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([{ amount: 0.48, attribute: Attribute.AttackPercent }]);

    daylightsAuguryPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(
      daylightsAuguryPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([{ amount: 0.48, attribute: Attribute.AttackPercent }]);
  });

  test("a stack lasts twelve seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    daylightsAuguryPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(
      daylightsAuguryPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([{ amount: 0.1, attribute: Attribute.AttackPercent }]);

    stepKitSeconds(context, 12.1);

    expect(
      daylightsAuguryPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([{ amount: 0, attribute: Attribute.AttackPercent }]);
  });
});
