---
title: Runner
description: The GitHub Actions workflow that fires the collection cycle from the queue push, the review event, the CodeRabbit status and the push to main, the delayed retrigger that stands in for the one state change no webhook reports, what it authenticates with, and what a failed run leaves behind.
---

# Runner

The [collection cycle](/docs/infra/review-collector/collection-cycle) is a script; this is what runs it when nobody is at a keyboard. It is a GitHub Actions workflow because every fact the cycle reacts to — a branch push, a review submission, a status flip — is a webhook GitHub already delivers to Actions, and the repo already runs Claude Code headless there (`claude-warmup.yaml`). A cloud routine is cron-only with no event input, a local loop dies with the session that started it, and the raw API would rebuild the agent loop `claude -p` already is.

## Triggers

```mermaid
sequenceDiagram
  participant S as Working session
  participant GH as GitHub
  participant W as ReviewCollector workflow
  participant CR as CodeRabbit
  S->>GH: push ai/queue
  GH->>W: push event on ai/queue
  W->>W: cycle — gates exit or a window is pushed
  W->>GH: push develop
  GH->>CR: pull request synchronized
  CR->>CR: review runs for up to an hour
  CR->>GH: review submitted
  GH->>W: pull_request_review event
  W->>W: cycle — reply, drain, then merge the release or port the next window
```

Six events, and every one runs the identical cycle:

| Event                                 | Filter                                                  | What it is                                                                                                               |
| :------------------------------------ | :------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| `push` on `ai/queue`                  | —                                                       | the allocation event, one per session commit; almost all exit at the gates                                               |
| `pull_request_review` `submitted`     | the bot's login, a pull request whose head is `develop` | the free event — renovate's pull requests are reviewed too, and the filter keeps theirs from running a cycle             |
| `status`                              | the `CodeRabbit` context                                | the same free event from its other end; the body and the status flip arrive as separate deliveries, and either is enough |
| `push` on `main`                      | —                                                       | the return stroke; the release pull request is closed by then, so no review event carries `develop` forward              |
| `workflow_dispatch` with `force`      | —                                                       | the manual nudge, for a short window worth pushing anyway or a dropped webhook                                           |
| `issue_comment` `created` or `edited` | the bot's login, on a pull request                      | the bot's answer to a retrigger — a comment or an edit of its walkthrough, never a review or a status                    |

**One copy of the runner runs, whichever event fired it.** GitHub reads a workflow file from the ref the event names, and `main`'s copy is a release behind the remote state the newest copy defines — left to the event, a rename in the collector is a deadlock, since the copy on `main` fails on the missing ref and never ports the commit that would teach it the new name. So `ReviewCollector.yaml` is the triggers alone and calls `run-review-collector.yaml` **at `ai/queue`**, whose checkout pins the same ref.

```mermaid
flowchart LR
  E[Event] -->|ref it names| T[ReviewCollector.yaml<br/>that ref's copy — triggers, one call]
  T -->|uses …@ai/queue<br/>secrets: inherit| R[run-review-collector.yaml<br/>the queue's copy — jobs, steps, filters]
  R -->|checkout ai/queue| S[The cycle<br/>the queue's copy of the script]
```

**The trigger and the runner it calls sit on different refs, so what they agree on is what a release lag can break.** That contract is the file name, the `force` input and the queue branch spelled in four places — held to the constant by `scripts/src/services/coderabbit/collect/queueBranch.test.ts` — and nothing else; the secrets are inherited, never named (Notes). A trigger added to the shell still waits for a release before it fires on statuses and comments.

**No `schedule`.** [No polling](/docs/architecture/no-polling) is the standing rule, and every automatic trigger above is a webhook the platform delivers — `workflow_dispatch` is the manual nudge, delivered because a person asked. The one state change that reports none is a rate limit lifting, and the retrigger below answers it with a scheduled delivery rather than a loop.

## The delayed retrigger

CodeRabbit skips a review when the account is over its hourly limit, sets `Review rate limited`, and says nothing when the limit turns over — but the walkthrough it rewrites when it skips states when the next review becomes available. The cycle reads that sentence, a second job sleeps it out and dispatches the cycle again, and that run — the deadline now passed — posts `@coderabbitai review` and exits: the bot's answer arrives as an `issue_comment`, which is a trigger.

```mermaid
sequenceDiagram
  participant W as Collect job
  participant R as Retrigger job
  participant CR as CodeRabbit
  CR->>W: status Review rate limited
  W->>W: read the stated deadline from the walkthrough
  W->>R: retriggerDelaySeconds
  R->>R: sleep out the deadline
  R->>W: workflow_dispatch
  W->>W: re-read the pull request — the deadline has passed
  W->>CR: @coderabbitai review, then exit
  alt the limit is restated
    CR->>W: issue_comment — a fresh deadline to sleep out
  else the review starts
    CR->>W: review submitted — the cycle resumes
  end
```

**The job that sleeps is not the one that asks.** A session push during the sleep may already have a review running once the limit lifts, and a retrigger posted blind would cancel it; so the sleeping job only wakes the cycle, and every decision is made in the script with fresh state. The deadline is **relative to the comment that carries it**, never to now — the block is not removed when the limit lifts, so an expired one must read as nothing left to wait for — and it is the deadline only, never the fact: whether a limit applies is the commit status's answer. A block stating no readable deadline is asked about rather than guessed at. One sleep is capped under the job's timeout; a longer deadline is slept in relays, each dispatched run reading what is left.

## The job

The `collect` job carries the concurrency group (`review-collector`, never cancelling in progress): a run waits for the one ahead and re-reads the remote, and cancelling a run mid-push would be the only way to lose work. GitHub holds one run pending per group, so a third arriving while one waits cancels the waiting one — harmless, since every run derives its work from the remote afresh and the newest carries it; the exception is a `--force` dispatch superseded while pending, whose flag no later run inherits, so it is dispatched again. The group sits on the job rather than the workflow so the retrigger's wait never holds it; the retrigger has a group of its own that does cancel, since a newer run carries the newer deadline, and runs on the built-in token with `actions: write` alone — a `workflow_dispatch` is the one event that token may start.

The steps are the warmup workflow's plus what the script needs: a full-history checkout of the `ai/queue` head with the collector's token and `persist-credentials: false`; the dependency setup and the library builds restored from the `package-builds` cache 🏗️ CI saves for this content, built here only on a miss — the script imports `@esposter/shared` by its published entry, and the drain's finishing checks resolve every library the touched package reads the same way; the git identity the fix commits carry and `core.fileMode false`, because the install flips an executable bit that would read as a dirty tree; the `trust-workspace` action; then `gh auth setup-git` and `pnpm ai:coderabbit:collect`, with `--force` when the dispatch says so.

The drain spawns Claude Code headless with permission prompts bypassed — the runner is ephemeral and holds one credential scoped to this repository, so the interactive model protects nothing and would stall the drain on its first `git commit`. **It holds no credential that can act on this repository:** its prompt carries CodeRabbit's finding text verbatim, model-written prose about code anyone may have contributed, steering a session that skips its prompts — the shape a prompt injection wants. `GH_TOKEN` is withheld from the child and the checkout persists none, so a rejection leaves the session as a file the collector posts. The one credential it holds is the Claude Code token, which authenticates the process that spawns every tool — no mode Claude Code offers keeps it from a subprocess. What it can spend is the account's own quota, never anything here; closing that channel means an egress allow-list around the runner, the first thing to add if the repository ever takes contributions the drain would read.

## Credentials

| Secret                    | Holds                                                                                                      | Why                                                                                                                                                                |
| :------------------------ | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN` | the Claude Code subscription token, already present                                                        | the drain step, exactly as the warmup uses it                                                                                                                      |
| `REVIEW_COLLECTOR_TOKEN`  | the `gh` CLI login token of the account that runs the working session, refreshed with the `workflow` scope | the collector's pushes to `develop` and `ai/review-fixes`, its thread replies and the release pull request it opens — never the drain's, and `GITHUB_TOKEN` cannot |

**The trigger inherits and the runner declares nothing.** The two above are the only secrets any step in it spends, read straight from `secrets.*`; no declaration under `on.workflow_call.secrets`, because with inheritance one would be a second list to keep true. Inheriting narrows nothing: `CI.yaml` runs on a push to any branch with the same repository secrets, so a step added to `ai/queue` reaches every one of them through that workflow whatever this call hands over.

A push made with `GITHUB_TOKEN` starts no workflow runs, so `develop`'s CI and deployment would never fire on a collector push; it also posts as the shared Actions bot. The login token is the credential the session already holds rather than one minted for the job, because every alternative is created in a browser form GitHub exposes no API for. It needs the `workflow` scope because a ported window can carry a workflow file, and lives as a secret in the stack's Pulumi ESC environment. Rotation is `gh auth refresh` and re-setting the value; `gh auth logout` on that machine stops the collector at its checkout.

## Failure semantics

A run fails red and leaves the remote in a state the next run resumes from — and red is also how a person is told the queue needs them: a first owed commit that conflicts with `develop` or overflows the cap alone fails every run until the session rebases or splits it, since no event clears either and a green idle run reports to nobody. Before the push everything is a local branch in the runner; the drain pushes `ai/review-fixes` only after Claude exits clean with a clean tree, and a crash mid-drain is retried from the same open set until the attempt cap quarantines the review; the push is a single fast-forward that either moves `develop` or is refused; after it, the replies are predicate-guarded and finished by the next run. The job summary says which step and why. Nothing pages — the collector's failures are found where every other workflow's are, in the Actions tab.

## Key files

| File                                                          | Role                                                                                               |
| :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------- |
| `.github/workflows/ReviewCollector.yaml`                      | the triggers — the one file read from the event's ref, calling the reusable workflow at `ai/queue` |
| `.github/workflows/run-review-collector.yaml`                 | the reusable workflow — the jobs, filters, concurrency groups and steps, pinned to the queue head  |
| `scripts/src/services/coderabbit/collect/queueBranch.test.ts` | the four places the two files spell the queue branch, kept equal to the constant                   |
| `scripts/src/services/coderabbit/collect/runCycle.test.ts`    | the pass run end to end against a fixture repository, one test per way it exits                    |
| `.github/workflows/claude-warmup.yaml`                        | the headless invocation this workflow reuses                                                       |
| `.github/actions/trust-workspace`                             | the trust-dialog shim both workflows run                                                           |
| `.github/actions/setup-project-dependencies`                  | the install step                                                                                   |
| `.github/actions/restore-package-builds`                      | the library builds, restored from the cache and verified on disk before the miss builds them       |
| `apps/infra/src/github/secrets/reviewCollectorToken.ts`       | the collector token as a Pulumi-managed repository secret                                          |

## Notes

- **Rejected: handing the runner its secrets by name.** The list protected nothing — every repository secret is readable from `CI.yaml` on the same push — and a name the two copies disagreed on refused every status, review and comment event at startup, a failure the cycle cannot heal because healing needs a run.
- **Rejected: GitHub environments for the deployment credentials.** The Azure login is a federated credential already scoped to `develop` and `main` by branch, so an environment admits the same set for more configuration; what would change the threat model is a required reviewer on production — a workflow decision, not a secret-scoping one.
- **Rejected: running the cycle from the event's own ref, or from `develop`'s copy.** `develop` is the verified copy and the event's ref is what GitHub hands over, and both lose to one fact — the cycle reads remote state whose shape the newest copy defines. "Verified" buys nothing: a queue push already runs the queue's copy with the same secrets, and a broken queue copy fails the next push loudly for the session that broke it.
- **Runner minutes are not the constraint.** The repository is public, so Actions minutes are free, and most runs exit at the gates before the install matters. If that changes, the gates can move into a first job that needs only `gh` and `git`.
- **The drain has a wall clock.** The job's `timeout-minutes` bounds a Claude session that has lost its way; the cycle's ordering means a timeout costs the same as a crash, which is nothing on the remote.
