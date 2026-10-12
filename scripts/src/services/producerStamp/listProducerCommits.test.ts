import { listProducerCommits } from "#src/services/producerStamp/listProducerCommits";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { runGit } from "#src/services/shared/runGit";
import { setupFixtureRepository } from "#src/services/shared/setupFixtureRepository.test";
import { describe, expect, test } from "vitest";

describe(listProducerCommits, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, readSha, switchTo } = setupFixtureRepository();
  // Every fixture commit is titled by the path it touches, so the stamp's commit and each one touching the producer
  // Share a subject
  const producerPath = TEST_FILENAME;

  test("lists the commits on a stamp's commit's ancestry since it", () => {
    expect.hasAssertions();

    const stampSha = commitFile(producerPath, "");
    const laterSha = commitFile(producerPath, " ");
    const laterShortSha = runGit(["rev-parse", "--short", laterSha], getCwd()).trim();

    expect(listProducerCommits(stampSha, [producerPath], getCwd())).toStrictEqual({
      commits: [`${laterShortSha} ${producerPath}`],
      isApproximate: false,
    });
  });

  test("reads the recent window for a commit HEAD does not hold", () => {
    expect.hasAssertions();

    const rootSha = readSha("HEAD");
    const stampSha = commitFile(producerPath, "");
    switchTo(rootSha);
    commitFile(producerPath, " ");

    // Every fixture commit is dated at the epoch, so the window holds none of them
    expect(listProducerCommits(stampSha, [producerPath], getCwd())).toStrictEqual({ commits: [], isApproximate: true });
  });
});
