import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { toRawDeep } from "@esposter/shared";
import { describe, expect, test } from "vitest";

export const createUpdatedRow = (row: Row, overrides: Partial<Row>): Row =>
  new Row(Object.assign(structuredClone(toRawDeep(row)), overrides));

describe(createUpdatedRow, () => {
  const data = { a: "0" };
  const updatedData = { a: "1" };

  test("applies the overrides to the result", () => {
    expect.hasAssertions();

    expect(createUpdatedRow(createRow(data), { data: updatedData }).data).toStrictEqual(updatedData);
  });

  test("returns a new Row rather than mutating the source", () => {
    expect.hasAssertions();

    const row = createRow(data);
    const updatedRow = createUpdatedRow(row, { data: updatedData });

    expect(updatedRow).toBeInstanceOf(Row);
    expect(updatedRow).not.toBe(row);
  });

  test("leaves the source row unchanged", () => {
    expect.hasAssertions();

    const row = createRow(data);
    createUpdatedRow(row, { data: updatedData });

    expect(row.data).toStrictEqual(data);
  });
});
