import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const configuration = new pulumi.Config();

export const claudeCodeOauthToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-CLAUDE-CODE-OAUTH-TOKEN",
  {
    repository: repository.name,
    secretName: "CLAUDE_CODE_OAUTH_TOKEN",
    value: configuration.requireSecret("CLAUDE_CODE_OAUTH_TOKEN"),
  },
  {
    protect: true,
  },
);
