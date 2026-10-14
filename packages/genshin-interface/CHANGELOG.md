# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.2.0](https://github.com/Esposter/Esposter/compare/v4.1.2...v4.2.0) (2026-10-14)

### Bug Fixes

* **ci:** the size snapshots of the seven packages match their current builds ([bf6a776](https://github.com/Esposter/Esposter/commit/bf6a776ce382feaa623bfa9cae712402e3f28f02))

## [4.1.2](https://github.com/Esposter/Esposter/compare/v4.1.1...v4.1.2) (2026-10-14)

**Note:** Version bump only for package genshin-interface

## [4.1.1](https://github.com/Esposter/Esposter/compare/v4.1.0...v4.1.1) (2026-10-14)

**Note:** Version bump only for package genshin-interface

# [4.1.0](https://github.com/Esposter/Esposter/compare/v4.0.0...v4.1.0) (2026-10-13)

### Bug Fixes

* **configuration:** playwright is a devDependency of the package whose browser provider loads it, not of the two genshin packages that run the suite ([b7e61e3](https://github.com/Esposter/Esposter/commit/b7e61e3af59bb8ea0f09a9ee30d73ed2c3cf5493))
* **genshin-interface, genshin-world:** the constellation panel's ring table moves to the package's constants file, and the bundle-size snapshots follow the clean builds ([ec36d2c](https://github.com/Esposter/Esposter/commit/ec36d2cc7a5f00e058e70bfb9343095f8f627885))
* **genshin-interface, genshin-world:** the Constellation panel's six rings sit on the recording's arc, 72 units across and lit, and Xilonen's record holds all six ([853afb2](https://github.com/Esposter/Esposter/commit/853afb2406e940fd85242d3b5ffbf1742d944f1f))
* **genshin-interface:** a confirmed destroy returns the focus to the trash once the Destroy button it opened from is gone ([b42a168](https://github.com/Esposter/Esposter/commit/b42a168b23d247eaa63fe12c53cb05c143baba7f))
* **genshin-interface:** a scaled GameRect scales about its pivot, as Unity scales a RectTransform ([a7ccf26](https://github.com/Esposter/Esposter/commit/a7ccf2696927dd2c93c00b87f9597a6104c717d9))
* **genshin-interface:** the bag's currency figures are the game's 30-unit cap height, the Primogem and Mora pills and the top-up plus sit where the food tab's frame puts them, and the food tab's mean moves from 2.41% to 2.26% (FLIP 0.0774 to 0.0810) ([b326ebf](https://github.com/Esposter/Esposter/commit/b326ebf29d25ee73246b4478e8c231b8c57eb7c8))
* **genshin-interface:** the bag's destroy confirm takes the focus with the bag inert behind it, a ticked entry is pressed in destroy mode, and the destroy foot's count and button share the quick selects' row to stay above 1080 ([66ff96d](https://github.com/Esposter/Esposter/commit/66ff96d7a3486e740c151f2d37776cef2037ad14))
* **genshin-interface:** the bag's trash disc is a plain span, a decorative disc a click never reaches, and the fixture sorts its keys, so lint is green ([b5a6963](https://github.com/Esposter/Esposter/commit/b5a6963fc8acdeb8816651cf914f3e5db2b2c231))
* **genshin-interface:** the components that use computed, inject or provide import them from vue ([a8e182f](https://github.com/Esposter/Esposter/commit/a8e182fab76d1afefdb64f2ffb077542917c4491))
* **genshin-interface:** the crafting bench's head spans both columns, so the recipes and the detail share the second row ([5142319](https://github.com/Esposter/Esposter/commit/5142319bc03c2bcb279a11c3da7d0c255d9b5b43))
* **genshin-interface:** the dialogue screen's speaker, line and replies take the English client's colour, size and place, measured off its recording of the dialogue choices ([bd8cc58](https://github.com/Esposter/Esposter/commit/bd8cc5810b020f56bee92c5036b06214ef0c94a3))
* **genshin-interface:** the forge's head and queues span both columns, and the forge's and crafting bench's close buttons carry a name ([6ac197a](https://github.com/Esposter/Esposter/commit/6ac197a0e41f23ab0e1d158ced24827362dd5c53))
* **genshin-interface:** the game button imports useTemplateRef from vue, as its sibling components do ([df9adce](https://github.com/Esposter/Esposter/commit/df9adce377af4b26bdb8fef471e652d6720ad12e))
* **genshin-interface:** the sort select's missing name is a disable with its reason, since the sort's caption is no game text key yet ([bf08da6](https://github.com/Esposter/Esposter/commit/bf08da68c2e57396e2957580108ebe85e15817ba))
* **genshin-interface:** the wish banner's aria label and its open tag share one label function ([b2fc956](https://github.com/Esposter/Esposter/commit/b2fc956c82833e240f3722c0b3529aab1aab67f8))
* **genshin-interface:** the wish's stars are read as the stars they are, not as a bare number ([8db09b3](https://github.com/Esposter/Esposter/commit/8db09b325e69d4812571781a0b021926bedf6553))
* **genshin-text:** the written strings keep their colour tags, which the wish draws as coloured runs ([e26e423](https://github.com/Esposter/Esposter/commit/e26e423f19baa27c0568dadc8bbe88450922f63b))
* **genshin-world:** the profile story check is named by its boolean role, and the profile text comment is capitalized per line ([559c450](https://github.com/Esposter/Esposter/commit/559c450dfe06e6e2bf7700e09494983988456328))
* **genshin-world:** the session passes the handbook its panel's props, and the crafting and handbook screens lint clean ([32c18af](https://github.com/Esposter/Esposter/commit/32c18af4defb1a86a9d573ad54902b40bb29d21d))
* **genshin:** the dialogue component is drawn crisp, and the comparison softens our shot by its capture's measured blur ([71dda88](https://github.com/Esposter/Esposter/commit/71dda885dc2be0ebd82e899601a32ae4823d041e))
* **genshin:** the dialogue line's top margin and its band's gradient are measured off the recording ([3bce070](https://github.com/Esposter/Esposter/commit/3bce070813139d6af32201985294aff83b4e46a0))
* **genshin:** the dialogue states are scored over the clean plate, and the line, its pills and the speaker's role are re-fit to it ([f5d7703](https://github.com/Esposter/Esposter/commit/f5d7703f0af6bd948bbf92124512129591d1214c))
* **genshin:** the Reputation reward page scrolls to all eight levels, reads each row's item count and achieved mark aloud, and the world's page opens on the level it is given ([d73644b](https://github.com/Esposter/Esposter/commit/d73644b922440793d02d2f0c9979f14b79a239e9))
* **lint:** the save files and the Archive map meet their rules ([c818445](https://github.com/Esposter/Esposter/commit/c818445071594bf009742e1a386ded9491583674)), closes [#src](https://github.com/Esposter/Esposter/issues/src)
* repair main's red Format, Lint and Coverage jobs at cdf68c5568 ([01ae239](https://github.com/Esposter/Esposter/commit/01ae239c39a85bf3aa7820d9ad82395b24003e2f))
* **scripts:** the queue's rewrite onto ai/review-fixes keeps each drained fix whole or not at all ([89838da](https://github.com/Esposter/Esposter/commit/89838da3c309f3ec746e2f9f1f062982464b7923))

### Features

* **genshin-interface, genshin-world:** the character screen's backdrop is each tab's own, four stops sampled from its reference frame ([2b76740](https://github.com/Esposter/Esposter/commit/2b767408ca6d785641d73d4badea1566690b9dd2))
* **genshin-interface, genshin-world:** the character screen's four tab panels are drawn from the systems' data ([c139e6b](https://github.com/Esposter/Esposter/commit/c139e6b2fa6b099b397b8cb8e183072780b4b08e))
* **genshin-interface:** a dialogue choice is drawn with its traced mark, and a narration is centred on black ([a53a62b](https://github.com/Esposter/Esposter/commit/a53a62b46227126772e8450b702ccd34d458ccd4))
* **genshin-interface:** a pressed side bar button turns its disc cream and its icon ink, back at its resting size ([6ca31e4](https://github.com/Esposter/Esposter/commit/6ca31e47a468dbdb6344b005946ba275d0de97f0))
* **genshin-interface:** a touch screen draws the interface a quarter larger, and the HP bar fills its container ([2649b0c](https://github.com/Esposter/Esposter/commit/2649b0cb7a2f737979404ea9650943d98fedff0e))
* **genshin-interface:** every button's hover is its game template's, the side bar's a round navy disc ([c7b404b](https://github.com/Esposter/Esposter/commit/c7b404b702fb6e123afa179fa1dc2c55f68d12a0))
* **genshin-interface:** the bag's grid is four columns at the recording's place, its detail panel shows the chosen entry on its bands, and its tabs and count sit where the frame puts them ([44df1a0](https://github.com/Esposter/Esposter/commit/44df1a0c412c6509b3c769d83d9afe56a51c33c2))
* **genshin-interface:** the character frame's characters run across the top, its tabs down the left with the open one's pill, and its panel down the right, measured off the English client at 21:9 ([fd4a873](https://github.com/Esposter/Esposter/commit/fd4a87372308318d67bdebc3961e9426cc4531ce))
* **genshin-interface:** the character menu's frame, its tabs' keys and arrows, and the scene behind it sits in its own slot ([9729d8c](https://github.com/Esposter/Esposter/commit/9729d8c983fbd80d913a1dd4171a1fa8017e09b2))
* **genshin-interface:** the character screen's frame — its characters down the left, its six tabs down the right and the open one's panel ([f35a27d](https://github.com/Esposter/Esposter/commit/f35a27d3947a3e270806ad6f1182990d99a96217))
* **genshin-interface:** the Craft screen's detail panel in the game's pixels ([4bf5da7](https://github.com/Esposter/Esposter/commit/4bf5da7ca13d13d61b207b11391bdcd832f35ba2))
* **genshin-interface:** the Craft screen's header, coins, close and tabs in the game's pixels ([c2ac4d2](https://github.com/Esposter/Esposter/commit/c2ac4d29ceb50c49bf258b7ca5d015f715f75ee2))
* **genshin-interface:** the Craft screen's materials row, crafter and craft button in the game's pixels ([cf8fa4e](https://github.com/Esposter/Esposter/commit/cf8fa4e79cf0e20f3d86dcc9865a03c2ee607c54))
* **genshin-interface:** the Craft screen's recipe grid in the game's pixels ([aa973cc](https://github.com/Esposter/Esposter/commit/aa973cca4fe2188bc4f0ef31f67408ce0c2443e0))
* **genshin-interface:** the crafting screen's recipe list and picked-recipe panel are built from the public clip of the Crafting Table, with the words passed in as props until their game text ids land ([15359a7](https://github.com/Esposter/Esposter/commit/15359a7e0cfe612c81e3c1c52278fedd4f382d14))
* **genshin-interface:** the dialogue replies are a Reply button kind, their hover and focus through the shared mechanism ([0e0d161](https://github.com/Esposter/Esposter/commit/0e0d161852bfaf222607a03c5d1ba49aa762b8e1))
* **genshin-interface:** the dialogue screen shows the speaker's name, the line written out in place, and the replies on offer ([576ff3c](https://github.com/Esposter/Esposter/commit/576ff3c5f3512135a7fd24adef6d9a62817bc9bf))
* **genshin-interface:** the forge draws each recipe row's tile and the amount track's ends ([75ec6ef](https://github.com/Esposter/Esposter/commit/75ec6ef8ba897db209a8701cd9b03eb9a6dc04b3))
* **genshin-interface:** the forge draws its Materials box, Amount line and large item icon, over its blurred scene as a backdrop ([d0a175e](https://github.com/Esposter/Esposter/commit/d0a175e9ce982e640d1c9bb21ca7c3174a08bae1))
* **genshin-interface:** the forge screen's Materials and Forge Queues tabs are built on the public clip of the Wagner forge, with the forge's words keyed by game text id ([68a44a2](https://github.com/Esposter/Esposter/commit/68a44a22e4e0d1096f321af99032cc3e79e9ae7e))
* **genshin-interface:** the forge's recipe rows place their name and forge time off the 32 second frame ([503364e](https://github.com/Esposter/Esposter/commit/503364e8945cf8c01a97a070311663052a2fc732))
* **genshin-interface:** the interaction pill's right end fades out over the grass, its selected rim brighter and the pointer cross-fades to the selection; mean 7.98% to 5.07% ([b74f9ea](https://github.com/Esposter/Esposter/commit/b74f9ea9e4c3f1ddb3cf5d173ef108c86e39cbd8))
* **genshin-interface:** the prompt list's rows, cap and pill are measured off the English pickup at 1080 high, and the list is a screen of its own that the parity page scores ([920d3af](https://github.com/Esposter/Esposter/commit/920d3af206f7243aa5ca74e80c7ec17661646dc9))
* **genshin-interface:** the prompts beside the character, the bag's tabs, sort and grid, and the wish's banners, sets and results ([7763b1d](https://github.com/Esposter/Esposter/commit/7763b1dda8c0dc9650db7b56a7c666425333ed29))
* **genshin-interface:** the quit prompt's pills light a white ring hovered and turn slate under a gold light pressed ([36a9c71](https://github.com/Esposter/Esposter/commit/36a9c711537f00491d349e413573a0ae370564b6))
* **genshin-interface:** the Reputation reward page's level list in the clip's pixels; mean 6.13% to 2.07%, FLIP 0.2656 to 0.1448 ([64ad3f3](https://github.com/Esposter/Esposter/commit/64ad3f311c4f4bede3024d2ae4552255787d11b0))
* **genshin-interface:** the save's entry exports the kinds of wish, so the server reads the wish counters without the interface's components ([8aac65b](https://github.com/Esposter/Esposter/commit/8aac65bab4e6e6440384d65cde70dac482d186d4))
* **genshin-interface:** the wish screen's body is the game's at rest, its card and Shop, Details and History row over the plate, and its pool moved to a Details popup ([efb0b17](https://github.com/Esposter/Esposter/commit/efb0b17013775f66df4fb442e888b6418d5ec4e4))
* **genshin-parity:** approve writes a screen's image only once its compare is under the bar ([ace2c7a](https://github.com/Esposter/Esposter/commit/ace2c7a5c099e22f2ebe564149db545b59c647eb))
* **genshin-world:** a destroy whose returns do not all fit in the bag is refused whole, as a blossom claim is ([5558ddd](https://github.com/Esposter/Esposter/commit/5558ddd3939de164105fafb31094ba257416d121))
* **genshin-world:** a talk runs over the world written out a character at a time, with auto-play and skip; the quest screen lists the quests in progress by kind and navigates to one, its beam rising over the objective; and the Adventurer Handbook shows its tabs ([8bd7ff9](https://github.com/Esposter/Esposter/commit/8bd7ff92a62cc210ccd14cc646ebf83257e19eda))
* **genshin-world:** Mondstadt's Reputation reward page lists its levels, drawn from the City Reputation Guide ([d912524](https://github.com/Esposter/Esposter/commit/d9125242bf4d400ae8614151f3fc1d9aa10803a1))
* **genshin-world:** prompt rows press themselves and drop the key on touch, and the party stands in the game's container with its slot keys ([c1cf426](https://github.com/Esposter/Esposter/commit/c1cf4264e84b53e6ff7a06e6f48a29407e153041))
* **genshin-world:** the bag's destroy follows the game's own rule and returns the materials it gives back ([be484ef](https://github.com/Esposter/Esposter/commit/be484ef0f3e535999242bf74318f87344534e16d))
* **genshin-world:** the bag's destroy mode ticks entries, quick-selects them by rarity, and destroys the chosen ones through the game's confirm ([7bf476a](https://github.com/Esposter/Esposter/commit/7bf476a3aaacffd8a723031b3ec03fbd85834470))
* **genshin-world:** the bag's screen by its tabs, room, sort and the wish's currencies, and the wish's screen spending Fates and drawing weapons into the bag ([069124b](https://github.com/Esposter/Esposter/commit/069124b7b6f734126a30b417ce277490514aff5a))
* **genshin-world:** the bag's trash opens a destroy mode, where a weapon or artifact the rule allows is destroyed on a click ([2a41087](https://github.com/Esposter/Esposter/commit/2a410877dc6d1bb0d0d363262115afa3b986e935))
* **genshin-world:** the bench's recipes are listed under one tab per combine type, named by the game's own text ([23fb281](https://github.com/Esposter/Esposter/commit/23fb281ac179e6567eb8e6cbc93e8b2044fe1566))
* **genshin-world:** the character screen's Attributes tab is scored against the 21:9 frame at 154.4 seconds, its roster names come from the name text, its panel shows the base five rows, name, level and bar, and its frame's band, tabs and foot are measured off the same frame ([8d28f4f](https://github.com/Esposter/Esposter/commit/8d28f4f254501a450136e480d641d3301954f285))
* **genshin-world:** the character screen's Profile tab lists each story by its title, opened at the Friendship Level its fetter gives and locked with the game's unlock line until then ([afccea2](https://github.com/Esposter/Esposter/commit/afccea2831c67bb0e15474db2d89c4e04fa345d3))
* **genshin-world:** the crafting bench's screen opens as an NPC screen, its recipe list and crafter pick over the bag and wallet, the craft rolling the crafter's talent ([36b7b17](https://github.com/Esposter/Esposter/commit/36b7b1785ae70a90e47238de5a8dd25ff91a7c93))
* **genshin-world:** the forge's Materials tab and the wish screen get their fixtures and references; forge mean 60.87% to 58.07%, wish 49.99%, both still over the bar ([8427fdb](https://github.com/Esposter/Esposter/commit/8427fdbc224c4109c62499e24d42ac1647e735f9))
* **genshin-world:** the handbook's Experience page in the wiki frame's pixels, its rewards on the interface's shared ItemTile; mean 8.28% to 5.18%, FLIP 0.3610 to 0.2456 ([dce6309](https://github.com/Esposter/Esposter/commit/dce630976e949b92e8dc2a68ab24a708ebdf275c))
* **genshin-world:** the medium bodies move by their clips' root motion in metres, at their avatar's human scale ([2aa8087](https://github.com/Esposter/Esposter/commit/2aa808741a06a84595f514e295d415c07f5b22b6))
* **genshin-world:** the Paimon menu's entries are Row buttons, and the world level dialog's close and adjust take the Plain and Pill kinds ([f02ce45](https://github.com/Esposter/Esposter/commit/f02ce4519f9b3b68ae1a6d2452b9cecc776cd9ca))
* **genshin-world:** the Profile tab shows the namecard a character's Friendship holds by its name, read from the name chunk the stat tables share ([aa5dcd6](https://github.com/Esposter/Esposter/commit/aa5dcd6d9d73a7008f506a441cc5963f10460c3c))
* **genshin-world:** the save's bag and achievements are bounded by the game's own counts, and its ceiling is the worst case of its caps ([69c8ccf](https://github.com/Esposter/Esposter/commit/69c8ccf1efd41ed5a7b0fbf3c31f34d011906a4a))
* **genshin-world:** the standard and beginners' pools as the wiki lists them, the wish screen lists the open banner's pool by rarity, and a set's results show a card each with its stars, the highest rarity first ([ed918e3](https://github.com/Esposter/Esposter/commit/ed918e37154c50dbccc3260de21296bcdc37d2e3))
* **genshin-world:** the world holds the player's bag, wallet and wish counters and opens the bag on B and the wish on F3 ([1f21e41](https://github.com/Esposter/Esposter/commit/1f21e412d066485babd2af05b21c066e661564d4))
* **genshin:assets:** the profile writes each playable character's voice-overs from the fetters table, and the Profile tab lists them after the stories ([04e6f58](https://github.com/Esposter/Esposter/commit/04e6f584a815bc45692e54428ab438d65e9b458c))
* **genshin:** the bag's full hint on a pick up it cannot take, a Fate bought with 160 Primogems on the wish screen, and the destroy rule for weapons and artifacts of up to four stars ([676da1d](https://github.com/Esposter/Esposter/commit/676da1d02ce8e3638643ba3ed7267e07372ada8a))
* **genshin:** the bag's sort is the game's dropdown on the equipment tabs, and its foot shows the Primogems and Mora on the rest, the food tab scored off the same recording at 58 seconds ([5604e45](https://github.com/Esposter/Esposter/commit/5604e45c12151697203542b7e07b18a46d0261cc))
* **genshin:** the character screen is a dialog with its way back, keeps the game's pointer, and each character comes with its own weapon ([6c4c158](https://github.com/Esposter/Esposter/commit/6c4c1584ca95d6afface1c5b394691c7de76f242))

### Performance Improvements

* **genshin-world:** the menu's, the quest's and the login's traces are written in their shortest form too ([7b64fc7](https://github.com/Esposter/Esposter/commit/7b64fc7210a219bd2f60dc4bd4744d66fe7f8e0d))
* **genshin-world:** the traced glyph paths are written in their shortest form ([8293d5a](https://github.com/Esposter/Esposter/commit/8293d5ae84076989cd2c9c9bf5f5d034e7e808f0))

# [4.0.0](https://github.com/Esposter/Esposter/compare/v3.9.0...v4.0.0) (2026-10-06)

### Bug Fixes

* **genshin:** draw the opening on the PC client's near white, judged on its 2023 recording ([28ade94](https://github.com/Esposter/Esposter/commit/28ade94c1eb7725f629f4a27548892d1ec622fe4)), closes [#fdfdfd](https://github.com/Esposter/Esposter/issues/fdfdfd)
* **genshin:** the engine's and interface's bundle sizes after the login's door sound ([ea7d9da](https://github.com/Esposter/Esposter/commit/ea7d9dadc254bd8ce363924b4c211a6cde955611))
* repair main's red — land the app's half of the Nuxt 5 migration ([5b7eb78](https://github.com/Esposter/Esposter/commit/5b7eb78387292e4a3e36520fd13f8fe9a9fcadef)), closes [#1423](https://github.com/Esposter/Esposter/issues/1423)
* repair main's red Lint job — eslint, oxlint and knip ([8934cc7](https://github.com/Esposter/Esposter/commit/8934cc7dba7e2692c6b1ae5d0af57b7d1ce48a3f))

### Features

* **genshin-interface:** lay the login out from the game's own RectTransform tree ([75c15b6](https://github.com/Esposter/Esposter/commit/75c15b64b01d84fefcc8b1d57b0659b55ec0cd5d))
* **genshin-world:** Windrise's sources in the game's data and in public recordings, found and written down ([1dbda49](https://github.com/Esposter/Esposter/commit/1dbda4955755b99518add4da17d888451c285e9c))
* **genshin:** a screen reader hears the game's own words for the loading marks and the login's buttons ([79d023a](https://github.com/Esposter/Esposter/commit/79d023a2d7bde3166b6480a4af2c2f06fd98acd9))
* **genshin:** the login's door sounds as it opens, its two sounds found in the game's first package and played as our own noise ([c8464ca](https://github.com/Esposter/Esposter/commit/c8464ca32d73917d3ae0797f9669053f6e1555c6))
* **genshin:** Windrise's ground is our hills fitted to the game's terrain, its water at the game's level, and the witness draws the statue, the oak and the tiles where the game's data stands them ([696c233](https://github.com/Esposter/Esposter/commit/696c233183daa4cbcedce17a7864901dac77037d))

# [3.9.0](https://github.com/Esposter/Esposter/compare/v3.8.1...v3.9.0) (2026-10-01)

### Bug Fixes

* **ci:** re-snapshot the genshin bundle sizes and unshare a derived-assets sentence ([3739c9d](https://github.com/Esposter/Esposter/commit/3739c9d344cedaeeda2359cd226dff1f83ea2c38))

### Features

* **genshin-assets:** the Unity transform module, and spawns at their anchors ([10a8c54](https://github.com/Esposter/Esposter/commit/10a8c5414e0d3718c0afb013d304f6d5bb3c26e8))

## [3.8.1](https://github.com/Esposter/Esposter/compare/v3.8.0...v3.8.1) (2026-09-30)

**Note:** Version bump only for package genshin-interface

# [3.8.0](https://github.com/Esposter/Esposter/compare/v3.7.0...v3.8.0) (2026-09-30)

### Bug Fixes

* **genshin-ui:** measure a RectTransform's position from its pivot's anchor point ([cf84203](https://github.com/Esposter/Esposter/commit/cf842033ac954cfd5c56e01106e0ddb10f54d1cb))
* **genshin:** a stretched rect keeps Unity's pivot, and the loading row and prompt ride in the login's foot ([9855c32](https://github.com/Esposter/Esposter/commit/9855c32f863ac7553f2ef92ced20785c70d23634))
* **genshin:** the door constants test typechecks and scopes its constants, and the size snapshots follow the build ([60d19ac](https://github.com/Esposter/Esposter/commit/60d19ac98860a29cc62a7b7d00c7854464b2adb6))
* main goes green — lint, knip, constant scope, stale names, duplicate prose and size snapshots ([e4884d9](https://github.com/Esposter/Esposter/commit/e4884d9acb940783203b60b376fb35b6b9f51b4d))

### Features

* **genshin:** the interface laid out where the game's RectTransforms anchor it, glyphs centred on their ink ([c11934b](https://github.com/Esposter/Esposter/commit/c11934b58af5c89a566d3ed03efbbe6014df21aa))
* **genshin:** the login interface's clips fitted to keyframes, and a player for them on the Web Animations API ([c57bb0e](https://github.com/Esposter/Esposter/commit/c57bb0ec93abe27b6e50bfb80c32c8d7262e3252))
* **genshin:** the login screen's flight and door, and genshin-ui for the game's interface ([b53f509](https://github.com/Esposter/Esposter/commit/b53f509c9dc04833338c71cd30206704d68f8bc5))
