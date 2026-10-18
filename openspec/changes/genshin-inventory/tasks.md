## 1. Using food

- [x] 1.1 Read each food's heal and target from the material table once the cooking proposal reads them. Verify: a test named after the scenario "Using a recovery dish heals the selected character", written first and seen failing.
- [x] 1.2 Add using a food to the bag's screen, applying each food's heal to its own target within the party's health. Verify: tests named after the scenarios "Using a party dish heals every party member", "A heal stops at full health" and "A food with none in the bag cannot be used", written first and seen failing.

## 2. An item with no material type

- [ ] 2.1 Read the live dump for every item a source names that carries no material type, and decide whether the publish fails for it or the bag gives it a place. Verify: the decision is written into the design's Decisions, and a test named after the scenario "Picking up an item the materials table gives no type" is written first and seen failing, if the bag gains a place for it.
