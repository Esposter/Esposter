import { InvalidOperationError, Operation } from "@esposter/shared";

// Every one of these scripts is invoked as `pnpm ai:coderabbit:<verb> <pr>`, and a missing or non-numeric
// Argument has to fail here rather than reach the API as the string `undefined`, which answers 404.
export const getPullRequestArgument = (): number => {
  const argument = process.argv[2];
  const pullRequest = Number(argument);
  if (!argument || !Number.isInteger(pullRequest))
    throw new InvalidOperationError(Operation.Read, "coderabbit", "a pull request number is required");
  return pullRequest;
};
