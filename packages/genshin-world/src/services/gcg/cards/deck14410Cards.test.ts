import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { AEGIS_OF_ABYSSAL_FLAME_ID } from "#src/services/gcg/cards/aegisOfAbyssalFlame";
import { ABSORBING_PRISM_ID, absorbingPrism } from "#src/services/gcg/cards/absorbingPrism";
import { CHAINS_OF_WARDING_THUNDER_ID, chainsOfWardingThunder } from "#src/services/gcg/cards/chainsOfWardingThunder";
import { EMBERS_REKINDLED_ID, embersRekindled } from "#src/services/gcg/cards/embersRekindled";
import { ELECTRO_CRYSTAL_CORE_ID, electroCrystalCore } from "#src/services/gcg/cards/electroCrystalCore";
import { FIERY_REBIRTH_ID, fieryRebirth } from "#src/services/gcg/cards/fieryRebirth";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { payGcgSubjectCost } from "#src/services/gcg/payGcgSubjectCost";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgPreparedSkills } from "#src/services/gcg/runGcgPreparedSkills";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const ABYSS_LECTOR_ID = 2_302;
const ELECTRO_HYPOSTASIS_ID = 2_401;
const KUJOU_SARA_ID = 1_406;

const createCharacterState = (id: number, element: Element): GcgCharacterState => ({
  aura: GcgAura.None,
  character: { descriptionTextId: 2, element, hp: 10, id, maxEnergy: 3, nameTextId: 1, skills: [], weapon: "" },
  energy: 0,
  equipments: [],
  hp: 10,
  isFrozen: false,
  shield: 0,
  statuses: [],
});
const createSideState = (characters: GcgCharacterState[], dice: GcgSideState["dice"] = []): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  dice,
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
const createSkill = (id: number, effect: string, kind: GcgSkillKind): GcgSkill => ({
  costs: [],
  effect,
  energyGain: 0,
  id,
  kind,
});
const ELEMENTAL_SKILL = createSkill(23_022, "Effect_Damage_Fire_3", GcgSkillKind.ElementalSkill);
const ROCK_PAPER_SCISSORS_COMBO = createSkill(24_012, "Char_Skill_24012", GcgSkillKind.ElementalSkill);
const LIGHTNING_LOCKDOWN = createSkill(24_013, "Char_Skill_24013", GcgSkillKind.ElementalBurst);

describe("fiery Rebirth", () => {
  test("a lethal hit restores the character to 4 HP, and a second lethal hit defeats it", () => {
    expect.hasAssertions();

    const lector = { ...createCharacterState(ABYSS_LECTOR_ID, Element.Pyro), hp: 3 };
    lector.statuses = [createGcgZoneCard(FIERY_REBIRTH_ID, fieryRebirth)];
    const duel = createDuel([
      createSideState([lector]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    applyGcgDamage(duel, 1, { damageType: Element.Pyro, value: 5 }, TEST_RULE);

    const restored = takeOne(duel.sides, 0).characters[0];
    expect(restored?.hp).toBe(4);
    expect(restored?.statuses).toStrictEqual([{ cardId: FIERY_REBIRTH_ID, counter: 1, rounds: 0, usages: 0 }]);

    applyGcgDamage(duel, 1, { damageType: Element.Pyro, value: 5 }, TEST_RULE);

    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBeLessThanOrEqual(0);
  });

  test("once triggered, the character's skill damage is 1 higher", () => {
    expect.hasAssertions();

    const lector = createCharacterState(ABYSS_LECTOR_ID, Element.Pyro);
    lector.statuses = [{ cardId: FIERY_REBIRTH_ID, counter: 1, rounds: 0, usages: 0 }];
    const duel = createDuel([
      createSideState([lector]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    applyGcgDamage(duel, 0, { damageType: Element.Pyro, value: 3 }, TEST_RULE, {
      duel,
      sideIndex: 0,
      skill: ELEMENTAL_SKILL,
    });

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(6);
  });
});

describe("electro Crystal Core", () => {
  test("a lethal hit restores the character to 1 HP, and the core is spent", () => {
    expect.hasAssertions();

    const hypostasis = { ...createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro), hp: 2 };
    hypostasis.statuses = [createGcgZoneCard(ELECTRO_CRYSTAL_CORE_ID, electroCrystalCore)];
    const duel = createDuel([
      createSideState([hypostasis]),
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)]),
    ]);

    applyGcgDamage(duel, 1, { damageType: Element.Electro, value: 4 }, TEST_RULE);

    const restored = takeOne(duel.sides, 0).characters[0];
    expect(restored?.hp).toBe(1);
    expect(restored?.statuses).toStrictEqual([]);
  });
});

describe("rock-Paper-Scissors Combo", () => {
  test("the combo deals 2 Electro and prepares Scissors and Paper, which run at the side's next turn", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState([{ ...createCharacterState(KUJOU_SARA_ID, Element.Electro), hp: 20 }]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, ROCK_PAPER_SCISSORS_COMBO);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(18);
    expect(takeOne(duel.sides, 0).preparedSkills?.map(({ skill }) => skill.id)).toStrictEqual([24_015, 24_016]);

    runGcgPreparedSkills(duel, 0);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(13);
    expect(takeOne(duel.sides, 0).preparedSkills?.map(({ skill }) => skill.id)).toStrictEqual([24_016]);
  });

  test("the prepared skills run when their side's next turn begins, not before", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState([{ ...createCharacterState(KUJOU_SARA_ID, Element.Electro), hp: 20 }]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, ROCK_PAPER_SCISSORS_COMBO);
    passGcgTurn(duel, 0);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(18);

    passGcgTurn(duel, 1);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(13);
  });

  test("a prepared skill whose character is defeated does not run", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro),
        createCharacterState(KUJOU_SARA_ID, Element.Electro),
      ]),
      createSideState([{ ...createCharacterState(KUJOU_SARA_ID, Element.Electro), hp: 20 }]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, ROCK_PAPER_SCISSORS_COMBO);
    takeOne(takeOne(duel.sides, 0).characters, 0).hp = 0;
    runGcgPreparedSkills(duel, 0);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(18);
  });
});

describe("chains of Warding Thunder", () => {
  test("while it is on the field, the opposing side's first switch of a round spends 1 more die, and a later switch that round does not", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState(
        [createCharacterState(KUJOU_SARA_ID, Element.Electro), createCharacterState(ABYSS_LECTOR_ID, Element.Pyro)],
        [Element.Pyro, Element.Hydro, Element.Cryo],
      ),
    ]);
    takeOne(duel.sides, 0).summons = [createGcgZoneCard(CHAINS_OF_WARDING_THUNDER_ID, chainsOfWardingThunder)];
    const switchCost: GcgCost[] = [{ count: 1, kind: GcgCostKind.Unaligned }];

    expect(payGcgSubjectCost({ duel, sideIndex: 1 }, 0, { switchTo: 1 }, switchCost, [0])).toBe(false);
    expect(payGcgSubjectCost({ duel, sideIndex: 1 }, 0, { switchTo: 1 }, switchCost, [0, 1])).toBe(true);
    expect(payGcgSubjectCost({ duel, sideIndex: 1 }, 0, { switchTo: 1 }, switchCost, [0])).toBe(true);
  });

  test("a skill's cost is not surcharged", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)], [Element.Pyro]),
    ]);
    takeOne(duel.sides, 0).summons = [createGcgZoneCard(CHAINS_OF_WARDING_THUNDER_ID, chainsOfWardingThunder)];
    const skillCost: GcgCost[] = [{ count: 1, kind: GcgCostKind.Unaligned }];

    expect(payGcgSubjectCost({ duel, sideIndex: 1 }, 0, { skill: ELEMENTAL_SKILL }, skillCost, [0])).toBe(true);
  });

  test("at each End Phase it deals 1 Electro to the opposing active character, and is spent after two End Phases", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)]),
    ]);
    takeOne(duel.sides, 0).summons = [createGcgZoneCard(CHAINS_OF_WARDING_THUNDER_ID, chainsOfWardingThunder)];

    runGcgEndPhase(duel);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(9);

    runGcgEndPhase(duel);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(8);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([]);
  });
});

describe("lightning Lockdown", () => {
  test("deals 2 Electro and summons Chains of Warding Thunder for its two usages", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, LIGHTNING_LOCKDOWN);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(8);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([
      { cardId: CHAINS_OF_WARDING_THUNDER_ID, counter: 0, rounds: 0, usages: 2 },
    ]);
  });
});

describe("aegis of Abyssal Flame", () => {
  test("the shield takes a hit first, and once its points are depleted, 1 piercing DMG reaches every opposing character", () => {
    expect.hasAssertions();

    const abyss = createCharacterState(ABYSS_LECTOR_ID, Element.Pyro);
    abyss.shield = 2;
    abyss.statuses = [{ cardId: AEGIS_OF_ABYSSAL_FLAME_ID, counter: 0, rounds: 0, usages: 1 }];
    const duel = createDuel([
      createSideState([abyss]),
      createSideState([
        createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro),
        createCharacterState(KUJOU_SARA_ID, Element.Electro),
      ]),
    ]);

    applyGcgDamage(duel, 1, { damageType: GcgDamageKind.Physical, value: 3 }, TEST_RULE);

    const defended = takeOne(duel.sides, 0).characters[0];
    expect(defended?.hp).toBe(9);
    expect(defended?.shield).toBe(0);
    expect(defended?.statuses).toStrictEqual([]);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([9, 9]);
  });

  test("a piercing hit takes no shield points, so the Aegis is not depleted", () => {
    expect.hasAssertions();

    const abyss = createCharacterState(ABYSS_LECTOR_ID, Element.Pyro);
    abyss.shield = 2;
    abyss.statuses = [{ cardId: AEGIS_OF_ABYSSAL_FLAME_ID, counter: 0, rounds: 0, usages: 1 }];
    const duel = createDuel([
      createSideState([abyss]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    applyGcgDamage(duel, 1, { damageType: GcgDamageKind.Piercing, value: 3 }, TEST_RULE);

    const defended = takeOne(duel.sides, 0).characters[0];
    expect(defended?.hp).toBe(7);
    expect(defended?.shield).toBe(2);
    expect(defended?.statuses).toStrictEqual([{ cardId: AEGIS_OF_ABYSSAL_FLAME_ID, counter: 0, rounds: 0, usages: 1 }]);
  });
});

describe("embers Rekindled", () => {
  const EMBERS_TALENT: GcgCard = {
    costs: [],
    descriptionTextId: 1,
    effects: [],
    id: EMBERS_REKINDLED_ID,
    isLocation: false,
    kind: GcgCardKind.Talent,
    nameTextId: 1,
  };

  test("when its character triggers Fiery Rebirth, the card is discarded and the character gains the Aegis of Abyssal Flame", () => {
    expect.hasAssertions();

    const lector = { ...createCharacterState(ABYSS_LECTOR_ID, Element.Pyro), hp: 3 };
    lector.statuses = [createGcgZoneCard(FIERY_REBIRTH_ID, fieryRebirth)];
    lector.equipments = [createGcgZoneCard(EMBERS_REKINDLED_ID, embersRekindled)];
    const duel = createDuel([
      createSideState([lector]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    applyGcgDamage(duel, 1, { damageType: Element.Pyro, value: 5 }, TEST_RULE);

    const restored = takeOne(duel.sides, 0).characters[0];
    expect(restored?.hp).toBe(4);
    expect(restored?.equipments).toStrictEqual([]);
    expect(restored?.shield).toBe(2);
    expect(restored?.statuses).toStrictEqual([
      { cardId: FIERY_REBIRTH_ID, counter: 1, rounds: 0, usages: 0 },
      { cardId: AEGIS_OF_ABYSSAL_FLAME_ID, counter: 0, rounds: 0, usages: 1 },
    ]);
  });

  test("played on a character that has already triggered Fiery Rebirth, the card is discarded and the Aegis is applied", () => {
    expect.hasAssertions();

    const lector = createCharacterState(ABYSS_LECTOR_ID, Element.Pyro);
    lector.statuses = [{ cardId: FIERY_REBIRTH_ID, counter: 1, rounds: 0, usages: 0 }];
    const duel = createDuel([
      createSideState([lector]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);
    takeOne(duel.sides, 0).hand = [EMBERS_REKINDLED_ID];
    takeOne(duel.sides, 0).cards = [EMBERS_TALENT];

    expect(playGcgCard(duel, 0, 0, 0, [])).toBe(GcgActionResult.Done);

    const played = takeOne(duel.sides, 0).characters[0];
    expect(played?.equipments).toStrictEqual([]);
    expect(played?.shield).toBe(2);
    expect(played?.statuses.map(({ cardId }) => cardId)).toStrictEqual([FIERY_REBIRTH_ID, AEGIS_OF_ABYSSAL_FLAME_ID]);
  });
});

describe("absorbing Prism", () => {
  const ABSORBING_PRISM_CARD: GcgCard = {
    costs: [],
    descriptionTextId: 1,
    effects: [],
    id: ABSORBING_PRISM_ID,
    isLocation: false,
    kind: GcgCardKind.Event,
    nameTextId: 1,
  };

  test("when the active character is Electro Hypostasis, it is healed 3 HP and gains the Electro Crystal Core", () => {
    expect.hasAssertions();

    const hypostasis = { ...createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro), hp: 5 };
    const duel = createDuel([
      createSideState([hypostasis]),
      createSideState([createCharacterState(ABYSS_LECTOR_ID, Element.Pyro)]),
    ]);
    takeOne(duel.sides, 0).hand = [ABSORBING_PRISM_ID];
    takeOne(duel.sides, 0).cards = [ABSORBING_PRISM_CARD];

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);

    const active = takeOne(duel.sides, 0).characters[0];
    expect(active?.hp).toBe(8);
    expect(active?.statuses).toStrictEqual([{ cardId: ELECTRO_CRYSTAL_CORE_ID, counter: 0, rounds: 0, usages: 1 }]);
    expect(takeOne(duel.sides, 0).hand).toStrictEqual([]);
  });

  test("when the active character is another, the card is refused and the duel is left as it was", () => {
    expect.hasAssertions();

    const lector = { ...createCharacterState(ABYSS_LECTOR_ID, Element.Pyro), hp: 5 };
    const duel = createDuel([
      createSideState([lector]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);
    takeOne(duel.sides, 0).hand = [ABSORBING_PRISM_ID];
    takeOne(duel.sides, 0).cards = [ABSORBING_PRISM_CARD];

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Unavailable);
    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBe(5);
    expect(takeOne(duel.sides, 0).hand).toStrictEqual([ABSORBING_PRISM_ID]);
  });
});
