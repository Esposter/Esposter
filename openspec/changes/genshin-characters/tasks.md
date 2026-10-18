## 1. Traveler's clips

- [ ] 1.1 Register the Traveler's four locomotion clips and record each clip's seconds and the bone paths its curves move. Verify: `pnpm -C scripts genshin:assets clips traveler` prints the four clips with their seconds and bone paths, with the game closed.

## 2. Motion

- [ ] 2.1 Decide the form of the fitted parameters: options are each bone's track fitted over a loop of a few samples, or a few gait parameters per state from which a pose is computed; decides nothing here. Verify: the choice is written into the design before the motion pass fits anything.
- [ ] 2.2 Fit the Traveler's standing, walk, run and sprint motion to the game's clips. Verify: the motion pass's measure passes for each of the Traveler's four clips, reported by the fit's own run.

## 3. Scale

- [ ] 3.1 Measure the Traveler's height from the game's own model and replace the reckoned unit with it. Verify: a test named after the scenario 'the Traveler's height matches the game's model', seen failing first.

## 4. Terms

- [x] 4.1 Show the terms view beside the character the Character screen shows, in the loader at its foot, in place of its button and dialog. Verify: a test named after the scenario 'a chosen character's terms show beside it', seen failing first.
