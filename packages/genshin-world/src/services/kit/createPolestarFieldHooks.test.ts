import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { addPolestarField } from "#src/services/kit/addPolestarField";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const ORIGIN = { x: 0, z: 0 };
const POLESTAR_TICK_SECONDS = 4;
const STELLAR_CONDUCT = { element: Element.Cryo, reactionType: ReactionType.StellarConduct };
const createEnemyAt = (x: number) => createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, "");
// The DMG Bonus each buff of an attribute gives, in the order they were added
const buffAmounts = (kitEffectState: KitEffectState, attribute: Attribute) =>
  kitEffectState.effects.flatMap((effect) =>
    effect.kind === "buff" && effect.attribute === attribute ? [effect.amount] : [],
  );

describe("createPolestarFieldHooks", () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };
  // Applies an element to the enemy as a hit of the character on the field does
  const applyElement = (enemy: Enemy, element: Element): KitEvent => ({
    element,
    enemy,
    kind: KitEventKind.ElementApplied,
    striker: combatant,
  });

  test("the body inside a field has its Cryo and Electro DMG Bonus raised by 20% with no recorded hit", () => {
    expect.hasAssertions();
    const context = createKitTestContext(combatant, { body: { facing: 0, height: 0, position: ORIGIN } });
    addPolestarField(context.kitEffectState, TRAVELER_CHARACTER_ID, [STELLAR_CONDUCT], ORIGIN);

    stepKitSeconds(context, 1);

    expect(buffAmounts(context.kitEffectState, Attribute.CryoDamageBonus)).toStrictEqual([expect.closeTo(0.2, 9)]);
    expect(buffAmounts(context.kitEffectState, Attribute.ElectroDamageBonus)).toStrictEqual([expect.closeTo(0.2, 9)]);
  });

  test("a Cryo or Electro applied inside the field is a recorded hit, which the next tick's buff raises by 1%", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(3);
    const context = createKitTestContext(combatant, {
      body: { facing: 0, height: 0, position: ORIGIN },
      enemyMap: new Map([[enemy.id, enemy]]),
    });
    addPolestarField(context.kitEffectState, TRAVELER_CHARACTER_ID, [STELLAR_CONDUCT], ORIGIN);
    emitKitEvent(applyElement(enemy, Element.Cryo), context);

    stepKitSeconds(context, POLESTAR_TICK_SECONDS + 1);

    expect(buffAmounts(context.kitEffectState, Attribute.CryoDamageBonus)).toStrictEqual([expect.closeTo(0.29, 9)]);
    expect(buffAmounts(context.kitEffectState, Attribute.ElectroDamageBonus)).toStrictEqual([expect.closeTo(0.29, 9)]);
  });

  test("an element other than Cryo or Electro applied inside the field is not a recorded hit", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(3);
    const context = createKitTestContext(combatant, {
      body: { facing: 0, height: 0, position: ORIGIN },
      enemyMap: new Map([[enemy.id, enemy]]),
    });
    addPolestarField(context.kitEffectState, TRAVELER_CHARACTER_ID, [STELLAR_CONDUCT], ORIGIN);
    emitKitEvent(applyElement(enemy, Element.Pyro), context);

    stepKitSeconds(context, POLESTAR_TICK_SECONDS + 1);

    expect(buffAmounts(context.kitEffectState, Attribute.CryoDamageBonus)).toStrictEqual([expect.closeTo(0.2, 9)]);
  });

  test("a Cryo applied to an enemy outside the field is not a recorded hit", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(30);
    const context = createKitTestContext(combatant, {
      body: { facing: 0, height: 0, position: ORIGIN },
      enemyMap: new Map([[enemy.id, enemy]]),
    });
    addPolestarField(context.kitEffectState, TRAVELER_CHARACTER_ID, [STELLAR_CONDUCT], ORIGIN);
    emitKitEvent(applyElement(enemy, Element.Cryo), context);

    stepKitSeconds(context, POLESTAR_TICK_SECONDS + 1);

    expect(buffAmounts(context.kitEffectState, Attribute.CryoDamageBonus)).toStrictEqual([expect.closeTo(0.2, 9)]);
  });
});
