import { AZURE_SELF_DESTRUCT_TIMER } from "#src/services/azure/table/constants";
import { getReverseTickedTimestamp } from "#src/services/azure/table/getReverseTickedTimestamp";
import { describe, expect, test } from "vitest";

describe(getReverseTickedTimestamp, () => {
  test("the oldest timestamp takes the full span, so it sorts last", () => {
    expect.hasAssertions();

    expect(getReverseTickedTimestamp("0")).toBe(AZURE_SELF_DESTRUCT_TIMER);
  });

  test("the full span takes zero, so the newest timestamp sorts first", () => {
    expect.hasAssertions();

    expect(getReverseTickedTimestamp(AZURE_SELF_DESTRUCT_TIMER)).toBe("0");
  });
});
