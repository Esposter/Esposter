---
title: Roadmap
description: Open work in the shared utilities — the decisions the replaced-dependency utilities still owe, each linked to the proposal that holds it.
---

# Shared roadmap

The utilities in `@esposter/shared` are as built on their own pages; what is open is the decisions one of them still owes.

## Next

- [ ] [IndexedDB upgrade failure logged once](/docs/proposals/shared/indexed-db-upgrade-log) — a throwing upgrade callback prints twice, once from the open and once from the transaction's abort; the layer that owns the single log is the decision
