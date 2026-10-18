import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readHandWrittenPages } from "#src/workspace/readHandWrittenPages.test";
import { basename, dirname } from "node:path";
import { describe, expect, test } from "vitest";

// An agent finds a capability by reading the index above it — the area's README, or a capability's own design where it
// Holds others without one — so a capability added beside its siblings with no row there is one nobody reads, and no
// Link breaks to say so
describe("openspecIndexes", () => {
  const SPECS_DIRECTORY = "openspec/specs";
  const CAPABILITY_PAGE_REGEX = /^openspec\/specs\/.+\/(?:design|spec)\.md$/u;

  test("every capability is linked from the index above it", { timeout: TREE_READ_TIMEOUT_MS }, async () => {
    expect.hasAssertions();

    const pages = await readHandWrittenPages();
    const markdownByPath = new Map(pages.map(({ markdown, path }) => [path, markdown]));
    const capabilityDirectories = new Set(
      pages.filter(({ path }) => CAPABILITY_PAGE_REGEX.test(path)).map(({ path }) => dirname(path)),
    );
    const unindexedCapabilities = [...capabilityDirectories]
      .filter((directory) => {
        const parent = dirname(directory);
        if (parent === SPECS_DIRECTORY) return false;
        const index = markdownByPath.get(`${parent}/README.md`) ?? markdownByPath.get(`${parent}/design.md`) ?? "";
        const name = basename(directory);
        return !index.includes(`](${name}/`) && !index.includes(`](./${name}/`);
      })
      .toSorted();

    expect(unindexedCapabilities).toStrictEqual([]);
  });
});
