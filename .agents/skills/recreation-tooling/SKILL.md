---
name: recreation-tooling
description: Apply when recreating anything against a reference it must match (a game's screen or scene, another product's interface, a published design), when starting a kind of recreation no earlier one covered, and whenever such a loop has gone two passes without converging or a result depends on guidance. Esposter's protocol for turning a recreation from a search into a solve — every unknown listed and made separable, each answered by the most exact query the toolbox holds, and a missing query built as a tool before any further pass.
---

# Recreation Tooling

A recreation converges in a pass or two when every unknown in it can be answered on its own, and stalls when several unknowns land in one score that can only be searched. The Genshin interface is the first case: a backdrop zeroes every cell but the piece under test, the game's own rect tree maps onto CSS, and a score grid names the piece that is off. The Genshin login scene is the second: arrangement, camera, material, light, fog and grade all landed in one frame's score, and a long run of guided passes searched where a tool would have solved. This skill is the protocol that tells the two apart before the passes are spent. Each domain's own tools live on its toolbox page (Genshin's is the `genshin-parity` skill's `references/toolbox.md`).

## Settled — do not re-propose

- **Another pass on a stalled unknown**, a tweak, a wider search range, a better starting guess or the user's eye as the fix. A loop that has not converged in two passes lacks a query, and a third pass spends what the tool would have cost without building it (`references/solve-not-search.md`).
- **A search over a whole-frame score as the way an unknown is found.** Its minimum absorbs every other unknown's error (a wrong scale into a wrong pose, a missing texture into a brighter light), so a good score from it is evidence of nothing (`references/solve-not-search.md`).
- **Deferring a tool until "the scene is closer".** A tool is built when its unknown is first met; a recreation that waits for closeness before building its instruments never gets close.

## Rules

- **List the unknowns before building anything**, each with the kind of data that holds it: exact (the source holds it as a value), fieldless (the source holds it without its fields) or on screen only (`references/toolbox-audit.md`).
- **Make each unknown separable.** Find the setup in which only that unknown can move the score: a backdrop under an interface, a mask over one layer, a ratio no camera changes, a render with the other unknowns held at their exact values.
- **Answer each unknown with the most exact query there is**: the exact value read from the source, then a closed-form solve from known quantities, then a local refinement from that solve, and never a global search (`references/solve-not-search.md`).
- **A probe that answers an unknown is promoted, never left in the scratchpad.** A scratch script run a second time, or whose answer decides a change, is a tool the toolbox was missing: it becomes a command of the domain's CLI in the same chunk, with its test where it computes, its docs row and its toolbox row, and the scratch copy is deleted. Only an editing aid (a patch script, a one-off file rewrite) and a single what-if (a constant flipped to isolate one change's score) stay scratch. At the end of a chunk, list every scratch script it wrote and name each one's verdict.
- **Two passes without converging is a missing tool.** Stop, audit the toolbox against the unknowns (`references/toolbox-audit.md`), build the query that answers the stalled one, with its test, and only then run the next pass.
- **Every tool prints a number with its residual**, and writes an image only to check that number: a solve's reprojection error, a fit's error in pixels at the reference's pose, a regression's residual.
- **A tool is kept while it moves the benchmark** and deleted when superseded, in the same change that supersedes it (the `genshin-parity` skill's "A tool earns its place by the benchmark").
- **A domain's toolbox page maps each unknown to its tool**, and a tool that ships updates its row in the same commit, so the next session reads the map instead of rediscovering it.

## Reference pages

- `references/toolbox-audit.md` — when starting a recreation of a new kind, or when a loop has stalled: listing the unknowns, auditing the tools against them, and naming the gap.
- `references/solve-not-search.md` — when choosing how an unknown is answered, or when a search is about to be run: the ladder from exact data to refinement, and why a search at the top is never the tool.
