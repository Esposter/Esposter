# Never Push Into an In-Flight Review

Read before pushing to a branch with an open pull request against `main`, or when a review returned fewer comments than its diff warrants.

Pushing while a review runs cancels it, losing the in-progress findings for good. Incremental reviews are off, so the push asks for no replacement either — the pull request is left with no review at all.

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

The last row is the default: being wrong about a running review costs its findings and a slot, being wrong about a finished one costs a minute. The collector's gate answers that row differently on purpose — nothing re-fires a cycle that exits quietly, so it fails the run red where a person waits and looks. A release gets one review, so on the collector's pull request `Review completed` is that review, and the collector merges on it.

Symptoms that a push landed mid-review: a `> [!CAUTION] Failed to replace (edit) comment` / `putComment timed out` comment from the bot, or a review returning far fewer comments than the diff warrants.
