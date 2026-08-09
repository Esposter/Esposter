import type { Column } from "#shared/models/resource/sheet/column/Column";

import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { toRawDeep } from "@esposter/shared";
import { describe, expect, test } from "vitest";

export const createUpdatedColumn = <TOverrides extends Partial<Column>>(
  column: Column,
  overrides: TOverrides,
): Column & TOverrides => Object.assign(structuredClone(toRawDeep(column)), overrides);

describe(createUpdatedColumn, () => {
  const name = "a";
  const updatedName = "b";

  test("applies the overrides to the result", () => {
    expect.hasAssertions();

    expect(createUpdatedColumn(createColumn(name), { name: updatedName }).name).toBe(updatedName);
  });

  test("leaves the source column unchanged", () => {
    expect.hasAssertions();

    const column = createColumn(name);
    createUpdatedColumn(column, { name: updatedName });

    expect(column.name).toBe(name);
  });
});
