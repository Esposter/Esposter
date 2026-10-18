## 1. The reference

- [ ] 1.1 Replace the held menu reference with `menu-paimon-current.png`, the menu on the current build at 1080 high with no screen open, and read the open and close timings from `menu-paimon.mkv` once its clip lands. Verify: the menu's visual suite compares against the current-build reference, and the open and close timings are read from frames of the clip with the frames command.

## 2. Paimon beside the menu

- [ ] 2.1 Draw Paimon to the right of the menu with her idle animations once her official model pack is held, and leave her out otherwise. Verify: tests named after the scenarios "Paimon appears beside the menu once an official model is held" and "The menu opens without Paimon when no official model is held", written first and seen failing.

## 3. The profile card and the menu's entries

- [x] 3.1 Draw the profile card's account name and avatar, or the name Traveler when signed out. Verify: tests named after the scenarios "A signed-in reader sees the account's name and avatar" and "A signed-out reader sees the default name", written first and seen failing.
- [x] 3.2 Add each profile field as its system lands, starting with Adventure Rank and World Level. Verify: a test named after the scenario "A profile field appears once its system is built", written first and seen failing, and a test named after "A profile field stays out until its system is built".
- [x] 3.3 Draw Community and Feedback disabled, leave Training Guide out of the contents, and open the Time, Settings and quit screens from the side bar. Verify: tests named after the scenarios "Community and Feedback show as disabled entries", "Training Guide is absent from the contents", "Choosing Time opens the Time screen" and "Choosing Quit Game opens the quit prompt", written first and seen failing.
- [ ] 3.4 Draw Version Highlights and Survey disabled as the other links are, from the 2026 frame's tiles. Verify: a test named after the scenario "Version Highlights and Survey show as disabled entries" in `Index.browser.test.ts`. Not yet written: that file is left as written for the post-merge run.
