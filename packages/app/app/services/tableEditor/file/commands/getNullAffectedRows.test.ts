import { makeColumn, makeDataSource, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { getNullAffectedRows } from "@/services/tableEditor/file/commands/getNullAffectedRows";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getNullAffectedRows, () => {
  test("returns rows in ascending index order for non-contiguous null rows", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": null }), makeRow({ "": "0" }), makeRow({ "": null })]);
    const result = getNullAffectedRows(ds);

    expect(result).toHaveLength(2);
    expect(takeOne(result, 0).index).toBe(0);
    expect(takeOne(result, 1).index).toBe(2);
  });
});
