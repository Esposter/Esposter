# Dialogue

## Queue

Nothing here.

## Waiting

## Open

- [ ] **Dialogue: the five states scored over their backdrop** — contradicted by `openspec/specs/genshin/dialogue/design.md` line 105 and `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md` line 29: `dialogue-choices-replies` reads 13.39% in both, where this item gives 14.22% and 13.45%. All five figures sit in both places, and the compare's bar is 1 (`scripts/src/services/genshinParity/reference/constants.ts` line 19).
- [ ] **Dialogue: the reply pill's rest tone and size, measured against `dialogue-choices-replies`** — a darker rest (0.5) raised the score to 16.11% and taller pills with a smaller gap to 13.49%, so neither stands; the lighter direction (the 0.22 the sweep scored best, against 0.26 in `GAME_REPLY_REST`), the line's width (ours about 205 pixels, the reference's about 215) and the pill's right edge are untested, and the reply kind is shared with the Wish and Talents screens, so a change to it is a shared one.
