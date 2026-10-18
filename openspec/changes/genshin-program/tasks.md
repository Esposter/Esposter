## 1. The recreation passes and their measures

- [ ] 1.1 Build the recreation passes' runner and their measures first, so every later page is judged by them. Verify: a test named after the scenario "A pass is accepted when its frame scores within its gate", written first and seen failing, and a test named after "A frame outside its gate is not accepted".

## 2. The world engine

- [ ] 2.1 Build the phase one engine pages in the table's order, each when Windrise's passes reach what it draws, and show each first in Windrise's scene. Verify: a test named after the scenario "The world's geometry is generated rather than loaded", written first and seen failing.
- [ ] 2.2 Keep the world's frame cost tied to what the camera sees as each engine page lands. Verify: a test named after the scenario "Regions out of view do not raise the frame cost", written first and seen failing.

## 3. The regions

- [ ] 3.1 Build Mondstadt first, where the game begins, then the other regions in the game's release order. Verify: a test named after the scenario "A region's layout matches its game's terrain", written first and seen failing.
- [ ] 3.2 Build each region on the whole engine, adding its palette, building kit, flora, weather and landmarks. Verify: the region's pass scores within its gate, a test named after "A pass is accepted when its frame scores within its gate".

## 4. The console's world and its labels

- [ ] 4.1 Replace the console's voxel world at the Genshin page with the Genshin world, keeping the console's sessions reachable. Verify: tests named after the scenarios "The Genshin page opens the Genshin world" and "A console session stays reachable over the world", written first and seen failing.
- [x] 4.2 Label the world's pages as an unofficial fan work and serve no game asset. Verify: tests named after the scenarios "The world's page carries the fan-made label" and "A visitor cannot retrieve a game asset from the app".

## 5. The play features

- [ ] 5.1 Build the character controller and its follow camera, then the HUD, then characters from the official models the reader holds, then the menu screens, then the elemental reactions, each feature when its turn comes. Verify: a test named after the scenario "A reader without the official model sees no character", written first and seen failing.

## 6. The game's systems

- [ ] 6.1 Build the character kits first, then the game's systems in phase four's order, each page re-read against the engine when its turn comes. Verify: each page's own scenarios pass, and each page's pass is accepted under the scenario "A pass is accepted when its frame scores within its gate" before it is frozen.
- [ ] 6.2 Keep the world single-player with no payment or branding. Verify: tests named after the scenarios "Another player is not shown in the world" and "The world's chrome shows no payment or HoYoverse mark", written first and seen failing.
