# Caret Rules

Read when adding, removing or questioning a catalog entry's `^`, `~` or exact pin.

Every catalog entry has `^` except what a `renovate.json` rule explains: the exact pins (`drizzle-kit`, `drizzle-orm`, `typescript`) and the one tilde, the unocss trio. `h3` **has** a caret — it is capped by a rule, not by a missing `^`. A tilde is what a cap on a **minor** looks like in the catalog, and it never stands alone: the rule is what stops the bot, the tilde what stops a re-resolve.

Before adding a `^` to a caret-less entry, check it against the exact pins; if it's there, leave it alone. If it isn't, the missing caret is likely an oversight — add it.

**A prerelease keeps its caret.** Alpha/beta/rc/dev catalog entries are carets like everything else — this repo tracks their newest release deliberately, so a suggestion to pin one exactly (because a caret also satisfies the eventual stable, or because a sibling package's `peerDependencies` names one exact prerelease) is rejected, not applied. Drizzle is the standing exception, pinned for the reason its `renovate.json` rule gives, not a precedent to extend.
