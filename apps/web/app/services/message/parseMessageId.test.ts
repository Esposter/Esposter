import { parseMessageId } from "#src/services/message/parseMessageId";
import { describe, expect, test } from "vitest";

describe(parseMessageId, () => {
  test.each([
    { expected: 12, title: "reads the canonical form of a positive integer", value: "12" },
    { expected: undefined, title: "names no message for a leading zero", value: "012" },
    { expected: undefined, title: "names no message for an exponent", value: "1e3" },
  ])("$title", ({ expected, value }) => {
    expect.hasAssertions();

    expect(parseMessageId(value)).toBe(expected);
  });
});
