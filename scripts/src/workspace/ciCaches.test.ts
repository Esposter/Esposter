import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readWorkflowFiles = (): { content: string; path: string }[] =>
  Array.from(readdirSync(join(REPOSITORY_ROOT, ".github"), { recursive: true }), String)
    .filter((path) => /\.ya?ml$/u.test(path))
    .map((path) => ({ content: readFileSync(join(REPOSITORY_ROOT, ".github", path), "utf8"), path }));

// Each list item is one step or one entry, so a save step's `if:` and its `uses:` are read together
const getListItems = (content: string): string[] => content.split(/^\s*- /mu);

describe("ciCaches", () => {
  // A cache is saved from the default branch and `ai/queue` alone, so every other branch restores what those two saved.
  // Restoring rather than writing its own copy is the point. Each save has to carry this condition, which
  // `openspec/specs/architecture/ci-caches/design.md` states
  const SAVING_BRANCH_CONDITION = "github.ref_name == 'main' || github.ref_name == 'ai/queue'";

  test("no workflow or action uses the combined cache action, which saves on every run", () => {
    expect.hasAssertions();

    const offenders = readWorkflowFiles()
      .filter(({ content }) => /uses: actions\/cache@/u.test(content))
      .map(({ path }) => path);

    expect(offenders).toStrictEqual([]);
  });

  test("the pnpm store's own cache is off, since it saves on every run", () => {
    expect.hasAssertions();

    const offenders = readWorkflowFiles()
      .filter(({ content }) => /^\s*cache: true$/mu.test(content))
      .map(({ path }) => path);

    expect(offenders).toStrictEqual([]);
  });

  test("every cache save runs only on the default branch and ai/queue", () => {
    expect.hasAssertions();

    const offenders = readWorkflowFiles().flatMap(({ content, path }) =>
      getListItems(content)
        .filter((item) => item.includes("actions/cache/save") && !item.includes(SAVING_BRANCH_CONDITION))
        .map(() => path),
    );

    expect(offenders).toStrictEqual([]);
  });

  // A task run that replayed only some of its sub-tasks still produced a new result, so it saves; only a summary that
  // reads every task hit is a replay
  test("a cached task run counts as replayed only when its summary reads every task hit", () => {
    expect.hasAssertions();

    const action = readFileSync(join(REPOSITORY_ROOT, ".github", "actions", "run-cached-task", "action.yaml"), "utf8");
    const [, pattern = ""] = /grep -qE '([^']+)' "\$RUNNER_TEMP\/vp-run\.log"/u.exec(action) ?? [];
    const replayedRegex = new RegExp(pattern, "u");

    expect(replayedRegex.test("vp run: 30/30 cache hit (100%), 31/31 successful")).toBe(true);
    expect(replayedRegex.test("vp run: 29/30 cache hit (97%), 31/31 successful")).toBe(false);
    expect(replayedRegex.test("vp run: 0/30 cache hit (0%), 31/31 successful")).toBe(false);
    expect(replayedRegex.test("~/packages/azure$ pnpm run build ◉ cache hit, replaying")).toBe(false);
  });
});
