import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
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
import { createPurifyingCrownPassiveModule } from "#src/services/weapon/passives/createPurifyingCrownPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const useSkill = (context: KitContext) => {
  emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context);
};
const castShield = (context: KitContext) =>
  castKitShield(context, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });

describe(createPurifyingCrownPassiveModule, () => {
  // Purifying Crown at its first rank: a skill or burst its wielder uses raises its ATK by 24% for 20 seconds, and a
  // Shield it casts while that holds gives Electrifying Edict for 20 seconds, every member's Lunar-Charged dealing 40%
  // More DMG
  const passiveModule = createPurifyingCrownPassiveModule([0.24, 20, 0.4, 20]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
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
  // The DMG Bonus the wielder's weapon gives a reaction of the type the other member makes
  const priceReaction = (context: KitContext, reactionType: LunarReactionType | TransformativeReactionType): number =>
    wielder.kit.getPartyReactionBonus?.(
      wielder,
      { combatant: other, element: Element.Electro, enemy, reactionType },
      context,
    ).damageBonus ?? 0;

  test.each([
    ["skill", KitEventKind.SkillUsed],
    ["burst", KitEventKind.BurstUsed],
  ])("the wielder's %s raises its ATK by 24%", (_title, kind) => {
    expect.hasAssertions();

    const context = createContext();
    emitKitEvent(
      kind === KitEventKind.SkillUsed
        ? { characterId: TRAVELER_CHARACTER_ID, kind }
        : { characterId: TRAVELER_CHARACTER_ID, energyCost: 60, kind: KitEventKind.BurstUsed },
      context,
    );

    expect(context.kitEffectState.effects.filter((effect) => effect.kind === "buff")).toStrictEqual([
      {
        amount: 0.24,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 20,
        source: "purifyingCrown",
      },
    ]);
  });

  test("a shield the wielder casts while its ATK is raised gives every member's Lunar-Charged 40% more DMG", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    castShield(context);

    expect(priceReaction(context, LunarReactionType.LunarCharged)).toBe(0.4);
    expect(priceReaction(context, TransformativeReactionType.Overloaded)).toBe(0);
  });

  test("a shield the wielder casts without its ATK raised gives nothing", () => {
    expect.hasAssertions();

    const context = createContext();
    castShield(context);
    useSkill(context);

    expect(priceReaction(context, LunarReactionType.LunarCharged)).toBe(0);
  });

  test("a shield another member casts gives nothing", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    castKitShield(context, OTHER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });

    expect(priceReaction(context, LunarReactionType.LunarCharged)).toBe(0);
  });

  test("its Electrifying Edict ends after 20 seconds", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    stepKitSeconds(context, 10);
    castShield(context);
    stepKitSeconds(context, 19.9);
    const damageBonusBeforeEnd = priceReaction(context, LunarReactionType.LunarCharged);
    stepKitSeconds(context, 0.2);

    expect(damageBonusBeforeEnd).toBe(0.4);
    expect(priceReaction(context, LunarReactionType.LunarCharged)).toBe(0);
  });
});
