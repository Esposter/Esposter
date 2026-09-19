import { checkIsGitHubNumber } from "#src/services/shared/checkIsGitHubNumber";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getPullRequestArgument = (): number => {
  const pullRequest = Number(process.argv[2]);
  if (!checkIsGitHubNumber(pullRequest))
    throw new InvalidOperationError(Operation.Read, "coderabbit", "a pull request number is required");
  return pullRequest;
};
