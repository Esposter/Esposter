import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { foldCandidate } from "#src/services/coderabbit/collect/foldCandidate";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(foldCandidate, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, commitFiles, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;
  const readParents = (sha: string): string[] =>
    runGit(["rev-list", "--parents", "--max-count=1", sha], getCwd()).trim().split(" ").slice(1);

  test("fast-forwards to the cut when the queue sits on develop and main is already carried", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const queueShas = [commitFile(filePath, ""), commitFile(nestedPath, "")];
    const targetSha = foldCandidate({
      cwd: getCwd(),
      developSha,
      fixCount: 0,
      frontierSha: developSha,
      queueSha: takeOne(queueShas, 1),
      queueShas,
    });

    expect(targetSha).toBe(takeOne(queueShas, 1));
  });

  test("names the replayed head when the cut carries a merge the port never counted", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const firstSha = commitFile(filePath, "");
    switchTo(developSha);
    commitFile(nestedPath, "");
    runGit(["merge", "--quiet", "--no-edit", "--no-ff", firstSha], getCwd());
    const queueSha = commitFile(nestedPath, " ");
    switchTo(developSha);
    for (const sha of [firstSha, queueSha]) pickCommit(sha, getCwd());
    const targetSha = foldCandidate({
      cwd: getCwd(),
      developSha,
      fixCount: 0,
      frontierSha: developSha,
      queueSha,
      queueShas: [firstSha, queueSha],
    });

    expect(targetSha).toBe(readSha("HEAD"));
    expect(targetSha).not.toBe(queueSha);
  });

  test("folds a main that advanced on its own into the window", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const mainSha = publish(MAIN_BRANCH, commitFile(nestedPath, ""));
    switchTo(developSha);
    const queueSha = commitFile(filePath, "");
    const targetSha = foldCandidate({
      cwd: getCwd(),
      developSha,
      fixCount: 0,
      frontierSha: developSha,
      queueSha,
      queueShas: [queueSha],
    });

    expect(targetSha).toBe(readSha("HEAD"));
    expect(readParents(targetSha)).toStrictEqual([queueSha, mainSha]);
  });

  test("undoes a fold that alone puts the window over the cap", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    publish(
      MAIN_BRANCH,
      commitFiles(
        Array.from({ length: REVIEW_FILE_CAP }, (_, index) => `${TEST_FILENAME}/${index}`),
        "",
      ),
    );
    switchTo(developSha);
    const queueSha = commitFile(filePath, "");
    const targetSha = foldCandidate({
      cwd: getCwd(),
      developSha,
      fixCount: 0,
      frontierSha: developSha,
      queueSha,
      queueShas: [queueSha],
    });

    expect(targetSha).toBe(queueSha);
    expect(readSha("HEAD")).toBe(queueSha);
  });
});
