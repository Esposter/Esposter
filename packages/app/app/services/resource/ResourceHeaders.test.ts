import { DEFAULT_HIDDEN_RESOURCE_COLUMN_KEYS } from "@/services/resource/constants";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { describe, expect, test } from "vitest";

describe("resourceHeaders", () => {
  // The column chooser lists every toggleable header by title, so a blank one renders a checkbox with no way
  // To tell what it toggles
  test("titles every column", () => {
    expect.hasAssertions();

    expect(ResourceHeaders.filter(({ title }) => !title)).toStrictEqual([]);
  });

  // This is the only registry of column keys, and both the pinned key a source is ordered by and the columns
  // Hidden by default name one from outside it. A key that no longer matches a header fails silently — the
  // Sort column becomes hideable, or a column meant to start hidden starts visible
  test("has a column for every key configured against it", () => {
    expect.hasAssertions();

    const columnKeys = new Set<string>(ResourceHeaders.map(({ key }) => key));
    const configuredKeys = [
      ...DEFAULT_HIDDEN_RESOURCE_COLUMN_KEYS,
      ...Object.values(ResourceListSourceDefinitionMap).flatMap(({ pinnedColumnKey }) =>
        pinnedColumnKey ? [pinnedColumnKey] : [],
      ),
    ];

    expect(configuredKeys.filter((key) => !columnKeys.has(key))).toStrictEqual([]);
  });
});
