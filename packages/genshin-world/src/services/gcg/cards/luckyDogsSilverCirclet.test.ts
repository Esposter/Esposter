import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { luckyDogsSilverCirclet } from "#src/services/gcg/cards/luckyDogsSilverCirclet";
import { describe, expect, test } from "vitest";

const CIRCLET_ID = 312_002;
const MAX_HP = 10;
const ELEMENTAL_SKILL: GcgSkill = { costs: [], effect: "", energyGain: 0, id: 1, kind: GcgSkillKind.ElementalSkill };
const NORMAL_ATTACK: GcgSkill = { ...ELEMENTAL_SKILL, id: 2, kind: GcgSkillKind.NormalAttack };

const createSide = (hp: number): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [
    {
      aura: GcgAura.None,
      character: {
        descriptionTextId: 2,
        element: Element.Hydro,
        hp: MAX_HP,
        id: 1,
        maxEnergy: 3,
        nameTextId: 1,
        skills: [],
        weapon: "",
      },
      energy: 0,
      equipments: [],
      hp,
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

const createDuel = (side: GcgSideState): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: { drawCount: 2, handCardLimit: 10, reactions: [] },
  sides: [side, createSide(MAX_HP)],
});

const zoneCard = { cardId: CIRCLET_ID, counter: 0, rounds: 0, usages: 0 };

describe("luckyDogsSilverCirclet", () => {
  test("should heal the character it is equipped to for 2 HP after an Elemental Skill", () => {
    expect.hasAssertions();
    const side = createSide(5);
    const duel = createDuel(side);
    luckyDogsSilverCirclet.onSkillUsed?.({ characterIndex: 0, duel, sideIndex: 0 }, ELEMENTAL_SKILL, zoneCard, []);
    expect(side.characters.map(({ hp }) => hp)).toStrictEqual([7]);
  });

  test("should heal nothing after a Normal Attack", () => {
    expect.hasAssertions();
    const side = createSide(5);
    luckyDogsSilverCirclet.onSkillUsed?.(
      { characterIndex: 0, duel: createDuel(side), sideIndex: 0 },
      NORMAL_ATTACK,
      zoneCard,
      [],
    );
    expect(side.characters.map(({ hp }) => hp)).toStrictEqual([5]);
  });

  test("should heal no more than the character's maximum HP", () => {
    expect.hasAssertions();
    const side = createSide(9);
    luckyDogsSilverCirclet.onSkillUsed?.(
      { characterIndex: 0, duel: createDuel(side), sideIndex: 0 },
      ELEMENTAL_SKILL,
      zoneCard,
      [],
    );
    expect(side.characters.map(({ hp }) => hp)).toStrictEqual([MAX_HP]);
  });

  test("should heal once a Round, however many Elemental Skills are used", () => {
    expect.hasAssertions();
    const side = createSide(5);
    const duel = createDuel(side);
    const context = { characterIndex: 0, duel, sideIndex: 0 };
    luckyDogsSilverCirclet.onSkillUsed?.(context, ELEMENTAL_SKILL, zoneCard, []);
    luckyDogsSilverCirclet.onSkillUsed?.(context, ELEMENTAL_SKILL, zoneCard, []);
    expect({ hp: side.characters.map(({ hp }) => hp), usedCardIds: side.usedCardIds }).toStrictEqual({
      hp: [7],
      usedCardIds: [CIRCLET_ID],
    });
  });
});
