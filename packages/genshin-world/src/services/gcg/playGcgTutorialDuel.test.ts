import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { declareGcgRoundEnd } from "#src/services/gcg/declareGcgRoundEnd";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { replaceGcgCharacter } from "#src/services/gcg/replaceGcgCharacter";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

const SEED = 7;
const TUTORIAL_DECK_ID = 1;
const MAX_STEPS = 2000;
const SKILL_KIND_ORDER = ["ElementalBurst", "ElementalSkill", "NormalAttack"];

// Every way of choosing count dice out of the dice a side holds, the indices in order from startIndex on
const chooseDice = (diceCount: number, count: number, startIndex = 0): number[][] => {
  if (count === 0) return [[]];
  const choices: number[][] = [];
  for (let index = startIndex; index <= diceCount - count; index++)
    for (const rest of chooseDice(diceCount, count - 1, index + 1)) choices.push([index, ...rest]);
  return choices;
};

// The scripted player: it plays the first hand card it can, else uses the first skill it can, else ends the round. Each try
// Is refused without changing the duel, so the first accepted one is the one the duel keeps
const takeScriptedAction = (duel: GcgDuel, sideIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  const totalDice = side.dice.length;
  const targetIndices: (number | undefined)[] = [undefined, ...side.characters.map((_character, index) => index)];
  for (let handIndex = 0; handIndex < side.hand.length; handIndex++)
    for (const targetIndex of targetIndices)
      for (const dice of chooseAnyDice(totalDice))
        if (playGcgCard(duel, sideIndex, handIndex, targetIndex, dice) === GcgActionResult.Done) return;
  const active = takeOne(side.characters, side.activeIndex);
  const skills = active.character.skills.toSorted(
    (first, second) => SKILL_KIND_ORDER.indexOf(first.kind) - SKILL_KIND_ORDER.indexOf(second.kind),
  );
  for (const skill of skills)
    for (const dice of chooseAnyDice(totalDice))
      if (useGcgSkill(duel, sideIndex, skill.id, dice) === GcgActionResult.Done) return;
  declareGcgRoundEnd(duel, sideIndex, duel.rule, createSeededRandom(SEED));
};

// Every choice of dice a side holds, from none up to all of them
const chooseAnyDice = (totalDice: number): number[][] =>
  Array.from({ length: totalDice + 1 }, (_value, count) => chooseDice(totalDice, count)).flat();

// Plays a duel between two decks through the engine's public functions until its phase ends, or the step limit is reached
const playGcgDuel = (decks: Parameters<typeof createGcgDuel>[0], rule: GcgDuel["rule"]): GcgDuel => {
  const random = createSeededRandom(SEED);
  const duel = createGcgDuel(decks, random, rule);
  for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0, random);
  for (let step = 0; step < MAX_STEPS && duel.phase !== GcgPhase.Ended; step++)
    if (duel.phase === GcgPhase.Roll) {
      const unrolledSideIndices = [0, 1].filter((sideIndex) => !takeOne(duel.sides, sideIndex).hasRolled);
      for (const sideIndex of unrolledSideIndices) rerollGcgDice(duel, sideIndex, [], random);
    } else if (duel.phase === GcgPhase.Action) {
      const replacementSideIndex = duel.sides.findIndex((side) => side.isReplacementPending);
      if (replacementSideIndex === -1) takeScriptedAction(duel, duel.actingSideIndex);
      else {
        const standingIndex = takeOne(duel.sides, replacementSideIndex).characters.findIndex(
          (character) => character.hp > 0,
        );
        replaceGcgCharacter(duel, replacementSideIndex, standingIndex);
      }
    }
  return duel;
};

describe("a duel between two copies of the tutorial deck", () => {
  test("should be played to its end through the engine's public functions", async () => {
    expect.hasAssertions();

    const tutorialDeck = await readGcgDeck(TUTORIAL_DECK_ID);
    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([tutorialDeck, tutorialDeck], rule);

    expect({ isEnded: duel.phase === GcgPhase.Ended, hasOutcome: duel.outcome !== undefined }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});

describe("a duel between opponent decks 3 and 4", () => {
  test("should be played to its end through the engine's public functions", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = playGcgDuel([await readGcgDeck(3), await readGcgDeck(4)], rule);

    expect({ isEnded: duel.phase === GcgPhase.Ended, hasOutcome: duel.outcome !== undefined }).toStrictEqual({
      hasOutcome: true,
      isEnded: true,
    });
  });
});
