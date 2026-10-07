# Gain first

Read when choosing what to work on next inside a pass of a recreation, or before spending a round on a detail: how each term is priced by the likeness it could recover, and why the largest goes first. Across passes the order is the dependency order (`references/passes.md`).

## The ceiling

A term's **ceiling** is how much the score would recover if that term were exact, everything else held as it is. Where the score is a mean over pixels (FLIP is), the ceiling of a layer is its share of the frame times its own error, and the layers' ceilings add up to the frame's score, so the split is exact rather than estimated. Inside a layer, the same split is taken over whatever separates its unknowns (depth bands for haze against light, a mask for clouds against the sky's gradient), and a ranking against the source's own parts drawn in place of ours (Genshin's `rank`) splits a layer's ceiling into what its stand-in costs and what the shared terms cost.

## Random content has no ceiling

A term made of content the source places at random (clouds a particle emitter scatters, foliage, crowds) cannot be recovered by a score that compares pixels, however large its ceiling: ours stands in other places than the reference's, and a perceptual score prices every misplaced edge, so more of it scores worse even where the reference holds more of it than ours. Its colours are solved by matching the two populations' spreads, and its amount and placement are judged by their statistics (cover by height, size), never by the frame's score; the ranking discounts it to its colour's share.

## A pass's measure is read at the reference's camera

A part of ours measured against the source's own part drawn beside it (its outline, depth, normal or unlit colour) is exact about how far the part stands from its source, and it is the pass's own measure (`references/passes.md`). It is read where the reference sees the part, from that camera and at that distance, and gated at the reference's own noise, so a gap no frame could show passes the gate and is never polished. A measure against anything that is not the source prices nothing: one instrument's recording standing in for the game's music, a library's material standing in for the export's, can improve round after round while the source stands as far away.

## The order

1. **Price every term of the pass before touching any.** The ranking is measured each round, never remembered: what was largest moves once anything near it is fixed.
2. **Work the term with the largest ceiling over its cost**, as an algorithm's dominant term decides its cost and the lower-order terms are dropped until it shrinks. A term an order of magnitude below the largest waits, however cheap it looks.
3. **No term of a later pass is worked while an earlier pass's gate is red**, however large its ceiling, and within the largest term the gap nearest the root goes first (`references/toolbox-audit.md`), since a later solve absorbs an earlier one's error and a ceiling measured over a wrong root is wrong too.
4. **Re-price after each change.** A dominant term moving (the light, the haze) re-prices every term under it, which is why the small ones wait: a detail tuned under the old light is tuned again under the new one.

## Why

A small term polished first is paid twice: it moves the score by almost nothing while the dominant terms stand, and it is priced again the moment one of them changes.

## In each domain

The domain's toolbox page names the command that prints the ceilings (Genshin's is the `genshin-parity` skill's `references/toolbox.md`).
