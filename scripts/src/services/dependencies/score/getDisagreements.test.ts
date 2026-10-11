import type { DependencyScore } from "#src/models/dependencies/score/DependencyScore";

import { describe, expect, test } from "vitest";
import { getDisagreements } from "#src/services/dependencies/score/getDisagreements";

const createScore = (packageName: string, verdict: string, total: number): DependencyScore => ({
  dependencyLines: 0,
  formatPoints: 0,
  importerCount: 0,
  isDeprecated: false,
  manifestCount: 0,
  packageName,
  releaseCount: 0,
  selfContainmentPoints: 0,
  sizePoints: 0,
  sourceLines: 0,
  stabilityPoints: 0,
  total,
  verdict,
});

describe(getDisagreements, () => {
  test("flags a Keep outside the exempt reasons scoring 60 or more, and an Absorb scoring under 30", () => {
    expect.hasAssertions();

    const scores = [
      createScore("alpha", "Keep — data", 60),
      createScore("beta", "Keep — SDK", 80),
      createScore("gamma", "Keep — data", 59),
      createScore("delta", "Absorb — helper", 29),
      createScore("epsilon", "Absorb — helper", 30),
      createScore("zeta", "—", 10),
    ];

    expect(getDisagreements(scores)).toStrictEqual([scores[0], scores[3]]);
  });
});
