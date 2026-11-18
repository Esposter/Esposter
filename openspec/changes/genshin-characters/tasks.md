## 1. Traveler's clips

- [x] 1.1 Register the Traveler's four locomotion clips and record each clip's seconds and the bone paths its curves move. Verify: `pnpm -C scripts genshin:assets clips traveler` prints the four clips with their seconds and bone paths, with the game closed.

## 2. Motion

- [x] 2.1 Fix the form of the fitted parameters as each bone's track sampled over a short loop, the form the design's decisions name. Verify: the choice is written into the design before the motion pass fits anything.
- [ ] 2.2 Fit the Traveler's standing, walk, run and sprint motion to the game's clips. Verify: the motion pass's measure passes for each of the Traveler's four clips, reported by the fit's own run.
  - Waits on the clips' curves decoded: each clip is ACL-compressed, and this Mac's AnimeStudio does not run the database decode (`DBACL` throws, only the MHY library builds). The queue's Waiting list names it in `openspec/specs/genshin/compute/character/design.md`.
- [ ] 2.3 Play the walk cycle while the Traveler walks and the standing motion while it is still, the body's state picking the clip, once 2.2 fits them. Verify: tests named after the scenarios 'the Traveler's walk cycle plays while it walks' and 'the Traveler's standing motion plays while it is still', written first and seen failing.
  - The state-to-clip selection is built (`selectTravelerLocomotionClip`, its two scenario tests seen failing, then passing). Playing the clip waits on 2.2's fitted values, which change only what the Model poses with, not which clip a state picks.

## 3. Scale

- [x] 3.1 Measure the Traveler's height from the game's own model and replace the reckoned unit with it. Verify: a test named after the scenario 'the Traveler's model stands at its game model's height', seen failing first.

## 4. Terms

- [x] 4.1 Show the terms view beside the character the Character screen shows, in the loader at its foot, in place of its button and dialog. Verify: a test named after the scenario 'a chosen character's terms show beside it', seen failing first.
