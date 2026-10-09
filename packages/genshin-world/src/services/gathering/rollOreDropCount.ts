import {
  ORE_CERTAIN_DROP_COUNT,
  ORE_EXTRA_DROP_CHANCE,
  ORE_EXTRA_DROP_DRAW_COUNT,
} from "#src/services/gathering/constants";

// The pieces an ore drops: the certain one, and one more for each extra draw from the caller's random number that comes
// Under the chance
export const rollOreDropCount = (random: () => number): number =>
  ORE_CERTAIN_DROP_COUNT +
  Array.from({ length: ORE_EXTRA_DROP_DRAW_COUNT }, () => random()).filter((draw) => draw < ORE_EXTRA_DROP_CHANCE)
    .length;
