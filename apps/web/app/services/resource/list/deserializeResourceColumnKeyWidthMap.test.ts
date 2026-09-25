import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { deserializeResourceColumnKeyWidthMap } from "@/services/resource/list/deserializeResourceColumnKeyWidthMap";
import { serializeResourceColumnKeyWidthMap } from "@/services/resource/list/serializeResourceColumnKeyWidthMap";
import { MAX_DATA_TABLE_COLUMN_WIDTH, MIN_DATA_TABLE_COLUMN_WIDTH } from "@/services/ui/constants";
import { describe, expect, test } from "vitest";

describe(deserializeResourceColumnKeyWidthMap, () => {
  const columnKeyWidthMap = {
    [ResourceListItemPropertyNames.name]: MIN_DATA_TABLE_COLUMN_WIDTH,
    [ResourceListItemPropertyNames.type]: MAX_DATA_TABLE_COLUMN_WIDTH,
  };

  test("reads back the widths it was written", () => {
    expect.hasAssertions();

    expect(deserializeResourceColumnKeyWidthMap(serializeResourceColumnKeyWidthMap(columnKeyWidthMap))).toStrictEqual(
      columnKeyWidthMap,
    );
  });

  test.each([
    "",
    ResourceListItemPropertyNames.name,
    `:${MIN_DATA_TABLE_COLUMN_WIDTH}`,
    `${ResourceListItemPropertyNames.name}:${MIN_DATA_TABLE_COLUMN_WIDTH - 1}`,
    `${ResourceListItemPropertyNames.name}:${MAX_DATA_TABLE_COLUMN_WIDTH + 1}`,
    `${ResourceListItemPropertyNames.name}:${MIN_DATA_TABLE_COLUMN_WIDTH + 0.1}`,
  ])("drops %s, which names no column or a width no handle drags to", (value) => {
    expect.hasAssertions();

    expect(deserializeResourceColumnKeyWidthMap(value)).toStrictEqual({});
  });
});
