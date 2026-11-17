## 1. The tag box minimum

- [x] 1.1 Add the minimum selection to the tag box's props, and refuse on save a tag box whose minimum is above its maximum. Verify: a test named after the scenario 'A tag box whose minimum is above its maximum is refused on save' written first and seen failing.
- [x] 1.2 Bound a tag box's answer by its minimum and its maximum, so a move below the minimum is refused. Verify: a test named after the scenario 'A tag box below its minimum blocks the move' written first and seen failing, and a test named after 'A selection within its bounds moves on' that pins existing behaviour, written first and seen passing, since a within-bounds answer is accepted before the minimum exists.

## 2. The rating scale

- [x] 2.1 Add the scale's first step to the rating's props as zero or one, required with no schema default, and bound a rating answer from that step to the last. Verify: a test named after the scenario 'A scale that starts at zero accepts zero' written first and seen failing.
- [x] 2.2 Draw the scale from its first step in the rating field and the step scale, reading nothing chosen as the step below the first, and keep the matrix's rating cells one-based. Verify: a Rating.test.ts case for a scale starting at zero with nothing chosen fills no step, written first and seen failing, and a case that the matrix's rating cells still count from one.
- [x] 2.3 Draw the summary's rating bars from the scale's first step. Verify: a test named after the scenario 'A rating that starts at zero counts its zero answers' written first and seen failing, and a test named after 'A rating that starts at one is counted as before' that pins existing behaviour, written first and seen passing, since the summary already labels a rating's steps from one.
- [x] 2.4 Offer the scale's first step in the Creator's form as a select of zero and one. Verify: a Properties.test.ts case that the rating form offers zero and one, written first and seen failing.

## 3. The record

- [x] 3.1 Rewrite the survey document, runner and response summary designs as built when the change is archived, with the rating and tag box rows included. Verify: `pnpm exec openspec validate resource-survey-answer-bounds --strict --no-interactive` passes, and `pnpm -C scripts exec vitest run src/services/openspec` passes.
