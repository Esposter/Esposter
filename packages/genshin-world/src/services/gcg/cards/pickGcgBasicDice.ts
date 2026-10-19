import type { Element } from "#src/models/Element";

import { Elements } from "#src/models/Element";
import { takeRandom } from "@esposter/shared";

// Picks count different basic Elemental Dice from the duel's random source, each taken one leaving the choice
export const pickGcgBasicDice = (count: number, random: () => number): Element[] => {
  let remaining = [...Elements];
  const picked: Element[] = [];
  while (picked.length < count && remaining.length > 0) {
    const element = takeRandom(remaining, random);
    remaining = remaining.toSpliced(remaining.indexOf(element), 1);
    picked.push(element);
  }
  return picked;
};
