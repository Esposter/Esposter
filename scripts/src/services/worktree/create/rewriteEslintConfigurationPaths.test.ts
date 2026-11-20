import { rewriteEslintConfigurationPaths } from "#src/services/worktree/create/rewriteEslintConfigurationPaths";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(rewriteEslintConfigurationPaths, () => {
  test("repoints each package import through either virtual store to the path the resolver gives, scoped packages included, and keeps the path beneath the package", () => {
    expect.hasAssertions();

    const paths: Record<string, string> = {
      "@nuxt/eslint-config":
        "../../../../../../../store/links/@nuxt/eslint-config/1.0.0/b/node_modules/@nuxt/eslint-config",
      "eslint-typegen": "../../../node_modules/.pnpm/eslint-typegen@1.0.0_b/node_modules/eslint-typegen",
    };
    const configuration = [
      "import typegen from '../../../node_modules/.pnpm/eslint-typegen@1.0.0_a/node_modules/eslint-typegen/dist/index.mjs';",
      "import { createConfigForNuxt } from '../../../../store/links/@nuxt/eslint-config/1.0.0/a/node_modules/@nuxt/eslint-config/dist/flat.mjs';",
      "import { fileURLToPath } from 'node:url';",
    ].join("\n");

    expect(rewriteEslintConfigurationPaths(configuration, (packageName) => takeOne(paths, packageName))).toBe(
      [
        "import typegen from '../../../node_modules/.pnpm/eslint-typegen@1.0.0_b/node_modules/eslint-typegen/dist/index.mjs';",
        "import { createConfigForNuxt } from '../../../../../../../store/links/@nuxt/eslint-config/1.0.0/b/node_modules/@nuxt/eslint-config/dist/flat.mjs';",
        "import { fileURLToPath } from 'node:url';",
      ].join("\n"),
    );
  });
});
