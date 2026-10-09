import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { declareGcgRoundEnd } from "#src/services/gcg/declareGcgRoundEnd";
import { listGcgDiceSubsets } from "#src/services/gcg/listGcgDiceSubsets";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";

// The greedy policy a side takes its turn by: it plays the first hand card it can, else uses the first skill it can, else
// Declares the round's end. A try is refused without changing the duel, so the first accepted one is the one the duel
// Keeps, and only an unpayable one is tried again with other dice, as no other refusal turns on the dice. The skills are
// Tried burst first, then the elemental skill, then the normal attack
const SKILL_KIND_ORDER = ["ElementalBurst", "ElementalSkill", "NormalAttack"];

export const takeGcgScriptedAction = (duel: GcgDuel, sideIndex: number, random: () => number): GcgActionResult => {
  const side = takeOne(duel.sides, sideIndex);
  const diceSubsets = listGcgDiceSubsets(side.dice.length);
  const targetIndices: (number | undefined)[] = [undefined, ...side.characters.map((_character, index) => index)];
  for (let handIndex = 0; handIndex < side.hand.length; handIndex++)
    for (const targetIndex of targetIndices)
      for (const dice of diceSubsets) {
        const result = playGcgCard(duel, sideIndex, handIndex, targetIndex, dice);
        if (result === GcgActionResult.Done) return result;
        else if (result !== GcgActionResult.Unpayable) break;
      }
  const active = takeOne(side.characters, side.activeIndex);
  const skills = active.character.skills.toSorted(
    (firstSkill, secondSkill) => SKILL_KIND_ORDER.indexOf(firstSkill.kind) - SKILL_KIND_ORDER.indexOf(secondSkill.kind),
  );
  for (const skill of skills)
    for (const dice of diceSubsets) {
      const result = useGcgSkill(duel, sideIndex, skill.id, dice);
      if (result === GcgActionResult.Done) return result;
      else if (result !== GcgActionResult.Unpayable) break;
    }
  return declareGcgRoundEnd(duel, sideIndex, duel.rule, random);
};
