# Caret Rules

Read when adding, removing or questioning a catalog entry's `^`, `~` or exact pin.

Every catalog entry has `^` except where a `renovate.json` hold pairs a tilde or an exact pin with its rule (`references/holding-a-dependency.md`); `pnpm outdated:dependencies` lists the held packages. A package capped at a major **keeps** its caret — the rule caps it, not a missing `^`. A tilde is what a cap on a **minor** looks like in the catalog, and it never stands alone: the rule is what stops the bot, the tilde what stops a re-resolve.

Before adding a `^` to a caret-less entry, check whether a hold names it; if one does, leave it alone. If none does, the missing caret is likely an oversight — add it.

**A prerelease keeps its caret.** Alpha/beta/rc/dev catalog entries are carets like everything else — this repo tracks their newest release deliberately, so a suggestion to pin one exactly (because a caret also satisfies the eventual stable, or because a sibling package's `peerDependencies` names one exact prerelease) is rejected, not applied. A `followTag` hold is the standing exception, pinned for the reason its `renovate.json` rule gives, not a precedent to extend.
