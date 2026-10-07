# Passes

Read when starting a recreation, choosing what to work on next, deciding whether a result is done, or when a later step seems to want an earlier one's values moved: the passes a recreation runs in, what gates each and what freezes it.

## The model

A recreation is rebuilt in **passes**, one kind of unknown each, in dependency order: inventory, layout, camera, shape, motion, surface, display (the transform from scene colour to the screen), light, atmosphere and audio. The interface of a screen is a pass of its own beside them. Each pass:

1. **Answers its unknowns from the most exact source that holds them** (`references/solve-not-search.md`), never from a later pass's data.
2. **Is judged by its own measure**, in the units the reference shows, at the reference's camera and moment: for example a placement against the source's transforms, a shape or a surface against the source's own parts drawn beside it, a sound against the source's own sound. A measure no other pass moves is the point: an error in it can only be this pass's.
3. **Is gated at the reference's own noise**, never at zero: a recording's softness and compression, an export's texels, a clip's sampling set how close the measure can read, and work past that polishes what nothing shows.
4. **Is frozen once its gate holds**, by a test over what it produced (an arrangement's cross-ratios, a fit's placements, a clip's timings), so no later pass moves it to better its own numbers.

The source's own data (its parts drawn through our renderer, its clips, its sound banks) judges every pass it holds; a recording's colour judges only what exists at run time, the transform to the screen, the light, the air and the sounds as they play, and each of those over a region no other unknown changes. The camera a recording was shot from, and motion no clip holds, exist only in the recording, so they are read off it by geometry alone, the frozen layout's landmarks found in its pixels.

## Gates and reopening

- **The first red gate is the next work.** A pass begun over a red pass before it absorbs that error into its own answer, so a later term waits however large it looks.
- **A later pass that finds an earlier one wrong reopens it, never compensates for it.** A light that would have to go below none to match, a haze that has to hide a part, a camera that has to move to land a misplaced tower: each names the earlier pass to reopen.
- **Inside a pass, ceilings order the items** (`references/gain-first.md`); across passes, the order is the dependency order.

## Acceptance

Once every gate holds, the frame is scored against its reference (Genshin's `compare` and its perceptual score) and checked by eye. That is acceptance, never the loop: a frame still off means some pass's measure is blind to what it shows, so that measure is fixed and its pass rerun, and the next recreation is not caught the same way.

## Why

One frame's score mixes every unknown's error, and each change moves every term under it, so n unknowns cost on the order of n² rounds and two of them can trade error without end. A measure only one pass moves, and a test that holds what it settled, cost each unknown one solve, n in all.

## In each domain

The domain's toolbox page lists its passes, each with its source, its measure and its gate, and the runner that checks them in order, or names that runner as a gap until it is built (Genshin's is the `genshin-parity` skill's `references/toolbox.md`, where `genshin:parity passes` is still a gap).
