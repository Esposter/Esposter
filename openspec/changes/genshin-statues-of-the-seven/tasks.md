## 1. Save and Oculi

- [x] 1.1 Keep the statues' levels, held counts and found Oculi in the save, a new player's save holding none started and none found. Verify: a test whose scenario is 'A new player starts with no region started and no Oculus found' in readGenshinSave.test.ts, written first and seen failing.
- [x] 1.2 Merge the found Oculi, and keep each region as the save further on. Verify: mergeGenshinSave.test.ts, named after 'Merged saves keep every found Oculus', 'A region only one save holds is kept as it is' and 'A region both saves hold is the save further on'.
- [x] 1.3 Collect an Oculus once into its region's collected count, to be offered at the region's Worship Statue (3.3). Verify: findOculus.test.ts, named after 'touching an Oculus collects it and gives Adventure EXP' and 'a collected Oculus is held in its region with the ones already collected'.
- [x] 1.4 Show each region's Oculi in the world and mark a near one on the minimap with a sound. Verify: a test named after 'A near Oculus shows on the minimap with a sound'. The distance is provisional until the owed recording re-measures it.

## 2. Statues' levels

- [x] 2.1 Start a region at level one on its first resonance and pay that level once. Verify: tests named after 'The first resonance starts the region at level one' and 'A second resonance pays no reward again'.
- [x] 2.2 Pay each level's rewards for its region. Verify: tests named after 'Every region's level pays Adventure EXP, Primogems and Sigils' and 'Liyue's level also pays its Stones of Remembrance'.
- [x] 2.3 Change the Traveler's element on resonance, once the character kits hold the element. Verify: a test named after 'Resonating with a Liyue statue makes the Traveler Geo'.

## 3. Statue's Blessing

- [x] 3.1 Open the Statue's Blessing with F on a resonated statue, showing its healing pool and the party's portraits, and heal from a portrait. Verify: computeStatueInteractables.test.ts, named after 'a resonated statue offers the worship statue and the statue's blessing'. The layout is provisional until statue-blessing.mkv records it, and neither captured public clip shows a Blessing or Worship screen.
- [x] 3.2 Revive and heal the party by auto-recover after two seconds near a statue. Verify: tests named after 'Standing by a statue for two seconds revives the fallen', 'Members under the threshold are healed when the pool holds enough' and 'A pool short of the threshold heals the first slots first'.
- [x] 3.3 Show the Worship Statue on F at a resonated statue, with the region's levels and what each pays, and offer held Oculi there. Verify: computeStatueInteractables.test.ts, named after 'a resonated statue offers the worship statue and the statue's blessing', and offerCollectedOculi.test.ts, named after 'offering at the Worship Statue raises the level', 'collected Oculi short of the next level are offered and kept' and 'offering none reaches no level'. The layout is provisional until statue-blessing.mkv records it, and the title's and the offer label's text ids (1652053571, 1162683154) are unconfirmed against the game's tables.
- [ ] 3.4 Set auto-recover's switch and threshold on the Statue's Blessing, in the game's steps. Blocked: the switch's labels and the threshold's steps are not in the game data the recreation reads, so they wait on statue-blessing.mkv.
