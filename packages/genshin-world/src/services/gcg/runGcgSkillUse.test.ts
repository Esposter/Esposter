import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { afterEach, describe, expect, test, vi } from "vitest";

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

const createSide = (): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [
    {
      aura: GcgAura.None,
      character: {
        descriptionTextId: 2,
        element: Element.Hydro,
        hp: 10,
        id: 1,
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
    },
  ],
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

const createDuel = (): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: { drawCount: 2, handCardLimit: 10, reactions: [] },
  sides: [createSide(), createSide()],
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
        { characterIndex: undefined, duel, sideIndex: 1, skill: DAMAGE_SKILL },
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
