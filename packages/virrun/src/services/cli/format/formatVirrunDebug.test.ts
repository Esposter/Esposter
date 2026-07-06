import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { formatVirrunDebug } from "@/services/cli/format/formatVirrunDebug";
import { describe, expect, test } from "vitest";

describe(formatVirrunDebug, () => {
  test("prefixes the message with the virrun tag and debug label", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunDebug("task cache off"))).toBe("[virrun] debug — task cache off");
  });
});
