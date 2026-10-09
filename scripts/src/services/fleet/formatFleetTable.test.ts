import { formatFleetTable } from "#src/services/fleet/formatFleetTable";
import { describe, expect, test } from "vitest";

describe(formatFleetTable, () => {
  test("aligns each column to its widest cell under an underlined header", () => {
    expect.hasAssertions();

    expect(
      formatFleetTable(
        ["id", "age"],
        [
          ["pc", "3 min"],
          ["macbook", "12 min"],
        ],
      ),
    ).toStrictEqual(["id       age", "-------  ------", "pc       3 min", "macbook  12 min"]);
  });
});
