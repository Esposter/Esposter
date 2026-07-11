---
title: Column-scoped find & replace
description: Restrict find and replace to a single selected column.
---

# Column-scoped find & replace

Restricting find & replace to a single selected column instead of the whole dataset.

**Why not:** The existing global find & replace plus per-column filters cover the practical use cases — filter the column, inspect the matches, replace globally; exact-match replacement across other columns rarely collides. Same rationale family as [regex find & replace](/docs/file-table-editor/rejected/regex-find-replace): scoping options multiply UI for a marginal slice of use.
