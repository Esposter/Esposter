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
import { ABSORBING_PRISM_ID, absorbingPrism } from "#src/services/gcg/cards/absorbingPrism";
import { AEGIS_OF_ABYSSAL_FLAME_ID } from "#src/services/gcg/cards/aegisOfAbyssalFlame";
import { CHAINS_OF_WARDING_THUNDER_ID, chainsOfWardingThunder } from "#src/services/gcg/cards/chainsOfWardingThunder";
import { CHINJU_FOREST_ID, chinjuForest } from "#src/services/gcg/cards/chinjuForest";
import { ABYSSAL_SUMMONS_ID } from "#src/services/gcg/cards/abyssalSummons";
import { CROWFEATHER_COVER_ID, crowfeatherCover } from "#src/services/gcg/cards/crowfeatherCover";
import { CRYO_HILICHURL_SHOOTER_ID, cryoHilichurlShooter } from "#src/services/gcg/cards/cryoHilichurlShooter";
import { DARKFIRE_FURNACE_ID, darkfireFurnace } from "#src/services/gcg/cards/darkfireFurnace";
import { ELECTRO_CRYSTAL_CORE_ID, electroCrystalCore } from "#src/services/gcg/cards/electroCrystalCore";
import { ELECTRO_HILICHURL_SHOOTER_ID, electroHilichurlShooter } from "#src/services/gcg/cards/electroHilichurlShooter";
import {
  ELEMENTAL_RESONANCE_HIGH_VOLTAGE_ID,
  elementalResonanceHighVoltage,
} from "#src/services/gcg/cards/elementalResonanceHighVoltage";
import { EMBERS_REKINDLED_ID, embersRekindled } from "#src/services/gcg/cards/embersRekindled";
import { FIERY_REBIRTH_ID, fieryRebirth } from "#src/services/gcg/cards/fieryRebirth";
import { HILICHURL_BERSERKER_ID, hilichurlBerserker } from "#src/services/gcg/cards/hilichurlBerserker";
import { SIN_OF_PRIDE_ID, sinOfPride } from "#src/services/gcg/cards/sinOfPride";
import { SHIMENAWAS_REMINISCENCE_ID, shimenawasReminiscence } from "#src/services/gcg/cards/shimenawasReminiscence";
import { TENGU_JUURAI_AMBUSH_ID, tenguJuuraiAmbush } from "#src/services/gcg/cards/tenguJuuraiAmbush";
import { TENGU_JUURAI_STORMCLUSTER_ID, tenguJuuraiStormcluster } from "#src/services/gcg/cards/tenguJuuraiStormcluster";
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
const SARA_NORMAL_ATTACK = createSkill(14_061, "Effect_Damage_Physic_2", GcgSkillKind.NormalAttack);
const TENGU_STORMCALL = createSkill(14_062, "Char_Skill_14062", GcgSkillKind.ElementalSkill);
const KOUKOU_SENDOU = createSkill(14_063, "Char_Skill_14063", GcgSkillKind.ElementalBurst);
const OMINOUS_STAR = createSkill(23_023, "Char_Skill_23023", GcgSkillKind.ElementalBurst);

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

  test("a hit that defeats the character the Aegis is on takes the Aegis with it, so no piercing reaches the opposing side", () => {
    expect.hasAssertions();

    const abyss = createCharacterState(ABYSS_LECTOR_ID, Element.Pyro);
    abyss.shield = 2;
    abyss.statuses = [{ cardId: AEGIS_OF_ABYSSAL_FLAME_ID, counter: 0, rounds: 0, usages: 1 }];
    const duel = createDuel([
      createSideState([abyss]),
      createSideState([{ ...createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro), hp: 1 }]),
    ]);

    applyGcgDamage(duel, 1, { damageType: GcgDamageKind.Physical, value: 12 }, TEST_RULE);

    expect({
      defeatedStatuses: takeOne(takeOne(duel.sides, 0).characters, 0).statuses,
      opposingHp: takeOne(duel.sides, 1).characters.map(({ hp }) => hp),
      winnerSideIndex: duel.winnerSideIndex,
    }).toStrictEqual({ defeatedStatuses: [], opposingHp: [1], winnerSideIndex: 1 });
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

describe("tengu Stormcall", () => {
  test("it deals 1 Electro DMG and summons Tengu Juurai: Ambush for its one use", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, TENGU_STORMCALL);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(9);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([
      { cardId: TENGU_JUURAI_AMBUSH_ID, counter: 0, rounds: 0, usages: 1 },
    ]);
  });
});

describe("tengu Juurai: Ambush", () => {
  test("End Phase deals 1 Electro DMG, applies Crowfeather Cover to the active character, and is spent after its one use", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);
    takeOne(duel.sides, 0).summons = [createGcgZoneCard(TENGU_JUURAI_AMBUSH_ID, tenguJuuraiAmbush)];

    runGcgEndPhase(duel);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(9);
    expect(takeOne(duel.sides, 0).characters[0]?.statuses).toStrictEqual([
      { cardId: CROWFEATHER_COVER_ID, counter: 0, rounds: 0, usages: 2 },
    ]);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([]);
  });
});

describe("tengu Juurai: Stormcluster", () => {
  test("End Phase deals 2 Electro DMG and stays for a second End Phase", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);
    takeOne(duel.sides, 0).summons = [createGcgZoneCard(TENGU_JUURAI_STORMCLUSTER_ID, tenguJuuraiStormcluster)];

    runGcgEndPhase(duel);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(8);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([
      { cardId: TENGU_JUURAI_STORMCLUSTER_ID, counter: 0, rounds: 0, usages: 1 },
    ]);
  });
});

describe("darkfire Furnace", () => {
  test("End Phase deals 1 Pyro DMG to the active character and 1 piercing DMG to each character on standby", () => {
    expect.hasAssertions();

    const standby = { ...createCharacterState(ABYSS_LECTOR_ID, Element.Pyro), shield: 2 };
    const duel = createDuel([
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro), standby]),
    ]);
    takeOne(duel.sides, 0).summons = [createGcgZoneCard(DARKFIRE_FURNACE_ID, darkfireFurnace)];

    runGcgEndPhase(duel);

    const [active, standbyAfter] = takeOne(duel.sides, 1).characters;
    expect(active?.hp).toBe(9);
    expect(standbyAfter?.hp).toBe(9);
    expect(standbyAfter?.shield).toBe(2);
  });
});

describe("ominous Star", () => {
  test("it deals 3 Pyro DMG and summons Darkfire Furnace for its two usages", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ABYSS_LECTOR_ID, Element.Pyro)]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, OMINOUS_STAR);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(7);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([
      { cardId: DARKFIRE_FURNACE_ID, counter: 0, rounds: 0, usages: 2 },
    ]);
  });
});

describe("crowfeather Cover", () => {
  test.each([
    ["Elemental Skill", TENGU_STORMCALL, 8],
    ["Elemental Burst", KOUKOU_SENDOU, 7],
  ])("the attached character's %s deals 1 more DMG and spends one of its two usages", (_name, skill, hp) => {
    expect.hasAssertions();

    const sara = createCharacterState(KUJOU_SARA_ID, Element.Electro);
    sara.statuses = [createGcgZoneCard(CROWFEATHER_COVER_ID, crowfeatherCover)];
    const duel = createDuel([
      createSideState([sara]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, skill);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(hp);
    expect(takeOne(duel.sides, 0).characters[0]?.statuses).toStrictEqual([
      { cardId: CROWFEATHER_COVER_ID, counter: 0, rounds: 0, usages: 1 },
    ]);
  });

  test("a normal attack is not boosted and spends no usage", () => {
    expect.hasAssertions();

    const sara = createCharacterState(KUJOU_SARA_ID, Element.Electro);
    sara.statuses = [createGcgZoneCard(CROWFEATHER_COVER_ID, crowfeatherCover)];
    const duel = createDuel([
      createSideState([sara]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, SARA_NORMAL_ATTACK);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(8);
    expect(takeOne(duel.sides, 0).characters[0]?.statuses).toStrictEqual([
      { cardId: CROWFEATHER_COVER_ID, counter: 0, rounds: 0, usages: 2 },
    ]);
  });
});

describe("abyssal Summons", () => {
  const ABYSSAL_SUMMONS_CARD: GcgCard = {
    costs: [],
    descriptionTextId: 1,
    effects: [],
    id: ABYSSAL_SUMMONS_ID,
    isLocation: false,
    kind: GcgCardKind.Event,
    nameTextId: 1,
  };

  test.each([
    ["Cryo Hilichurl Shooter", 0, CRYO_HILICHURL_SHOOTER_ID],
    ["Hilichurl Berserker", 0.5, HILICHURL_BERSERKER_ID],
    ["Electro Hilichurl Shooter", 0.99, ELECTRO_HILICHURL_SHOOTER_ID],
  ])("it summons %s for the draw of %s, for 2 usages", (_name, draw, summonId) => {
    expect.hasAssertions();

    const duel: GcgDuel = {
      ...createDuel([
        createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
        createSideState([createCharacterState(ABYSS_LECTOR_ID, Element.Pyro)]),
      ]),
      random: () => draw,
    };
    takeOne(duel.sides, 0).hand = [ABYSSAL_SUMMONS_ID];
    takeOne(duel.sides, 0).cards = [ABYSSAL_SUMMONS_CARD];

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([{ cardId: summonId, counter: 0, rounds: 0, usages: 2 }]);
  });
});

describe("hilichurl summons", () => {
  test.each([
    ["Cryo Hilichurl Shooter", CRYO_HILICHURL_SHOOTER_ID, cryoHilichurlShooter],
    ["Hilichurl Berserker", HILICHURL_BERSERKER_ID, hilichurlBerserker],
    ["Electro Hilichurl Shooter", ELECTRO_HILICHURL_SHOOTER_ID, electroHilichurlShooter],
  ])("%s deals 1 DMG at each End Phase, and is spent after its second", (_name, cardId, module) => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
      createSideState([createCharacterState(ABYSS_LECTOR_ID, Element.Pyro)]),
    ]);
    takeOne(duel.sides, 0).summons = [createGcgZoneCard(cardId, module)];

    runGcgEndPhase(duel);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(9);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([{ cardId, counter: 0, rounds: 0, usages: 1 }]);

    runGcgEndPhase(duel);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(8);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([]);
  });
});

describe("sin of Pride", () => {
  const SIN_OF_PRIDE_CARD: GcgCard = {
    costs: [],
    descriptionTextId: 1,
    effects: [],
    id: SIN_OF_PRIDE_ID,
    isLocation: false,
    kind: GcgCardKind.Talent,
    nameTextId: 1,
  };
  const createSaraWithSkills = (): GcgCharacterState => {
    const sara = createCharacterState(KUJOU_SARA_ID, Element.Electro);
    return { ...sara, character: { ...sara.character, skills: [TENGU_STORMCALL] } };
  };

  test("it is equipped to Kujou Sara when she is active, and her Tengu Stormcall is used once at once", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createSaraWithSkills()]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);
    takeOne(duel.sides, 0).hand = [SIN_OF_PRIDE_ID];
    takeOne(duel.sides, 0).cards = [SIN_OF_PRIDE_CARD];

    expect(playGcgCard(duel, 0, 0, 0, [])).toBe(GcgActionResult.Done);

    expect(takeOne(duel.sides, 0).characters[0]?.equipments.map(({ cardId }) => cardId)).toStrictEqual([
      SIN_OF_PRIDE_ID,
    ]);
    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(9);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([TENGU_JUURAI_AMBUSH_ID]);
  });

  test("with Crowfeather Cover on her, Kujou Sara's Elemental Burst deals 1 more DMG on top of the Cover's", () => {
    expect.hasAssertions();

    const sara = createSaraWithSkills();
    sara.equipments = [createGcgZoneCard(SIN_OF_PRIDE_ID, sinOfPride)];
    sara.statuses = [createGcgZoneCard(CROWFEATHER_COVER_ID, crowfeatherCover)];
    const duel = createDuel([
      createSideState([sara]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KOUKOU_SENDOU);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(6);
    expect(takeOne(duel.sides, 0).characters[0]?.statuses).toStrictEqual([
      { cardId: CROWFEATHER_COVER_ID, counter: 0, rounds: 0, usages: 1 },
    ]);
  });

  test("without Crowfeather Cover on her, Kujou Sara's Elemental Burst gets no bonus from it", () => {
    expect.hasAssertions();

    const sara = createSaraWithSkills();
    sara.equipments = [createGcgZoneCard(SIN_OF_PRIDE_ID, sinOfPride)];
    const duel = createDuel([
      createSideState([sara]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KOUKOU_SENDOU);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(8);
  });
});

describe("shimenawa's Reminiscence", () => {
  test("once per round, a Talent card or Elemental Skill spends one Elemental Die less", () => {
    expect.hasAssertions();

    const sara = createCharacterState(KUJOU_SARA_ID, Element.Electro);
    sara.equipments = [createGcgZoneCard(SHIMENAWAS_REMINISCENCE_ID, shimenawasReminiscence)];
    const duel = createDuel([
      createSideState([sara], [Element.Electro, Element.Electro]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);
    const costs: GcgCost[] = [{ count: 3, element: Element.Electro, kind: GcgCostKind.Dice }];

    expect(payGcgSubjectCost({ duel, sideIndex: 0 }, 0, { skill: TENGU_STORMCALL }, costs, [0, 1])).toBe(true);
    expect(takeOne(duel.sides, 0).usedCardIds).toStrictEqual([SHIMENAWAS_REMINISCENCE_ID]);

    takeOne(duel.sides, 0).dice = [Element.Electro, Element.Electro];

    expect(payGcgSubjectCost({ duel, sideIndex: 0 }, 0, { skill: TENGU_STORMCALL }, costs, [0, 1])).toBe(false);
  });

  test.each([
    ["a Normal Attack at 2 Energy", SARA_NORMAL_ATTACK, 2, 7],
    ["an Elemental Skill at 2 Energy", TENGU_STORMCALL, 2, 8],
    ["a Normal Attack below 2 Energy", SARA_NORMAL_ATTACK, 1, 8],
  ])("%s deals the damage it would, plus 1 when at 2 Energy", (_name, skill, energy, hp) => {
    expect.hasAssertions();

    const sara = { ...createCharacterState(KUJOU_SARA_ID, Element.Electro), energy };
    sara.equipments = [createGcgZoneCard(SHIMENAWAS_REMINISCENCE_ID, shimenawasReminiscence)];
    const duel = createDuel([
      createSideState([sara]),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, skill);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(hp);
  });
});

describe("chinju Forest", () => {
  const createChinjuDuel = (dice: Element[]) => {
    const duel = createDuel([
      createSideState([createCharacterState(KUJOU_SARA_ID, Element.Electro)], dice),
      createSideState([createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro)]),
    ]);
    takeOne(duel.sides, 0).supports = [createGcgZoneCard(CHINJU_FOREST_ID, chinjuForest)];
    return duel;
  };
  const NORMAL_ATTACK_COSTS: GcgCost[] = [{ count: 2, kind: GcgCostKind.Unaligned }];

  test("with an even number of dice, a normal attack costs 1 fewer Unaligned die, and the card spends a usage", () => {
    expect.hasAssertions();

    const duel = createChinjuDuel([Element.Pyro, Element.Hydro]);

    expect(payGcgSubjectCost({ duel, sideIndex: 0 }, 0, { skill: SARA_NORMAL_ATTACK }, NORMAL_ATTACK_COSTS, [0])).toBe(
      true,
    );
    expect(takeOne(duel.sides, 0).supports[0]?.usages).toBe(3);
  });

  test("with an odd number of dice, a normal attack pays its full Unaligned dice", () => {
    expect.hasAssertions();

    const duel = createChinjuDuel([Element.Pyro]);

    expect(payGcgSubjectCost({ duel, sideIndex: 0 }, 0, { skill: SARA_NORMAL_ATTACK }, NORMAL_ATTACK_COSTS, [0])).toBe(
      false,
    );
    expect(takeOne(duel.sides, 0).supports[0]?.usages).toBe(4);
  });
});

describe("elemental Resonance: High Voltage", () => {
  const HIGH_VOLTAGE_CARD: GcgCard = {
    costs: [],
    descriptionTextId: 1,
    effects: [],
    id: ELEMENTAL_RESONANCE_HIGH_VOLTAGE_ID,
    isLocation: false,
    kind: GcgCardKind.Event,
    nameTextId: 1,
  };

  test("the active character and the next character without maximum Energy each gain 1 Energy", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createCharacterState(KUJOU_SARA_ID, Element.Electro),
        { ...createCharacterState(ABYSS_LECTOR_ID, Element.Pyro), energy: 3 },
        createCharacterState(ELECTRO_HYPOSTASIS_ID, Element.Electro),
      ]),
      createSideState([createCharacterState(ABYSS_LECTOR_ID, Element.Pyro)]),
    ]);
    takeOne(duel.sides, 0).hand = [ELEMENTAL_RESONANCE_HIGH_VOLTAGE_ID];
    takeOne(duel.sides, 0).cards = [HIGH_VOLTAGE_CARD];

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).characters.map(({ energy }) => energy)).toStrictEqual([1, 3, 1]);
  });
});
