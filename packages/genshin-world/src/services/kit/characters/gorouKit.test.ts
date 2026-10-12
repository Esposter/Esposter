import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createGorouKitBehaviour, GOROU_CHARACTER_ID } from "#src/services/kit/characters/gorouKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitField } from "#src/services/kit/effects/stepKitField";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const GOROU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, GOROU_CHARACTER_ID);
const createGorouCombatant = (characterId = GOROU_CHARACTER_ID): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId,
  constellationCount: 0,
  element: Element.Geo,
  elementalResonances: [],
  kit: GOROU_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

const checkIsField = (effect: KitEffect): effect is KitField => effect.kind === "field";
// The effects an action's start adds, as the kit's effects hold them
const castEffects = (action: KitAction, kitEffectState: KitEffectState = { effects: [] }): KitEffect[] => {
  action.onStart?.(createKitTestContext(createGorouCombatant(), { kitEffectState }));
  return kitEffectState.effects;
};

describe(createGorouKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const crystalCollapse = castEffects(GOROU_KIT.elementalBurst).find(
      (effect): effect is KitSummon => effect.kind === "summon",
    );
    const multipliers = [
      ...GOROU_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(GOROU_KIT.chargedAttack.hits).talentMultiplier,
      GOROU_KIT.plungeCollision.talentMultiplier,
      takeOne(GOROU_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(GOROU_KIT.highPlunge.hits).talentMultiplier,
      takeOne(GOROU_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(GOROU_KIT.elementalBurst.hits).talentMultiplier,
      takeOne(crystalCollapse?.hits ?? []).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.37754, 0.37152, 0.4945, 0.58996, 1.24, 0.568288, 1.136335, 1.419344, 1.072, 0.98216, 0.613,
    ]);
  });

  test("the General's War Banner buffs the active character's DEF, and its Geo DMG from three Geo characters", () => {
    expect.hasAssertions();
    const banner = castEffects(GOROU_KIT.elementalSkill).find((effect) => checkIsField(effect));
    const combatant = createGorouCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    banner?.onTick(
      createKitTestContext(combatant, {
        characterIdCombatantMap: new Map([
          [1, createGorouCombatant(1)],
          [2, createGorouCombatant(2)],
          [GOROU_CHARACTER_ID, combatant],
        ]),
        kitEffectState,
      }),
      0,
    );

    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 206.16,
        attribute: Attribute.Defense,
        characterId: GOROU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 2,
        source: "gorou-defense",
      },
      {
        amount: 0.15,
        attribute: Attribute.GeoDamageBonus,
        characterId: GOROU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 2,
        source: "gorou-crunch",
      },
    ]);
  });

  test("juuga's field moves with the body on the field", () => {
    expect.hasAssertions();
    const field = castEffects(GOROU_KIT.elementalBurst).find((effect) => checkIsField(effect));
    if (field)
      stepKitField(
        field,
        0,
        createKitTestContext(createGorouCombatant(), { body: { facing: 0, height: 0, position: { x: 3, z: -2 } } }),
      );

    expect(field?.centre).toStrictEqual({ x: 3, z: -2 });
  });

  test("the General's War Banner is not placed while Juuga's field stands", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    castEffects(GOROU_KIT.elementalBurst, kitEffectState);
    castEffects(GOROU_KIT.elementalSkill, kitEffectState);

    expect(kitEffectState.effects.filter((effect) => checkIsField(effect))).toHaveLength(1);
  });

  test("the crystal collapse's six ticks are set out at the cast, the first 2 seconds after it", () => {
    expect.hasAssertions();
    const crystalCollapse = castEffects(GOROU_KIT.elementalBurst).find(
      (effect): effect is KitSummon => effect.kind === "summon",
    );

    expect(crystalCollapse?.isFollowing).toBe(true);
    expect(crystalCollapse?.hits).toHaveLength(6);
    expect(crystalCollapse?.hits[0]?.hitmarkSeconds).toBeCloseTo(121 / 60);
  });
});
