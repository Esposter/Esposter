import { reverseTickedTimestampSchema } from "#src/models/azure/table/reverseTickedTimestampSchema";
import { AZURE_SELF_DESTRUCT_TIMER } from "#src/services/azure/table/constants";
import { getReverseTickedTimestamp } from "#src/services/azure/table/getReverseTickedTimestamp";
import { describe, expect, test } from "vitest";

describe("reverseTickedTimestampSchema", () => {
  // The schema's whole job is to agree with the producer, so the producer's own extremes are the boundaries
  test.each([
    ["a real timestamp", getReverseTickedTimestamp()],
    ["the widest countdown", getReverseTickedTimestamp("0")],
    ["the narrowest countdown", getReverseTickedTimestamp(AZURE_SELF_DESTRUCT_TIMER)],
  ])("accepts %s", (_description, rowKey) => {
    expect.hasAssertions();
    expect(reverseTickedTimestampSchema.parse(rowKey)).toBe(rowKey);
  });

  // Each of these reached the Table query as a rowKey before, where a malformed key answers "no such row"
  // Rather than "that is not a key"
  test.each([
    ["an empty string", ""],
    ["a uuid", crypto.randomUUID()],
    ["a negative countdown", "-1"],
    ["a decimal point", "1.0"],
    ["padding", " 1"],
    ["one digit past the maximum", `${AZURE_SELF_DESTRUCT_TIMER}9`],
  ])("rejects %s", (_description, rowKey) => {
    expect.hasAssertions();
    expect(reverseTickedTimestampSchema.safeParse(rowKey).success).toBe(false);
  });
});
