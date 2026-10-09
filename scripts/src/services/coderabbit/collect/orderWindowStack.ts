import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { takeOne } from "@esposter/shared";

// The open window pull requests that form one chain from `main`, bottom up: the bottom one's base `main`, and each
// Other one's base the head of the one below it. The walk ends below a fork (two pull requests on one base) and before
// A pull request whose head the chain already carries (two open ones on one head, which would walk the stack forever),
// So what it leaves out — the windows above a fork, and every window whose base no open window carries — is the stray
// Set the run closes and cuts again (`settleWindowChain`) rather than merging or retargeting against the wrong one
export const orderWindowStack = (windowPullRequests: WindowPullRequest[]): WindowPullRequest[] => {
  const stack: WindowPullRequest[] = [];
  let abovePullRequests = windowPullRequests.filter(({ baseRefName }) => baseRefName === MAIN_BRANCH);
  while (abovePullRequests.length === 1) {
    const current = takeOne(abovePullRequests);
    if (stack.some(({ headRefName }) => headRefName === current.headRefName)) break;
    stack.push(current);
    abovePullRequests = windowPullRequests.filter(({ baseRefName }) => baseRefName === current.headRefName);
  }
  return stack;
};
