## 1. Adventurer's four-piece

- [ ] 1.1 Add the four-piece bonus as a module restoring 6% of maximum HP each second for 5 seconds as a chest opens. Verify: a test named after the scenario 'a chest opened by a four-piece wearer restores HP for five seconds', seen failing first.
- [ ] 1.2 End the restoration after five seconds. Verify: a test named after the scenario 'the restoration stops after five seconds', seen failing first.
- [ ] 1.3 Route a chest opened in the world to the combat as Mora picked up is routed. Verify: a test named after the scenario 'a wearer of fewer than four pieces is not restored', seen failing first; the chests unit's first step must have landed before the end-to-end check.
- [ ] 1.4 Restore only the character wearing the set. Verify: a test named after the scenario 'another party member without the set is not restored', seen failing first.
