## 1. Reference

- [x] 1.1 Clip the English PC client's logout recording and name its exit prompt's first whole still as the exit prompt reference, with its capture and second. Verify: `pnpm -C scripts recreation clip --directory ~/Esposter/genshin-parity/captures https://www.youtube.com/watch?v=asw7VW5QM1g --from 0 --to 46 --name logout` writes the clip, and the `exit-prompt` row of the parity reference map names a capture and a second.

## 2. Scale

- [ ] 2.1 Scale the exit prompt and its buttons to the reference's frame. Verify: a test named after the scenario 'The prompt opens over the menu at the game's scale', written first and seen failing.
- [ ] 2.2 Keep the three choices working at the new scale. Verify: tests named after the scenarios 'Continue Game returns to the world' and 'Exit to Login Interface or Exit to Desktop leaves for the app's home' pass.

## 3. Re-measure

- [ ] 3.1 Re-measure the prompt when the longer clip lands, without gating the build. Verify: the re-measure of the menu-quit-prompt clip writes a row for the exit prompt, queued for the user's eyes, and no build step waits on it.
