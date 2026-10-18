# Character Trials

## 1. Trial party

- [ ] 1.1 Take a trial's talent level and artifacts from the highest template at or below its level. Verify: tests named after 'A trial takes its talent level and artifacts from the highest template at or below its level'.
- [ ] 1.2 Build a trial's party member at its level with its talent level and artifacts, and no weapon until the trial weapon is mapped. Verify: tests named after 'A trial party member is at the trial's level with its artifacts'.

## 2. Banners

- [ ] 2.1 Match a banner's featured five-star to the trial of its character. Verify: tests named after 'A banner offers the trial of its featured character' and 'A banner with no trial offers no trial button'.
- [ ] 2.2 Show the trial button on a matched banner, and open the trial's domain from it. Verify: the Wish screen's browser test, run by the main session.

## 3. Fight and reward

- [ ] 3.1 Give a trial's first-clear reward once and record the claim. Verify: tests named after 'A trial's first clear gives its reward once' and 'A trial's later clear gives no reward'.
- [ ] 3.2 Stand a trial's enemies in the domain arena. Blocked: the dungeon's monsters are not read yet.

## 4. Blocked

- [ ] 4.1 Give a trial its weapon. Blocked: the trial rows carry no weapon id, and `TrialTpsWeapon` holds item ids.
- [ ] 4.2 Give a trial its constellations. Blocked: not in the trial rows.
