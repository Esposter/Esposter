import type { SinsResult } from "../../models/SinsResult";
import type { SinStatusKind } from "../../models/SinStatusKind";

import { SIN_NAMES } from "../../models/SinName";
import { SIN_HISTORY_LENGTH, SIN_TOP_LEVEL } from "./constants";

// Each sin's evidence gains this prompt's score as a share of the top level, clamped to [0, 1], and the oldest values fall
// Away past the history's length
export const appendSinEvidence = (
  history: Record<string, number[]>,
  answers: Extract<SinsResult, { result: SinStatusKind.Answered }>["answers"],
): Record<string, number[]> =>
  Object.fromEntries(
    SIN_NAMES.map((name) => {
      const evidence = Math.min(1, Math.max(0, (answers[name]?.score ?? 0) / SIN_TOP_LEVEL));
      return [name, [...(history[name] ?? []), evidence].slice(-SIN_HISTORY_LENGTH)];
    }),
  );
