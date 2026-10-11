import { listProducerCommits } from "#src/services/producerStamp/listProducerCommits";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test } from "vitest";

describe(listProducerCommits, () => {
  const producerPath = "scripts/src/services/producerStamp";
  const identityArgs = ["-c", "user.name=a", "-c", "user.email=a@a"];
  const producerCommit = runGit(["log", "-1", "--format=%H", "HEAD", "--", producerPath]).trim();
  const subject = runGit(["log", "-1", "--format=%s", producerCommit]).trim();
  // A commit off the branch with the producer commit's subject, whose change is `parent`'s tree to `tree`
  const createOffBranchCommit = (tree: string, parent: string): string =>
    runGit([...identityArgs, "commit-tree", tree, "-p", parent, "-m", subject]).trim();

  test("lists from the replay of a stamp's commit the queue rewrote", () => {
    expect.hasAssertions();

    const rewrittenCommit = createOffBranchCommit(`${producerCommit}^{tree}`, `${producerCommit}^`);

    expect(listProducerCommits(rewrittenCommit, [producerPath])).toStrictEqual(
      listProducerCommits(producerCommit, [producerPath]),
    );
  });

  test("reads the recent window for a commit that shares a branch commit's subject but not its change", () => {
    expect.hasAssertions();

    const unrelatedCommit = createOffBranchCommit(`${producerCommit}^{tree}`, producerCommit);

    expect(listProducerCommits(unrelatedCommit, [producerPath]).isApproximate).toBe(true);
  });
});
