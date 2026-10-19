import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createCritEnergyPassiveModule } from "#src/services/weapon/passives/createCritEnergyPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createCritEnergyPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Windfall with synthetic params: a 50% chance, and its cooldown in seconds
  const critEnergyPassiveModule = createCritEnergyPassiveModule([0.5, 3]);
  const createDamageTaken = (isCritical: boolean) => ({
    attackTag: undefined,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a CRIT hit the wielder deals regenerates energy for the wielder", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const before = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    critEnergyPassiveModule.onKitEvent?.(createDamageTaken(true), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy - before).toBeCloseTo(6);
  });

  test("a hit that is not a CRIT regenerates nothing, and a CRIT inside the cooldown regenerates nothing more", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    critEnergyPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);
    const afterNonCrit = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    critEnergyPassiveModule.onKitEvent?.(createDamageTaken(true), context, wielder);
    const afterFirstCrit = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    critEnergyPassiveModule.onKitEvent?.(createDamageTaken(true), context, wielder);

    expect(afterNonCrit).toBe(0);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(afterFirstCrit);
  });
});
