import { EXPRESS_TRAILER, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readClaimedShas } from "#src/services/coderabbit/collect/readClaimedShas";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test } from "vitest";

describe(portExpress, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;
  // The claim, as the reshaper or a session writes it
  const claimExpress = (): string => {
    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );
    return readSha("HEAD");
  };

  const cut = (developSha: string, mainSha: string, queueSha: string) =>
    portExpress({ cwd: getCwd(), mainSha, shas: readClaimedShas({ cwd: getCwd(), developSha, mainSha, queueSha }) });

  test("takes the commits that claim no review out of queue order and leaves the rest", () => {
    expect.hasAssertions();

    const mainSha = publish(MAIN_BRANCH, "HEAD");
    commitFile(nestedPath, "");
    commitFile(filePath, "");
    const expressSha = claimExpress();
    const queueSha = commitFile(nestedPath, " ");
    const express = cut(mainSha, mainSha, queueSha);

    expect(express).toStrictEqual({ shas: [expressSha], targetSha: readSha("HEAD") });
    expect(runGit(["diff", "--name-only", `${mainSha}..HEAD`], getCwd())).toBe(`${filePath}\n`);
  });

  // The lane is open while a window is in flight: `main` moves under `develop`, and the fold brings it across
  test("cuts onto main while develop carries a window main lacks", () => {
    expect.hasAssertions();

    const mainSha = publish(MAIN_BRANCH, "HEAD");
    const developSha = commitFile(nestedPath, "");
    commitFile(filePath, "");
    const queueSha = claimExpress();
    const express = cut(developSha, mainSha, queueSha);

    expect(express).toStrictEqual({ shas: [queueSha], targetSha: readSha("HEAD") });
    expect(runGit(["rev-list", "--parents", "--max-count=1", "HEAD"], getCwd()).trim()).toBe(
      `${readSha("HEAD")} ${mainSha}`,
    );
  });

  // The copy names its original, so the original is owed to neither branch afterwards — a window never re-ports it
  test("a cut commit is no longer owed to develop", () => {
    expect.hasAssertions();

    const mainSha = publish(MAIN_BRANCH, "HEAD");
    commitFile(filePath, "");
    const queueSha = claimExpress();
    const { targetSha } = cut(mainSha, mainSha, queueSha);
    publish(MAIN_BRANCH, targetSha ?? "");

    expect(readCherryShas(mainSha, queueSha, getCwd())).toStrictEqual([]);
  });

  test("cuts nothing a window already carries, and nothing without the claim", () => {
    expect.hasAssertions();

    const mainSha = publish(MAIN_BRANCH, "HEAD");
    commitFile(filePath, "");
    const carriedSha = claimExpress();
    switchTo(mainSha);
    runGit(["cherry-pick", "-x", "--quiet", carriedSha], getCwd());
    const developSha = readSha("HEAD");
    switchTo(carriedSha);
    const queueSha = commitFile(nestedPath, "");

    expect(readClaimedShas({ cwd: getCwd(), developSha, mainSha, queueSha })).toStrictEqual([]);
    expect(cut(developSha, mainSha, queueSha)).toStrictEqual({ shas: [] });
    expect(readSha("HEAD")).toBe(queueSha);
  });
});
