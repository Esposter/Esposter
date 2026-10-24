import { checkIsStackedColumns } from "#shared/services/pageBuilder/email/checkIsStackedColumns";
import { describe, expect, test } from "vitest";

describe(checkIsStackedColumns, () => {
  test("columns stack below the mobile breakpoint", () => {
    expect.hasAssertions();

    expect(checkIsStackedColumns(375)).toBe(true);
    expect(checkIsStackedColumns(479)).toBe(true);
    expect(checkIsStackedColumns(480)).toBe(false);
  });
});
