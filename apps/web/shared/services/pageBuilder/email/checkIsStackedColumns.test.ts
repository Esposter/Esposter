import { describe, expect, test } from "vitest";

import { checkIsStackedColumns } from "./checkIsStackedColumns";

describe(checkIsStackedColumns, () => {
  test("columns stack below the mobile breakpoint", () => {
    expect.hasAssertions();

    expect(checkIsStackedColumns(375)).toBe(true);
    expect(checkIsStackedColumns(480)).toBe(true);
    expect(checkIsStackedColumns(481)).toBe(false);
  });
});
