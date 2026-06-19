import * as github from "@pulumi/github";

export const copilotReviewDefaultBranch: github.RepositoryRuleset = new github.RepositoryRuleset(
  "copilotReviewDefaultBranch",
  {
    bypassActors: [
      {
        actorId: 4,
        actorType: "RepositoryRole",
        bypassMode: "always",
      },
    ],
    conditions: {
      refName: {
        excludes: [],
        includes: ["~DEFAULT_BRANCH"],
      },
    },
    enforcement: "active",
    name: "Copilot review for default branch",
    repository: "Esposter",
    rules: {
      deletion: true,
      nonFastForward: true,
    },
    target: "branch",
  },
  {
    // Imported under the opaque name "ruleset-11555604"; alias keeps the same
    // Pulumi URN so the rename is not treated as a replacement.
    aliases: [{ name: "ruleset-11555604" }],
    protect: true,
  },
);
