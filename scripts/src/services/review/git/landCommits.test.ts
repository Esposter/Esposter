import { landCommits } from "#src/services/review/git/landCommits";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { setupFixtureRepository } from "#src/services/shared/setupFixtureRepository.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(landCommits, () => {
  const PATH = "README.md";
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("lands the checkout's commits on the queue's tip", () => {
    expect.hasAssertions();

    const base = commitFile(PATH, "base");
    publish(QUEUE_BRANCH, "HEAD");
    commitFile("peer.md", "peer");
    publish(QUEUE_BRANCH, "HEAD");
    switchTo(base);
    commitFile(PATH, "mine");

    expect(landCommits(getCwd())).toBe(true);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(readSha("HEAD"));
  });

  test("aborts a rebase that stops on a conflict, so the checkout is left as it was", () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    const base = commitFile(PATH, "base");
    publish(QUEUE_BRANCH, "HEAD");
    commitFile(PATH, "peer");
    const peer = publish(QUEUE_BRANCH, "HEAD");
    switchTo(base);
    const mine = commitFile(PATH, "mine");
    const rebaseMergePath = runGit(["rev-parse", "--git-path", "rebase-merge"], getCwd()).trim();

    expect(landCommits(getCwd())).toBe(false);
    expect(existsSync(join(getCwd(), rebaseMergePath))).toBe(false);
    expect(readSha("HEAD")).toBe(mine);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(peer);
  });
});
