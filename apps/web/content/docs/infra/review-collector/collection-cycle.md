---
title: Collection cycle
description: The one pass the review collector runs on every trigger: return, repair, express, read, reply, gate, drain, judge, sync, port, push, reply, each step re-derived from the remote so a re-run is a no-op.
---

# Collection Cycle

One script, `pnpm ai:coderabbit:collect`, run by the [runner](/docs/infra/review-collector/runner) on every trigger and by hand with `--dry-run` to see what it would do. It reads the whole situation from the remote, clears the gates, and does the most it safely can in one pass, ordered so that every irreversible effect is either the single push or a predicate-guarded write a later run can finish. Which ref each writer owns is the [two writers](/docs/infra/review-collector/two-writers) page. A live run ends at its one push; a dry run ends at none of them, so it reports what every stage would do — the express cut, the reshaping, the window — in a single pass, which is how a change to any of them is read against the live refs before it is pushed.

## What it reads

Nothing is remembered between runs, so every input is a remote fact with a single source:

| Fact                          | Source                                                                                                                                                                                                                                 |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the release pull request      | the one open pull request with base `main` and head `develop` — none means the last one merged                                                                                                                                         |
| the frontier                  | the last sha named by a `between … and …` range — a review body's, or the walkthrough's recent-review block's, the only record of a review that found nothing — or the merge base when none is open                                    |
| the merge risk                | the level and the covered sha the bot states in the walkthrough's merge-risk block — a block it writes on some releases and not others, so no level for the head is one of its readings                                                |
| the release verdict           | the collector's own `merge-verdict` marker for the head, verb beside it — whichever tier read what the bot wrote, recorded once per head                                                                                               |
| the check                     | the CodeRabbit commit status, read by `bucket` first and `description` second                                                                                                                                                          |
| a skipped review              | the walkthrough's `skip review` section — the bot declined the last push, an incremental review it could not recover among the reasons                                                                                                 |
| the rate-limit deadline       | the `Next included review available in …` the bot states in the walkthrough it last rewrote                                                                                                                                            |
| open findings                 | unresolved threads whose last comment is the bot's, plus the newest review body's own buckets                                                                                                                                          |
| fixes awaiting a push         | `git cherry origin/develop origin/ai/review-fixes` minus the ported set — the branch stays, what it owes is what counts                                                                                                                |
| what the queue still owes     | `git cherry <develop plus the fixes> origin/ai/queue` minus the ported set — commits not yet upstream by patch id, none of whose identities a copy names, nor empty                                                                    |
| the ported set                | the `(cherry picked from commit …)` line every port and every express cut writes (`cherry-pick -x`), read off the whole of the upstream and of `main` — the record a drifted patch id cannot lose                                      |
| a commit's identities         | its own sha and every sha the same line in its own body names: each rewrite of the queue replays it with `-x`, so a commit rewritten a dozen times carries a dozen earlier shas, and a copy names whichever one it had when it was cut |
| which thread a commit answers | an `Answers: <comment id>` trailer on the commit, `Drains: <review id>` for a body-only finding                                                                                                                                        |
| what claims no review         | an `Express: <why>` trailer on a queue commit — the reshaper's, or a session's own                                                                                                                                                     |
| `main` is red                 | a run of CI or of CodeQL concluded `failure` on `main`'s head — the [repair](/docs/infra/review-collector/repair)'s one input, with the failing jobs' log tails                                                                        |

The trailers are the collector's memory: a fix commit says which finding it answers in its own message, so the reply step can name it after the push, a later run can tell an answered finding from an open one, and a session fixing a finding by hand leaves the same record by writing the same trailer. The ported line is the same kind of memory for the port itself: a fix landing inside a ported hunk's context lines changes the copy's patch id, after which `git cherry` reads the original as still owed and re-picking it is the conflict nobody authored — so the copy names its original, and the owed set subtracts every original a copy names, on `develop` or on `main`.

## The return stroke, the repair and the express lane

Before the pull request is looked up, the cycle compares `develop` with `main`. When `develop` is an ancestor of `main` and the two differ, `main` holds commits and `develop` holds nothing of its own: `develop` is fast-forwarded to `main` with a plain push — no pull request is open, so it spends nothing — and the pass goes on measuring against the head it made. What put those commits on `main` is not asked: a release that merged, an express cut and a dependency bump pushed straight at it all already sit on the branch a window is diffed against, so no window could carry them to a review. The stroke ends nothing because nothing would follow it: a push to `develop` fires no run, so a pass that exited here would leave the queue waiting on the next session push for the window it could have cut.

Then the cycle cuts every queue commit that claims it needs no review onto `main` — the [express lane](/docs/infra/review-collector/express-lane), open whether or not a window is in flight. That push is the run's one irreversible act too; the fold below carries `main` into the next window, and only then is a window measured. The cut is unverified — a claimed commit red on its own is `main`'s CI's to find. With nothing to cut, the cycle asks whether `main` itself is red — a failed check, or an open CodeQL alert: that head is the [repair](/docs/infra/review-collector/repair)'s, pushed as a cut of the lane's own with the run ending on it.

## Gates

```mermaid
flowchart TD
  S[Read state] --> RS{develop an ancestor of main}
  RS -->|yes| FF[Fast-forward develop to main<br/>the pass measures against it] --> EL
  RS -->|no| EL{A queued commit claims no review}
  EL -->|yes| X3[Cherry-pick onto main<br/>push unverified, exit — the push re-fires the cycle]
  EL -->|no| MR{main red on CI}
  MR -->|yes| RG[Run the repo's regenerators, check]
  RG -->|green| X6[Exit — the push re-fires the cycle]
  RG -->|red| RP[Claude repairs the restored head — cut, check, push] --> X6
  MR -->|no| PR{Release PR open}
  PR -->|no| MB[Frontier is the merge base<br/>nothing running] -->|nothing to drain| D
  PR -->|yes| RE[Reply for pushed fixes<br/>trailers on frontier..develop without a reply]
  RE --> B{Newest stated range<br/>ends at the develop head}
  B -->|yes| OK[Slot free]
  B -->|no| ST{Check bucket}
  ST -->|pending| X1[Exit — review running]
  ST -->|pass, Review completed| SK{Walkthrough says<br/>the review was skipped}
  SK -->|no| X2[Exit — last push not yet reviewed]
  SK -->|yes| OK
  ST -->|pass, Review rate limited| OK
  ST -->|anything else| X4[Fail — a person looks]
  OK --> D[Drain]
```

- **Replies run before the gates.** A reply is owed the moment a fix commit is on `develop`, and the run that pushed it may die before replying; putting replies first makes every later run finish them, before any exit — the running review is the one that resolves those threads, and only if the reply is there.
- **The stated range, not the status, says a review is complete.** CodeRabbit writes the range at completion and flips the status a moment later, and the review event fires in that gap; a status read alone there says `pending`, exits, and nothing re-fires until the next queue push. A review that found something states the range in its body; one that found nothing writes no body and states it only in the walkthrough's recent-review block, which is read as the newest range. The same walkthrough's rate-limit section names the range the bot _skipped_, so only the block between the recent-review markers is read. Anything unrecognised fails the run rather than guessing.
- **A skipped review is judged, never waited on.** The bot sometimes declines a push outright — it could not recover the incremental review, and says so in a `skip review` section of the walkthrough — and flips the check to `Review completed` with no range stated. No completion follows, so exiting as "not yet reviewed" waits forever. The cycle drains what is open and hands the head straight to the [verdict](#merge), whatever the bot last rated.
- **A rate limit leaves the slot free.** `Review rate limited` means the bot ran nothing, so a window measured from the unmoved frontier can only over-count, which is the safe direction. The review the limit refused is owed once the port has said nothing can be added to the range — asking earlier spends the hour on a range still filling, asking never leaves a frontier that can neither grow nor ship — and settling it is the [runner's delayed retrigger](/docs/infra/review-collector/runner).

## Drain

The step that answers findings — [drain](/docs/infra/review-collector/drain). The cycle reaches it only with a pull request open; with none, no review has spoken.

## Merge

A drain that found nothing to do may mean the release is done: the newest range ends at `develop`'s head, no thread has the bot's word last, the newest body states no findings of its own, and no commit on `ai/review-fixes` or `ai/queue` that `develop` lacks by patch id carries a trailer answering one — answered elsewhere is not answered on `develop`, and a ported copy is. Then the walkthrough's merge-risk block decides: the least level for that head merges the pull request to `main` as an administrator and the run exits on it, the push to `main` running the return stroke; **every other reading is judged, and no reading at all is one of them**.

**A block that does not name this head states nothing about it.** The bot writes its merge-risk block on some releases and not others, for no reason readable from this side — it named `Minimal` on one release and nothing at all on the next two, whose reviews were equally clean. A cycle that waits for the block waits forever on those, and says `Idle: nothing owed` while it waits, which is the healthy line: the release sits clean at its head until a person merges it by hand. So the absent block, and the stale one naming an older head, are the same fact — no level for this head — and both go to the verdict, which reads the change assessment the bot does write every time in place of the rationale it did not. Nothing is merged unasked on a level nobody gave: the least level is a statement, and its absence is not.

```mermaid
flowchart TD
  D[Drain — nothing open] --> CL{Newest range at the head,<br/>no unported commit answers a finding}
  CL -->|no| P[Port]
  CL -->|yes| FC{main conflicts with develop}
  FC -->|yes| FR[Fold main into develop, push<br/>exit — the new head is reviewed]
  FC -->|no| MR{Merge risk stated for the head}
  MR -->|the least| MG[Merge the release PR as administrator<br/>exit — the push to main returns develop]
  MR -->|above it| V{Verdict recorded<br/>for this head}
  MR -->|none stated,<br/>or stated for an older head| V
  CL -->|the bot skipped the head| V
  V -->|merge| MG
  V -->|hold| P
  V -->|none| J[Claude reads what the bot wrote against the tree<br/>writes merge or hold — recorded on the PR]
  J -->|merge| MG
  J -->|hold| P
```

- **The merge names the head the verdict covers.** Every gate above it was measured against the `develop` the pass read, so the merge is made to match that sha — the same compare-and-swap the push makes. A `develop` that moved in between fails the run rather than releasing commits no review covered.
- **A skipped head is always a session's.** The last level the bot stated covers an older head, so even the least one merges nothing unasked, and the typed tier is not asked: the commits after the last reviewed range were read by no review, and the text in hand says nothing about them. The session is handed that level's rationale and the range as `git diff <last reviewed> <head>` — the whole change, since `git log -p` prints no patch for a merge and a fold of `main` resolves its conflicts in one — beside `git log -p <last reviewed>..<head>` for each commit's intent, and reads the commits as the review would have — a real defect there is a hold. The drain before it has already fixed every open finding, so a `merge` releases the head as it stands.
- **A release `main` conflicts with is folded, never merged.** A repair or an express cut can land on `main` after the window went out, and a merge GitHub cannot create fails every run that tries it. So before any merge the release is tried against `main` in memory; a conflict folds `main` into `develop` through the same resolver the window's fold uses, pushed on the same compare-and-swap, and the release waits on a review of the new head. A release that still merges cleanly is left to GitHub — folding it would spend a review on nothing.
- **The checks do not gate it.** `develop` runs them, and the release does not wait: the review is the gate, and a red check is one more commit in the next window.
- **A level above the least is a judgement, made once per head.** The level is the bot's impression across every round of a long pull request, and it does not reset when the concerns behind it are answered — a long pull request stays `Moderate` through rounds whose every finding was fixed or rejected. Nothing deterministic can read whether anything real is left, but the reading itself is over text the collector already holds — so it is asked first as a [typed decision](/docs/infra/typed-decisions) over the rationale, the fixes and the rejections, which settles the common head without a session at all. Only a reading that lands inside the confidence band is worth a session; that session is handed the rationale, the feedback report and the collector's own replies, and writes one line: `merge` with why nothing is left, or `hold` with the one concern that is. A head with no level stated asks the same question of the change assessment, which names no concern — so the record settles it at the typed tier, and the session is spent on the heads that earned one. The verdict is recorded on the pull request beside a marker for the head — a `merge` whose `gh pr merge` was refused merges on the next run, a `hold` ports on and the next head is judged afresh — and the session's silence is a hold, since a release is never made on a reading nobody reached. A held release is the person's: merge it, or close the pull request to pause.

## Sync

Before the port reads the queue, the collector rewrites it onto the tree the window is built on — `ai/review-fixes` while it owes `develop` commits, `develop` otherwise — reshapes the first owed commit that alone exceeds the cap, and pushes it back under a lease on the sha it read. The cap does not measure a commit carrying `Express:` — that one is the lane's at any size, and reshaping it would pay a session per run to repackage what no window will ever carry. The commits the queue still owes are replayed in order as one `cherry-pick` sequence — `-x`, so every copy names the original it came from and a resolution that drifted its patch id still reads as carried, and `--empty=keep`, so a commit the tree already holds under another patch id lands as an empty copy naming it rather than falling away with nothing to say it did, and an empty copy a past resolution left rides through rather than stalling the sequence; a queue already sitting on that tree with nothing to reshape is left alone, which is every run but the one after a window.

```mermaid
flowchart TD
  T[target = the fixes head while it owes develop,<br/>else develop] --> A{Queue sits on it}
  A -->|no| R[Replay the owed commits onto it<br/>one sequence, empties kept as copies naming their original]
  R -->|stops| C{Dry run, or the<br/>attempt cap reached}
  C -->|yes| AB[Abort — the port holds on it]
  C -->|no| CL[Claude resolves and continues the sequence<br/>a resolution the target absorbs whole is committed empty,<br/>naming its original — never skipped]
  CL -->|anything but a complete sequence over a clean tree| F[Fail red, attempt counted on the commit]
  CL -->|complete| RS
  R -->|completes| RS
  A -->|yes| RS{An owed commit claiming no review<br/>alone over the cap}
  RS -->|none| P[Push ai/queue under a lease if rewritten<br/>the port reads the head]
  RS -->|the first, under its attempt cap| SH[Claude repackages it at its parent:<br/>Express-trailered parts, the rest under the cap]
  SH -->|same tree, no inherited lineage, every untrailered part fits| RP[Replay what followed it] --> P
  SH -->|anything else| F
  RS -->|past the cap| P
```

- **Why the collector and not the session.** A queue left on an old base carries commits written against files a drain has since repaired, and every one is a conflict the porter would hold on, run after run, until a person notices a red run. Here the conflict is met once, where the fixes are, and the working session's `git pull --rebase` afterwards replays only what it committed since (`.agents/skills/review-queue/SKILL.md`).
- **The lockfile is never a conflict a session sees.** A replay of the queue stops on it once per commit that touched a manifest, and every one of those stops has the same answer the fold already gave: the lockfile is deleted and rebuilt from the manifests the replay settled, never merged (`git` skill). The sequence is run out over as many stops as land on that path alone, bounded by the replay’s own length, and only a stop on another path is worth a session — which finds the sequencer exactly where it expects it, mid-pick with that commit’s conflict open.
- **A conflict is the drain's session pointed at a conflict.** The same headless Claude, the same denials — no push, no branch switch, no GitHub — told which commit stopped the sequence and on which paths, that both sides survive, and that a commit whose whole change the target already carries is committed empty rather than skipped. What proves the resolution is a sequence run to its end over a clean tree that carries every commit the queue owed, never the session's word — the first two are what `git cherry-pick --abort` leaves as well, and the rewrite behind them would force-push every owed commit away, so the third is read off the replay itself — and so the resolver owes no finishing checks and repairs nothing beyond the conflict: a red elsewhere in the replay is a queue commit's, which the queue's own CI names to the session that owns it, and every minute the resolver spends past the conflict is one the working session can push into. **`--skip` is denied, and the empty commit is why.** A resolution the target absorbs whole leaves the same tree as an abandoned one, so no test over content can tell the sanctioned drop from the lost work; git's own prepared message names the original, and an empty copy carrying it is the one record that says which happened. The replay keeps the same record for itself: a commit whose change the target already carries under another patch id — a repaired copy the port skipped, or a fold's — still reads as owed by patch id, and dropping it as it applies would leave that check reading the resolver's finished sequence as one that lost it. The owed set ignores a commit that changes nothing, so the queue sheds either copy on the next rewrite rather than replaying it forever. A failure counts against the attempt cap under a marker in a comment on the conflicting commit itself rather than on the pull request, for the reason the runner's counts carry, and the marker names the collector's own source as the basis the attempt was made against, so a collector fixed since hands the commit a fresh turn with nobody resetting anything ([the runner's counts](/docs/infra/review-collector/runner)). Past the cap the commit is a person's: the port holds on it.
- **A commit alone over the cap is repackaged, never held.** No window can carry it and no session is asked to commit differently — what a commit holds is the session's business, and what in it needs a reviewer's eye is a judgement. The same session, detached at the commit's parent, rewrites it as a sequence: the parts that need no review — a rename, a one-rule substitution a lint rule now enforces, generated output, a format pass — each a commit of any size carrying `Express: <why>`, which the express lane takes to `main`; the rest in commits under the cap, ordered so every prefix is green. It repackages and never edits, and the collector proves that rather than trusting it: `git diff <original> HEAD` empty, no part keeping a `(cherry picked from commit …)` line, and every untrailered part under the cap, or the attempt fails and is counted on the commit. Those lines name the copies the original was replayed from, and a part keeping them shares them with its siblings — so the express lane's copy of one part reads every part as ported, and the next sync drops the rest unreplayed. One commit per run, since the rewrite's push fires the next. Past the attempt cap the commit is left whole for the port to hold on — the residual person's case, and the held notice below says so.
- **Two writers of `ai/queue`, one compare-and-swap.** The lease is the rewrite's alone — it names the sha the run read, against a session that pushes plain and pulls when the rewrite refuses it ([two writers](/docs/infra/review-collector/two-writers)). A rewrite the session's push beat is not redone: that push fast-forwarded the sha the lease named by a commit or two, so the rewrite carries those onto itself and pushes again under the lease the push moved to, a few times over before giving up — redoing the run would hand the resolver the same conflict to lose to the next push, which under an active session never converges. Only a queue whose history the session rewrote, or a carried commit that conflicts with the rewrite, exits the run idle, since that push fires a run of its own that replays onto what the queue then carries — porting off the stale head instead would hold on a conflict the next run resolves.

## Port

The port builds the window as a local branch, one cherry-pick at a time, and measures after each from the tree that will be pushed.

```mermaid
flowchart TD
  C[candidate = origin/develop] --> FX[Cherry-pick every ai/review-fixes commit<br/>fixes always lead and never split]
  FX --> Q{Next unported queue commit}
  Q -->|claims no review| Q
  Q -->|none| RD
  Q -->|conflict| H[Stop before it — the sync could not resolve it]
  Q -->|applies| M{Window files within the cap}
  M -->|yes| Q
  M -->|no| U[Undo that pick — it is the first held commit]
  U --> RD
  H --> RD{Ready}
  RD -->|nothing owed at all| N[Exit — ai/queue is synced with develop<br/>or its claimed commits wait on the lane]
  RD -->|nothing taken under a rate limit| AK[Ask for the review the limit refused<br/>at the deadline the bot stated]
  RD -->|no fixes and the first queue commit is held| F[Note it on the commit once, then fail red —<br/>idle under a rate limit, the ask first]
  RD -->|nothing to add, develop already carries the window, no PR open| OP[Open the release PR]
  RD -->|yes| FM[Fold main in — lockfile rebuilt,<br/>Claude resolves any other conflict] --> P[Push — unverified, develop's CI is the check]
  P -->|no PR open| OP
```

- **Fixes always ride, whole.** A fix split from the finding it answers is a reply that lies. Fixes alone over the cap fail the run — a drain that touched far more than its findings, for a person to see.
- **Only what the queue authored is owed.** A merge of `main` into `ai/queue` brings `main`'s commits and the merge itself, none of it the queue's. The porter takes the queue's commits that are neither on `develop` by patch id nor reachable from `main` nor named — under any identity they have carried, by a copy anywhere on either — and a cut whose ancestors hold anything the porter did not pick — a skipped merge, a commit claiming no review — is ported rather than fast-forwarded. A fast-forward moves `develop` to the queue's own sha, so everything behind that sha rides with it: a cut that carries more than was counted would put a claimed commit into the very review its claim exempts it from, over a cap measured without its files.
- **Queue order, never reordered, and a claimed commit only when something needs it.** A commit carrying `Express:` is the lane's and is skipped as if it were not there — what follows it ports — unless an owed commit only applies on top of the claimed commits skipped before it, and the window then carries those ahead of it; the first remaining commit that would overflow the cap or conflicts is where the window ends, and the count includes every fix. A hold is the residual case — a reshaping or a resolution past its attempt cap, or a dry run that resolves nothing.
- **The window is counted from the frontier, on the pull request's own side of `main`.** A review covers everything since the one that last wrote a body, so a window pushed on top of an unreviewed one is read as a single range; measuring from the head lets the pair overflow the cap, past which CodeRabbit skips the review outright. The files a fold of `main` brings are excluded: the bot's file cap is the pull request's diff against its base, which a merged-in base never enters. That is an assumption about the bot, stated here because the code cannot verify it — a wrong guess surfaces as a review skipped for too many files, which the gate reads as an unrecognised check state and fails red, never silently.
- **The fold always lands.** What reached `main` unread — an express cut, a dependency bump — is merged into the candidate so `develop` never diverges from `main` into the release merge: the lockfile conflict is rebuilt from the installed tree (`git` skill), any other is the resolver's, counted on `main`'s head, and only past its attempts is the fold abandoned — the release's own fold then fails the run red, naming `main`'s head for a person to merge.
- **The window is pushed unverified.** `develop` runs its own CI after the push, and a red there is one more commit in the next window.
- **Fast-forward when the shas allow it** — no fixes, the queue sitting on `origin/develop`, no skipped merge among the cut's ancestors, nothing folded — so the session's local branch already matches and no rebase is owed.

### Readiness

The window goes out when the port holds anything at all — a fix, a queue commit that fit, or what `develop` already carries unreviewed — at whatever size it reached; with none of those, nothing is owed, or the run fails red when the first commit is held.

**There is no lower bound on a window.** The port takes every commit the queue owes and stops only at the cap or on a conflict, so a window that came out small is the whole of what was left — and waiting for it to grow waits on a push nothing has promised while the queue stays unsynced. Fixes alone are the same case, and go out the moment they are drained (why is Settled on the overview page). The standing goal is `ai/queue` fully drained into `develop`; the cap is the only size the window is measured against, and it is measured on the tree that will be pushed.

A held window cannot grow — the commit that stopped it is past the reshaper's or the resolver's attempts, and only this window landing clears anything. With no pull request open, the commits `develop` already carries above the merge base count beside the queue's, so a `develop` a dying run left pushed is ready with nothing to add and only the opening is owed. Under a rate limit the review the limit refused is asked for first ([the runner's retrigger](/docs/infra/review-collector/runner)), since its answer is still owed — and a held first commit exits the run idle there rather than red, because a throw would lose the retrigger the job output carries. So the held commit is told on itself, once, whatever the gate said: a marker comment on the commit, posted by the first run that holds on it.

## Push, reply, open

The push is `git push --force-with-lease=refs/heads/develop:<measured> origin candidate:develop`, preceded by a fresh fetch and a re-read of the check. The lease is the compare-and-swap: the remote refuses the update itself if `origin/develop` left the sha every count was measured from, so there is no gap for a concurrent update to land in; that refusal is read off the ref rather than git's localized rejection text, the run reports a moved outcome and the next one re-measures, while a push that failed for anything else fails the job as itself. The re-read catches a review a person started with a comment while the run worked, and it **fails closed**: a status that cannot be read at all is not a free slot, because `gh` answering nothing looks exactly like a review that began a second ago, and pushing on that reading cancels it for a window nobody re-measures. The ask under a rate limit is guarded the same way, for the same reason. After the push the reply step runs again and posts `Agreed, fixed in <sha>` on every thread a pushed commit's trailer names, and one verdict comment per `Drains:` review id.

With no pull request open, the push is followed by opening one — the same readiness a push clears, because opening is the first review of the range. A run that pushed and died before opening is finished by the next one, which finds `develop` carrying the window with nothing to add. Nothing is deleted afterwards: `ai/review-fixes` stays, owing nothing, until the next drain re-creates it, and the queue's ported commits drop from the session's history at its next rebase.

## Why a re-run is a no-op

| Step   | Precondition read from the remote                                                             | Effect                                         | Second run against unchanged state                                                 |
| :----- | :-------------------------------------------------------------------------------------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------- |
| return | `develop` an ancestor of `main`, the two apart                                                | fast-forwards `develop`                        | they agree — nothing, and the pass goes on either way                              |
| repair | CI red on `main`'s head, the streak under the cap                                             | the regenerators else a session, a cut, a push | the push made a new head CI has not concluded on — nothing                         |
| reply  | a trailer's thread lacks a reply citing that sha                                              | posts the reply                                | every thread has one — nothing                                                     |
| gate   | the newest stated range's end, check bucket                                                   | a scheduled retrigger                          | same verdict, same deadline — the ask is posted once per block                     |
| drain  | a finding is open by the predicate                                                            | commits on `ai/review-fixes`                   | every finding carries a trailer or a reply — nothing                               |
| judge  | clean at the head, no least level stated for it, no verdict marker                            | records a verdict                              | the marker is re-applied — no session                                              |
| sync   | the queue does not sit on the target, or an owed commit claiming review is alone over the cap | rewrites `ai/queue`                            | it sits on it and every commit fits — nothing                                      |
| merge  | the range at the head, nothing open, the least level stated or a merge verdict                | merges the pull request                        | none is open — the next window fills from the merge base                           |
| port   | `git cherry` lists unported commits, readiness                                                | a local branch                                 | same branch, discarded with the runner                                             |
| push   | `origin/develop` unchanged since the read                                                     | fast-forwards `develop`                        | the last push moved the head, so the body no longer ends at it — exits at the gate |
| open   | no release pull request, `develop` at the target                                              | opens the pull request                         | one is open — the ordinary cycle, with its reviews as the frontier                 |

## Notes

- **Rejected: verifying a window before the push** — build, typecheck and lint on the candidate, dropping the tail commit until green. A gate with no remedy: the window is a prefix of the queue, so a red commit inside it holds every window behind it while its repair sits commits later and past the cap, and each attempt spends runner-minutes finding that out. The queue's own CI already names the red commit to the session that can fix it in the next commit. The express lane's cut reaches `main` unread and is not verified either; the [repair](/docs/infra/review-collector/repair) answers whatever red it leaves there.
- **Rejected: a person merges a release the bot rates above the least risk, or rates not at all.** It was the one human step left, and the step every release idled behind: the first release under the self-merge sat clean for a day at `Moderate` and was merged by hand. A person reading a rationale whose concerns the drain already answered adds a delay, not a judgement; the judgement that is real — is anything left — is the verdict's, once per head.
- **Rejected: holding the queue on a commit alone over the cap for a person to split.** Every hourly slot until then went to the drain's fixes alone, and the red that told the person arrived only with the first clean review. Repackaging is the collector's, and the commit's author is asked for nothing.
- **Rejected: undoing a fold of `main` that put the range over the cap.** It left `develop` diverged until the release merge, where a conflict was a person's, and it counted files the bot's cap does not.
