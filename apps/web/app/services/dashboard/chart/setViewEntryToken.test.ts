import { DASHBOARD_VIEW_SEPARATOR } from "@/services/dashboard/chart/constants";
import { setViewEntryToken } from "@/services/dashboard/chart/setViewEntryToken";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(setViewEntryToken, () => {
  const visualId = v7();
  const otherEntry = `${v7()}${DASHBOARD_VIEW_SEPARATOR} `;
  const token = "b";

  test("replaces this visual's entry and leaves every other visual's alone", () => {
    expect.hasAssertions();

    const entries = [otherEntry, `${visualId}${DASHBOARD_VIEW_SEPARATOR}a`];

    expect(setViewEntryToken(entries, visualId, token)).toStrictEqual([
      otherEntry,
      `${visualId}${DASHBOARD_VIEW_SEPARATOR}${token}`,
    ]);
  });

  test("drops the visual from the link when it has no view worth carrying", () => {
    expect.hasAssertions();

    const entries = [otherEntry, `${visualId}${DASHBOARD_VIEW_SEPARATOR}a`];

    expect(setViewEntryToken(entries, visualId, "")).toStrictEqual([otherEntry]);
  });
});
