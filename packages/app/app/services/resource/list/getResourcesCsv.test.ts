import type { Resource } from "@esposter/db-schema";

import { getResourcesCsv } from "@/services/resource/list/getResourcesCsv";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getResourcesCsv, () => {
  const userId = crypto.randomUUID();
  // Local-time construction keeps the formatted output deterministic across machine timezones
  const epochDate = new Date(1970, 0, 1);
  const createResource = (name: string): Resource => ({
    contentVersion: 0,
    createdAt: epochDate,
    deletedAt: null,
    id: crypto.randomUUID(),
    name,
    tags: {},
    type: ResourceType.Sheet,
    updatedAt: epochDate,
    userId,
  });

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
