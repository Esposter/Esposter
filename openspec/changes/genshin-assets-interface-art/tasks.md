## 1. The recipe's missing commands

- [ ] 1.1 [phase 0] Export a named icon or texture from the install by its exact name, reading each Sprite's rectangle inside its atlas, as one `genshin:assets` command beside `namecards`. Verify: a test over a fixture Sprite row expects its texture and its rectangle, written first and seen failing; then the command's dry run over the login block lists the names the login's exported sprite folder holds.
- [ ] 1.2 [phase 0] Make the trace command write its path, divided by its scale into the reference's own pixels, as an entry of the component's keyed map, one entry per layer. Verify: a test traces one fixture mark at scale 1 and at scale 3 and expects the two written boxes to agree within one reference pixel, written first and seen failing.
- [ ] 1.3 [phase 0] Split any icon's tones into layers by share, reusing the split the talent icons' trace already runs. Verify: `pnpm -C scripts genshin:assets skill-glyphs --dry-run` reports no change after the refactor, with the published keys the same as before.
- [ ] 1.4 [phase 0] Measure a picture's mean colour from its exported texture under its material's tint, reusing the tint reader the surface fit runs, and write it as a keyed colour record. Verify: a unit test over a fixture texture expects the tinted mean, written first and seen failing; then the new fit's dry run prints the same counts when it is run twice.

## 2. The login

- [ ] 2.1 [phase 1] Re-export the login's sprite atlas through task 1.1's command, so its folder is the command's output and no longer a hand copy. Verify: the command's dry run over the login block lists the same names the atlas folder holds, checked before and after the re-export.

## 3. The screens' gaps

- [ ] 3.1 [phase 2] Give the item tile an art place on its face, with the icon drawn under the count strip, and the rarity face alone where no icon is given. Verify: a fixture variant with an art shape is added to the `genshin-interface` visual suite, written first and seen failing, and the existing item tile variants keep their images.
- [ ] 3.2 [phase 2] Measure the two-star item tile's face from a still that shows a two-star tile, or take a provisional estimate marked as one if no still does, and write its stops into the rarity face map. Verify: the two-star variant of the item tile is shot, and the `genshin-interface` visual suite holds it to its image.
- [ ] 3.3 [phase 2] Trace the map's landmark pins, one per landmark class, from the overlay references, and draw them in place of the plain circle. Verify: `pnpm -C scripts genshin:parity trace` writes a check image for each class, read before its path is used; then `pnpm -C scripts genshin:parity compare map-overlay-galesong` writes its row once the map fixture draws its pins, which the map page's open list names.
- [ ] 3.4 [phase 2] Trace the attribute star from the attributes still, colour it by its element with a measured fill, and draw it in place of the white star. Verify: `pnpm -C scripts genshin:parity compare character-attributes` writes its row, and the trace's check image is read before its path is used.
- [ ] 3.5 [phase 6] Trace the achievement screen's laurel emblem, category badge, medal icon and stamp ring from its reference, and its corner ornaments from the frame, in place of the flat marks, and close each one's roadmap Asset line. Verify: a test named after the scenario 'A traced mark replaces its flat stand-in on the achievement screen', written first and seen failing, then `pnpm -C scripts genshin:parity compare achievement-screen` scores no worse than its row.
- [ ] 3.6 [phase 2] Trace the mail screen's nine marks and its list thumbnail frame from the screen's reference at scale 3, in place of the bare marks, and close each one's roadmap Asset line. Verify: a test named after the scenario 'A traced mail mark replaces its bare mark on the mail screen', written first and seen failing, then `pnpm -C scripts genshin:parity compare mail-screen` scores no worse than its row.

## 4. The roadmap

- [ ] 4.1 [phase 2] Add an `Asset:` line to the roadmap, under the item that holds its screen, for each picture or mark no line names yet: the duel board's frame ornament, icons and coins, the Forge's recipe item icons and its support portrait, the Gcg plate portraits, the quest's series-row picture, and the expedition's pin and book emblem. Verify: `pnpm -C scripts exec vitest run src/workspace/roadmapPhases.test.ts` passes, and each new line names its screen and its source in the roadmap's own format.
