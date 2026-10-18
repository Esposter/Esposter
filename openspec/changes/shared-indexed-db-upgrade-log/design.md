# IndexedDB upgrade failure logged once

A failed upgrade is logged twice. `openDatabase` logs the error the upgrade callback threw and then aborts the transaction. The abort rejects the transaction's `done` with an `AbortError`, and `wrapUpgradeTransaction` logs that rejection too, since nothing else reads `done`. One throw prints two console errors, the second naming only the abort.

The two logs are not redundant in every case. A failure that is not a throw, such as a request error inside the upgrade, aborts the transaction without any thrown error for `openDatabase` to log, so `done`'s log is then the only one. The fix has to keep that case logged.

## Options

- **The open logs, the transaction does not.** `openDatabase` logs the thrown error, and `wrapUpgradeTransaction` attaches a handler that stays silent for the abort it caused. A request error that aborts with no throw then goes unlogged, unless the open logs the transaction's error as well, which is the second log again.
- **The transaction logs, the open does not.** `wrapUpgradeTransaction` logs every failed `done`, and `openDatabase` stops logging the thrown error. The log then names only the `AbortError`, losing the message the callback threw, which is the one a reader needs.
- **The open records the abort's cause.** `openDatabase` keeps the thrown error as the abort's cause and `wrapUpgradeTransaction` logs `done` only when no cause is recorded. This keeps one log per failure and the thrown message, at the cost of a shared cause the two functions must agree on.

The indexed-db page's rationale says a failure nobody reads is logged because the open request already carries it. The third option keeps that wording true and changes only what the transaction's handler checks before it logs.

## Decision needed

Choose one option, then change the code and the indexed-db page's `done` bullet in the same commit.
