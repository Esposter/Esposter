# Statues of The Seven

## Why

Each region's statues are the game's anchor for exploring it: a statue fills in its area of the map and is a jump point. The level rules, the stamina they raise and the healing pool are built and tested as rules, and the world now holds the levels and the pool, the Blessing screen showing the pool and healing from it. The Worship Statue and the Statue's Blessing are built on provisional layouts, and auto-recover's switch is not built yet. The player needs to find Oculi, offer them at their region's Worship Statue, resonate with statues and use the Statue's Blessing for the statues to do anything in play.

## What Changes

The player finds a region's Oculi, levels its statues with them, resonates with the statues and uses the Blessing at a resonated statue.

- Each Oculus is collected once by touching it, giving its kind and Adventure EXP, and it never comes back.
- A collected Oculus is held in its region until its Worship Statue offers it, and the levels the offered Oculi complete are reached then, with their rewards paid.
- A region starts at level one on its first resonance, and that first level's rewards are paid once.
- Each level pays the game's rewards for its region: Adventure EXP, Primogems and Sigils everywhere, and each region's own items.
- Resonating with a statue changes the Traveler's element to its region's, with that element's constellations coming with the levels.
- F on a resonated statue offers the Worship Statue, with the region's levels, their rewards and the Oculi collected, and the Statue's Blessing, with its healing pool and the party's portraits, a click healing a member from the pool. The auto-recover switch and threshold are open task 3.4.
- Standing by a statue for two seconds with auto-recover on revives the fallen and heals members under the threshold from the pool.
- The statues' state is kept with the world and merged between two saves, the found Oculi unioned and each region kept from the save further on.

## Capabilities

- **genshin/statues-of-the-seven** (modified)

## Waiting on

- `openspec/changes/genshin-character-kits/`: the Traveler's resonance follows its element once the character kits hold it.
- The Statue's Blessing and Worship Statue layouts, and the Blessing's threshold steps, provisional until the screens are recorded.
- The distance an Oculus shows on the minimap, to be re-measured from the owed `oculus-minimap.mkv` recording.
- Each later region's Oculi and levels, which land with that region.

## Impact

The save gains the statues' state, with its read, write and merge. The world gains the Oculi, their touch, their minimap mark and the statues' resonance. The Statue's Blessing and the Worship Statue are new screens, and the stamina maximum takes the saved levels.
