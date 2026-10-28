import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { adventurersBandana } from "#src/services/gcg/cards/adventurersBandana";
import { aquilaFavonia } from "#src/services/gcg/cards/aquilaFavonia";
import {
  ADVENTURERS_BANDANA_ID,
  AQUILA_FAVONIA_ID,
  CRYO_ELEMENTAL_INFUSION_ID,
  FROSTFLAKE_SEKI_NO_TO_ID,
  KANTEN_SENMYOU_BLESSING_ID,
  LEAVE_IT_TO_ME_ID,
  PARAMETRIC_TRANSFORMER_ID,
  SENHO_STATUS_ID,
  WAGNER_ID,
  YOIMIYA_ID,
} from "#src/services/gcg/cards/constants";
import { cryoElementalInfusion } from "#src/services/gcg/cards/cryoElementalInfusion";
import { frostflakeSekiNoTo } from "#src/services/gcg/cards/frostflakeSekiNoTo";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { kamisatoArtSenho } from "#src/services/gcg/cards/kamisatoArtSenho";
import { kamisatoArtSenhoSkill } from "#src/services/gcg/cards/kamisatoArtSenhoSkill";
import { kamisatoArtSoumetsu } from "#src/services/gcg/cards/kamisatoArtSoumetsu";
import { kantenSenmyouBlessing } from "#src/services/gcg/cards/kantenSenmyouBlessing";
import { parametricTransformer } from "#src/services/gcg/cards/parametricTransformer";
import { wagner } from "#src/services/gcg/cards/wagner";
import { GcgEffectDamageNameMap } from "#src/services/gcg/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { listGcgStartingStatuses } from "#src/services/gcg/effects/listGcgStartingStatuses";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { switchGcgActiveCharacter } from "#src/services/gcg/switchGcgActiveCharacter";
import { switchGcgCharacter } from "#src/services/gcg/switchGcgCharacter";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
// The name the game's shared damage effects spell an element or Physical DMG by, read off the parser's own name map
const findDamageEffectName = (damageType: Element | GcgDamageKind): string =>
  takeOne([...GcgEffectDamageNameMap].filter(([, mapped]) => mapped === damageType))[0];
// A shared damage effect dealing the count given of the damage type given, named the way the game names one
const createDamageEffect = (damageType: Element | GcgDamageKind, count: number): string =>
  `Effect_Damage_${findDamageEffectName(damageType)}_${count}`;
// The effect name the skill map keys a character skill's own script under, read off the map
const findSkillEffectName = (skillModule: GcgSkillModule): string =>
  takeOne([...GcgEffectNameSkillModuleMap].filter(([, mapped]) => mapped === skillModule))[0];

const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  deckCardIds: [],
  dice: [],
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
  cardModules: GcgCardIdModuleMap,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides,
  skillModules: GcgEffectNameSkillModuleMap,
  winnerSideIndex: undefined,
});

// A character of the given id, who wields the weapon kind named
const createWielder = (id: number, weapon: string): GcgCharacterState =>
  createGcgCharacterState({ character: { element: Element.Cryo, id, weapon } });

// Ayaka holds Senho from the battle's start, so she is the second character of the side
const createAyakaDuel = (): GcgDuel =>
  createDuel([
    createSideState([
      createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } }),
      {
        ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }),
        statuses: [createGcgZoneCard(SENHO_STATUS_ID, kamisatoArtSenho)],
      },
    ]),
    createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
  ]);

const createKantened = (statuses: GcgCharacterState["statuses"]): GcgCharacterState => ({
  ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }),
  equipments: [createGcgZoneCard(KANTEN_SENMYOU_BLESSING_ID, kantenSenmyouBlessing)],
  statuses,
});

// Xingqiu is active, and Ayaka, who has Kanten equipped, stands by with three Cryo dice to pay with
const createSwitchDuel = (): GcgDuel => {
  const duel = createDuel([
    createSideState([
      createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } }),
      {
        ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }),
        equipments: [createGcgZoneCard(KANTEN_SENMYOU_BLESSING_ID, kantenSenmyouBlessing)],
      },
    ]),
    createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
  ]);
  takeOne(duel.sides, 0).dice = [Element.Cryo, Element.Cryo, Element.Cryo];
  return duel;
};

// A weapon card that costs two Unaligned dice, which its Billets stand in for when they cover it
const createWeaponCard = (id: number, weapon: string): GcgCard => ({
  costs: [{ count: 2, kind: GcgCostKind.Unaligned }],
  descriptionTextId: 1,
  effects: [],
  id,
  isLocation: false,
  kind: GcgCardKind.Weapon,
  nameTextId: 1,
  weapon,
});

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
  // The hp a character starts at, and the damage and bonuses the skills and weapons below deal: each is a fixture
  // Input, and the hp the tests expect is derived from it
  const STARTING_HP = 10;
  const SOUMETSU_DAMAGE = 4;

  const SOUMETSU: GcgSkill = {
    costs: [],
    effect: findSkillEffectName(kamisatoArtSoumetsu),
    energyGain: 0,
    id: 4,
    kind: GcgSkillKind.ElementalBurst,
  };

  test("it deals 4 Cryo DMG and summons a Frostflake Seki no To", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } })]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, SOUMETSU);

    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([STARTING_HP - SOUMETSU_DAMAGE]);
    expect(takeOne(duel.sides, 0).summons.map(({ cardId }) => cardId)).toStrictEqual([FROSTFLAKE_SEKI_NO_TO_ID]);
  });

  test("a Frostflake Seki no To already on its side is refreshed rather than doubled", () => {
    expect.hasAssertions();
    const duel = createDuel([
      {
        ...createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } })]),
        summons: [{ ...createGcgZoneCard(FROSTFLAKE_SEKI_NO_TO_ID, frostflakeSekiNoTo), usages: 1 }],
      },
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, SOUMETSU);

    expect(takeOne(duel.sides, 0).summons.map(({ usages }) => usages)).toStrictEqual([2]);
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
  const STARTING_HP = 10;
  const KABUKI_DAMAGE = 2;
  // The skills' ids are synthetic, each only needing an id of its own that no other skill of the suite has
  const KABUKI: GcgSkill = {
    costs: [],
    effect: createDamageEffect(GcgDamageKind.Physical, KABUKI_DAMAGE),
    energyGain: 1,
    id: 1,
    kind: GcgSkillKind.NormalAttack,
  };
  const CRYO_INFUSION_BONUS = 1;

  const SENHO_PASSIVE: GcgSkill = {
    costs: [],
    effect: findSkillEffectName(kamisatoArtSenhoSkill),
    energyGain: 0,
    id: SENHO_STATUS_ID,
    kind: GcgSkillKind.Passive,
  };

  test("the passive is held from the battle's start", () => {
    expect.hasAssertions();
    const ayaka = {
      ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }).character,
      skills: [SENHO_PASSIVE],
    };

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
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([
      STARTING_HP - KABUKI_DAMAGE - CRYO_INFUSION_BONUS,
    ]);
  });

  test("it triggers twice per Round, so a third switch in the Round gives no further bonus", () => {
    expect.hasAssertions();
    const duel = createAyakaDuel();
    const switchTo = (characterIndex: number) => {
      switchGcgActiveCharacter(duel, 0, characterIndex);
    };

    switchTo(1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    switchTo(0);
    switchTo(1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    switchTo(0);
    switchTo(1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    // The first two casts after a switch carry the infusion's bonus, and the third, past the two triggers, does not
    expect(takeOne(duel.sides, 1).characters.map(({ hp }) => hp)).toStrictEqual([
      STARTING_HP - 2 * (KABUKI_DAMAGE + CRYO_INFUSION_BONUS) - KABUKI_DAMAGE,
    ]);
  });

  test("a second switch to her in the Round refreshes the infusion she holds rather than adding one", () => {
    expect.hasAssertions();
    const duel = createAyakaDuel();
    const switchTo = (characterIndex: number) => {
      switchGcgActiveCharacter(duel, 0, characterIndex);
    };

    switchTo(1);
    // The infusion's rounds are spent, so only the refresh brings them back
    takeOne(takeOne(takeOne(duel.sides, 0).characters, 1).statuses, 1).rounds = 0;
    switchTo(0);
    switchTo(1);

    expect(takeOne(takeOne(duel.sides, 0).characters, 1).statuses).toStrictEqual([
      { cardId: SENHO_STATUS_ID, counter: 0, rounds: 0, usages: 1 },
      { cardId: CRYO_ELEMENTAL_INFUSION_ID, counter: 0, rounds: 1, usages: 0 },
    ]);
  });
});

describe("the skills whose damage is parsed from their effect name", () => {
  const STARTING_HP = 10;
  const KABUKI_DAMAGE = 2;
  const HYOUKA_DAMAGE = 3;
  const FLARE_UP_DAMAGE = 2;
  const KABUKI: GcgSkill = {
    costs: [],
    effect: createDamageEffect(GcgDamageKind.Physical, KABUKI_DAMAGE),
    energyGain: 1,
    id: 1,
    kind: GcgSkillKind.NormalAttack,
  };
  const HYOUKA: GcgSkill = {
    costs: [],
    effect: createDamageEffect(Element.Cryo, HYOUKA_DAMAGE),
    energyGain: 1,
    id: 2,
    kind: GcgSkillKind.ElementalSkill,
  };
  const FIREWORK_FLARE_UP: GcgSkill = {
    costs: [],
    effect: createDamageEffect(GcgDamageKind.Physical, FLARE_UP_DAMAGE),
    energyGain: 1,
    id: 3,
    kind: GcgSkillKind.NormalAttack,
  };

  test("kamisato Art: Kabuki deals 2 Physical DMG, with no aura", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } })]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 1).characters[0]?.aura).toBe(GcgAura.None);
    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(STARTING_HP - KABUKI_DAMAGE);
  });

  test("kamisato Art: Hyouka deals 3 Cryo DMG, which applies the Cryo aura", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } })]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);

    expect(takeOne(duel.sides, 1).characters[0]?.aura).toBe(Element.Cryo);
    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(STARTING_HP - HYOUKA_DAMAGE);
  });

  test("firework Flare-Up deals 2 Physical DMG for Yoimiya", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: YOIMIYA_ID } })]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, FIREWORK_FLARE_UP);

    expect(takeOne(duel.sides, 1).characters[0]?.aura).toBe(GcgAura.None);
    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(STARTING_HP - FLARE_UP_DAMAGE);
  });
});

describe("adventurer's Bandana", () => {
  // The hp a character is wounded to, so a heal has room to land, and the heals the two weapons below give
  const WOUNDED_HP = 5;
  const KABUKI_DAMAGE = 2;
  const HYOUKA_DAMAGE = 3;
  const KABUKI: GcgSkill = {
    costs: [],
    effect: createDamageEffect(GcgDamageKind.Physical, KABUKI_DAMAGE),
    energyGain: 1,
    id: 1,
    kind: GcgSkillKind.NormalAttack,
  };
  const HYOUKA: GcgSkill = {
    costs: [],
    effect: createDamageEffect(Element.Cryo, HYOUKA_DAMAGE),
    energyGain: 1,
    id: 2,
    kind: GcgSkillKind.ElementalSkill,
  };
  const BANDANA_HEAL = 1;
  const BANDANA_HEALS_PER_ROUND = 3;

  test("after its character uses a Normal Attack, it heals that character 1 HP, up to three times per Round", () => {
    expect.hasAssertions();
    const bandanaed = {
      ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }),
      equipments: [createGcgZoneCard(ADVENTURERS_BANDANA_ID, adventurersBandana)],
      hp: WOUNDED_HP,
    };
    const duel = createDuel([
      createSideState([bandanaed]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    for (let use = 0; use < 4; use++) runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBe(WOUNDED_HP + BANDANA_HEAL * BANDANA_HEALS_PER_ROUND);
  });

  test("a skill that is not a Normal Attack does not heal", () => {
    expect.hasAssertions();
    const bandanaed = {
      ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }),
      equipments: [createGcgZoneCard(ADVENTURERS_BANDANA_ID, adventurersBandana)],
      hp: WOUNDED_HP,
    };
    const duel = createDuel([
      createSideState([bandanaed]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);

    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBe(WOUNDED_HP);
  });
});

describe("aquila Favonia", () => {
  const STARTING_HP = 10;
  const KABUKI_DAMAGE = 2;
  const HYOUKA_DAMAGE = 3;
  const WOUNDED_HP = 5;
  const KABUKI: GcgSkill = {
    costs: [],
    effect: createDamageEffect(GcgDamageKind.Physical, KABUKI_DAMAGE),
    energyGain: 1,
    id: 1,
    kind: GcgSkillKind.NormalAttack,
  };
  const HYOUKA: GcgSkill = {
    costs: [],
    effect: createDamageEffect(Element.Cryo, HYOUKA_DAMAGE),
    energyGain: 1,
    id: 2,
    kind: GcgSkillKind.ElementalSkill,
  };
  const AQUILA_BONUS = 1;
  const AQUILA_HEAL = 1;
  const AQUILA_HEALS_PER_ROUND = 2;

  const AQUILA_FAVONIA_CARD: GcgCard = {
    costs: [],
    descriptionTextId: 1,
    effects: [],
    id: AQUILA_FAVONIA_ID,
    isLocation: false,
    kind: GcgCardKind.Weapon,
    nameTextId: 1,
    weapon: "SWORD",
  };

  test("it is equipped on a character who wields a sword", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createWielder(1, "SWORD")]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);
    takeOne(duel.sides, 0).hand = [AQUILA_FAVONIA_ID];
    takeOne(duel.sides, 0).cards = [AQUILA_FAVONIA_CARD];

    expect(playGcgCard(duel, 0, 0, 0, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).characters[0]?.equipments.map(({ cardId }) => cardId)).toStrictEqual([
      AQUILA_FAVONIA_ID,
    ]);
  });

  test("it is refused on a character who does not wield a sword", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createWielder(YOIMIYA_ID, "BOW")]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);
    takeOne(duel.sides, 0).hand = [AQUILA_FAVONIA_ID];
    takeOne(duel.sides, 0).cards = [AQUILA_FAVONIA_CARD];

    expect(playGcgCard(duel, 0, 0, 0, [])).toBe(GcgActionResult.Unavailable);
    expect(takeOne(duel.sides, 0).characters[0]?.equipments).toStrictEqual([]);
  });

  test("the character it is attached to deals 1 more DMG", () => {
    expect.hasAssertions();
    const weaponed = {
      ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }),
      equipments: [createGcgZoneCard(AQUILA_FAVONIA_ID, aquilaFavonia)],
    };
    const duel = createDuel([
      createSideState([weaponed]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(STARTING_HP - KABUKI_DAMAGE - AQUILA_BONUS);
  });

  test("after the opposing character uses a Skill while this character is active, it heals 1 HP, up to twice per Round", () => {
    expect.hasAssertions();
    const weaponed = {
      ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }),
      equipments: [createGcgZoneCard(AQUILA_FAVONIA_ID, aquilaFavonia)],
    };
    const duel = createDuel([
      createSideState([weaponed]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);
    duel.actingSideIndex = 1;

    for (let use = 0; use < 3; use++) runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);

    // Each Hyouka deals 3 Cryo DMG, and the first two are each followed by a heal of 1 HP, the third by none
    expect(takeOne(duel.sides, 0).characters[0]?.hp).toBe(
      STARTING_HP - 3 * HYOUKA_DAMAGE + AQUILA_HEAL * AQUILA_HEALS_PER_ROUND,
    );
  });

  test("it does not heal while its character is on standby", () => {
    expect.hasAssertions();
    const weaponed = {
      ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }),
      equipments: [createGcgZoneCard(AQUILA_FAVONIA_ID, aquilaFavonia)],
      hp: WOUNDED_HP,
    };
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } }), weaponed]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);
    duel.actingSideIndex = 1;

    runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);

    expect(takeOne(duel.sides, 0).characters[1]?.hp).toBe(WOUNDED_HP);
  });
});

describe("parametric Transformer", () => {
  const HYOUKA_DAMAGE = 3;
  const FLARE_UP_DAMAGE = 2;
  const HYOUKA: GcgSkill = {
    costs: [],
    effect: createDamageEffect(Element.Cryo, HYOUKA_DAMAGE),
    energyGain: 1,
    id: 2,
    kind: GcgSkillKind.ElementalSkill,
  };
  const FIREWORK_FLARE_UP: GcgSkill = {
    costs: [],
    effect: createDamageEffect(GcgDamageKind.Physical, FLARE_UP_DAMAGE),
    energyGain: 1,
    id: 3,
    kind: GcgSkillKind.NormalAttack,
  };

  test("it gains 1 Qualitative Progress when either side's Skill deals Elemental DMG, and not for Physical DMG", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } })]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
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
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } })]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);
    duel.sides[0].supports.push(createGcgZoneCard(PARAMETRIC_TRANSFORMER_ID, parametricTransformer));
    duel.actingSideIndex = 1;

    for (let use = 0; use < 3; use++) runGcgSkillUse({ duel, sideIndex: 1 }, HYOUKA);

    expect(takeOne(duel.sides, 0).supports).toStrictEqual([]);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Pyro, Element.Hydro, Element.Anemo]);
  });
});

describe("kanten Senmyou Blessing", () => {
  const STARTING_HP = 10;
  const KABUKI_DAMAGE = 2;
  const HYOUKA_DAMAGE = 3;
  const KABUKI: GcgSkill = {
    costs: [],
    effect: createDamageEffect(GcgDamageKind.Physical, KABUKI_DAMAGE),
    energyGain: 1,
    id: 1,
    kind: GcgSkillKind.NormalAttack,
  };
  const HYOUKA: GcgSkill = {
    costs: [],
    effect: createDamageEffect(Element.Cryo, HYOUKA_DAMAGE),
    energyGain: 1,
    id: 2,
    kind: GcgSkillKind.ElementalSkill,
  };
  const KANTEN_BONUS = 1;

  const INFUSED = [createGcgZoneCard(CRYO_ELEMENTAL_INFUSION_ID, cryoElementalInfusion)];

  test("while Ayaka holds Cryo Elemental Infusion, her Physical DMG, dealt as Cryo, is 1 more", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createKantened(INFUSED)]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 1).characters[0]?.aura).toBe(Element.Cryo);
    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(STARTING_HP - KABUKI_DAMAGE - KANTEN_BONUS);
  });

  test("while Ayaka holds Cryo Elemental Infusion, her Cryo DMG is 1 more", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createKantened(INFUSED)]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, HYOUKA);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(STARTING_HP - HYOUKA_DAMAGE - KANTEN_BONUS);
  });

  test("without the infusion, Ayaka's DMG is unchanged", () => {
    expect.hasAssertions();
    const duel = createDuel([
      createSideState([createKantened([])]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);

    expect(takeOne(duel.sides, 1).characters[0]?.hp).toBe(STARTING_HP - KABUKI_DAMAGE);
  });
});

describe("kanten Senmyou Blessing's switch clause", () => {
  test("a switch to Ayaka, who has it equipped, spends one die less", () => {
    expect.hasAssertions();
    const duel = createSwitchDuel();

    expect(switchGcgCharacter(duel, 0, 1, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).activeIndex).toBe(1);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([Element.Cryo, Element.Cryo, Element.Cryo]);
  });

  test("a switch away from Ayaka gets no reduction", () => {
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

describe("wagner", () => {
  // The claymore and the bow only need ids of their own, so they are synthetic
  const CLAYMORE_ID = 2;
  const BOW_ID = 3;
  const WAGNER_CARD: GcgCard = {
    costs: [],
    descriptionTextId: 1,
    effects: [],
    id: WAGNER_ID,
    isLocation: false,
    kind: GcgCardKind.Support,
    nameTextId: 1,
  };
  const EVENT_CARD: GcgCard = {
    costs: [],
    descriptionTextId: 1,
    effects: [],
    id: LEAVE_IT_TO_ME_ID,
    isLocation: false,
    kind: GcgCardKind.Event,
    nameTextId: 1,
  };
  const createWagnerDuel = (billets: number, deckWeapons: GcgCard[]): GcgDuel => {
    const duel = createDuel([
      createSideState([createWielder(1, "SWORD"), createWielder(2, "SWORD")]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } })]),
    ]);
    const side = takeOne(duel.sides, 0);
    const wagnerZoneCard = createGcgZoneCard(WAGNER_ID, wagner);
    wagnerZoneCard.counter = billets;
    side.supports.push(wagnerZoneCard);
    side.deckCardIds = deckWeapons.map(({ id }) => id);
    side.cards = [WAGNER_CARD, EVENT_CARD, ...deckWeapons];
    return duel;
  };

  test("it comes with 2 Forging Billets", () => {
    expect.hasAssertions();
    expect(createGcgZoneCard(WAGNER_ID, wagner).counter).toBe(2);
  });

  test("at each End Phase it gains a Forging Billet", () => {
    expect.hasAssertions();
    const duel = createWagnerDuel(2, []);
    const zoneCard = takeOne(duel.sides, 0).supports[0];
    if (!zoneCard) throw new Error("Wagner is not on the field");

    expect(wagner.onEndPhase?.({ duel, sideIndex: 0 }, zoneCard)).toBeUndefined();
    expect(zoneCard.counter).toBe(3);
  });

  test("a Weapon card is played free for its cost in Billets, once per Round", () => {
    expect.hasAssertions();
    const duel = createWagnerDuel(3, [createWeaponCard(AQUILA_FAVONIA_ID, "SWORD")]);
    takeOne(duel.sides, 0).hand = [AQUILA_FAVONIA_ID, AQUILA_FAVONIA_ID];

    expect(playGcgCard(duel, 0, 0, 0, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).supports[0]?.counter).toBe(1);

    takeOne(takeOne(duel.sides, 0).supports, 0).counter = 2;
    duel.actingSideIndex = 0;
    expect(playGcgCard(duel, 0, 0, 1, [])).toBe(GcgActionResult.Unpayable);
  });

  test("a Weapon card its Billets do not cover is paid in dice", () => {
    expect.hasAssertions();
    const duel = createWagnerDuel(1, [createWeaponCard(AQUILA_FAVONIA_ID, "SWORD")]);
    takeOne(duel.sides, 0).hand = [AQUILA_FAVONIA_ID];
    takeOne(duel.sides, 0).dice = [Element.Cryo, Element.Cryo];

    expect(playGcgCard(duel, 0, 0, 0, [0, 1])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).dice).toStrictEqual([]);
    expect(takeOne(duel.sides, 0).supports.map(({ counter }) => counter)).toStrictEqual([1]);
  });

  test("with three Weapon kinds in its deck, playing it draws a random Weapon card from the draw pile", () => {
    expect.hasAssertions();
    const duel = createWagnerDuel(2, [
      createWeaponCard(AQUILA_FAVONIA_ID, "SWORD"),
      createWeaponCard(CLAYMORE_ID, "CLAYMORE"),
      createWeaponCard(BOW_ID, "BOW"),
    ]);
    takeOne(duel.sides, 0).supports = [];
    takeOne(duel.sides, 0).hand = [WAGNER_ID];
    takeOne(duel.sides, 0).drawPile = [LEAVE_IT_TO_ME_ID, BOW_ID];

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).drawPile).toStrictEqual([LEAVE_IT_TO_ME_ID]);
    expect(takeOne(duel.sides, 0).hand).toStrictEqual([BOW_ID]);
  });

  test("with two Weapon kinds in its deck, nothing is drawn", () => {
    expect.hasAssertions();
    const duel = createWagnerDuel(2, [
      createWeaponCard(AQUILA_FAVONIA_ID, "SWORD"),
      createWeaponCard(CLAYMORE_ID, "CLAYMORE"),
    ]);
    takeOne(duel.sides, 0).supports = [];
    takeOne(duel.sides, 0).hand = [WAGNER_ID];
    takeOne(duel.sides, 0).drawPile = [BOW_ID];

    expect(playGcgCard(duel, 0, 0, undefined, [])).toBe(GcgActionResult.Done);
    expect(takeOne(duel.sides, 0).drawPile).toStrictEqual([BOW_ID]);
    expect(takeOne(duel.sides, 0).hand).toStrictEqual([]);
  });
});
