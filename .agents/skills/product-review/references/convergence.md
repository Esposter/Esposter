# Convergence

Read when deciding whether an area is done, or whether a change counts as churn.

## What counts as churn

| Churn — the area is not done                         | Not churn                                            |
| ---------------------------------------------------- | ---------------------------------------------------- |
| a new proposal                                       | a proposal verified and left untouched               |
| a proposal's design changed                          | a proposal built and rewritten as its as-built page  |
| a deferred idea promoted, or a rejected one reversed | a deferred idea whose trigger has not fired, re-read |
| a new deferred or rejected page                      | a broken link or stale path fixed                    |
| a defect found in shipped behaviour                  | a source link swapped for a live one saying the same |

A defect counts because it means the last pass read the surface less closely than this one did.

## The stop rule

An area is **converged** when one full pass — every step of the loop, every open proposal verified — produces no churn. The pass says so in its report and its commit subject, and the next pass of that area starts only when something moves under it: a feature ships, a reference product changes its main screen, a deferred trigger fires, or a user reports a gap.

An area that keeps producing churn pass after pass is being read, not finished — each pass should find strictly less. When a pass finds as much as the last, the inventory questions (`references/gap-inventory.md`) are missing the kind of gap it keeps finding, and the fix is a new question there rather than another pass.

## The record

The commit that closes a pass is subject-tagged so the history answers "when was this area last reviewed, and what did it find" without a hand-kept list:

```text
docs(product-review): <area> — <n> proposals, <n> decisions, <n> fixes
docs(product-review): <area> — converged
```
