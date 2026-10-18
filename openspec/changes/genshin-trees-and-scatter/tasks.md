## 1. Stand-ins and batches

- [ ] 1.1 Draw each placed plant's stand-in at its recorded place, turn and scale, one batch per prefab. Verify: a test named after the scenario 'A placed tree stands where the game places it', rendered in the layout pass.
- [ ] 1.2 Cull plants out of view or past distance on the graphics card. Verify: a test named after the scenario 'Grass out of view is not drawn'.
- [ ] 1.3 Bend grass away from the character as it passes. Verify: a test named after the scenario 'Grass bends where the character walks'.
- [ ] 1.4 Write the trail texture around the viewer from the character controller, and bend only the grass it records. Verify: tests named after the scenarios 'Grass beyond the trail stands upright' and 'The trail follows the character', seen failing first. The trail's size, resolution and fade stay provisional, as the design records.

## 2. Species

- [ ] 2.1 Show each tree's mesh near and its impostor far. Verify: a test named after the scenario 'A far tree shows its impostor'.
- [ ] 2.2 Fit each placed plant's species to its game export, costliest first, with the oak last. Verify: a test named after the scenario 'A fitted species matches its game export'. The oak's step waits on the roadmap's `windrise-oak-shape` row.
