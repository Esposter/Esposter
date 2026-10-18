# Character Trials

## 1. Trial party

- [x] 1.1 Pick a trial's template as the highest one at or below its level. Verify: findTrialTemplate.test.ts, 'a trial takes its talent level and artifacts from the highest template at or below its level' and 'a trial below every template has none'.
- [x] 1.2 Build a trial's party member at its level with its template's talent level and artifacts, and the weapon its wiki build holds at level ninety; a character with no cited build has no party member. Verify: tests named after 'A trial party member is at the trial's level with its artifacts' in `createTrialCharacter.test.ts`.

## 2. Banners

- [x] 2.1 Match a banner's featured five-star to the trial of its character. Verify: findBannerTrial.test.ts, 'a banner offers the trial of its featured character' and 'a banner with no trial offers none'.
- [ ] 2.2 Show the trial button on a matched banner, and open the trial's domain from it. Verify: the Wish screen's browser test, run by the main session.

## 3. Fight and reward

- [x] 3.1 Give a trial's first-clear reward once and record the claim. The claim is `claimTrialStageReward`, paying through the shared reward claim, and `useWorldTrials` calls it when the trial's arena clock runs out, which is a PROVISIONAL clear rule for an arena with no enemies (see design). The enemies' fight is open with 3.2. Verify: tests named after 'A trial's first clear gives its reward once' and 'A trial's later clear gives no reward'.
- [ ] 3.2 Stand a trial's enemies in the domain arena. Blocked: the dungeon rows carry no monsters, and the wiki's Trial Challenge wave lists join to 11 of the 80 cited builds by page, so the waves are not carried yet.

## 4. Weapon and constellation

- [x] 4.1 Give a trial its weapon from the wiki's Character Trial builds, cited to their page. The trial rows carry no weapon id, and the bare-value search finds none, so the table is the source; the join is by character name at level 90, provisional. Verify: buildTrials.test.ts, 'a trial stage pays its first-clear reward, and its character is kept at its level'.
- [x] 4.2 Give a trial its constellation. Every level-90 wiki block reads 0 and an absent field is C0, so the trial's constellation is C0. Verify: the cited table's constellation field, in buildTrials.test.ts.
