import { readGcsimLinkFindings } from "#src/services/sweeps/gcsimLinks/readGcsimLinkFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * The kits README's rule — gcsim is read at its last MIT tag alone — held over every link a comment, a spec or a
 * skill makes into gcsim's tree. A link to its main branch cites code under gcsim's later licence, and reads as the
 * MIT source the comment beside it names.
 */
describe("gcsimLinks", () => {
  test(
    "no tracked file links gcsim's tree at a ref other than the kits' tag",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      expect(readGcsimLinkFindings()).toStrictEqual([]);
    },
  );
});
