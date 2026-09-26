# Never Push Into an In-Flight Review

Read before pushing to a branch with an open pull request against `main`, or when a review returned fewer comments than its diff warrants.

Pushing while a review runs cancels it and retriggers a fresh one, costing a slot and losing the in-progress findings. CodeRabbit is **incremental** — it does not re-review commits it has already reviewed — so a cancelled review's comments do not come back.

```bash
gh pr checks --json name,state,bucket,description --jq '.[] | select(.name=="CodeRabbit")'
# {"bucket":"pass","description":"Review rate limited","name":"CodeRabbit","state":"SUCCESS"}
```

**Read `bucket` first, then `description`.** `bucket` is gh's normalization across both representations a check can take — CodeRabbit posts a commit status while Actions entries on the same PR are check runs — so `pending` means a live review whatever is reported underneath.

| bucket / description                          | meaning                        | push?                         |
| :-------------------------------------------- | :----------------------------- | :---------------------------- |
| `pending` (any description)                   | live review, a push cancels it | **wait**                      |
| `pass` / `Review completed`                   | finished                       | push                          |
| `pass` / `Review rate limited`                | never started, nothing running | **push**                      |
| `pass` / skip comment says `Too many files`   | never started                  | push, but fix the count first |
| `fail`, missing row, or anything unrecognised | unknown                        | **wait**, then look           |

The last row is the default: being wrong about a running review costs its findings and a slot, being wrong about a finished one costs a minute. The collector's gate answers that row differently on purpose — nothing re-fires a cycle that exits quietly, so it fails the run red where a person waits and looks. `Review completed` names no range: it is the status of whichever review ran most recently, never clearance for the current head — the frontier is the last sha a review body names, and the collector reads it from there.

Symptoms that a push landed mid-review: a `> [!CAUTION] Failed to replace (edit) comment` / `putComment timed out` comment from the bot, or a review returning far fewer comments than the diff warrants.
