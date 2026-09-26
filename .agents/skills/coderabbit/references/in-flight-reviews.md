# Never Push Into an In-Flight Review

Read before pushing to a branch with an open pull request against `main`, or when a review returned fewer comments than its diff warrants.

Pushing while a review runs cancels it and retriggers a fresh one, costing a slot and losing the in-progress findings. CodeRabbit is **incremental** — it does not re-review commits it has already reviewed — so a cancelled review's comments do not come back.

```bash
gh pr checks --json name,state,bucket,description --jq '.[] | select(.name=="CodeRabbit")'
```
