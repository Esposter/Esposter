import { AZURE_SELF_DESTRUCT_TIMER } from "@/services/azure/table/constants";
import { getReverseTickedTimestamp } from "@/services/azure/table/getReverseTickedTimestamp";
import { describe, expect, test } from "vitest";

describe(getReverseTickedTimestamp, () => {
  test("min", () => {
    expect.hasAssertions();

    expect(getReverseTickedTimestamp("0")).toBe(AZURE_SELF_DESTRUCT_TIMER);
  });

  test("max", () => {
    expect.hasAssertions();

    expect(getReverseTickedTimestamp(AZURE_SELF_DESTRUCT_TIMER)).toBe("0");
  });
});
