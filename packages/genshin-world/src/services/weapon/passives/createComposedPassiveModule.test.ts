import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createComposedPassiveModule } from "#src/services/weapon/passives/createComposedPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createComposedPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Composed with synthetic params: a 50% chance, and its cooldown in seconds
  const composedPassiveModule = createComposedPassiveModule([0.5, 10]);
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("an elemental skill's damage within the rank's chance ends the skill's cooldown", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).skillCooldownSeconds = 6;
    composedPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).skillCooldownSeconds).toBe(0);
  });

  test("a roll above the rank's chance leaves the cooldown running", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { random: () => 0.9 });
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).skillCooldownSeconds = 6;
    composedPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).skillCooldownSeconds).toBe(6);
  });

  test("a normal attack's damage ends no cooldown", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).skillCooldownSeconds = 6;
    composedPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).skillCooldownSeconds).toBe(6);
  });

  test("a second proc waits out the rank's ten seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const partyMember = getPartyMember(context.party, TRAVELER_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 6;
    composedPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    partyMember.skillCooldownSeconds = 6;
    composedPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(partyMember.skillCooldownSeconds).toBe(6);

    stepKitSeconds(context, 9);
    composedPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(partyMember.skillCooldownSeconds).toBe(6);

    stepKitSeconds(context, 1.1);
    composedPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(partyMember.skillCooldownSeconds).toBe(0);
  });
});
