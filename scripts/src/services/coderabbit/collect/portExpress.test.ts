import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { describe, expect, test } from "vitest";

describe(portExpress, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, moveFile, publish, readSha, switchTo } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;
  const movedPath = `${TEST_FILENAME}/${TEST_FILENAME}/${filePath}`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;

  test("takes the mechanical commits out of queue order and leaves the rest", () => {
    expect.hasAssertions();

    // Rename detection needs bytes to match on — an empty file is never paired
    const mainSha = publish(MAIN_BRANCH, commitFile(filePath, " "));
    commitFile(nestedPath, "");
    const moveSha = moveFile(filePath, movedPath);
    const queueSha = commitFile(nestedPath, " ");
    const express = portExpress({ cwd: getCwd(), developSha: mainSha, mainSha, queueSha });

    expect(express).toStrictEqual({ shas: [moveSha], targetSha: readSha("HEAD") });
    expect(runGit(["diff", "--name-status", "-M", `${mainSha}..HEAD`], getCwd())).toBe(
      `R100\t${filePath}\t${movedPath}\n`,
    );
  });

  test("is closed while develop carries a window main lacks", () => {
    expect.hasAssertions();

    const mainSha = publish(MAIN_BRANCH, commitFile(filePath, " "));
    const developSha = commitFile(nestedPath, "");
    const queueSha = moveFile(filePath, movedPath);

    expect(portExpress({ cwd: getCwd(), developSha, mainSha, queueSha })).toStrictEqual({ shas: [] });
  });

  // Two moves that undo each other are each mechanical alone and nothing as a cut — a range with no diff proves
  // Nothing, so the lane refuses it and puts the tree back
  test("refuses a cut whose commits leave nothing behind and restores main", () => {
    expect.hasAssertions();

    const mainSha = publish(MAIN_BRANCH, commitFile(filePath, " "));
    moveFile(filePath, movedPath);
    const queueSha = moveFile(movedPath, filePath);
    switchTo(mainSha);

    expect(portExpress({ cwd: getCwd(), developSha: mainSha, mainSha, queueSha })).toStrictEqual({ shas: [] });
    expect(readSha("HEAD")).toBe(mainSha);
  });
});
