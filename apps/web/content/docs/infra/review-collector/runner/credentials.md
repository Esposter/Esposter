---
title: Runner credentials
description: The secrets the collector's workflow runs with, what each one holds, and why the trigger passes them down rather than the runner naming them.
---

# Runner credentials

The three secrets the collector and its headless sessions authenticate with, each a repository secret Pulumi manages.

## Credentials

| Secret                    | Holds                                                                                                      | Why                                                                                                                                                                                     |
| :------------------------ | :--------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN` | the Claude Code subscription token, already present                                                        | every session the cycle spawns, exactly as the warmup uses it                                                                                                                           |
| `REVIEW_COLLECTOR_TOKEN`  | the `gh` CLI login token of the account that runs the working session, refreshed with the `workflow` scope | the collector's pushes to `develop`, the window branches and `ai/review-fixes`, its thread replies and the window pull requests it opens — never the drain's, and `GITHUB_TOKEN` cannot |
| `TYPESAFE_API_KEY`        | the key the [typed-decision](/docs/infra/typed-decisions) tier's SDK authenticates with                    | the gates the cycle answers before it spawns a session — absent, each answers nothing and escalates, so a fork runs as the cycle did before there were gates                            |

**The trigger inherits and the runner declares nothing.** Those above are the only secrets any step in it spends, read straight from `secrets.*`; no declaration under `on.workflow_call.secrets`, because with inheritance one would be a second list to keep true. Inheriting narrows nothing: `CI.yaml` runs on a push to any branch with the same repository secrets, so a step added to `ai/queue` reaches every one of them through that workflow whatever this call hands over.

A push made with `GITHUB_TOKEN` starts no workflow runs, so `develop`'s CI and deployment would never fire on a collector push; it also posts as the shared Actions bot. The login token is the credential the session already holds rather than one minted for the job, because every alternative is created in a browser form GitHub exposes no API for. It needs the `workflow` scope because a ported window can carry a workflow file, and lives as a secret in the stack's Pulumi ESC environment. Rotation is `gh auth refresh` and re-setting the value; `gh auth logout` on that machine stops the collector at its checkout.

## Notes

- **Rejected: handing the runner its secrets by name.** The list protected nothing — every repository secret is readable from `CI.yaml` on the same push — and a name the two copies disagreed on refused every status, review and comment event at startup, a failure the cycle cannot heal because healing needs a run.
- **Rejected: GitHub environments for the deployment credentials.** The Azure login is a federated credential already scoped to `develop` and `main` by branch, so an environment admits the same set for more configuration; what would change the threat model is a required reviewer on production — a workflow decision, not a secret-scoping one.

## Key files

| File                                                    | Role                                                         |
| :------------------------------------------------------ | :----------------------------------------------------------- |
| `apps/infra/src/github/secrets/reviewCollectorToken.ts` | the collector token as a Pulumi-managed repository secret    |
| `apps/infra/src/github/secrets/typesafeApiKey.ts`       | the typed-decision key as a Pulumi-managed repository secret |
