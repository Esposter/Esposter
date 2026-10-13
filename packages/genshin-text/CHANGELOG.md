# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.1.0](https://github.com/Esposter/Esposter/compare/v4.0.0...v4.1.0) (2026-10-13)

### Bug Fixes

* **genshin-text:** a colour tag takes exactly eight hex digits, and its run may cross a line ([79b7778](https://github.com/Esposter/Esposter/commit/79b777827a43c30a11440c6316dd27408a8e53a5))
* **genshin-text:** GameTitle and GenesisCrystal are declared once, under their comment ([2133a16](https://github.com/Esposter/Esposter/commit/2133a16d30146ade7a54e5ebe0adbee87f5d2229))
* **genshin-text:** PreciousChest sorts before PressToOpen in GameTextKey ([d072187](https://github.com/Esposter/Esposter/commit/d072187ff10fe678ae96647bd9c0fd6d68dc6592))
* **genshin-text:** the forge's title is written to every language, so ForgeTitle has its text ([ea183ae](https://github.com/Esposter/Esposter/commit/ea183ae60e7019037a0b2f4fa823e2dd944a41bb))
* **genshin-text:** the Friends member sits before Friendship as perfectionist orders the enum ([4e68738](https://github.com/Esposter/Esposter/commit/4e68738a3da73b29495b81ca4097ff7fb6f1f11d))
* **genshin-text:** the game text enum sorts its members and names UID as Uid, so lint is green, and the persona's generated copy is rewritten by the writer's own function ([541adf1](https://github.com/Esposter/Esposter/commit/541adf15ad5ed0dd21165ae9f6c2d386c51094d6))
* **genshin-text:** the written strings keep their colour tags, which the wish draws as coloured runs ([e26e423](https://github.com/Esposter/Esposter/commit/e26e423f19baa27c0568dadc8bbe88450922f63b))
* repair main's red at cfd258a8d5, its lint, tests and size snapshots ([99504aa](https://github.com/Esposter/Esposter/commit/99504aa10e4156ce9f167f41f0b93b82dee1eb85))

### Features

* **configuration:** lint enforces the ban on await import ([7d5f577](https://github.com/Esposter/Esposter/commit/7d5f577e323679bcbb6ce36c97f09d6ca42bc6ee))
* **genshin-interface:** the forge screen's Materials and Forge Queues tabs are built on the public clip of the Wagner forge, with the forge's words keyed by game text id ([68a44a2](https://github.com/Esposter/Esposter/commit/68a44a22e4e0d1096f321af99032cc3e79e9ae7e))
* **genshin-interface:** the Reputation reward page's level list in the clip's pixels; mean 6.13% to 2.07%, FLIP 0.2656 to 0.1448 ([64ad3f3](https://github.com/Esposter/Esposter/commit/64ad3f311c4f4bede3024d2ae4552255787d11b0))
* **genshin-interface:** the wish screen's body is the game's at rest, its card and Shop, Details and History row over the plate, and its pool moved to a Details popup ([efb0b17](https://github.com/Esposter/Esposter/commit/efb0b17013775f66df4fb442e888b6418d5ec4e4))
* **genshin-text:** an interface string's numbered values filled as they are, and an item with its count ([8da702d](https://github.com/Esposter/Esposter/commit/8da702d204301c24a81486410973c92352a70e95))
* **genshin-text:** the Adventurer Handbook's Experience page keys: its chapter, investigation progress, rewards and five commissions, by the game's text ids ([a3e2647](https://github.com/Esposter/Esposter/commit/a3e264716022921876213c716a8e476f54a051d0))
* **genshin-text:** the Archive's seven section titles are game text keys, each the codex's own text id, in fifteen languages ([0a8b0c0](https://github.com/Esposter/Esposter/commit/0a8b0c0129f34ff4d3f9370eefb5c66f65b12e88))
* **genshin-text:** the bag's destroy dialog keys its Recovered label to the game's text id ([2eeb019](https://github.com/Esposter/Esposter/commit/2eeb019a76191f7a61db866dc17c5a4012d6605c))
* **genshin-text:** the bag's destroy mode is keyed to its trash's game text ([379614a](https://github.com/Esposter/Esposter/commit/379614a98a9f80fbe6bfeee6ef430facf4630261))
* **genshin-text:** the bag's full hint and the wish's Fate purchase are game text keys, read from the game's own text ids ([3f3fa30](https://github.com/Esposter/Esposter/commit/3f3fa3052e490ddafd070b65f7959c47450304fb))
* **genshin-text:** the bag's tabs and room, its sort, the currencies, and the wish's kinds, sets and Epitomized Path ([839b8b0](https://github.com/Esposter/Esposter/commit/839b8b0efb5a1b8c80f6f16bd2f63059b34ecf79))
* **genshin-text:** the blacksmith's three enhancement-ore refusal lines are game text keys in all fifteen languages ([817a892](https://github.com/Esposter/Esposter/commit/817a892b286b869b50a7eee3fdd0fbd40c628b79))
* **genshin-text:** the card game's duel words, its phases, rolls, switch, tuning, end of round, result and concession, and the challenge's reply, by the game's text ids ([984919c](https://github.com/Esposter/Esposter/commit/984919c887a8df7e40ffd0d7e1bd2fa8829c73ba))
* **genshin-text:** the character screen's tabs, its attributes and their groups, and a level as the game writes one ([56ed507](https://github.com/Esposter/Esposter/commit/56ed507b15dac8af99a5a68a3e5889b1b71fac8a))
* **genshin-text:** the crafting bench's combine types are game text keys, named in every language by the manual text map ([d820345](https://github.com/Esposter/Esposter/commit/d82034528ce0b6942a5f50e0dddabdff6871bbdc))
* **genshin-text:** the crafting bench's five words are game text keys, in every language ([70af093](https://github.com/Esposter/Esposter/commit/70af0931713a242750e3a0dd17c24149c56e6133))
* **genshin-text:** the Electro Crystal node is a game text key in every language, as the map's Inventory label names it ([0670e02](https://github.com/Esposter/Esposter/commit/0670e029ca663769b346151595fdd73cc7c81e96))
* **genshin-text:** the enemies' Damaged, Ominous and Stained Masks are named by their game text ([b4a7577](https://github.com/Esposter/Esposter/commit/b4a7577020bd9cfda2185846ed00788785313e70))
* **genshin-text:** the enhancement ores' names and the Magical Crystal Chunk's are game text keys ([44d8441](https://github.com/Esposter/Esposter/commit/44d84413a42204f11690ea87e891f8baa5375ca8))
* **genshin-text:** the expedition words are game text keys, Mondstadt's nine materials and six place names, in all fifteen languages ([785ddc2](https://github.com/Esposter/Esposter/commit/785ddc2a01d499842161597f595775ca4692c55c))
* **genshin-text:** the Frostbearing Tree's prompt name is a game text key, its English written into every language's chunk ([85122a2](https://github.com/Esposter/Esposter/commit/85122a24568817c95d96684787e5b9238448b137))
* **genshin-text:** the game's words for the touch layout's attack, sprint and aim buttons ([783e32f](https://github.com/Esposter/Esposter/commit/783e32fb18afccb22aaa0e2dcaeedebee41585b2))
* **genshin-text:** the gathering items' names are game text keys, in all fifteen languages ([341e60f](https://github.com/Esposter/Esposter/commit/341e60f8a5f8fa76deaff7dbace5fe7b3cc7b009))
* **genshin-text:** the Graphics Quality tier Medium is referenced by its game text id, its persona copy regenerated with it ([5e639fa](https://github.com/Esposter/Esposter/commit/5e639fa1b3df590757f8a9f0d0d2ac2bf5f2e70f))
* **genshin-text:** the HUD's stamina meter, HP bars and skill and burst buttons are named in the game's words ([889003c](https://github.com/Esposter/Esposter/commit/889003c68dfc6a9691d85042d28803ad6e50c71c))
* **genshin-text:** the map's exploration line in the game's words, and six-digit colour tags split like eight ([4b50a5e](https://github.com/Esposter/Esposter/commit/4b50a5e3450ce63d574bd3ee6c1d56ac5a1c92d4))
* **genshin-text:** the map's teleport and Statue of The Seven, the HUD's Paimon button and the touch controls' jump ([071436a](https://github.com/Esposter/Esposter/commit/071436ab3a7035dd2c5d589bb51f0fa4ace3e419))
* **genshin-text:** the Masterless Stella Fortuna's name is a game text key in fifteen languages ([1e723fa](https://github.com/Esposter/Esposter/commit/1e723fa4ced33833a83659120d30439b328689c4))
* **genshin-text:** the Original Resin name is a GameTextKey, written in the fifteen languages ([f82119f](https://github.com/Esposter/Esposter/commit/f82119f637d19e0f4c49abee7a11b805a7c1d9fd))
* **genshin-text:** the Profile tab's Friendship label and the story-unlock line are game text keys ([568149d](https://github.com/Esposter/Esposter/commit/568149daddb40a0b1d2595553046f9a3d0d1dbd5))
* **genshin-text:** the titles of the screens the world opens, and the Paimon menu's notices, quit and settings under their own names ([79fe58e](https://github.com/Esposter/Esposter/commit/79fe58eb7fdae1a7aaad6ec77936e18f97457115))
* **genshin-world:** Mondstadt's Reputation reward page lists its levels, drawn from the City Reputation Guide ([d912524](https://github.com/Esposter/Esposter/commit/d9125242bf4d400ae8614151f3fc1d9aa10803a1))
* **genshin-world:** the bag's destroy mode ticks entries, quick-selects them by rarity, and destroys the chosen ones through the game's confirm ([7bf476a](https://github.com/Esposter/Esposter/commit/7bf476a3aaacffd8a723031b3ec03fbd85834470))
* **genshin-world:** the forge's Materials tab and the wish screen get their fixtures and references; forge mean 60.87% to 58.07%, wish 49.99%, both still over the bar ([8427fdb](https://github.com/Esposter/Esposter/commit/8427fdbc224c4109c62499e24d42ac1647e735f9))
* **genshin-world:** the forge's Materials, Amount, Start, Obtain and Back are the game's own words, keyed in genshin-text ([2ccab17](https://github.com/Esposter/Esposter/commit/2ccab17b01571fe9638463f9e4e97138257cf433))
* **genshin-world:** the profile card lowers the World Level by one from World Level 3 and restores it, the adjustment saved beside the EXP ([2838203](https://github.com/Esposter/Esposter/commit/2838203b193cdcbf90a8f21b0fd30ae96502cc20))
* **genshin-world:** the quest screen is laid out off the wiki's still, its tabs and marks traced, a series' quests under its row with each quest's distance, rewards and the Quest Overview button, scoring 44.32% from 55.84% ([02d6903](https://github.com/Esposter/Esposter/commit/02d6903b2072bbf9b9a01daabfb9d9ae82676cb4))
* **genshin-world:** the quest tracker's line names the navigated objective's distance, Higher or Lower after an arrowhead, its height read off the world's ground ([624756d](https://github.com/Esposter/Esposter/commit/624756d065ab90256af3a1783a7c2c7032c67881))
* **genshin-world:** the settings' tabs and the Graphics and Audio tabs' rows laid out off a public recording in the world, scored whole with each of the game's pieces filled from the blurred world around it, 1.10% on the Graphics tab and 1.01% on the Audio tab ([e97bc05](https://github.com/Esposter/Esposter/commit/e97bc0574834518b5c27a0efa28b486a53f9134a))
* **genshin-world:** the World Level button opens the game's panel, with its title, tips and cooldown left ([cb6b530](https://github.com/Esposter/Esposter/commit/cb6b530301570e049284d7e63e9fff8ca4b54fdd))
* **genshin-world:** the World Level's info icon opens the game's World Level dialog, measured against a public recording ([a44d023](https://github.com/Esposter/Esposter/commit/a44d0230f69afc5e16128437b42d068faa98ca2c))
* **genshin:assets:** the profile writer writes each playable character's stories and namecard in every language, the stories by their text ids and the namecard by its avatar icon's name (2/2) ([95fd87b](https://github.com/Esposter/Esposter/commit/95fd87b52fa87ff44add8c35335b636583212286))
* **genshin:** Mondstadt's chests open on F in the world, pour their drops out where they stand, and the opened ones are saved ([fbfa9b1](https://github.com/Esposter/Esposter/commit/fbfa9b152243a1d6478e9c5b31090a2e9f2552f3))

# [4.0.0](https://github.com/Esposter/Esposter/compare/v3.9.0...v4.0.0) (2026-10-06)

### Features

* **genshin:** a screen reader hears the game's own words for the loading marks and the login's buttons ([79d023a](https://github.com/Esposter/Esposter/commit/79d023a2d7bde3166b6480a4af2c2f06fd98acd9))

# [3.9.0](https://github.com/Esposter/Esposter/compare/v3.8.1...v3.9.0) (2026-10-01)

### Bug Fixes

* **genshin-text:** entries register tsx through its API, and the page reads the browser behind checkIsServer ([3dfe420](https://github.com/Esposter/Esposter/commit/3dfe42004abeb23fb43e66c1e7a19cba88aa702a))
* **genshin:** place a player's name into the game's text as written, whatever dollar sequence it holds ([6d4c5c8](https://github.com/Esposter/Esposter/commit/6d4c5c827cf80139cf3de5ceaa0b03a0bc6d5437))

### Features

* **genshin-text:** the game's own text in its fifteen languages, and the persona on it ([791d926](https://github.com/Esposter/Esposter/commit/791d926f208007e9cfa8d443485776fe6ccfdb05))
* **genshin-world:** open as mainland China's client does for Simplified Chinese readers, with no publisher's logo and the licence under the title ([5d0572c](https://github.com/Esposter/Esposter/commit/5d0572ca6ba23456692e6868da31d3c06ef2caba))
* **genshin:** the opening in the reader's language, and the rickroll's player chosen by reachability ([2f4c6c8](https://github.com/Esposter/Esposter/commit/2f4c6c85a872d785d251faf0c45e0613622f6269))
* **genshin:** translate the login's door prompt, the Traveler's name and the title's name ([2b571e2](https://github.com/Esposter/Esposter/commit/2b571e213297f1d52cd766b8872fb1d6a0ee750a))
* **genshin:** translate the login's welcome from the account kit's own strings, in every language ([774ec8a](https://github.com/Esposter/Esposter/commit/774ec8a1cdd5aab38c95068cdd5e591559dd1819))
