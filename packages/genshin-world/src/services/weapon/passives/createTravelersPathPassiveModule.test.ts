import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

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
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createTravelersPathPassiveModule } from "#src/services/weapon/passives/createTravelersPathPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readBuffs = (effects: readonly KitEffect[]) =>
  effects
    .filter((effect) => effect.kind === "buff")
    .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining }));

describe(createTravelersPathPassiveModule, () => {
  // Traveler's Path at its first rank, on the Traveler: a hit raises ATK by 16% for 8 seconds, and
  // It regenerates 3 Energy, once every 5 seconds
  const travelersPathPassiveModule = createTravelersPathPassiveModule([0.16, 8, 0, 3, 5]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const damageTaken = {
    attackTag: AttackTag.NormalAttack,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  };

  test("a hit by the Traveler raises ATK for eight seconds and regenerates three Energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);

    expect([
      readBuffs(context.kitEffectState.effects),
      getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy,
    ]).toStrictEqual([[{ amount: 0.16, attribute: Attribute.AttackPercent, secondsRemaining: 8 }], 3]);
  });

  test("a second hit inside the cooldown regenerates no Energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(3);
  });

  test("a hit after the five-second cooldown regenerates Energy again", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);
    stepKitSeconds(context, 5.1);
    travelersPathPassiveModule.onKitEvent?.(damageTaken, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(6);
  });

  test("a wielder other than the Traveler obtains nothing", () => {
    expect.hasAssertions();

    const otherWielder: Combatant = { ...wielder, characterId: -1 };
    const context = createKitTestContext(otherWielder);
    travelersPathPassiveModule.onKitEvent?.({ ...damageTaken, striker: otherWielder }, context, otherWielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });
});
