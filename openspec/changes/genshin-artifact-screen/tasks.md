# Tasks

Each built task names the test it was written first in, and each test is a scenario of the spec delta.

## 1. Tables

- [x] 1.1 The world reads the artifact rarity and EXP tables into its stat tables. Covered by the existing character, kit
      and save suites, which parse the stat tables; the schemas enforce each table's shape, so no test of its own.

## 2. Set bonuses

- [x] 2.1 `getActiveArtifactSetBonuses` reaches each set's bonus at its piece count, and the attribute sum reads it.
      Tests: "a set's two-piece bonus is active from two pieces", "a set's four-piece bonus is active from four pieces", "a
      single piece of a set activates none of its bonuses", "a set the table does not hold is refused".

## 3. Equip and unequip

- [x] 3.1 `equipCharacterArtifact` puts a piece in its slot and returns the piece it replaces. Tests: "equipping into an
      empty slot displaces nothing", "equipping into a worn slot returns the piece it replaces".
- [x] 3.2 `unequipCharacterArtifact` takes off a slot's piece and refuses an empty slot. Tests: "unequipping returns the
      worn artifact and leaves its slot empty", "unequipping an empty slot is refused".

## 4. Enhancing a worn artifact

- [x] 4.1 `enhanceCharacterArtifact` charges the Mora and enhances the worn piece, and refuses without it. Tests: "a worn
      artifact takes the materials' EXP and its fodder's, and the Mora they cost is charged", "an enhancement the wallet cannot
      pay for is refused", "an enhancement of an empty slot is refused".

## 5. Not built

- [ ] 5.1 The Artifacts tab's panel: the five slots with their main and sub stats, the set bonuses at two and four pieces,
      and the Enhance and Equip actions. Waits on the artifact slot and set-bonus game text keys, which the main session
      writes, and on a fixture and parity case for the panel.
- [ ] 5.2 The bag's artifact entry holds a rolled, individual piece with a unique instance id. Waits on the
      character-screen agent's change (`agent/w6-character-screen`), which the coordinator cherry-picks; this change builds
      against the `Artifact` type that change uses.
- [ ] 5.3 Equipping from the bag, unequipping to it and taking fodder from it. Waits on 5.2.
- [ ] 5.4 The main affix pools are read by the drop that rolls an artifact. Waits on that drop's wiring.
