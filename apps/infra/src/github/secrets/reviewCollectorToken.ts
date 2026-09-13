import { configuration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

// The review collector pushes `develop` and answers review threads as this token's account. It is the session
// Account's `gh` login token rather than the workflow's own because a push made with `GITHUB_TOKEN` starts no
// Workflow runs, so `develop`'s CI and deployment would never fire on a collector push.
export const reviewCollectorToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-REVIEW-COLLECTOR-TOKEN",
  {
    repository: repository.name,
    secretName: "REVIEW_COLLECTOR_TOKEN",
    value: configuration.requireSecret("REVIEW_COLLECTOR_TOKEN"),
  },
  {
    protect: true,
  },
);
