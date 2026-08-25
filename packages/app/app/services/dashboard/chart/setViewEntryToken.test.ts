import { DASHBOARD_VIEW_SEPARATOR } from "@/services/dashboard/chart/constants";
import { setViewEntryToken } from "@/services/dashboard/chart/setViewEntryToken";
import { describe, expect, test } from "vitest";

describe(setViewEntryToken, () => {
  const visualId = crypto.randomUUID();
  const otherEntry = `${crypto.randomUUID()}${DASHBOARD_VIEW_SEPARATOR}other`;
  const token = "token";

  test("replaces this visual's entry and leaves every other visual's alone", () => {
    expect.hasAssertions();

    const entries = [otherEntry, `${visualId}${DASHBOARD_VIEW_SEPARATOR}stale`];

    expect(setViewEntryToken(entries, visualId, token)).toStrictEqual([
      otherEntry,
      `${visualId}${DASHBOARD_VIEW_SEPARATOR}${token}`,
    ]);
  });

  test("drops the visual from the link when it has no view worth carrying", () => {
    expect.hasAssertions();

    const entries = [otherEntry, `${visualId}${DASHBOARD_VIEW_SEPARATOR}stale`];

    expect(setViewEntryToken(entries, visualId, "")).toStrictEqual([otherEntry]);
  });
});
