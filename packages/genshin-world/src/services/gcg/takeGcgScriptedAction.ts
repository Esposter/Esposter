import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { declareGcgRoundEnd } from "#src/services/gcg/declareGcgRoundEnd";
import { listGcgDiceSubsets } from "#src/services/gcg/listGcgDiceSubsets";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";

// The greedy policy a side takes its turn by: it plays the first hand card it can, else uses the first skill it can, else
// Declares the round's end. A try is refused without changing the duel, so the first accepted one is the one the duel
// Keeps. The skills are tried burst first, then the elemental skill, then the normal attack
const SKILL_KIND_ORDER = ["ElementalBurst", "ElementalSkill", "NormalAttack"];

export const takeGcgScriptedAction = (duel: GcgDuel, sideIndex: number, random: () => number): GcgActionResult => {
  const side = takeOne(duel.sides, sideIndex);
  const diceSubsets = listGcgDiceSubsets(side.dice.length);
  const targetIndices: (number | undefined)[] = [undefined, ...side.characters.map((_character, index) => index)];
  for (let handIndex = 0; handIndex < side.hand.length; handIndex++)
    for (const targetIndex of targetIndices)
      for (const dice of diceSubsets)
        if (playGcgCard(duel, sideIndex, handIndex, targetIndex, dice) === GcgActionResult.Done)
          return GcgActionResult.Done;
  const active = takeOne(side.characters, side.activeIndex);
  const skills = active.character.skills.toSorted(
    (first, second) => SKILL_KIND_ORDER.indexOf(first.kind) - SKILL_KIND_ORDER.indexOf(second.kind),
  );
  for (const skill of skills)
    for (const dice of diceSubsets)
      if (useGcgSkill(duel, sideIndex, skill.id, dice) === GcgActionResult.Done) return GcgActionResult.Done;
  return declareGcgRoundEnd(duel, sideIndex, duel.rule, random);
};
