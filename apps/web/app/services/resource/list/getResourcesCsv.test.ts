import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { RESOURCES_CSV_HEADER_TITLES } from "@/services/resource/list/constants";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { getResourcesCsv } from "@/services/resource/list/getResourcesCsv";
import { describe, expect, test } from "vitest";

describe(getResourcesCsv, () => {
  // Local-time construction keeps the formatted output deterministic across machine timezones
  const epochDate = new Date(1970, 0, 1);
  const epochCell = '"Thu, Jan 1, 1970 12:00 AM"';
  const headerRow = RESOURCES_CSV_HEADER_TITLES.join(CsvDelimiter.Comma);
  const createResource = (name: string) => createResourceListItem({ createdAt: epochDate, name, updatedAt: epochDate });

  test("serializes an empty list to the header row", () => {
    expect.hasAssertions();

    expect(getResourcesCsv([])).toBe(headerRow);
  });

  test("serializes resources and escapes cells containing delimiters and quotes", () => {
    expect.hasAssertions();

    const csv = getResourcesCsv([createResource(""), createResource('a,"a"')]);

    expect(csv).toBe(
      [headerRow, `Sheet,,${epochCell},${epochCell}`, `Sheet,"a,""a""",${epochCell},${epochCell}`].join("\n"),
    );
  });
});
