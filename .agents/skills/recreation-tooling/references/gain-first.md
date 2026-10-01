# Gain first

Read when choosing what to work on next in a recreation, or before spending a pass on a detail: how each term is priced by the likeness it could recover, and why the largest goes first.

## The ceiling

A term's **ceiling** is how much the score would recover if that term were exact, everything else held as it is. Where the score is a mean over pixels (FLIP is), the ceiling of a layer is its share of the frame times its own error, and the layers' ceilings add up to the frame's score, so the split is exact rather than estimated. Inside a layer, the same split is taken over whatever separates its unknowns (depth bands for haze against light, a mask for clouds against the sky's gradient), and the witness's rows (`attribute`) split a layer's ceiling into what its stand-in costs and what the shared terms cost.

## The order

1. **Price every term before touching any.** The ranking is measured each pass, never remembered: what was largest moves once anything near it is fixed.
2. **Work the term with the largest ceiling over its cost**, as an algorithm's dominant term decides its cost and the lower-order terms are dropped until it shrinks. A term an order of magnitude below the largest waits, however cheap it looks.
3. **Within the largest term, the gap nearest the root goes first** (`references/toolbox-audit.md`), since a later solve absorbs an earlier one's error and a ceiling measured over a wrong root is wrong too.
4. **Re-price after each change.** A dominant term moving (the light, the haze) re-prices every term under it, which is why the small ones wait: a detail tuned under the old light is tuned again under the new one.

## Why

A small term polished first is paid twice. The Genshin login spent passes on the walkway's paving and the door's relief, a twentieth of the frame between them, while the sky and the towers' light held nine tenths of what was left; each moved its score by under a thousandth, and both were priced again the moment the haze changed.

## In each domain

The domain's toolbox page names the command that prints the ceilings (Genshin's is the `genshin-parity` skill's `references/toolbox.md`).
