import { validatePackageName } from "#src/services/package/new/validatePackageName";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { describe, expect, test } from "vitest";

describe(validatePackageName, () => {
  // A library's module is named for its package, so the name `index` would write the file the build generates as the
  // Library's entry. The name is refused before anything is written, and no package directory is read for it
  test("refuses the name whose module would be the library's generated entry", () => {
    expect.hasAssertions();

    expect(() => {
      validatePackageName("index", REPOSITORY_ROOT);
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: package, the name is the one the build generates a library's entry under, so its module would be written over the barrel]`,
    );
  });
});
