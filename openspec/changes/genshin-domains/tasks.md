## 1. Entrances

- [x] 1.1 Add the domain entrance landmarks from the scene points, each with the kind its entry type names, and no landmark for a normal entry. Verify: toDomainEntrance.test.ts written first and seen failing, its tests named after the entrance's kind, place and missing point.
- [ ] 1.2 Draw each entrance with a stand-in kit and open the domain screen from F over the built opening rules. Verify: a test named after the scenario 'A level above the player's Adventure Rank is refused' written first and seen failing.
- [x] 1.3 Make an unlocked domain entrance reachable by a jump. `JUMP_LANDMARK_KINDS` holds only the statue kind, so no entrance is offered for a jump today. Verify: a test named after the scenario 'An unlocked entrance joins the jumps' written first and seen failing.

## 2. Levels and days

- [x] 2.1 Read each domain's days and its levels by rank from the fetched tables. Verify: a test named after the scenario 'A domain closed today is refused' written first and seen failing.

## 3. Entering and the challenge

- [ ] 3.1 Enter a domain's scene and leave it on the jump's fade. Verify: tests named after the scenarios 'Entering a domain fades into its scene' and 'Leaving a domain fades back to its entrance' written first and seen failing.
- [ ] 3.2 Run the challenge's waves against the time limit, with each ley line disorder as its own module, once the domain's scene export is in. Verify: tests named after the scenarios 'Clearing a domain raises its Petrified Tree', 'Running out of time returns the player to the entrance', 'Every member down returns the player to the entrance' and 'A ley line disorder changes the fight' written first and seen failing.
- [ ] 3.3 Claim the Petrified Tree with Original Resin. Verify: tests named after the scenarios 'Claiming the tree spends resin and gives its rewards' and 'Claiming the tree with too little resin is refused' written first and seen failing.
- [ ] 3.4 Give a one-time domain its reward on the first clear only. Verify: a test named after the scenario 'A repeat clear of a one-time domain gives nothing' written first and seen failing.
