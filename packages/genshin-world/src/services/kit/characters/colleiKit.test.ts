import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { COLLEI_CHARACTER_ID, createColleiKitBehaviour } from "#src/services/kit/characters/colleiKit";
import { JEAN_CHARACTER_ID } from "#src/services/kit/characters/jeanKit";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const COLLEI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, COLLEI_CHARACTER_ID);
const createColleiCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: COLLEI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: COLLEI_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

const castTrumpCardKitty = (constellationCount: number): KitEffectState => {
  const kitEffectState: KitEffectState = { effects: [] };
  const party = createParty([COLLEI_CHARACTER_ID, JEAN_CHARACTER_ID]);
  COLLEI_KIT.elementalBurst.onStart?.(
    createKitTestContext(createColleiCombatant(constellationCount), { kitEffectState, party }),
  );
  return kitEffectState;
};

describe(createColleiKitBehaviour, () => {
  // The team's Elemental Mastery buffs from Trump-Card Kitty's cast, read off the effects the burst's start adds

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const kitEffectState = castTrumpCardKitty(4);

    expect(
      kitEffectState.effects.find((effect) => effect.kind === "buff" && effect.characterId === JEAN_CHARACTER_ID),
    ).toStrictEqual({
      amount: 60,
      attribute: Attribute.ElementalMastery,
      characterId: JEAN_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 12,
    });
    expect(
      kitEffectState.effects.some((effect) => effect.kind === "buff" && effect.characterId === COLLEI_CHARACTER_ID),
    ).toBe(false);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();

    expect(castTrumpCardKitty(3).effects.some((effect) => effect.kind === "buff")).toBe(false);
  });

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...COLLEI_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(COLLEI_KIT.chargedAttack.hits).talentMultiplier,
      COLLEI_KIT.plungeCollision.talentMultiplier,
      takeOne(COLLEI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(COLLEI_KIT.highPlunge.hits).talentMultiplier,
      takeOne(COLLEI_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(COLLEI_KIT.elementalBurst.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.43602, 0.42656, 0.54094, 0.68026, 1.24, 0.568288, 1.136335, 1.419344, 1.512, 2.01824,
    ]);
  });

  test("the skill and burst cooldowns and the burst's energy cost come from the table", () => {
    expect.hasAssertions();

    expect(COLLEI_KIT.skillCooldownSeconds).toBe(12);
    expect(COLLEI_KIT.burstCooldownSeconds).toBe(15);
    expect(COLLEI_KIT.burstEnergyCost).toBe(60);
  });

  test("the Floral Brush hits land at 34 and 138 frames, the second past the skill's 68-frame animation", () => {
    expect.hasAssertions();

    expect(COLLEI_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      34, 138,
    ]);
    expect(Math.round(COLLEI_KIT.elementalSkill.seconds * 60)).toBe(68);
  });

  test("the fully charged shot's arrow lands 10 frames after its 86-frame hitmark", () => {
    expect.hasAssertions();

    expect(Math.round(takeOne(COLLEI_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(96);
  });

  test("the Trump-Card Kitty explosion lands at 25 frames and its leap ticks from 68 frames, every 30", () => {
    expect.hasAssertions();
    const field = castKitAction(COLLEI_KIT.elementalBurst, createColleiCombatant()).effects.find(
      (effect): effect is KitField => effect.kind === "field",
    );
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick(
      createKitTestContext(createColleiCombatant(), { characterIdCombatantMap: new Map(), kitEffectState }),
      0,
    );
    const tickSummon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(Math.round(takeOne(COLLEI_KIT.elementalBurst.hits).hitmarkSeconds * 60)).toBe(25);
    expect(Math.round((field?.nextTickSeconds ?? 0) * 60)).toBe(68);
    expect(Math.round((field?.tickIntervalSeconds ?? 0) * 60)).toBe(30);
    expect(tickSummon?.hits.map(({ talentMultiplier }) => talentMultiplier)).toStrictEqual([0.43248]);
  });

  test("the kitty's status runs 378 frames from its explosion, as gcsim gives it", () => {
    expect.hasAssertions();
    const field = castKitAction(COLLEI_KIT.elementalBurst, createColleiCombatant()).effects.find(
      (effect): effect is KitField => effect.kind === "field",
    );

    expect(Math.round((field?.secondsRemaining ?? 0) * 60)).toBe(403);
  });

  test("each leap lands where the kitty was cast, whatever the body does after", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createColleiCombatant());
    COLLEI_KIT.elementalBurst.onStart?.(context);
    const field = context.kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    context.body.position.x = 1;
    field?.onTick(context, 0);
    const tickSummon = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.body.position).toStrictEqual({ x: 0, z: 0 });
  });

  test("a Constellation 1 Collei gains 20% Energy Recharge while she is off the field, and none on it", () => {
    expect.hasAssertions();
    const combatant = createColleiCombatant(1);

    expect([
      COLLEI_KIT.getPassiveBonuses?.(combatant, 1, [{ ...combatant, isOnField: false }]),
      COLLEI_KIT.getPassiveBonuses?.(combatant, 1, [{ ...combatant, isOnField: true }]),
    ]).toStrictEqual([[{ amount: 0.2, attribute: Attribute.EnergyRecharge }], []]);
  });

  test("a Constellation 0 Collei gains no Energy Recharge off the field", () => {
    expect.hasAssertions();
    const combatant = createColleiCombatant(0);

    expect(COLLEI_KIT.getPassiveBonuses?.(combatant, 1, [{ ...combatant, isOnField: false }])).toStrictEqual([]);
  });
});
