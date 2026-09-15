import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { describe, expect, test } from "vitest";

// The lockfile conflict — thrown away and rebuilt with `pnpm i` — is the one branch not proved here: it installs
// Against a real workspace, which no fixture repository holds
describe(mergeMain, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, deleteFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;

  test(`${MergeMainOutcome.AlreadyMerged}: main is an ancestor of the candidate`, () => {
    expect.hasAssertions();

    const headSha = commitFile(filePath, "");

    expect(mergeMain(getCwd())).toBe(MergeMainOutcome.AlreadyMerged);
    expect(readSha("HEAD")).toBe(headSha);
  });

  test(`${MergeMainOutcome.Merged}: main's own commits join the candidate as a merge`, () => {
    expect.hasAssertions();

    const rootSha = readSha("HEAD");
    const mainSha = publish(MAIN_BRANCH, commitFile(nestedPath, ""));
    switchTo(rootSha);
    const candidateSha = commitFile(filePath, "");
    const outcome = mergeMain(getCwd());

    expect(outcome).toBe(MergeMainOutcome.Merged);
    expect(runGit(["rev-list", "--parents", "--max-count=1", "HEAD"], getCwd()).trim()).toBe(
      `${readSha("HEAD")} ${candidateSha} ${mainSha}`,
    );
  });

  test(`${MergeMainOutcome.Conflicted}: a conflict outside the lockfile aborts and leaves the candidate as it was`, () => {
    expect.hasAssertions();

    const baseSha = commitFile(filePath, "");
    publish(MAIN_BRANCH, commitFile(filePath, " "));
    switchTo(baseSha);
    const candidateSha = deleteFile(filePath);
    const outcome = mergeMain(getCwd());

    expect(outcome).toBe(MergeMainOutcome.Conflicted);
    expect(readSha("HEAD")).toBe(candidateSha);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
  });
});
