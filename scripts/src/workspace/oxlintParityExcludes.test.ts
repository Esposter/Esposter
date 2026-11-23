/* oxlint-disable no-restricted-imports -- the repo-root linter config, which no `#` map can reach */
import { NON_SOURCE_SUFFIXES } from "@esposter/configuration/constants";
import { describe, expect, test } from "vitest";

import oxlintConfiguration from "../../../oxlint.config.ts";

/**
 * The genshin-world override repeats the suffixes the barrel generator and the declaration program leave out, as globs,
 * since the root config cannot import the constant without a build. This holds that copy to the constant: a suffix
 * that drifts from it leaves a file the build never compiles under the parity import ban, or the reverse.
 */
describe("oxlintParityExcludes", () => {
  test("are the suffixes the build leaves out", () => {
    expect.hasAssertions();

    const genshinWorldOverride = oxlintConfiguration.overrides?.find(({ files }) =>
      files.includes("packages/genshin-world/src/**/*.{ts,vue}"),
    );

    expect(genshinWorldOverride?.excludeFiles?.toSorted()).toStrictEqual(
      NON_SOURCE_SUFFIXES.map((suffix) => `**/*${suffix}`).toSorted(),
    );
  });
});
