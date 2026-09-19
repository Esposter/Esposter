import { TriageLabel } from "#src/models/triage/TriageLabel";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { TRIAGE_LABELS_PATH } from "#src/services/triage/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The label column of the tracker's own table
const LABEL_ROW_REGEX = /^\| `(?<label>[\w-]+)`/gmu;

/**
 * The enum copies a table the agent tree owns (`.agents/triage-labels.md`), because a label string is what `gh`
 * is handed and prose cannot be typed against. A copy drifts silently — a label renamed in the table leaves the
 * labeller writing one the tracker no longer has, and `gh` accepts it by creating it — so the copy is held to
 * its source here rather than trusted.
 */
describe("TriageLabel", () => {
  test("names every label the tracker's table does", () => {
    expect.hasAssertions();

    const table = readFileSync(join(REPOSITORY_ROOT, TRIAGE_LABELS_PATH), "utf8");
    const tabledLabels = Array.from(table.matchAll(LABEL_ROW_REGEX), ({ groups }) => groups?.label);

    expect(Object.values(TriageLabel).toSorted()).toStrictEqual(tabledLabels.toSorted());
  });
});
