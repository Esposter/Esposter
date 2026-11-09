## 1. The picture

- [ ] 1.1 Add the background picture to the root props beside the logo, keep it out of the root form as the logo is, and count it among the files the survey references. Verify: a case in collectSurveyFileUrls.test.ts that a document's background picture is among its referenced files, written first and seen failing.
- [ ] 1.2 Add the upload and remove controls for the background picture on the Theme tab, as the logo's are. Verify: tests named after the scenarios 'Owner uploads a background picture on the Theme tab' and 'Owner removes the background picture' in Theme.test.ts, written first and seen failing.
- [ ] 1.3 Refuse a picture that fails validation before the upload, with its alert and no change to the survey. Verify: a test named after the scenario 'A rejected background picture leaves the survey unchanged' in Theme.test.ts, written first and seen failing.

## 2. Drawing

- [ ] 2.1 Draw the picture behind the respondent page's content, over the background colour. Verify: tests named after the scenarios 'A background picture is drawn behind the respondent page's questions' and 'A survey without a background picture draws its colour alone' in Runner.test.ts, written first and seen failing.
- [ ] 2.2 Draw the same picture in the Theme tab's preview. Verify: a test named after the scenario 'The Theme tab preview draws the picture as the respondent page does' in Theme.test.ts, written first and seen failing.

## 3. The record

- [ ] 3.1 Rewrite the survey theme-files design as built when the change is archived, with the background picture in its subset and its Decisions entry for the resolved conflict, and the survey document design's root props. Verify: `pnpm exec openspec validate resource-survey-theme-background --strict --no-interactive` passes, and `pnpm -C scripts exec vitest run src/services/openspec` passes.
