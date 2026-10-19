import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { baneOfAllEvil } from "#src/services/gcg/cards/baneOfAllEvil";
import { conquerorOfEvilGuardianYaksha } from "#src/services/gcg/cards/conquerorOfEvilGuardianYaksha";
import { liuSu } from "#src/services/gcg/cards/liuSu";
import { lithicSpear } from "#src/services/gcg/cards/lithicSpear";
import { dunyarzad } from "#src/services/gcg/cards/dunyarzad";
import { divineMaidensDeliverance } from "#src/services/gcg/cards/divineMaidensDeliverance";
import { frostflakeSekiNoTo } from "#src/services/gcg/cards/frostflakeSekiNoTo";
import {
  FROSTFLAKE_SEKI_NO_TO_ID,
  ICY_QUILL_ID,
  MYSTICAL_ABANDON_ID,
  TALISMAN_SPIRIT_ID,
  YAKSHAS_MASK_ID,
  DUNYARZAD_ID,
  LIU_SU_ID,
  RANA_ID,
  SHENHE_ID,
  STONE_AND_CONTRACTS_ID,
  VERMILLION_HEREAFTER_ID,
  XIAO_ID,
} from "#src/services/gcg/cards/constants";
import { icyQuill } from "#src/services/gcg/cards/icyQuill";
import { rana } from "#src/services/gcg/cards/rana";
import { shatteringIce } from "#src/services/gcg/cards/shatteringIce";
import { mysticalAbandon } from "#src/services/gcg/cards/mysticalAbandon";
import { stoneAndContracts } from "#src/services/gcg/cards/stoneAndContracts";
import { springSpiritSummoning } from "#src/services/gcg/cards/springSpiritSummoning";
import { vermillionHereafter } from "#src/services/gcg/cards/vermillionHereafter";
import { talismanSpirit } from "#src/services/gcg/cards/talismanSpirit";
import { yakshasMask } from "#src/services/gcg/cards/yakshasMask";
import { GCG_SHIELD_LIMIT, GCG_SPREAD_DAMAGE } from "#src/services/gcg/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { runGcgActionPhase } from "#src/services/gcg/runGcgActionPhase";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { switchGcgActiveCharacter } from "#src/services/gcg/switchGcgActiveCharacter";
import { switchGcgCharacter } from "#src/services/gcg/switchGcgCharacter";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

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

const createTalentCard = (): GcgCard => ({
  costs: [],
  descriptionTextId: 1,
  effects: [],
  id: 211_031,
  isLocation: false,
  kind: GcgCardKind.Talent,
  nameTextId: 1,
});

// A companion Support Card, with no cost of its own
const createCompanion = (id: number): GcgCard => ({
  ...createTalentCard(),
  id,
  isCompanion: true,
  kind: GcgCardKind.Support,
});

// Xiao is active, with the mask, and three Cryo dice to pay a switch with
const createSwitchDuel = (): GcgDuel => {
  const duel = createDuel([
    createSideState([
      {
        ...createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } }),
        statuses: [createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)],
      },
      createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } }),
    ]),
    createSideState([createGcgCharacterState({ character: { id: 1107, element: Element.Cryo } })]),
  ]);
  takeOne(duel.sides, 0).dice = [Element.Cryo, Element.Cryo, Element.Cryo];
  return duel;
};

describe("spring Spirit Summoning", () => {
  test("it deals 2 Cryo DMG, then creates an Icy Quill on its side", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const context = { duel, sideIndex: 0 };

    expect(springSpiritSummoning.getDamage?.(context)).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    springSpiritSummoning.afterDamage?.(context);
    expect(takeOne(duel.sides, 0).onstages).toStrictEqual([createGcgZoneCard(ICY_QUILL_ID, icyQuill)]);
  });

  test("a second Icy Quill on its side refreshes the one there to its usages, and adds no second copy", () => {
    expect.hasAssertions();

    const side = createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]);
    side.onstages.push({ ...createGcgZoneCard(ICY_QUILL_ID, icyQuill), usages: 1 });
    const duel = createDuel([side, createSideState([])]);

    springSpiritSummoning.afterDamage?.({ duel, sideIndex: 0 });
    expect(side.onstages).toStrictEqual([createGcgZoneCard(ICY_QUILL_ID, icyQuill)]);
  });
});

describe("icy Quill", () => {
  const KABUKI: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Physic_2",
    energyGain: 1,
    id: 11_051,
    kind: GcgSkillKind.NormalAttack,
  };
  const HYOUKA: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Ice_3",
    energyGain: 1,
    id: 11_052,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("it deals 1 more Cryo DMG to a Cryo hit, spending a usage", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const zoneCard = createGcgZoneCard(ICY_QUILL_ID, icyQuill);

    expect(
      icyQuill.modifyDamageDealt?.(
        { duel, sideIndex: 0, skill: HYOUKA },
        { damageType: Element.Cryo, value: 2 },
        zoneCard,
      ),
    ).toStrictEqual({ damageType: Element.Cryo, value: 3 });
    expect(zoneCard.usages).toBe(1);
  });

  test.each([
    [GcgDamageKind.Physical, 2],
    [Element.Cryo, 0],
  ])("it adds nothing to a hit of %s with %i usages left", (damageType, usages) => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const zoneCard = { ...createGcgZoneCard(ICY_QUILL_ID, icyQuill), usages };

    expect(
      icyQuill.modifyDamageDealt?.({ duel, sideIndex: 0, skill: HYOUKA }, { damageType, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType, value: 2 });
    expect(zoneCard.usages).toBe(usages);
  });

  test("without Mystical Abandon, a Normal Attack spends a usage like any other hit", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const zoneCard = createGcgZoneCard(ICY_QUILL_ID, icyQuill);
    const context = { duel, sideIndex: 0, skill: KABUKI };

    icyQuill.modifyDamageDealt?.(context, { damageType: Element.Cryo, value: 2 }, zoneCard);
    expect(zoneCard.usages).toBe(1);
  });

  test("with Mystical Abandon equipped to a character of its side, the first Normal Attack each Round spends no usage", () => {
    expect.hasAssertions();

    const shenhe = createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } });
    shenhe.equipments = [createGcgZoneCard(MYSTICAL_ABANDON_ID, mysticalAbandon)];
    const duel = createDuel([createSideState([shenhe]), createSideState([])]);
    const zoneCard = createGcgZoneCard(ICY_QUILL_ID, icyQuill);
    const context = { duel, sideIndex: 0, skill: KABUKI };
    const damage = { damageType: Element.Cryo, value: 2 };

    expect(icyQuill.modifyDamageDealt?.(context, damage, zoneCard)).toStrictEqual({
      damageType: Element.Cryo,
      value: 3,
    });
    expect(zoneCard.usages).toBe(2);
    expect(icyQuill.modifyDamageDealt?.(context, damage, zoneCard)).toStrictEqual({
      damageType: Element.Cryo,
      value: 3,
    });
    expect(zoneCard.usages).toBe(1);
  });

  test("a Swirl's spread takes Icy Quill's 1 more once for the whole Swirl, spending one usage, not one per hit", () => {
    expect.hasAssertions();

    const duel = createDuel([
      {
        ...createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]),
        onstages: [createGcgZoneCard(ICY_QUILL_ID, icyQuill)],
      },
      createSideState([
        { ...createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } }), aura: Element.Cryo },
        createGcgCharacterState({ character: { id: 1203, element: Element.Cryo } }),
        createGcgCharacterState({ character: { id: 1204, element: Element.Cryo } }),
      ]),
    ]);

    applyGcgDamage(duel, 0, { damageType: Element.Anemo, value: 1 }, TEST_RULE, { duel, sideIndex: 0 });
    expect(takeOne(takeOne(duel.sides, 1).characters, 1).hp).toBe(10 - GCG_SPREAD_DAMAGE - 1);
    expect(takeOne(takeOne(duel.sides, 1).characters, 2).hp).toBe(10 - GCG_SPREAD_DAMAGE - 1);
    expect(takeOne(duel.sides, 0).onstages.map(({ usages }) => usages)).toStrictEqual([1]);
  });

  test("a Swirl's spread is Cryo DMG too, so it takes Icy Quill's 1 more and spends a usage", () => {
    expect.hasAssertions();

    const duel = createDuel([
      {
        ...createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]),
        onstages: [createGcgZoneCard(ICY_QUILL_ID, icyQuill)],
      },
      createSideState([
        { ...createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } }), aura: Element.Cryo },
        createGcgCharacterState({ character: { id: 1203, element: Element.Cryo } }),
      ]),
    ]);

    applyGcgDamage(duel, 0, { damageType: Element.Anemo, value: 1 }, TEST_RULE, { duel, sideIndex: 0 });
    expect(takeOne(takeOne(duel.sides, 1).characters, 1).hp).toBe(10 - GCG_SPREAD_DAMAGE - 1);
    expect(takeOne(duel.sides, 0).onstages.map(({ usages }) => usages)).toStrictEqual([1]);
  });
});

describe("divine Maiden's Deliverance", () => {
  test("it deals 1 Cryo DMG, then summons a Talisman Spirit on its side", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const context = { duel, sideIndex: 0 };

    expect(divineMaidensDeliverance.getDamage?.(context)).toStrictEqual({ damageType: Element.Cryo, value: 1 });
    divineMaidensDeliverance.afterDamage?.(context);
    expect(takeOne(duel.sides, 0).summons).toStrictEqual([createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit)]);
  });

  test("a Talisman Spirit already on its side is refreshed rather than doubled", () => {
    expect.hasAssertions();

    const side = createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]);
    side.summons.push({ ...createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit), usages: 0 });
    const duel = createDuel([side, createSideState([])]);

    divineMaidensDeliverance.afterDamage?.({ duel, sideIndex: 0 });
    expect(side.summons).toStrictEqual([createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit)]);
  });
});

describe("talisman Spirit", () => {
  test("it deals 1 Cryo DMG at each End Phase, for two usages", () => {
    expect.hasAssertions();

    const context = { duel: createDuel([createSideState([]), createSideState([])]), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit);

    expect(talismanSpirit.onEndPhase?.(context, zoneCard)).toStrictEqual({ damageType: Element.Cryo, value: 1 });
    expect(zoneCard.usages).toBe(1);
    expect(talismanSpirit.onEndPhase?.(context, zoneCard)).toStrictEqual({ damageType: Element.Cryo, value: 1 });
    expect(zoneCard.usages).toBe(0);
  });

  test("a Frostflake Seki no To on its side deals 3 Cryo at End Phase, raised by its 1 more", () => {
    expect.hasAssertions();

    const duel = createDuel([
      {
        ...createSideState([]),
        summons: [
          createGcgZoneCard(FROSTFLAKE_SEKI_NO_TO_ID, frostflakeSekiNoTo),
          createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit),
        ],
      },
      createSideState([createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } })]),
    ]);

    runGcgEndPhase(duel);
    expect(takeOne(takeOne(duel.sides, 1).characters, 0).hp).toBe(10 - 2 - 3);
  });

  test("its End Phase DMG is raised by its own 1 more Cryo DMG", () => {
    expect.hasAssertions();

    const duel = createDuel([
      { ...createSideState([]), summons: [createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit)] },
      createSideState([createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } })]),
    ]);

    runGcgEndPhase(duel);
    expect(takeOne(takeOne(duel.sides, 1).characters, 0).hp).toBe(8);
  });

  test.each([
    [Element.Cryo, 3],
    [GcgDamageKind.Physical, 3],
    [Element.Pyro, 2],
  ])("it adds 1 to a %s hit its side deals, and to no other element's", (damageType, value) => {
    expect.hasAssertions();

    const duel = createDuel([createSideState([]), createSideState([])]);
    const zoneCard = createGcgZoneCard(TALISMAN_SPIRIT_ID, talismanSpirit);

    expect(
      talismanSpirit.modifyDamageDealt?.({ duel, sideIndex: 0 }, { damageType, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType, value });
  });
});

describe("mystical Abandon", () => {
  const SPRING_SPIRIT_SUMMONING: GcgSkill = {
    costs: [],
    effect: "Char_Skill_11072",
    energyGain: 1,
    id: 11_072,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("it equips to Shenhe while she is active, and has her use Spring Spirit Summoning at once", () => {
    expect.hasAssertions();

    const shenhe = createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } });
    shenhe.character.skills = [SPRING_SPIRIT_SUMMONING];
    const context = { duel: createDuel([createSideState([shenhe]), createSideState([])]), sideIndex: 0 };

    expect(mysticalAbandon.canPlay?.(context, 0)).toBe(true);
    expect(mysticalAbandon.skillOnPlay?.(context, 0)).toStrictEqual(SPRING_SPIRIT_SUMMONING);
  });
});

describe("bane of All Evil", () => {
  test("it deals 4 Anemo DMG, then Xiao gains Yaksha's Mask for two Rounds", () => {
    expect.hasAssertions();

    const xiao = createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } });
    const duel = createDuel([createSideState([xiao]), createSideState([])]);
    const context = { duel, sideIndex: 0 };

    expect(baneOfAllEvil.getDamage?.(context)).toStrictEqual({ damageType: Element.Anemo, value: 4 });
    baneOfAllEvil.afterDamage?.(context);
    expect(xiao.statuses).toStrictEqual([createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)]);
    expect(takeOne(xiao.statuses, 0).rounds).toBe(2);
    expect(takeOne(xiao.statuses, 0).usages).toBe(2);
  });

  test("a Yaksha's Mask already on Xiao is refreshed rather than doubled", () => {
    expect.hasAssertions();

    const xiao = {
      ...createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } }),
      statuses: [{ ...createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask), rounds: 1, usages: 0 }],
    };
    const duel = createDuel([createSideState([xiao]), createSideState([])]);

    baneOfAllEvil.afterDamage?.({ duel, sideIndex: 0 });
    expect(xiao.statuses).toStrictEqual([createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)]);
  });
});

describe("yaksha's Mask", () => {
  test.each([
    [GcgDamageKind.Physical, Element.Anemo, 3],
    [Element.Anemo, Element.Anemo, 3],
    [Element.Pyro, Element.Pyro, 2],
  ])("it deals a %s hit as %s, and an Anemo hit 1 more", (damageType, dealtAs, value) => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const zoneCard = createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask);

    expect(yakshasMask.modifyDamageDealt?.({ duel, sideIndex: 0 }, { damageType, value: 2 }, zoneCard)).toStrictEqual({
      damageType: dealtAs,
      value,
    });
  });

  test("a Plunging Attack deals 2 more DMG", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const zoneCard = createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask);

    expect(
      yakshasMask.modifyDamageDealt?.(
        { duel, isPlunge: true, sideIndex: 0 },
        { damageType: GcgDamageKind.Physical, value: 2 },
        zoneCard,
      ),
    ).toStrictEqual({ damageType: Element.Anemo, value: 5 });
  });
});

describe("yaksha's Mask's switch clause", () => {
  test("while Xiao is active, a switch away from her spends one die less", () => {
    expect.hasAssertions();

    const duel = createSwitchDuel();

    expect(switchGcgCharacter(duel, 0, 1, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).activeIndex).toBe(1);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Cryo, Element.Cryo, Element.Cryo]);
  });

  test("a switch to Xiao while another character is active gets no reduction", () => {
    expect.hasAssertions();

    const duel = createSwitchDuel();
    takeOne(duel.sides, 0).activeIndex = 1;

    expect(switchGcgCharacter(duel, 0, 0, [])).toBe(GcgActionResult.Unpayable);
    expect(switchGcgCharacter(duel, 0, 0, [0])).toBe(GcgActionResult.Done);
  });

  test("the reduction is taken once per Round", () => {
    expect.hasAssertions();

    const duel = createSwitchDuel();

    expect(switchGcgCharacter(duel, 0, 1, [])).toBe(GcgActionResult.Done);
    duel.actingSideIndex = 0;
    expect(switchGcgCharacter(duel, 0, 0, [0])).toBe(GcgActionResult.Done);
    duel.actingSideIndex = 0;
    expect(switchGcgCharacter(duel, 0, 1, [])).toBe(GcgActionResult.Unpayable);
    expect(switchGcgCharacter(duel, 0, 1, [0])).toBe(GcgActionResult.Done);
  });
});

describe("conqueror of Evil: Guardian Yaksha", () => {
  const CONQUEROR_OF_EVIL_ID = 215_041;
  const BANE_OF_ALL_EVIL: GcgSkill = {
    costs: [],
    effect: "Char_Skill_15043",
    energyGain: 2,
    id: 15_043,
    kind: GcgSkillKind.ElementalBurst,
  };
  const LEMNISCATIC_WIND_CYCLING: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Wind_3",
    energyGain: 1,
    id: 15_042,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("it equips to Xiao while she is active, and has her use Bane of All Evil at once", () => {
    expect.hasAssertions();

    const xiao = createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } });
    xiao.character.skills = [BANE_OF_ALL_EVIL];
    const context = { duel: createDuel([createSideState([xiao]), createSideState([])]), sideIndex: 0 };

    expect(conquerorOfEvilGuardianYaksha.canPlay?.(context, 0)).toBe(true);
    expect(conquerorOfEvilGuardianYaksha.skillOnPlay?.(context, 0)).toStrictEqual(BANE_OF_ALL_EVIL);
  });

  test("while Xiao has Yaksha's Mask, Lemniscatic Wind Cycling costs one Anemo die less, twice per attachment", () => {
    expect.hasAssertions();

    const xiao = {
      ...createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } }),
      statuses: [createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)],
    };
    const duel = createDuel([createSideState([xiao]), createSideState([])]);
    const context = { characterIndex: 0, duel, sideIndex: 0 };
    const zoneCard = createGcgZoneCard(CONQUEROR_OF_EVIL_ID, conquerorOfEvilGuardianYaksha);
    const subject = { costs: [], element: Element.Anemo, skill: LEMNISCATIC_WIND_CYCLING };
    const reduction = { count: 1, element: Element.Anemo };

    expect(conquerorOfEvilGuardianYaksha.reduceCost?.(context, subject, zoneCard)).toStrictEqual(reduction);
    conquerorOfEvilGuardianYaksha.onCostPaid?.(context, subject, zoneCard);
    expect(conquerorOfEvilGuardianYaksha.reduceCost?.(context, subject, zoneCard)).toStrictEqual(reduction);
    conquerorOfEvilGuardianYaksha.onCostPaid?.(context, subject, zoneCard);
    expect(conquerorOfEvilGuardianYaksha.reduceCost?.(context, subject, zoneCard)).toBeUndefined();
  });

  test("without Yaksha's Mask, or for any other skill, nothing is reduced", () => {
    expect.hasAssertions();

    const bare = createDuel([
      createSideState([createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const zoneCard = createGcgZoneCard(CONQUEROR_OF_EVIL_ID, conquerorOfEvilGuardianYaksha);
    expect(
      conquerorOfEvilGuardianYaksha.reduceCost?.(
        { characterIndex: 0, duel: bare, sideIndex: 0 },
        { costs: [], element: Element.Anemo, skill: LEMNISCATIC_WIND_CYCLING },
        zoneCard,
      ),
    ).toBeUndefined();

    const xiao = {
      ...createGcgCharacterState({ character: { id: XIAO_ID, element: Element.Cryo } }),
      statuses: [createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)],
    };
    const masked = createDuel([createSideState([xiao]), createSideState([])]);
    expect(
      conquerorOfEvilGuardianYaksha.reduceCost?.(
        { characterIndex: 0, duel: masked, sideIndex: 0 },
        { costs: [], element: Element.Anemo, skill: BANE_OF_ALL_EVIL },
        zoneCard,
      ),
    ).toBeUndefined();
  });
});

describe("lithic Spear", () => {
  const LITHIC_SPEAR_ID = 311_402;

  test("it deals 1 more DMG to its pole user", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createGcgCharacterState({
          character: { element: Element.Cryo, id: SHENHE_ID, nation: "LIYUE", weapon: "POLE" },
        }),
      ]),
      createSideState([]),
    ]);
    const zoneCard = createGcgZoneCard(LITHIC_SPEAR_ID, lithicSpear);

    expect(
      lithicSpear.modifyDamageDealt?.(
        { duel, sideIndex: 0 },
        { damageType: GcgDamageKind.Physical, value: 2 },
        zoneCard,
      ),
    ).toStrictEqual({ damageType: GcgDamageKind.Physical, value: 3 });
  });

  test("when played, it grants its wielder a Shield point for each Liyue party member", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createGcgCharacterState({
          character: { element: Element.Cryo, id: SHENHE_ID, nation: "LIYUE", weapon: "POLE" },
        }),
        createGcgCharacterState({
          character: { element: Element.Cryo, id: 1104, nation: "LIYUE", weapon: "CLAYMORE" },
        }),
        createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } }),
      ]),
      createSideState([]),
    ]);

    lithicSpear.play?.({ duel, sideIndex: 0 }, 0, undefined);
    expect(takeOne(duel.sides, 0).characters.map(({ shield }) => shield)).toStrictEqual([2, 0, 0]);
  });

  test("the shield it grants stops at the shield limit", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createGcgCharacterState({
          character: { element: Element.Cryo, id: SHENHE_ID, nation: "LIYUE", weapon: "POLE" },
        }),
        createGcgCharacterState({
          character: { element: Element.Cryo, id: 1104, nation: "LIYUE", weapon: "CLAYMORE" },
        }),
        createGcgCharacterState({ character: { element: Element.Cryo, id: 1504, nation: "LIYUE", weapon: "POLE" } }),
      ]),
      createSideState([]),
    ]);

    lithicSpear.play?.({ duel, sideIndex: 0 }, 0, undefined);
    expect(takeOne(takeOne(duel.sides, 0).characters, 0).shield).toBe(GCG_SHIELD_LIMIT);
  });
});

describe("vermillion Hereafter", () => {
  const TALENT_CARD = createTalentCard();
  const KABUKI: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Physic_2",
    energyGain: 1,
    id: 11_051,
    kind: GcgSkillKind.NormalAttack,
  };
  const HYOUKA: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Ice_3",
    energyGain: 1,
    id: 11_052,
    kind: GcgSkillKind.ElementalSkill,
  };
  const EVENT_CARD: GcgCard = { ...TALENT_CARD, id: 331_802, kind: GcgCardKind.Event };

  test("a Normal Attack spends one die less, once per Round", () => {
    expect.hasAssertions();

    const zoneCard = createGcgZoneCard(VERMILLION_HEREAFTER_ID, vermillionHereafter);
    const duel = createDuel([
      createSideState([
        { ...createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } }), equipments: [zoneCard] },
      ]),
      createSideState([]),
    ]);
    const context = { characterIndex: 0, duel, sideIndex: 0 };
    const subject = { costs: [], element: Element.Cryo, skill: KABUKI };

    expect(vermillionHereafter.reduceCost?.(context, subject, zoneCard)).toStrictEqual({ count: 1 });
    vermillionHereafter.onCostPaid?.(context, subject, zoneCard);
    expect(vermillionHereafter.reduceCost?.(context, subject, zoneCard)).toBeUndefined();
  });

  test("a Talent card spends one die less, while an Elemental Skill and other cards do not", () => {
    expect.hasAssertions();

    const zoneCard = createGcgZoneCard(VERMILLION_HEREAFTER_ID, vermillionHereafter);
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const context = { characterIndex: 0, duel, sideIndex: 0 };

    expect(
      vermillionHereafter.reduceCost?.(context, { card: TALENT_CARD, costs: [], element: Element.Cryo }, zoneCard),
    ).toStrictEqual({ count: 1 });
    expect(
      vermillionHereafter.reduceCost?.(context, { costs: [], element: Element.Cryo, skill: HYOUKA }, zoneCard),
    ).toBeUndefined();
    expect(
      vermillionHereafter.reduceCost?.(context, { card: EVENT_CARD, costs: [], element: Element.Cryo }, zoneCard),
    ).toBeUndefined();
  });

  test("after a character is switched to, she deals 1 more Normal Attack DMG this Round", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        {
          ...createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } }),
          equipments: [createGcgZoneCard(VERMILLION_HEREAFTER_ID, vermillionHereafter)],
        },
        createGcgCharacterState({ character: { id: 1504, element: Element.Cryo } }),
      ]),
      createSideState([createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } })]),
    ]);

    switchGcgActiveCharacter(duel, 0, 1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([7]);
  });
});

describe("stone and Contracts", () => {
  const DRAWN_CARD_ID = 213_011;

  test("when the next Action Phase begins, it creates 3 Omni dice and draws a card", () => {
    expect.hasAssertions();

    const side = createSideState([createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } })]);
    side.drawPile = [DRAWN_CARD_ID];
    const duel = createDuel([side, createSideState([])]);

    stoneAndContracts.play?.({ duel, sideIndex: 0 }, undefined);
    expect(side.onstages).toStrictEqual([createGcgZoneCard(STONE_AND_CONTRACTS_ID, stoneAndContracts)]);
    runGcgActionPhase(duel);
    expect(side.dice).toStrictEqual([GcgDieFace.Omni, GcgDieFace.Omni, GcgDieFace.Omni]);
    expect(side.hand).toStrictEqual([DRAWN_CARD_ID]);
    expect(side.onstages).toStrictEqual([]);
  });
});

describe("elemental Resonance: Shattering Ice", () => {
  const KABUKI: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Physic_2",
    energyGain: 1,
    id: 11_051,
    kind: GcgSkillKind.NormalAttack,
  };

  test("it can be played only with two Cryo characters on its side", () => {
    expect.hasAssertions();

    const one = createDuel([
      createSideState([createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } })]),
      createSideState([]),
    ]);
    const two = createDuel([
      createSideState([
        createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } }),
        createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } }),
      ]),
      createSideState([]),
    ]);

    expect(shatteringIce.canPlay?.({ duel: one, sideIndex: 0 }, undefined)).toBe(false);
    expect(shatteringIce.canPlay?.({ duel: two, sideIndex: 0 }, undefined)).toBe(true);
  });

  test("the active character deals 2 more DMG to her next instance, and no more", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([
        createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } }),
        createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } }),
      ]),
      createSideState([createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } })]),
    ]);

    shatteringIce.play?.({ duel, sideIndex: 0 }, undefined);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([4]);
  });
});

describe("liu Su", () => {
  test("after a switch to a character with no Energy, she gives that character 1 Energy, once per Round", () => {
    expect.hasAssertions();

    const side = createSideState([
      createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } }),
      createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } }),
    ]);
    side.supports.push(createGcgZoneCard(LIU_SU_ID, liuSu));
    const duel = createDuel([side, createSideState([])]);

    switchGcgActiveCharacter(duel, 0, 1);
    expect(side.characters.map(({ energy }) => energy)).toStrictEqual([0, 1]);
    switchGcgActiveCharacter(duel, 0, 0);
    expect(side.characters.map(({ energy }) => energy)).toStrictEqual([0, 1]);
    expect(takeOne(side.supports, 0).usages).toBe(1);
  });

  test("a character who has Energy keeps it, and the use is not spent", () => {
    expect.hasAssertions();

    const side = createSideState([
      createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } }),
      createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } }),
    ]);
    takeOne(side.characters, 1).energy = 2;
    side.supports.push(createGcgZoneCard(LIU_SU_ID, liuSu));
    const duel = createDuel([side, createSideState([])]);

    switchGcgActiveCharacter(duel, 0, 1);
    expect({
      energies: side.characters.map(({ energy }) => energy),
      usages: takeOne(side.supports, 0).usages,
    }).toStrictEqual({ energies: [0, 2], usages: 2 });
  });
});

describe("dunyarzad", () => {
  const TALENT_CARD = createTalentCard();
  const PLAIN_SUPPORT_ID = 321_001;

  test("a companion played spends one die less, once per Round, and a card that is not a companion spends none less", () => {
    expect.hasAssertions();

    const side = createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]);
    side.supports.push(createGcgZoneCard(DUNYARZAD_ID, dunyarzad));
    const zoneCard = takeOne(side.supports, 0);
    const context = { duel: createDuel([side, createSideState([])]), sideIndex: 0 };
    const companionSubject = { card: createCompanion(LIU_SU_ID), costs: [], element: Element.Cryo };

    expect(dunyarzad.reduceCost?.(context, companionSubject, zoneCard)).toStrictEqual({ count: 1 });
    dunyarzad.onCostPaid?.(context, companionSubject, zoneCard);
    expect(dunyarzad.reduceCost?.(context, companionSubject, zoneCard)).toBeUndefined();
    expect(
      dunyarzad.reduceCost?.(
        context,
        { card: { ...TALENT_CARD, kind: GcgCardKind.Support }, costs: [], element: Element.Cryo },
        zoneCard,
      ),
    ).toBeUndefined();
  });

  test("a companion played through the hand is paid for at one die less", () => {
    expect.hasAssertions();

    const side = createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]);
    side.supports.push(createGcgZoneCard(DUNYARZAD_ID, dunyarzad));
    side.cards.push({ ...createCompanion(LIU_SU_ID), costs: [{ count: 1, kind: GcgCostKind.Unaligned }] });
    side.hand.push(LIU_SU_ID);
    const duel = createDuel([side, createSideState([])]);

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(side.supports.map(({ cardId }) => cardId)).toStrictEqual([DUNYARZAD_ID, LIU_SU_ID]);
  });

  test("after a companion is played, it draws a random companion from the pile, once per match", () => {
    expect.hasAssertions();

    const side = createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]);
    side.supports.push(createGcgZoneCard(DUNYARZAD_ID, dunyarzad));
    side.cards.push({ ...TALENT_CARD, id: PLAIN_SUPPORT_ID, kind: GcgCardKind.Support }, createCompanion(RANA_ID), {
      ...createCompanion(LIU_SU_ID),
      costs: [{ count: 1, kind: GcgCostKind.Unaligned }],
    });
    side.drawPile.push(PLAIN_SUPPORT_ID, RANA_ID, LIU_SU_ID);
    side.hand.push(LIU_SU_ID, LIU_SU_ID);
    side.dice.push(Element.Cryo, Element.Cryo);
    const duel = createDuel([side, createSideState([])]);

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect({ drawPile: side.drawPile, hand: side.hand }).toStrictEqual({
      drawPile: [PLAIN_SUPPORT_ID, LIU_SU_ID],
      hand: [LIU_SU_ID, RANA_ID],
    });
    expect(playGcgCard(duel, 0, 0, undefined, [0])).toBe(GcgActionResult.Done);
    expect({ drawPile: side.drawPile, hand: side.hand }).toStrictEqual({
      drawPile: [PLAIN_SUPPORT_ID, LIU_SU_ID],
      hand: [RANA_ID],
    });
  });

  test("a second Dunyarzad does not draw again once one has spent the match's draw", () => {
    expect.hasAssertions();

    const side = createSideState([createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } })]);
    side.supports.push(
      { ...createGcgZoneCard(DUNYARZAD_ID, dunyarzad), counter: 0 },
      createGcgZoneCard(DUNYARZAD_ID, dunyarzad),
    );
    side.cards.push(createCompanion(RANA_ID));
    side.drawPile.push(RANA_ID);
    const duel = createDuel([side, createSideState([])]);

    dunyarzad.onCardPlayed?.({ duel, sideIndex: 0 }, createCompanion(LIU_SU_ID), takeOne(side.supports, 1));
    expect({
      counters: side.supports.map(({ counter }) => counter),
      drawPile: side.drawPile,
      hand: side.hand,
    }).toStrictEqual({ counters: [0, 1], drawPile: [RANA_ID], hand: [] });
  });
});

describe("rana", () => {
  const KABUKI: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Physic_2",
    energyGain: 1,
    id: 11_051,
    kind: GcgSkillKind.NormalAttack,
  };
  const HYOUKA: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Ice_3",
    energyGain: 1,
    id: 11_052,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("after an Elemental Skill, it creates a die of the next off-field character's element, once per Round", () => {
    expect.hasAssertions();

    const side = createSideState([
      createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } }),
      createGcgCharacterState({ character: { element: Element.Anemo, id: XIAO_ID } }),
    ]);
    side.supports.push(createGcgZoneCard(RANA_ID, rana));
    const duel = createDuel([
      side,
      createSideState([createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);
    expect(side.dice).toStrictEqual([Element.Anemo]);
    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);
    expect(side.dice).toStrictEqual([Element.Anemo]);
  });

  test("it skips a defeated character when it finds the next off-field one", () => {
    expect.hasAssertions();

    const side = createSideState([
      createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } }),
      { ...createGcgCharacterState({ character: { id: 1104, element: Element.Cryo } }), hp: 0 },
      createGcgCharacterState({ character: { element: Element.Anemo, id: XIAO_ID } }),
    ]);
    side.supports.push(createGcgZoneCard(RANA_ID, rana));
    const duel = createDuel([
      side,
      createSideState([createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);
    expect(side.dice).toStrictEqual([Element.Anemo]);
  });

  test("a Normal Attack, or an opponent's Elemental Skill, creates no die", () => {
    expect.hasAssertions();

    const side = createSideState([
      createGcgCharacterState({ character: { id: SHENHE_ID, element: Element.Cryo } }),
      createGcgCharacterState({ character: { element: Element.Anemo, id: XIAO_ID } }),
    ]);
    side.supports.push(createGcgZoneCard(RANA_ID, rana));
    const duel = createDuel([
      side,
      createSideState([createGcgCharacterState({ character: { id: 1202, element: Element.Cryo } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(side.dice).toStrictEqual([]);
    duel.actingSideIndex = 1;
    runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);
    expect(side.dice).toStrictEqual([]);
  });
});
