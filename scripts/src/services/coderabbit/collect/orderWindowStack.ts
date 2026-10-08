import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The open window pull requests bottom up, each one's base the head of the one below it and the bottom one's base
// `main`. A fork (two pull requests on one base) and a gap (a pull request whose base no open window carries as its
// Head) are both refused: a merge or a retarget against the wrong one would move work nobody reviewed
export const orderWindowStack = (windowPullRequests: WindowPullRequest[]): WindowPullRequest[] => {
  const bottomPullRequests = windowPullRequests.filter(({ baseRefName }) => baseRefName === MAIN_BRANCH);
  if (bottomPullRequests.length > 1)
    throw new InvalidOperationError(
      Operation.Read,
      "coderabbit",
      `the window stack forks on ${MAIN_BRANCH} — ${bottomPullRequests.map(({ number }) => `#${number}`).join(", ")} share its base`,
    );

  const stack: WindowPullRequest[] = [];
  let current: undefined | WindowPullRequest = bottomPullRequests[0];
  while (current) {
    // A pull request seen twice means two open ones share a head, and the walk would never end
    if (stack.includes(current))
      throw new InvalidOperationError(Operation.Read, "coderabbit", `the window stack loops at #${current.number}`);
    stack.push(current);
    const { headRefName } = current;
    const abovePullRequests = windowPullRequests.filter(({ baseRefName }) => baseRefName === headRefName);
    if (abovePullRequests.length > 1)
      throw new InvalidOperationError(
        Operation.Read,
        "coderabbit",
        `the window stack forks on ${headRefName} — ${abovePullRequests.map(({ number }) => `#${number}`).join(", ")} share its base`,
      );
    current = abovePullRequests[0];
  }
  if (stack.length !== windowPullRequests.length)
    throw new InvalidOperationError(
      Operation.Read,
      "coderabbit",
      `the window stack has a gap — ${windowPullRequests.length - stack.length} open window pull requests are not reached from ${MAIN_BRANCH}`,
    );
  return stack;
};
