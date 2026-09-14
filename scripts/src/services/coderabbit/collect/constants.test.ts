import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assert, describe, expect, test } from "vitest";

const readWorkflowLines = (name: string): string[] =>
  readFileSync(join(REPOSITORY_ROOT, ".github/workflows", name), "utf8").split(/\r?\n/u);

describe("queueBranch", () => {
  // The runner pins everything but its triggers to the queue head, whichever event fired it: the trigger file
  // Calls the reusable workflow at that ref, the reusable workflow checks it out, and its retrigger dispatches
  // It. A workflow file cannot import the constant, so every place the two files spell the branch is pinned here
  // — a rename that moves the constant and not the files would have the runner call and check out a branch that
  // No longer exists, which is the deadlock the pin exists to close.
  test.each([
    ["the queue push trigger", "ReviewCollector.yaml", `      - ${QUEUE_BRANCH}`],
    [
      "the reusable workflow's ref",
      "ReviewCollector.yaml",
      `    uses: Esposter/Esposter/.github/workflows/run-review-collector.yaml@${QUEUE_BRANCH}`,
    ],
    ["the checkout ref", "run-review-collector.yaml", `          ref: ${QUEUE_BRANCH}`],
    [
      "the retrigger's dispatch ref",
      "run-review-collector.yaml",
      `        run: gh workflow run ReviewCollector.yaml --repo "$GITHUB_REPOSITORY" --ref ${QUEUE_BRANCH}`,
    ],
  ])("the runner spells %s as the constant", (_, name, line) => {
    expect.hasAssertions();

    expect(readWorkflowLines(name)).toContain(line);
  });
});

describe("collector secrets", () => {
  // The trigger hands the call a list rather than inheriting, so that a step added to the pinned `ai/queue` copy
  // Reaches these two and not the Azure and Pulumi deployment credentials. What a list costs is the sync, and the
  // Caller is the one file that cannot be pinned — GitHub reads it from whichever ref the event names, so a
  // Secret the runner grows and `main`'s copy of the trigger does not yet map arrives empty on a `status` or an
  // `issue_comment` alone. These three assertions are what makes that a failing test rather than a rule someone
  // Remembers: the runner may declare only what the trigger hands it, and may spend only what it declared.
  const COLLECTOR_SECRETS = ["CLAUDE_CODE_OAUTH_TOKEN", "REVIEW_COLLECTOR_TOKEN"];
  const runnerLines = readWorkflowLines("run-review-collector.yaml");

  test.each(COLLECTOR_SECRETS)("the trigger hands the call %s", (name) => {
    expect.hasAssertions();

    expect(readWorkflowLines("ReviewCollector.yaml")).toContain(`      ${name}: \${{ secrets.${name} }}`);
  });

  // A declaration is its key, its description and `required: true` — the last is what turns an unmapped secret
  // Into a call GitHub refuses rather than a token that is empty in the step that spends it
  test("the runner requires exactly what the trigger hands it", () => {
    expect.hasAssertions();

    const declared = runnerLines.flatMap((line, index) =>
      /^ {6}[A-Z_]+:$/u.test(line) && runnerLines.at(index + 2) === "        required: true"
        ? [line.trim().slice(0, -1)]
        : [],
    );

    expect(declared.toSorted()).toStrictEqual(COLLECTOR_SECRETS);
  });

  test("the runner spends no secret the trigger does not hand it", () => {
    expect.hasAssertions();

    const spent = runnerLines.join("\n").match(/(?<=secrets\.)[A-Z_]+/gu);
    assert.exists(spent);

    expect([...new Set(spent)].toSorted()).toStrictEqual(COLLECTOR_SECRETS);
  });
});
