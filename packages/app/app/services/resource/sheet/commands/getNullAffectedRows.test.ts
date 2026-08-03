import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { getNullAffectedRows } from "@/services/resource/sheet/commands/getNullAffectedRows";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getNullAffectedRows, () => {
  test("returns rows in ascending index order for non-contiguous null rows", () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("")],
      [createRow({ "": null }), createRow({ "": "0" }), createRow({ "": null })],
    );
    const result = getNullAffectedRows(dataSource);

    expect(result).toHaveLength(2);
    expect(takeOne(result).index).toBe(0);
    expect(takeOne(result, 1).index).toBe(2);
  });
});
