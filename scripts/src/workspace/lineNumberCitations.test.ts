import { readLineNumberCitationFindings } from "#src/services/citations/readLineNumberCitationFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * A page that cites a line of a file of the repository by its number cites a measurement: the next edit to the file
 * moves the line, and the page points at whatever now sits there. A citation names the symbol, the section's title or
 * a link to the page instead, and the `openspec` skill's `references/links-and-sources.md` states the rule and the forms
 * it covers, which `getLineNumberCitations` reads.
 */
describe(readLineNumberCitationFindings, () => {
  test(
    "no spec or skill cites a line of a file of the repository by its number",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      expect(readLineNumberCitationFindings()).toStrictEqual([]);
    },
  );
});
