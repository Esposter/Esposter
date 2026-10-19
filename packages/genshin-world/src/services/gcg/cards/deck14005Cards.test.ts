import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { cuileinAnbar } from "#src/services/gcg/cards/cuileinAnbar";
import { gamblersEarrings } from "#src/services/gcg/cards/gamblersEarrings";
import { instructorsCap } from "#src/services/gcg/cards/instructorsCap";
import { knightsOfFavoniusLibrary } from "#src/services/gcg/cards/knightsOfFavoniusLibrary";
import { liben } from "#src/services/gcg/cards/liben";
import { GCG_DIE_FACES } from "#src/services/gcg/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { runGcgActionPhase } from "#src/services/gcg/runGcgActionPhase";
import { runGcgRollPhase } from "#src/services/gcg/runGcgRollPhase";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { startGcgRound } from "#src/services/gcg/startGcgRound";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { CUILEIN_ANBAR_ID, KEQING_ID } from "#src/services/gcg/cards/constants";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  dice: [],
  deckCardIds: [],
  drawPile: [],
  hand: [],
  hasDeclaredEnd: false,
  hasPrepared: true,
  hasRolled: true,
  isReplacementPending: false,
  onstages: [],
  summons: [],
  supports: [],
  usedCardIds: [],
  usedSkillIds: [],
});

const createDuel = (sides: [GcgSideState, GcgSideState]): GcgDuel => ({
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
  sides,
  winnerSideIndex: undefined,
});

describe("cuilein-Anbar", () => {
  const FULL_HP = 10;
  const COLLEI_ID = 1701;
  const OPPOSING_CHARACTER_ID = 1203;

  test("the end phase deals 2 Dendro to the opposing active character, and spends a usage", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(CUILEIN_ANBAR_ID, cuileinAnbar);
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
      createSideState([
        createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } }),
        createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } }),
      ]),
    ]);
    duel.sides[0] = { ...takeOne(duel.sides, 0), summons: [zoneCard] };
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 2, FULL_HP]);
    expect(zoneCard.usages).toBe(1);
  });
});

describe("floral Brush", () => {
  const FULL_HP = 10;
  const COLLEI_ID = 1701;
  const OPPOSING_CHARACTER_ID = 1203;
  const FLORAL_BRUSH_SKILL: GcgSkill = {
    costs: [],
    effect: "Char_Skill_17012",
    energyGain: 1,
    id: 17_012,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("the skill deals 3 Dendro", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
      createSideState([createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } })]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 3]);
  });
});

describe("gambler's Earrings", () => {
  const COLLEI_ID = 1701;
  const OPPOSING_CHARACTER_ID = 1203;
  const FLORAL_BRUSH_SKILL: GcgSkill = {
    costs: [],
    effect: "Char_Skill_17012",
    energyGain: 1,
    id: 17_012,
    kind: GcgSkillKind.ElementalSkill,
  };
  const OTHER_CHARACTER_ID = 1401;

  test("after an opposing character is defeated while the equipped character is active, two Omni dice are created", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        createGcgCharacterState({
          character: { element: Element.Dendro, id: COLLEI_ID },
          equipments: [createGcgZoneCard(312_004, gamblersEarrings)],
        }),
      ]),
      createSideState([
        { ...createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } }), hp: 3 },
        createGcgCharacterState({ character: { id: KEQING_ID, element: Element.Dendro } }),
      ]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([GcgDieFace.Omni, GcgDieFace.Omni]);
  });

  test("a defeat while the equipped character is not active creates no die", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        createGcgCharacterState({ character: { id: OTHER_CHARACTER_ID, element: Element.Dendro } }),
        createGcgCharacterState({
          character: { element: Element.Dendro, id: COLLEI_ID },
          equipments: [createGcgZoneCard(312_004, gamblersEarrings)],
        }),
      ]),
      createSideState([
        { ...createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } }), hp: 3 },
        createGcgCharacterState({ character: { id: KEQING_ID, element: Element.Dendro } }),
      ]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([]);
  });

  test("it creates dice at most three times in a match", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        createGcgCharacterState({
          character: { element: Element.Dendro, id: COLLEI_ID },
          equipments: [createGcgZoneCard(312_004, gamblersEarrings)],
        }),
      ]),
      createSideState(
        Array.from({ length: 5 }, () => ({
          ...createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } }),
          hp: 1,
        })),
      ),
    ]);
    for (let defeated = 0; defeated < 4; defeated++) {
      takeOne(duel.sides, 1).activeIndex = defeated;
      applyGcgDamage(duel, 0, { damageType: Element.Dendro, value: 1 }, TEST_RULE);
    }
    expect(takeOne(duel.sides, 0).dice).toStrictEqual(Array.from({ length: 6 }, () => GcgDieFace.Omni));
  });
});

describe("instructor's Cap", () => {
  const FULL_HP = 10;
  const COLLEI_ID = 1701;
  const OPPOSING_CHARACTER_ID = 1203;
  const FLORAL_BRUSH_SKILL: GcgSkill = {
    costs: [],
    effect: "Char_Skill_17012",
    energyGain: 1,
    id: 17_012,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("after the equipped character's skill triggers a reaction, an Elemental Die of its element is created", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        createGcgCharacterState({
          character: { element: Element.Dendro, id: COLLEI_ID },
          equipments: [createGcgZoneCard(312_005, instructorsCap)],
        }),
      ]),
      createSideState([
        {
          ...createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } }),
          aura: Element.Pyro,
        },
      ]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Dendro]);
  });

  test("a skill that triggers no reaction creates no die", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        createGcgCharacterState({
          character: { element: Element.Dendro, id: COLLEI_ID },
          equipments: [createGcgZoneCard(312_005, instructorsCap)],
        }),
      ]),
      createSideState([createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } })]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([]);
  });

  test("creates at most three Elemental Dice a round", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([
        createGcgCharacterState({
          character: { element: Element.Dendro, id: COLLEI_ID },
          equipments: [createGcgZoneCard(312_005, instructorsCap)],
        }),
      ]),
      createSideState([
        {
          ...createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } }),
          hp: FULL_HP * 10,
        },
      ]),
    ]);
    for (let use = 0; use < 4; use++) {
      takeOne(takeOne(duel.sides, 1).characters).aura = Element.Pyro;
      runGcgSkillUse({ duel, sideIndex: 0 }, FLORAL_BRUSH_SKILL);
    }
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Dendro, Element.Dendro, Element.Dendro]);
  });
});

describe("starward Sword", () => {
  const FULL_HP = 10;
  const COLLEI_ID = 1701;
  const OPPOSING_CHARACTER_ID = 1203;

  const STARWARD_SWORD_SKILL: GcgSkill = {
    costs: [],
    effect: "Char_Skill_14033",
    energyGain: 0,
    id: 14_033,
    kind: GcgSkillKind.ElementalBurst,
  };

  test("the burst deals 4 Electro to the opposing active character and 3 Piercing to each one on standby", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: KEQING_ID, element: Element.Dendro } })]),
      createSideState([
        createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } }),
        createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } }),
      ]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, STARWARD_SWORD_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 4, FULL_HP - 3]);
  });
});

describe("trump-Card Kitty", () => {
  const FULL_HP = 10;
  const COLLEI_ID = 1701;
  const OPPOSING_CHARACTER_ID = 1203;

  const TRUMP_CARD_KITTY_SKILL: GcgSkill = {
    costs: [],
    effect: "Char_Skill_17013",
    energyGain: 0,
    id: 17_013,
    kind: GcgSkillKind.ElementalBurst,
  };

  test("the burst deals 2 Dendro, and summons a Cuilein-Anbar on its side", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
      createSideState([createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } })]),
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, TRUMP_CARD_KITTY_SKILL);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([FULL_HP - 2]);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([CUILEIN_ANBAR_ID]);
  });
});

describe("liben", () => {
  const COLLEI_ID = 1701;
  const OPPOSING_CHARACTER_ID = 1203;

  const LIBEN_ID = 322_008;

  test("the end phase collects one unused Elemental Die of each type, and leaves the rest in the dice", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(LIBEN_ID, liben);
    const duel = createDuel([
      {
        ...createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
        dice: [Element.Pyro, Element.Pyro, Element.Hydro, GcgDieFace.Omni],
        supports: [zoneCard],
      },
      createSideState([createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } })]),
    ]);
    runGcgEndPhase(duel);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Pyro, GcgDieFace.Omni]);
    expect(zoneCard.elements).toStrictEqual([Element.Pyro, Element.Hydro]);
    expect(zoneCard.usages).toBe(1);
  });

  test("with three dice collected, the action phase draws two cards, creates two Omni dice, and discards it", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(LIBEN_ID, liben);
    zoneCard.elements = [Element.Pyro, Element.Hydro, Element.Cryo];
    const duel = createDuel([
      {
        ...createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
        drawPile: [1, 2, 3],
        supports: [zoneCard],
      },
      createSideState([createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } })]),
    ]);
    runGcgActionPhase(duel);
    const side = takeOne(duel.sides, 0);
    expect(side.hand).toStrictEqual([1, 2]);
    expect(side.dice).toStrictEqual([GcgDieFace.Omni, GcgDieFace.Omni]);
    expect(side.supports).toStrictEqual([]);
  });

  test("with fewer than three Elemental Dice collected, the action phase keeps it on the field", () => {
    expect.hasAssertions();
    const zoneCard = createGcgZoneCard(LIBEN_ID, liben);
    zoneCard.elements = [Element.Pyro, Element.Hydro];
    const duel = createDuel([
      {
        ...createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
        drawPile: [1, 2, 3],
        supports: [zoneCard],
      },
      createSideState([createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } })]),
    ]);
    runGcgActionPhase(duel);
    const side = takeOne(duel.sides, 0);
    expect(side.supports).toStrictEqual([zoneCard]);
    expect(side.hand).toStrictEqual([]);
    expect(side.dice).toStrictEqual([]);
  });
});

describe("knights of Favonius Library", () => {
  const COLLEI_ID = 1701;
  const OPPOSING_CHARACTER_ID = 1203;

  const KNIGHTS_OF_FAVONIUS_LIBRARY_ID = 321_002;

  // A random source that throws the Cryo face for every die it rolls
  const cryoRandom = (): number => (GCG_DIE_FACES.indexOf(Element.Cryo) + 0.5) / GCG_DIE_FACES.length;

  test("when played, the chosen dice are rerolled once", () => {
    expect.hasAssertions();
    const duel = createDuel([
      {
        ...createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
        dice: [Element.Hydro, Element.Pyro],
      },
      createSideState([createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } })]),
    ]);
    duel.random = cryoRandom;
    knightsOfFavoniusLibrary.play?.({ duel, sideIndex: 0 }, undefined, { rerollDiceIndices: [[0]] });
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Cryo, Element.Pyro]);
  });

  test("the roll phase gives another reroll: naming dice rerolls them and keeps the roll open, and naming none passes", () => {
    expect.hasAssertions();
    const duel = createDuel([
      {
        ...createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
        dice: [Element.Hydro, Element.Pyro],
        hasRolled: false,
        supports: [createGcgZoneCard(KNIGHTS_OF_FAVONIUS_LIBRARY_ID, knightsOfFavoniusLibrary)],
      },
      {
        ...createSideState([
          createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } }),
        ]),
        hasRolled: true,
      },
    ]);
    duel.phase = GcgPhase.Roll;
    duel.random = cryoRandom;
    runGcgRollPhase(duel);
    expect(rerollGcgDice(duel, 0, [0])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0)).toMatchObject({ dice: [Element.Cryo, Element.Pyro], hasRolled: false });
    expect(rerollGcgDice(duel, 0, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).hasRolled).toBe(true);
    expect(duel.phase).toBe(GcgPhase.Action);
  });

  test("without the card, naming dice in the roll phase is the side's one reroll, and ends its roll", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: COLLEI_ID, element: Element.Dendro } })]),
      createSideState([createGcgCharacterState({ character: { id: OPPOSING_CHARACTER_ID, element: Element.Dendro } })]),
    ]);
    duel.phase = GcgPhase.Roll;
    duel.random = cryoRandom;
    startGcgRound(duel);
    expect(rerollGcgDice(duel, 0, [0])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).hasRolled).toBe(true);
    expect(rerollGcgDice(duel, 0, [])).toBe(GcgActionResult.WrongPhase);
  });
});
