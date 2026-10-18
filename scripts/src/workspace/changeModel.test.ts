import { PROPOSAL_DESIGN_FILE, PROPOSAL_METADATA_FILE, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// A design is executed cold later and weighed by who wrote it, which git cannot say: it names the committer, not the
// Model behind the design (`openspec` skill, `references/change-metadata.md`). A roadmap designs nothing and has no
// Design, and the archive is the record of what shipped
describe("changeModel", () => {
  const MODEL_REGEX = /^x-model: claude-[\d.a-z-]+$/mu;

  test("every open change with a design names the model that wrote it", () => {
    expect.hasAssertions();

    const changesDirectory = join(REPOSITORY_ROOT, PROPOSALS_DIRECTORY);
    const unnamed = readdirSync(changesDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(changesDirectory, entry.name, PROPOSAL_DESIGN_FILE)))
      .map(({ name }) => name)
      .filter((id) => {
        const metadataPath = join(changesDirectory, id, PROPOSAL_METADATA_FILE);
        return !existsSync(metadataPath) || !MODEL_REGEX.test(readFileSync(metadataPath, "utf8"));
      });

    expect(unnamed).toStrictEqual([]);
  });
});
