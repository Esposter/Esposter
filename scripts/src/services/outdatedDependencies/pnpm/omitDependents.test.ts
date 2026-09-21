import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";

import { omitDependents } from "#src/services/outdatedDependencies/pnpm/omitDependents";
import { describe, expect, test } from "vitest";

describe(omitDependents, () => {
  const baseDependency: OutdatedDependency = {
    current: "",
    dependencyType: "",
    dependents: [],
    latest: "",
    packageName: "",
    specifier: "",
  };

  test("drops the omitted dependents and the row they were all of", () => {
    expect.hasAssertions();

    expect(
      omitDependents(
        [
          { ...baseDependency, dependents: ["a", "b"] },
          { ...baseDependency, dependents: ["a"] },
        ],
        new Set(["a"]),
      ),
    ).toStrictEqual([{ ...baseDependency, dependents: ["b"] }]);
  });

  test("keeps a row that had no dependents to begin with", () => {
    expect.hasAssertions();

    expect(omitDependents([baseDependency], new Set(["a"]))).toStrictEqual([baseDependency]);
  });
});
