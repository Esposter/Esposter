import type { DependencyScore } from "#src/models/dependencies/score/DependencyScore";

import { getDisagreements } from "#src/services/dependencies/score/getDisagreements";
import { describe, expect, test } from "vitest";

const createScore = (packageName: string, verdict: string, total: number, shimCount = 0): DependencyScore => ({
  bundleBytes: 0,
  bundleSkipReason: "",
  dependencyLines: 0,
  entryBytes: 0,
  formatPoints: 0,
  importerCount: 0,
  installBytes: 0,
  isDeprecated: false,
  isInstallShared: false,
  manifestCount: 0,
  packageName,
  releaseCount: 0,
  selfContainmentPoints: 0,
  shimCount,
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

  test("flags a Keep with type shims outside the shim-exempt reasons, whatever its score", () => {
    expect.hasAssertions();

    const scores = [
      createScore("eta", "Keep — data", 10, 1),
      createScore("theta", "Keep — engine", 10, 1),
      createScore("iota", "Keep — data", 10),
    ];

    expect(getDisagreements(scores)).toStrictEqual([scores[0]]);
  });
});
