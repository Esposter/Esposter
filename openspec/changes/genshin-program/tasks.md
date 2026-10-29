## 1. The recreation passes and their measures

- [x] 1.1 Build the recreation passes' runner and their measures first, so every later page is judged by them. Verify: a test named after the scenario "A pass is accepted when its frame scores within its gate", written first and seen failing, and a test named after "A frame outside its gate is not accepted".

## 2. The world engine

- [ ] 2.1 Build the phase one engine pages in the table's order, each when Windrise's passes reach what it draws, and show each first in Windrise's scene. Verify: a test named after the scenario "The world's geometry is generated rather than loaded", written first and seen failing. Open: the phase-one pages it names are open in their own folders (recreation passes 5 boxes, localized opening 5, trees and scatter 5, ground detail 4, Windrise derivation 2, weather 1, flowing water 1), and the named test does not exist.
- [ ] 2.2 Keep the world's frame cost tied to what the camera sees as each engine page lands. Verify: a test named after the scenario "Regions out of view do not raise the frame cost", written first and seen failing. Open: the culling is in code (createFrustumSetter and the grass culling compute), but the rule is held per engine page as each lands, and the named test does not exist.

## 3. The regions

- [ ] 3.1 Build Mondstadt first, where the game begins, then the other regions in the game's release order. Verify: a test named after the scenario "A region's layout matches its game's terrain", written first and seen failing. Open: Mondstadt's page has 7 of 8 boxes open in its own folder, it needs the phase-one engine (2.1) first, and the named test does not exist.
- [ ] 3.2 Build each region on the whole engine, adding its palette, building kit, flora, weather and landmarks. Verify: the region's pass scores within its gate, a test named after "A pass is accepted when its frame scores within its gate". Open: each region's page is open in its own folder (Liyue 8 boxes, Fontaine 7, Nod-Krai 7, Snezhnaya 7, Mondstadt 7, Inazuma 6, Natlan 6, Sumeru 5), and each pass waits on the engine (2.1) and on Mondstadt first (3.1).

## 4. The console's world and its labels

- [ ] 4.1 Replace the console's voxel world at the Genshin page with the Genshin world, keeping the console's sessions reachable. Verify: tests named after the scenarios "The Genshin page opens the Genshin world" and "A console session stays reachable over the world", written first and seen failing. Open: the code is in place (apps/web/app/pages/genshin.vue and apps/web/app/components/AgentConsole/Index.vue mount the Genshin world, and no voxel world is left), but neither named test exists yet, so the verify is not met.
- [x] 4.2 Serve no game asset. Verify: the test named after the scenario "A visitor cannot retrieve a game asset from the app". The on-page fan-work label was removed by the owner, so no test checks it.

## 5. The play features

- [ ] 5.1 Build the character controller and its follow camera, then the HUD, then characters from HoYoverse's official models, which the startup loading screen downloads from the published packs, then the menu screens, then the elemental reactions, each feature when its turn comes. Verify: a test named after the scenario "A pack that fails to download draws no capsule", written first and seen failing. Open: the controller is in genshin-engine's locomotion and collision, but the follow camera (4 boxes open), the HUD (3), characters (3) and the Paimon, Time and quit menus (2, 1, 1) are open in their own folders, and the named test does not exist.

## 6. The game's systems

- [ ] 6.1 Build the character kits first, then the game's systems in phase four's order, each page re-read against the engine when its turn comes. Verify: each page's own scenarios pass, and each page's pass is accepted under the scenario "A pass is accepted when its frame scores within its gate" before it is frozen. Open: the systems' pages sit open in their own folders (167 open boxes across the other genshin change folders, character kits 1 of them), so this umbrella cannot close in one pass.
- [ ] 6.2 Keep the world single-player with no payment or branding. Verify: tests named after the scenarios "Another player is not shown in the world" and "The world's chrome shows no payment or HoYoverse mark", written first and seen failing. Open: neither test exists, and the owner has yet to rule whether absence with nothing that could add it earns no test, and whether the opening's publisher splash and the Paimon menu's disabled Battle Pass entry count as chrome.
