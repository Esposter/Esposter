# Shared roadmap

The utilities in `@esposter/shared` are as built on their own pages; what is open is the decisions one of them still owes.

## Next

- [ ] [IndexedDB upgrade failure logged once](../shared-indexed-db-upgrade-log/design.md) — a throwing upgrade callback prints twice, once from the open and once from the transaction's abort; the layer that owns the single log is the decision
