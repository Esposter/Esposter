import { InvalidOperationError, Operation } from "@esposter/shared";

// `gh issue create` prints the new issue's URL, whose last segment is its number
export const getIssueNumber = (url: string): number => {
  const issue = Number(url.slice(url.lastIndexOf("/") + 1));
  if (!Number.isInteger(issue) || issue <= 0)
    throw new InvalidOperationError(Operation.Create, "review issue", `gh printed no issue number: ${url}`);

  return issue;
};
