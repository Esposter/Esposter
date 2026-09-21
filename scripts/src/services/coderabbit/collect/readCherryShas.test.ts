import { DEVELOP_BRANCH, MAIN_BRANCH, QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test } from "vitest";

describe(readCherryShas, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, deleteFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;
  const pick = (sha: string): string => {
    runGit(["cherry-pick", "-x", "--quiet", sha], getCwd());
    return readSha("HEAD");
  };

  // The express lane cut the commit onto main under the sha it had then; main went on to delete what it created,
  // And the queue was rebuilt over that, so the commit now sits on the queue under a later sha — non-empty, its
  // Body naming the original — with the copy below the merge base. By its newest sha alone it reads as owed.
  test("reads a commit as ported when a copy anywhere on main names any of its earlier identities", () => {
    expect.hasAssertions();

    const rootSha = readSha("HEAD");
    const originalSha = commitFile(filePath, "");
    switchTo(rootSha);
    pick(originalSha);
    const mainSha = publish(MAIN_BRANCH, deleteFile(filePath));
    const developSha = publish(DEVELOP_BRANCH, mainSha);
    const rewrittenSha = pick(originalSha);
    const owedSha = commitFile(nestedPath, "");
    const queueSha = publish(QUEUE_BRANCH, owedSha);

    expect(runGit(["merge-base", `origin/${MAIN_BRANCH}`, queueSha], getCwd()).trim()).toBe(mainSha);
    expect(runGit(["cherry", developSha, queueSha], getCwd())).toBe(`+ ${rewrittenSha}\n+ ${owedSha}\n`);
    expect(readCherryShas(developSha, queueSha, getCwd())).toStrictEqual([owedSha]);
  });
});
