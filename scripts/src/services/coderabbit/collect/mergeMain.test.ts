import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { FOLD_FAILED_MARKER, MAIN_BRANCH, SESSION_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { runGh, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

// The resolver is the session the drain spawns, and its attempt marker goes out through `gh`; git runs for real
vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

// The lockfile conflict — thrown away and rebuilt with `pnpm i` — is the one branch not proved here: it installs
// Against a real workspace, which no fixture repository holds
describe(mergeMain, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, deleteFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;
  beforeEach(() => {
    runGh.mockReturnValue("[[]]");
    runSession.mockReset();
  });
  const getInput = () => ({ cwd: getCwd(), viewerLogin });
  // A conflict nothing mechanical decides: main edited the file the candidate deleted
  const setupConflict = (): { candidateSha: string; mainSha: string } => {
    const baseSha = commitFile(filePath, "");
    const mainSha = publish(MAIN_BRANCH, commitFile(filePath, " "));
    switchTo(baseSha);
    return { candidateSha: deleteFile(filePath), mainSha };
  };

  test(`${MergeMainOutcome.AlreadyMerged}: main is an ancestor of the candidate`, async () => {
    expect.hasAssertions();

    const headSha = commitFile(filePath, "");

    await expect(mergeMain(getInput())).resolves.toBe(MergeMainOutcome.AlreadyMerged);
    expect(readSha("HEAD")).toBe(headSha);
  });

  test(`${MergeMainOutcome.Merged}: main's own commits join the candidate as a merge`, async () => {
    expect.hasAssertions();

    const rootSha = readSha("HEAD");
    const mainSha = publish(MAIN_BRANCH, commitFile(nestedPath, ""));
    switchTo(rootSha);
    const candidateSha = commitFile(filePath, "");

    await expect(mergeMain(getInput())).resolves.toBe(MergeMainOutcome.Merged);
    expect(runGit(["rev-list", "--parents", "--max-count=1", "HEAD"], getCwd()).trim()).toBe(
      `${readSha("HEAD")} ${candidateSha} ${mainSha}`,
    );
    expect(runSession).not.toHaveBeenCalled();
  });

  test(`${MergeMainOutcome.Merged}: a conflict outside the lockfile is the resolver's`, async () => {
    expect.hasAssertions();

    const { candidateSha, mainSha } = setupConflict();
    runSession.mockImplementation(() => {
      writeFileSync(join(getCwd(), filePath), " ");
      runGit(["add", filePath], getCwd());
      runGit(["commit", "--quiet", "--no-edit"], getCwd());
      return Promise.resolve({ isEnded: true, isStarted: true });
    });

    await expect(mergeMain(getInput())).resolves.toBe(MergeMainOutcome.Merged);
    expect(runSession.mock.calls[0]?.[0].prompt).toContain(`\`${MAIN_BRANCH}\` at ${mainSha} is being folded`);
    expect(runGit(["rev-list", "--parents", "--max-count=1", "HEAD"], getCwd()).trim()).toBe(
      `${readSha("HEAD")} ${candidateSha} ${mainSha}`,
    );
  });

  test("fails the run and counts the attempt on main's head when the resolver leaves the merge open", async () => {
    expect.hasAssertions();

    const { mainSha } = setupConflict();
    runSession.mockResolvedValue({ isEnded: true, isStarted: true });

    await expect(mergeMain(getInput())).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, the resolver left the fold of 646cf33bb0af71bf79f4ac95d887c6d6a4bd7450 unresolved (attempt 1 of 3)]`,
    );
    expect(runGh.mock.calls[1]?.[0]).toContain(`repos/{owner}/{repo}/commits/${mainSha}/comments`);
    expect(runGh.mock.calls[1]?.[0].at(-1)).toContain(getMarker(FOLD_FAILED_MARKER, mainSha));
    // The merge is cleared on the way out: the next command run over this checkout is a `git checkout`, which
    // Refuses over an unresolved index
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
  });

  test("counts no attempt and leaves the merge for the next run when the resolver never started", async () => {
    expect.hasAssertions();

    setupConflict();
    runSession.mockResolvedValue({ isEnded: false, isStarted: false });

    await expect(mergeMain(getInput())).resolves.toBe(MergeMainOutcome.Conflicted);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
    expect(runGh).toHaveBeenCalledTimes(1);
  });

  test(`${MergeMainOutcome.Conflicted}: past the attempt cap the fold is abandoned without a session`, async () => {
    expect.hasAssertions();

    const { candidateSha, mainSha } = setupConflict();
    runGh.mockReturnValue(
      JSON.stringify([
        Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
          body: getMarker(FOLD_FAILED_MARKER, mainSha),
          id,
          updated_at: "",
          user: { login: viewerLogin },
        })),
      ]),
    );

    await expect(mergeMain(getInput())).resolves.toBe(MergeMainOutcome.Conflicted);
    expect(readSha("HEAD")).toBe(candidateSha);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
    expect(runSession).not.toHaveBeenCalled();
  });
});
