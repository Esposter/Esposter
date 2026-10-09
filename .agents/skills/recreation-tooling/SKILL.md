---
name: recreation-tooling
description: Apply when recreating anything against a reference it must match (a game's screen or scene, another product's interface, a published design), when starting a kind of recreation no earlier one covered, and whenever such a loop has gone two rounds without converging or a result depends on guidance. Esposter's protocol for turning a recreation from a search into a solve — passes in dependency order, each gated by its own measure and frozen, every unknown listed and made separable, each answered by the most exact query the toolbox holds, and a missing query built as a tool before any further round.
---

# Recreation Tooling

A recreation converges in a round or two when every unknown in it can be answered on its own, and stalls when several unknowns land in one score that can only be searched. The Genshin interface is the first case: a backdrop zeroes every cell but the piece under test, the game's own rect tree maps onto CSS, and a score grid names the piece that is off. The Genshin login scene is the second: arrangement, camera, material, light, fog and grade all land in one frame's score. This skill is the protocol that tells the two apart before the rounds are spent. Each domain's own tools live on its toolbox page (Genshin's is the `genshin-parity` skill's `references/toolbox.md`).

## Settled — do not re-propose

- **Another round on a stalled unknown**, a tweak, a wider search range, a better starting guess or the user's eye as the fix. A loop that has not converged in two rounds lacks a query, and a third round spends what the tool would have cost without building it (`references/solve-not-search.md`).
- **A search over a whole-frame score as the way an unknown is found.** Its minimum absorbs every other unknown's error (a wrong scale into a wrong pose, a missing texture into a brighter light), so a good score from it is evidence of nothing (`references/solve-not-search.md`).
- **Working a term whose ceiling is small next to the largest**, a detail because it is cheap, visible or nearest to hand. The dominant terms re-price it the moment they move, so it is paid for twice (`references/gain-first.md`).
- **The frame's score as the loop.** Scoring the whole frame against a recording after each change, and working whatever term it ranks largest, judges every unknown through every other: a misplaced part reads as a light, a light trades with a haze. Each pass is worked on its own measure and frozen, and the frame is acceptance (`references/passes.md`).
- **Deferring a tool until "the scene is closer".** A tool is built when its unknown is first met; a recreation that waits for closeness before building its instruments never gets close.

## Rules

- **Work in passes, in dependency order**: each pass answers one kind of unknown from its most exact source, is judged by its own measure at the reference's camera, gated at the reference's noise and frozen by a test, and a later pass that finds an earlier one wrong reopens it rather than compensating; the recording judges only what exists at run time (`references/passes.md`).
- **Inside a pass, rank every term by its ceiling before choosing the next one**, the most of the score an exact answer would recover, measured by the domain's ranking command each round, and work the largest over its cost first; a term an order of magnitude below the largest waits, and a term of randomly placed content counts only its colours' share (`references/gain-first.md`).
- **List the unknowns before building anything**, each with the kind of data that holds it: exact (the source holds it as a value), fieldless (the source holds it without its fields) or on screen only (`references/toolbox-audit.md`).
- **Make each unknown separable.** Find the setup in which only that unknown can move the score: a backdrop under an interface, a mask over one layer, a ratio no camera changes, a render with the other unknowns held at their exact values.
- **A measure must punish a missing answer, and be reachable by what may ship.** Three checks before any number is trusted:
  - Drawing nothing scores worse than drawing the target. A backdrop that holds the target's own pixels rewards drawing less, so the backdrop is a clean plate with the scored region filled from its border.
  - The gate can be met by the project's own output. A pixel-aligned comparison against a texture the project never ships cannot be met, so that term is matched in distribution (variance and band energies), with its gate taken from the source's own split-half floor.
  - A capture's artefacts (compression blur, scaling) are applied to our shot in the comparison, measured once per capture, and never baked into the product.
- **Answer each unknown with the most exact query there is**: the exact value read from the source, then a closed-form solve from known quantities, then a local refinement from that solve, and never a global search (`references/solve-not-search.md`).
- **A probe that answers an unknown is promoted, never left in the scratchpad.** A scratch script run a second time, or whose answer decides a change, is a tool the toolbox was missing: it becomes a command of the domain's CLI in the same chunk, with its test where it computes, its docs row and its toolbox row, and the scratch copy is deleted. Only an editing aid (a patch script, a one-off file rewrite) and a single what-if (a constant flipped to isolate one change's score) stay scratch. At the end of a chunk, list every scratch script it wrote and name each one's verdict.
- **A gap is closed by the smallest general tool, for every asset of its kind, before the work it blocks.** When the pipeline drops what a recreation needs (an export format losing a field, a resolver blind to a tree, a fit that works on one whole part only), the tooling is completed where the data is lost, once, so the next part of that kind needs no new code: the door's skin is read by exporting every mesh's JSON beside its OBJ and posing any rigid skin through its clip (`fitRigidPieces`), not by a probe of the door. The most efficient minimal solution to the class of problem is the deliverable; the part at hand is its first use.
- **A source a tool refuses is the tool's failure until its own log and options say otherwise.** A dead end is written into a reference only with the cause the refusing tool logged and the options it offers read first, since a recorded "cannot be read" stops every later session from trying; a domain's known refusals and their workarounds sit on its data-formats page (Genshin's is `apps/web/content/docs/genshin/game-data-formats.md`).
- **Two rounds without converging is a missing tool.** Stop, audit the toolbox against the unknowns (`references/toolbox-audit.md`), build the query that answers the stalled one, with its test, and only then run the next round.
- **Every tool prints a number with its residual**, and writes an image only to check that number: a solve's reprojection error, a fit's error in pixels at the reference's pose, a regression's residual.
- **A tool is kept while it moves the benchmark** and deleted when superseded, in the same change that supersedes it (the `genshin-parity` skill's "A tool earns its place by the benchmark").
- **A domain's toolbox page maps each unknown to its tool**, and a tool that ships updates its row in the same commit, so the next session reads the map instead of rediscovering it.

## Reference pages

- `references/passes.md` — when starting a recreation, choosing the next work, deciding whether a result is done, or when a later step wants an earlier one's values moved: the passes, their gates, freezing and acceptance.
- `references/gain-first.md` — when choosing what to work on next, or before spending a round on a detail: each term's ceiling and the order it sets.
- `references/toolbox-audit.md` — when starting a recreation of a new kind, or when a loop has stalled: listing the unknowns, auditing the tools against them, and naming the gap.
- `references/solve-not-search.md` — when choosing how an unknown is answered, or when a search is about to be run: the ladder from exact data to refinement, and why a search at the top is never the tool.
