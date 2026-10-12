import { configuration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// The review workflow pushes `main` (its fast-forward) and `ai/queue` (the fixer's commits) as this token's account. It is
// The session account's `gh` login token rather than the workflow's own, because a push made with `GITHUB_TOKEN` starts
// No workflow runs, so CI and the next review would never fire on a review push.
export const reviewCollectorToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-REVIEW-COLLECTOR-TOKEN",
  {
    repository: repository.name,
    secretName: "REVIEW_COLLECTOR_TOKEN",
    value: configuration.requireSecret("REVIEW_COLLECTOR_TOKEN"),
  },
  { protect: true },
);
