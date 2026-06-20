import * as github from "@pulumi/github";

export const actionsPermissions: github.ActionsRepositoryPermissions = new github.ActionsRepositoryPermissions(
  "actionsPermissions",
  {
    allowedActions: "selected",
    allowedActionsConfig: {
      // Local composite actions under ./.github/actions/* are always allowed and need no entry.
      // GitHub-owned actions/* are covered by githubOwnedAllowed; everything else is pinned below.
      githubOwnedAllowed: true,
      patternsAlloweds: ["azure/login@*", "pnpm/action-setup@*", "pulumi/actions@*", "softprops/action-gh-release@*"],
      verifiedAllowed: false,
    },
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
