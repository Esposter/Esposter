import { describe } from "vitest";

/**
 * The Resolve phase's narration, which publishes both the count and the budget it was drawn from — the budget is
 * `NON_CLEANUP_FINDER_COUNT * 2`, so a run whose fan-out differs from the three-angle default passes its own.
 */
export const getResolveLog = (count: number, budget = 6): string =>
  `resolve: ${count} of a ${budget} budget plausible findings to settle`;

describe.todo("getResolveLog");
