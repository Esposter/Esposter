import type { Combatant } from "#src/models/kit/Combatant";
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
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
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

// The team DEF buffs Juuga's cast gives as Gorou stands at the ascension
const getA1Buffs = (ascension: number): KitEffect[] =>
  castKitAction(GOROU_KIT.elementalBurst, { ...createGorouCombatant(), ascension }).effects.filter(
    (effect) => effect.kind === "buff" && effect.source === "gorou-a1",
  );

// Gorou with 1,000 DEF at the ascension
const createGorouWithDefense = (ascension: number): Combatant => ({
  ...createGorouCombatant(),
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.Defense, value: 1000 }]),
});
describe(createGorouKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const crystalCollapse = castKitAction(GOROU_KIT.elementalBurst, createGorouCombatant()).effects.find(
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
    const banner = castKitAction(GOROU_KIT.elementalSkill, createGorouCombatant()).effects.find((effect) =>
      checkIsField(effect),
    );
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
    const field = castKitAction(GOROU_KIT.elementalBurst, createGorouCombatant()).effects.find((effect) =>
      checkIsField(effect),
    );
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
    castKitAction(GOROU_KIT.elementalBurst, createGorouCombatant(), kitEffectState);
    castKitAction(GOROU_KIT.elementalSkill, createGorouCombatant(), kitEffectState);

    expect(kitEffectState.effects.filter((effect) => checkIsField(effect))).toHaveLength(1);
  });

  test("the crystal collapse's six ticks are set out at the cast, the first 2 seconds after it", () => {
    expect.hasAssertions();
    const crystalCollapse = castKitAction(GOROU_KIT.elementalBurst, createGorouCombatant()).effects.find(
      (effect): effect is KitSummon => effect.kind === "summon",
    );

    expect(crystalCollapse?.isFollowing).toBe(true);
    expect(crystalCollapse?.hits).toHaveLength(6);
    expect(crystalCollapse?.hits[0]?.hitmarkSeconds).toBeCloseTo(121 / 60);
  });

  describe("the Ascension 1 passive, Heedless of the Wind and Weather", () => {
    test("a passive takes effect at its ascension phase", () => {
      expect.hasAssertions();

      expect(getA1Buffs(1)).toStrictEqual([
        {
          amount: 0.25,
          attribute: Attribute.DefensePercent,
          characterId: GOROU_CHARACTER_ID,
          kind: "buff",
          secondsRemaining: 12,
          source: "gorou-a1",
        },
      ]);
    });

    test("a passive does not take effect below its ascension phase", () => {
      expect.hasAssertions();

      expect(getA1Buffs(0)).toStrictEqual([]);
    });
  });

  describe("the Ascension 4 passive, A Favor Repaid", () => {
    test("a passive takes effect at its ascension phase", () => {
      expect.hasAssertions();

      expect(takeOne(GOROU_KIT.elementalSkill.hits).additiveBaseDamageBonus?.(createGorouWithDefense(4))).toBe(1560);
    });

    test("a passive does not take effect below its ascension phase", () => {
      expect.hasAssertions();

      expect(takeOne(GOROU_KIT.elementalSkill.hits).additiveBaseDamageBonus?.(createGorouWithDefense(3))).toBe(0);
    });
  });
});
