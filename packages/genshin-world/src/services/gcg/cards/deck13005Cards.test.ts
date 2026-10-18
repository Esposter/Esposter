import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { adventurersBandana, ADVENTURERS_BANDANA_ID } from "#src/services/gcg/cards/adventurersBandana";
import { aquilaFavonia, AQUILA_FAVONIA_ID } from "#src/services/gcg/cards/aquilaFavonia";
import { CRYO_ELEMENTAL_INFUSION_ID, cryoElementalInfusion } from "#src/services/gcg/cards/cryoElementalInfusion";
import { parametricTransformer, PARAMETRIC_TRANSFORMER_ID } from "#src/services/gcg/cards/parametricTransformer";
import { FROSTFLAKE_SEKI_NO_TO_ID, frostflakeSekiNoTo } from "#src/services/gcg/cards/frostflakeSekiNoTo";
import { kamisatoArtSenho, SENHO_STATUS_ID } from "#src/services/gcg/cards/kamisatoArtSenho";
import { kamisatoArtSenhoSkill } from "#src/services/gcg/cards/kamisatoArtSenhoSkill";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { listGcgStartingStatuses } from "#src/services/gcg/effects/listGcgStartingStatuses";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { switchGcgActiveCharacter } from "#src/services/gcg/switchGcgActiveCharacter";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

const createCharacterState = (id: number): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Cryo,
    hp: 10,
    id,
    maxEnergy: 3,
    nameTextId: 1,
    skills: [],
    weapon: "",
  },
  energy: 0,
  equipments: [],
  hp: 10,
  isFrozen: false,
  shield: 0,
  statuses: [],
});

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
const FIREWORK_FLARE_UP: GcgSkill = {
  costs: [],
  effect: "Effect_Damage_Physic_2",
  energyGain: 1,
  id: 13_051,
  kind: GcgSkillKind.NormalAttack,
};

describe("frostflake Seki no To", () => {
  test("it deals 2 Cryo DMG at each End Phase, for two usages", () => {
    expect.hasAssertions();
    const context = { duel: createDuel([createSideState([]), createSideState([])]), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(FROSTFLAKE_SEKI_NO_TO_ID, frostflakeSekiNoTo);
    expect(frostflakeSekiNoTo.onEndPhase?.(context, zoneCard)).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    expect(zoneCard.usages).toBe(1);
    expect(frostflakeSekiNoTo.onEndPhase?.(context, zoneCard)).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    expect(zoneCard.usages).toBe(0);
  });
});

describe("kamisato Art: Soumetsu", () => {
  const SOUMETSU: GcgSkill = {
    costs: [],
    effect: "Char_Skill_11053",
    energyGain: 0,
    id: 11_053,
    kind: GcgSkillKind.ElementalBurst,
  };

  test("it deals 4 Cryo DMG and summons a Frostflake Seki no To", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(1105)]),
      createSideState([createCharacterState(1202)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, SOUMETSU);

    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([6]);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([FROSTFLAKE_SEKI_NO_TO_ID]);
  });
});

describe("cryo Elemental Infusion", () => {
  test("it converts its character's Physical DMG to Cryo DMG, and lasts until the Round ends", () => {
    expect.hasAssertions();
    const context = { duel: createDuel([createSideState([]), createSideState([])]), sideIndex: 0 };
    const zoneCard = createGcgZoneCard(CRYO_ELEMENTAL_INFUSION_ID, cryoElementalInfusion);

    expect(
      cryoElementalInfusion.modifyDamageDealt?.(context, { damageType: GcgDamageKind.Physical, value: 2 }, zoneCard),
    ).toStrictEqual({ damageType: Element.Cryo, value: 2 });
    expect(zoneCard.rounds).toBe(1);
  });
});

describe("kamisato Art: Senho", () => {
  const SENHO_PASSIVE: GcgSkill = {
    costs: [],
    effect: "Char_Skill_11054",
    energyGain: 0,
    id: 11_054,
    kind: GcgSkillKind.Passive,
  };
  // Ayaka holds Senho from the battle's start, so she is the second character of the side
  const createAyakaDuel = (): GcgDuel =>
    createDuel([
      createSideState([
        createCharacterState(1202),
        { ...createCharacterState(1105), statuses: [createGcgZoneCard(SENHO_STATUS_ID, kamisatoArtSenho)] },
      ]),
      createSideState([createCharacterState(1202)]),
    ]);

  test("the passive is held from the battle's start", () => {
    expect.hasAssertions();
    const ayaka = { ...createCharacterState(1105).character, skills: [SENHO_PASSIVE] };

    expect(listGcgStartingStatuses(ayaka).map(({ cardId }) => cardId)).toStrictEqual([SENHO_STATUS_ID]);
    expect(kamisatoArtSenhoSkill.getStartingStatuses?.()).toHaveLength(1);
  });

  test("when switched to, Ayaka gains Cryo Elemental Infusion, and her next Normal Attack deals 1 more DMG", () => {
    expect.hasAssertions();
    const duel = createAyakaDuel();

    switchGcgActiveCharacter(duel, 0, 1);
    expect(takeOne(duel.sides, 0).characters[1]?.statuses.map(({ cardId }) => cardId)).toStrictEqual([
      SENHO_STATUS_ID,
      CRYO_ELEMENTAL_INFUSION_ID,
    ]);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([7]);
  });

  test("it triggers twice per Round, so a third switch in the Round gives no further bonus", () => {
    expect.hasAssertions();
    const duel = createAyakaDuel();
    const switchTo = (characterIndex: number) => switchGcgActiveCharacter(duel, 0, characterIndex);

    switchTo(1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    switchTo(0);
    switchTo(1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    switchTo(0);
    switchTo(1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([2]);
  });
});

describe("the skills whose damage is parsed from the dump's effect", () => {
  test("kamisato Art: Kabuki deals 2 Physical DMG, with no aura", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(1105)]),
      createSideState([createCharacterState(1202)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 1).characters[0]).toMatchObject({ aura: GcgAura.None, hp: 8 });
  });

  test("kamisato Art: Hyouka deals 3 Cryo DMG, which applies the Cryo aura", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(1105)]),
      createSideState([createCharacterState(1202)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);

    expect(takeOne(duel.sides, 1).characters[0]).toMatchObject({ aura: Element.Cryo, hp: 7 });
  });

  test("firework Flare-Up deals 2 Physical DMG for Yoimiya", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(1305)]),
      createSideState([createCharacterState(1202)]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, FIREWORK_FLARE_UP);

    expect(takeOne(duel.sides, 1).characters[0]).toMatchObject({ aura: GcgAura.None, hp: 8 });
  });
});

describe("adventurer's Bandana", () => {
  test("after its character uses a Normal Attack, it heals that character 1 HP, up to three times per Round", () => {
    expect.hasAssertions();
    const bandanaed = {
      ...createCharacterState(1105),
      equipments: [createGcgZoneCard(ADVENTURERS_BANDANA_ID, adventurersBandana)],
      hp: 5,
    };
    const duel = createDuel([createSideState([bandanaed]), createSideState([createCharacterState(1202)])]);

    for (let use = 0; use < 4; use++) runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBe(8);
  });

  test("a skill that is not a Normal Attack does not heal", () => {
    expect.hasAssertions();
    const bandanaed = {
      ...createCharacterState(1105),
      equipments: [createGcgZoneCard(ADVENTURERS_BANDANA_ID, adventurersBandana)],
      hp: 5,
    };
    const duel = createDuel([createSideState([bandanaed]), createSideState([createCharacterState(1202)])]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);

    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBe(5);
  });
});

describe("aquila Favonia", () => {
  test("the character it is attached to deals 1 more DMG", () => {
    expect.hasAssertions();
    const weaponed = {
      ...createCharacterState(1105),
      equipments: [createGcgZoneCard(AQUILA_FAVONIA_ID, aquilaFavonia)],
    };
    const duel = createDuel([createSideState([weaponed]), createSideState([createCharacterState(1202)])]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(7);
  });

  test("after the opposing character uses a Skill while this character is active, it heals 1 HP, up to twice per Round", () => {
    expect.hasAssertions();
    const weaponed = {
      ...createCharacterState(1105),
      equipments: [createGcgZoneCard(AQUILA_FAVONIA_ID, aquilaFavonia)],
    };
    const duel = createDuel([createSideState([weaponed]), createSideState([createCharacterState(1202)])]);
    duel.actingSideIndex = 1;

    for (let use = 0; use < 3; use++) runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);

    // Each Hyouka deals 3 Cryo DMG, and the first two are each followed by a heal of 1 HP, the third by none
    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBe(3);
  });

  test("it does not heal while its character is on standby", () => {
    expect.hasAssertions();
    const weaponed = {
      ...createCharacterState(1105),
      equipments: [createGcgZoneCard(AQUILA_FAVONIA_ID, aquilaFavonia)],
      hp: 5,
    };
    const duel = createDuel([
      createSideState([createCharacterState(1202), weaponed]),
      createSideState([createCharacterState(1202)]),
    ]);
    duel.actingSideIndex = 1;

    runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);

    expect(takeOne(duel.sides, 0).characters[1]?.hp).toBe(5);
  });
});

describe("parametric Transformer", () => {
  test("it gains 1 Qualitative Progress when either side's Skill deals Elemental DMG, and not for Physical DMG", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(1105)]),
      createSideState([createCharacterState(1202)]),
    ]);
    duel.sides[0].supports.push(createGcgZoneCard(PARAMETRIC_TRANSFORMER_ID, parametricTransformer));
    duel.actingSideIndex = 1;

    runGcgSkillUse({ duel, sideIndex: 1 }, FIREWORK_FLARE_UP);
    expect(takeOne(duel.sides, 0).supports[0]?.counter).toBe(0);

    runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);
    expect(takeOne(duel.sides, 0).supports[0]?.counter).toBe(1);
  });

  test("at three Qualitative Progress it is discarded, and creates three different Basic Elemental Dice", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createCharacterState(1105)]),
      createSideState([createCharacterState(1202)]),
    ]);
    duel.sides[0].supports.push(createGcgZoneCard(PARAMETRIC_TRANSFORMER_ID, parametricTransformer));
    duel.actingSideIndex = 1;

    for (let use = 0; use < 3; use++) runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);

    expect(takeOne(duel.sides, 0).supports).toStrictEqual([]);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Pyro, Element.Hydro, Element.Anemo]);
  });
});
