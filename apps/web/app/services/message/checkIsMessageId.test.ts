import { checkIsMessageId } from "#src/services/message/checkIsMessageId";
import { describe, expect, test } from "vitest";

describe(checkIsMessageId, () => {
  test.each([
    { expected: true, title: "accepts the canonical form of a positive integer", value: "12" },
    { expected: false, title: "refuses zero", value: "0" },
    { expected: false, title: "refuses a negative integer", value: "-3" },
    { expected: false, title: "refuses a leading zero, which Number reads as the same message", value: "012" },
    { expected: false, title: "refuses an exponent, which Number reads as a whole number", value: "1e3" },
    { expected: false, title: "refuses a hex prefix, which Number reads as a whole number", value: "0x10" },
    { expected: false, title: "refuses surrounding whitespace, which Number trims", value: " 12" },
    { expected: false, title: "refuses a decimal with no fraction", value: "12.0" },
    { expected: false, title: "refuses an id past the safe integer range", value: "9007199254740992" },
    { expected: false, title: "refuses an empty string", value: "" },
  ])("$title", ({ expected, value }) => {
    expect(checkIsMessageId(value)).toBe(expected);
  });
});
