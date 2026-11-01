import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { createOceanicVictoryPassiveModule } from "#src/services/weapon/passives/createOceanicVictoryPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createOceanicVictoryPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Oceanic Victory with synthetic params: 20% burst DMG, a certain chance, a 150% multiplier and a fifteen-second cooldown
  const oceanicVictoryPassiveModule = createOceanicVictoryPassiveModule([0.2, 1, 1.5, 15]);
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("an elemental burst raises the wielder's burst DMG by the rank's percentage, and no other attack", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    expect(
      oceanicVictoryPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalBurst),
        enemy,
        party,
        [],
      ),
    ).toBe(0.2);
    expect(
      oceanicVictoryPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        [],
      ),
    ).toBe(0);
  });

  test("an elemental burst hit queues one extra hit at the rank's multiplier, once per cooldown", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    oceanicVictoryPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalBurst), context, wielder);
    oceanicVictoryPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalBurst), context, wielder);

    expect(context.strikes).toStrictEqual([
      {
        body: context.body,
        combatant: wielder,
        hit: { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: 1.5 },
      },
    ]);
  });
});
