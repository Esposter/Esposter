## 1. The bite

- [x] 1.1 Write the bite as a pure step: the nibble drawn from the fish's feeler range, the bite, the strike, and the lapse at the bite timeout. Verify: stepFishingBite.test.ts written first and seen failing, named after the scenarios 'A strike while nibbling scares the fish off', 'A bite left unstruck lapses' and 'A strike while biting starts the reel'.
- [ ] 1.2 Open fishing at a point only once the Serenitea Pot is owned and its quest is done. Verify: tests named after the scenarios 'Fishing stays closed before the Serenitea Pot is owned' and 'Fishing opens at a point once the Serenitea Pot is owned' written first and seen failing.

## 2. The reel

- [ ] 2.1 Move the reel's zone by the fish's own width, speed, offset and duration, and apply its skills to the tension and the health. Verify: a test named after the scenario 'The line breaks after too long out of the zone' written first and seen failing.
- [ ] 2.2 Put each fish caught into the bag with its reward and proficiency. Verify: a test named after the scenario 'A catch puts the fish in the bag' written first and seen failing.

## 3. Bait and points

- [ ] 3.1 Draw each bait's fish from the wiki's fish pages, with the crafting recipes, the rod's multiplier and accuracy. Verify: tests named after the scenarios 'A fish is drawn only by its own bait' and 'A cast with another bait draws none of a fish's kind' written first and seen failing.
- [ ] 3.2 Draw each point's fish from every pool of its region. Verify: tests named after the scenarios 'A point draws from its region's pools' and 'A point in a region with no pool draws nothing' written first and seen failing.

## 4. Screen and exchanges

- [ ] 4.1 Build the fishing view with its prompt in reach and the cast, strike and reel inputs. Verify: a test named after the scenario 'Fishing opens at a point once the Serenitea Pot is owned' written first and seen failing.
- [ ] 4.2 Exchange proficiency at the Fishing Association's shop. Verify: a test named after the scenario 'Proficiency exchanges for a reward at the association' written first and seen failing.
