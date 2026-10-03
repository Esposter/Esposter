# One Pass

Read when running a sweep pass — picking a unit, committing it, carrying its trailer, and deciding when the checks run. The rules' one-liners are in `SKILL.md`; this page is the loop and every rule inside it.

```mermaid
flowchart LR
  COVER["ai:sweep:ledger-coverage<br/>dates rows, names models from trailers, syncs derived rows"] --> PICK["pick the next unswept unit"]
  PICK --> APPLY["apply the owning convention"]
  APPLY --> CHANGED{"did the unit change?"}
  CHANGED -->|"no"| HOLD["hold its trailer for the next commit"]
  HOLD --> PICK
  CHANGED -->|"yes"| GATE{"does a fix change behaviour?"}
  GATE -->|"yes"| RAISE["raise it — an open finding or its own proposal"]
  GATE -->|"no"| TESTS["ground it — regression test, dedupe fixtures"]
  RAISE --> TESTS
  TESTS --> CARRY["carry docs + owning skill"]
  CARRY --> TICK["commit<br/>Ledger trailer for the unit, plus any held"]
  TICK --> PICK
  TICK -.->|"the sitting goes out"| CHECK["the touched tests, once"]
  CHECK --> COVER
```

- **Read the leaf, not the tree.** A pass loads `.agents/ledgers/README.md` and the one file it is sweeping — for a promoted ledger, its folder's `README.md` too, since the find recipe and exclusions live there and the area file holds coverage alone (`references/ledger-files.md`).
- **Run the pass in the main session, one unit at a time.** A sweep reads a whole tree to change a fraction of it, and delegation is priced by files read rather than files changed — fanning units out to agents costs a large multiple of sweeping them here, and an agent that exhausts its budget mid-unit leaves a tree that cannot be ticked (the `model-delegation` skill, "A reading pass is not delegable work"). It also throws away the pass's own learning: a carve-out the rule failed to state is found once in a sequential pass and applied to every unit after it, where parallel agents each re-derive it or miss it. If a sweep is ever delegated anyway, it is still **one agent per leaf** — two inside one file trample each other.
- **Behaviour-preserving only.** A finding whose fix would change behaviour is raised, never folded in — the pass has to stay revertible as a unit.
- **One unit per commit**, so a pass that turns out wrong reverts cleanly, and the commit's trailer names the unit — `Ledger: <ledger> | <unit>`, the unit cell verbatim (`` Ledger: typescript/messaging | `app/store/message/room` ``) — which is what dates the row: `pnpm ai:sweep:ledger-coverage` writes the trailers' dates into the ledger files at the start and end of a sitting and reports a trailer naming no row. A rule change that invalidates coverage carries `Reopens: <ledger>` instead (`references/ledger-files.md`, "Coverage"). **A unit the pass reads and leaves unchanged has no commit of its own**, so its trailer rides the sitting's next commit — the next unit's, or the ledger commit at the end — never an empty commit, which the porter cannot cherry-pick and drops from every window.
- **Never sized to the review budget.** The collector cuts every window at the cap (`REVIEW_FILE_CAP`, the `coderabbit` skill, `references/file-cap.md`) and repackages a commit that crosses it alone (`review-queue` skill), so a session counts no files against it. A unit is split only when it is too large for one pass to read (`references/ledger-files.md`).
- **Tests are part of the pass**, not a follow-up: anything the pass exposes gets the regression test it was missing, and repeated fixtures collapse (the `testing` skill, `references/test-helper-files.md`). A pass that only rewrote what typecheck already proves adds none — that is a result, not a gap.
- **The touched tests run once at the end of everything going out**, not per unit and not per file — several units swept in one sitting are one run, not one each (the `running-checks` skill, "One run, after every edit going out", and the `package-scripts` skill, `references/check-suite.md`). Commits stay per unit regardless; commits are cheap and checks are not. **The end is the sitting going out — the push — never a unit finishing**: a unit is done when its commit lands, and a pass that runs the checks there has bought a green tree for a diff that is about to grow by everything the sitting has left.
- **Area boundaries, another session's files** — `references/windows-and-convergence.md`.
- **A pure relocation may claim the express lane.** A commit that is nothing but a sweep's moves and the imports
  that follow them may carry `Express: <why>` and reach `main` without spending a review window (the `review-queue`
  skill, "Commit in any shape"); one that bundles a repair is reviewed whole, and one over the cap is repackaged by the collector either way.
- **Skipped findings, with the reason, go in the commit message.** The sweep file tracks coverage, not decisions — and never what a past pass changed, which git holds in full.
