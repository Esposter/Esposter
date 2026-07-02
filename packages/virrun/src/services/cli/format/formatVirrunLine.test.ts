import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
import { describe, expect, test } from "vitest";

describe(formatVirrunLine, () => {
  // Color is off under vitest, so colorize is a passthrough and the tag renders plain.
  test("prepends the [virrun] tag and a space to the message", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatVirrunLine(""))).toBe("[virrun] ");
  });
});
