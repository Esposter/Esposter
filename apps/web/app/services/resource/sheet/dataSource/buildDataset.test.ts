import { buildDataset } from "@/services/resource/sheet/dataSource/buildDataset";
import { describe, expect, test } from "vitest";

describe(buildDataset, () => {
  // A row keys its cells by column name, so two columns sharing one would write both into a single key and the
  // First column's values would be lost
  test("keeps each of two headers sharing a name as its own column", () => {
    expect.hasAssertions();

    const { columns, rows } = buildDataset(["a", "a"], [["0", "1"]]);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a", "a (2)"]);
    expect(rows).toStrictEqual([{ a: 0, "a (2)": 1 }]);
  });

  test("numbers a repeated header past a suffix another header already has", () => {
    expect.hasAssertions();

    const { columns } = buildDataset(["a", "a", "a (2)"], []);

    expect(columns.map(({ name }) => name)).toStrictEqual(["a", "a (3)", "a (2)"]);
  });
});
