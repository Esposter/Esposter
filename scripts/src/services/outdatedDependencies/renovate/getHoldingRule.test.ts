import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";

import { getHoldingRule } from "#src/services/outdatedDependencies/renovate/getHoldingRule";
import { describe, expect, test } from "vitest";

describe(getHoldingRule, () => {
  const dependency: OutdatedDependency = {
    current: "1.0.0",
    dependencyType: "",
    dependents: [],
    latest: "2.0.0",
    packageName: "a",
    specifier: "",
  };
  const capped: RenovateRule = { allowedVersions: "<2", matchPackageNames: ["a"] };
  const disabled: RenovateRule = { enabled: false, matchPackageNames: ["a"] };

  test("holds a package whose latest falls outside allowedVersions", () => {
    expect.hasAssertions();

    expect(getHoldingRule(dependency, [capped])).toStrictEqual(capped);
  });

  test("holds a disabled package at any latest", () => {
    expect.hasAssertions();

    expect(getHoldingRule({ ...dependency, latest: "1.0.1" }, [disabled])).toStrictEqual(disabled);
  });

  test("lets a latest inside allowedVersions through", () => {
    expect.hasAssertions();

    expect(getHoldingRule({ ...dependency, latest: "1.0.1" }, [capped])).toBeUndefined();
  });

  test("ignores a rule naming another package", () => {
    expect.hasAssertions();

    expect(getHoldingRule(dependency, [{ ...capped, matchPackageNames: ["b"] }])).toBeUndefined();
  });

  test("reads a prerelease latest against the cap", () => {
    expect.hasAssertions();

    expect(getHoldingRule({ ...dependency, latest: "2.0.0-rc.1" }, [capped])).toStrictEqual(capped);
  });

  test("a later rule's allowedVersions overrides an earlier one's, as in Renovate", () => {
    expect.hasAssertions();

    expect(getHoldingRule(dependency, [capped, { ...capped, allowedVersions: "<3" }])).toBeUndefined();
  });

  test("a later rule re-enabling the package lifts an earlier disable", () => {
    expect.hasAssertions();

    expect(getHoldingRule(dependency, [disabled, { enabled: true, matchPackageNames: ["a"] }])).toBeUndefined();
  });

  test("a disable holds even when a cap alone would let latest through", () => {
    expect.hasAssertions();

    expect(getHoldingRule(dependency, [{ ...capped, allowedVersions: "<3" }, disabled])).toStrictEqual(disabled);
  });
});
