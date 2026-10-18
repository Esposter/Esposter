## 1. Rows

- [ ] 1.1 Find every label of the Settings screen and write each into the game text under its text id. Verify: `pnpm -C scripts genshin:text find "<regex>"` lists each label's text id, and each id is written with `genshin:text write`.
- [ ] 1.2 Open Settings from the Paimon menu's side bar in the world. Verify: a test named after the scenario 'Settings opens from the side bar', written first and seen failing.
- [x] 1.3 Make the Graphics Quality row choose a renderer tier and keep it on this device. Verify: tests named after the scenarios 'A chosen quality tier is kept on this device' and 'Another browser starts from the default tier', written first and seen failing.
- [x] 1.4 Make Volume, Music Volume and SFX Volume set levels over the music's player and the sound effects. Verify: tests named after the scenarios 'Music Volume sets the music level' and 'A volume beyond the row's range stops at its limit'.
- [ ] 1.5 Make Game Language offer the fifteen languages and switch the screen's labels. Verify: tests named after the scenarios 'The language list holds fifteen languages' and 'Choosing a language changes the screen's labels'.
- [ ] 1.6 Draw the rows the world does not back as disabled, with the recording's value. Verify: a test named after the scenario 'A row the world does not back is drawn disabled'.

## 2. Reference

- [ ] 2.1 Compare the Settings screen's fixture with its reference over the whole frame. Verify: the parity comparison writes the Settings row, queued for the user's eyes.
