import { readCitingPages } from "#src/services/citations/readCitingPages";
import { getStaleNames } from "#src/services/sweeps/staleNames/getStaleNames";
import { readDependencyNames } from "#src/services/sweeps/staleNames/readDependencyNames";
import { readSourceNames } from "#src/services/sweeps/staleNames/readSourceNames";
import { describe, expect, test } from "vitest";

/**
 * A docs page, skill, ledger or README cites a code name in backticks, and nothing resolves it: `ai:citations:sync`
 * follows a file's rename, but a function, constant or component renamed in place leaves every sentence that
 * named it reading as it did. A backticked name is a claim that the tree or an installed package holds it, so
 * one neither holds is stale — the `docs` skill's rule ("Mechanical follow-through"), which is what leaves a name
 * only an external system declares written in quotes and a rule's invented example on a placeholder stem, so
 * that every hit here is a rename the prose missed.
 */
describe("staleNames", () => {
  // A cold read of the store's declarations, before its cache under `node_modules/.cache` exists
  const STORE_READ_TIMEOUT_MS = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");

  test(
    "every cited code name is one the tree or an installed package holds",
    { timeout: STORE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      expect(
        getStaleNames(readCitingPages(), readSourceNames().union(readDependencyNames())).map(
          ({ name, path }) => `${path} → ${name}`,
        ),
      ).toStrictEqual([]);
    },
  );
});
