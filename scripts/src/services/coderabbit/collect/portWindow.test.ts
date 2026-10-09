import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(portWindow, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, commitFiles, deleteFile, getCwd, readSha, switchTo } = setupFixtureRepository();
  const overflowPaths = Array.from({ length: REVIEW_FILE_CAP + 1 }, (_value, index) => `${TEST_FILENAME}/${index}`);
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

  test("ports the fixes first and the queue after them, counting from the window's base", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const fixSha = commitFile(filePath, "");
    switchTo(developSha);
    const queueShas = [commitFile(nestedPath, ""), commitFile(nestedPath, " ")];
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: REVIEW_FILE_CAP,
      fixShas: [fixSha],
      queueSha: takeOne(queueShas, 1),
    });

    expect(port).toStrictEqual({ fileCount: 2, fixCount: 1, heldSha: undefined, queueShas });
    expect(runGit(["log", "--format=%s", `${developSha}..HEAD`], getCwd())).toBe(
      `${nestedPath}\n${nestedPath}\n${filePath}\n`,
    );
  });

  // A commit claiming no review is the express lane's; the window carries what follows it as if it were not there
  test("skips a queue commit claiming no review and ports what follows it", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    commitFiles(overflowPaths, "");
    claimExpress();
    const queueSha = commitFile(filePath, "");
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: REVIEW_FILE_CAP,
      fixShas: [],
      queueSha,
    });

    expect(port).toStrictEqual({ fileCount: 1, fixCount: 0, heldSha: undefined, queueShas: [queueSha] });
  });

  // The deadlock this breaks: a claimed commit red on its own, its fix the unclaimed commit after it — the lane
  // Cannot cut the one green and the window cannot apply the other without it
  test("carries a claimed commit that a later queue commit builds on", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    commitFile(filePath, "");
    const claimedSha = claimExpress();
    const queueSha = commitFile(filePath, " ");
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: REVIEW_FILE_CAP,
      fixShas: [],
      queueSha,
    });

    expect(port).toStrictEqual({ fileCount: 1, fixCount: 0, heldSha: undefined, queueShas: [claimedSha, queueSha] });
  });

  test("holds the first queue commit that conflicts with develop", () => {
    expect.hasAssertions();

    const rootSha = readSha("HEAD");
    const developSha = commitFile(filePath, " ");
    switchTo(rootSha);
    commitFile(filePath, "");
    const heldSha = deleteFile(filePath);
    const queueSha = commitFile(nestedPath, "");
    const port = portWindow({
      baseSha: rootSha,
      cwd: getCwd(),
      developSha,
      fileCap: REVIEW_FILE_CAP,
      fixShas: [],
      queueSha,
    });

    expect(port).toStrictEqual({ fileCount: 1, fixCount: 0, heldSha, queueShas: [] });
    expect(readSha("HEAD")).toBe(developSha);
  });

  // A window re-cut after the bot kept skipping it is cut to less than the bot's own cap, and the pick that passes it
  // Is undone
  test("holds a queue commit past the cap it is given and undoes the pick", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const fixSha = commitFile(filePath, "");
    switchTo(developSha);
    const heldSha = commitFile(nestedPath, "");
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: 1,
      fixShas: [fixSha],
      queueSha: heldSha,
    });

    expect(port).toStrictEqual({ fileCount: 1, fixCount: 1, heldSha, queueShas: [] });
    expect(runGit(["log", "--format=%s", `${developSha}..HEAD`], getCwd())).toBe(`${filePath}\n`);
  });

  // The fixes alone past the cap threw on every run, and nothing ever shrank them: they are cut at a commit boundary
  // Like the queue, so the window is the fixes that fit and the rest lead the next one
  test("cuts the fixes at the cap and holds the first that would pass it, porting no queue commit", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const fixShas = [commitFile(filePath, ""), commitFile(nestedPath, "")];
    const queueSha = commitFile(`${nestedPath}.ts`, "");
    const port = portWindow({ baseSha: developSha, cwd: getCwd(), developSha, fileCap: 1, fixShas, queueSha });

    expect(port).toStrictEqual({ fileCount: 1, fixCount: 1, heldSha: takeOne(fixShas, 1), queueShas: [] });
    expect(runGit(["log", "--format=%s", `${developSha}..HEAD`], getCwd())).toBe(`${filePath}\n`);
  });

  // A queue rebased onto the fixes carries them as ancestors: measured against the tree the fixes built, it owes
  // Only its own commits, where measuring against develop would pick the fixes twice
  test("owes nothing for the fixes a rebased queue already carries", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const fixSha = commitFile(filePath, "");
    const queueSha = commitFile(nestedPath, "");
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: REVIEW_FILE_CAP,
      fixShas: [fixSha],
      queueSha,
    });

    expect(port).toStrictEqual({ fileCount: 2, fixCount: 1, heldSha: undefined, queueShas: [queueSha] });
  });

  test("skips a queue commit whose change the fixes already made", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const fixShas = [commitFile(filePath, ""), commitFile(filePath, " ")];
    switchTo(developSha);
    const queueSha = commitFile(filePath, " ");
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: REVIEW_FILE_CAP,
      fixShas,
      queueSha,
    });

    expect(port).toStrictEqual({ fileCount: 1, fixCount: 2, heldSha: undefined, queueShas: [] });
  });

  // A re-cut halves the cap after the bot kept skipping a window, and a fix the plan's own cap holds is still one a
  // Review can read: it goes out alone over the smaller cap rather than parked, its finding with it
  test("carries a first fix alone past a re-cut's smaller cap", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const fixSha = commitFiles([filePath, nestedPath], "");
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: 1,
      fixShas: [fixSha],
      queueSha: developSha,
    });

    expect(port).toStrictEqual({ fileCount: 2, fixCount: 1, heldSha: undefined, queueShas: [] });
  });

  // A fix no window can take is held first, which the opener parks rather than failing the run
  test("holds a first fix alone over the cap and ports nothing", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    const fixSha = commitFiles(overflowPaths, "");
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: REVIEW_FILE_CAP,
      fixShas: [fixSha],
      queueSha: developSha,
    });

    expect(port).toStrictEqual({ fileCount: 0, fixCount: 0, heldSha: fixSha, queueShas: [] });
    expect(readSha("HEAD")).toBe(developSha);
  });

  // A fix built on one that was parked no longer applies to develop: held like a conflicting queue commit, where it
  // Used to fail every run
  test("holds a fix that conflicts with develop", () => {
    expect.hasAssertions();

    const developSha = readSha("HEAD");
    commitFile(filePath, "");
    const fixSha = commitFile(filePath, " ");
    switchTo(developSha);
    const port = portWindow({
      baseSha: developSha,
      cwd: getCwd(),
      developSha,
      fileCap: REVIEW_FILE_CAP,
      fixShas: [fixSha],
      queueSha: developSha,
    });

    expect(port).toStrictEqual({ fileCount: 0, fixCount: 0, heldSha: fixSha, queueShas: [] });
    expect(readSha("HEAD")).toBe(developSha);
  });
});
