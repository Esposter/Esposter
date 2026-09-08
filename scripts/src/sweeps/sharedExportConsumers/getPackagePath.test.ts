import { getPackagePath } from "#scripts/sweeps/sharedExportConsumers/getPackagePath";
import { describe, expect, test } from "vitest";

describe(getPackagePath, () => {
  test("takes the package from a path however deep the file sits", () => {
    expect.hasAssertions();

    expect(getPackagePath("packages/shared/src/util/date/formatDate.ts")).toBe("packages/shared");
  });

  test("takes the same package from a file directly inside it", () => {
    expect.hasAssertions();

    expect(getPackagePath("packages/shared/package.json")).toBe("packages/shared");
  });
});
