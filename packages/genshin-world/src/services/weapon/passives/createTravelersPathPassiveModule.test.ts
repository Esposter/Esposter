import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createTravelersPathPassiveModule } from "#src/services/weapon/passives/createTravelersPathPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readBuffs = (effects: readonly KitEffect[]) =>
  effects
    .filter((effect) => effect.kind === "buff")
    .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining }));

describe(createTravelersPathPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Synthetic params, not the weapon's row, on the Traveler: a hit raises ATK by a quarter for three seconds, and
  // It regenerates two Energy, once every two seconds
  const travelersPathPassiveModule = createTravelersPathPassiveModule([0.25, 3, 0, 2, 2]);
  const wielder: Combatant = createWielderCombatant();
  const damageTaken = {
    attackTag: AttackTag.NormalAttack,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  };

  test("a hit by the Traveler raises ATK for three seconds and regenerates two Energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);

    expect([
      readBuffs(context.kitEffectState.effects),
      getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy,
    ]).toStrictEqual([[{ amount: 0.25, attribute: Attribute.AttackPercent, secondsRemaining: 3 }], 2]);
  });

  test("a second hit inside the cooldown regenerates no Energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(2);
  });

  test("a hit after the two-second cooldown regenerates Energy again", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);
    stepKitSeconds(context, 2.1);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(4);
  });

  test("a wielder other than the Traveler obtains nothing", () => {
    expect.hasAssertions();

    const otherWielder: Combatant = { ...wielder, characterId: -1 };
    const context = createKitTestContext(otherWielder);
    travelersPathPassiveModule.onKitEvent?.({ ...damageTaken, striker: otherWielder }, context, otherWielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });
});
