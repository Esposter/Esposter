## 1. Refusal rule

- [ ] 1.1 Name why a combat talent cannot rise now, and none when every requirement is met. Verify: getTalentUpgradeRefusal.test.ts, written first and seen failing, named after 'A talent at its last level cannot be upgraded', 'A talent past the character's phase shows the phase it needs', 'A talent short of Mora shows the Mora it needs', 'A talent missing materials shows the materials it needs' and 'A talent that meets every requirement can be upgraded'.
- [ ] 1.2 Make the upgrade throw on the same answer the tab shows. Verify: upgradeTalent.test.ts, unchanged, passes in full.

## 2. Talents tab

- [ ] 2.1 List each talent's level, next phase and cost on the Talents tab, with its Upgrade disabled and its reason shown when it cannot rise. Verify: tests named after 'A talent row shows its next level's phase and cost' and 'A talent at its last level cannot be upgraded'.
- [ ] 2.2 Press Upgrade to raise a talent, taking its Mora and materials, and keep the raised level with the world. Verify: tests named after 'Pressing Upgrade raises a talent by one and takes its Mora and materials' and 'A raised talent is kept after a reload'.

## 3. Constellation additions

- [ ] 3.1 Have the kit read each talent at its own level plus its constellations' additions, once the character kits hold the read. Verify: a test named after 'A constellation raises a talent above level ten'. Blocked until the character kits land.
