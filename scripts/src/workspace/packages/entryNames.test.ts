import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { getEntryNameFailures } from "#src/services/workspace/getEntryNameFailures";
import { describe, expect, test } from "vitest";

/**
 * A package's root entry is `src/index.ts`, and a Nuxt module's is `src/module.ts`, Nuxt's own module-entry convention.
 * The rule is stated once, in `getEntryNameFailures`, and this holds every workspace package that exports a `.` entry
 * to it. Which packages are Nuxt modules is read from their own `@nuxt/kit` dependency, never from a list kept here.
 */
describe("entryNames", () => {
  test("every workspace package's root entry is src/index.ts, or src/module.ts for a Nuxt module", () => {
    expect.hasAssertions();

    const failures = readWorkspacePackages(REPOSITORY_ROOT)
      .filter(({ manifest }) => manifest.exports?.["."] !== undefined)
      .flatMap(({ manifest }) => getEntryNameFailures(manifest));

    expect(failures).toStrictEqual([]);
  });
});
