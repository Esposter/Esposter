import { checkIsExternalFile } from "#src/services/citations/checkIsExternalFile";
import { describe, expect, test } from "vitest";

describe(checkIsExternalFile, () => {
  test("treats a package's build output as external, not a repository file", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("packages/vue-phaserjs/dist/index.js")).toBe(true);
  });

  test("treats a repository-root build output as external", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("dist/index.js")).toBe(true);
  });

  test("keeps a tracked source file a repository file", () => {
    expect.hasAssertions();

    expect(checkIsExternalFile("packages/vue-phaserjs/src/index.ts")).toBe(false);
  });
});
