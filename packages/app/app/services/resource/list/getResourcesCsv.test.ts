import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { getResourcesCsv } from "@/services/resource/list/getResourcesCsv";
import { describe, expect, test } from "vitest";

describe(getResourcesCsv, () => {
  // Local-time construction keeps the formatted output deterministic across machine timezones
  const epochDate = new Date(1970, 0, 1);
  const createResource = (name: string) => createResourceListItem({ createdAt: epochDate, name, updatedAt: epochDate });

  test("serializes an empty list to the header row", () => {
    expect.hasAssertions();

    expect(getResourcesCsv([])).toBe("Type,Name,Created At,Updated At");
  });

  test("serializes resources and escapes cells containing delimiters and quotes", () => {
    expect.hasAssertions();

    const csv = getResourcesCsv([createResource(""), createResource('a,"a"')]);

    expect(csv).toBe(
      [
        "Type,Name,Created At,Updated At",
        'Sheet,,"Thu, Jan 1, 1970 12:00 AM","Thu, Jan 1, 1970 12:00 AM"',
        'Sheet,"a,""a""","Thu, Jan 1, 1970 12:00 AM","Thu, Jan 1, 1970 12:00 AM"',
      ].join("\n"),
    );
  });
});
