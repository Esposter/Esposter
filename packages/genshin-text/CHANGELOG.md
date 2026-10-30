# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.4.0](https://github.com/Esposter/Esposter/compare/v4.3.3...v4.4.0) (2026-10-30)

### Bug Fixes

* **genshin-text:** six Mondstadt expedition places are keyed by the current text map ([2a34129](https://github.com/Esposter/Esposter/commit/2a3412957a72991b820bdd06d7acca18417be7b0))
* **genshin-text:** the text writer formats each generated file through the formatter's API, so the copies are the formatter's form ([dc83856](https://github.com/Esposter/Esposter/commit/dc838561142a5ab6eb22352d14668f41f203b7e4))
* **genshin-world:** a quest chapter's number sits on the row's right, and three stale comments say what their code does ([51f4d1b](https://github.com/Esposter/Esposter/commit/51f4d1baedd594593437ab51b5ab9c2f9caf9ca4))
* **scripts:** only the Dialog table's text hashes are flipped to the text map's key, and the general fallback is removed ([6a7f538](https://github.com/Esposter/Esposter/commit/6a7f5386ef3423e0a23bd891f82bfc1680d1a833))

### Features

* **genshin-text:** add ten game text keys for the wish, the duel, the bag and friends ([34d96fd](https://github.com/Esposter/Esposter/commit/34d96fd44745c3abcaf9d0c6dc638853dcc21029))
* **genshin-text:** an expedition place's description is a game text key, as its name is ([67f33fa](https://github.com/Esposter/Esposter/commit/67f33fa947a27a06577e4b10bed7565e856975c7))
* **genshin-text:** the Artifacts panel's Fast Equip and Artifact Details buttons are keys ([63ef27c](https://github.com/Esposter/Esposter/commit/63ef27c085b2d19403c11655b4b97ac617c59097))
* **genshin-text:** the forge queue's finished-order words are keys, and the time remaining reads the forge's own id ([2a5d08f](https://github.com/Esposter/Esposter/commit/2a5d08f65e402619eaedc8399751a3e7b0bd4857))
* **genshin-text:** the map's switch that shows only the domains is a GameTextKey ([6d8ef44](https://github.com/Esposter/Esposter/commit/6d8ef4486523a6a6ddd5334970a43ff659622594))
* **genshin-text:** the party screen's Deployed and Elemental Resonance, the Archive's unlocked-entries counter, Filter and New ([85617c3](https://github.com/Esposter/Esposter/commit/85617c3e65747299ac8550d5c4f7b70b90a0ef5f))
* **genshin-text:** the refinement tab's Current and Next Rank rows ([e001a3c](https://github.com/Esposter/Esposter/commit/e001a3cdd61ecc0b8a925e067745d7da5588a3de))
* **genshin-text:** the Spiral Abyss benediction screen's tags and title, the element names and the attributes panel's level are keys ([7c578c1](https://github.com/Esposter/Esposter/commit/7c578c135e5b4fb46d6a7d77018667a2d74e0061))
* **genshin-text:** the weapon screen's words and the weapon type names, and thirteen keys filed at an older build's hash move to the text map's key ([8c3c2a2](https://github.com/Esposter/Esposter/commit/8c3c2a2551202bc2a416793a307e505c47fa38e0))
* **genshin:text:** the loading screen's download, failure and retry lines are game text keys ([779fb50](https://github.com/Esposter/Esposter/commit/779fb503e9855fa70f257a82cd6969f0a07bf307))

## [4.3.3](https://github.com/Esposter/Esposter/compare/v4.3.2...v4.3.3) (2026-10-22)

**Note:** Version bump only for package genshin-text

## [4.3.2](https://github.com/Esposter/Esposter/compare/v4.3.1...v4.3.2) (2026-10-21)

**Note:** Version bump only for package genshin-text

## [4.3.1](https://github.com/Esposter/Esposter/compare/v4.3.0...v4.3.1) (2026-10-21)

**Note:** Version bump only for package genshin-text

# [4.3.0](https://github.com/Esposter/Esposter/compare/v4.2.0...v4.3.0) (2026-10-21)

### Bug Fixes

* **genshin-text:** Jump and a quest's distance read 7.1's own lines, since its manual text map dropped the minigame's two ([d4dfc90](https://github.com/Esposter/Esposter/commit/d4dfc9082fed6625df47cc53fa2bd1397168bdb0))
* **genshin-text:** the GameTextKey members sit in alphabetical order, and the persona's copy follows ([4f7d386](https://github.com/Esposter/Esposter/commit/4f7d386e603c3269aab362338b766a3d1e5e5119))
* **genshin-text:** the Long-Term Encounter Points key names only the stored count the stage rewards show ([fc87923](https://github.com/Esposter/Esposter/commit/fc87923e64aaa0bde1f9d102e874e42986291ba0))
* **genshin-text:** the mail screen's keys are only the ones it uses ([b59acd5](https://github.com/Esposter/Esposter/commit/b59acd5c9797cd80513d35f1d1b6112aca97b7cd))
* **genshin-text:** the set-bonus and revive comments sit above the keys they describe ([c3a28e2](https://github.com/Esposter/Esposter/commit/c3a28e26c9c28f9cd0a5b106327f6ceada6c9310))
* **genshin:** the merged wave typechecks and follows lint ([b073f71](https://github.com/Esposter/Esposter/commit/b073f717b477ec27fd03d3ae73e0d52c83514ab2))

### Features

* **agent-console:** apply element palette to sheet ([9c00ed0](https://github.com/Esposter/Esposter/commit/9c00ed0f442d93f72a06f66bd3fb22c3c713f91f))
* **genshin-interface:** the Artifacts panel shows the five slots, the picked slot's name, the set block and its actions ([e2fea3e](https://github.com/Esposter/Esposter/commit/e2fea3e608ef78574462d0508621571066b08a83))
* **genshin-mail:** the Gift Mail Box's own Delete asks first with the game's warning, and removes that one mail ([517d79d](https://github.com/Esposter/Esposter/commit/517d79d509cd65acae059fc85e70cbd6cd38b525))
* **genshin-text:** the Controls tab's camera rows and Actions keys have their text ids ([696e9a4](https://github.com/Esposter/Esposter/commit/696e9a433d4e2964f43fbaa79561ec52a3ba140f))
* **genshin-text:** the domain's leave prompt and action, and the Petrified Tree, have game text keys ([dddf42e](https://github.com/Esposter/Esposter/commit/dddf42ed3eecf100209784e9f71d47044ae15931))
* **genshin-text:** the expedition text keys hold only the words the screen reads, without the unused Close key ([7308803](https://github.com/Esposter/Esposter/commit/73088038c80619037afa13477e2dfdb51be4e12a))
* **genshin-text:** the Mondstadt bounty copy has its game text keys ([845a054](https://github.com/Esposter/Esposter/commit/845a054679cda3fbf7075135a6b765e93ee48e54))
* **genshin-text:** the Mystic Offering's words are GameTextKey members ([e17d7fa](https://github.com/Esposter/Esposter/commit/e17d7faf7bc26215666698204415db01b6951090))
* **genshin-text:** the quit prompt's Continue Game key goes with its choice ([27518a2](https://github.com/Esposter/Esposter/commit/27518a21a5de0ff74076e7704234500b6ace4299))
* **genshin-text:** the realm's refusal notices, its placement word, the Serenitea Pot and Tubby are game text keys ([7edfac8](https://github.com/Esposter/Esposter/commit/7edfac89921f18750a94b6e401d842ab80d514e3))
* **genshin-text:** the Reputation request's accept button has its own key, REPUTATION_REQUEST_BUTTON_1 ([2ce8c36](https://github.com/Esposter/Esposter/commit/2ce8c3670c8ef56043ee54f1d7af77cbb86e2b89))
* **genshin-text:** the Settings screen's three new labels have their text ids ([3fccb59](https://github.com/Esposter/Esposter/commit/3fccb59c2e3865b77560aa5606b5b028429652fc))
* **genshin-text:** the Sheer Cold gauge is named by its own text, and the bar is labelled with it ([c78d001](https://github.com/Esposter/Esposter/commit/c78d001e331c0074a5dd99000eed6abf93543441))
* **genshin-text:** the weapon screen's three action labels are keyed by their equipment-page text ids ([8c1a777](https://github.com/Esposter/Esposter/commit/8c1a7779fadbd3d7546c015e2d97a18c0b491fee))
* **genshin-text:** WishGoToTrial names the game's "Go to Trial" (UI_REUNIONV2_GOTO_AVARTARTRIAL) ([9e65b14](https://github.com/Esposter/Esposter/commit/9e65b1488451856942e7332f848df4bb0b3f7da1))
* **genshin-world:** a buried chest offers Dig at its place and appears once dug ([484a9ec](https://github.com/Esposter/Esposter/commit/484a9ec8a958967f5dc07e2f88327f14b25ddb1e))
* **genshin-world:** a city vendor's talk opens their shop, and the Shop screen buys its goods ([26c8574](https://github.com/Esposter/Esposter/commit/26c85748cf819e390d49eedeb5de3872e15ec33f))
* **genshin-world:** a dealt commission is claimed and a Long-Term Encounter Point converted from the handbook's Commissions tab ([01552cd](https://github.com/Esposter/Esposter/commit/01552cdf2ebc061648be4043484895f528653299))
* **genshin-world:** a defeated normal boss leaves a Trounce Blossom that its claim pays, and the boss returns after the claim or a teleport ([2e2c350](https://github.com/Esposter/Esposter/commit/2e2c350f0d90054357ac36708b1611e0ef4b3dd8))
* **genshin-world:** a domain's screen lists its levels and F opens it at an unlocked entrance ([d869cd5](https://github.com/Esposter/Esposter/commit/d869cd5b1f6ec126c8a4cad7daf5d65527b74e14))
* **genshin-world:** a fallen team opens the game over screen, and the HUD asks for the next member after a fall ([80cd18a](https://github.com/Esposter/Esposter/commit/80cd18a0bc253ddf9ab8b01cdba7bd6223319240))
* **genshin-world:** a fishing point offers its Fishing prompt once fishing is open ([31bf438](https://github.com/Esposter/Esposter/commit/31bf4383bc12a237745768c7324b0e5356b76214))
* **genshin-world:** a starred mail goes to the Gift Mail Box, which keeps it from expiry and from Delete Read ([2079aa9](https://github.com/Esposter/Esposter/commit/2079aa906e5710d2d594da7fd5db7c5fd6c486bb))
* **genshin-world:** a Teleport Waypoint or a domain entrance is unlocked by interacting with it, and an unlocked waypoint is offered as a jump and a place to revive ([e5ecaa5](https://github.com/Esposter/Esposter/commit/e5ecaa5c4dbd6b46746333b91cdc53c730d3ac94))
* **genshin-world:** a waiting outcrop is touched within reach, its cleared blossom is offered to claim, and the claim pays and moves it on ([ab18925](https://github.com/Esposter/Esposter/commit/ab18925504423e93d36e6669232fcaaedc65cd10))
* **genshin-world:** a weekly boss's domain is a Trounce entrance, named by its own title ([306535e](https://github.com/Esposter/Esposter/commit/306535ede06a3381be3c4cde4a8b862edff7ddaf))
* **genshin-world:** an artifact's lock is toggled on the Artifacts tab, saved on the artifact ([3ffdff5](https://github.com/Esposter/Esposter/commit/3ffdff55b50311ef1e587e2f33853bf76a312661))
* **genshin-world:** an opened mail shows the date it was received, in the reader's locale ([98356d1](https://github.com/Esposter/Esposter/commit/98356d15285ad8ae4e8660d0798f586c06b0f2bd))
* **genshin-world:** Delete Read asks first, with the game's own confirm and a Cancel that keeps every read mail ([6baa145](https://github.com/Esposter/Esposter/commit/6baa1453580559bd8030f41140d8793b2328ad83))
* **genshin-world:** Delete Read removes the read mail with nothing left to claim, keeping pinned mail ([0526810](https://github.com/Esposter/Esposter/commit/0526810760fa3e3bf70dfd1c0c6728f5a2fb51cf))
* **genshin-world:** Details opens the attributes past the summary in the game's three groups, each under its own title ([d84fd27](https://github.com/Esposter/Esposter/commit/d84fd277c56b8e19c64d6c38bc112866cfcb49fd))
* **genshin-world:** Enhance opens the fodder picker of the bag's artifacts and EXP ores, with Auto Add, the level reached and the Mora (task 6.2) ([af17d9b](https://github.com/Esposter/Esposter/commit/af17d9b280fe9d5f9b21b454049a4635b9b09da7))
* **genshin-world:** F on a resonated statue opens the Statue's Blessing ([ce1efe9](https://github.com/Esposter/Esposter/commit/ce1efe9f95f24388f5a955cbfe8eeba0cdbd535e))
* **genshin-world:** holding Z draws the quick swap menu over the world's centre ([8224833](https://github.com/Esposter/Esposter/commit/8224833352e521351fe6a412266396bd45ee00f7))
* **genshin-world:** Level Up raises a character one level with the Character EXP materials it holds, taking Mora for their EXP ([08d8851](https://github.com/Esposter/Esposter/commit/08d88512e2ddcbf7f7c3338c7d538172a886870a))
* **genshin-world:** Luxurious and Remarkable chests pay the wiki's other rewards and no Mora ([81592da](https://github.com/Esposter/Esposter/commit/81592da8bb229a93ec6df550dd199219c85e596c))
* **genshin-world:** Masterless Stella Fortuna lifts a character from level 90 to 95 and from 95 to 100, at once ([db411ba](https://github.com/Esposter/Esposter/commit/db411ba8d78e53d5fbd3cf792d76a9e881d3f829))
* **genshin-world:** opening a chest adds its Sigils to the wallet, as the region's own Sigil currency ([fa27b6d](https://github.com/Esposter/Esposter/commit/fa27b6d4e7ca07408bb27197e29c502246418975))
* **genshin-world:** Paimon's Bargains opens from the Paimon menu's Shop entry on its own screen ([a4e6335](https://github.com/Esposter/Esposter/commit/a4e6335baa031d67e428c89bc6c15da2b5603000))
* **genshin-world:** Party Setup shows the deployed team's four slots with arrows, Deploy, Configure Team and Quick Setup, and the menu's Party Setup slot opens it ([9691b72](https://github.com/Esposter/Esposter/commit/9691b72060db2fce319fc9c43700466c0cc81d58))
* **genshin-world:** Realm Currency is held in the wallet, filed under item 204 and named by its game text key ([e3263f6](https://github.com/Esposter/Esposter/commit/e3263f60d3f8da0267b877b89faf45ccca64d616))
* **genshin-world:** the Abyss's entry shows the period's blessing and a chamber's Benediction screen offers its choices, read from the name text ([776eebe](https://github.com/Esposter/Esposter/commit/776eebe5657226c88efcb6865e80beb338c23228))
* **genshin-world:** the Artifacts panel draws each set bonus as its line and the picked artifact's stats ([ddaa7a2](https://github.com/Esposter/Esposter/commit/ddaa7a2f2d2d4ff5e8805efbf8905a1f11ce12ae))
* **genshin-world:** the Attributes tab lists the next ascension's Adventure Rank, Mora and materials held against them, and Ascend is disabled while short ([0935900](https://github.com/Esposter/Esposter/commit/093590087deb788fd2b5397ddc56eb205357d667))
* **genshin-world:** the bag's gadget tab equips an equipable gadget to the quick-use slot ([2726b18](https://github.com/Esposter/Esposter/commit/2726b18d5cab45a59c100d2d3829a5074eee0db7))
* **genshin-world:** the bench's conversions craft with their catalyst, under tabs of their own ([990661b](https://github.com/Esposter/Esposter/commit/990661bc5af8c980bc6bc3388d532760b8b8eb86))
* **genshin-world:** the claim prompt restores Original Resin with a Fragile Resin when no claim is affordable ([95bfe0e](https://github.com/Esposter/Esposter/commit/95bfe0edb9bf73aed5859ada1d6ae51e5974f1d3))
* **genshin-world:** the Commissions tab lists the day's four with their regions ([8f9b9a2](https://github.com/Esposter/Esposter/commit/8f9b9a2e6b92e972e036273a24ef864b36a4262c))
* **genshin-world:** the Constellation tab's Activate spends a Stella Fortuna on the next constellation, and a duplicate's Stella Fortuna reaches its character as the draw lands ([c02d599](https://github.com/Esposter/Esposter/commit/c02d59988c186660257eadc292e6144113cd5f10))
* **genshin-world:** the cooking indicator lays its zones out from each recipe's parameters ([ec8a3ad](https://github.com/Esposter/Esposter/commit/ec8a3adb3c87e03ab6048ed0aff2f7604b91da14))
* **genshin-world:** the cooking pointer sweeps, Stop cooks where it stands, and the stove opens processing ([2c049bc](https://github.com/Esposter/Esposter/commit/2c049bcd1db451beb86f25030809a06382d86354))
* **genshin-world:** the expedition screen opens over the world, listing Mondstadt's open places and sending, claiming and recalling expeditions ([5b9e7c4](https://github.com/Esposter/Esposter/commit/5b9e7c48485870f6b492a394e80dcfd68a2e038e))
* **genshin-world:** the handbook's Domains tab lists each domain with Quick Challenge or Claim Rewards, and a weekly boss's highest-tier clear marks its first clear to claim ([55ec304](https://github.com/Esposter/Esposter/commit/55ec304c3e88dee093f58796ab5edfd473b122a3))
* **genshin-world:** the map's zoom slider is a group named by the game's own word for Zoom ([d9734a1](https://github.com/Esposter/Esposter/commit/d9734a13ff9aa626e22525af6d8b86965e38c08b))
* **genshin-world:** the Paimon card shows the account's name and avatar, or the default name ([a4a5545](https://github.com/Esposter/Esposter/commit/a4a554570e7cbf1dec0cf431ab247e1509482e1c))
* **genshin-world:** the Paimon entries wait on their rank, and the World Level button opens its prompt ([0cafba7](https://github.com/Esposter/Esposter/commit/0cafba7abfd260de714826f28717b5e09f96c14c))
* **genshin-world:** the profile card sets the Traveler's birthday once, through a Set Birthday dialog ([19642c8](https://github.com/Esposter/Esposter/commit/19642c8e55790e1ef699a21ed75131d606ac1ada))
* **genshin-world:** the quit prompt draws the current build's two choices over the dimmed menu ([d9ecd8b](https://github.com/Esposter/Esposter/commit/d9ecd8b0757b5cf75bf42e4f3f3c2cfe3e8521b2))
* **genshin-world:** the Realm Depot's goods are grouped into its tabs, named by their game text ([f9deee4](https://github.com/Esposter/Esposter/commit/f9deee41425c9689846ecc436d75491929c3323b))
* **genshin-world:** the stove lists the dishes the cook knows, an instruction in the bag teaches its dish, and Auto Cook is offered at full proficiency ([ecb2529](https://github.com/Esposter/Esposter/commit/ecb25292448dbb4ea002807d2aa43be5aa722117))
* **genshin-world:** the Talents tab shows each combat talent's next level and presses its upgrade ([b76473c](https://github.com/Esposter/Esposter/commit/b76473c07a0a643a658233a15359fa6e29ce19e9))
* **genshin-world:** the ten Shrines of Depths of Mondstadt are placed from the map and opened with a key of their region ([b4fb9c3](https://github.com/Esposter/Esposter/commit/b4fb9c321311b9ea929c16b44ce901e8280652f9))
* **genshin-world:** the Time screen draws its dial, the hour it points at and Confirm, and a dragged pointer dials the advance ([4d33fac](https://github.com/Esposter/Esposter/commit/4d33fac9e530b9aca391d1f8898d27b496dcb3e1))
* **genshin-world:** the world shows each tutorial tip once per save ([4016ba5](https://github.com/Esposter/Esposter/commit/4016ba573b2b95367cd09304bb7f357899b94d1e))
* **genshin-world:** Unequip into a full artifact tab shows the artifact inventory's own notice (task 6.2) ([c00bf7a](https://github.com/Esposter/Esposter/commit/c00bf7a3a1fefbdc97afbf7e94e4214f765acf57))
* **genshin-world:** Unequip with a full bag shows the game's "Inventory full" notice and leaves the piece worn (task 6.2) ([4305324](https://github.com/Esposter/Esposter/commit/43053247529a6350b9e58228941d882c97487c94))
* **genshin-world:** using a food from the bag eats it and applies its heal to its target within the party's health ([dfbf56d](https://github.com/Esposter/Esposter/commit/dfbf56d6a895cf1de59fed33420b4d649a84976e))
* **genshin:** the mail text is published per language, and the Mail screen's words are named ([12f61fd](https://github.com/Esposter/Esposter/commit/12f61fdb7007a84bfe872fa1d77744eee0de9141))
* **genshin:** the namecard picker is titled by the game's Change Namecard ([8fd2d95](https://github.com/Esposter/Esposter/commit/8fd2d95aa903fea64a92e0f768c046b9678f4e2e))
* **genshin:** the Worship Statue offers held Oculi and claims each reached level, and F on a resonated statue opens it ([841a5e5](https://github.com/Esposter/Esposter/commit/841a5e5fb41db27621ff100b95952cf13583523d))

# [4.2.0](https://github.com/Esposter/Esposter/compare/v4.1.2...v4.2.0) (2026-10-14)

**Note:** Version bump only for package genshin-text

## [4.1.2](https://github.com/Esposter/Esposter/compare/v4.1.1...v4.1.2) (2026-10-14)

**Note:** Version bump only for package genshin-text

## [4.1.1](https://github.com/Esposter/Esposter/compare/v4.1.0...v4.1.1) (2026-10-14)

**Note:** Version bump only for package genshin-text

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
