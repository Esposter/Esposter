import { InvalidOperationError, Operation } from "@esposter/shared";

// A missing or non-numeric argument fails here rather than at the API, where `undefined`, `" "` and `-1` all answer 404
export const getPullRequestArgument = (): number => {
  const argument = process.argv[2];
  const pullRequest = Number(argument);
  if (!Number.isSafeInteger(pullRequest) || pullRequest <= 0)
    throw new InvalidOperationError(Operation.Read, "coderabbit", "a pull request number is required");
  return pullRequest;
};
