import { rewriteEslintConfigurationPaths } from "#src/services/worktree/create/rewriteEslintConfigurationPaths";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(rewriteEslintConfigurationPaths, () => {
  test("repoints each pnpm package path to the folder the resolver names, scoped packages included, and keeps the path beneath the package", () => {
    expect.hasAssertions();

    const folders: Record<string, string> = {
      "@nuxt/eslint-config": "@nuxt+eslint-config@1.17.0_9e8f",
      "eslint-typegen": "eslint-typegen@2.3.2_1d2c",
    };
    const configuration = [
      "import typegen from '../../../node_modules/.pnpm/eslint-typegen@2.3.2_0f1e/node_modules/eslint-typegen/dist/index.mjs';",
      "import { createConfigForNuxt } from '../../../node_modules/.pnpm/@nuxt+eslint-config@1.17.0_7a6b/node_modules/@nuxt/eslint-config/dist/flat.mjs';",
      "import { fileURLToPath } from 'node:url';",
    ].join("\n");

    expect(
      rewriteEslintConfigurationPaths(configuration, (packageName) => takeOne(folders, packageName)),
    ).toStrictEqual(
      [
        "import typegen from '../../../node_modules/.pnpm/eslint-typegen@2.3.2_1d2c/node_modules/eslint-typegen/dist/index.mjs';",
        "import { createConfigForNuxt } from '../../../node_modules/.pnpm/@nuxt+eslint-config@1.17.0_9e8f/node_modules/@nuxt/eslint-config/dist/flat.mjs';",
        "import { fileURLToPath } from 'node:url';",
      ].join("\n"),
    );
  });
});
