import { repository } from "@/github/repository";
import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const claudeCodeOauthToken: github.ActionsSecret = new github.ActionsSecret(
  "actionsSecret-CLAUDE-CODE-OAUTH-TOKEN",
  {
    repository: repository.name,
    secretName: "CLAUDE_CODE_OAUTH_TOKEN",
    value: config.requireSecret("CLAUDE_CODE_OAUTH_TOKEN"),
  },
  {
    protect: true,
  },
);
