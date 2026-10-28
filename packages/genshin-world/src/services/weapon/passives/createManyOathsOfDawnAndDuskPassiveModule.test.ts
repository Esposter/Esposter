import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createManyOathsOfDawnAndDuskPassiveModule } from "#src/services/weapon/passives/createManyOathsOfDawnAndDuskPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

// A Crystallize shield the other member's reaction left, picked up by the team
const pickUpCrystallizeShield = (context: KitContext) =>
  castKitShield(context, OTHER_CHARACTER_ID, { health: 1, isCrystallize: true, secondsRemaining: 15 });

describe(createManyOathsOfDawnAndDuskPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Many Oaths of Dawn and Dusk at its first rank: a Crystallize shard the party picks up, or a Lunar-Crystallize it
  // Triggers at most once a second, gives a Seal for 15 seconds, up to two, each raising its skill's DMG by 18%
  const passiveModule = createManyOathsOfDawnAndDuskPassiveModule([0.18, 15, 1]);
  const wielder = createKitCombatant(TRAVELER_CHARACTER_ID, getPassiveKit(TRAVELER_KIT, [passiveModule]));
  const other = createKitCombatant(OTHER_CHARACTER_ID, TRAVELER_KIT);
  const createContext = (): KitContext =>
    createKitTestContext(wielder, {
      characterIdCombatantMap: new Map([
        [OTHER_CHARACTER_ID, other],
        [TRAVELER_CHARACTER_ID, wielder],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
  // The DMG Bonus a strike of the wielder's of the given kind takes from its Seals
  const priceStrike = (context: KitContext, attackTag = AttackTag.ElementalSkill): number => {
    const strike: KitStrike = { attackTag, body: context.body, combatant: wielder, hit: TRAVELER_KIT.plungeCollision };
    return wielder.kit.getStrikeDamageBonus?.(strike, enemy, context.party, context.kitEffectState.effects) ?? 0;
  };
  const triggerLunarCrystallize = (context: KitContext) => {
    emitKitEvent(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ reactionType: LunarReactionType.LunarCrystallize }],
        striker: other,
      },
      context,
    );
  };

  test.each([
    [1, 0.18],
    [3, 0.36],
  ])("%s Crystallize shields the party picks up raise its skill DMG by %s", (shieldCount, damageBonus) => {
    expect.hasAssertions();

    const context = createContext();
    for (let shieldIndex = 0; shieldIndex < shieldCount; shieldIndex++) pickUpCrystallizeShield(context);

    expect(priceStrike(context)).toBeCloseTo(damageBonus);
    expect(priceStrike(context, AttackTag.NormalAttack)).toBe(0);
  });

  test("a shield that is not Crystallize gives no Seal", () => {
    expect.hasAssertions();

    const context = createContext();
    castKitShield(context, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 15 });

    expect(priceStrike(context)).toBe(0);
  });

  test("a Lunar-Crystallize the party triggers gives a Seal once a second", () => {
    expect.hasAssertions();

    const context = createContext();
    triggerLunarCrystallize(context);
    triggerLunarCrystallize(context);
    const damageBonusWithinSecond = priceStrike(context);
    stepKitSeconds(context, 1);
    triggerLunarCrystallize(context);

    expect(damageBonusWithinSecond).toBe(0.18);
    expect(priceStrike(context)).toBeCloseTo(0.36);
  });

  test("its Seals disappear 0.2 seconds after its skill deals DMG, a Seal gained between included", () => {
    expect.hasAssertions();

    const context = createContext();
    pickUpCrystallizeShield(context);
    emitKitEvent(
      { attackTag: AttackTag.ElementalSkill, element: undefined, enemy, kind: KitEventKind.EnemyHit, striker: wielder },
      context,
    );
    stepKitSeconds(context, 0.1);
    pickUpCrystallizeShield(context);
    const damageBonusWithinWindow = priceStrike(context);
    stepKitSeconds(context, 0.15);

    expect(damageBonusWithinWindow).toBeCloseTo(0.36);
    expect(priceStrike(context)).toBe(0);
  });

  test("a Seal gained after the last lapsed counts alone", () => {
    expect.hasAssertions();

    const context = createContext();
    pickUpCrystallizeShield(context);
    pickUpCrystallizeShield(context);
    stepKitSeconds(context, 15.1);
    pickUpCrystallizeShield(context);

    expect(priceStrike(context)).toBe(0.18);
  });
});
