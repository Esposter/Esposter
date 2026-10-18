## 1. Bloom

- [ ] 1.1 Draw the display bloom in the engine's post pipeline with the game's threshold, scaler, intensity and four-level weights, and turn it on for the login scene. Verify: a test named after the scenario 'Bright stone in the login scene glows', written first and seen failing, and `pnpm -C scripts genshin:parity passes login --pass Display` still holds its contrast gate.
- [ ] 1.2 Add the bloom reading over the brightest pixels of each reference. Verify: a test named after the scenario 'Bloom closes where it brings the brightest pixels closer'.
- [ ] 1.3 Re-read the bloom's field when the drawn bloom reads no closer than none. Verify: a test named after the scenario 'A bloom that reads no closer reopens its field'.

## 2. Clouds

- [ ] 2.1 Solve the cloud layer's settings on its statistics over the game's own textures, drawn over textures of our own. Verify: tests named after the scenarios 'Each hour's cloud layer matches its reference' and 'An hour whose clouds miss their gate is not accepted', and `pnpm -C scripts genshin:parity passes login` reports the atmosphere gate for each hour.

## 3. Order and freezing

- [ ] 3.1 Hold the pass order and each frozen result by tests. Verify: tests named after the scenarios 'A pass waits for the gates of the passes before it', 'A pass within its gate on every reference is frozen' and 'A later pass cannot move a frozen result'.
- [x] 3.2 Judge scattered content by its statistics, and refuse a cloud layer that wins only on pixels. Verify: tests named after the scenarios 'Scattered clouds are scored by their statistics' and 'A cloud layer that wins only on pixels is not accepted'.
- [ ] 3.3 Reopen the pass whose measure missed a frame that stands off. Verify: a test named after the scenario 'A frame that stands off reopens the missed pass'.
