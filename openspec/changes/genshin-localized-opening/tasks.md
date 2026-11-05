## 1. Recordings

- [ ] 1.1 Find the Japanese and Korean PC launch recordings, `japanese-launch.mkv` and `korean-launch.mkv`, in published material: `pnpm -C scripts recreation search <query>` lists the public videos, and `pnpm -C scripts genshin:parity recordings clip` fetches a section of one into `captures` with its manifest row, each from the client's first frame, 30 seconds at most. Save each as the file the clip prints, tick its source and that file on its References sought item in the roadmap, then read the Japanese and Korean splashes, notices and doors from it. A search the roadmap already records as none found is not run again, and a launch no published clip shows ships provisional, its item left open. Verify: each still is cut from its recording to its scratch path with the seek before the input and the colour filter `cutRecordingFrame` applies (`scripts/src/services/genshinParity/reference/cutRecordingFrame.ts`), since no command writes a cut and the still-cutting form is the ffmpeg line `.agents/skills/genshin-parity/references/toolbox.md` gives for a labelled screenshot; it is packed by `pnpm -C scripts genshin:parity references pack`, named in `ParityReferenceMap` (`scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`) by its `source` in place of any `pending` its entry holds, and `pnpm -C scripts genshin:parity verify` passes each one against its recording.

## 2. Measuring the differences

- [ ] 2.1 Measure the publisher's logo, its place and the text's sizes and wraps for each client against the English reference. Verify: a test named after the scenario "A client with a different publisher shows its own logo", written first and seen failing.

## 3. Layouts keyed by language

- [ ] 3.1 Key a screen's layout by language only where its recording differs, and use the English layout everywhere else. Verify: tests named after the scenarios "A language without a differing recording uses the English layout" and "A language whose recording differs uses its own layout", written first and seen failing.
- [ ] 3.2 Add a visual suite image only for each language whose screen differs. Verify: tests named after the scenario "The visual suite gains an image for a differing language" and "The visual suite gains no image for a language that matches English", written first and seen failing.

## 4. Localized references

- [ ] 4.1 Compare each localized reference in its client's words, starting with the mainland health notice. Verify: a test named after the scenario "The mainland health notice is compared in its own words", written first and seen failing.
