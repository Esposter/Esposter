import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createArchersMessagePassiveModule } from "#src/services/weapon/passives/createArchersMessagePassiveModule";
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
// Archer's Message at its first rank: an extra forced critical hit at the rank's multiplier, once every ten seconds
const archersMessagePassiveModule = createArchersMessagePassiveModule([1]);
const weakPointHit: KitHit = { ...TRAVELER_KIT.plungeCollision, weakPoint: true };
const createDamageTaken = (attackTag: AttackTag, hit: KitHit) => ({
  attackTag,
  enemy,
  hit,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});

describe(createArchersMessagePassiveModule, () => {
  test("a charged attack's hit on a weak point queues one forced critical hit at the rank's multiplier on the enemy it struck", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    archersMessagePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.ChargedAttack, weakPointHit),
      context,
      wielder,
    );

    expect(
      context.strikes.map(({ hit, target }) => ({
        isForcedCritical: hit.isForcedCritical,
        talentMultiplier: hit.talentMultiplier,
        target,
      })),
    ).toStrictEqual([{ isForcedCritical: true, talentMultiplier: 1, target: enemy }]);
  });

  test("a hit that is no charged attack, or lands on no weak point, queues no extra hit", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    archersMessagePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.ChargedAttack, TRAVELER_KIT.plungeCollision),
      context,
      wielder,
    );
    archersMessagePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack, weakPointHit), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a second proc waits out the rank's ten seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    archersMessagePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.ChargedAttack, weakPointHit),
      context,
      wielder,
    );
    archersMessagePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.ChargedAttack, weakPointHit),
      context,
      wielder,
    );

    expect(context.strikes).toHaveLength(1);

    // A step clears the strikes queued before it, so each count below is the hits queued since the last step
    stepKitSeconds(context, 9);
    archersMessagePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.ChargedAttack, weakPointHit),
      context,
      wielder,
    );

    expect(context.strikes).toHaveLength(0);

    stepKitSeconds(context, 1.1);
    archersMessagePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.ChargedAttack, weakPointHit),
      context,
      wielder,
    );

    expect(context.strikes).toHaveLength(1);
  });
});
