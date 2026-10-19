import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { elementalResonanceWovenFlames } from "#src/services/gcg/cards/elementalResonanceWovenFlames";
import { elementalResonanceWovenIce } from "#src/services/gcg/cards/elementalResonanceWovenIce";
import { elementalResonanceWovenThunder } from "#src/services/gcg/cards/elementalResonanceWovenThunder";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// Plays a resonance card on a side whose characters have the given elements, and reports whether it may be played and the
// Dice the side holds afterwards
const playResonance = (module: GcgCardModule, elements: Element[]) => {
  const duel: GcgDuel = {
    actingSideIndex: 0,
    cardModules: GcgCardIdModuleMap,
    firstSideIndex: 0,
    nextFirstSideIndex: 0,
    outcome: undefined,
    phase: GcgPhase.Action,
    random: () => 0,
    round: 1,
    rule: { handCardLimit: 10 } as GcgDuel["rule"],
    sides: [
      {
        activeIndex: 0,
        cards: [],
        characters: elements.map((element, index) =>
          createGcgCharacterState({ character: { element, id: index + 1 } }),
        ),
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
      },
      {
        activeIndex: 0,
        cards: [],
        characters: [],
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
      },
    ],
    skillModules: GcgEffectNameSkillModuleMap,
    winnerSideIndex: undefined,
  };
  const context: GcgEffectContext = { duel, sideIndex: 0 };
  const isPlayable = module.canPlay?.(context, undefined) === true;
  if (isPlayable) module.play?.(context, undefined);
  return { dice: takeOne(duel.sides, 0).dice, isPlayable };
};

describe("woven Ice", () => {
  test("is refused with one Cryo character, and with two it creates a Cryo die", () => {
    expect.hasAssertions();
    expect(playResonance(elementalResonanceWovenIce, [Element.Cryo, Element.Hydro])).toStrictEqual({
      dice: [],
      isPlayable: false,
    });
    expect(playResonance(elementalResonanceWovenIce, [Element.Cryo, Element.Hydro, Element.Cryo])).toStrictEqual({
      dice: [Element.Cryo],
      isPlayable: true,
    });
  });
});

describe("woven Thunder", () => {
  test("is refused with one Electro character, and with two it creates an Electro die", () => {
    expect.hasAssertions();
    expect(playResonance(elementalResonanceWovenThunder, [Element.Electro, Element.Hydro])).toStrictEqual({
      dice: [],
      isPlayable: false,
    });
    expect(
      playResonance(elementalResonanceWovenThunder, [Element.Electro, Element.Hydro, Element.Electro]),
    ).toStrictEqual({ dice: [Element.Electro], isPlayable: true });
  });
});

describe("woven Flames", () => {
  test("is refused with one Pyro character, and with two it creates a Pyro die", () => {
    expect.hasAssertions();
    expect(playResonance(elementalResonanceWovenFlames, [Element.Pyro, Element.Hydro])).toStrictEqual({
      dice: [],
      isPlayable: false,
    });
    expect(playResonance(elementalResonanceWovenFlames, [Element.Pyro, Element.Pyro])).toStrictEqual({
      dice: [Element.Pyro],
      isPlayable: true,
    });
  });
});
