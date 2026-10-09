import { COLLECTOR_SOURCE_PATH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test } from "vitest";

describe("collectorSourcePath", { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, readSha } = setupFixtureRepository();
  // The basis every attempt count names, read the way the collector's entry point reads it at the run's start
  const basisRef = `HEAD:${COLLECTOR_SOURCE_PATH}`;

  // The queue's sessions change the `scripts` package on most pushes: a basis that moved with it would hand every
  // Capped step a fresh turn on every run, so no cap would ever hold
  test("keeps the basis over a commit to the package around the collector", () => {
    expect.hasAssertions();

    commitFile(`${COLLECTOR_SOURCE_PATH}/${TEST_FILENAME}`, "");
    const basis = readSha(basisRef);
    commitFile(`scripts/${TEST_FILENAME}`, "");

    expect(readSha(basisRef)).toBe(basis);
  });
});
