import type { z } from "zod";

// Every option group is a union whose first branch is its object and whose second is `false`.
// The `false` branch's complaint hides the object's, so a union is read through its first branch
const getReadableIssue = (issue: z.core.$ZodIssue): z.core.$ZodIssue => {
  const [branch] = issue.code === "invalid_union" ? issue.errors : [];
  const [firstIssue] = branch ?? [];
  return firstIssue ? getReadableIssue(firstIssue) : issue;
};

// A branch reports its path from the union it sits in, so the union's own path leads the leaf's
const formatIssue = (issue: z.core.$ZodIssue): string => {
  const readable = getReadableIssue(issue);
  const path = [...issue.path, ...(readable === issue ? [] : readable.path)];
  return `${path.join(".") || "(options)"}: ${readable.message}`;
};

export const formatZodIssues = (issues: z.core.$ZodIssue[]): string =>
  issues.map((issue) => formatIssue(issue)).join("; ");
