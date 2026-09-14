import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test } from "vitest";

describe(pushBranch, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, installPreReceiveHook, publish, readSha, switchTo } = setupFixtureRepository();

  test("moves the remote branch to the sha", () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const sha = commitFile(TEST_FILENAME, "");
    const isPushed = pushBranch({
      branch: DEVELOP_BRANCH,
      cwd: getCwd(),
      expectedSha: developSha,
      isDryRun: false,
      sha,
    });

    expect(isPushed).toBe(true);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(sha);
  });

  // The early exit: a branch already known to be stale is not worth a push the lease would refuse anyway
  test("pushes nothing when the branch moved before the run reached the push", () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const movedSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    switchTo(developSha);
    const sha = commitFile(TEST_FILENAME, " ");
    const isPushed = pushBranch({
      branch: DEVELOP_BRANCH,
      cwd: getCwd(),
      expectedSha: developSha,
      isDryRun: false,
      sha,
    });

    expect(isPushed).toBe(false);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(movedSha);
  });

  // The swap is the push rather than the read before it: the remote moves after the fetch, and the lease is what
  // Refuses the update — an outcome the run reports rather than an exception that fails the job
  test("reports a branch that moved while the push was in flight", () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const movedSha = publish(TEST_FILENAME, commitFile(TEST_FILENAME, ""));
    installPreReceiveHook(`env -u GIT_QUARANTINE_PATH git update-ref refs/heads/${DEVELOP_BRANCH} ${movedSha}`);
    switchTo(developSha);
    const sha = commitFile(TEST_FILENAME, " ");
    const isPushed = pushBranch({
      branch: DEVELOP_BRANCH,
      cwd: getCwd(),
      expectedSha: developSha,
      isDryRun: false,
      sha,
    });

    expect(isPushed).toBe(false);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(movedSha);
  });

  // The crossing case: a rejection is only a lost lease when the ref actually moved, so a push refused with the
  // Branch still where it was reaches the job log as itself. Git's message carries the fixture's path and shas,
  // Which is why the rejection is matched rather than snapshotted.
  test("fails the run when a rejected push left the branch where it was", () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    installPreReceiveHook("exit 1");
    const sha = commitFile(TEST_FILENAME, "");

    expect(() =>
      pushBranch({ branch: DEVELOP_BRANCH, cwd: getCwd(), expectedSha: developSha, isDryRun: false, sha }),
    ).toThrow(/pre-receive hook declined/u);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // The lease makes the push forced, so this is the guard standing in for the non-fast-forward git used to refuse
  // On its own — and it stops before the push rather than after it
  test("refuses a target that is not a descendant of the sha it was built on", () => {
    expect.hasAssertions();

    const mainSha = readSha(MAIN_BRANCH);
    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    switchTo(mainSha);
    const sha = commitFile(TEST_FILENAME, " ");

    expect(() =>
      pushBranch({ branch: DEVELOP_BRANCH, cwd: getCwd(), expectedSha: developSha, isDryRun: false, sha }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, fdd4216bd6a668675492e897f4bacc4a7e2f3294 is not a descendant of develop at 8b95a9a87470d13aa10b8cb461c2af1d9afe7966]`,
    );
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // The whole of what a dry run withholds is this one command
  test("withholds the push on a dry run", () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const sha = commitFile(TEST_FILENAME, "");
    const isPushed = pushBranch({
      branch: DEVELOP_BRANCH,
      cwd: getCwd(),
      expectedSha: developSha,
      isDryRun: true,
      sha,
    });

    expect(isPushed).toBe(true);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });
});
