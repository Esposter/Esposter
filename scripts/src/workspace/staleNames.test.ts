import { readCitingPages } from "#src/services/citations/readCitingPages";
import { readSourceComments } from "#src/services/citations/readSourceComments";
import { getStaleNames } from "#src/services/sweeps/staleNames/getStaleNames";
import { readDependencyNames } from "#src/services/sweeps/staleNames/readDependencyNames";
import { readSourceNames } from "#src/services/sweeps/staleNames/readSourceNames";
import { describe, expect, test } from "vitest";

/**
 * A spec, skill, ledger or README cites a code name in backticks, and nothing resolves it: `ai:citations:sync`
 * follows a file's rename, but a function, constant or component renamed in place leaves every sentence that
 * named it reading as it did. A backticked name is a claim that the code or an installed package holds it, so
 * one neither holds is stale — the `openspec` skill's rule ("Mechanical follow-through"), which is what leaves a name
 * only an external system declares written in quotes and a rule's invented example on a placeholder stem, so
 * that every hit here is a rename the prose missed. A source file's comments make the same claim, and a page's
 * citation is judged against the code alone as well, since a comment's own words would otherwise vouch for the name
 * it cites.
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

  test(
    "every name a source comment cites is one the code or an installed package holds",
    { timeout: STORE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      expect(
        getStaleNames(readSourceComments(), readSourceNames().union(readDependencyNames())).map(
          ({ name, path }) => `${path} → ${name}`,
        ),
      ).toStrictEqual([]);
    },
  );
});
