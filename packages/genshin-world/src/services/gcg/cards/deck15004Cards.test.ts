import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage, applyGcgStandbyPiercing } from "#src/services/gcg/applyGcgDamage";
import { GCG_SHIELD_LIMIT } from "#src/services/gcg/constants";
import { beaconOfTheReedSea } from "#src/services/gcg/cards/beaconOfTheReedSea";
import { BEACON_OF_THE_REED_SEA_ID } from "#src/services/gcg/cards/constants";
import { BURNING_ASSAULT_SKILL } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { elementalResonanceEnduringRock } from "#src/services/gcg/cards/elementalResonanceEnduringRock";
import { elementalResonanceWovenStone } from "#src/services/gcg/cards/elementalResonanceWovenStone";
import { ellin } from "#src/services/gcg/cards/ellin";
import { generalsGlory } from "#src/services/gcg/cards/generalsGlory";
import { GENERALS_GLORY_ID } from "#src/services/gcg/cards/constants";
import { generalsWarBanner } from "#src/services/gcg/cards/generalsWarBanner";
import { GENERALS_WAR_BANNER_ID } from "#src/services/gcg/cards/constants";
import { grandNarukamiShrine } from "#src/services/gcg/cards/grandNarukamiShrine";
import { GRAND_NARUKAMI_SHRINE_ID } from "#src/services/gcg/cards/constants";
import { kingsSquire, kingsSquireInEffect } from "#src/services/gcg/cards/kingsSquire";
import { KINGS_SQUIRE_ID, KINGS_SQUIRE_IN_EFFECT_ID } from "#src/services/gcg/cards/constants";
import { pyroScorpion } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { PYRO_SCORPION_ID } from "#src/services/gcg/cards/constants";
import { rushingHound } from "#src/services/gcg/cards/rushingHound";
import { RUSHING_HOUND_ID } from "#src/services/gcg/cards/constants";
import { sangonomiyaShrine } from "#src/services/gcg/cards/sangonomiyaShrine";
import { SANGONOMIYA_SHRINE_ID } from "#src/services/gcg/cards/constants";
import { SCORPION_BLESSING_ID } from "#src/services/gcg/cards/constants";
import { scorpocalypse } from "#src/services/gcg/cards/scorpocalypse";
import { SCORPOCALYPSE_ID } from "#src/services/gcg/cards/constants";
import { sumeruCity } from "#src/services/gcg/cards/sumeruCity";
import { SUMERU_CITY_ID } from "#src/services/gcg/cards/constants";
import { tenshukaku } from "#src/services/gcg/cards/tenshukaku";
import { TENSHUKAKU_ID } from "#src/services/gcg/cards/constants";
import { vourukashasGlow } from "#src/services/gcg/cards/vourukashasGlow";
import { VOURUKASHAS_GLOW_ID } from "#src/services/gcg/cards/constants";
import { weepingWillowOfTheLake } from "#src/services/gcg/cards/weepingWillowOfTheLake";
import { WEEPING_WILLOW_OF_THE_LAKE_ID } from "#src/services/gcg/cards/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { payGcgSubjectCost } from "#src/services/gcg/payGcgSubjectCost";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { ELLIN_ID, GOROU_ID } from "#src/services/gcg/cards/constants";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const EREMITE_ID = 2_303;
const ITTO_ID = 1_605;
const BOW = "BOW";
const CLAYMORE = "CLAYMORE";
const CARD_ID = 999_999;

const createSkill = (id: number, effect: string, kind: GcgSkillKind, costs: GcgSkill["costs"] = []): GcgSkill => ({
  costs,
  effect,
  energyGain: 0,
  id,
  kind,
});
const INUZAKA = createSkill(16_062, "Char_Skill_16062", GcgSkillKind.ElementalSkill);
const JUUGA = createSkill(16_063, "Char_Skill_16063", GcgSkillKind.ElementalBurst);
const SEARING = createSkill(23_031, "Char_Skill_23031", GcgSkillKind.NormalAttack);
const BLAZING = createSkill(23_032, "Char_Skill_23032", GcgSkillKind.ElementalSkill);
const AWAKENING = createSkill(23_033, "Char_Skill_23033", GcgSkillKind.ElementalBurst);
const SPIRIT_POWER = createSkill(23_034, "Char_Skill_23034", GcgSkillKind.Passive);
const ELECTRO_SKILL = createSkill(12_001, "Effect_Damage_Elec_3", GcgSkillKind.ElementalSkill);
const PYRO_SKILL = createSkill(12_002, "Effect_Damage_Fire_3", GcgSkillKind.ElementalSkill, [
  { count: 3, element: Element.Pyro, kind: GcgCostKind.Dice },
]);
const BURNING = BURNING_ASSAULT_SKILL;

const createSideState = (
  characters: GcgCharacterState[],
  options: Partial<Pick<GcgSideState, "dice" | "drawPile" | "hand" | "onstages" | "summons" | "supports">> = {},
): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  deckCardIds: [],
  dice: options.dice ?? [],
  drawPile: options.drawPile ?? [],
  hand: options.hand ?? [],
  hasDeclaredEnd: false,
  hasPrepared: true,
  hasRolled: true,
  isReplacementPending: false,
  onstages: options.onstages ?? [],
  summons: options.summons ?? [],
  supports: options.supports ?? [],
  usedCardIds: [],
  usedSkillIds: [],
});
const createDuel = (attacker: GcgSideState, defender: GcgSideState): GcgDuel => ({
  cardModules: GcgCardIdModuleMap,
  skillModules: GcgEffectNameSkillModuleMap,
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides: [attacker, defender],
  winnerSideIndex: undefined,
});
const defenderOf = (duel: GcgDuel): GcgCharacterState => takeOne(takeOne(duel.sides, 1).characters, 0);
const attackerOf = (duel: GcgDuel): GcgCharacterState => takeOne(takeOne(duel.sides, 0).characters, 0);

describe("inuzaka All-Round Defense", () => {
  test("should deal 2 Geo DMG and create a General's War Banner once the damage lands", () => {
    expect.hasAssertions();

    const attacker = createSideState([
      createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo, weapon: BOW } }),
    ]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, INUZAKA);

    expect({ defenderHp: defenderOf(duel).hp, onstages: attacker.onstages.map(({ cardId }) => cardId) }).toStrictEqual({
      defenderHp: 8,
      onstages: [GENERALS_WAR_BANNER_ID],
    });
  });

  test("should add 1 Geo DMG to the party's Geo damage while the banner is in play", () => {
    expect.hasAssertions();

    const attacker = createSideState([
      createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo, weapon: BOW } }),
    ]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 20 })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, INUZAKA);
    runGcgSkillUse({ duel, sideIndex: 0 }, INUZAKA);

    expect(defenderOf(duel).hp).toBe(15);
  });
});

describe("juuga Forward Unto Victory", () => {
  test("should deal 2 Geo DMG, create a General's War Banner and summon General's Glory", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, JUUGA);

    expect({
      defenderHp: defenderOf(duel).hp,
      onstages: attacker.onstages.map(({ cardId }) => cardId),
      summons: attacker.summons.map(({ cardId }) => cardId),
    }).toStrictEqual({ defenderHp: 8, onstages: [GENERALS_WAR_BANNER_ID], summons: [GENERALS_GLORY_ID] });
  });

  test("should stack the banner's rounds by 2, up to 3", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 20 })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, JUUGA);
    runGcgSkillUse({ duel, sideIndex: 0 }, JUUGA);

    expect(takeOne(attacker.onstages, 0).rounds).toBe(3);
  });
});

describe("general's Glory", () => {
  test("should deal 1 Geo DMG at the End Phase, and create a Crystallize shield with 2 Geo characters", () => {
    expect.hasAssertions();

    const attacker = createSideState(
      [
        createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } }),
        createGcgCharacterState({ character: { id: ITTO_ID, element: Element.Geo } }),
      ],
      { summons: [createGcgZoneCard(GENERALS_GLORY_ID, generalsGlory)] },
    );
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgEndPhase(duel);

    expect({ defenderHp: defenderOf(duel).hp, shield: attackerOf(duel).shield }).toStrictEqual({
      defenderHp: 9,
      shield: 1,
    });
  });

  test("should deal its 1 Geo DMG but create no shield with one Geo character", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })], {
      summons: [createGcgZoneCard(GENERALS_GLORY_ID, generalsGlory)],
    });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgEndPhase(duel);

    expect({ defenderHp: defenderOf(duel).hp, shield: attackerOf(duel).shield }).toStrictEqual({
      defenderHp: 9,
      shield: 0,
    });
  });
});

describe("rushing Hound: Swift as the Wind", () => {
  test("should draw 1 card when a Geo DMG skill lands while the banner is in play, once per Round", () => {
    expect.hasAssertions();

    const gorou = createGcgCharacterState({
      character: { id: GOROU_ID, element: Element.Geo },
      equipments: [createGcgZoneCard(RUSHING_HOUND_ID, rushingHound)],
    });
    const attacker = createSideState([gorou], {
      drawPile: [CARD_ID],
      onstages: [createGcgZoneCard(GENERALS_WAR_BANNER_ID, generalsWarBanner)],
    });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 20 })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, INUZAKA);
    runGcgSkillUse({ duel, sideIndex: 0 }, INUZAKA);

    expect(attacker.hand).toStrictEqual([CARD_ID]);
  });
});

describe("searing Glare", () => {
  test("should deal 1 Pyro DMG", () => {
    expect.hasAssertions();

    const attacker = createSideState([
      createGcgCharacterState({ character: { id: EREMITE_ID, element: Element.Pyro } }),
    ]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, SEARING);

    expect(defenderOf(duel).hp).toBe(9);
  });
});

describe("blazing Strike", () => {
  test("should deal 3 Pyro DMG and create a Scorpion Blessing stack each time", () => {
    expect.hasAssertions();

    const attacker = createSideState([
      createGcgCharacterState({ character: { id: EREMITE_ID, element: Element.Pyro } }),
    ]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 20 })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, BLAZING);
    runGcgSkillUse({ duel, sideIndex: 0 }, BLAZING);

    expect({
      defenderHp: defenderOf(duel).hp,
      stacks: attacker.onstages.map((zoneCard) => ({ cardId: zoneCard.cardId, counter: zoneCard.counter })),
    }).toStrictEqual({ defenderHp: 14, stacks: [{ cardId: SCORPION_BLESSING_ID, counter: 2 }] });
  });
});

describe("spirit of Omen's Awakening", () => {
  test("should deal 3 Pyro DMG and add one Pyro Scorpion to the hand once per Match", () => {
    expect.hasAssertions();

    const attacker = createSideState([
      createGcgCharacterState({ character: { id: EREMITE_ID, element: Element.Pyro } }),
    ]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 20 })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, AWAKENING);
    runGcgSkillUse({ duel, sideIndex: 0 }, AWAKENING);

    expect({ defenderHp: defenderOf(duel).hp, hand: attacker.hand }).toStrictEqual({
      defenderHp: 14,
      hand: [PYRO_SCORPION_ID],
    });
  });
});

describe("spirit of Omen's Power", () => {
  test("should gain 1 Energy after the Eremite takes DMG at 7 HP or less, once per Round", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro, skills: [SPIRIT_POWER] },
    });
    const attacker = createSideState([eremite]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    applyGcgDamage(duel, 1, { damageType: GcgDamageKind.Physical, value: 3 }, TEST_RULE);
    applyGcgDamage(duel, 1, { damageType: GcgDamageKind.Physical, value: 1 }, TEST_RULE);

    expect({ energy: eremite.energy, hp: eremite.hp }).toStrictEqual({ energy: 1, hp: 6 });
  });

  test("should gain 1 Energy when piercing DMG takes the Eremite on standby to 7 HP or less", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro, skills: [SPIRIT_POWER] },
      hp: 8,
    });
    const attacker = createSideState([
      createGcgCharacterState({ character: { id: ITTO_ID, element: Element.Geo } }),
      eremite,
    ]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    applyGcgStandbyPiercing(duel, 1, 2);

    expect({ energy: eremite.energy, hp: eremite.hp }).toStrictEqual({ energy: 1, hp: 6 });
  });
});

describe("spirit of Omen: Pyro Scorpion", () => {
  test("should negate 1 DMG for 1 Energy and create a Scorpion Blessing, spending its usage", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro },
      energy: 1,
      equipments: [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)],
    });
    const attacker = createSideState([eremite]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    applyGcgDamage(duel, 1, { damageType: GcgDamageKind.Physical, value: 3 }, TEST_RULE);

    expect({
      energy: eremite.energy,
      hp: eremite.hp,
      stacks: attacker.onstages.map(({ cardId, counter }) => ({ cardId, counter })),
    }).toStrictEqual({ energy: 0, hp: 8, stacks: [{ cardId: SCORPION_BLESSING_ID, counter: 1 }] });
  });
});

describe("burning Assault", () => {
  test("should deal 2 Pyro DMG plus one per Scorpion Blessing stack, and spend the stacks", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro },
      equipments: [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)],
    });
    const attacker = createSideState([eremite], {
      dice: [Element.Pyro, Element.Pyro],
      onstages: [{ cardId: SCORPION_BLESSING_ID, counter: 2, rounds: 0, usages: 0 }],
    });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 20 })]),
    );

    const result = useGcgSkill(duel, 0, BURNING.id, [0, 1]);

    expect({ defenderHp: defenderOf(duel).hp, result, stacks: attacker.onstages }).toStrictEqual({
      defenderHp: 16,
      result: GcgActionResult.Done,
      stacks: [],
    });
  });

  test("should keep a repeated Technique at its full cost under Ellin, which counts only Skills", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro },
      equipments: [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)],
    });
    const attacker = createSideState([eremite], {
      dice: [Element.Pyro, Element.Pyro, Element.Pyro],
      supports: [createGcgZoneCard(ELLIN_ID, ellin)],
    });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 20 })]),
    );

    const first = useGcgSkill(duel, 0, BURNING.id, [0, 1]);
    duel.actingSideIndex = 0;
    const second = useGcgSkill(duel, 0, BURNING.id, [0]);

    expect({ first, second }).toStrictEqual({ first: GcgActionResult.Done, second: GcgActionResult.Unpayable });
  });
});

describe("scorpocalypse", () => {
  test("should add a Pyro Scorpion to the hand when Burning Assault defeats an opposing character", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro },
      equipments: [
        createGcgZoneCard(SCORPOCALYPSE_ID, scorpocalypse),
        createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion),
      ],
    });
    const attacker = createSideState([eremite], { dice: [Element.Pyro, Element.Pyro] });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 2 })]),
    );

    useGcgSkill(duel, 0, BURNING.id, [0, 1]);

    expect(attacker.hand).toStrictEqual([PYRO_SCORPION_ID]);
  });

  test("should not add a Pyro Scorpion when Burning Assault defeats nothing", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro },
      equipments: [
        createGcgZoneCard(SCORPOCALYPSE_ID, scorpocalypse),
        createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion),
      ],
    });
    const attacker = createSideState([eremite], { dice: [Element.Pyro, Element.Pyro] });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 20 })]),
    );

    useGcgSkill(duel, 0, BURNING.id, [0, 1]);

    expect(attacker.hand).toStrictEqual([]);
  });

  test("should generate a Scorpion Blessing stack at the End Phase", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro },
      equipments: [createGcgZoneCard(SCORPOCALYPSE_ID, scorpocalypse)],
    });
    const attacker = createSideState([eremite]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgEndPhase(duel);

    expect(attacker.onstages.map(({ cardId, counter }) => ({ cardId, counter }))).toStrictEqual([
      { cardId: SCORPION_BLESSING_ID, counter: 1 },
    ]);
  });
});

describe("king's Squire", () => {
  test("should spend 2 fewer Elemental Dice on the next Elemental Skill of the Round, once", () => {
    expect.hasAssertions();

    const squire = createGcgCharacterState({
      character: { id: ITTO_ID, element: Element.Geo, weapon: BOW },
      equipments: [createGcgZoneCard(KINGS_SQUIRE_ID, kingsSquire)],
    });
    const attacker = createSideState([squire], {
      onstages: [createGcgZoneCard(KINGS_SQUIRE_IN_EFFECT_ID, kingsSquireInEffect)],
    });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );
    const pay = (dice: Element[]): boolean => {
      attacker.dice = dice;
      return payGcgSubjectCost(
        { duel, sideIndex: 0 },
        0,
        { card: undefined, skill: PYRO_SKILL },
        PYRO_SKILL.costs,
        dice.map((_, index) => index),
      );
    };

    expect({ first: pay([Element.Pyro]), second: pay([Element.Pyro]) }).toStrictEqual({ first: true, second: false });
  });
});

describe("beacon of the Reed Sea", () => {
  test("should add 1 DMG to the next hit after an Elemental Skill, once per Round", () => {
    expect.hasAssertions();

    const itto = createGcgCharacterState({
      character: { id: ITTO_ID, element: Element.Geo, weapon: CLAYMORE },
      equipments: [createGcgZoneCard(BEACON_OF_THE_REED_SEA_ID, beaconOfTheReedSea)],
    });
    const attacker = createSideState([itto]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro }, hp: 30 })]),
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, ELECTRO_SKILL);
    runGcgSkillUse({ duel, sideIndex: 0 }, ELECTRO_SKILL);
    runGcgSkillUse({ duel, sideIndex: 0 }, ELECTRO_SKILL);

    expect(defenderOf(duel).hp).toBe(17);
  });
});

describe("vourukasha's Glow", () => {
  test("should draw 1 card when its character takes DMG while active, and heal 1 HP at the End Phase, once per Round", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro },
      equipments: [createGcgZoneCard(VOURUKASHAS_GLOW_ID, vourukashasGlow)],
    });
    const attacker = createSideState([eremite], { drawPile: [CARD_ID] });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    applyGcgDamage(duel, 1, { damageType: GcgDamageKind.Physical, value: 3 }, TEST_RULE);
    applyGcgDamage(duel, 1, { damageType: GcgDamageKind.Physical, value: 3 }, TEST_RULE);
    runGcgEndPhase(duel);

    expect({ hand: attacker.hand, hp: eremite.hp }).toStrictEqual({ hand: [CARD_ID], hp: 5 });
  });
});

describe("tenshukaku", () => {
  test("should create an Omni Elemental Die at the Action Phase start with 5 different Elemental Dice", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })], {
      dice: [Element.Pyro, Element.Hydro, Element.Electro, Element.Cryo, Element.Geo],
    });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    tenshukaku.onActionPhase?.({ duel, sideIndex: 0 }, createGcgZoneCard(TENSHUKAKU_ID, tenshukaku));

    expect(attacker.dice.at(-1)).toBe(GcgDieFace.Omni);
  });

  test("should create no die with only 4 different Elemental Dice", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })], {
      dice: [Element.Pyro, Element.Hydro, Element.Electro, Element.Cryo],
    });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    tenshukaku.onActionPhase?.({ duel, sideIndex: 0 }, createGcgZoneCard(TENSHUKAKU_ID, tenshukaku));

    expect(attacker.dice).toHaveLength(4);
  });
});

describe("grand Narukami Shrine", () => {
  test("should generate an Omni Elemental Die after a skill while the dice are odd, twice per Round", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })], {
      dice: [Element.Pyro, Element.Pyro, Element.Pyro],
    });
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );
    const zoneCard = createGcgZoneCard(GRAND_NARUKAMI_SHRINE_ID, grandNarukamiShrine);
    const use = (): void =>
      grandNarukamiShrine.onAnySkillUsed?.({ duel, sideIndex: 0, userSideIndex: 0 }, INUZAKA, zoneCard, []);

    use();
    attacker.dice.push(Element.Pyro);
    use();
    attacker.dice.push(Element.Pyro);
    use();

    expect(attacker.dice).toHaveLength(7);
  });
});

describe("sangonomiya Shrine", () => {
  test("should heal every character 1 HP at each End Phase, for 2 Rounds", () => {
    expect.hasAssertions();

    const attacker = createSideState([
      createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo }, hp: 5 }),
      createGcgCharacterState({ character: { id: ITTO_ID, element: Element.Geo }, hp: 5 }),
    ]);
    attacker.supports = [createGcgZoneCard(SANGONOMIYA_SHRINE_ID, sangonomiyaShrine)];
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgEndPhase(duel);
    const afterFirst = attacker.characters.map(({ hp }) => hp);
    runGcgEndPhase(duel);

    expect({
      afterFirst,
      afterSecond: attacker.characters.map(({ hp }) => hp),
      supports: attacker.supports,
    }).toStrictEqual({ afterFirst: [6, 6], afterSecond: [7, 7], supports: [] });
  });
});

describe("sumeru City", () => {
  test("should spend 1 fewer Elemental Die on a skill once per Round, while the dice do not outnumber the hand", () => {
    expect.hasAssertions();

    const attacker = createSideState(
      [createGcgCharacterState({ character: { id: EREMITE_ID, element: Element.Pyro } })],
      { hand: [CARD_ID, CARD_ID] },
    );
    attacker.supports = [createGcgZoneCard(SUMERU_CITY_ID, sumeruCity)];
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );
    const pay = (dice: Element[]): boolean => {
      attacker.dice = dice;
      return payGcgSubjectCost(
        { duel, sideIndex: 0 },
        0,
        { card: undefined, skill: PYRO_SKILL },
        PYRO_SKILL.costs,
        dice.map((_, index) => index),
      );
    };

    expect({ first: pay([Element.Pyro, Element.Pyro]), second: pay([Element.Pyro, Element.Pyro]) }).toStrictEqual({
      first: true,
      second: false,
    });
  });
});

describe("weeping Willow of the Lake", () => {
  test("should draw 2 cards at the End Phase with at most 2 cards in hand, and spend a usage", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })], {
      drawPile: [CARD_ID, CARD_ID, CARD_ID],
    });
    attacker.supports = [createGcgZoneCard(WEEPING_WILLOW_OF_THE_LAKE_ID, weepingWillowOfTheLake)];
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgEndPhase(duel);

    expect({ hand: attacker.hand.length, usages: takeOne(attacker.supports, 0).usages }).toStrictEqual({
      hand: 2,
      usages: 1,
    });
  });

  test("should draw nothing with 3 cards in hand", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })], {
      drawPile: [CARD_ID],
      hand: [CARD_ID, CARD_ID, CARD_ID],
    });
    attacker.supports = [createGcgZoneCard(WEEPING_WILLOW_OF_THE_LAKE_ID, weepingWillowOfTheLake)];
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    runGcgEndPhase(duel);

    expect(attacker.hand).toHaveLength(3);
  });
});

describe("elemental Resonance: Woven Stone", () => {
  test("should be playable with 2 Geo characters, and create a Geo Elemental Die", () => {
    expect.hasAssertions();

    const attacker = createSideState([
      createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } }),
      createGcgCharacterState({ character: { id: ITTO_ID, element: Element.Geo } }),
    ]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    const canPlay = elementalResonanceWovenStone.canPlay?.({ duel, sideIndex: 0 }, undefined);
    elementalResonanceWovenStone.play?.({ duel, sideIndex: 0 }, undefined);

    expect({ canPlay, dice: attacker.dice }).toStrictEqual({ canPlay: true, dice: [Element.Geo] });
  });

  test("should not be playable with one Geo character", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } })]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    expect(elementalResonanceWovenStone.canPlay?.({ duel, sideIndex: 0 }, undefined)).toBe(false);
  });
});

describe("elemental Resonance: Enduring Rock", () => {
  test("should grant 3 shield points to the active character, up to the shield limit", () => {
    expect.hasAssertions();

    const attacker = createSideState([
      createGcgCharacterState({ character: { id: GOROU_ID, element: Element.Geo } }),
      createGcgCharacterState({ character: { id: ITTO_ID, element: Element.Geo } }),
    ]);
    const duel = createDuel(
      attacker,
      createSideState([createGcgCharacterState({ character: { id: 2_101, element: Element.Hydro } })]),
    );

    elementalResonanceEnduringRock.play?.({ duel, sideIndex: 0 }, undefined);

    expect(attackerOf(duel).shield).toBe(Math.min(GCG_SHIELD_LIMIT, 3));
  });
});
