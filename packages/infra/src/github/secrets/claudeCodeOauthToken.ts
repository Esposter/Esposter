import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const claudeCodeOauthToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-CLAUDE-CODE-OAUTH-TOKEN",
  {
    plaintextValue: config.requireSecret("CLAUDE_CODE_OAUTH_TOKEN"),
    repository: "Esposter",
    secretName: "CLAUDE_CODE_OAUTH_TOKEN",
  },
  {
    protect: true,
  },
);
