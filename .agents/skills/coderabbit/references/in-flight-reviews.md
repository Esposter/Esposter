# Never Push Into an In-Flight Review

Read before pushing to a branch with an open pull request against `main` or a window branch, or when a review returned fewer comments than its diff warrants.

Pushing while a review runs cancels it, losing the in-progress findings for good. Incremental reviews are off, so the push asks for no replacement either — the pull request is left with no review at all.

```bash
gh pr checks --json name,state,bucket,description --jq '.[] | select(.name=="CodeRabbit")'
# {"bucket":"pass","description":"Review rate limited","name":"CodeRabbit","state":"SUCCESS"}
```

**Read `bucket` first, then `description`.** `bucket` is gh's normalization across both representations a check can take — CodeRabbit posts a commit status while Actions entries on the same PR are check runs — so `pending` means a live review whatever is reported underneath.

| bucket / description                                     | meaning                        | push?                         |
| :------------------------------------------------------- | :----------------------------- | :---------------------------- |
| `pending` (any description)                              | live review, a push cancels it | **wait**                      |
| `pass` / `Review completed`                              | finished                       | push                          |
| `pass` / `Review rate limited`                           | never started, nothing running | **push**                      |
| `pass` / `Review skipped: N files exceed the limit of M` | never started                  | push, but fix the count first |
| `fail`, missing row, or anything unrecognised            | unknown                        | **wait**, then look           |

The last row is the default: being wrong about a running review costs its findings and a slot, being wrong about a finished one costs a minute. The collector's gate answers that row differently on purpose. A missing check fails its run red, and any other finished state is the bot running no review — a skip for the plan's file limit or its credits, a failed review — so the collector asks for that window's review once with `@coderabbitai review`, whose answer fires the cycle again. Only a window the bot skips again after that ask fails the run red, and only after every window above it is settled: nothing re-fires a cycle that exits quietly, and a second ask would be skipped the same way. A window gets one review, so on a window's pull request `Review completed` is that review, and the collector merges the bottom window on it.

Symptoms that a push landed mid-review: a `> [!CAUTION] Failed to replace (edit) comment` / `putComment timed out` comment from the bot, or a review returning far fewer comments than the diff warrants.
