import { QueueCommit } from "#src/models/queue/QueueCommit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The commits in `range`, oldest first. The fields are NUL-separated, so no character a subject can hold splits one
export const readQueueCommits = (range: string, cwd: string): QueueCommit[] =>
  getNonEmptyLines(runGit(["log", "--reverse", "--topo-order", "--format=%H%x00%aI%x00%s", range], cwd)).map((line) => {
    const [sha = "", authorDate = "", subject = ""] = line.split("\0");
    return { authorDate, sha, subject };
  });
