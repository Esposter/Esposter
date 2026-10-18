# Character

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {character-attributes} needs parity-page — **Character: the Attributes tab over its whole frame.** `pnpm -C scripts genshin:parity compare character-attributes`, then `pnpm -C scripts genshin:parity approve character-attributes`. Reads `~/Esposter/genshin-parity/references/character-attributes.png` (from `captures/session-2.mp4` at 155 seconds, the interface settled), and the screen's page. Writes the screen's image beside its component once approved, and its row of `ParityReferenceMap.snapshot.md`. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: the screen's build misses, FLIP 0.0950 (from 0.3535), the worst bands are the top band at 0.3601 and the panel at 0.1793. The panel's rows, the element emblem and "Geo" prefix, and the bottom-left Training Guide and Ascension Limit buttons do not match the frame yet. Covers `CharacterMenu`, which `Character/Screen` renders around every tab.

- [ ] `[page]` {character-menu-buttons-interface} needs genshin-world-fixture, parity-page — **Character menu: its buttons.** `CharacterMenuButtons` is already mounted by `CharacterMenuArtifacts` and `CharacterMenuWeapons`, which `Character/Screen` renders on its tabs, so its fixture needs those tabs set and a reference: a wiki still of the buttons, none chosen yet. Then `pnpm -C scripts genshin:parity compare` and `approve` on that screen's name. — blocked: no reference names its buttons.
