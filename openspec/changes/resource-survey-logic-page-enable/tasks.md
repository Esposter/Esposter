## 1. The page's condition

- [ ] 1.1 Add the enable condition to the page's props beside its visibility condition, and check it on save as a panel's is. Verify: a case in checkSurveyDocument.test.ts that a page whose enable condition does not parse is refused at that page's enable condition, written first and seen failing.
- [ ] 1.2 Offer a selected page the Enabled if section in the Logic tab, written and checked as an element's is. Verify: tests named after the scenarios 'Owner sets an enable condition on a page' and 'A page's enable condition that does not parse shows its error and saves nothing' in LogicBuilder.test.ts, written first and seen failing.

## 2. The runner

- [ ] 2.1 Pass the page's enabled state to its element views in place of a constant true, so its questions are drawn disabled while its condition does not hold. Verify: tests named after the scenarios 'A page disabled by its condition draws its questions disabled' and 'Answering yes enables the second page's questions' in getSurveyPageViews.test.ts, written first and seen failing.
- [ ] 2.2 Keep a disabled page's questions out of the move and the submit check. Verify: tests named after the scenarios 'A required question on a disabled page does not block the move' in goToNextSurveyPage.test.ts and 'A submit leaves a disabled page's required question empty' in validateSurveyAnswers.test.ts, written first and seen failing before task 2.1.

## 3. The record

- [ ] 3.1 Rewrite the survey document, runner and logic builder designs as built when the change is archived, adding the page's enable condition to the page's props. Verify: `pnpm exec openspec validate resource-survey-logic-page-enable --strict --no-interactive` passes, and `pnpm -C scripts exec vitest run src/services/openspec` passes.
