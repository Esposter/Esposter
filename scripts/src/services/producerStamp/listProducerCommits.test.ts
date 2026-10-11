import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { listProducerCommits } from "#src/services/producerStamp/listProducerCommits";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test } from "vitest";

describe(listProducerCommits, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, readSha, switchTo } = setupFixtureRepository();
  // Every fixture commit is titled by the path it touches, so the stamp's commit and each one touching the producer
  // Share a subject
  const producerPath = TEST_FILENAME;

  test("lists from the replay of a stamp's commit the queue rewrote", () => {
    expect.hasAssertions();

    const rootSha = readSha("HEAD");
    const stampSha = commitFile(producerPath, "");
    switchTo(rootSha);
    commitFile(`${TEST_FILENAME}.ts`, "");
    pickCommit(stampSha, getCwd());
    const laterSha = commitFile(producerPath, " ");
    const laterShortSha = runGit(["rev-parse", "--short", laterSha], getCwd()).trim();

    expect(listProducerCommits(stampSha, [producerPath], getCwd())).toStrictEqual({
      commits: [`${laterShortSha} ${producerPath}`],
      isApproximate: false,
    });
  });

  test("reads the recent window for a commit that shares a branch commit's subject but not its change", () => {
    expect.hasAssertions();

    const rootSha = readSha("HEAD");
    const stampSha = commitFile(producerPath, "");
    switchTo(rootSha);
    commitFile(producerPath, " ");

    // Every fixture commit is dated at the epoch, so the window holds none of them
    expect(listProducerCommits(stampSha, [producerPath], getCwd())).toStrictEqual({ commits: [], isApproximate: true });
  });
});
