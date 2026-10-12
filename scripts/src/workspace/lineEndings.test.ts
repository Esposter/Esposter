import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { readCrlfStoredPaths } from "#src/services/shared/readCrlfStoredPaths";
import { runGit } from "#src/services/shared/runGit";
import { setupFixtureRepository } from "#src/services/shared/setupFixtureRepository.test";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

describe("lineEndings", () => {
  const { commitFile, getCwd } = setupFixtureRepository();

  test("no tracked text file is stored with a carriage return", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readCrlfStoredPaths()).toStrictEqual([]);
  });

  // The probe is a fixture's own repository, so the check is shown to fail on a carriage return without staging one here.
  // The clone keeps its carriage return only with `core.autocrlf` off, which a machine's global setting would undo
  test("flags a text file stored with a carriage return", () => {
    expect.hasAssertions();

    runGit(["config", "core.autocrlf", "false"], getCwd());
    commitFile(`${TEST_FILENAME}.md`, "a\r\n");

    expect(readCrlfStoredPaths(getCwd())).toStrictEqual([`${TEST_FILENAME}.md`]);
  });
});
