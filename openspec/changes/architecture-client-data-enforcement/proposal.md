# Client-data enforcement

Gap 6 of the [gap survey](../gap-survey-2026-10-25/proposal.md).

## Why

The [client data design](../../specs/architecture/client-data/design.md) lists the shapes the repo used and then left behind, each with the check that stops it coming back. Two of those rules are marked **not yet mechanically enforced**, and each says review owns it:

- **An optimistic count**: moving a displayed count before the server answers. The viewer's own vote may move at once, because the client holds it exactly. The count cannot, because the client does not hold it.
- **Two reads sent in one tick, one held open**: a test that holds one read open while another waits behind it deadlocks, because tRPC answers a batch as one response.

The [enforcement ladder](../../specs/architecture/enforcement-ladder/design.md) says a rule that holds only while someone remembers it is a bug with a delay, and that each rule goes on the highest rung that can carry it. Both rules are being held by a reviewer's memory now. The ones a reviewer is most likely to miss are these two, since neither fails on its own.

## What Changes

- **Optimistic count** gets a lint rung. A custom oxlint plugin, in the shape the persist-then-notify rule already uses, fails a write to a server-derived count that comes before the first `await` of a function which calls a mutation. The viewer's own mark is not a count, so it is not matched.
- **Held read** gets a structural rung. The test environment's client sends each read as its own request, so no read can be held behind another. Production keeps batching.
- The two rules' anti-pattern entries in the client-data design stop saying review owns them, and name the rung that now does.

## Recommendation

Lint for the optimistic count and structure for the held read, rather than a test for each.

- A test for the optimistic count would have to be written per store, which is the cost the ladder says a rung 4 check carries forever. A lint rule reads every file the moment it exists.
- A lint rule for the held read cannot see the deadlock, since the deadlock is in the batch's shape, not in the syntax of the test that causes it. Removing the batch from the test client removes the cause, so the rule holds without a reader.

## Capabilities

- **architecture/client-data** (modified): two rules, that a displayed count holds until its write settles, and that a test's read settles without waiting for another read in its tick.

## Impact

- Lint fails the first time a store writes a count before its mutation settles. Any existing site the rule finds is fixed in its own commit before the rule is wired, so the tree passes when the rule lands.
- The test client's link differs from production's. A test that depends on batching would fail, and none is expected, since batching is the thing the rule says tests must not depend on.
- No runtime behaviour changes for a user.
