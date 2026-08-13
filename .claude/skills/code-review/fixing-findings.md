# Closing a finding so the next review cannot reopen it

Read when **applying** fixes, not when running a review. Paste it into the prompt whenever a fix round is delegated.

The dominant defect class on a re-review is not a missed bug — it is a **regression from the previous round's fixes**, usually at the seam where two independently-tested features meet. Each feature's tests stay green because each is right alone, so a round that adds one test per fix still leaves the seam untested.

**A crossing test is required of any fix that edits a line an earlier fix wrote.** `git log -L <range>:<file>` names the features to cross; the last round's fix commits are the cheapest place to find the next seam.

## Order of work

Root-cause fix → converge the call sites onto the primitive → docs and skills → **then** one check pass over the finished tree. Never interleave the checks: a session that spends its budget on a fixture's missing field ships the symptom fix and queues the root cause.

**Deleting the compensating code is part of the fix.** When the root-cause fix makes a wrapper, guard or flag unnecessary, it comes out in the same change — a wrapper left behind is one someone must remember to apply, which is the defect class just removed.

## Why a fixed finding comes back

Each entry below shipped, passed its own new test, and was found again one round later. A finding tagged `regression` or `reopened` is almost always one of them.

**Coverage**

- **Fixed N−1 of N sites.** An invariant is not applied until every site holds it. **Collapse the sites onto one primitive that cannot be half-applied** rather than copying the fix and its test into each — the duplication is why it drifted, and per-site tests only pin the drift. Then one test covers the behaviour and the call sites need only wiring tests.
- **The claim was never pinned by a test.** A commit message describing behaviour the code does not have is a claim. Every fix lands with a test that fails against the pre-fix code.
- **The fix lives in the review workflow, which has its own suite.** `.claude/workflows/code-review/` drives the shipped script with stubbed agents; a finding about parsing, scoping, dedupe, confidence, resolution or report assembly becomes a test there. Adding it is part of the fix.

**Guards and thresholds**

- **Bought the guarantee by exempting one value from an existing guard.** The value a fix wants to exempt is characteristically the one another actor just wrote. Name the guard and what it protects; where the protection is real, defer the work instead and write the deferral down. An exemption that must ship lands with the test that **crosses** it — the guard's own case, plus the exempted value under exactly the condition the guard exists for. This is the most common way a fix round opens a worse hole than it closed.
- **The new guard's fallback fires exactly when the guard matters.** "If this resolves to nothing, use the raw input" — and the empty case _is_ the case the guard was built for, so the bound holds on every run that did not need it. A fallback must be at least as loud as the guard: name the empty case out-of-scope, or fail.
- **The threshold cannot tell a low answer from no answer.** A confidence floor or freshness cut-off filters on a field a crashed or skipped step also leaves behind, so the gate deletes the evidence on exactly the degraded runs. Gate on whether the producing step ran, and let the no-answer case through carrying its reason.
- **A guard was added and existing mocks walk into it.** Suites that stubbed the guarded value with the now-rejected input assert the guard instead of their subject — sometimes only on one platform. Adding a guard means grepping every mock of the value it guards, and collapsing them onto one shared fixture.

**Ordering and dispatch**

- **Moved a step into a path that takes the same resources in the opposite order.** Merging a job into an existing write path is usually right, but the job held its locks alone and the host path holds someone else's first — so the merge creates a second lock order. Nothing fails in a test; it surfaces as an intermittent abort on whichever side loses. **A resource order is a global invariant: write it down once and make every path obey it**, and where it forces a step earlier than reads naturally, say in the comment that the ordering is why.
- **Registered the new participant in a dispatch keyed on something it never carries.** The entry looks complete and can never be read, which is worse than its absence — the gap is invisible to the next reviewer. Trace one real value from producer to lookup before adding the entry.
- **Keyed a merge on fewer fields than the thing it merges varies by.** A dedupe or group-by on the obvious identity discards a whole deliverable when the values differ along a dimension the record keeps separate, and stamps the survivor with the loser's label. The key is every field a consumer distinguishes.

**Root cause vs compensation**

- **Picked a side of a guess the code cannot make.** Is the blob missing or is its SAS expired; is the cache entry abandoned or mid-run. Both sides are wrong for the other case, so the next review confirms the opposite finding on the same lines forever. **Name the missing fact and record it at the moment it is known**, then the decision reads a fact instead of guessing. "Flip the flag / trust the other signal" is this entry until proven otherwise.
- **Compensated for another fix instead of removing it.** A finding says a mechanism strands data; the fix adds a sweep that goes and finds it — closing the finding and adding a polling loop forever. Ask what opens the window before building anything that closes it. A compensator is right only when the cause is load-bearing, and then it says so in the same commit.
- **Deleted the mechanism, kept the artifacts only it justified.** Its index, registry entry, config knob and comments each read as a claim that it still exists, and a later review reports them one at a time. Grep from the comments that name it out to the indexes and constants whose only reason was its query, and remove them in the same change — including the schema ones that cost a migration.

**The record**

- **The record still describes the old behaviour.** Docs and skills are the tiebreaker a verifier greps, so a stale line argues _for_ reopening. The doc edit is part of the fix that changed the behaviour.
- **A comment asserted a mitigation that does not exist.** "A stray entry is swept by X" reads as a closed loop to every later reader, which is what stops anyone looking. Either the mechanism exists and a test pins it, or the comment says plainly that nothing reclaims it.
- **Wrote a guarantee the code does not keep on every path.** A promise is a claim about every early return, dead-agent branch and mode the author did not have open. Grep those paths first, and either fix them in the same change or state the exception.
- **Restated a number the code could publish.** A count, formula or threshold in prose has no way to fail, so it fails silently and forever, and the next fix re-states today's reading. **Make the code emit the value and have the record point at the field**; where it cannot, write where to re-check it rather than the reading.
- **Restated a rule beside the thing that owns it instead of calling it.** A second ordering, a second copy of a comparison, a re-derivation the caller already resolved — each diverges the moment either side is touched, with both sides' tests green. Call the owner; where there is no owner, make one. "The same ordering as X" in a comment is the tell.
- **Checked the claim against vendor documentation instead of the deployed resource.** Sound from the docs, wrong about a system that has run for months. One read-only query settles it — and the verified state goes into the record with the command that produced it.
- **The decision was deliberate but written nowhere.** Undocumented, it reads as a defect on every run. Write it **with its consequence named** ("nothing enforces this; an unterminated chain fails silently"), which is what ends the argument rather than inviting it.
- **The new entry beside a configured one inherited the default its sibling overrides.** Copied for shape, not for the comment explaining the override. Assume a sibling's override is load-bearing until its comment says otherwise.

**This list is append-only, and extending it is part of applying a fix.** When a `regression` or `reopened` finding matches no entry, the round is not done until the new cause is written here in the same shape: what the fix did, why the next review re-finds it, and the remedy that ends it rather than alternating it. A cause that stays unwritten is re-derived, half-remembered and re-shipped every round.
