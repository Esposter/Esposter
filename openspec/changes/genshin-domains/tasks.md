## 1. Entrances

- [x] 1.1 Add the domain entrance landmarks from the scene points, each with the kind its entry type names, and no landmark for a normal entry. Verify: toDomainEntrance.test.ts written first and seen failing, its tests named after the entrance's kind, place and missing point.
- [x] 1.2 Draw each entrance with a stand-in kit and open the domain screen from F over the built opening rules. Verify: tests named after the scenarios 'A level above the player's Adventure Rank is refused' and 'A level at or below the player's Adventure Rank is open' were written first and seen failing.
- [x] 1.3 Make an unlocked domain entrance reachable by a jump: `JUMP_LANDMARK_KINDS` names the domain entrance kind beside the statue and waypoint kinds. Verify: tests named after the scenarios 'An unlocked entrance joins the jumps' and 'A locked entrance is not a jump target' written first and seen failing.
- [ ] 1.4 Keep a tree out of the jumps: the jump list holds only the statue, waypoint and domain entrance kinds, so a tree is never a jump. Verify: a test named after the scenario 'Tree in a region', proven failing with a tree kind added to `JUMP_LANDMARK_KINDS` (the `testing` skill's regression proof).

## 2. Levels and days

- [x] 2.1 Read each domain's days and its levels by rank from the fetched tables. Verify: a test named after the scenario 'A domain closed today is refused' written first and seen failing.

## 3. Entering and the challenge

- [x] 3.1 Enter a domain's scene and leave it on the jump's fade. Verify: tests named after the scenarios 'Entering a domain fades into its scene' and 'Leaving a domain fades back to its entrance' written first and seen failing.
- [ ] 3.2 Run the challenge's waves against the time limit, with each ley line disorder as its own module, once the domain's scene export is in. Verify: tests named after the scenarios 'Clearing a domain raises its Petrified Tree', 'Running out of time returns the player to the entrance', 'Every member down returns the player to the entrance' and 'A ley line disorder changes the fight' written first and seen failing.
- [x] 3.3 Claim the Petrified Tree with Original Resin. Verify: tests named after the scenarios 'Claiming the tree spends resin and gives its rewards' and 'Claiming the tree with too little resin is refused' written first and seen failing.
- [x] 3.4 Give a one-time domain its reward on the first clear only. Verify: a test named after the scenario 'A repeat clear of a one-time domain gives nothing' written first and seen failing.

## 4. Specs

- [ ] 4.1 Archive this change's map delta, which replaces the map spec's 'Only statues and waypoints are jump landmarks' with the domain entrances added. Verify: `openspec/specs/genshin/map/spec.md` names Domain Entrances in its jump-landmark requirement once the change is archived.
