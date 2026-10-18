# Statues of The Seven

## Why

Each region's statues are the game's anchor for exploring it: a statue fills in its area of the map and is a jump point. The level rules, the stamina they raise and the healing pool are built and tested as rules, and the world now holds the levels and the pool, the Blessing screen showing the pool and healing from it. The Worship Statue and auto-recover's switch are not built yet. The player needs to find Oculi, see them offered to their region, resonate with statues and use the Statue's Blessing for the statues to do anything in play.

## What Changes

The player finds a region's Oculi, levels its statues with them, resonates with the statues and uses the Blessing at a resonated statue.

- Each Oculus is collected once by touching it, giving its kind and Adventure EXP, and it never comes back.
- A found Oculus is offered to its region at once, and any level it completes is reached then, with its rewards paid.
- A region starts at level one on its first resonance, and that first level's rewards are paid once.
- Each level pays the game's rewards for its region: Adventure EXP, Primogems and Sigils everywhere, and each region's own items.
- Resonating with a statue changes the Traveler's element to its region's, with that element's constellations coming with the levels.
- F on a resonated statue opens the Statue's Blessing, with its healing pool and the party's portraits, a click healing a member from the pool. The Worship Statue and the auto-recover switch and threshold are open tasks 3.3 and 3.4.
- Standing by a statue for two seconds with auto-recover on revives the fallen and heals members under the threshold from the pool.
- The statues' state is kept with the world and merged between two saves, so no found Oculus is left unoffered.

## Capabilities

- **genshin/statues-of-the-seven** (modified)

## Waiting on

- `openspec/changes/genshin-character-kits/`: the Traveler's resonance follows its element once the character kits hold it.
- The Statue's Blessing's entry and its threshold's steps, provisional until the screen is recorded.
- The distance an Oculus shows on the minimap, to be re-measured from the owed `oculus-minimap.mkv` recording.
- Each later region's Oculi and levels, which land with that region.

## Impact

The save gains the statues' state, with its read, write and merge. The world gains the Oculi, their touch, their minimap mark and the statues' resonance. The Statue's Blessing is a new screen, and the stamina maximum takes the saved levels.
