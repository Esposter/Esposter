import { createColor } from "@/checkDependencies/createColor";
import { getColorizedLatestVersion } from "@/checkDependencies/getColorizedLatestVersion";
import { describe, expect, test } from "vitest";

describe(getColorizedLatestVersion, () => {
  const color = createColor(true);
  const stable = "0.0.0";

  test("major bump colors the whole latest version red", () => {
    expect.hasAssertions();

    expect(getColorizedLatestVersion(stable, "1.0.0", color)).toBe(color.red("1.0.0"));
  });

  test("minor bump colors everything after the major segment yellow", () => {
    expect.hasAssertions();

    expect(getColorizedLatestVersion(stable, "0.1.0", color)).toBe(`0${color.yellow(".1.0")}`);
  });

  test("patch bump colors the patch tail green", () => {
    expect.hasAssertions();

    expect(getColorizedLatestVersion(stable, "0.0.1", color)).toBe(`0.0.${color.green("1")}`);
  });

  test("prerelease build bump keeps the base and label plain and colors the build tail red", () => {
    expect.hasAssertions();

    expect(getColorizedLatestVersion("0.0.0-dev.0", "0.0.0-dev.1", color)).toBe(`0.0.0-dev.${color.red("1")}`);
  });

  test("prerelease build tail with multiple segments is fully red from the first digit", () => {
    expect.hasAssertions();

    expect(getColorizedLatestVersion("0.0.0-dev.0.0", "0.0.0-dev.0.1", color)).toBe(`0.0.0-dev.${color.red("0.1")}`);
  });

  test("prerelease without a label colors the whole build identifier red", () => {
    expect.hasAssertions();

    expect(getColorizedLatestVersion("0.0.0-0", "0.0.0-1", color)).toBe(`0.0.0-${color.red("1")}`);
  });

  test("prerelease graduating to a stable release keeps the patch tail green", () => {
    expect.hasAssertions();

    expect(getColorizedLatestVersion("0.0.0-dev.0", stable, color)).toBe(`0.0.${color.green("0")}`);
  });

  test("identical versions are returned without color", () => {
    expect.hasAssertions();

    expect(getColorizedLatestVersion(stable, stable, color)).toBe(stable);
  });
});
