import * as github from "@pulumi/github";
// Manages the repository default branch out-of-band from the repository resource,
// Whose `defaultBranch` property is deprecated in favour of this resource.
export const branchDefault: github.BranchDefault = new github.BranchDefault(
  "branchDefault",
  {
    branch: "main",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
