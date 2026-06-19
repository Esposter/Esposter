import { getVersionParts } from "@/checkDependencies/getVersionParts";
import { describe, expect, test } from "vitest";

describe(getVersionParts, () => {
  test("splits a plain version into numeric parts with no prerelease", () => {
    expect.hasAssertions();

    expect(getVersionParts("0.0.0")).toStrictEqual({ major: 0, minor: 0, patch: 0, prerelease: undefined });
  });

  test("captures the prerelease identifier after the dash", () => {
    expect.hasAssertions();

    expect(getVersionParts("0.0.1-dev.0")).toStrictEqual({ major: 0, minor: 0, patch: 1, prerelease: "dev.0" });
  });

  test("defaults missing segments to zero", () => {
    expect.hasAssertions();

    expect(getVersionParts("1")).toStrictEqual({ major: 1, minor: 0, patch: 0, prerelease: undefined });
  });
});
