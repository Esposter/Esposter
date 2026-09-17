import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// The token a job is handed when its workflow declares no `permissions:` block of its own. Every workflow in
// `.github/workflows` declares one — the release and the branch cleanup take `contents: write`, Pulumi takes
// `pull-requests: write`, the collector's retrigger takes `actions: write` — so this is what a workflow written
// Or edited without thinking about it inherits, and read is the only value that makes that mistake harmless.
// `canApprovePullRequestReviews` stays off: an approving review from the built-in token is one no person gave,
// And on a pull request rule that counts approvals it would be indistinguishable from one.
export const workflowPermissions: github.WorkflowRepositoryPermissions = new github.WorkflowRepositoryPermissions(
  "workflowPermissions",
  {
    canApprovePullRequestReviews: false,
    defaultWorkflowPermissions: "read",
    repository: repository.name,
  },
  {
    protect: true,
  },
);
