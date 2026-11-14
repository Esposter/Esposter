import { reverseTickedTimestampSchema } from "#src/models/message/ReverseTickedTimestamp";
import { AZURE_SELF_DESTRUCT_TIMER } from "#src/services/message/constants";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("reverseTickedTimestampSchema", () => {
  // The boundaries are the timer's own extremes: the widest countdown and the narrowest one
  test.each([
    ["a countdown from a real timestamp", "1234567890123456789012345678"],
    ["the widest countdown", AZURE_SELF_DESTRUCT_TIMER],
    ["the narrowest countdown", "0"],
  ])("accepts %s", (_description, rowKey) => {
    expect.hasAssertions();

    expect(reverseTickedTimestampSchema.parse(rowKey)).toBe(rowKey);
  });

  // Each of these reached a key lookup before, where a malformed key answers "no such row" rather than "that is not a key"
  test.each([
    ["an empty string", ""],
    ["a uuid", v7()],
    ["a negative countdown", "-1"],
    ["a decimal point", "0.0"],
    ["padding", " 0"],
    ["one digit past the maximum", `${AZURE_SELF_DESTRUCT_TIMER}9`],
  ])("rejects %s", (_description, rowKey) => {
    expect.hasAssertions();

    expect(reverseTickedTimestampSchema.safeParse(rowKey).success).toBe(false);
  });
});
