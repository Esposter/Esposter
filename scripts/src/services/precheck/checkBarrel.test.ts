import type { ExportsGeneration } from "@esposter/configuration";

import { checkBarrel } from "#src/services/precheck/checkBarrel";
import { generateExports } from "@esposter/configuration";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, test, vi } from "vitest";

const { repositoryRoot } = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  return { repositoryRoot: mkdtempSync(join(tmpdir(), "check-barrel-")) };
});

vi.mock(import("#src/services/shared/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  REPOSITORY_ROOT: repositoryRoot,
}));
// The precheck spawns the generator from the main checkout's build, which this test runs in process instead
vi.mock(import("#src/services/precheck/spawnGenerateExports"), () => ({
  spawnGenerateExports: (packageDirectory: string, exportsGeneration: ExportsGeneration, lazyDirectories: string[]) => {
    generateExports(packageDirectory, exportsGeneration, lazyDirectories);
  },
}));

describe(checkBarrel, () => {
  const PACKAGE_DIRECTORY = "packages/barrel-package";

  afterAll(() => {
    rmSync(repositoryRoot, { force: true, recursive: true });
  });

  // The source barrel lists the component barrel as one line, so a component added or removed shows only in the
  // Component barrel, which has to be checked on its own
  test("names the component barrel's missing and extra lines, not only the source barrel's", () => {
    expect.hasAssertions();

    const packageRoot = join(repositoryRoot, PACKAGE_DIRECTORY);
    const sourceDirectory = join(packageRoot, "src");
    const componentsDirectory = join(sourceDirectory, "components");
    mkdirSync(componentsDirectory, { recursive: true });
    writeFileSync(join(sourceDirectory, "util.ts"), "export const util = 0;");
    writeFileSync(join(componentsDirectory, "Foo.vue"), "<template />");
    generateExports(packageRoot, "vue");
    writeFileSync(join(componentsDirectory, "Bar.vue"), "<template />");
    rmSync(join(componentsDirectory, "Foo.vue"));

    expect(checkBarrel(PACKAGE_DIRECTORY, repositoryRoot, false).findings).toStrictEqual([
      `${PACKAGE_DIRECTORY}/src/components/index.ts missing export { default as Bar } from "./Bar.vue";`,
      `${PACKAGE_DIRECTORY}/src/components/index.ts extra export { default as Foo } from "./Foo.vue";`,
    ]);
  });
});
