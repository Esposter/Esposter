import type { SinsResult } from "../../models/SinsResult";

import { SIN_HISTORY_LENGTH, SIN_NAMES } from "./constants";
import { getEvidence } from "./getEvidence";

// Each sin's evidence gains this prompt's value, and the oldest values fall away past the history's length
export const appendSinEvidence = (
  history: Record<string, number[]>,
  answers: Extract<SinsResult, { result: "answered" }>["answers"],
): Record<string, number[]> =>
  Object.fromEntries(
    SIN_NAMES.map((name) => [
      name,
      [...(history[name] ?? []), getEvidence(answers[name]?.score ?? 0)].slice(-SIN_HISTORY_LENGTH),
    ]),
  );
