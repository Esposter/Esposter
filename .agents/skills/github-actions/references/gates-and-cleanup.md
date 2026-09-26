# Gates and Cleanup Steps

Read when writing an aggregate gate over other jobs, or a cleanup step that runs on failure.

## A skipped job reports its required check as satisfied

This is the failure mode worth knowing by heart: a job that `needs` a failed job is **skipped**, and a skipped required check is green. So a gate job that means "every shard passed" goes green precisely when a shard did not.

An aggregate gate therefore takes `if: ${{ !cancelled() }}` — not `always()`, which turns a cancelled run into a failure — and re-asserts the dependency as its own first step, before any setup. The step fails on every result that is not `success` — `skipped` included, since a shard skipped behind a failure the gate does not list reads as green, and `cancelled` for a job cancelled inside a run that was not:

```yaml
- name: 🚦 Gate on the shard results
  if: ${{ contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled') || contains(needs.*.result, 'skipped') }}
  run: exit 1
```

## `always()` is paired with a guard

A cleanup step that must run on failure (`always()`) runs on _every_ failure — including one that happened before the value it cleans up was ever produced. Unguarded, it replaces the real error with its own argument-parsing one. Gate it on the value, not just on the outcome: `if: ${{ always() && steps.<id>.outputs.<name> != '' }}`.
