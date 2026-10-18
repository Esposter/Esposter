# Statues of The Seven

## Why

Each region's statues are the game's anchor for exploring it: a statue fills in its area of the map and is a jump point. The level rules, the stamina they raise and the healing pool are built and tested as rules, and the world holds the levels and the pool, the Blessing screen showing the pool and healing from it. The Worship Statue is built as its screen, offer and claim, and auto-recover's switch is not built yet. The player needs to find Oculi, see them offered at the Worship Statue, claim each region's levels, resonate with statues and use the Statue's Blessing for the statues to do anything in play.

## What Changes

The player finds a region's Oculi, offers them at the Worship Statue to level the statues, claims each reached level, resonates with the statues and uses the Blessing at a resonated statue.

- Each Oculus is collected once by touching it, giving its kind and Adventure EXP, and it never comes back.
- A found Oculus is held in its region until the Worship Statue offers it, and an offer reaches each level the held Oculi complete.
- A region starts at level one on its first resonance, which reaches that level, its rewards waiting to be claimed.
- The Worship Statue claims one reached level per action, paying that level's rewards once.
- Each level pays the game's rewards for its region when claimed: Adventure EXP, Primogems and Sigils everywhere, and each region's own items.
- Resonating with a statue changes the Traveler's element to its region's, with that element's constellations coming with the levels.
- F on a resonated statue opens the Worship Statue, with its levels and the held Oculi, and the Statue's Blessing, with its healing pool and the party's portraits, is one switch away, a click healing a member from the pool. The auto-recover switch and threshold are open task 3.4.
- Standing by a statue for two seconds with auto-recover on revives the fallen and heals members under the threshold from the pool.
- The statues' state is kept with the world and merged between two saves, so no found Oculus or claimed level is lost.

## Capabilities

- **genshin/statues-of-the-seven** (modified)

## Waiting on

- `openspec/changes/genshin-character-kits/`: the Traveler's resonance follows its element once the character kits hold it.
- The Worship Statue's and the Statue's Blessing's layouts, and the Worship Statue's claim action, provisional until the screens are recorded.
- The distance an Oculus shows on the minimap, to be re-measured from the owed `oculus-minimap.mkv` recording.
- Each later region's Oculi and levels, which land with that region.

## Impact

The save gains the statues' state, with its read, write and merge, including each region's level claimed. The world gains the Oculi, their touch, their minimap mark, the statues' resonance, and the Worship Statue's offer and claim. The Worship Statue and the Statue's Blessing are new screens, and the stamina maximum takes the saved levels.
