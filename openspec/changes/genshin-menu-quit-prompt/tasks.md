## 1. Reference

- [x] 1.1 Clip the English PC client's logout recording and name its exit prompt's first whole still as the exit prompt reference, with its screenshot's source. Verify: `pnpm -C scripts recreation clip --directory {data-root}/genshin-parity/captures https://www.youtube.com/watch?v=asw7VW5QM1g --from 0 --to 46 --name logout` writes the clip, and the `exit-prompt` row of the parity reference map names its screenshot as its source. The row now names the 2026 recording `yt-kIDee7nyD0w` at 26.75 seconds, since the HowTo Zone clip above does not show the prompt; see design.md.

## 2. Scale

- [x] 2.1 Scale the exit prompt and its panel to the 2026 recording's frame. Verify: a test named after the scenario 'The prompt opens over the menu at the game's scale' in `Menu/Exit/Index.browser.test.ts`, written first and seen failing. The browser suite passes its three tests on the Mac's Chromium (`pnpm exec vitest run --config vitest.browser.config.ts src/components/Menu/Exit/Index.browser.test.ts`), with the Paimon menu's suite at 14 of 14.
- [x] 2.2 Draw the two choices, Cancel and Confirm, at the new scale and keep their outcomes. Verify: tests named after the scenarios 'Cancel returns to the menu' and 'Confirm leaves for the app's home' in `Menu/Exit/Index.browser.test.ts`, written first and seen failing. Passing in the same run as 2.1.

## 3. Re-measure

- [ ] 3.1 Re-measure the prompt when the longer clip lands, without gating the build. Verify: the re-measure of the menu-quit-prompt clip writes a row for the exit prompt, queued for the user's eyes, and no build step waits on it. Blocked: the longer clip `menu-quit-prompt.mkv` is not in the captures folder yet, so there is no recording to re-measure.

## 4. Shared dialog rules

- [ ] 4.1 Decide whether `Menu/Exit/Index.vue` takes the dialog's structural rules (`--reference-pixel`, the absolute backdrop, the centred dialog) from `styles/menuDialog.css` rather than re-declaring them, keeping its own values for the 66% backdrop, the 910 by 576 panel and its colour. Verify: the decision is written into design.md's Known gaps, and if the sheet is imported, `genshin:parity compare` over `exit-prompt`, `menu-exit-hover` and `menu-exit-pressed` reads no worse than before the change, with the `.choice` pill rules the sheet brings kept out of Exit. Not started: the import would bring the World Level dialog's pill look into Exit, and that needs a visual parity check before the duplicate declarations go.
