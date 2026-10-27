import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readWorkflowFiles = (): { path: string; content: string }[] =>
  [...readdirSync(join(REPOSITORY_ROOT, ".github"), { recursive: true })]
    .map(String)
    .filter((path) => /\.ya?ml$/u.test(path))
    .map((path) => ({ content: readFileSync(join(REPOSITORY_ROOT, ".github", path), "utf8"), path }));

// Each list item is one step or one entry, so a save step's `if:` and its `uses:` are read together
const getListItems = (content: string): string[] => content.split(/^\s*- /mu);

describe("CI caches", () => {
  // A cache is saved from the default branch and `ai/queue` alone, so every other branch restores what those two saved
  // rather than writing its own copy. Each save has to carry this condition, which
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
});
