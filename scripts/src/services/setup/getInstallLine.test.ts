import { getInstallLine } from "#src/services/setup/getInstallLine";
import { describe, expect, test } from "vitest";

describe(getInstallLine, () => {
  const install = { darwin: "brew install widget" };

  test("gives the line written for the platform the command runs on", () => {
    expect.hasAssertions();

    expect(getInstallLine("widget", install, "darwin")).toBe("brew install widget");
  });

  test("names the tool when no line is written for the platform", () => {
    expect.hasAssertions();

    expect(getInstallLine("widget", install, "linux")).toBe(
      "no install line for linux: install widget with its own installer",
    );
  });
});
