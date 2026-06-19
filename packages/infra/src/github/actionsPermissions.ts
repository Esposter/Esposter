import * as github from "@pulumi/github";

export const actionsPermissions: github.ActionsRepositoryPermissions = new github.ActionsRepositoryPermissions(
  "actionsPermissions",
  {
    allowedActions: "all",
    repository: "Esposter",
  },
  {
    protect: true,
  },
);
