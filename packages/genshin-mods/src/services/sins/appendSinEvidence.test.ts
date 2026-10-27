import { describe, expect, test } from "vitest";

import { SIN_HISTORY_LENGTH, SIN_NAMES } from "./constants";
import { appendSinEvidence } from "./appendSinEvidence";

describe(appendSinEvidence, () => {
  const answers = Object.fromEntries(SIN_NAMES.map((name) => [name, { confidence: 1, score: 2 }]));

  test("appends each sin's evidence in the answer's own scale", () => {
    expect.hasAssertions();

    const history = appendSinEvidence({}, answers);
    expect(history.pride).toStrictEqual([0.5]);
    expect(history.sloth).toStrictEqual([0.5]);
  });

  test("keeps only the newest history length of each sin", () => {
    expect.hasAssertions();

    const full = Object.fromEntries(
      SIN_NAMES.map((name) => [name, Array.from({ length: SIN_HISTORY_LENGTH }, () => 0)]),
    );
    expect(appendSinEvidence(full, answers).pride).toHaveLength(SIN_HISTORY_LENGTH);
  });
});
