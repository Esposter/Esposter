import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

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
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createEagleSpearOfJusticePassiveModule } from "#src/services/weapon/passives/createEagleSpearOfJusticePassiveModule";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
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
// Primordial Jade Winged-Spear at its first rank: 3.2% ATK a stack, and 12% DMG dealt at the maximum of seven stacks
const eagleSpearOfJusticePassiveModule = createEagleSpearOfJusticePassiveModule([0.032, 0.12, 0, 0]);
const EAGLE_SPEAR_ID = "eagleSpear";
const createHit = (striker: Combatant): KitEvent => ({
  attackTag: AttackTag.NormalAttack,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker,
});
const getStacks = (effects: Parameters<typeof findKitStatus>[0]) =>
  findKitStatus(effects, TRAVELER_CHARACTER_ID, EAGLE_SPEAR_ID)?.stacks;
const getMaximumBuffs = (effects: Parameters<typeof findKitStatus>[0]) =>
  effects.filter(
    (effect) =>
      effect.kind === "buff" && effect.source === EAGLE_SPEAR_ID && effect.attribute === Attribute.AllDamageBonus,
  );

describe(createEagleSpearOfJusticePassiveModule, () => {
  test("a hit adds a stack, and each stack raises the wielder's ATK by the rank's percentage", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    eagleSpearOfJusticePassiveModule.onKitEvent?.(createHit(wielder), context, wielder);

    expect(getStacks(context.kitEffectState.effects)).toBe(1);
    const attackBuff = context.kitEffectState.effects.find(
      (effect) => effect.kind === "buff" && effect.source === EAGLE_SPEAR_ID,
    );
    expect(attackBuff).toStrictEqual({
      amount: 0.032,
      attribute: Attribute.AttackPercent,
      characterId: TRAVELER_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 6,
      source: EAGLE_SPEAR_ID,
    });
  });

  test("a second hit inside the 0.3 second cooldown adds no stack, and one after it does", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    eagleSpearOfJusticePassiveModule.onKitEvent?.(createHit(wielder), context, wielder);
    eagleSpearOfJusticePassiveModule.onKitEvent?.(createHit(wielder), context, wielder);

    expect(getStacks(context.kitEffectState.effects)).toBe(1);

    stepKitSeconds(context, 0.31);
    eagleSpearOfJusticePassiveModule.onKitEvent?.(createHit(wielder), context, wielder);

    expect(getStacks(context.kitEffectState.effects)).toBe(2);
  });

  test("at seven stacks the wielder's DMG dealt is raised by the rank's second number, and no stack is added past seven", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hitIndex = 0; hitIndex < 6; hitIndex++) {
      eagleSpearOfJusticePassiveModule.onKitEvent?.(createHit(wielder), context, wielder);
      stepKitSeconds(context, 0.31);
    }

    expect(getMaximumBuffs(context.kitEffectState.effects)).toStrictEqual([]);

    eagleSpearOfJusticePassiveModule.onKitEvent?.(createHit(wielder), context, wielder);
    expect(getMaximumBuffs(context.kitEffectState.effects)).toStrictEqual([
      {
        amount: 0.12,
        attribute: Attribute.AllDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 6,
        source: EAGLE_SPEAR_ID,
      },
    ]);

    stepKitSeconds(context, 0.31);
    eagleSpearOfJusticePassiveModule.onKitEvent?.(createHit(wielder), context, wielder);
    expect(getStacks(context.kitEffectState.effects)).toBe(7);
  });

  test("the stacks run out six seconds after the last one gained", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    eagleSpearOfJusticePassiveModule.onKitEvent?.(createHit(wielder), context, wielder);
    stepKitSeconds(context, 6.5);

    expect(getStacks(context.kitEffectState.effects)).toBeUndefined();
  });

  test("another character's hit adds no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    eagleSpearOfJusticePassiveModule.onKitEvent?.(
      createHit({ ...wielder, characterId: OTHER_CHARACTER_ID }),
      context,
      wielder,
    );

    expect(getStacks(context.kitEffectState.effects)).toBeUndefined();
  });
});
