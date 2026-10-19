import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { yakshasMask } from "#src/services/gcg/cards/yakshasMask";
import { YAKSHAS_MASK_ID, XIAO_ID } from "#src/services/gcg/cards/constants";
import { GCG_ROUND_LIMIT } from "#src/services/gcg/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { endGcgRound } from "#src/services/gcg/endGcgRound";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { switchGcgActiveCharacter } from "#src/services/gcg/switchGcgActiveCharacter";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { afterEach, describe, expect, test, vi } from "vitest";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

describe("a skill's on-use hooks", () => {
  const SEED = 9;
  const OCEANID_DECK_ID = 2;
  const TUTORIAL_DECK_ID = 1;
  const PYRONADO_SKILL_ID = 13_023;
  const XIANGLING_INDEX = 1;
  const DILUC_INDEX = 0;
  // Diluc at 10 HP, less the skill's 3 Pyro DMG and no more: the Pyronado it creates hears only the skills after it
  const DILUC_HP_AFTER_PYRONADO = 7;

  // A duel of the Oceanid deck against the tutorial deck, both sides prepared and rolled, the first side holding the given dice
  const openDuel = async (dice: Element[]): Promise<GcgDuel> => {
    const random = createSeededRandom(SEED);
    const duel = createGcgDuel(
      [
        await readGcgDeck(GAME_DATA_LOCAL_BASE_URL, OCEANID_DECK_ID),
        await readGcgDeck(GAME_DATA_LOCAL_BASE_URL, TUTORIAL_DECK_ID),
      ],
      random,
      await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL),
    );
    for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0);
    for (const sideIndex of [0, 1]) rerollGcgDice(duel, sideIndex, []);
    takeOne(duel.sides, 0).dice = dice;
    return duel;
  };

  test("should not make the Pyronado a skill creates deal its own damage on the same use", async () => {
    expect.hasAssertions();

    const duel = await openDuel([Element.Pyro, Element.Pyro, Element.Pyro, Element.Pyro]);
    takeOne(duel.sides, 0).activeIndex = XIANGLING_INDEX;
    takeOne(takeOne(duel.sides, 0).characters, XIANGLING_INDEX).energy = 2;
    const result = useGcgSkill(duel, 0, PYRONADO_SKILL_ID, [0, 1, 2, 3]);

    expect({
      defenderHp: takeOne(takeOne(duel.sides, 1).characters, DILUC_INDEX).hp,
      onstages: takeOne(duel.sides, 0).onstages.map(({ cardId }) => cardId),
      result,
    }).toStrictEqual({ defenderHp: DILUC_HP_AFTER_PYRONADO, onstages: [113_022], result: GcgActionResult.Done });
  });
});

const createSide = (characters: GcgCharacterState[] = [createGcgCharacterState()], activeIndex = 0): GcgSideState => ({
  activeIndex,
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

const createDuel = (
  sides: [GcgSideState, GcgSideState] = [createSide(), createSide()],
  rule: GcgRule = { drawCount: 2, handCardLimit: 10, reactions: [] },
): GcgDuel => ({
  cardModules: GcgCardIdModuleMap,
  skillModules: GcgEffectNameSkillModuleMap,
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule,
  sides,
});

describe("a skill's any-side hooks", () => {
  const SKILL_ID = 990_101;
  const SUPPORT_ID = 990_201;
  const DAMAGE_SKILL: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Fire_2",
    energyGain: 0,
    id: SKILL_ID,
    kind: GcgSkillKind.ElementalSkill,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should let a card on the opposing side hear the skill, with its own side in the context", () => {
    expect.hasAssertions();
    const onAnySkillUsed = vi.fn<NonNullable<GcgCardModule["onAnySkillUsed"]>>();
    vi.spyOn(GcgCardIdModuleMap, "get").mockImplementation((cardId) =>
      cardId === SUPPORT_ID ? { onAnySkillUsed } : undefined,
    );
    const duel = createDuel();
    const supportZoneCard = { cardId: SUPPORT_ID, counter: 0, rounds: 0, usages: 0 };
    takeOne(duel.sides, 1).supports.push(supportZoneCard);
    expect(runGcgSkillUse({ duel, sideIndex: 0 }, DAMAGE_SKILL)).toBe(true);
    expect(onAnySkillUsed.mock.calls).toStrictEqual([
      [
        { characterIndex: undefined, duel, isPlunge: false, sideIndex: 1, skill: DAMAGE_SKILL, userSideIndex: 0 },
        DAMAGE_SKILL,
        supportZoneCard,
        [{ damageType: Element.Pyro }],
      ],
    ]);
  });

  test("should prune a card that an opposing side's skill spends, from the side it is on", () => {
    expect.hasAssertions();
    vi.spyOn(GcgCardIdModuleMap, "get").mockImplementation((cardId) =>
      cardId === SUPPORT_ID
        ? {
            initialUsages: 1,
            onAnySkillUsed: (_context, _skill, zoneCard) => {
              zoneCard.usages = 0;
            },
          }
        : undefined,
    );
    const duel = createDuel();
    takeOne(duel.sides, 1).supports.push({ cardId: SUPPORT_ID, counter: 0, rounds: 0, usages: 1 });
    expect(runGcgSkillUse({ duel, sideIndex: 0 }, DAMAGE_SKILL)).toBe(true);
    expect(takeOne(duel.sides, 1).supports).toStrictEqual([]);
  });
});

const PLUNGE_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const createMaskedXiao = () =>
  createGcgCharacterState({ character: { id: XIAO_ID }, statuses: [createGcgZoneCard(YAKSHAS_MASK_ID, yakshasMask)] });

// Xiao with Yaksha's Mask: a Physical hit of 2 is dealt as 3 Anemo, and a Plunging Attack's hit 2 more
const readHp = (duel: GcgDuel) => takeOne(duel.sides, 1).characters.map(({ hp }) => hp);

describe("a Plunging Attack", () => {
  const CHONGYUN_ID = 1104;
  const KABUKI: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Physic_2",
    energyGain: 1,
    id: 11_051,
    kind: GcgSkillKind.NormalAttack,
  };
  const ELEMENTAL_SKILL: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Physic_2",
    energyGain: 1,
    id: 11_052,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("a Normal Attack by a character switched in this Round is a Plunging Attack, which the mask adds 2 DMG to", () => {
    expect.hasAssertions();

    const duel = createDuel(
      [
        createSide([createGcgCharacterState({ character: { id: CHONGYUN_ID } }), createMaskedXiao()]),
        createSide([createGcgCharacterState({ character: { id: 1202 } })]),
      ],
      PLUNGE_RULE,
    );

    switchGcgActiveCharacter(duel, 0, 1);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(readHp(duel)).toStrictEqual([5]);
  });

  test("a Normal Attack by a character who was not switched in is no Plunging Attack", () => {
    expect.hasAssertions();

    const duel = createDuel(
      [
        createSide([createGcgCharacterState({ character: { id: CHONGYUN_ID } }), createMaskedXiao()], 1),
        createSide([createGcgCharacterState({ character: { id: 1202 } })]),
      ],
      PLUNGE_RULE,
    );

    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(readHp(duel)).toStrictEqual([7]);
  });

  test("the first skill after a switch spends the switch, so a Normal Attack after an Elemental Skill is no Plunging Attack", () => {
    expect.hasAssertions();

    const duel = createDuel(
      [
        createSide([createGcgCharacterState({ character: { id: CHONGYUN_ID } }), createMaskedXiao()]),
        createSide([createGcgCharacterState({ character: { id: 1202 } })]),
      ],
      PLUNGE_RULE,
    );

    switchGcgActiveCharacter(duel, 0, 1);
    runGcgSkillUse({ duel, sideIndex: 0 }, ELEMENTAL_SKILL);
    runGcgSkillUse({ duel, sideIndex: 0 }, KABUKI);
    expect(readHp(duel)).toStrictEqual([4]);
  });

  test("a switch's arming ends with the Round, so the next Round's first Normal Attack is no Plunging Attack", () => {
    expect.hasAssertions();

    const duel = createDuel(
      [
        createSide([createGcgCharacterState({ character: { id: CHONGYUN_ID } }), createMaskedXiao()]),
        createSide([createGcgCharacterState({ character: { id: 1202 } })]),
      ],
      PLUNGE_RULE,
    );

    switchGcgActiveCharacter(duel, 0, 1);
    duel.round = GCG_ROUND_LIMIT;
    endGcgRound(duel, PLUNGE_RULE);
    expect(takeOne(takeOne(duel.sides, 0).characters, 1).isSwitchedIn).toBe(false);
  });
});
