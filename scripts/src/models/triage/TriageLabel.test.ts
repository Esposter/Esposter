import { TriageLabel } from "#src/models/triage/TriageLabel";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { GITHUB_LABELS_DIRECTORY, TRIAGE_LABELS_PATH } from "#src/services/triage/constants";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The label column of the tracker's own table
const LABEL_ROW_REGEX = /^\| `(?<label>[\w-]+)`/gmu;

// What an `IssueLabel` resource calls the label it declares
const LABEL_NAME_REGEX = /name: "(?<name>[^"]+)"/gu;

/**
 * The enum copies a table the agent tree owns (`.agents/triage-labels.md`), because a label string is what `gh`
 * is handed and prose cannot be typed against. Two copies drift silently and neither failure is visible where it
 * is made: a label renamed in the table leaves the labeller writing one the skills no longer speak, and a label
 * the infrastructure never declares is one `gh issue edit --add-label` rejects at the tracker, halfway through a
 * triage run. Both are held here.
 */
describe("TriageLabel", () => {
  test("names every label the tracker's table does", () => {
    expect.hasAssertions();

    const table = readFileSync(join(REPOSITORY_ROOT, TRIAGE_LABELS_PATH), "utf8");
    const tabledLabels = Array.from(table.matchAll(LABEL_ROW_REGEX), ({ groups }) => groups?.label);

    expect(Object.values(TriageLabel).toSorted()).toStrictEqual(tabledLabels.toSorted());
  });

  test("names only labels the repository declares", () => {
    expect.hasAssertions();

    const labelsDirectory = join(REPOSITORY_ROOT, GITHUB_LABELS_DIRECTORY);
    const declared = readdirSync(labelsDirectory).flatMap((fileName) =>
      Array.from(
        readFileSync(join(labelsDirectory, fileName), "utf8").matchAll(LABEL_NAME_REGEX),
        ({ groups }) => groups?.name,
      ),
    );

    expect(Object.values(TriageLabel).filter((label) => !declared.includes(label))).toStrictEqual([]);
  });
});
