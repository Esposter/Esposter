import type { SinScore } from "../../models/SinScore";

import { SIN_NAMES } from "./constants";
import { getPosterior } from "./getPosteriorTrail";
import { getScoreAndSpread } from "./getScoreAndSpread";
import { getTrend } from "./getTrend";

// The sins the person can read, in the pane's order: one with no evidence is left out rather than shown as a zero
export const getSinScores = (history: Record<string, number[]>): SinScore[] =>
  SIN_NAMES.flatMap((name) => {
    const evidences = history[name] ?? [];
    if (evidences.length === 0) return [];

    return [{ name, ...getScoreAndSpread(getPosterior(evidences)), trend: getTrend(evidences) }];
  });
