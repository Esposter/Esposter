import { parseMessageId } from "#src/services/message/parseMessageId";
import { describe, expect, test } from "vitest";

describe(parseMessageId, () => {
  test.each([
    { expected: 12, title: "reads the canonical form of a positive integer", value: "12" },
    { expected: undefined, title: "refuses zero", value: "0" },
    { expected: undefined, title: "refuses a negative integer", value: "-3" },
    { expected: undefined, title: "refuses a leading zero, which Number reads as the same message", value: "012" },
    { expected: undefined, title: "refuses an exponent, which Number reads as a whole number", value: "1e3" },
    { expected: undefined, title: "refuses a hex prefix, which Number reads as a whole number", value: "0x10" },
    { expected: undefined, title: "refuses surrounding whitespace, which Number trims", value: " 12" },
    { expected: undefined, title: "refuses a decimal with no fraction", value: "12.0" },
    { expected: undefined, title: "refuses an id past the safe integer range", value: "9007199254740992" },
    { expected: undefined, title: "refuses an empty string", value: "" },
  ])("$title", ({ expected, value }) => {
    expect(parseMessageId(value)).toBe(expected);
  });
});
