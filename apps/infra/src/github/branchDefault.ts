import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// Manages the repository default branch out-of-band from the repository resource,
// Whose `defaultBranch` property is deprecated in favour of this resource. The default is `ai/queue`, where every
// Change lands: GitHub dispatches and schedules workflows from the default branch's files, and Renovate reads its
// Config from it and targets it. `main` is only the reviewed prefix the review workflow fast-forwards.
export const branchDefault: github.BranchDefault = new github.BranchDefault(
  "branchDefault",
  { branch: "ai/queue", repository: repository.name },
  { protect: true },
);
