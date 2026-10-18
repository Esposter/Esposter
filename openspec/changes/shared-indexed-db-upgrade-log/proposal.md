# IndexedDB upgrade failure logged once

## Why

A failed upgrade is logged twice. The open logs the error the upgrade callback threw, then the transaction's abort rejects its `done` with an `AbortError`, and that rejection is logged too. One throw prints two console errors, and the second names only the abort. The two logs are not redundant in every case: a request error inside the upgrade aborts the transaction with no thrown error, so the transaction's log is then the only one, and the fix must keep that case logged.

## What Changes

Log each failed IndexedDB upgrade once, naming the message the upgrade callback threw, without leaving a failure that throws nothing unlogged. Which of three logging options is built is not yet decided (see tasks).

- A thrown upgrade failure writes one console error instead of two.
- The logged error names the message the upgrade callback threw.
- An upgrade that aborts without a throw is still logged.

## Capabilities

- **shared/indexed-db-upgrade-log** (new)

## Waiting on

None.

## Impact

The IndexedDB upgrade logging in the shared package, and the indexed-db design's `done` bullet, which changes in the same commit as the code.
