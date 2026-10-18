## 1. Reference

- [x] 1.1 Clip the English PC client's logout recording and name its exit prompt's first whole still as the exit prompt reference, with its capture and second. Verify: `pnpm -C scripts recreation clip --directory ~/Esposter/genshin-parity/captures https://www.youtube.com/watch?v=asw7VW5QM1g --from 0 --to 46 --name logout` writes the clip, and the `exit-prompt` row of the parity reference map names a capture and a second. The row now names the 2026 recording `yt-jHr2bERjkYc` at 30 seconds, since the HowTo Zone clip above does not show the prompt; see design.md.

## 2. Scale

- [ ] 2.1 Scale the exit prompt and its panel to the 2026 recording's frame. Verify: a test named after the scenario 'The prompt opens over the menu at the game's scale' in `Menu/Exit/Index.browser.test.ts`, written first and seen failing. The test is written and unrun in this worktree, since the browser suite cannot run here; the post-merge run is its check.
- [ ] 2.2 Draw the two choices, Cancel and Confirm, at the new scale and keep their outcomes. Verify: tests named after the scenarios 'Cancel returns to the menu' and 'Confirm leaves for the app's home' in `Menu/Exit/Index.browser.test.ts`, written first and seen failing. Unrun in this worktree, as 2.1.

## 3. Re-measure

- [ ] 3.1 Re-measure the prompt when the longer clip lands, without gating the build. Verify: the re-measure of the menu-quit-prompt clip writes a row for the exit prompt, queued for the user's eyes, and no build step waits on it.
