import type { ReviewCommit } from "#src/models/review/ReviewCommit";

// How many of the commits owed, from the first, make the window: the longest prefix whose changed files, taken together,
// stay at or under the cap. A window always holds at least one commit, even one alone over the cap, so no commit is
// ever owed forever.
export const getWindowCommitCount = (commits: ReviewCommit[], fileCap: number): number => {
  const files = new Set<string>();
  let count = 0;
  for (const commit of commits) {
    const isOverCap = count > 0 && new Set([...files, ...commit.files]).size > fileCap;
    if (isOverCap) break;
    for (const file of commit.files) files.add(file);
    count += 1;
  }
  return count;
};
