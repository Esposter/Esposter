import { configuration } from "#src/configuration";
import { repository } from "#src/github/repository";
import * as github from "@pulumi/github";

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
