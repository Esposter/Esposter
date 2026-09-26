# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.4.0](https://github.com/Esposter/Esposter/compare/v3.3.0...v3.4.0) (2026-09-26)

### Bug Fixes

* **agent-console:** nothing asks the loopback for a host before pairing, and the host tells no site it is there ([cd64c61](https://github.com/Esposter/Esposter/commit/cd64c61cb2c12ae64ae5c3a2e0fd3aa8d4277db0))
* **auth:** a server read of the session forwards the extended cookie, so an active reader stays signed in ([a72fec2](https://github.com/Esposter/Esposter/commit/a72fec28c50998cca2f7d10a1bdae9c608254a71))
* **resource:** the storage meter takes a line of its own under the trail instead of drawing over it ([6d7194a](https://github.com/Esposter/Esposter/commit/6d7194a06eb2a777d1fa01fdf73682443ea78b05))
* **ui:** a slash shortcut is spelled by its alias, and every shortcut in source is proven to bind ([dfe726c](https://github.com/Esposter/Esposter/commit/dfe726c58717db13c7549cdd47b5eb36f64e4c90))
* **ui:** the edit form dialog awaits its save with Save pending ([2200043](https://github.com/Esposter/Esposter/commit/2200043afe0e276ef863ac10068124e09cb6efd0))
* **virrun:** a WSL that will not start sends the run native instead of failing it, and says why ([a8dffb6](https://github.com/Esposter/Esposter/commit/a8dffb6f2fbb98698340fffbe679cbd25a4faafa))

### Features

* **ui:** readable text sets all of voxel's text in the system's faces, headings and code included ([42f9af7](https://github.com/Esposter/Esposter/commit/42f9af7125e0a713732f1a7978b9833afdbd042f))

# [3.3.0](https://github.com/Esposter/Esposter/compare/v3.2.0...v3.3.0) (2026-09-26)

### Bug Fixes

* **about, privacy-policy, login:** links in the link colour, and the sign-in heading names the site once ([b30dda9](https://github.com/Esposter/Esposter/commit/b30dda9c7f82bbe1589a58a12cec1cbfec883c52))
* **agent-console:** a browser without notifications is checked by type, so the hidden-tab ping cannot throw ([091914d](https://github.com/Esposter/Esposter/commit/091914de422af1cf7909f5400bf73f1262d3f165))
* **agent-console:** a closed session leaves the host at once, and a pasted non-URL is refused ([7adae26](https://github.com/Esposter/Esposter/commit/7adae26dacf25fe6551cd62ecfcc15c7ad0f8041))
* **agent-console:** a figure's template ref reads the Three object, not its dev-only readonly proxy ([1a3db3b](https://github.com/Esposter/Esposter/commit/1a3db3b85c5be87d4a446b02103c292469c51443))
* **agent-console:** a jump clears a one-voxel step, as Minecraft's does ([61a7a0d](https://github.com/Esposter/Esposter/commit/61a7a0d2a3e22b419ee4a1ef967312b634954a07))
* **agent-console:** a resumed session merges each file's changes from where it started ([149cdb3](https://github.com/Esposter/Esposter/commit/149cdb31c22c244dfdb3a437ff2f353ea070c0e0))
* **agent-console:** finish moving the prompt from images to attachments ([fd5dcfb](https://github.com/Esposter/Esposter/commit/fd5dcfb7dcec3080437a3210f824cca5f0df8356))
* **agent-console:** only the chat replies take a pointer, not the strip under the world ([16299cb](https://github.com/Esposter/Esposter/commit/16299cbf7e286b5258250f0eb862cce0b7812047))
* **agent-console:** pairing overlays the room as a centred title screen ([e4a982a](https://github.com/Esposter/Esposter/commit/e4a982a105406cde120951b84c6f824b0d3c99e1))
* **agent-console:** read a UTF-16 text attachment by its byte order mark ([9b5e1d1](https://github.com/Esposter/Esposter/commit/9b5e1d14bc9da7075a57b22a2450085aeebea6d0))
* **agent-console:** repair main's reds — the host package the queue rewrite dropped, restored with the fixes it already had ([6f6868b](https://github.com/Esposter/Esposter/commit/6f6868b98eb0192b45af12a9744f21d668f6cc22))
* **agent-console:** the agent's markdown lists show their markers again under the reset ([cd3b6b2](https://github.com/Esposter/Esposter/commit/cd3b6b217cf6db727de47cd51f6e7e5882a4f73a))
* **agent-console:** the door's prompt outlines the panel as drawn ([7645839](https://github.com/Esposter/Esposter/commit/764583900e1611f8e6878934e731c1f7929e744c))
* **agent-console:** the launcher lists the console, and its header is the shared page header ([d5ff6c2](https://github.com/Esposter/Esposter/commit/d5ff6c23a8ce7829dad6fe2de30debaea7a4814a))
* **agent-console:** the notification check asks the window for the API, which the optional-chain rule accepts ([0f34d4c](https://github.com/Esposter/Esposter/commit/0f34d4c3a4fb821307c02f1e43d168ec36c79ae4))
* **agent-console:** the page's grid uses the canonical rows-/cols- spellings ([da38c43](https://github.com/Esposter/Esposter/commit/da38c430d7236dcfb7b35ac6560bc34c70605c4b))
* **agent-console:** the root lint passes — no loops in the input queue, one close path, the mapper's call named apart from Array.map ([55b1d78](https://github.com/Esposter/Esposter/commit/55b1d78cc1a56a1955c16ed6092e5d94edef057c))
* **agent-console:** the terrain and theme files pass the root lint ([3b3257b](https://github.com/Esposter/Esposter/commit/3b3257bfe0720e944f77a66b3f33872345f7282a))
* **agent-console:** unpair clears the room, and the host's controls leave the sessions panel ([a7cd15f](https://github.com/Esposter/Esposter/commit/a7cd15fc9f96cb879d4b3b946a44cd13c45dbf01))
* **app:** a docs page takes its section's icon, and every page names itself ([0739894](https://github.com/Esposter/Esposter/commit/07398946c08c5023df67b17896598197b61246ab))
* **app:** a place is named by its product, and the settings are one ([86dea2d](https://github.com/Esposter/Esposter/commit/86dea2d316df1086d3d8dc30863d1ea216571f7e))
* **app:** each design style is listed under a mark of its own, shapes for standard and a cube for voxel ([c03fd1d](https://github.com/Esposter/Esposter/commit/c03fd1d02c3e2fcadaf6d72bf8f2d8cefbea0d64))
* **app:** polyfills run from head scripts ahead of the bundle, so iOS hydrates ([41e4a75](https://github.com/Esposter/Esposter/commit/41e4a752f55f135e5a147ff04acc9538faf07d36))
* **app:** Temporal is polyfilled where the browser has none, so iOS hydrates again ([6335693](https://github.com/Esposter/Esposter/commit/6335693b4e73c5ad0258dc6042055151957d0afb))
* **auth:** an account is unique on its provider and the provider's id ([26fb66c](https://github.com/Esposter/Esposter/commit/26fb66cd3024d503dc28652b9ea020a4c44cca16))
* **call:** a rejected disconnect on leave is reported, so it cannot strand the leaving flag ([e9655d1](https://github.com/Esposter/Esposter/commit/e9655d1160206653ff82b7cf72accc7ba3c3284f))
* **calls:** the picture-in-picture window carries the root's attributes ([097125d](https://github.com/Esposter/Esposter/commit/097125d60e1d03c688fcb7c93471165bf01e0fa8))
* **ci:** repair the red coverage shards on main ([4c0ddf6](https://github.com/Esposter/Esposter/commit/4c0ddf6c4beba96b52deeca564293763cdc80270))
* **ci:** repair the reds main 4896738 left in lint and coverage ([b9660f7](https://github.com/Esposter/Esposter/commit/b9660f7fd7a6c45d3328fd78ccb56ed6e2112110))
* **ci:** the queue's five reds — six snapshots the collapse reached, two restated runs, one bundle size ([a32187d](https://github.com/Esposter/Esposter/commit/a32187d6caf7c14865ce93551a89c255eacce243))
* **clicker:** a bought upgrade closes its details, and a purchase the player cannot pay for is refused by the store ([52d9d65](https://github.com/Esposter/Esposter/commit/52d9d652e541f4715102ad6a86c6674c8cbf1a23))
* **codemirror:** the language patterns alternate with the regex's own bar, not the id separator ([8bec106](https://github.com/Esposter/Esposter/commit/8bec106806383978c257323c13f309b76d375a55))
* **coderabbit:** a release the bot rates not at all is judged, never held ([95c627f](https://github.com/Esposter/Esposter/commit/95c627f6d6511a67706cad0daea18653304fe462))
* **coderabbit:** the collector is never blocked by what it carries ([0414327](https://github.com/Esposter/Esposter/commit/0414327a782f3a9c7b169d67b438231fdea3492d))
* **coderabbit:** the drain opens on every body bucket a review states, the minor one included ([511ff4d](https://github.com/Esposter/Esposter/commit/511ff4d937aaa904c667cf0dc2a3fb5768808855))
* **coderabbit:** the fixes branch is replayed onto develop before the port ([1867ab1](https://github.com/Esposter/Esposter/commit/1867ab1030f4019d20ac93e21d04215f2d5b9a0e))
* **coderabbit:** the replay keeps a commit the target absorbed as an empty copy, so the resolver's check reads it as carried ([be38788](https://github.com/Esposter/Esposter/commit/be38788e67c03bb74b72f1b755966e19b3ad0854))
* **coderabbit:** the skipped-head verdict reads the whole diff, a merge's resolution included ([dfcb971](https://github.com/Esposter/Esposter/commit/dfcb9716994d8540835f62ee0fd211e2648e36d6))
* **collector:** a ported commit is matched by its whole lineage, every attempt names the collector's source, and a red express cut is capped per main head ([ac82108](https://github.com/Esposter/Esposter/commit/ac8210881a45f779297db10ed1c3ddf0050b8ce5))
* **collector:** a repair records the collector that made it, so a streak past the cap is one collector's ([e753309](https://github.com/Esposter/Esposter/commit/e753309e4c64e176bc26101f7cdc7940ff443efa))
* **collector:** fold a main the clean release conflicts with instead of failing its merge ([063404e](https://github.com/Esposter/Esposter/commit/063404e29647b78f0d32df36553cf180a2500a21)), closes [#1219](https://github.com/Esposter/Esposter/issues/1219)
* **collector:** judge the release ahead of the account's limit ([ba48460](https://github.com/Esposter/Esposter/commit/ba4846071415b4fd226b1a63bfc26a17bbc3e7b3))
* **collector:** reconcile after release merge ([ed4d9b0](https://github.com/Esposter/Esposter/commit/ed4d9b0af16acae4273373e193ceda0068ae0fb7))
* **collector:** the express cut lands unverified, and the window carries a claim a later commit builds on ([260520e](https://github.com/Esposter/Esposter/commit/260520e214051fe532f8cb507f4d6aa518312f0a))
* **dashboard:** a visual whose save fails is put back into its own dashboard ([849f898](https://github.com/Esposter/Esposter/commit/849f89815e5d79d95543eebae4860e30779aaa29))
* **dashboard:** a visual's dataset binding takes the source picked last ([7a170ba](https://github.com/Esposter/Esposter/commit/7a170ba6443b98622670ea1075f7d864c0097b8c))
* **dashboard:** nothing pressed in a tile's corner reaches the tile ([d73b259](https://github.com/Esposter/Esposter/commit/d73b2595de6f226c69d3c3f18572f310d0b47c0b))
* **dataset:** a provider type's sources are filed under that type, so a late read cannot relabel them ([560c0ac](https://github.com/Esposter/Esposter/commit/560c0ac5c04ea256bf00107d92add21aa700b69c))
* **docs:** answer main's duplicateProse and staleNames reds ([b55b7c0](https://github.com/Esposter/Esposter/commit/b55b7c0b4ce9d7c69d60947250fabb89d835f41c))
* **docs:** answer the release review's minor findings ([f206d84](https://github.com/Esposter/Esposter/commit/f206d84869ac62e9e1342fccb2034e9bf4373de9))
* **docs:** two restated runs of prose each become a pointer to their owner ([4f74b44](https://github.com/Esposter/Esposter/commit/4f74b44d4f7af7c50fd29e250dcc54026a579db5))
* **dungeons:** Direction keeps grid-engine's member names, since TypeScript treats two enums as one only when the names match too ([66e2679](https://github.com/Esposter/Esposter/commit/66e26798cd6b9e9e02a0d4c1534c877e448e81c8))
* **dungeons:** every id lookup hands out a copy of the definition it found ([0657fd1](https://github.com/Esposter/Esposter/commit/0657fd1ca59a3c8a2ebfff27109cd3b8ef0529d5))
* **dungeons:** getItem and getMonsterData hand out copies, so no caller can write onto the shared definitions ([fac0ccb](https://github.com/Esposter/Esposter/commit/fac0ccb779fd7b39caff11ccef5bf1fa3695d59e))
* **dungeons:** the remaining option grids pass isWrapping ([164763b](https://github.com/Esposter/Esposter/commit/164763b43d107997035740c31676aa791b8eb35d))
* **dungeons:** tilemap layers enter the world store raw, as the tilemap does ([5fe2a1a](https://github.com/Esposter/Esposter/commit/5fe2a1a84180f891c4034fb3166846d9f9350af0))
* **dungeons:** using an item unwinds every scene stacked above the battle ([3707081](https://github.com/Esposter/Esposter/commit/37070818930c57fde224495eb99da464a18819bf))
* **email:** a failed compile warns the author that the published view keeps the last html ([0c8d053](https://github.com/Esposter/Esposter/commit/0c8d053a2084abf52ec21fd93a2e67c2ce4e6064))
* **email:** the editor names its email before the editor's await, so a swap mid-setup cannot clear the next email's staged export ([83c0c8c](https://github.com/Esposter/Esposter/commit/83c0c8c4fd76376f18560a193a4a3b14683457e9))
* **esbabbler-call:** a call's connection reads its status off metadata of its own, not an Item's dropped color ([a50f475](https://github.com/Esposter/Esposter/commit/a50f475c920db8e58eb5b2a1e6c97d1dee92783c))
* **esbabbler-call:** a force mute from another room no longer marks the user muted in their own call ([d9f9e96](https://github.com/Esposter/Esposter/commit/d9f9e96a7a7f9557df45f38570b0e6bb9956c79a))
* **esbabbler-call:** the knock stream rejects anyone but the call's doorkeeper ([6f0a627](https://github.com/Esposter/Esposter/commit/6f0a6279486313b2b64967e182fd3ce94e6a2be6))
* **esbabbler:** a file's options menu downloads from the file's url again ([29bd876](https://github.com/Esposter/Esposter/commit/29bd876f8d911d16bc9a5cc66d4a5008543f1153))
* **esbabbler:** a page's metadata is read and filed under the room the page was read for ([18d3544](https://github.com/Esposter/Esposter/commit/18d35446565996c801fa6e497ce0e62581073e5d))
* **esbabbler:** a read marker of its own, so marking a room unread can no longer reset the slowmode clock ([e23af3c](https://github.com/Esposter/Esposter/commit/e23af3c9b93935515c1653e5ac43561f6d664fb0))
* **esbabbler:** a soft-deleted message is absent to every point read ([1b9071f](https://github.com/Esposter/Esposter/commit/1b9071f485eb10ee8210c0fe134da780728d54e3))
* **esbabbler:** a thread pane message reads its files, reply preview and reactions from its own room ([9fbc7c7](https://github.com/Esposter/Esposter/commit/9fbc7c746581e230a6dce4e5828fe0a0f070927d))
* **esbabbler:** a thread reads its replies' metadata, and the media viewer walks the clicked message's room ([0e95c9a](https://github.com/Esposter/Esposter/commit/0e95c9a2ece629987c1363eb7016ddc143c9ce95))
* **esbabbler:** a thread's read is handed to its store, so the store no longer closes a module cycle through the file store ([f4a824a](https://github.com/Esposter/Esposter/commit/f4a824af44ea6edd3a138e0735260f30099773af))
* **esbabbler:** a typing event names the session's user, not the input's ([4d67b49](https://github.com/Esposter/Esposter/commit/4d67b49ed6a9a5590d74e4094cd7fc54daf55d97))
* **esbabbler:** mention suggestions offer the roles of the room the query was typed in ([dc068a7](https://github.com/Esposter/Esposter/commit/dc068a7a9a274b62de65e3b75e0744169aa33fea))
* **esbabbler:** message write dialogs resolve the message's own room slice when issued ([ecbbcc0](https://github.com/Esposter/Esposter/commit/ecbbcc05c3c093820e2d75f96ccf3316a92570bf))
* **esbabbler:** only a reaction's only reactor may delete its row ([2f075c0](https://github.com/Esposter/Esposter/commit/2f075c041b909ee183b7e6f06afc775e9a86e600))
* **esbabbler:** reply targets and file urls are written to the room their message is in ([f78d12b](https://github.com/Esposter/Esposter/commit/f78d12b8a013e14f86758e59433c2ede824c627e))
* **esbabbler:** the participant insert is its own statement, so its no-await-in-loop reason sits on the await it names ([28cdf21](https://github.com/Esposter/Esposter/commit/28cdf212a578d5013a47603b54763ece1651494d))
* **esbabbler:** the server names the typist, so typing input carries only the room ([9cb2ad0](https://github.com/Esposter/Esposter/commit/9cb2ad060fa42b8f115fb75958bd8db3ed53520e))
* **flowchart:** a graph saves what defines it, so a drawn edge, a dropped node and a picked colour persist ([19d70bc](https://github.com/Esposter/Esposter/commit/19d70bc1135eb631d281a03549561f34ec411dfa))
* **genshin-persona:** a character the data package has no lines for reads the wiki's page for the interface language ([7f720c9](https://github.com/Esposter/Esposter/commit/7f720c9fa8f91a5b5363344e21bb196093422e80))
* **genshin-persona:** a checkpoint the model id no longer names is swept where the one in use lands ([bed0bbb](https://github.com/Esposter/Esposter/commit/bed0bbbb5bea6544bf19d4cedac13e6d6e5cdf52))
* **genshin-persona:** a clip is read off the wiki's file host over the https module — its edge answers the fetch client with a browser challenge, and the same headers on node:https with the file ([f6f98e7](https://github.com/Esposter/Esposter/commit/f6f98e74f7db6d33bbf7596b42ae12e379896d3a))
* **genshin-persona:** a line's nickname is the character's own name, the one its tips already run under ([13ebf92](https://github.com/Esposter/Esposter/commit/13ebf9213d846c5012bf035ec8fdb34a4efdf393))
* **genshin-persona:** a player the OS stopped is reported by the signal it was stopped by, since such a player carries no exit status ([22d7459](https://github.com/Esposter/Esposter/commit/22d7459dba3e8a307a714d8622acb6357756fb54))
* **genshin-persona:** a spinner line longer than a tip is cut to the sentences that fit, not dropped ([38da47f](https://github.com/Esposter/Esposter/commit/38da47f097111656b15b7c4c014516b30095c0d2))
* **genshin-persona:** a spinner rewrite decides on the settings it writes back, not the ones it read the lines on ([316a411](https://github.com/Esposter/Esposter/commit/316a411193abc84f34fbc4634bdb6a01ffc23215))
* **genshin-persona:** a state write lands whole or not at all ([8907856](https://github.com/Esposter/Esposter/commit/890785620cd92530ba8683fc9e8104bb3feee444))
* **genshin-persona:** a turn the reply queue replaced stays replaced, and a piece of it landing later is answered rather than read ([728e8f7](https://github.com/Esposter/Esposter/commit/728e8f7d732815ee11d5a34f5780cd9013f485b3))
* **genshin-persona:** every piece of a reply is handed to the synthesizer in place, and read by its index ([aa56a95](https://github.com/Esposter/Esposter/commit/aa56a959b1ae29da35f386f833c24c4f6c33fd33))
* **genshin-persona:** game-data lines fill in the player's nickname and gendered words before they reach the spinner ([66af18b](https://github.com/Esposter/Esposter/commit/66af18b7c6f5d2864f11caa22a1359468c5a7abc))
* **genshin-persona:** teardown removes only the verbs setup itself appended ([d1223af](https://github.com/Esposter/Esposter/commit/d1223af7ac22405b6ead9388a7310bd219bc3970))
* **genshin-persona:** the base tips stand under the language's own word for Tip, unverbed answers again, and the README carries the full command reference ([7201221](https://github.com/Esposter/Esposter/commit/720122101f1f70e1d45514bdcc435cc497b13e46))
* **genshin-persona:** the card a verb prints greets in the interface language, as the welcome does ([56f3245](https://github.com/Esposter/Esposter/commit/56f3245af15ccf6e7da35d46a57e97993807902f))
* **genshin-persona:** the card the model reads keeps its own greeting, and the welcome keeps the language's ([f27caac](https://github.com/Esposter/Esposter/commit/f27caac3af5d765e5b22a464b122db1d2ad9ca1c))
* **genshin-persona:** the dub guard absorbs its list, the player prefix carries its annotation, and three pages cite the tree ([13a9273](https://github.com/Esposter/Esposter/commit/13a9273fa7d635f4dfa290ff5d6d93711a45fece))
* **genshin-persona:** the dub is written by the run that proved it — a setup that never spoke leaves the replies silent instead of broken ([889c5a2](https://github.com/Esposter/Esposter/commit/889c5a28448e0fc1c3684764cf5f0bfa6af2ad14))
* **genshin-persona:** the engine is judged by its sound — a device ladder demotes a rung that loads the graph and returns silence, and the player's window stays hidden ([45e1ead](https://github.com/Esposter/Esposter/commit/45e1eade4580e5eb6da8f9e78885a9a1e41e628c))
* **genshin-persona:** the Latin gate moves to the sentence, and a warm waiting on a reading no longer cuts it ([1cc39d9](https://github.com/Esposter/Esposter/commit/1cc39d9075762ae669c901b4453a246dcaa0ada5))
* **genshin-persona:** the reply-language line is sent beside any card not in English ([d736fa9](https://github.com/Esposter/Esposter/commit/d736fa96cf7ad96ca3a1ea43920a69994ff404d3))
* **genshin-persona:** the status line stands in with the birthday pick, never another session's use ([5d89134](https://github.com/Esposter/Esposter/commit/5d8913422b3ce7dea8e9839e136db3ee03008a7e))
* **genshin-persona:** use and unpin leave the shared spinner alone ([cde7217](https://github.com/Esposter/Esposter/commit/cde72172d3db9b6d6bfad6ce9151351659d6b007))
* **layout:** a closed docked drawer is inert, so focus cannot land in it off screen ([7e02b36](https://github.com/Esposter/Esposter/commit/7e02b36a65015565a54e33553367790c5c2e6d48))
* **layout:** a page that scrolls inside itself is exactly the viewport tall, and a drawer slides in from its own edge ([b3304f6](https://github.com/Esposter/Esposter/commit/b3304f6dbcb7c523c4f9ff2c8b99bf49c30d6c12))
* **lint:** a directive above the import block sits first in the file, where the import sort leaves it ([2d30d47](https://github.com/Esposter/Esposter/commit/2d30d479093af09e0b9a989eb033f770be498a68))
* **lint:** an all-capitals enum member is refused like a lowercase one, and the Desmos colours are PascalCase ([e3e817f](https://github.com/Esposter/Esposter/commit/e3e817f63b8e9234bb03d07a8dab014a986f3a77))
* **lint:** helpers that capture nothing move to the scope they belong to ([a0685b0](https://github.com/Esposter/Esposter/commit/a0685b01f66bea2c22f3270689594bab2dab733b))
* **lint:** the sites today's rules caught follow them, and a declared namespace keeps a library's show option names ([b357142](https://github.com/Esposter/Esposter/commit/b3571424a33cb973a9ff2ee06dfb654ad63c6f9a))
* **lint:** the three oxlint errors on the queue — a called-times matcher, a braceless single-statement branch, and the extractor wrap's copy stated ([89e60fd](https://github.com/Esposter/Esposter/commit/89e60fd89899850e342775ff42c6a5cb8fa597bf))
* main goes green — a typecheck, two lint reds, four failing tests and two size snapshots ([d3ad39f](https://github.com/Esposter/Esposter/commit/d3ad39fd18fcd6b69cb10dd3733c90afaff5694a))
* main passes lint, typecheck and coverage again ([f609e55](https://github.com/Esposter/Esposter/commit/f609e554c27d90d67b23b0f71b34ee00a1f9234a)), closes [#detail](https://github.com/Esposter/Esposter/issues/detail) [#title](https://github.com/Esposter/Esposter/issues/title)
* main reads the cards it ships — the rename's other half lands, and the graph, the infra snapshot and a restated rule catch up ([621605e](https://github.com/Esposter/Esposter/commit/621605e0343ecd67baf7dbffb743bd568973a02d))
* main's reds — a spread mapped, three size snapshots, the about snapshot, and Escape in the token field's panel ([2575519](https://github.com/Esposter/Esposter/commit/2575519d33337b145c836ee4e5046ed35ed41e55))
* main's six reds, each answered at the line that raised it ([841f03f](https://github.com/Esposter/Esposter/commit/841f03fe52ee0270b4e7ff170df254eb6a94b722))
* **message:** a draft's text reads the same on the server ([0cfb0e9](https://github.com/Esposter/Esposter/commit/0cfb0e908414d3b221202da22b354a998aa5fa55))
* **message:** a scheduled send that replies to nothing stores no replyRowKey ([98fffad](https://github.com/Esposter/Esposter/commit/98fffadb884612cdeeeb73329eeaf20033f451cb))
* **message:** drafts and sent tabs read their counts through UiTabItem ([f3f0c78](https://github.com/Esposter/Esposter/commit/f3f0c78ac8505dab5405400d508f890a31a2fae6))
* **message:** each side pane has one header, and a narrow screen's sheet no longer draws a second ([b201968](https://github.com/Esposter/Esposter/commit/b201968ae7779dab009b292386973055068aec27))
* **message:** every name shown inside a room is the room's — calls, typing, the placeholder, the member editor and invites ([1073d23](https://github.com/Esposter/Esposter/commit/1073d23a5cfc3ff8a0347d6e2ed5439cca93b88e))
* **message:** post the rename message off the stored room name ([177cfa3](https://github.com/Esposter/Esposter/commit/177cfa3c6068c8580bea153642c9ba2180af1c54))
* **message:** the jump to present sits above the composer, not over it ([7e856d4](https://github.com/Esposter/Esposter/commit/7e856d4d2ce2afbc9a1560b29fa8a685c56613b4))
* **message:** the slash command's trailing input takes focus through the shared hook ([f024dc6](https://github.com/Esposter/Esposter/commit/f024dc6e2facd2000c826fe704714dce15b12c36))
* moduleCycles holds its state inside its describe, and module-boundaries stops restating two skill runs ([01c1d09](https://github.com/Esposter/Esposter/commit/01c1d09139e47b0111c0028647db28e75242197b))
* **post:** a vote lands on every copy of its post, through the one like store ([ad4de84](https://github.com/Esposter/Esposter/commit/ad4de849db14cba089cb4f14a087b9419429f110))
* **post:** the feed loads before it is empty ([a95a884](https://github.com/Esposter/Esposter/commit/a95a8840e18d247ab94d2ded2dd9adbcffc86a7a))
* **program:** the response-rate meter reads "at least" when the response read is partial, as the count does ([02d9505](https://github.com/Esposter/Esposter/commit/02d950553a804013aa0bf5881da0ed2fa1784119))
* repair main's five coverage reds — two size snapshots, three prose checks ([becdd50](https://github.com/Esposter/Esposter/commit/becdd50d5f739acfa4b680a4d64f276c2c0663fb))
* repair the red release run on main ([317fc08](https://github.com/Esposter/Esposter/commit/317fc08ff67bd4ca0f5514ca45acb7b64991471f))
* **repair:** the release's size snapshots and a theme paragraph two docs pages both told ([88ff083](https://github.com/Esposter/Esposter/commit/88ff083a2e1289ce05dac47d562221542e2cd62d))
* **repair:** the size snapshots, the collector's commands and the docs the release left stale ([4ed8a23](https://github.com/Esposter/Esposter/commit/4ed8a2331995db78e43cd1e3e4c393a2e9db2fd3))
* **resource:** a blade is judged only against the resource the route names, so opening another resource never 404s ([f98c32c](https://github.com/Esposter/Esposter/commit/f98c32cdcda24903f50611b27bcb2265daba16bf))
* **resource:** a content read that lands after a switch is handed to nobody ([c64c5db](https://github.com/Esposter/Esposter/commit/c64c5dbb175a9200b1607ebd71710fb5ba604d0c))
* **resource:** a late content read or survey save lands only on the opening that issued it ([9e3b48d](https://github.com/Esposter/Esposter/commit/9e3b48dbbc5e211ba0134989ee78624747c30d9b))
* **resource:** a late content read or survey save lands only on the resource that issued it ([b01114a](https://github.com/Esposter/Esposter/commit/b01114a77f9cb1a02fc931eba9d185c4a2c77af4))
* **resource:** a resource read that lands after a navigation no longer replaces the one on screen ([ade9d05](https://github.com/Esposter/Esposter/commit/ade9d05dff7bad8aae6689190230ce24eb3aac6d))
* **resource:** a restore's re-read overtakes a read already in flight, and a survey's pending save is its opening's ([6d88a98](https://github.com/Esposter/Esposter/commit/6d88a987c9057540e6e4276916c063f56f7a8e4c))
* **resource:** a restore's re-read overtakes a read already in flight, and a survey's pending save is its opening's ([4611cc3](https://github.com/Esposter/Esposter/commit/4611cc3b5cb59be3dfa360263f4bdee37373187d))
* **resource:** a sheet column's commands name their icons by meaning through UiIconMap ([856cb48](https://github.com/Esposter/Esposter/commit/856cb48a6d2542aaa9582758fb6335d3c88ef1c5))
* **resource:** a sheet import and an email export land on the resource they were started on ([bd94536](https://github.com/Esposter/Esposter/commit/bd945369a01d9b238e3ce80e30735dd97660e380))
* **resource:** a sheet's column dialogs and a survey's response dialogs stay with the resource they opened on ([6b44ed7](https://github.com/Esposter/Esposter/commit/6b44ed7107d098dd0b5c63059d743727301524a1))
* **resource:** a sheet's selected cells wear the library's selected tint rather than the info colour ([ff995dc](https://github.com/Esposter/Esposter/commit/ff995dc8a779035674a9117aeb2c0f706869f410))
* **resource:** a version history that lands late is filed under the resource it was read for ([2957d69](https://github.com/Esposter/Esposter/commit/2957d69025a5a22f9d6af485419689a9c95d6139))
* **resource:** bound the content backfill's rewrites to 16 at a time ([ea68e3f](https://github.com/Esposter/Esposter/commit/ea68e3f4326fb17441bbc59ebff158fc544c7006))
* **resource:** clear the zstd delta lint reds and take the functions bundle size ([76eecab](https://github.com/Esposter/Esposter/commit/76eecab724f272da67d71b67927ed71768071cd4))
* **resource:** drop the merge's duplicate large-sheet factory and retake the functions bundle size ([71523f0](https://github.com/Esposter/Esposter/commit/71523f0f5f281d2f1afdec3e24e65211b303fce0))
* **resource:** every resource procedure's input bounds its strings and lists ([394c3d8](https://github.com/Esposter/Esposter/commit/394c3d8c1588f79dbd16fe7b365a3709a5b58489))
* **resource:** Home's Recent and Favorites keep their rows on screen while a read is out ([40af824](https://github.com/Esposter/Esposter/commit/40af824604f174dbee99507fbb8bebbd61c5e5ab))
* **resource:** metadata and publication writes apply only to the resource they target ([d1cf035](https://github.com/Esposter/Esposter/commit/d1cf035c45c62628bac07fde9265dec6fe1306ce))
* **resource:** Overview keeps its essentials on screen while the resource is re-read ([21789ac](https://github.com/Esposter/Esposter/commit/21789ac2814be4cb79538cb486e545ebae7f2ae4))
* **resource:** the Activity blade and the list's summary keep what they show while a read is out ([fe8cb16](https://github.com/Esposter/Esposter/commit/fe8cb16c3f065c5081ae9425ebe716b16cd897a1))
* **resource:** the bulk delete confirmation lists its names with markers again ([05a98d0](https://github.com/Esposter/Esposter/commit/05a98d05c46a4a0fd7995eb2f393cb62b9321d8f))
* **resource:** the dense create gallery stacks the title under its icon, and every card fills its grid cell ([b73c475](https://github.com/Esposter/Esposter/commit/b73c475caa3b21d04c36b75e3f0681796ca9e412))
* **resource:** the hidden sheet file input stays out of the accessibility tree ([360b9ac](https://github.com/Esposter/Esposter/commit/360b9acbec58bf0b5b5f130cbddbe898c87278cf))
* **resource:** the page header's trailing group uses ml-a, the spelling that generates ([d748b4c](https://github.com/Esposter/Esposter/commit/d748b4cb79eec7f60b9b97566a66b16e0733a33a))
* **resource:** the sheet file input is hidden, not a focusable sr-only control ([92b77ea](https://github.com/Esposter/Esposter/commit/92b77ea197899e4aa703a778a9c34bd74d3ab64d))
* **resource:** the sheet import, survey import and blueprint capture dialogs answer through useDialogAnswer ([dae36b3](https://github.com/Esposter/Esposter/commit/dae36b30ddc9e52a084dbe7a252e59fd6c55a6e6))
* **resource:** the staged commit downloads the blob it measured ([17c2359](https://github.com/Esposter/Esposter/commit/17c2359cc3066628d67b0f44028d41d4d0bd01a8))
* **resource:** the storage meter writes its reading and plan out at every width, with no tooltip ([381025f](https://github.com/Esposter/Esposter/commit/381025f00283d4718ee3c4c8479b72b61f63b24e))
* restrict-plus-operands goes back off, and each pane's close button is named after its pane ([5dcab20](https://github.com/Esposter/Esposter/commit/5dcab20379ba4240fff6825295da85809e087ecc))
* **review-collector:** a skipped run stops evicting the fire waiting in the group ([feedee9](https://github.com/Esposter/Esposter/commit/feedee9d507236a7d9ddbe38166189bd534974f6))
* **rich-text-editor:** the recording timer counts from the recording's own start ([62b44a8](https://github.com/Esposter/Esposter/commit/62b44a8bd3fbe000363880d240b86fc5e8bd9b7e))
* **room:** an invite id that collides is re-rolled, and a collision is read down the cause chain ([744051a](https://github.com/Esposter/Esposter/commit/744051a1697b06cd8f1462a38a45f20f501ccfae))
* **routing:** the pairing link keeps the entry's history state, the supporters view is linkable, and required segments are required ([837a5a1](https://github.com/Esposter/Esposter/commit/837a5a1e10a58ad0f761b3115de88586d4152038))
* **scripts:** a reshaped part carries no copy line of the original, so expressing one part no longer drops its siblings ([e2ec3d8](https://github.com/Esposter/Esposter/commit/e2ec3d888a013667fd8ddd0c568df15e155baf6e))
* **scripts:** a resolution the target absorbs whole lands as an empty copy ([8550477](https://github.com/Esposter/Esposter/commit/85504771b55b9c4b6f3680851a475daef64e222f))
* **scripts:** runGit lands where main already says it lives ([4e15b72](https://github.com/Esposter/Esposter/commit/4e15b72205f4ebcce7f52a5b74c7d1c57ca8cfa0))
* **shared:** add the AgentConsole route the app's product list and the host's pairing link both read ([b809a7f](https://github.com/Esposter/Esposter/commit/b809a7fc401ed8a6b631422cc4e8438827d05b86))
* **sheet:** a new row stores nothing for a computed column ([6d660e2](https://github.com/Esposter/Esposter/commit/6d660e20a5152eee5fda3693af0d44ebb01af26d))
* **sheet:** a paste or a column retype writes nothing under a computed column's name ([d88e53f](https://github.com/Esposter/Esposter/commit/d88e53ff5bd8cc0f8ccac23e27dea488e1282d82))
* **sheet:** a sheet's view state is its own, so the next sheet opened starts clean ([5ed3b2f](https://github.com/Esposter/Esposter/commit/5ed3b2faf951138d56231705f27cf35d66ff3827))
* **sheet:** a survey import closes its dialog on the sheet it started on, not the one the reader moved to ([596dfd6](https://github.com/Esposter/Esposter/commit/596dfd6aee9137728721cda41b5a051fa8fdf5d9))
* **sheet:** a table dialog's body mounts only while it is open ([51d375f](https://github.com/Esposter/Esposter/commit/51d375f2005dffd990615a1a89fab284ea15f510))
* **sheet:** Add Row keys its row by the columns the sheet has when the row is made ([9b7b565](https://github.com/Esposter/Esposter/commit/9b7b565b2224f829bf0a462a52aacaf838c736de))
* **sheet:** an imported file with a repeated header keeps both columns ([7c92261](https://github.com/Esposter/Esposter/commit/7c92261c812aeaf24b7e2a363ebc520b95fba7b5))
* **sheet:** column filters belong to their sheet and drop out with their column ([9da6fce](https://github.com/Esposter/Esposter/commit/9da6fcedfe6d4a6a58b0c8bb450482b238b68a4b))
* **sheet:** find, replace and the null strategies leave computed columns alone ([3af6319](https://github.com/Esposter/Esposter/commit/3af631956448a7e4af9b93f608e80a06c3d4a1f2))
* **sheet:** keep the replaced sheet's identities through an import ([025a5e0](https://github.com/Esposter/Esposter/commit/025a5e085aa4ad17fe82ec34003f069ba7506808))
* **sheet:** the find bar's replace buttons render, and every component is checked to ([39b05d1](https://github.com/Esposter/Esposter/commit/39b05d126349e5961930c1a641883d249b61344d))
* **slash-commands:** a rejected /topic rolls back to the topic of the room it was typed in ([13031d0](https://github.com/Esposter/Esposter/commit/13031d0a1e1fe53af5fd27f24f7aee1e0635d240))
* **store:** a rolled-back delete restores its row through getRestoredItems, which never puts back a row already there ([146905e](https://github.com/Esposter/Esposter/commit/146905e6128ac7a40c8ce866da9ef3a4ab272228))
* **survey:** a model save that lands after a switch is not taken as the next survey's content ([ef7bb5b](https://github.com/Esposter/Esposter/commit/ef7bb5bf544b63924c16cb29aff2dc2d0a8b5f38))
* **survey:** a response save is conditional on the version it checked, so a concurrent save cannot be overwritten ([8aa60b2](https://github.com/Esposter/Esposter/commit/8aa60b2c7feafe3b0ddf5d16872af06ebdf027e2))
* **test:** component suites unmount every wrapper after each test instead of only clearing the body ([a725940](https://github.com/Esposter/Esposter/commit/a7259401c479c7cd09d8a9ce3ba12a59f3e55b14))
* **test:** the popover anchor test takes its button off the page, and the router bounds walk holds its key inside the describe ([a34a699](https://github.com/Esposter/Esposter/commit/a34a699de708400edc52e5b787d9b80bffd2e68f))
* **test:** the router bounds walk names the procedures whose opaque values only the body limit bounds ([49733cd](https://github.com/Esposter/Esposter/commit/49733cd70555cf172f4669a7dfc72ba705f0b012))
* **test:** the router bounds walk reads an opaque schema by its class rather than its internals ([c3e7264](https://github.com/Esposter/Esposter/commit/c3e7264708c83869e560fea428b9b42de7e33ae7))
* **test:** the router bounds walk types its flat record again, and the size snapshots follow the strict payload and the parser ([f6702b6](https://github.com/Esposter/Esposter/commit/f6702b60704485b53535ec2df7b90d63116e548e))
* **test:** the template suites drop the element lists nothing reads since they read each file's own ([95e78d9](https://github.com/Esposter/Esposter/commit/95e78d95b809616e1355d92abfb7ba16424d095a))
* the import groups keep their blank line, and xml2js appends character data in a template ([aab8156](https://github.com/Esposter/Esposter/commit/aab81569db2874aad3fbe0962105893e7918a353))
* the queue's red checks — format, icon scan, sizes, graph, cited prose ([8f6b338](https://github.com/Esposter/Esposter/commit/8f6b338cd6491cf9b21b14e7919a3491133c6b2c))
* the queue's red coverage shards — bundle sizes as CI built them, one template parse per file read, no stale onSave ([f4a7df7](https://github.com/Esposter/Esposter/commit/f4a7df714597cead02dc8231ec94229460827c80))
* the rebase onto develop drops the repair's duplicates of what the queue already holds ([29b9481](https://github.com/Esposter/Esposter/commit/29b9481d29db92d1ef8f05b72b410d75c2734df4))
* the release's lint and typecheck pass over the tree the window carries ([35bfeab](https://github.com/Esposter/Esposter/commit/35bfeab847b5e2583c013c8fe60734071c24e8fc))
* the release's open findings — unread before a first read, one-sided ranges, a sheet's page, the webhook payload, the token file, xml2js reuse ([07654ff](https://github.com/Esposter/Esposter/commit/07654fff51cef20c20bc4aa30484effe8c707c6f))
* the sitting's check failures — the mock's etag check takes the etag, the mention test passes its signal, one store-binding key, a guard clause and a reasoned disable ([269999b](https://github.com/Esposter/Esposter/commit/269999b49a5bd8fdbd5cbe27d3f519ac861a515f)), closes [#assertEtag](https://github.com/Esposter/Esposter/issues/assertEtag)
* **trpc:** a missing session sends the caller to login with no toast ([5da0ffa](https://github.com/Esposter/Esposter/commit/5da0ffa5051493f99a5559532ec8f8c785cc7001))
* **trpc:** every string and array a procedure accepts has a ceiling, and a test walks the router to keep it so ([d56a848](https://github.com/Esposter/Esposter/commit/d56a848af95b19a74a065e21c25d35d21eaf9e08))
* **trpc:** the error link asks the server whether a refused caller is signed in before sending it to login ([c3d852f](https://github.com/Esposter/Esposter/commit/c3d852facfbd56af76704375174368d974fbc57c))
* **types:** the Nuxt type workarounds narrow to what upstream still lacks ([4c9f2e1](https://github.com/Esposter/Esposter/commit/4c9f2e1d9213698975255883bf92f9e0517bd611)), closes [nuxt/nuxt#33664](https://github.com/nuxt/nuxt/issues/33664) [nuxt/nuxt#33964](https://github.com/nuxt/nuxt/issues/33964)
* **ui:** a bar that pushes its groups apart never wraps ([66c6c79](https://github.com/Esposter/Esposter/commit/66c6c798c9a959dd6b65e10bcd0a201f2095313e))
* **ui:** a button and a row lay out their own content ([c983321](https://github.com/Esposter/Esposter/commit/c9833219376105fb0943bad2c1a63f5fed6e4b00))
* **ui:** a button keeps a step above and below content taller than an icon, and a toolbar's slots space their buttons ([16fff03](https://github.com/Esposter/Esposter/commit/16fff032bfb545329a827a5f1f995ec8d519765b))
* **ui:** a button link centres its label, as a button does ([709e8c2](https://github.com/Esposter/Esposter/commit/709e8c2b012caadf82da24380b7728d733781b7f))
* **ui:** a context menu's target binds no click listener, so a Vuetify list item stays a plain row ([e7f81eb](https://github.com/Esposter/Esposter/commit/e7f81eb01124522e844223ff01b482c5b3213360))
* **ui:** a data table nobody sorts needs no sort model ([12a4d7f](https://github.com/Esposter/Esposter/commit/12a4d7fa2d91a52492584d770c0888b720b80952))
* **ui:** a data table's rows and columns sit on dividers and tint on hover ([a8db3ba](https://github.com/Esposter/Esposter/commit/a8db3bad519cc8c70eddac566e8ed68ed659a7c9))
* **ui:** a date or slot grid leaves Alt, Ctrl and Meta chords to the browser, as the data table already does ([fb8f08f](https://github.com/Esposter/Esposter/commit/fb8f08fec0f763e8d707da59ebdeaba6149af735))
* **ui:** a dialog opens holding focus itself, the close button left where it was ([01436e1](https://github.com/Esposter/Esposter/commit/01436e175e18a3a1fae12e6d3a3074a034f5f602))
* **ui:** a dialog opens on its content, never on its close button ([44a8620](https://github.com/Esposter/Esposter/commit/44a8620cacb8ab3a3982e20d5d827b3fbd43eba0))
* **ui:** a drag that ends off the calendar leaves no event to move ([c4be747](https://github.com/Esposter/Esposter/commit/c4be7470c0263def28ad4f1b11705ede7700ca1c))
* **ui:** a dragged resize handle sets a whole pixel width ([f2d194d](https://github.com/Esposter/Esposter/commit/f2d194d588b9d782a5d5fe91076c6dfcf0e6bee4))
* **ui:** a field draws Material's resting line, and a pill wins its corner ([c6f4011](https://github.com/Esposter/Esposter/commit/c6f401173eb5a3b17a09de556cf63ddae6106a6a))
* **ui:** a field is a tone, focused or not — no line and no ring ([762a2f2](https://github.com/Esposter/Esposter/commit/762a2f278df7fd693b04a892479467a249cfe0fa))
* **ui:** a field wrapped around an editable is focused while the editable is ([735640f](https://github.com/Esposter/Esposter/commit/735640fae6ea2cca4aa54823575ce269994bf79a))
* **ui:** a line or area chart sizes its markers, so each series' shape is seen ([0c6b6ca](https://github.com/Esposter/Esposter/commit/0c6b6ca6408c5918cf8c6b41cd251e8af6de2113))
* **ui:** a long press with no click after it swallows no later click ([0cbd46c](https://github.com/Esposter/Esposter/commit/0cbd46c2a658cff56fadfc0e99e1826f4c94bc2c))
* **ui:** a menu's group separator keeps its height when the list scrolls ([dfd4567](https://github.com/Esposter/Esposter/commit/dfd45673bacac8fc4c782edc8a70c20c245b0cb4))
* **ui:** a native field's own inset edge is reset ([ce605de](https://github.com/Esposter/Esposter/commit/ce605deb0f82c8238fec06c1d468d7118f8b8f50))
* **ui:** a panel with no room on any side takes the whole width above or below, so it never opens off screen ([b9f3460](https://github.com/Esposter/Esposter/commit/b9f34607bf9e639b5946c4a498949b9edf428b42))
* **ui:** a popover returns focus where it opened from, a singleton dialog leaves with its item, and the red suites pass ([9789515](https://github.com/Esposter/Esposter/commit/978951573b409464ee21317e16107cb07e6d2492))
* **ui:** a quiet toggle fills while pressed ([1281b88](https://github.com/Esposter/Esposter/commit/1281b8816c29a0c2b0082bf4c8d02cda372dd47c))
* **ui:** a region shown from a breakpoint takes the hidden class, not the attribute ([f7c45e1](https://github.com/Esposter/Esposter/commit/f7c45e1de82193e2734673816e923cd6ed0b5a21))
* **ui:** a select's caret points down to its list and turns over while it is open ([cdb8f5f](https://github.com/Esposter/Esposter/commit/cdb8f5f11e677da862232d59707021509f0e4ffb))
* **ui:** a singleton dialog reconciles its target from the first read and its lookup clears it on unmount ([61c8338](https://github.com/Esposter/Esposter/commit/61c8338aeb79300e57b3438ae1f98c964bba62bb))
* **ui:** a skeleton is a tone off whatever it sits on ([11e4338](https://github.com/Esposter/Esposter/commit/11e43388f72ca8e807da1aa901f82de00be16fd4))
* **ui:** a skeleton takes the shape of what it stands in for ([6e63c04](https://github.com/Esposter/Esposter/commit/6e63c04f9c14bcfea2b2791f584cb1456f4e8ecd))
* **ui:** a skeleton's band steps across it rather than the whole block blinking ([d8cccac](https://github.com/Esposter/Esposter/commit/d8cccac4ccd2ef77c689b4952e4a584c4eaa2c14))
* **ui:** a tinted focus keeps a transparent ring that forced colours paint ([8836173](https://github.com/Esposter/Esposter/commit/8836173c0978338a1f2b44543975501f42b4f3ae))
* **ui:** a toast stays while either the pointer or focus is inside it ([f755e73](https://github.com/Esposter/Esposter/commit/f755e73a140e5426f893f5681597faa953aa0a4e))
* **ui:** a variant switch drops a picked field whose picker reads another list of the context ([4ab64b5](https://github.com/Esposter/Esposter/commit/4ab64b599374de1a58f6eea89110ee1d220112c2))
* **ui:** add the UiContextMenuPoint model useContextMenu imports ([f8b26c8](https://github.com/Esposter/Esposter/commit/f8b26c8b7257f5743fdda0e2e7f1758533ff2f6a))
* **ui:** an optimistic delete closes its confirm dialog at once, and a dialog shell leaves with its body ([a80d978](https://github.com/Esposter/Esposter/commit/a80d97888f6b347c8977fb38c3e3f9e41bfb0ad1))
* **ui:** attributify reads templates with their comments blanked, so the shell pads for the dock again ([9dc223e](https://github.com/Esposter/Esposter/commit/9dc223eb3bc05f0282376a522dc70cbe311cd548))
* **ui:** buttons, fields and select triggers share one control height ([96fbe49](https://github.com/Esposter/Esposter/commit/96fbe49b90a53b6373ebc46215d6cdc6dff7c3cf))
* **ui:** chart chrome reads the selected theme's tokens, and nothing claims Vuetify's themes follow it ([5222c12](https://github.com/Esposter/Esposter/commit/5222c1223ec32880e8cbbe349b7a9b592d7069a9))
* **ui:** every button firing a write that waits on the server shows it is pending ([d4304a2](https://github.com/Esposter/Esposter/commit/d4304a2fa162c1b1989b934a09d9f929213e5184))
* **ui:** every dialog placement writes its own margins, so a high or middle dialog is centred again ([539b86e](https://github.com/Esposter/Esposter/commit/539b86e8876b5cfaf3d8b012bb95ee33c6b7b673))
* **ui:** every list row leads with a mark ([a64c08f](https://github.com/Esposter/Esposter/commit/a64c08f520f2c618b0bf5f2c20cca496fa58614c))
* **ui:** every select option carries a mark, and the trigger reads as a field ([5057650](https://github.com/Esposter/Esposter/commit/5057650afaaa60652c0ad1753fc1a2839a0ec65c))
* **ui:** keep the emoji rail scrolling and the dock in place on a composer tap ([e556e24](https://github.com/Esposter/Esposter/commit/e556e24bdbfac5cd96638aaedb2cf722dbefcf14))
* **ui:** library menus name their icons by meaning ([4650f27](https://github.com/Esposter/Esposter/commit/4650f27e3b30ba96564618442be915de1dcb585f))
* **ui:** print sets the status colours to black, so dark mode's pale tints never reach white paper ([fac4353](https://github.com/Esposter/Esposter/commit/fac4353df5ddbc249b956f8464abd1cb6fa263fb))
* **ui:** readable text swaps the body's face alone ([1ea251e](https://github.com/Esposter/Esposter/commit/1ea251e8468694a9009469f23d1f911ab1e79fb6))
* **ui:** schema forms render through a Vue shell of our own, and every test runs Vue without the Options API ([0060efd](https://github.com/Esposter/Esposter/commit/0060efd40300082faffc547ef2173e42460ede68))
* **ui:** show a server-rendered avatar once it loads, and never aria-hide a link a click can focus ([5f26f54](https://github.com/Esposter/Esposter/commit/5f26f549d23062858b028b5dd3e4c96bdfdc06b6))
* **ui:** the alert clips nothing ([1c8eed3](https://github.com/Esposter/Esposter/commit/1c8eed314c6a10fa301fb79c7fbc70661e34ee84))
* **ui:** the alert rounds its status block rather than clipping its content ([46ff5b1](https://github.com/Esposter/Esposter/commit/46ff5b10b72e36656fa088fc43fcce7d90fd6669))
* **ui:** the bars are a step thick, standard's one eased track, and the page's a full-width line ([59e0cf9](https://github.com/Esposter/Esposter/commit/59e0cf9cd3565f9292415ff452fe77f4c4ab5423))
* **ui:** the breadcrumbs drop the ordered list's markers and tint behind the crumb under the pointer ([9091a39](https://github.com/Esposter/Esposter/commit/9091a39d56867bf1125bf65b4654646941115302))
* **ui:** the calendars pass the root lint ([ded87e3](https://github.com/Esposter/Esposter/commit/ded87e3878a99d3cee6d7bd3dfc30f1a9d11145d))
* **ui:** the colour field's label wraps its swatch, as label-has-for asks ([8285778](https://github.com/Esposter/Esposter/commit/828577857d8aae766a3be4ce5bae39f443e6c273))
* **ui:** the confirm dialog is an alert dialog that opens onto Cancel ([58189aa](https://github.com/Esposter/Esposter/commit/58189aa9a8e64cef71860f6b2a44d6d917ba0697))
* **ui:** the data table steps back to its last page after a removal; crumbs keyed by position ([489ba2d](https://github.com/Esposter/Esposter/commit/489ba2d98cbb57ce016da65a7f413d6a8e229590))
* **ui:** the dialog answer hands useMutation a promise without an async keyword it never awaits ([9d9cf98](https://github.com/Esposter/Esposter/commit/9d9cf984b121e57e37bab5aa4953cc068b88c384))
* **ui:** the dock's current page and a table's selected row wear the library's tint, not the accent ([92626a9](https://github.com/Esposter/Esposter/commit/92626a99eef7bd490d06b88ce23a5659047c8267))
* **ui:** the dropdown mark points down, the way a closed select opens ([c8f0c9b](https://github.com/Esposter/Esposter/commit/c8f0c9b601725408907bdffc559da8c212f2128d))
* **ui:** the edit dialog's header on the shared title bar, its marks spaced and quiet ([b7639a3](https://github.com/Esposter/Esposter/commit/b7639a3a74ac809c8347e9259204f68b38f20c87))
* **ui:** the edit dialog's heading is the item's name as it is typed ([fb1239b](https://github.com/Esposter/Esposter/commit/fb1239be55342ca9284b59500eda4f522c8ae090))
* **ui:** the forced-colours surface test asserts the config's rules exist, so the suite typechecks ([b4d1b9d](https://github.com/Esposter/Esposter/commit/b4d1b9d51e212e6e591cbf50abc804e64eff9a40))
* **ui:** the hours open at the opening hour, measured within their scroller ([bf11292](https://github.com/Esposter/Esposter/commit/bf112920ce817c2499272bf4268971b4a08dacd7))
* **ui:** the library's motion is eased, never stepped ([696b335](https://github.com/Esposter/Esposter/commit/696b335826c8659d5ae88f660ef402c69e3ac9ba))
* **ui:** the readable-text command shows its state in its icon ([855656e](https://github.com/Esposter/Esposter/commit/855656eb76906b4dfa36933bab8f66e3607bb607))
* **ui:** the resize handle follows only the pointer that started the drag ([0717b69](https://github.com/Esposter/Esposter/commit/0717b697e0769d5cb7bf6dd200de50167106641c))
* **ui:** the schema form's renderers are marked raw, so JSON Forms no longer proxies every field component ([f62459e](https://github.com/Esposter/Esposter/commit/f62459e42105cea973034960ae87be9b4ebb5f3c))
* **ui:** the schema form's renderers declare their props by type, and pass the root lint ([7f5f23e](https://github.com/Esposter/Esposter/commit/7f5f23e674adadb69f97958204b73f399cd2bd2e))
* **ui:** the standard accent is Vue's green ([94cb2d9](https://github.com/Esposter/Esposter/commit/94cb2d9cff10e00136acd8c92b4029bdd4205269)), closes [#42b883](https://github.com/Esposter/Esposter/issues/42b883) [#2f835e](https://github.com/Esposter/Esposter/issues/2f835e) [#1a7550](https://github.com/Esposter/Esposter/issues/1a7550)
* **ui:** the standard dark accent is the bright green Vue's docs lead with ([4af5bcf](https://github.com/Esposter/Esposter/commit/4af5bcfbede274b6939306a8d5032439dc10c002)), closes [#42b883](https://github.com/Esposter/Esposter/issues/42b883) [#42d392](https://github.com/Esposter/Esposter/issues/42d392)
* **ui:** the template attribute checks generate every distinct token once, so the suite no longer runs out of heap ([3e87eca](https://github.com/Esposter/Esposter/commit/3e87eca02b514c02046817ae556d71b8a62ad50e))
* **ui:** the transitions that read the removed --transition-duration name a motion token ([6f62200](https://github.com/Esposter/Esposter/commit/6f62200b6f67c6a94aee8a36a7f6efccee5c9651))
* **ui:** the type rules keep the pixel face at its one weight, and the fonts config types against its module ([7831d0c](https://github.com/Esposter/Esposter/commit/7831d0cc5cea9db944ae5ff4fc2c0f52e64f0232))
* **ui:** ui-sunk goes, and what takes input is the panel tone ([19a93ea](https://github.com/Esposter/Esposter/commit/19a93ea8dcdbacfb7092bf8b7d20ee82178d6616))
* **ui:** v-data-table-server keeps its ban for the recycle bin's unit ([e5df9ec](https://github.com/Esposter/Esposter/commit/e5df9ecdc185b5cefba00370e52514ea62231ae1))
* **unocss:** the icon collections resolve from the app, not the process's working directory ([ecd43a5](https://github.com/Esposter/Esposter/commit/ecd43a521ec0e213a8275021f02b99baddf4e54c))
* **upload:** fail an upload Blob Storage refuses ([794b5e6](https://github.com/Esposter/Esposter/commit/794b5e6b9c37a4bba794c358e319ee0819fa1bf8))
* **virrun:** a win32 argv carrying a line break is refused, since cmd.exe ends a shim's command there ([59a380c](https://github.com/Esposter/Esposter/commit/59a380cd99372e67307e3bc80c6f3d88616532e1))
* **virrun:** every persisted probe cache expires, the WSL cache root included ([ad91314](https://github.com/Esposter/Esposter/commit/ad913146c1bf098c147a0e1c76916fe16e82204c))
* **virrun:** the native fallback runs a win32 .cmd shim, and a WSL that won't start is named, not cached ([33f5e83](https://github.com/Esposter/Esposter/commit/33f5e83e7978849f2853b55f3236e6cd3d405bc4))
* **web:** a dev websocket upgrade with no ready worker closes the socket instead of restarting Nuxt ([7c18b71](https://github.com/Esposter/Esposter/commit/7c18b71f83154048b0e9417a854ec93d5097fe47))
* **webhooks:** the payload no longer accepts embeds a message has nowhere to store ([ec14ad2](https://github.com/Esposter/Esposter/commit/ec14ad2a1a759311bad59ebe91a68b85dcf84c9e))
* **webpage-editor:** the two untyped grapesjs plugins are declared as plugins, not imported under ts-expect-error ([323cb1d](https://github.com/Esposter/Esposter/commit/323cb1d3c98219afc71f842f874517d65f675f8a))
* **web:** the bound-class blocklist test reads a match group that may be absent ([5e478d2](https://github.com/Esposter/Esposter/commit/5e478d26d39ae37cc0f2f56704e0e456638df8d9))
* **web:** the dev startup scan reads the .ts files that opt in with [@unocss-include](https://github.com/unocss-include) ([e825f1a](https://github.com/Esposter/Esposter/commit/e825f1a1c7e9a95a112e4c8437fda60169b8d56b))
* **web:** the dev upgrade hook imports @esposter/shared lazily, so nuxt prepare loads it before any package is built ([902e32e](https://github.com/Esposter/Esposter/commit/902e32ecb4089bed26ed9b454adcb07404f9936f))
* **web:** the inline snapshots go back to the serializer's own line breaks ([fadc972](https://github.com/Esposter/Esposter/commit/fadc97223862be1d92225016ccdf18f012d7bebc))
* **web:** the JSON.parse disable sits above the line that parses, not above the guard ([de72c6e](https://github.com/Esposter/Esposter/commit/de72c6eca94de5dae2fbc39104ee6c667aec2594))
* **web:** the Nuxt configuration imports no workspace library at runtime ([017e7b8](https://github.com/Esposter/Esposter/commit/017e7b8bb1538da94db549a93f62ca475fd3e562))
* **web:** UnoCSS reads every template at dev startup ([4be6f84](https://github.com/Esposter/Esposter/commit/4be6f8488ab339ffb73684572b9a776ecd119202))

### Features

* **about:** the about page on the UI library ([2c1c15b](https://github.com/Esposter/Esposter/commit/2c1c15b188f449d3fc3d7c0c78228b9e3bf2e204))
* **about:** the about page takes the tonal standard ([1aa3045](https://github.com/Esposter/Esposter/commit/1aa3045c92035b1e088cc67dd640730d65a4a68e))
* **achievements:** the achievements page on the UI library ([4ecc303](https://github.com/Esposter/Esposter/commit/4ecc30377e30050d4e2c2a52b031b9d6059930d0))
* **achievements:** the achievements take the tonal standard ([1678101](https://github.com/Esposter/Esposter/commit/167810142c1fe59d271868f731fc8462b5266f8d))
* **achievement:** Typist goes, since typing stays a query no plugin counts ([bf16d06](https://github.com/Esposter/Esposter/commit/bf16d0609ac73508d728857a6719579abf3127c8))
* **agent-console:** a player walked through the room, with a camera following behind ([d680bb5](https://github.com/Esposter/Esposter/commit/d680bb59f3b88692a1d3679a9e906b72a9194c36))
* **agent-console:** a prompt acts on the world, and the door stands out in its frame ([f8f35d9](https://github.com/Esposter/Esposter/commit/f8f35d92d1eade266231cdac4d36faef57af48d3))
* **agent-console:** a thing in the room is used by standing at it ([a057ea7](https://github.com/Esposter/Esposter/commit/a057ea7d0fb35f3716767162f964a2441f7b3c5e))
* **agent-console:** an immersive voxel world with bespoke panels in place of the Vuetify work surface (1/3) ([7e63c3b](https://github.com/Esposter/Esposter/commit/7e63c3b62673366ddb3680766a1cb3fb9b695871))
* **agent-console:** an immersive voxel world with bespoke panels in place of the Vuetify work surface (2/3) ([bbf7552](https://github.com/Esposter/Esposter/commit/bbf7552283b67f69a3fb2021a9329a124ce9cbf4))
* **agent-console:** an immersive voxel world with bespoke panels in place of the Vuetify work surface (3/3) ([b357283](https://github.com/Esposter/Esposter/commit/b35728343197f5c80c06c7a54522744d77dc72b9))
* **agent-console:** an orbiting camera, inline full-width messages with a menu, and folds that toggle like Claude's ([b194136](https://github.com/Esposter/Esposter/commit/b1941362e435a7e1cb33973bcc0a81beb0f3113d))
* **agent-console:** everything collides as a box, and reach is measured to it ([2c16f7e](https://github.com/Esposter/Esposter/commit/2c16f7e4bafcec37fc081ccbcade72d99d083c3e))
* **agent-console:** one bar along the foot of the page holds the session, the console, pause and the way home ([c311bfa](https://github.com/Esposter/Esposter/commit/c311bfa0b3508020f89f27cc54c92db18e7a6e83))
* **agent-console:** stream replies as written, count the turn's tokens, merge each file's diff, rewind files, attach any file ([de177a9](https://github.com/Esposter/Esposter/commit/de177a92e6a20e0abd4e1b0509c5729c762bb114))
* **agent-console:** the /agent-console page — pairing, the session stores, and the work surface ([6d95aff](https://github.com/Esposter/Esposter/commit/6d95aff43d308d9187073d26aa73e66ac133022d))
* **agent-console:** the console on the UI library — its primitives retired, its panels on the tokens in a dusk scope ([fcc639d](https://github.com/Esposter/Esposter/commit/fcc639d9af8ad1a5c6e3ada0e16c28ee7d3c0133))
* **agent-console:** the door swings on its hinge, and its prompt goes with it ([ca97319](https://github.com/Esposter/Esposter/commit/ca973195ded0216663e1550942a316a377b2b14b))
* **agent-console:** the Genshin theme presents a session as its character ([c84f283](https://github.com/Esposter/Esposter/commit/c84f283a396800873d9af25cc6c4a793d1e0239d))
* **agent-console:** the pause menu walks with W and S, and pairing is a library form ([ffd1f80](https://github.com/Esposter/Esposter/commit/ffd1f8089b72d0190ebab5687aade30e5d15f673))
* **agent-console:** the player jumps, sprints and sneaks with Minecraft's movement ([a85ece4](https://github.com/Esposter/Esposter/commit/a85ece4f9f0fb7255ddddf5013081bb23b3bbef9))
* **agent-console:** the room is built as a small Minecraft house ([60f85ec](https://github.com/Esposter/Esposter/commit/60f85ec1115451ea68261f88af221cb031d5c830))
* **agent-console:** the room is walled in, with a door the player opens and closes ([ab00bf4](https://github.com/Esposter/Esposter/commit/ab00bf448c4f768704a6268087d427dd81babebb))
* **agent-console:** the room stands in seeded terrain streamed in chunks ([77f9199](https://github.com/Esposter/Esposter/commit/77f919917c45ada9e51a55f02fe524b6c955886c))
* **agent-console:** the working line shows Claude Code's own words, and loading counts four steps ([75e673b](https://github.com/Esposter/Esposter/commit/75e673ba389052e946273a80b3321433ddeb34c5))
* **agent-console:** the world is the page, and the console an overlay called up over it ([364855b](https://github.com/Esposter/Esposter/commit/364855b22e2669b2cb5ba5bf058386a4ed29a813))
* **agent-console:** the world needs no host, and pairing is the console's ([306472b](https://github.com/Esposter/Esposter/commit/306472b12a59040534f436916aaf4d3114f6f653))
* **anime:** the anime page takes the tonal standard ([acc0143](https://github.com/Esposter/Esposter/commit/acc014363b50fd632759a2d274b716cafee1444a))
* **anime:** the drawing gallery on the UI library ([f26bd2e](https://github.com/Esposter/Esposter/commit/f26bd2e2d5f06e9710354246c8161859149109e9))
* **app:** a page declares its mark while mounted, so the dock draws a resource by its type's icon rather than its title's letter ([b5933ee](https://github.com/Esposter/Esposter/commit/b5933eecfa7579f10df0a60e96fabd7a147d4def))
* **app:** the app shell takes the tonal standard ([afbd7f5](https://github.com/Esposter/Esposter/commit/afbd7f5936e9248b07939150888dbb3ed706227d))
* **app:** the theme mode and the design style are dock menus of their own, out of the crowded account menu ([1dc5235](https://github.com/Esposter/Esposter/commit/1dc52354812dbee51810cffbd936020ab984b4b5))
* **bookmark:** a bookmark keeps the resource type of the page it saved, for the dock to draw as its mark ([2fe22ff](https://github.com/Esposter/Esposter/commit/2fe22ff5cc4ae6476529d317227b4cfe048a1d17))
* **calls:** the call view takes the tonal standard ([6a80014](https://github.com/Esposter/Esposter/commit/6a80014324292fc197b59a5a6974d61f6ac5678d))
* **clicker:** the buildings and upgrades groups name their marks by meaning ([d31883e](https://github.com/Esposter/Esposter/commit/d31883ed1d46563960b92e952805a68b9fc20a41))
* **clicker:** the clicker page takes the tonal standard ([9207685](https://github.com/Esposter/Esposter/commit/9207685cff690cb8a97ee61b940935ea5bed6b24))
* **coderabbit:** the review file cap is read off the plan, set to the Advanced trial ([7f78ad5](https://github.com/Esposter/Esposter/commit/7f78ad5b22a8e0b4698f1cbcfeda2bceb3cc467b))
* **collector:** a head the bot skipped reviewing is judged, never waited on ([b04b5a0](https://github.com/Esposter/Esposter/commit/b04b5a0b0f2aed0121dce5c42828df05e9860906)), closes [#1216](https://github.com/Esposter/Esposter/issues/1216)
* **collector:** push drained fixes at once, drop parking and --force ([c5719ff](https://github.com/Esposter/Esposter/commit/c5719ff2b8739331c705958b4025f8a103ef6d2a))
* **collector:** repair a red main without a session where a regenerator answers it ([e8c3557](https://github.com/Esposter/Esposter/commit/e8c355701a2cc7b71494f54fdda8708af525e86c))
* **dashboard:** the dashboard and flowchart editors take the tonal standard ([e329ec5](https://github.com/Esposter/Esposter/commit/e329ec5591a2c50b09e7b67c5a89069d971a9778))
* **db:** bookmarks — the pages a reader keeps on the dock, following them between devices ([c01630a](https://github.com/Esposter/Esposter/commit/c01630a06000dbe883790b1f24d4bee8dfeb5b6a))
* **db:** store every JSON blob through one compressed writer and reader ([488919d](https://github.com/Esposter/Esposter/commit/488919d9f6ec3f2c7d2343944f35ff31b0faa524))
* **docs:** the docs on the UI library, led by one sidebar ([cf84a8a](https://github.com/Esposter/Esposter/commit/cf84a8a5e09df38c3ab703153a9101cc0317b342))
* **docs:** the docs take the tonal standard ([ce1d30b](https://github.com/Esposter/Esposter/commit/ce1d30b7ed0d33310ac95360b1a36bca175b1774))
* **dungeons:** the pixel-grid textures are filtered nearest and a world character rounds to whole pixels, while painted art keeps smoothing ([0120447](https://github.com/Esposter/Esposter/commit/012044791374af2bed33fd08628c1c4c99b9ff92))
* **eslint:** a nested describe fails lint, so every suite stays one flat block ([c0f56a1](https://github.com/Esposter/Esposter/commit/c0f56a1611f402e6db5489bd5f9c76d2d68fa735))
* **genshin-persona:** a character for this session alone, switched in the reply that asks ([75f6c94](https://github.com/Esposter/Esposter/commit/75f6c94770ef679f195cd795bd119656a4bf013b))
* **genshin-persona:** a character's card names the voice that reads them ([9075383](https://github.com/Esposter/Esposter/commit/907538349f4ffba65e80020ddca7a8e3ce76d0ff))
* **genshin-persona:** a character's spinner tips run under their own name — the tool shows one label over every tip, so a card's tips stand alone and the base tips are the fallback for a card without any ([b12af87](https://github.com/Esposter/Esposter/commit/b12af87dd6301e837c42401e12ae86009870187b))
* **genshin-persona:** a character's voice is generated beside the card, and the card's is the ear's alone (1/2) ([37d8a77](https://github.com/Esposter/Esposter/commit/37d8a77f96ef84d5282c8791485335aa3a7a0c03))
* **genshin-persona:** a checkout declares its own marketplace, so a clone installs the plugin with no command anyone types ([c4e1761](https://github.com/Esposter/Esposter/commit/c4e1761ddf1f7ec89f5a1b7284d7bbdc85b4b218))
* **genshin-persona:** a greeting in every character's own voice, and a card for every character (2/2) ([86ecf95](https://github.com/Esposter/Esposter/commit/86ecf95e6bcf6c34631b1eca3368086fa5c3f420))
* **genshin-persona:** a reply's spoken lines are read by a MessageDisplay hook the voice verb writes, and the warm makes the greeting ([cdb9603](https://github.com/Esposter/Esposter/commit/cdb9603acb76a691af64c88c585ed1490b4a2f78))
* **genshin-persona:** a sentence with no Latin letter is not spoken — the engine reads English only, and its silence on any other script was demoting a device rung the hardware had earned; the multilingual dub is a proposal ([cb68de2](https://github.com/Esposter/Esposter/commit/cb68de25e55e4181454ca451b2aa90c0b802ae11))
* **genshin-persona:** a spoken sentence ends at the model's end-of-sequence token — the 400-token ceiling cut a long reply mid-word ([d841050](https://github.com/Esposter/Esposter/commit/d8410501e1459eb90c85e068078176be03740917))
* **genshin-persona:** every character speaks in a clone of their own voice — Chatterbox resident on this machine, the reference chosen and scored from the wiki, Azure Speech gone (4/4) ([aeeb465](https://github.com/Esposter/Esposter/commit/aeeb465d397e8c0d562ab38343307a042d734c5c))
* **genshin-persona:** every language is named in its own words, and either spelling of it resolves ([c85b217](https://github.com/Esposter/Esposter/commit/c85b217df1c521e34010bd680410f2432a1b40fc))
* **genshin-persona:** one slash command per verb, and the genshin skill as the model's router ([c5b28ab](https://github.com/Esposter/Esposter/commit/c5b28ab17c65b2ab2faeee90781c2d992a1c69b2))
* **genshin-persona:** one toggle puts everything the plugin writes in your language, and replies follow it until they are set apart ([db97f2d](https://github.com/Esposter/Esposter/commit/db97f2df22683fae40fd571b945d8dcc08462a63))
* **genshin-persona:** setup and teardown write the two settings a plugin cannot ship ([c43fe58](https://github.com/Esposter/Esposter/commit/c43fe58993bfe7584268cc4067c4b2e8c766211e))
* **genshin-persona:** the ask decides how much of a reply is spoken, and no reply repeats the card's greeting ([bd90366](https://github.com/Esposter/Esposter/commit/bd90366900890f68b7e11c9091de77ac442addf3))
* **genshin-persona:** the birthday note labels itself ([3d30777](https://github.com/Esposter/Esposter/commit/3d307772d66063445d4afa752234934c56d1cea1))
* **genshin-persona:** the checkout declares auto-update on its own marketplace, so a clone re-pins itself ([60c6ab7](https://github.com/Esposter/Esposter/commit/60c6ab7676add5ab6c3f05d2880ffb1838a98a43))
* **genshin-persona:** the day's character picked by lore behind a TypeSafe key, and a volume for spoken replies ([7428207](https://github.com/Esposter/Esposter/commit/7428207ec4cdf9a692089b55ab0e2461f8a27511))
* **genshin-persona:** the lore pick asks the tier at every session start instead of caching the day's answer ([c740fe6](https://github.com/Esposter/Esposter/commit/c740fe699b79e80fc9dafbf18b0ca5c9aff2344d))
* **genshin-persona:** the lore pick draws from the tier's odds with an even share, not its top answer ([64264db](https://github.com/Esposter/Esposter/commit/64264dbf51310dfbf32f902608f593831c4d73b9))
* **genshin-persona:** the nameplate sits on a tonal badge of the character's colour ([77750f2](https://github.com/Esposter/Esposter/commit/77750f2cf123b6156c093bae5901d117f83b4460))
* **genshin-persona:** the persona plugin, a workspace package that is also a Claude Code plugin ([bf6faaf](https://github.com/Esposter/Esposter/commit/bf6faaf32a3bc43e0ccc5944559fb9ca4544161d))
* **genshin-persona:** the player twins speak — their lines read off the Traveler's story pages and cut to their own turn, a page that leaves the dub to the template reads too, and the runner measures named characters into the map ([caacef1](https://github.com/Esposter/Esposter/commit/caacef15ae22a73f0c8591e15bb80ea5e9350ce9))
* **genshin-persona:** the rung the synthesizer speaks on is kept in the state directory, so the next one starts there — and the voice verb clears it, so its proof walks the ladder from the top ([55e039b](https://github.com/Esposter/Esposter/commit/55e039b87bebf8d11944260042c49492e8cf3ff2))
* **genshin-persona:** the session-start hook greets the person and hands the model the card ([a738b79](https://github.com/Esposter/Esposter/commit/a738b79c45fb3c74d13c5e7357ce7c0ddda3afe9))
* **genshin-persona:** the spinner shows every line of the character's, the card's tips ahead of them ([d761548](https://github.com/Esposter/Esposter/commit/d761548c7b1dba29fef668fde3a971675448ae58))
* **genshin-persona:** the spinner speaks Teyvat, and every character's own verbs and tips (3/3) ([42ba21f](https://github.com/Esposter/Esposter/commit/42ba21f3d598acde14db774c5c4226bfd4a593eb))
* **genshin-persona:** the spinner tips run under the tool's own prefix, not the character's name (2/2) ([0b1d605](https://github.com/Esposter/Esposter/commit/0b1d6057abdc0be0105376579b1bb07ea7b29603))
* **genshin-persona:** the status line, and the release path a merge to main already is ([91d7a67](https://github.com/Esposter/Esposter/commit/91d7a675e84117e7fe53ea94b51cea9251030bf6))
* **genshin-persona:** the voice reads through Chatterbox Nano — a few hundredths of likeness for a line read faster than real time ([0d3ec06](https://github.com/Esposter/Esposter/commit/0d3ec064e2806375f94fcce96d3dd5bae63ce44e))
* **genshin-persona:** the welcome greets in the interface language, the runtime's words are Intl's, and the nameplate wears the character's own colour ([49d879a](https://github.com/Esposter/Esposter/commit/49d879a5e333d32bf42e6d0d6c3a23e53e8e62e5))
* **genshin-persona:** the welcome keeps the plugin's lines apart from the character's ([9359af0](https://github.com/Esposter/Esposter/commit/9359af086dca0d4e13cb5a23a997e8b4db43200d))
* **genshin-persona:** the welcome shows what the pick weighed, who is close and the voice ([f4a91d0](https://github.com/Esposter/Esposter/commit/f4a91d0deb7f56f0b5995cdd3e3261e6e4a9e09a))
* **genshin-persona:** whose ask it is decides the reply's form, never its length or shape ([c8b61a0](https://github.com/Esposter/Esposter/commit/c8b61a0858d0a05a62bd8b31436fc45ba54fe307))
* **infra:** the one free-tier Speech account, and its key as a secret stack output ([9448105](https://github.com/Esposter/Esposter/commit/9448105ddee17858cc988e675372c1f48f92301f))
* **infra:** the speech account leaves the estate — protect off, then the resource and its key output destroyed ([45962e4](https://github.com/Esposter/Esposter/commit/45962e4264961efdbac6b33860d8927388ed5fc9))
* **lint:** a component never trims, held in script and template, and the search composable trims its own query ([39c6e71](https://github.com/Esposter/Esposter/commit/39c6e71db1e01cb72d19b721f81fdec62909fb83))
* **lint:** a destructured event parameter is a lint error ([aa34caf](https://github.com/Esposter/Esposter/commit/aa34caf3ec9310e33425a740ea593a6cae3a309f))
* **lint:** a double cast through unknown in source is a lint error ([ebe50df](https://github.com/Esposter/Esposter/commit/ebe50df4ef7d94392458026cabc273ba2933e1ec))
* **lint:** a typed date in a suite is a lint error, and the two that existed move to the epoch's own day ([cdcfcd9](https://github.com/Esposter/Esposter/commit/cdcfcd927c5f2a9822f5bcd9c14bb31e002107d5))
* **lint:** a z.enum schema without its satisfies clause is a lint error in source ([80e5e31](https://github.com/Esposter/Esposter/commit/80e5e3185c59ea0c106308cada7fa1ba2fa4e6fe))
* **lint:** an [@event](https://github.com/event) binding calls its handler or names the payload in an arrow ([cb805ee](https://github.com/Esposter/Esposter/commit/cb805eec986b9c4723bcecd3938933d529d18f57))
* **lint:** an inline no-op ok handler is a lint error ([59aac46](https://github.com/Esposter/Esposter/commit/59aac463f6df306530c235a7c73bc5e3c2ac4c24))
* **lint:** every disable directive states its reason, held by a rule in each linter ([c1ddb8c](https://github.com/Esposter/Esposter/commit/c1ddb8ca2a6471e645345a6f7df1379b95d1d2ff))
* **lint:** no module cycle, whether the imports are written or auto-imported ([82ea78e](https://github.com/Esposter/Esposter/commit/82ea78e4473531e1278667ff4391f062b564b468))
* **lint:** watchEffect and its post and sync twins are lint errors ([c741920](https://github.com/Esposter/Esposter/commit/c7419201718dff4c96ef0fdfdd38741f7c941206))
* **lint:** wrapping with neverthrow's own constructors is a lint error ([98327c8](https://github.com/Esposter/Esposter/commit/98327c814481345e6b6af31cc57f8a53e88cb076))
* **login:** the sign-in page on the UI library ([3a7b7ad](https://github.com/Esposter/Esposter/commit/3a7b7ad803796f2f7c8b4242d12813f6b2861f25))
* **login:** the sign-in page redesigned as a neutral provider list ([8e1844b](https://github.com/Esposter/Esposter/commit/8e1844b8810b5de306de1f6aa6dbdf6b2302b7c4))
* **login:** the sign-in page takes the tonal standard ([d257021](https://github.com/Esposter/Esposter/commit/d25702111d74eb4950ddb4fb443cfebc07fc32c1))
* **message:** a poll vote can be removed, as Discord's can ([354f019](https://github.com/Esposter/Esposter/commit/354f019735bbf76ade56e7dabbb5f5ff9f3bf502))
* **message:** one room header at every width, and the dock stays up ([cef18a6](https://github.com/Esposter/Esposter/commit/cef18a68ab9d29f14c8af6efcd8138e2e4a27224))
* **message:** room settings take the tonal standard ([39ba453](https://github.com/Esposter/Esposter/commit/39ba453414b3653211650df60944a9a77e84e408))
* **message:** the members, profile, status, categories and settings take the tonal standard ([4456ac9](https://github.com/Esposter/Esposter/commit/4456ac9fdaf409613b480cb298568822227d6a07))
* **message:** the message surface takes the tonal standard ([856589d](https://github.com/Esposter/Esposter/commit/856589da290d96ee80f818e4f15a5b9c4cabfb3f))
* **message:** the messages shell takes the tonal standard ([33739f5](https://github.com/Esposter/Esposter/commit/33739f5548ce2073ba75a09c86ceee9395008b1b))
* **message:** the right sidebar and drafts take the tonal standard ([3caaaef](https://github.com/Esposter/Esposter/commit/3caaaef413a21b77fa69550a0520d5f96cfcabbb))
* **message:** the room content area takes the tonal standard ([69d7af6](https://github.com/Esposter/Esposter/commit/69d7af611400a3aa9c83181e06ded846d3ff5042))
* **message:** the room list, direct messages and room dialogs take the tonal standard ([6376355](https://github.com/Esposter/Esposter/commit/637635562a282af6292b8949e0f06f7a9fc19aba))
* **oxlint:** a store read off an unnamed or misnamed binding fails lint ([afc9f57](https://github.com/Esposter/Esposter/commit/afc9f573d569ec4162a8b6aff48bf22bf1af5f52))
* **oxlint:** a trailing line comment after code is a lint error ([fd41208](https://github.com/Esposter/Esposter/commit/fd41208a76230b08b283d362ddf0281148e8f611))
* **oxlint:** the testing skill's banned matchers fail lint instead of review ([008f1a5](https://github.com/Esposter/Esposter/commit/008f1a54237e2bcdc5a96d8eb824e0a13bc2c82a))
* **oxlint:** useMutation called outside a setup scope is a lint error ([c1f32f7](https://github.com/Esposter/Esposter/commit/c1f32f7493e061e1b75f252586ea093cb488596b))
* **post:** the feed, the post page and the editor on the UI library ([afda710](https://github.com/Esposter/Esposter/commit/afda7108f9a3c9a5fd6d81cc0e4d6f4fc1fda5fc))
* **post:** the posts take the tonal standard ([5d345b9](https://github.com/Esposter/Esposter/commit/5d345b98f1e799ca71e3b0ed4ce35713736aeee1))
* **privacy-policy:** the privacy policy on the UI library ([34622d4](https://github.com/Esposter/Esposter/commit/34622d47e4b39955c4fa2a6dbd24cbb018ad54a7))
* **privacy-policy:** the privacy policy takes the tonal standard ([b4d47e6](https://github.com/Esposter/Esposter/commit/b4d47e682be9486e69fa06eb11027b9b104ae1c4))
* **program:** Setup lays its audience and bindings out as two cards across the blade, and Status meters the response rate ([e576578](https://github.com/Esposter/Esposter/commit/e576578db1979193385962171895899b34c4b3d1))
* **resource:** a bulk delete's toast restores the whole selection, and a procedure is single until a caller acts on a set ([80cf15d](https://github.com/Esposter/Esposter/commit/80cf15df8e2a08261960748a341bb03a6e4208ea))
* **resource:** commit a content save as a delta against the stored bytes ([1f9d1e2](https://github.com/Esposter/Esposter/commit/1f9d1e2e67b817d3a11dbad33d1628e2b6f2bed3))
* **resource:** commit a staged content save by reference ([6546f3c](https://github.com/Esposter/Esposter/commit/6546f3c8618990e2d1df51ad4ecea33212110337))
* **resource:** create, version history, activity and the resource dialogs take the tonal standard ([8a30b8c](https://github.com/Esposter/Esposter/commit/8a30b8c2f4d8e1db417dce3ff6befc15df08b72a))
* **resource:** Overview's Essentials is a framed card with Edit tags in its header, its pairs in two columns from md up ([56cb08d](https://github.com/Esposter/Esposter/commit/56cb08d5a9a74ca24b42a4459674d29c12f604f5))
* **resource:** read a large document straight from Blob Storage ([505c2b3](https://github.com/Esposter/Esposter/commit/505c2b3d0b68c8b00992ec9c066ce777f6c45e64))
* **resource:** record the hash of the stored content bytes ([85fe0ec](https://github.com/Esposter/Esposter/commit/85fe0ec11b674261a07274cfb22a5f562609c3b7))
* **resource:** save a large document as a delta when the server holds its baseline ([0059df8](https://github.com/Esposter/Esposter/commit/0059df8f06b92eec0b7b46d69d33938856e77728))
* **resource:** seed the delta baseline from the content a load reads ([2c2d1bf](https://github.com/Esposter/Esposter/commit/2c2d1bfb3106cf9d005a5e0c9681e3bf36c725d7))
* **resource:** separate the content limit from the request limit ([a37e68e](https://github.com/Esposter/Esposter/commit/a37e68e9ab5a98d3ff67b3c6b6c5b4d5e00218c6))
* **resource:** stage a save too large for one request body ([208d7ea](https://github.com/Esposter/Esposter/commit/208d7ea913437226d4eb85aa06ae6814e647015f))
* **resource:** store every working copy as a zstd frame ([dfa4be4](https://github.com/Esposter/Esposter/commit/dfa4be418e309f0bf83dbab31cbd57714f908327))
* **resource:** the explorer's home and recycle bin take the tonal standard ([e400cb7](https://github.com/Esposter/Esposter/commit/e400cb7e0bd5cb4fc7785d54ec3479e218af9f78))
* **resource:** the explorer's home, recycle bin and page wrappers on the UI library ([18b83dd](https://github.com/Esposter/Esposter/commit/18b83dd418d5fcdc6c45ad577dbf812d0a6abda0))
* **resource:** the per-type editors take the tonal standard ([0d98551](https://github.com/Esposter/Esposter/commit/0d985510d61785f9fa2cf2843b6f5d24934104f7))
* **resource:** the resource area's page header on the UI library ([9de8d5c](https://github.com/Esposter/Esposter/commit/9de8d5c3303f6fe3ab0deb43f486362834e2010c))
* **resource:** the resource list on the UI library ([5fae577](https://github.com/Esposter/Esposter/commit/5fae577c2afd4f44b81d45ee15a9be37f08c5e65))
* **resource:** the resource list takes the tonal standard ([6e476f6](https://github.com/Esposter/Esposter/commit/6e476f6611960484772523188d8e08aa8c519259))
* **resource:** the resource page header takes the tonal standard ([586690e](https://github.com/Esposter/Esposter/commit/586690ed178ef018ef23aa35a67b55ae2c8c8a6b))
* **scripts:** build the browser's zstd encoder from pinned source ([1c6eb8a](https://github.com/Esposter/Esposter/commit/1c6eb8a6191ef6ff06f3a76228950b01fee6e59b))
* **scripts:** the outdated report checks a manifest npm installs against its own lockfile ([b990cfb](https://github.com/Esposter/Esposter/commit/b990cfb09b73459e18d2458613a60fd6a8fee1a4))
* **scripts:** the voice match is English against English — one language on both sides, a reference per track, and a stage keeps what it measured ([f51e799](https://github.com/Esposter/Esposter/commit/f51e799d276438d06d00539dfd471160372095ab))
* **sheet:** the Settings blade sets the file type beside that format's options, and the file line centres ([e65b638](https://github.com/Esposter/Esposter/commit/e65b638deff1a01a46b5be85c79a437558ff7ecd))
* **sheet:** the sheet takes the tonal standard ([3c559d4](https://github.com/Esposter/Esposter/commit/3c559d49850bb08db5b8bd7ca160b7ec84c33fdd))
* **storage:** let a reserve take over a row on the same name ([af7dd6c](https://github.com/Esposter/Esposter/commit/af7dd6caab7be4b2632e1a84c8c3d4e8d7906bcc))
* **todos:** an @TODO is an outside workaround with the link that ends it, held by a test ([58ec8db](https://github.com/Esposter/Esposter/commit/58ec8db1f03cbb71b8582b6297ca32ee2357a1d7))
* **ui-library:** a data table's columns resize on their edge, its first column sticks, its rows go compact, and a sheet walks its cells as a grid ([3d5b201](https://github.com/Esposter/Esposter/commit/3d5b201e67b214ce70daa372d069058498ad7e56))
* **ui-library:** icons as UnoCSS CSS generated per use, and the Material Design Icons font dropped (1/3) ([83b5bca](https://github.com/Esposter/Esposter/commit/83b5bcaf42e995925345f6a64c85fa1d57448a19))
* **ui-library:** icons as UnoCSS CSS generated per use, and the Material Design Icons font dropped (2/3) ([db556f6](https://github.com/Esposter/Esposter/commit/db556f68efc257406086c74eb7edcb4d110a87a4))
* **ui-library:** icons as UnoCSS CSS generated per use, and the Material Design Icons font dropped (3/3) ([3de6bea](https://github.com/Esposter/Esposter/commit/3de6beaf792bd93822ade9b72ddabd3223003d39))
* **ui-library:** the foundation — Vuetify 0, the dusk and dawn tokens feeding both libraries, and the document chrome ([c0c7448](https://github.com/Esposter/Esposter/commit/c0c74487a7ab812ef9747263193f0e7b0232deee))
* **ui-library:** the pixel icon set behind a map from meaning to icon, first drawn in the agent console ([1d99ded](https://github.com/Esposter/Esposter/commit/1d99ded7d98f926022c3e19435a957af2afb33ea))
* **ui:** a button owns its pending state, so no call site draws its own spinner ([9dab082](https://github.com/Esposter/Esposter/commit/9dab08291b7f9decc21761acb95c8bba53be0862))
* **ui:** a checkbox whose mark is a block dropping into its box ([566ac3d](https://github.com/Esposter/Esposter/commit/566ac3dccc89db34bbe67cd30b1b122642672a06))
* **ui:** a chip the reader added can be removed ([877e685](https://github.com/Esposter/Esposter/commit/877e685a0efae60817164ef14b5cd07c71f97960))
* **ui:** a collapsible disclosure on Vuetify 0's Collapsible ([454618c](https://github.com/Esposter/Esposter/commit/454618cacb919372bcc70396cc5af17fec7328a8))
* **ui:** a collapsible holds its section's actions beside its trigger ([67512c7](https://github.com/Esposter/Esposter/commit/67512c71adc1ad43743a06d853f9221ae976d517))
* **ui:** a collapsible's header row takes the call site's attributes ([d6cc728](https://github.com/Esposter/Esposter/commit/d6cc728fb9631c276a9fbba2f586d6b1f06c008f))
* **ui:** a confirm dialog can ask for the name of what it destroys ([e9efee7](https://github.com/Esposter/Esposter/commit/e9efee7ab1360033385d008007c5e9cfc0d1e086))
* **ui:** a copy button says what it copies ([ef9110e](https://github.com/Esposter/Esposter/commit/ef9110eabeec90b74f9516a54a04a6f84c2021ed))
* **ui:** a data table for a page of rows a server reads ([98ef4b3](https://github.com/Esposter/Esposter/commit/98ef4b32ccd26f83ef76a3c1df564356ccf19232))
* **ui:** a data table's header cell takes props from its call site ([2bbe9c5](https://github.com/Esposter/Esposter/commit/2bbe9c59752b167ee769a681eb698b0f96517edc))
* **ui:** a data table's rows are pressed only where they go somewhere ([ad0f6ca](https://github.com/Esposter/Esposter/commit/ad0f6cab6bacd698d873ad368b15e1a689f9f5b0))
* **ui:** a dialog owns its answer to a write, and what the app can undo asks nothing ([3a61c5d](https://github.com/Esposter/Esposter/commit/3a61c5d49fa406dc289e19eec3b09ff4b728b00f))
* **ui:** a field whose label is hidden takes a hint inside it ([a41d6a9](https://github.com/Esposter/Esposter/commit/a41d6a918ea67aed5dba61ffa4a47c8b65d46dac))
* **ui:** a file field for files picked or dropped ([4ebb7ab](https://github.com/Esposter/Esposter/commit/4ebb7ab91bf484e651d9a62cad9c94a888330ffd))
* **ui:** a library menu's action names its icon by meaning ([bf48ae6](https://github.com/Esposter/Esposter/commit/bf48ae64ca811da9d847a5b8f726a3969846fcdc))
* **ui:** a list row can be a danger row ([afcf82f](https://github.com/Esposter/Esposter/commit/afcf82ff8e821eba5fcf6e0614138c07e9b1979c))
* **ui:** a list row whose mark the mark slot draws says so ([6bb669a](https://github.com/Esposter/Esposter/commit/6bb669a82e4121fe706a473e7eeded35267f53f2))
* **ui:** a list with roving focus, its rows leading with a mark or an avatar ([3d0c39a](https://github.com/Esposter/Esposter/commit/3d0c39af7fea85f94ef33a625b4de4c6e98c86b4))
* **ui:** a list's read says when it failed ([c049184](https://github.com/Esposter/Esposter/commit/c049184920d251e4c6593732bad8c68e8aef8eef))
* **ui:** a menu item can be disabled while its act is under way ([fa3ca40](https://github.com/Esposter/Esposter/commit/fa3ca401bea2221c58cae6822a5a8172631dba72))
* **ui:** a menu's open state is a model ([c29e750](https://github.com/Esposter/Esposter/commit/c29e750db1da6e13d90dcd3330f71ca5fa25a736))
* **ui:** a meter of voxel blocks that warns as it fills ([509e2da](https://github.com/Esposter/Esposter/commit/509e2da7c17c7c6043db8dca3e3e73472e8a9719))
* **ui:** a meter without marks is a level in the accent ([5cbae84](https://github.com/Esposter/Esposter/commit/5cbae84cfd4e5716a2491ffd1824c3cd266fb07a))
* **ui:** a popover hangs off a list's row, so member and store rows are UiList rows ([fc972cb](https://github.com/Esposter/Esposter/commit/fc972cb70849a9bb7bab84820a187f13e30ad6ed))
* **ui:** a pressed field-toned toggle takes a light info tint ([2f495a7](https://github.com/Esposter/Esposter/commit/2f495a7afa3b428f7b03045519ccff8ce840f922))
* **ui:** a quiet button is clear, tinted in the accent while hovered ([4559850](https://github.com/Esposter/Esposter/commit/45598503c2f06bb2d07328f3f1f797e22aefa0b4))
* **ui:** a radio group for one answer out of a list ([bbd0c85](https://github.com/Esposter/Esposter/commit/bbd0c8585bec82a3b00ca081e276913cb9379844))
* **ui:** a row that goes nowhere is ui-row ([eaa59c7](https://github.com/Esposter/Esposter/commit/eaa59c73564897cd97b8fb065c0aab537dbb8363))
* **ui:** a row's mark can be a component of its own ([3345918](https://github.com/Esposter/Esposter/commit/3345918e80738b04be4b1eb6d8455ab931d28c44))
* **ui:** a select holds several choices once bound to an array ([b8165ac](https://github.com/Esposter/Esposter/commit/b8165acc95aa01b555c3d87a918f22118ad24392))
* **ui:** a slider draws a live level along its track ([ccf0473](https://github.com/Esposter/Esposter/commit/ccf0473a645799649bb72cf7d52f6aea0ad7b49f))
* **ui:** a slider for a number picked along a track ([358b0e0](https://github.com/Esposter/Esposter/commit/358b0e02da52677e969e222d1a1ccaee7c20a62c))
* **ui:** a standard design style beside voxel ([3430633](https://github.com/Esposter/Esposter/commit/34306334638de24ba78582e4ffd804491cd11853))
* **ui:** a tab reads its count after its title ([062dd27](https://github.com/Esposter/Esposter/commit/062dd27f5eaf5f2451c8b48a077774c69f50cf19))
* **ui:** a text field can be disabled and capped ([c0374cc](https://github.com/Esposter/Esposter/commit/c0374cc8d1e9ff84c8e832777bd8a3fb68cc604a))
* **ui:** a text field can take a day ([4920ca6](https://github.com/Esposter/Esposter/commit/4920ca6f5257318aeec34cd7e9493f7dd988a89b))
* **ui:** a text field carries its own hint ([f21c9ce](https://github.com/Esposter/Esposter/commit/f21c9ce8d7db6753ec960e6c521b8cb306590e00))
* **ui:** a text field exposes its control, so suggestions can complete it ([adfc516](https://github.com/Esposter/Esposter/commit/adfc516e63fa875d34fc094f04d2d829e02be7cd))
* **ui:** a text field takes numbers, and a label read but not drawn ([185108b](https://github.com/Esposter/Esposter/commit/185108b8a0920a0f7b111a3c3ed0a43bbe86a014))
* **ui:** a thing picked as a whole is a ui-card, not a row ([6d522c5](https://github.com/Esposter/Esposter/commit/6d522c5edb32cf3ed73a7985196f6daa44b9a276))
* **ui:** a toggle group takes icon-only choices and any value ([a66d29f](https://github.com/Esposter/Esposter/commit/a66d29fbbf269a011fdec7aa5a8db0aecec44c22))
* **ui:** a tooltip can draw more than its label ([a0cba32](https://github.com/Esposter/Esposter/commit/a0cba3244e096ae5d91d0704e7e90fe16d060477))
* **ui:** a tooltip is only for a control showing no text, and counts are one UiBadge that widens with its digits ([2c0d602](https://github.com/Esposter/Esposter/commit/2c0d6024b2f8df0bc62662c4a0c7f5a206f7cb73))
* **ui:** an action inside a line of text is UiInlineAction ([8c14885](https://github.com/Esposter/Esposter/commit/8c1488580e7808392098b319d937b645198ed1f8))
* **ui:** an error state, and a data table sorted only by what the server sorts on ([11feb21](https://github.com/Esposter/Esposter/commit/11feb21f57d6f0877ed13a7b17689825a5c8e2fe))
* **ui:** an event calendar after Outlook's replaces FullCalendar ([53a7024](https://github.com/Esposter/Esposter/commit/53a7024f687b25d1d967fd5f00a06e3e6f95a960))
* **ui:** an overflow menu opens from a mark of its own, and the sheet's meanings ([e57f550](https://github.com/Esposter/Esposter/commit/e57f550fb975b944660599504f72d60c82b52bdc))
* **ui:** an overflow menu, a confirm dialog, and a field that counts ([339381a](https://github.com/Esposter/Esposter/commit/339381a691b0a46ac80f78661e26f4da934d68d2))
* **ui:** attach and blueprint as icon meanings ([6e6b20e](https://github.com/Esposter/Esposter/commit/6e6b20e1b7ac8aa16d4fbba9e5877ac40cf07fa1))
* **ui:** breadcrumbs, whose middle folds away on a short row ([65e2ee1](https://github.com/Esposter/Esposter/commit/65e2ee19db270800eabf150227d2278d4244ee2c))
* **ui:** buttons and toggles take the tonal standard ([16f8b59](https://github.com/Esposter/Esposter/commit/16f8b5937829c80c27b09b8b47bc8f90784acc6a))
* **ui:** containers take the tonal standard ([12230fb](https://github.com/Esposter/Esposter/commit/12230fb2f063266e919eccdb16e5f3e567fc3b68))
* **ui:** deploy, awaiting, play and unbookmark as icon meanings ([35aff47](https://github.com/Esposter/Esposter/commit/35aff4731d8dc07f4914457aca530eafac14ead1))
* **ui:** dialogs drop into place a frame at a time, and stand where their purpose puts them ([36134ab](https://github.com/Esposter/Esposter/commit/36134abcfcfb50afed98218082bc3119ad114b89))
* **ui:** fields and search take the tonal standard ([880f083](https://github.com/Esposter/Esposter/commit/880f083c82ac1308f72e7550f34940b2835dcbc3))
* **ui:** fields, forms, skeletons, empty states, and a link in the button's look ([011dbcb](https://github.com/Esposter/Esposter/commit/011dbcbaa71b497404bd24676b740ed0cd243d3b))
* **ui:** meanings for a call, a room's settings and the clicker's drawers ([cf333f0](https://github.com/Esposter/Esposter/commit/cf333f0bb1db48ea8cc6d581dd867481435ea58b))
* **ui:** meanings for a member's moderation, a note, an owner, a section and idle ([ef74c6f](https://github.com/Esposter/Esposter/commit/ef74c6fda9ada72914e19ec0101d5bf6de0fe6cb))
* **ui:** meanings for a message's emoji, forward, unpin, poll, thread and a missing image ([c4a9698](https://github.com/Esposter/Esposter/commit/c4a9698cf927989385a692dfe2d585e395be96f2))
* **ui:** meanings for friends, blocking, a call and a schedule ([fb1f62d](https://github.com/Esposter/Esposter/commit/fb1f62da2bdbf2e077e88d6e4003fc3a8e184425))
* **ui:** navigation and data take the tonal standard ([3b6a47f](https://github.com/Esposter/Esposter/commit/3b6a47fd0367052a11e1ce09f7f5f1e6ad3ed2b4))
* **ui:** one command palette — Ctrl+K on every page, surfaces' searches as its scopes, and one list of shortcuts ([c4a6106](https://github.com/Esposter/Esposter/commit/c4a61063dd83ac1e41743c562b36c912ddf6fb6e))
* **ui:** one context menu — right-click, long press or the menu key, over messages, resource rows and the dock ([73a6513](https://github.com/Esposter/Esposter/commit/73a6513d88a80278d363127c2c6eb92bc7177869))
* **ui:** panels step out of what opened them, tooltips pop in two frames, toasts step in ([fffd0a9](https://github.com/Esposter/Esposter/commit/fffd0a9560bd32125dd601048b333eeb566d2f86))
* **ui:** popover, avatar and toast join the library, and a menu item can carry an icon ([db1dd3e](https://github.com/Esposter/Esposter/commit/db1dd3eef1eaee55559576e34ecb7c9925bfe5ed))
* **ui:** rows and menus take the tonal standard's row ([3ea29ac](https://github.com/Esposter/Esposter/commit/3ea29acfee3435d8b4f152cac24f45a9cf824ace))
* **ui:** schema forms render through JSON Forms in the library's fields, and vjsf goes ([bfd219e](https://github.com/Esposter/Esposter/commit/bfd219ef253a17b0b787d15cb2a8a6d29dc9a88c))
* **ui:** standard is the default design style, and the design styles proposal retires ([c80c48a](https://github.com/Esposter/Esposter/commit/c80c48a05f34ef7825fedb38a1def34d050d98da))
* **ui:** tab links that show their icons alone ([feb4b74](https://github.com/Esposter/Esposter/commit/feb4b7424c8b9c730edb4189610661118b6a4b6f))
* **ui:** tab links, and the tab look as one pair of shortcuts ([6677fae](https://github.com/Esposter/Esposter/commit/6677fae0cda903de661f823e10243fb874f33e86))
* **ui:** the calendar picks a range of days, and the Updated filter and a sheet's date cell leave the browser's date input ([98f7d11](https://github.com/Esposter/Esposter/commit/98f7d1191f2c081290b9893c576853c08c7a24ea))
* **ui:** the calendars read today from a clock that moves on past midnight ([0b02743](https://github.com/Esposter/Esposter/commit/0b027433c62a54247ebbb7089bfa23f15f03e185))
* **ui:** the composer's suggestions are drawn inside the editor's theme scope ([2dda3c6](https://github.com/Esposter/Esposter/commit/2dda3c641445fa99753e9fe428d1c33f62a823f2))
* **ui:** the event calendar is a grid, with pinned day headings and a selected day or slot ([59678f0](https://github.com/Esposter/Esposter/commit/59678f00227ac3612d1c543447519dd6241b75c2))
* **ui:** the event calendar's views are grids walked from the keyboard, and Alt and an arrow move an event ([f06eb77](https://github.com/Esposter/Esposter/commit/f06eb77201c8a50e02e694f07145f016b8863403))
* **ui:** the library dialog stands over the whole page, and Escape asks its model before it closes ([95e0e03](https://github.com/Esposter/Esposter/commit/95e0e0321201c0003fb0d02dab2d255d88659893))
* **ui:** the library's first components on Vuetify 0 — frame, button, menu, select, suggestions, loading bar, theme scope ([06cba55](https://github.com/Esposter/Esposter/commit/06cba55f6bebda565d998baa545202d88f78614d))
* **ui:** the library's own calendar and date field replace vue-datepicker ([8c60f15](https://github.com/Esposter/Esposter/commit/8c60f1597efd40d48573795adf3882bd0c7ddaf6))
* **ui:** the library's resize handle replaces StyledResizeHandle ([1a1779b](https://github.com/Esposter/Esposter/commit/1a1779b38ce994f4eec07930725de1bc844dde29))
* **ui:** the library's tooltip, and bookmarking said in words in the launcher ([5347e76](https://github.com/Esposter/Esposter/commit/5347e76ce764a76b2e7a3f1a5d3c01e2310a26c0))
* **ui:** the library's type scale, the button look as a shortcut, and tabs ([b5b945c](https://github.com/Esposter/Esposter/commit/b5b945c1d3c003b17f238c01a22ab9a03e14d379))
* **ui:** the message search is a library token field ([a2746c5](https://github.com/Esposter/Esposter/commit/a2746c5ce049720c9daded64bcc6d65f043de6ca))
* **ui:** the readable-text setting ([c6c680c](https://github.com/Esposter/Esposter/commit/c6c680cd24542e538e54ac1ab82e9db08c30395a))
* **ui:** the reader picks a design style, kept in a cookie ([7348a3b](https://github.com/Esposter/Esposter/commit/7348a3b918a1e818efcfb99f9b6acfb7634ed4f4))
* **ui:** the Styled buttons and dialog action rows draw the library's button ([694ec3d](https://github.com/Esposter/Esposter/commit/694ec3d5799a0800fbd5ff7bd499362c102679c5))
* **ui:** the tokens reach past the screen — charts, forced colours, touch, print, code and the manifest ([5986eda](https://github.com/Esposter/Esposter/commit/5986eda7f5f204cb63432adba73825065976dce5))
* **ui:** the tonal standard's tokens and surface rules ([bace3ad](https://github.com/Esposter/Esposter/commit/bace3adc709b5ab7fcdbd85d194b06cd434a1196))
* **ui:** UiAlert, a line the page says about itself ([eca4d78](https://github.com/Esposter/Esposter/commit/eca4d786a5c0dc4b3ff77b9613d0b180cf15bebf))
* **ui:** UiChip, a short reading set into its surface ([dbcd66c](https://github.com/Esposter/Esposter/commit/dbcd66c21a192ece20ef604ec99e6bc485c2ea4a))
* **ui:** UiColorField, a colour from the browser's own picker ([2d6430b](https://github.com/Esposter/Esposter/commit/2d6430b6597eb293d220382438f26f0c10dc4aa5))
* **ui:** UiDataTable searches, sorts and pages every row itself when no server counts them ([2f3fe7b](https://github.com/Esposter/Esposter/commit/2f3fe7b1c2c90c6ecefa3995dbe03cfa9fdc017d))
* **ui:** UiSwitch, a setting that takes effect as it flips ([08d713e](https://github.com/Esposter/Esposter/commit/08d713effc2d81eedefa4800f2716765546c745e))
* **ui:** UiToggleGroup, a row of joined buttons choosing one of a few ([3bf6ad9](https://github.com/Esposter/Esposter/commit/3bf6ad928231617746c4e3e5a3519f20a51c67c1))
* **user:** the profile page on the UI library ([a866c2d](https://github.com/Esposter/Esposter/commit/a866c2d925c23cd213fd407bafadbb6396502b68))
* **user:** the profile takes the tonal standard ([925d29e](https://github.com/Esposter/Esposter/commit/925d29e10833caa63301ec2d1d950a63dcf33882))
* **user:** the settings page on the UI library ([6daf767](https://github.com/Esposter/Esposter/commit/6daf767edbface9fd9cbe0d2e366d7acbc10b19a))
* **user:** the settings take the tonal standard ([3d95018](https://github.com/Esposter/Esposter/commit/3d95018c76f9227fb85fcc17c6d960b9471d83e0))
* **web:** ai:unocss:generate answers what a markup fragment generates, replacing the recipe run-app pasted ([0e71363](https://github.com/Esposter/Esposter/commit/0e71363328eb91f454becfb68f348ae70bde9753))
* **web:** the app shell — a dock of the reader's places, one toast stack, the library's dialogs and one status page (1/3) ([14b8774](https://github.com/Esposter/Esposter/commit/14b877404d019f5d6bbace79e6825fc72ff8558a))
* **web:** the app shell — a dock of the reader's places, one toast stack, the library's dialogs and one status page (2/3) ([ace7d9c](https://github.com/Esposter/Esposter/commit/ace7d9c91558334d950eaa19e076784171d71515))
* **web:** the app shell — a dock of the reader's places, one toast stack, the library's dialogs and one status page (3/3) ([b237793](https://github.com/Esposter/Esposter/commit/b237793376eb4c78ce230a518928d2cd3e567fdd))
* **web:** the flow map — a generated map of which page links to which ([e856697](https://github.com/Esposter/Esposter/commit/e856697a1878962cfcc8bdb5fa4041c72775cd8d))

### Performance Improvements

* **agent-console:** the terrain is generated only where the camera sees ([8e34d5a](https://github.com/Esposter/Esposter/commit/8e34d5a1cc5b2ca0f9ab8b4534fb0f3614d4e4c4))
* every awaiting loop overlaps its work or states the shape that keeps it sequential, held by no-await-in-loop ([97c5194](https://github.com/Esposter/Esposter/commit/97c519469ec01364fcd43512096892b67d305461))
* **genshin-persona:** a reply is read in units of a few sentences after the first, from a five-second reference ([5b19034](https://github.com/Esposter/Esposter/commit/5b19034fc1e6ee4cbfad70ec932cac419e97972a))
* **resource:** a resource's content is read once per open resource, so switching blades renders from the store ([4dec528](https://github.com/Esposter/Esposter/commit/4dec528fcc6eace9bd291088810f4a04249af4e7))
* **scripts:** the synthesizer's speed per sentence shape lives in a committed bench, not in a session's stopwatch ([539b9d7](https://github.com/Esposter/Esposter/commit/539b9d7699e182a4ca75901d2deaa4fd0c1d8649))
* **ui:** the template checks share one read and one parse, and a bench measures what the hot path costs ([cb4f2f8](https://github.com/Esposter/Esposter/commit/cb4f2f81bf2346126c46c0479e00f56a9ba278be))

### Reverts

* **agent-console:** bring the attachment rename back for the drain fixes that finish it ([528cc40](https://github.com/Esposter/Esposter/commit/528cc40fa0882a7d8645af3f9c5b4dcf5d6b29a3))
* **agent-console:** the attachment rename a window commit carried without its importers ([b231fc3](https://github.com/Esposter/Esposter/commit/b231fc32327b1cd8f8b8ab9c54931caa96efcfaa))

# [3.2.0](https://github.com/Esposter/Esposter/compare/v3.0.0...v3.2.0) (2026-09-17)

### Bug Fixes

* **app-shell:** the colors store keeps the casts that carry its key union ([8622ea4](https://github.com/Esposter/Esposter/commit/8622ea403d21fc0ec37991b968eed7bffba0193f))
* **ci:** the functions bundle follows msal-node 6, and three restated runs of prose become pointers ([d90a40c](https://github.com/Esposter/Esposter/commit/d90a40ce8446b365a13bc2db9ed899cbf77ee3a1))
* **ci:** the key files table names only commands that exist, and two size snapshots read their built bytes ([f1464d8](https://github.com/Esposter/Esposter/commit/f1464d881fc5d47bb247d8da838781d487bae004))
* **codemirror:** a dialect with no extension claimed every filename ending in a dot ([8ed97ce](https://github.com/Esposter/Esposter/commit/8ed97cec9bdbf24b51a2caec1eafedb6de41c1f4))
* **coderabbit:** a commit claiming no review is the express lane's — the port skips it, and a red cut is told once on its commits ([fcc1d27](https://github.com/Esposter/Esposter/commit/fcc1d27ef7e802409edb6e1bba1d03eb3fd68c2e))
* **coderabbit:** a fast-forward carries only what the count saw, and the express checks build the bundles the suite reads ([4299320](https://github.com/Esposter/Esposter/commit/4299320524c6661d8f80490bd54d18b832f43533))
* **coderabbit:** a held first commit and a clean review rated above the least risk are each told once where a person reads ([3575627](https://github.com/Esposter/Esposter/commit/3575627816872a8166e50dc260cbee479c9bca2e))
* **coderabbit:** a queue that moved under the sync exits the run idle instead of porting off the stale head ([1e4ebad](https://github.com/Esposter/Esposter/commit/1e4ebad927d2644c15637ada79ebc492099ece46))
* **coderabbit:** a repair is one commit exactly, as the session was told ([13c6f36](https://github.com/Esposter/Esposter/commit/13c6f3642f5f992627e112839296bd2b9a1a4d41))
* **coderabbit:** the cap never measures a commit claiming no review, and a dry run reports every stage ([71cf9cd](https://github.com/Esposter/Esposter/commit/71cf9cd5f10c05b8ca5c4d4d27d3f9c46b124a61))
* **coderabbit:** the express cut goes first, and a red main is repaired behind a red cut ([4fb996c](https://github.com/Esposter/Esposter/commit/4fb996c8b45449936c1a0474d37b4545942c9838))
* **coderabbit:** the express lane reopens past a red main's repairs ([aeb327f](https://github.com/Esposter/Esposter/commit/aeb327f844e7adfa00dbab3586f066e4f5e2c342))
* **coderabbit:** the merge names the head the verdict covers, the drain step the cycle's tree ([26e9154](https://github.com/Esposter/Esposter/commit/26e9154bd2a312b2ceb36774ee9c9cb63d1b36b0))
* **coderabbit:** the rewrite is pushed only once the replay carries every commit the queue owed ([525c632](https://github.com/Esposter/Esposter/commit/525c632ae043fca0128b5546fe30bd0035c71609))
* **coderabbit:** the sync's attempt cap is counted on the commit, and the session pulls only over a clean tree ([0de2078](https://github.com/Esposter/Esposter/commit/0de2078a6648ed8563b9b924773f14d4cc910199))
* **coderabbit:** the sync's resolver owes no finishing checks, and a rewrite the session's push beat carries that push and retries its lease ([552600e](https://github.com/Esposter/Esposter/commit/552600ea61f6a59c897aa55ad1a184105037a91d))
* **collector:** the branch update is a lease the remote arbitrates, not a check and a hope ([869d526](https://github.com/Esposter/Esposter/commit/869d526b7a6a5d7fdc565dffa531aeea7b0b6935))
* **collector:** the runner is handed the two secrets it reads, not every one this repository holds ([4dbe523](https://github.com/Esposter/Esposter/commit/4dbe523962527cfd16ac961dfe7bd918cc910c55))
* **collector:** the status event is the release's, not every pull request the bot statuses ([d3af557](https://github.com/Esposter/Esposter/commit/d3af557fc72dd0253f74c1886c6024d3715ced6c))
* **db:** the room sentinel migration relaxes its checks before it backfills to 0 ([83ee89c](https://github.com/Esposter/Esposter/commit/83ee89ca0964fd2af19d4ae95613bf71ad1382e6))
* **lint:** the import blocks the root lint pass reordered ([e3e26af](https://github.com/Esposter/Esposter/commit/e3e26af6ffc65365eb2f04d82a96c78362762875))
* **lint:** the inRoom import sorts where the fixer puts it ([4b1aa1f](https://github.com/Esposter/Esposter/commit/4b1aa1f38a35a5e159e4bf253db1e847957e1fdc))
* **lint:** the type-import split keeps its import groups sorted, and two selectors stop over-matching ([3ed5095](https://github.com/Esposter/Esposter/commit/3ed50959bcda5f5469d77ccba8429fddce702eb0))
* **message:** the schedule dialog's refresh reports instead of throwing ([9bb3906](https://github.com/Esposter/Esposter/commit/9bb3906c8d372776301a0c5370bd67571eff783d))
* **naming:** the picture-in-picture pages cite the renamed tree, and a loop binding keeps its bare underscore ([99fc5c4](https://github.com/Esposter/Esposter/commit/99fc5c47531d677ffaa792596a6de0578b3b3386))
* **resource:** a restore reaches the editors that hold the live document themselves ([df6066e](https://github.com/Esposter/Esposter/commit/df6066e37bb24a4e8aca285b220bcfdbb5d59835))
* **resource:** a swept snapshot reads as an absent version, not an internal error ([8e5bbbb](https://github.com/Esposter/Esposter/commit/8e5bbbb260419179abbd283788af6a9ff7d803d9))
* **resource:** dedupe both conditional-write failures and verify the object they adopt ([00f8609](https://github.com/Esposter/Esposter/commit/00f8609334def370c11ec8021e413e6a90fe11ae))
* **resource:** the version store answers its review — flags, keyframe verification, twin writes, and the object lock ([2f076b8](https://github.com/Esposter/Esposter/commit/2f076b8f2f031d29f3b33b94a3416f7f8c31202b))
* **review-collector:** a comment stating a decision's reason is the written record, and the drain is told so ([d574fc3](https://github.com/Esposter/Esposter/commit/d574fc37e54b25daf4e3eafb2e12692dc4da88ec))
* **review-collector:** a commit the window carries answers its thread whether or not the reply landed ([d9d1f1e](https://github.com/Esposter/Esposter/commit/d9d1f1ec33244972128e318b92511139d290e943))
* **review-collector:** the trigger inherits its secrets, and the cycle is proved end to end against a fixture repository ([921f466](https://github.com/Esposter/Esposter/commit/921f466f0827b4dd438216afa40d30340f9f0fd0))
* **scripts:** a drain that never started is not a failed attempt ([8ccb441](https://github.com/Esposter/Esposter/commit/8ccb44188afaa89671508fb42bb355efc2059002))
* **scripts:** a drain's verdicts are best-effort, so a refusal to post them cannot discard the fixes ([889f3df](https://github.com/Esposter/Esposter/commit/889f3df3a2548b0feeca1eebdc0dae729efca214))
* **scripts:** a repathed import is judged against the import it replaces ([d92834c](https://github.com/Esposter/Esposter/commit/d92834c2b6b88c7b75f7f86c1efc0bb5c952dd19))
* **scripts:** a thinking block is not a tool call ([e30021b](https://github.com/Esposter/Esposter/commit/e30021b9f048d0c52db7dc2fa49b7f138aaf189e))
* **scripts:** a window nothing more can fit into is already full ([56a06bc](https://github.com/Esposter/Esposter/commit/56a06bc52fdd595ad557f923a5c7dd263009b5b1))
* **scripts:** lint the collector, name a dirty tree's paths, and never owe a merge commit ([bc15b18](https://github.com/Esposter/Esposter/commit/bc15b18e98de069b85b2d2d70dc67908cf159fbd))
* **scripts:** parked fixes ship alone when the queue's first commit is held ([8483c3b](https://github.com/Esposter/Esposter/commit/8483c3b74b5f8e6e56ccda9361064d6f3105bb19))
* **scripts:** the collector measures its window from the frontier, and reads the probe's status line ([1f76796](https://github.com/Esposter/Esposter/commit/1f76796c582fe09c194ae10bbf8f6fb8f40ab117))
* **scripts:** the collector's cycle runs from the pinned ai/queue head, and the choice is settled ([2c7d041](https://github.com/Esposter/Esposter/commit/2c7d04143c794a526d5008ac502bd23e864f9037))
* **scripts:** the drain runs its checks in the foreground, because a one-shot session has no next turn ([94831c4](https://github.com/Esposter/Esposter/commit/94831c4755a2c2048f85911819e37b95d7996edc))
* **scripts:** the drain's closing message is narration, fixes over the cap fail, and a rejection names an open thread ([ba5d41d](https://github.com/Esposter/Esposter/commit/ba5d41ddd80b087e339213d28be4ad6adb1c4716))
* **scripts:** the fill target guards every way a slot can be spent ([4e12df1](https://github.com/Esposter/Esposter/commit/4e12df1cdf643d348ff153bd1f3053b5b9f440f3))
* **scripts:** the green cut folds main in after the loop, and a range is classified once ([b5a8ec5](https://github.com/Esposter/Esposter/commit/b5a8ec5fed4b25fc8f942827570e2b0ba4f7fb15))
* **scripts:** the probe backs off by the rate-limit window instead of by the head alone ([ca7139f](https://github.com/Esposter/Esposter/commit/ca7139f21f9c7a10385da87bc1a939c60d8ac41f))
* **scripts:** the queue and the drain's fixes reconcile on one tree ([2eca8ac](https://github.com/Esposter/Esposter/commit/2eca8ac5962cb5f4b83b5bc9dfaab75baa1d01b0))
* **scripts:** the queue owes only the commits it authored — main's commits and merges are never ported ([dbef904](https://github.com/Esposter/Esposter/commit/dbef904991cc461112c840d348cfda908d9e0437))
* **scripts:** the queue owes the tree the fixes built, not develop ([61f3818](https://github.com/Esposter/Esposter/commit/61f38186c8937031aa650dc800324df59e5b3d3d))
* **scripts:** the retrigger wakes the cycle rather than the bot, and a stated deadline is never guessed ([32b8388](https://github.com/Esposter/Esposter/commit/32b83881481cb3cfc0abcb343d953726b70edf99))
* **scripts:** the return stroke is the run's one push ([0e94cec](https://github.com/Esposter/Esposter/commit/0e94cecb5a6ae616bba7968f7b1f56bd1d423893))
* **scripts:** the three red enforcers go green on what they were reporting ([838f6df](https://github.com/Esposter/Esposter/commit/838f6df6dc746b52fdd5557d36caee3ca56c2654))
* **styling:** the empty-utility ban moves to the enforcer that can ask what a utility is ([ad321dd](https://github.com/Esposter/Esposter/commit/ad321ddfe5616acc1b2a9d477854888512b5576c))
* **survey:** the creator and a themeless published survey follow the app's dark mode ([d1d2a23](https://github.com/Esposter/Esposter/commit/d1d2a23e5e1697bf323b032dd7166fa08c337cf8))
* **testing:** the attachment list is written out where the lint rule reaches the map ([c20fa38](https://github.com/Esposter/Esposter/commit/c20fa387c6cb49bb8196a0d33926cca7f73847ab))
* **testing:** the sweep's repairs — an unread error names its field, the pure helpers sit at module scope ([5069847](https://github.com/Esposter/Esposter/commit/50698479e728ad0817d4c862d69eb975c1654291))
* **virrun:** the sandbox PATH is stated, and a persisted login capture is checked before reuse ([e244c26](https://github.com/Esposter/Esposter/commit/e244c2614a067a307f4b1ea1383252efe163d2ae))
* **visual:** the carousel's overflow card selector takes the name the script returns ([e225487](https://github.com/Esposter/Esposter/commit/e22548753fa994e17afbff1034885b3791705b45))
* **web:** the About snapshot takes the bold utility's one spelling ([fb1eb3f](https://github.com/Esposter/Esposter/commit/fb1eb3f46a59c4df5ab8cb4dd28104757b5e9a7e))
* **web:** the About snapshot takes the line-height utility's one spelling ([481e2b6](https://github.com/Esposter/Esposter/commit/481e2b623eafd4e1d2a583af43e62e5ef80d61e2))
* **web:** the CSP reads the mediapipe version off the track-processors pin rather than restating it ([35507a7](https://github.com/Esposter/Esposter/commit/35507a7e5e268e5b79d364492747b427658fe609))
* **web:** the hook registry's unregister names why it removes in place ([59517d7](https://github.com/Esposter/Esposter/commit/59517d79072bdbf36a4521c7b660a0aa1068b3e1))
* **web:** the rules augmentation follows useRules out of labs, and the snapshot follows vuetify 4.2.1 ([099eef7](https://github.com/Esposter/Esposter/commit/099eef73082cb95c3ae52585b894bff526e972b9))
* **web:** tiled:gen imports its tmx step in-process, and the arrays derived from generated enums leave the generated files ([e6230c0](https://github.com/Esposter/Esposter/commit/e6230c0ccf00075d3cc879c4ca0fe522008a22e2))
* wip ([2965f40](https://github.com/Esposter/Esposter/commit/2965f403b0414ce95ccc6985f282e12f218dcb18))

### Features

* **ci:** CodeQL scans what ships and the week, not every bump ([ac189fe](https://github.com/Esposter/Esposter/commit/ac189fee22b51a6f62dc19783c878373dc2b3a13))
* **coderabbit:** a window has no minimum size, so the queue drains instead of waiting ([997dd50](https://github.com/Esposter/Esposter/commit/997dd50d2b1a45eb732ba065d664249e45551385))
* **coderabbit:** an open CodeQL alert is a red main the repairer answers ([7093f40](https://github.com/Esposter/Esposter/commit/7093f4001d45d4eef7d3197170f803eb5f789cf3))
* **coderabbit:** the collector never waits on a person — a release verdict, a reshaper for over-cap commits, and an express lane admitted by claim ([969d713](https://github.com/Esposter/Esposter/commit/969d71361d7c4c801c336359712edf6558241fa7))
* **coderabbit:** the collector rewrites ai/queue onto each window, and its own session resolves the conflict ([209c2b1](https://github.com/Esposter/Esposter/commit/209c2b12fe8aac5cebf02971d61a96616ec28700))
* **coderabbit:** the return stroke ends nothing, and a red main is the collector's repair ([638f98c](https://github.com/Esposter/Esposter/commit/638f98ce05536bfd1f66008da02fa29aae60567e))
* **error-handling:** a bare new Error is lint, off only at the mechanism's own sites ([fd06c11](https://github.com/Esposter/Esposter/commit/fd06c11406da15d6e2233a296dbf809dc343b8ec))
* **infra:** a branch's name says whose it is, and a collaborator's work enters the queue from external/ ([bd19131](https://github.com/Esposter/Esposter/commit/bd19131394aa86296df7e8a3bebabb827a804d5e))
* **infra:** private vulnerability reporting on, and the Secret Protection surfaces recorded as refused ([22fa8c8](https://github.com/Esposter/Esposter/commit/22fa8c85be7de572b5e7dd4b409efc08b0d9ffe0))
* **infra:** the GitHub defaults nobody declared become resources ([fbc84e2](https://github.com/Esposter/Esposter/commit/fbc84e28223e2677d7c9b113f838af3ceac75b20))
* **lint:** consistent-type-imports is on for .ts ([3a425e3](https://github.com/Esposter/Esposter/commit/3a425e330adbd87ae137d5c0ea3502e0d1425b04))
* **naming:** the three decidable naming rules become lint, and the tree follows ([04d5214](https://github.com/Esposter/Esposter/commit/04d52140f64003db73705ca025a16f1aa5a65ade))
* **resource:** store versions as content-addressed keyframes and deltas ([1a01271](https://github.com/Esposter/Esposter/commit/1a012716c89d09b6746eabe6264427f90c1279ec))
* **scripts:** a backticked code name is a claim the tree or a dependency holds it, and the stale-names scan is a test ([80b02df](https://github.com/Esposter/Esposter/commit/80b02df635ead75276510e15f459042b35b227b8))
* **scripts:** every cited path and skill name resolves under test, the skill-docs checks fail the build, and a stale-names sweep finds the renamed name prose kept ([325fffc](https://github.com/Esposter/Esposter/commit/325fffca45d2020d78b68555053cfcac88017ee7))
* **scripts:** the collector opens the release pull request, and the budget has one knob ([6e80f5a](https://github.com/Esposter/Esposter/commit/6e80f5a0dcd5317d6b655eaa50201c83572b6553))
* **scripts:** the collector wakes on every state change, rate limits included ([b6959aa](https://github.com/Esposter/Esposter/commit/b6959aaaf78397984953c20811a5c98e1617aaad)), closes [#1161](https://github.com/Esposter/Esposter/issues/1161)
* **scripts:** the drain streams its session into the log, pinned to a model, with the findings as written ([94b9555](https://github.com/Esposter/Esposter/commit/94b9555d9950668053764496a49b9d32d10f05de))
* **scripts:** the return stroke — develop follows main by fast-forward after a release, and a bump on main rides the next window ([ebb973d](https://github.com/Esposter/Esposter/commit/ebb973d38eee7ef2b1be84ac100b76e02bc599bd))
* **scripts:** the review collector — an idempotent cycle that drains findings and ports queue windows onto develop ([a25c526](https://github.com/Esposter/Esposter/commit/a25c526a3a20ae448342513df78bfb60024fb291))
* **styling:** every rule a program can decide about a template is a test, a blocklist entry or a selector ([53875e5](https://github.com/Esposter/Esposter/commit/53875e570ba5c59af48c876b6767acf8a8798dcb))
* **sweeps:** constant scope is enforced — the scan knows every exception shape, so a clean pass is empty ([cbceb55](https://github.com/Esposter/Esposter/commit/cbceb554edba8165b4fe1584ff42ddd14475cbf1))
* **sweeps:** the ≥2-consumers rule is enforced — every single-consumer export of packages/shared moves beside its consumer ([5455ae8](https://github.com/Esposter/Esposter/commit/5455ae858d0c1fdad6457e771feab47e2442d61a))
* **unocss:** one spelling per utility family, held in the blocklist and refused by lint (1/2) ([1575c23](https://github.com/Esposter/Esposter/commit/1575c23fde88acb754778b47c1c6c0e1047bc14c))
* **unocss:** one spelling per utility family, held in the blocklist and refused by lint (2/2) ([f80ac51](https://github.com/Esposter/Esposter/commit/f80ac51a8b216dcfbd7a5b1822246e93428a0fdb))

### Performance Improvements

* **ci:** the build-packages hit path skips the toolchain, and the path list is a literal output ([25ca19c](https://github.com/Esposter/Esposter/commit/25ca19caecd1d3c2ae33b2750c42510ce502abfe))
* **coderabbit:** the collector reads an owed set once, not a commit at a time ([2a98ee7](https://github.com/Esposter/Esposter/commit/2a98ee71f98e1616fdd64ebb34859b11b2a232ee))
* **scripts:** a sweep's clock is boot, spawns and reads, so those three move and a bench keeps the number ([a956c5c](https://github.com/Esposter/Esposter/commit/a956c5caabb11bb1e814ee772749e68ad805c4b3))

# [3.1.0](https://github.com/Esposter/Esposter/compare/v3.0.0...v3.1.0) (2026-09-17)

### Bug Fixes

* **app-shell:** the colors store keeps the casts that carry its key union ([8622ea4](https://github.com/Esposter/Esposter/commit/8622ea403d21fc0ec37991b968eed7bffba0193f))
* **ci:** the functions bundle follows msal-node 6, and three restated runs of prose become pointers ([d90a40c](https://github.com/Esposter/Esposter/commit/d90a40ce8446b365a13bc2db9ed899cbf77ee3a1))
* **ci:** the key files table names only commands that exist, and two size snapshots read their built bytes ([f1464d8](https://github.com/Esposter/Esposter/commit/f1464d881fc5d47bb247d8da838781d487bae004))
* **codemirror:** a dialect with no extension claimed every filename ending in a dot ([8ed97ce](https://github.com/Esposter/Esposter/commit/8ed97cec9bdbf24b51a2caec1eafedb6de41c1f4))
* **coderabbit:** a commit claiming no review is the express lane's — the port skips it, and a red cut is told once on its commits ([fcc1d27](https://github.com/Esposter/Esposter/commit/fcc1d27ef7e802409edb6e1bba1d03eb3fd68c2e))
* **coderabbit:** a fast-forward carries only what the count saw, and the express checks build the bundles the suite reads ([4299320](https://github.com/Esposter/Esposter/commit/4299320524c6661d8f80490bd54d18b832f43533))
* **coderabbit:** a held first commit and a clean review rated above the least risk are each told once where a person reads ([3575627](https://github.com/Esposter/Esposter/commit/3575627816872a8166e50dc260cbee479c9bca2e))
* **coderabbit:** a queue that moved under the sync exits the run idle instead of porting off the stale head ([1e4ebad](https://github.com/Esposter/Esposter/commit/1e4ebad927d2644c15637ada79ebc492099ece46))
* **coderabbit:** a repair is one commit exactly, as the session was told ([13c6f36](https://github.com/Esposter/Esposter/commit/13c6f3642f5f992627e112839296bd2b9a1a4d41))
* **coderabbit:** the cap never measures a commit claiming no review, and a dry run reports every stage ([71cf9cd](https://github.com/Esposter/Esposter/commit/71cf9cd5f10c05b8ca5c4d4d27d3f9c46b124a61))
* **coderabbit:** the express cut goes first, and a red main is repaired behind a red cut ([4fb996c](https://github.com/Esposter/Esposter/commit/4fb996c8b45449936c1a0474d37b4545942c9838))
* **coderabbit:** the express lane reopens past a red main's repairs ([aeb327f](https://github.com/Esposter/Esposter/commit/aeb327f844e7adfa00dbab3586f066e4f5e2c342))
* **coderabbit:** the merge names the head the verdict covers, the drain step the cycle's tree ([26e9154](https://github.com/Esposter/Esposter/commit/26e9154bd2a312b2ceb36774ee9c9cb63d1b36b0))
* **coderabbit:** the rewrite is pushed only once the replay carries every commit the queue owed ([525c632](https://github.com/Esposter/Esposter/commit/525c632ae043fca0128b5546fe30bd0035c71609))
* **coderabbit:** the sync's attempt cap is counted on the commit, and the session pulls only over a clean tree ([0de2078](https://github.com/Esposter/Esposter/commit/0de2078a6648ed8563b9b924773f14d4cc910199))
* **coderabbit:** the sync's resolver owes no finishing checks, and a rewrite the session's push beat carries that push and retries its lease ([552600e](https://github.com/Esposter/Esposter/commit/552600ea61f6a59c897aa55ad1a184105037a91d))
* **collector:** the branch update is a lease the remote arbitrates, not a check and a hope ([869d526](https://github.com/Esposter/Esposter/commit/869d526b7a6a5d7fdc565dffa531aeea7b0b6935))
* **collector:** the runner is handed the two secrets it reads, not every one this repository holds ([4dbe523](https://github.com/Esposter/Esposter/commit/4dbe523962527cfd16ac961dfe7bd918cc910c55))
* **collector:** the status event is the release's, not every pull request the bot statuses ([d3af557](https://github.com/Esposter/Esposter/commit/d3af557fc72dd0253f74c1886c6024d3715ced6c))
* **db:** the room sentinel migration relaxes its checks before it backfills to 0 ([83ee89c](https://github.com/Esposter/Esposter/commit/83ee89ca0964fd2af19d4ae95613bf71ad1382e6))
* **lint:** the import blocks the root lint pass reordered ([e3e26af](https://github.com/Esposter/Esposter/commit/e3e26af6ffc65365eb2f04d82a96c78362762875))
* **lint:** the inRoom import sorts where the fixer puts it ([4b1aa1f](https://github.com/Esposter/Esposter/commit/4b1aa1f38a35a5e159e4bf253db1e847957e1fdc))
* **lint:** the type-import split keeps its import groups sorted, and two selectors stop over-matching ([3ed5095](https://github.com/Esposter/Esposter/commit/3ed50959bcda5f5469d77ccba8429fddce702eb0))
* **message:** the schedule dialog's refresh reports instead of throwing ([9bb3906](https://github.com/Esposter/Esposter/commit/9bb3906c8d372776301a0c5370bd67571eff783d))
* **naming:** the picture-in-picture pages cite the renamed tree, and a loop binding keeps its bare underscore ([99fc5c4](https://github.com/Esposter/Esposter/commit/99fc5c47531d677ffaa792596a6de0578b3b3386))
* **resource:** a restore reaches the editors that hold the live document themselves ([df6066e](https://github.com/Esposter/Esposter/commit/df6066e37bb24a4e8aca285b220bcfdbb5d59835))
* **resource:** a swept snapshot reads as an absent version, not an internal error ([8e5bbbb](https://github.com/Esposter/Esposter/commit/8e5bbbb260419179abbd283788af6a9ff7d803d9))
* **resource:** dedupe both conditional-write failures and verify the object they adopt ([00f8609](https://github.com/Esposter/Esposter/commit/00f8609334def370c11ec8021e413e6a90fe11ae))
* **resource:** the version store answers its review — flags, keyframe verification, twin writes, and the object lock ([2f076b8](https://github.com/Esposter/Esposter/commit/2f076b8f2f031d29f3b33b94a3416f7f8c31202b))
* **review-collector:** a comment stating a decision's reason is the written record, and the drain is told so ([d574fc3](https://github.com/Esposter/Esposter/commit/d574fc37e54b25daf4e3eafb2e12692dc4da88ec))
* **review-collector:** a commit the window carries answers its thread whether or not the reply landed ([d9d1f1e](https://github.com/Esposter/Esposter/commit/d9d1f1ec33244972128e318b92511139d290e943))
* **review-collector:** the trigger inherits its secrets, and the cycle is proved end to end against a fixture repository ([921f466](https://github.com/Esposter/Esposter/commit/921f466f0827b4dd438216afa40d30340f9f0fd0))
* **scripts:** a drain that never started is not a failed attempt ([8ccb441](https://github.com/Esposter/Esposter/commit/8ccb44188afaa89671508fb42bb355efc2059002))
* **scripts:** a drain's verdicts are best-effort, so a refusal to post them cannot discard the fixes ([889f3df](https://github.com/Esposter/Esposter/commit/889f3df3a2548b0feeca1eebdc0dae729efca214))
* **scripts:** a repathed import is judged against the import it replaces ([d92834c](https://github.com/Esposter/Esposter/commit/d92834c2b6b88c7b75f7f86c1efc0bb5c952dd19))
* **scripts:** a thinking block is not a tool call ([e30021b](https://github.com/Esposter/Esposter/commit/e30021b9f048d0c52db7dc2fa49b7f138aaf189e))
* **scripts:** a window nothing more can fit into is already full ([56a06bc](https://github.com/Esposter/Esposter/commit/56a06bc52fdd595ad557f923a5c7dd263009b5b1))
* **scripts:** lint the collector, name a dirty tree's paths, and never owe a merge commit ([bc15b18](https://github.com/Esposter/Esposter/commit/bc15b18e98de069b85b2d2d70dc67908cf159fbd))
* **scripts:** parked fixes ship alone when the queue's first commit is held ([8483c3b](https://github.com/Esposter/Esposter/commit/8483c3b74b5f8e6e56ccda9361064d6f3105bb19))
* **scripts:** the collector measures its window from the frontier, and reads the probe's status line ([1f76796](https://github.com/Esposter/Esposter/commit/1f76796c582fe09c194ae10bbf8f6fb8f40ab117))
* **scripts:** the collector's cycle runs from the pinned ai/queue head, and the choice is settled ([2c7d041](https://github.com/Esposter/Esposter/commit/2c7d04143c794a526d5008ac502bd23e864f9037))
* **scripts:** the drain runs its checks in the foreground, because a one-shot session has no next turn ([94831c4](https://github.com/Esposter/Esposter/commit/94831c4755a2c2048f85911819e37b95d7996edc))
* **scripts:** the drain's closing message is narration, fixes over the cap fail, and a rejection names an open thread ([ba5d41d](https://github.com/Esposter/Esposter/commit/ba5d41ddd80b087e339213d28be4ad6adb1c4716))
* **scripts:** the fill target guards every way a slot can be spent ([4e12df1](https://github.com/Esposter/Esposter/commit/4e12df1cdf643d348ff153bd1f3053b5b9f440f3))
* **scripts:** the green cut folds main in after the loop, and a range is classified once ([b5a8ec5](https://github.com/Esposter/Esposter/commit/b5a8ec5fed4b25fc8f942827570e2b0ba4f7fb15))
* **scripts:** the probe backs off by the rate-limit window instead of by the head alone ([ca7139f](https://github.com/Esposter/Esposter/commit/ca7139f21f9c7a10385da87bc1a939c60d8ac41f))
* **scripts:** the queue and the drain's fixes reconcile on one tree ([2eca8ac](https://github.com/Esposter/Esposter/commit/2eca8ac5962cb5f4b83b5bc9dfaab75baa1d01b0))
* **scripts:** the queue owes only the commits it authored — main's commits and merges are never ported ([dbef904](https://github.com/Esposter/Esposter/commit/dbef904991cc461112c840d348cfda908d9e0437))
* **scripts:** the queue owes the tree the fixes built, not develop ([61f3818](https://github.com/Esposter/Esposter/commit/61f38186c8937031aa650dc800324df59e5b3d3d))
* **scripts:** the retrigger wakes the cycle rather than the bot, and a stated deadline is never guessed ([32b8388](https://github.com/Esposter/Esposter/commit/32b83881481cb3cfc0abcb343d953726b70edf99))
* **scripts:** the return stroke is the run's one push ([0e94cec](https://github.com/Esposter/Esposter/commit/0e94cecb5a6ae616bba7968f7b1f56bd1d423893))
* **scripts:** the three red enforcers go green on what they were reporting ([838f6df](https://github.com/Esposter/Esposter/commit/838f6df6dc746b52fdd5557d36caee3ca56c2654))
* **styling:** the empty-utility ban moves to the enforcer that can ask what a utility is ([ad321dd](https://github.com/Esposter/Esposter/commit/ad321ddfe5616acc1b2a9d477854888512b5576c))
* **survey:** the creator and a themeless published survey follow the app's dark mode ([d1d2a23](https://github.com/Esposter/Esposter/commit/d1d2a23e5e1697bf323b032dd7166fa08c337cf8))
* **testing:** the attachment list is written out where the lint rule reaches the map ([c20fa38](https://github.com/Esposter/Esposter/commit/c20fa387c6cb49bb8196a0d33926cca7f73847ab))
* **testing:** the sweep's repairs — an unread error names its field, the pure helpers sit at module scope ([5069847](https://github.com/Esposter/Esposter/commit/50698479e728ad0817d4c862d69eb975c1654291))
* **virrun:** the sandbox PATH is stated, and a persisted login capture is checked before reuse ([e244c26](https://github.com/Esposter/Esposter/commit/e244c2614a067a307f4b1ea1383252efe163d2ae))
* **visual:** the carousel's overflow card selector takes the name the script returns ([e225487](https://github.com/Esposter/Esposter/commit/e22548753fa994e17afbff1034885b3791705b45))
* **web:** the About snapshot takes the bold utility's one spelling ([fb1eb3f](https://github.com/Esposter/Esposter/commit/fb1eb3f46a59c4df5ab8cb4dd28104757b5e9a7e))
* **web:** the About snapshot takes the line-height utility's one spelling ([481e2b6](https://github.com/Esposter/Esposter/commit/481e2b623eafd4e1d2a583af43e62e5ef80d61e2))
* **web:** the CSP reads the mediapipe version off the track-processors pin rather than restating it ([35507a7](https://github.com/Esposter/Esposter/commit/35507a7e5e268e5b79d364492747b427658fe609))
* **web:** the hook registry's unregister names why it removes in place ([59517d7](https://github.com/Esposter/Esposter/commit/59517d79072bdbf36a4521c7b660a0aa1068b3e1))
* **web:** the rules augmentation follows useRules out of labs, and the snapshot follows vuetify 4.2.1 ([099eef7](https://github.com/Esposter/Esposter/commit/099eef73082cb95c3ae52585b894bff526e972b9))
* **web:** tiled:gen imports its tmx step in-process, and the arrays derived from generated enums leave the generated files ([e6230c0](https://github.com/Esposter/Esposter/commit/e6230c0ccf00075d3cc879c4ca0fe522008a22e2))
* wip ([2965f40](https://github.com/Esposter/Esposter/commit/2965f403b0414ce95ccc6985f282e12f218dcb18))

### Features

* **ci:** CodeQL scans what ships and the week, not every bump ([ac189fe](https://github.com/Esposter/Esposter/commit/ac189fee22b51a6f62dc19783c878373dc2b3a13))
* **coderabbit:** a window has no minimum size, so the queue drains instead of waiting ([997dd50](https://github.com/Esposter/Esposter/commit/997dd50d2b1a45eb732ba065d664249e45551385))
* **coderabbit:** an open CodeQL alert is a red main the repairer answers ([7093f40](https://github.com/Esposter/Esposter/commit/7093f4001d45d4eef7d3197170f803eb5f789cf3))
* **coderabbit:** the collector never waits on a person — a release verdict, a reshaper for over-cap commits, and an express lane admitted by claim ([969d713](https://github.com/Esposter/Esposter/commit/969d71361d7c4c801c336359712edf6558241fa7))
* **coderabbit:** the collector rewrites ai/queue onto each window, and its own session resolves the conflict ([209c2b1](https://github.com/Esposter/Esposter/commit/209c2b12fe8aac5cebf02971d61a96616ec28700))
* **coderabbit:** the return stroke ends nothing, and a red main is the collector's repair ([638f98c](https://github.com/Esposter/Esposter/commit/638f98ce05536bfd1f66008da02fa29aae60567e))
* **error-handling:** a bare new Error is lint, off only at the mechanism's own sites ([fd06c11](https://github.com/Esposter/Esposter/commit/fd06c11406da15d6e2233a296dbf809dc343b8ec))
* **infra:** a branch's name says whose it is, and a collaborator's work enters the queue from external/ ([bd19131](https://github.com/Esposter/Esposter/commit/bd19131394aa86296df7e8a3bebabb827a804d5e))
* **infra:** private vulnerability reporting on, and the Secret Protection surfaces recorded as refused ([22fa8c8](https://github.com/Esposter/Esposter/commit/22fa8c85be7de572b5e7dd4b409efc08b0d9ffe0))
* **infra:** the GitHub defaults nobody declared become resources ([fbc84e2](https://github.com/Esposter/Esposter/commit/fbc84e28223e2677d7c9b113f838af3ceac75b20))
* **lint:** consistent-type-imports is on for .ts ([3a425e3](https://github.com/Esposter/Esposter/commit/3a425e330adbd87ae137d5c0ea3502e0d1425b04))
* **naming:** the three decidable naming rules become lint, and the tree follows ([04d5214](https://github.com/Esposter/Esposter/commit/04d52140f64003db73705ca025a16f1aa5a65ade))
* **resource:** store versions as content-addressed keyframes and deltas ([1a01271](https://github.com/Esposter/Esposter/commit/1a012716c89d09b6746eabe6264427f90c1279ec))
* **scripts:** a backticked code name is a claim the tree or a dependency holds it, and the stale-names scan is a test ([80b02df](https://github.com/Esposter/Esposter/commit/80b02df635ead75276510e15f459042b35b227b8))
* **scripts:** every cited path and skill name resolves under test, the skill-docs checks fail the build, and a stale-names sweep finds the renamed name prose kept ([325fffc](https://github.com/Esposter/Esposter/commit/325fffca45d2020d78b68555053cfcac88017ee7))
* **scripts:** the collector opens the release pull request, and the budget has one knob ([6e80f5a](https://github.com/Esposter/Esposter/commit/6e80f5a0dcd5317d6b655eaa50201c83572b6553))
* **scripts:** the collector wakes on every state change, rate limits included ([b6959aa](https://github.com/Esposter/Esposter/commit/b6959aaaf78397984953c20811a5c98e1617aaad)), closes [#1161](https://github.com/Esposter/Esposter/issues/1161)
* **scripts:** the drain streams its session into the log, pinned to a model, with the findings as written ([94b9555](https://github.com/Esposter/Esposter/commit/94b9555d9950668053764496a49b9d32d10f05de))
* **scripts:** the return stroke — develop follows main by fast-forward after a release, and a bump on main rides the next window ([ebb973d](https://github.com/Esposter/Esposter/commit/ebb973d38eee7ef2b1be84ac100b76e02bc599bd))
* **scripts:** the review collector — an idempotent cycle that drains findings and ports queue windows onto develop ([a25c526](https://github.com/Esposter/Esposter/commit/a25c526a3a20ae448342513df78bfb60024fb291))
* **styling:** every rule a program can decide about a template is a test, a blocklist entry or a selector ([53875e5](https://github.com/Esposter/Esposter/commit/53875e570ba5c59af48c876b6767acf8a8798dcb))
* **sweeps:** constant scope is enforced — the scan knows every exception shape, so a clean pass is empty ([cbceb55](https://github.com/Esposter/Esposter/commit/cbceb554edba8165b4fe1584ff42ddd14475cbf1))
* **sweeps:** the ≥2-consumers rule is enforced — every single-consumer export of packages/shared moves beside its consumer ([5455ae8](https://github.com/Esposter/Esposter/commit/5455ae858d0c1fdad6457e771feab47e2442d61a))
* **unocss:** one spelling per utility family, held in the blocklist and refused by lint (1/2) ([1575c23](https://github.com/Esposter/Esposter/commit/1575c23fde88acb754778b47c1c6c0e1047bc14c))
* **unocss:** one spelling per utility family, held in the blocklist and refused by lint (2/2) ([f80ac51](https://github.com/Esposter/Esposter/commit/f80ac51a8b216dcfbd7a5b1822246e93428a0fdb))

### Performance Improvements

* **ci:** the build-packages hit path skips the toolchain, and the path list is a literal output ([25ca19c](https://github.com/Esposter/Esposter/commit/25ca19caecd1d3c2ae33b2750c42510ce502abfe))
* **coderabbit:** the collector reads an owed set once, not a commit at a time ([2a98ee7](https://github.com/Esposter/Esposter/commit/2a98ee71f98e1616fdd64ebb34859b11b2a232ee))
* **scripts:** a sweep's clock is boot, spawns and reads, so those three move and a bench keeps the number ([a956c5c](https://github.com/Esposter/Esposter/commit/a956c5caabb11bb1e814ee772749e68ad805c4b3))

# [3.0.0](https://github.com/Esposter/Esposter/compare/v2.40.0...v3.0.0) (2026-09-12)

* refactor(virrun)!: spell Directory in every identifier that said Dir ([dd2c3a1](https://github.com/Esposter/Esposter/commit/dd2c3a1e7bf3b515102a55e1d305ec1c179e7e3b))

### Bug Fixes

* **app-shell:** import RoomRoleInMessage in getMemberGroups ([17daa87](https://github.com/Esposter/Esposter/commit/17daa8712c860ecffe371e63fc46239360c751e4))
* **auth:** drop the account issuer column and take better-auth 1.7.4 ([47e935e](https://github.com/Esposter/Esposter/commit/47e935e037c0709374bf76bcf28cb78b735b71ed))
* **call:** reject a NaN slot name, and answer the review ([eba51c6](https://github.com/Esposter/Esposter/commit/eba51c65dd5f6ce83b956b084a5f4ae027d567bc))
* **ci:** the functions size snapshot and the rate-limiting key-files path follow the sweep commits ([2999036](https://github.com/Esposter/Esposter/commit/2999036df800d6deacd81a10d6f838c4464ab6f9))
* **coderabbit:** answer the 73467fafe review's three findings ([c0b2afa](https://github.com/Esposter/Esposter/commit/c0b2afaba8cd08af696baf1ab8721659f86a4802))
* **coderabbit:** answer the review's findings on the review tooling ([409c6da](https://github.com/Esposter/Esposter/commit/409c6da4f2a2f556de7a91c08dfb315b97a0921a))
* **format:** the oxfmt snapshot ignore matched every path with snapshot in its name ([c1378a9](https://github.com/Esposter/Esposter/commit/c1378a9070cda3d31cacd20f0a332ec36a818ba8))
* **infra:** the restore PUT also follows a timed-out read ([625956f](https://github.com/Esposter/Esposter/commit/625956fd23e1531c3fbcb9de11cce064450c0ed4))
* lint ([32bb618](https://github.com/Esposter/Esposter/commit/32bb6182eb673083c78ace3db736e9bb2e178a53))
* lint and types ([e313f51](https://github.com/Esposter/Esposter/commit/e313f51092a032874c5c58b9db2dc8872da293ca))
* **release:** carry every workspace member's version, not just packages/* ([c066526](https://github.com/Esposter/Esposter/commit/c066526539227321db023523f86c60afb7755c46))
* **scripts:** the exclusion filter cannot let a logic change out as a rename ([023c9dd](https://github.com/Esposter/Esposter/commit/023c9dde34302e27be112849da5d90427148bedd))
* **server:** a repeated room id no longer fails the membership check ([1d5125c](https://github.com/Esposter/Esposter/commit/1d5125cfa0f054970cc55aabb06948d7b439a0f3))
* **virrun:** a clean sweeps the run registry rather than deleting it ([82c3b53](https://github.com/Esposter/Esposter/commit/82c3b53e8f41140cd636f068815b59dcef4ac643))
* **virrun:** a clean waits for the corpses it reaps before removing anything ([61705bd](https://github.com/Esposter/Esposter/commit/61705bdf7285a53a7ad20dfa0c78d5d842059958))
* **virrun:** a reaper skips its peers, and a timed-out wait fails ([0765ca7](https://github.com/Esposter/Esposter/commit/0765ca742d90926ade4ccc53e26ba55f77115a94))
* **virrun:** an entry's owner is a live pid that started before the entry ([222fc89](https://github.com/Esposter/Esposter/commit/222fc89614c31e38c8cc5df518532263be520364))
* **virrun:** key the orphan sweep on owner liveness, and name a killed run ([8d38462](https://github.com/Esposter/Esposter/commit/8d38462e0791fb04fb6e0c2cfc85eef12fb1c216))
* **virrun:** the task-cache key carries the color level the child ran under ([d07354b](https://github.com/Esposter/Esposter/commit/d07354b9d463be22e358cc914790985877453fda))
* **web:** rethrow every ws lifecycle error except the expected UNAUTHORIZED ([a8d0588](https://github.com/Esposter/Esposter/commit/a8d05886bc900e25373dae75fdee85985884f214))
* wip ([2ced3b3](https://github.com/Esposter/Esposter/commit/2ced3b30b30cf09d33d5cb96f1f60c2f5bb5a083))

### Features

* **scripts:** move the CodeRabbit recipes into ai:coderabbit:* scripts ([ff99165](https://github.com/Esposter/Esposter/commit/ff99165331a1be2aff1fe9857c3dab60aedc3dfb))

### BREAKING CHANGES

* `createVirrun`'s directory source is `{ directory, type: SourceType.Directory }`; the `dir` key and the `SourceType.Dir` member are gone. The wire value is unchanged.

# [2.39.0](https://github.com/Esposter/Esposter/compare/v2.38.1...v2.39.0) (2026-09-04)

### Bug Fixes

* **app:** stop the polyfill blocking the parser, drop an invalid twitter:site ([d03493e](https://github.com/Esposter/Esposter/commit/d03493ee84b4503dad0ee3f22e976c77095ccad7))
* **azure-functions:** declare the entry point the Functions host loads ([b3a3721](https://github.com/Esposter/Esposter/commit/b3a3721bd388d0787c4d5e483dddccb27f59f431))
* **azure-functions:** declare the side effects its entry exists for ([346c732](https://github.com/Esposter/Esposter/commit/346c73234f76ae390e6774b2eddfdedc0f149dfe))
* **azure-functions:** drain dead letters stranded while the app was down ([1c79922](https://github.com/Esposter/Esposter/commit/1c799222c46dab0cf3eae5eca463227f7c7ee5d9))
* **azure-functions:** tsdown generates the entry field and the vendored list ([7e41246](https://github.com/Esposter/Esposter/commit/7e412461c97298ef764e634eec5f908fbf600b51))
* **bench:** a bench helper declares the todo suite Vitest collects it for ([053f1eb](https://github.com/Esposter/Esposter/commit/053f1ebcf076e1ca79165b388b26404a54451521))
* **build:** every package answers the side-effects question ([ecb4dc1](https://github.com/Esposter/Esposter/commit/ecb4dc1d6fb1610cb446fc0560a5ba62dca22f81))
* **build:** only the barrels ctix writes are excluded from the fingerprint ([1770e1d](https://github.com/Esposter/Esposter/commit/1770e1d4a1857c30dd687a41d32a83b77e5c163c))
* **call:** a rejected teardown reports rather than replacing the join's error ([de5eddb](https://github.com/Esposter/Esposter/commit/de5eddb4c6146e6a9bae6f3b0588871b5e96bb53))
* **call:** the call lifecycle alerts its own failure instead of rejecting ([b11f48e](https://github.com/Esposter/Esposter/commit/b11f48e05034624362e67fa1214d277c893a51a7))
* change to class ([d968531](https://github.com/Esposter/Esposter/commit/d96853190b51bb62d2a2290c8fe1c05b0f22aa0f))
* charge the counter on every save, not just the blob's first ([72d6a33](https://github.com/Esposter/Esposter/commit/72d6a33b1f85054f599fbfaa28ce8a18a7c13fd3))
* **ci:** a cache hit means the build output is on disk, not that the cache said so ([56ea553](https://github.com/Esposter/Esposter/commit/56ea553a7ac51c7b0d731b81ff51dd3dbee0601c))
* **ci:** close the oxlint findings and re-record the bundle sizes ([539008c](https://github.com/Esposter/Esposter/commit/539008caa99bb25762b922a049fda526dde833c3))
* **ci:** drain the lint errors and the drifted size snapshots ([a75cea2](https://github.com/Esposter/Esposter/commit/a75cea2c2cdc4376a5351d77ea4962b8abe56a1f))
* **ci:** stop markdown no build reads discarding the app build cache ([b7deb4d](https://github.com/Esposter/Esposter/commit/b7deb4d681491887cc4b5542c304c06abf7845e4))
* **ci:** the checks pass on the tree the snapshot work left ([acd98a2](https://github.com/Esposter/Esposter/commit/acd98a2753b981c618d0632f9950e52f7614a033))
* **ci:** the comment block reads the way the linter spells it ([89cd439](https://github.com/Esposter/Esposter/commit/89cd439446ab529f8b9e8a103e63a075e2c1cbef))
* **ci:** the import order and the three size snapshots catch up with develop ([0cc14ea](https://github.com/Esposter/Esposter/commit/0cc14ea68b9c2a7a7ea1a1e37744fff2bcad19b7))
* **ci:** the prefix restore is its own entry, so it cannot extract another commit's source over the checkout ([e26cea0](https://github.com/Esposter/Esposter/commit/e26cea09d0c87f292068085ced8edd2f6852857a))
* **ci:** unbreak the function deploy pnpm 12 broke, and pin the rule ([6c874d2](https://github.com/Esposter/Esposter/commit/6c874d274abeab8072e782838c709f9db86bff7f))
* **clicker:** remove a popup by the id it was created with ([45b727b](https://github.com/Esposter/Esposter/commit/45b727b1d87c8d333bfad3e042571ad96f467149))
* close the CodeRabbit findings on the call backgrounds ([c8590f7](https://github.com/Esposter/Esposter/commit/c8590f76285e5a9769d0498fcee24edab6e63952))
* **countdown:** the clock drives itself through a scheduler, not a deprecated interval ([0090743](https://github.com/Esposter/Esposter/commit/009074343271935a8ef42cea99116a826c5ef806))
* **dashboard:** key a linked chart set by its x column as well as its dataset ([bbe4bf4](https://github.com/Esposter/Esposter/commit/bbe4bf47d7470f4fc1d5d45826e750b3cc769b69))
* **dashboard:** register the chart features v7 made opt-in ([ad3e366](https://github.com/Esposter/Esposter/commit/ad3e3667c117e00fd8bd70909157fb1a2fee8afe))
* **date:** the relative presets subtract calendar days, and the audio filename drops its colons ([c661bc3](https://github.com/Esposter/Esposter/commit/c661bc377fff8c7c7d062a7b54fe55ee4e1b3bbe))
* **docs:** answer the review findings on the naming ledger, clicker page and lint rule ([8d65534](https://github.com/Esposter/Esposter/commit/8d65534942817992ae399f0b7f76ee5cc666e894))
* **docs:** point the clicker Key Files rows at the files the naming sweep left ([e659b11](https://github.com/Esposter/Esposter/commit/e659b113e16dae0499182a861c8090b34f97da52))
* **docs:** register the chart interaction page in its section group ([bc455d7](https://github.com/Esposter/Esposter/commit/bc455d7ddff91c12bd23187368ecac6b15f5794a))
* **dungeons:** a fade-out that outlives the game reports instead of stalling ([2f8edd1](https://github.com/Esposter/Esposter/commit/2f8edd176bb0e1ded191d43a22da8c23eccba645))
* **dungeons:** a rejected message animation still clears the input gate ([a014773](https://github.com/Esposter/Esposter/commit/a014773b7f182a38651b680d416a1cbc779343d2))
* **emailEditor:** seed the dirty check on load, as every other content store does ([dde2757](https://github.com/Esposter/Esposter/commit/dde2757ecacf59d71d807059eadbbd234e6d58f0))
* **esbabbler:** a reaction tag is one emoji or one room upload ([51bc112](https://github.com/Esposter/Esposter/commit/51bc112941e2109c4078385e5ccca8ab27669c78))
* **esbabbler:** a search clears the pending flag it raised ([dfc4c93](https://github.com/Esposter/Esposter/commit/dfc4c93d8a861db75a3d87c699c1eb78eb153603))
* **esbabbler:** a search's pending flag belongs to the room it was issued for ([e8fdd40](https://github.com/Esposter/Esposter/commit/e8fdd406863277bc84cdc03bbd03b4a581fec616))
* **esbabbler:** the search read awaits its finalizer once ([2056abd](https://github.com/Esposter/Esposter/commit/2056abdb6639cd77f0d506d27d68139014e311f6))
* **file:** store an uploaded blob under its own content type ([e2243d4](https://github.com/Esposter/Esposter/commit/e2243d45d1006df28262c54884a76f3ab69db9b7))
* **infra:** fetch each Function App's package with its own identity ([1e45b4b](https://github.com/Esposter/Esposter/commit/1e45b4b6a96bcec9c6c5d52d15ebbac8554f23ff))
* inherit the key where safeExtend cannot check it ([768756f](https://github.com/Esposter/Esposter/commit/768756f2e812eba1465bc44bbde60bdfa42d4af1))
* lint ([65d56ba](https://github.com/Esposter/Esposter/commit/65d56ba9ccf6319c4bf24b8e8a8c5f2e9422e496))
* **lint:** close two holes in the props-interface rules ([59c4f16](https://github.com/Esposter/Esposter/commit/59c4f162286045ffd2997d2dc6fd78faa4ec4863))
* **lint:** restore sort-objects order after the checkIsPending rename ([f9841d5](https://github.com/Esposter/Esposter/commit/f9841d549bb600cbebff0cba10b958696272b399))
* **lint:** restore sort-objects order after the naming sweep renames ([fa8aac4](https://github.com/Esposter/Esposter/commit/fa8aac438d11df06979fcc95f6a082ba6576b7dc))
* **lint:** restore the clicker store's import order after the rename ([bbb666f](https://github.com/Esposter/Esposter/commit/bbb666ffae329e3be7dbfb464daf02aed42d81c1))
* **lint:** restore the vue/require-default-prop ESLint disable ([a12e248](https://github.com/Esposter/Esposter/commit/a12e248270bfe62acc888d1e8c7f1a444e4e57c7))
* **lint:** the date imports sit where the sorter puts them ([d2e09b2](https://github.com/Esposter/Esposter/commit/d2e09b270209a413295bb2342e36cbe0b8905579))
* **lint:** the four errors the Lint job is red on ([d9e8186](https://github.com/Esposter/Esposter/commit/d9e8186fa56b7ec1a22a41983ae25e6a9a861495))
* **lint:** the root oxlint pass is clean again ([0f373c3](https://github.com/Esposter/Esposter/commit/0f373c3e19490fd019d670791eefec69c8008926))
* **member:** rename the shadowed member count local in the member list ([2b422fd](https://github.com/Esposter/Esposter/commit/2b422fdc3fea741d99ba1ab8ff16271f317e9741))
* **message:** follow the thread a scheduled reply lands in ([0349e7f](https://github.com/Esposter/Esposter/commit/0349e7fec190c0fbd9c256548e36a5e0b7245d2c))
* **message:** keep a restored draft under the stamp it was written with ([212b091](https://github.com/Esposter/Esposter/commit/212b091a3b13e943c9d6477a569c4a0715e75a99))
* **messages:** jump-to-present answers to an observed present, not a stale offset ([1bce8c1](https://github.com/Esposter/Esposter/commit/1bce8c1f72452740e89e031175ff261a07fd5677))
* **moderation:** a blocked send says what blocked it ([93f53ed](https://github.com/Esposter/Esposter/commit/93f53edcd9014f531576c50ee347f6a7ce98dfd9))
* **naming:** undo the doubled word the Nav rename left in the blade navigation props ([bf9b284](https://github.com/Esposter/Esposter/commit/bf9b284a1601a042909a9f8f478ce3625e1019bf))
* **notification:** badge the unread count instead of a dot, and mirror it onto the PWA icon ([6c74a26](https://github.com/Esposter/Esposter/commit/6c74a26cd922e863a30e6ed9ac5470769a24a2f0))
* **notification:** count the unread rows the server has, toast the ones that arrived ([25016d0](https://github.com/Esposter/Esposter/commit/25016d0d46ec6012573cbeae1f3f25f135807f23))
* **notification:** queue overlapping delivered-notification reads ([7a55bb6](https://github.com/Esposter/Esposter/commit/7a55bb6cda731ca79d67c26947252be989dae112))
* **notification:** toast a delivered row that ties with the newest held row ([338e318](https://github.com/Esposter/Esposter/commit/338e31897b3b081ce1e285afdff168ae7d6d889e))
* **platform:** a failed storage subscription takes its socket down with it ([ec1ca38](https://github.com/Esposter/Esposter/commit/ec1ca386f1799bf3e47aa3865bb28f844f77a2aa))
* **platform:** a restore names the channel its version belongs to ([4cbf4eb](https://github.com/Esposter/Esposter/commit/4cbf4eb9b21a5b3c18e536d6f60f993cad46cec9))
* **platform:** a restore stops writing a survey's frozen settings back ([7f155f0](https://github.com/Esposter/Esposter/commit/7f155f0e61fa9950c1a88f316b4ea2898b445ef7))
* **platform:** the preview renders only a version it can address ([5f0bbd5](https://github.com/Esposter/Esposter/commit/5f0bbd51ce9a2c2f5c2fb62577ee5993413121f4))
* **platform:** the storage meter hears the counter its other process moves ([4cf9866](https://github.com/Esposter/Esposter/commit/4cf98664f7ebb9afd4ebccc74a2987d0c7bb7a7a))
* **platform:** the undo restores the resource it was offered for ([cc2aeb7](https://github.com/Esposter/Esposter/commit/cc2aeb71f5231cd5431cf145ebda8248e2df8b8a))
* **platform:** the watcher exists, and the snapshot travels with the build ([cf67bc4](https://github.com/Esposter/Esposter/commit/cf67bc4d3aa9c3a08f8f2635e7eb75e1c382ce73))
* **platform:** vue-phaserjs's augmentation points merge from source ([58210ab](https://github.com/Esposter/Esposter/commit/58210ab44ce93fca697dc9df5511355a59aa3716))
* reject a room update that names no field ([c73d2d6](https://github.com/Esposter/Esposter/commit/c73d2d6bb881a91279c302e5e800d2b17a22e76b))
* **release:** the publish chain checks the tree instead of rewriting it, and runs the suite ([344ef14](https://github.com/Esposter/Esposter/commit/344ef143e67b2b6d9d538e5e811cdb3b09c7eab5))
* remove unnecessary disable ([a79ae13](https://github.com/Esposter/Esposter/commit/a79ae1369887e7e115fa2154fea8d3e7b5d0771c))
* repair the CI fallout from the count column renames ([bbe1c03](https://github.com/Esposter/Esposter/commit/bbe1c035bc81988a32cbe488148b0faf24787a76))
* reset visible section IDs when section set changes ([12e9b7d](https://github.com/Esposter/Esposter/commit/12e9b7de0b9785fb51e08834600e5e2b28e367e1))
* **resource:** publish nothing when an unpublish removed nothing ([5e0aa42](https://github.com/Esposter/Esposter/commit/5e0aa42c999c0a76749517fa7cc5213b16020694))
* **resource:** repoint the recycle bin at the renamed pending check ([b159a88](https://github.com/Esposter/Esposter/commit/b159a88194e14f6ac45097856e06b7c44bb2bff3))
* **review:** the invite walk, the branch a rejected delete left unread, and a subtree count two deletes could share ([7c876a5](https://github.com/Esposter/Esposter/commit/7c876a5975a103012000e87726cb2ed6df39af3d))
* **room:** a banned member is told why the invite will not work ([a734766](https://github.com/Esposter/Esposter/commit/a734766cfd3d45a4b4063189fc4778c2fb2c97a2))
* **seo:** twitter:card is ours to set, and the rule's spread reading holds ([29b6022](https://github.com/Esposter/Esposter/commit/29b6022651b52bd37a50ee56fe3727a6706c6888))
* **session:** clear the three oxlint errors CI caught ([f164618](https://github.com/Esposter/Esposter/commit/f16461867598b709bb459a99b26e2cd4a4cb8df1))
* **sessions:** revoking your own session signs this browser out of it ([c7f4d25](https://github.com/Esposter/Esposter/commit/c7f4d2568c96228af2a2e93c3b3f6aa23852046f))
* **sheet:** the command benches measure the operation, not its early return ([ccb09b0](https://github.com/Esposter/Esposter/commit/ccb09b042177c2bba33d4ccc1f934d14226a764f))
* **slowmode:** a typed fraction truncates to whole seconds instead of throwing ([ac2c4a0](https://github.com/Esposter/Esposter/commit/ac2c4a073f960eae2847179905b30568887a0c64))
* **storage:** address the review — badge guards, a queued badge write, and docs ([b3688f9](https://github.com/Esposter/Esposter/commit/b3688f935746e92ea8e4fdb7e02180c6167ab8e7))
* **storage:** drop a provisional charge once an event has settled the blob ([c5f83fb](https://github.com/Esposter/Esposter/commit/c5f83fb3495d26c157a5388dede35ae96e96cf9a))
* **storage:** reject a BlobCreated event older than the one already applied ([6ec9ce8](https://github.com/Esposter/Esposter/commit/6ec9ce891ae2cf1a3f2f1ec27b8f78b405891ef5))
* **storage:** the clone charges before its copy, and the meter is told from one place ([db46f94](https://github.com/Esposter/Esposter/commit/db46f9494c5e56178844500ef1678db645a094e9))
* **survey:** actually hide the creator banner, and say why it cannot be scoped ([cc88b2e](https://github.com/Esposter/Esposter/commit/cc88b2e7a949e04a27f34f141e4e9777a70cec43))
* **testing:** put back the camelCase describe titles ([deec761](https://github.com/Esposter/Esposter/commit/deec76154a783e97ebcef8786d4e85e96ff75c9b))
* **tests:** the authClient mock is typed the way every other one is ([f857af1](https://github.com/Esposter/Esposter/commit/f857af1d7a9e872df69b7230e4d7f486b022d0af))
* **test:** the storage cleanup covers both stores, and the retention claim admits the cascade ([decc64a](https://github.com/Esposter/Esposter/commit/decc64a7e198361cf452fafe45ee489561e62a20))
* **use-mutation:** superseding a key drops its joinable read too ([385ed67](https://github.com/Esposter/Esposter/commit/385ed67910687a9155dfbbf20a0a702f33cbee28))
* **users:** say what bowser actually knows about a device model ([4d63701](https://github.com/Esposter/Esposter/commit/4d63701d3c5e1e4b768926feb555e43420485d1c))
* **virrun:** a cold WSL distro is not a host that cannot sandbox ([47a7033](https://github.com/Esposter/Esposter/commit/47a70335f26738cd2c3fa4b7ac3d984113c7d037))
* **visual:** the globe disposes what it actually built ([2f3cd26](https://github.com/Esposter/Esposter/commit/2f3cd26a79f6b1d153fb8d5a876a2953f42aea81))
* **vuetify:** gate a dialog born open on its own mount ([a49d7ae](https://github.com/Esposter/Esposter/commit/a49d7ae3380b4120b58d9eae6975db09616bfa6b))
* **vuetify:** give the theme cookie a lifetime so a PWA keeps it ([f6fa580](https://github.com/Esposter/Esposter/commit/f6fa580948e6574a3804e25200eb247e559d46e8))

### Features

* **app:** give an escaped error a page of ours ([cd9bebc](https://github.com/Esposter/Esposter/commit/cd9bebcc1e2aa859cae5ef590c7b210480ebefc4))
* **dashboard:** turn a visual into a surface a reader can investigate ([1820dcd](https://github.com/Esposter/Esposter/commit/1820dcda4800541730e3ab40d6536580089ac571))
* **date:** Temporal answers the date questions, and the repo owns the two it cannot ([e298795](https://github.com/Esposter/Esposter/commit/e2987953a4dab58b3a89a758c1d431a9c33a1195))
* **db:** add the virtualBackground column migration ([573a25c](https://github.com/Esposter/Esposter/commit/573a25cae00abadbbe5a153b12afac5b0a054b49))
* **db:** migrate the three corrected message-table columns ([4739198](https://github.com/Esposter/Esposter/commit/4739198659d3940038b86152e3d4f77a44bd062a))
* dynamic storage usage subscription and storage meter updates ([823e115](https://github.com/Esposter/Esposter/commit/823e1154b028c9b7488011a625b357d63db7d5c3))
* **esbabbler:** custom call backgrounds in fixed per-user slots ([573cb77](https://github.com/Esposter/Esposter/commit/573cb779ae6b4f70a496c434fdcd78c0128b545d))
* **invites:** the expiry is a clock, and the pause control takes the shape of its act ([dd82f47](https://github.com/Esposter/Esposter/commit/dd82f47ab00ed6bd94f2a38d94c5ce3d330dbd01))
* **lint:** a rejection reaches the user through createErrorAlert only ([eef236b](https://github.com/Esposter/Esposter/commit/eef236be59d6ff512185c3f2b630619cf4ad9b25))
* **lint:** enforce the SFC props-interface convention with an oxlint plugin ([0f0762d](https://github.com/Esposter/Esposter/commit/0f0762d4cb2b3ebf812a0218c8202dad123b2f2c))
* **lint:** hand the trpc skill's two decidable halves to an enforcer ([d5e2df9](https://github.com/Esposter/Esposter/commit/d5e2df924aef35806753aa1d5575b6749ca9ce80))
* **lint:** lint JSON with eslint-plugin-jsonc and wire the staged config in ([90a19aa](https://github.com/Esposter/Esposter/commit/90a19aa41f3b124e0c8abdbdc3a81d3c2e5cd6c3))
* **message:** one viewer for a room's images and video ([c18fd5b](https://github.com/Esposter/Esposter/commit/c18fd5b0e6d293a974138a755a18ed3e203496e3))
* **notification:** render delivered rows and local feedback in one bell ([ed34189](https://github.com/Esposter/Esposter/commit/ed341891c7bd6466a431fbc1f304960d27b773bc))
* **platform:** every resource type gets revisions it can return to ([ef108dc](https://github.com/Esposter/Esposter/commit/ef108dcc49c4e3a3685d4a0e5de888a5edf9f019))
* **platform:** the restore takes the draft it replaces with it ([6d97dea](https://github.com/Esposter/Esposter/commit/6d97dea38b2a3658d7e4eb89d4e08b6bcc3e88ef))
* **platform:** the Status row says whether the world sees this draft ([b930521](https://github.com/Esposter/Esposter/commit/b93052160ee191e963a268c630cc2d0499ad7f6d))
* **platform:** version history is a panel over the thing it restores ([dd1e85b](https://github.com/Esposter/Esposter/commit/dd1e85bfa15f33bd748ffa1c390315d91abe516d))
* **post:** Reddit-style reply trees, with the chain on the row ([d422cd7](https://github.com/Esposter/Esposter/commit/d422cd73faf08b60f7a5612ec1b9684f597149c9))
* **resource:** publish resource operations as notifications ([ee25752](https://github.com/Esposter/Esposter/commit/ee257525517afdf70f01fa29b860776d1cb548ad))
* **room:** manage a room's invite links, and make ManageInvites mean something ([c6b9541](https://github.com/Esposter/Esposter/commit/c6b9541482c03fced3c0e909e11931d8fd98276a))
* **room:** search the Members and Bans panels by name ([954099d](https://github.com/Esposter/Esposter/commit/954099d79aefb4322efaa16c677b61fc728e7972))
* **storage:** charge a resource's own content blob to its owner ([245902d](https://github.com/Esposter/Esposter/commit/245902d9818693374b8f79ed965839240b274cc0))
* **storage:** charge publish snapshots and cloned assets to their owner ([031a38b](https://github.com/Esposter/Esposter/commit/031a38bc4e88f5d56c432dc3647b62276ca8c017))
* **users:** list and revoke the account's sessions ([bedfeb7](https://github.com/Esposter/Esposter/commit/bedfeb7958de0771ed6b813759ac5224588f02d4))

### Performance Improvements

* **ci:** install pnpm and node from GitHub releases via pnpm/setup ([60cd635](https://github.com/Esposter/Esposter/commit/60cd6359cb01ce321529629ed06f92e954a06209))
* **ci:** the app build is gated on a content hash like the packages are ([fed5a62](https://github.com/Esposter/Esposter/commit/fed5a6294e98e7ef157506f21edd6fb6153149d8))
* **ci:** the build cache keys drop what no build reads and pick up virrun's config ([243cbd7](https://github.com/Esposter/Esposter/commit/243cbd72cd6ceff311b11417b95f5df44a4e2049))
* **ci:** the package build cache restores by prefix, so a miss regenerates only the barrels that could have changed ([41f3c1d](https://github.com/Esposter/Esposter/commit/41f3c1d545d9a02e1ec2b9a78c3425a1f26d2fa8))
* **dashboard:** drop the canvas renderer v7 stopped bundling for free ([8c37ca4](https://github.com/Esposter/Esposter/commit/8c37ca49b000bb5ee8fc8749f62fb222b6202344))
* **db-schema:** index the unread notification count by its own predicate ([59b96d6](https://github.com/Esposter/Esposter/commit/59b96d6a0f822df4e85832774a1c056a6c33d61b))
* **platform:** a private package emits no declarations ([fa31aa4](https://github.com/Esposter/Esposter/commit/fa31aa4b26d5ba1d3e1573e2d1464990dd9272cb))
* **platform:** the barrel guard sees the one content change a barrel depends on ([afff291](https://github.com/Esposter/Esposter/commit/afff2915613dfea7f814a6080fa3c9f3bae0a5e9))
* **platform:** the build generates its own barrel, and skips it when it can ([696835c](https://github.com/Esposter/Esposter/commit/696835c457837d8737b8cd09b940dc97577cfc24))
* **resource:** load each editor and view renderer on demand ([874d7e2](https://github.com/Esposter/Esposter/commit/874d7e245b659689c7be5bed958ddcadc41fdfc9))
* **resource:** load each per-type blade on demand, and write the patterns down ([23ab98e](https://github.com/Esposter/Esposter/commit/23ab98e08988c3c9ea48a427e378d3c5cff1e40c))

## [2.38.1](https://github.com/Esposter/Esposter/compare/v2.38.0...v2.38.1) (2026-08-23)

### Bug Fixes

* **build:** export source under a condition, so Node still resolves the build ([42fb8d4](https://github.com/Esposter/Esposter/commit/42fb8d471a8917cc53d9b105fddfc481fc58ddaf))
* **build:** keep workspace source out of Node's own module loader ([4c3bfdd](https://github.com/Esposter/Esposter/commit/4c3bfddaf246c21f03d103a7aac44c7de9b8f97d))
* **build:** type auto-imported symbols in the shipped declarations ([ba64193](https://github.com/Esposter/Esposter/commit/ba64193d34aeba0c1223bc1e6c7e2ee814e1b5a9)), closes [#1089](https://github.com/Esposter/Esposter/issues/1089)

### Performance Improvements

* **azure-functions:** compress the deploy artifact ([838aae4](https://github.com/Esposter/Esposter/commit/838aae4d7684adf4c661ed2e63b6dc39fd711be5))

# [2.38.0](https://github.com/Esposter/Esposter/compare/v2.37.2...v2.38.0) (2026-08-23)

### Bug Fixes

* address the CodeRabbit findings from the 0b65d92f7..db14d8d76 review ([5a3df2e](https://github.com/Esposter/Esposter/commit/5a3df2e8ac07c6ce502b253c76d355c6a4d2575b))
* answer the docs review, and correct three claims it caught ([934d624](https://github.com/Esposter/Esposter/commit/934d624f43ef339ea14f2b8e0b29867611c3f8ba))
* answer the docs review, and enforce the label line break both ways ([9aae566](https://github.com/Esposter/Esposter/commit/9aae566e9ec4f91ce91dc31081ce0f4b1c4c161c))
* answer the review, and scope the new suites' constants to their describe ([2c923a2](https://github.com/Esposter/Esposter/commit/2c923a2a41481a7d5610cf8017e3edaabc9af0f5))
* **app:** restore the computeds the use-count sweep should not have inlined ([39b7aa1](https://github.com/Esposter/Esposter/commit/39b7aa16c3af79f17ce483658d29dee76f3b959b))
* **app:** route a thread call's link to the thread it belongs to ([812ea9f](https://github.com/Esposter/Esposter/commit/812ea9fde0f34d7f5984f6b9efdfe4065ff28d60))
* **auth:** count account rows for the last-account guard ([4514525](https://github.com/Esposter/Esposter/commit/45145255e1129db8c8aab22ee52a5cd3c56129f4))
* **auth:** name the adapter test block after its export, drop the useless fallback ([c993bd6](https://github.com/Esposter/Esposter/commit/c993bd67bfa97ffa9323c8370fabad9f7c4cd2d8))
* **call:** stop treating any insert failure as a taken session id ([03bbe83](https://github.com/Esposter/Esposter/commit/03bbe835dbbb2740e0f528db6b6d4c01e90f348c))
* **clicker:** pick the weighted band the random value falls inside ([99111e0](https://github.com/Esposter/Esposter/commit/99111e0ffd935cef4b7f0e53ef1aa42d40f7e848))
* **coderabbit:** drain the review's findings at every severity ([3f6be53](https://github.com/Esposter/Esposter/commit/3f6be536a74978ad5bff2a71f10750ac01b8c0dc))
* **coderabbit:** drain the second review's findings ([9bba2f2](https://github.com/Esposter/Esposter/commit/9bba2f23688e9aa0c23046b61499093bc486ed7e))
* **dashboard:** pick a visual's type on the visual, not in the toolbar that adds it ([898676f](https://github.com/Esposter/Esposter/commit/898676fede342b3d8ba7d1b4bb84749188d958cd))
* **dates:** correct what NuxtTime actually does on the server ([409e6da](https://github.com/Esposter/Esposter/commit/409e6dac74685ad7e71ea12ffaada49b563ec046))
* describe a constant map by name, not by the map itself ([5f43312](https://github.com/Esposter/Esposter/commit/5f433127ce87a7ccef0e8ca2fe734438f91d4cf8))
* **docs:** let the framework raise the 404 instead of watching for one ([736f986](https://github.com/Esposter/Esposter/commit/736f986d1362ab1c02b88eeed1529b4be05c8564))
* **docs:** let the router own hash navigation instead of preventing it ([027bf9f](https://github.com/Esposter/Esposter/commit/027bf9f32a392fe3f9b6bc1b9ee2caf7c8b02cf1))
* **docs:** recompute the table of contents once the scroll settles ([79c98f8](https://github.com/Esposter/Esposter/commit/79c98f8025dd02cda867bc2fee84ca25eba697d8))
* **docs:** stop leaving the docs tree raising a 404 ([248d980](https://github.com/Esposter/Esposter/commit/248d980e3dcbec5fa7fb5a8f117a4d1664554ba5))
* **drafts:** identify a draft row by its composer, not by its room ([0b539f4](https://github.com/Esposter/Esposter/commit/0b539f46d98a908ab69c79645a2b1922d07fea2a))
* **dungeons,pagination:** answer the fourth review ([189f9bb](https://github.com/Esposter/Esposter/commit/189f9bbb05ff74df7663d1a7959e6fee23a8a129))
* **dungeons:** let the cursor cross a short row, and search the last one ([cca90a1](https://github.com/Esposter/Esposter/commit/cca90a1d74c0db45a2cc495d72df387ade266fec))
* **emoji:** give the picker a mobile container ([388c0a9](https://github.com/Esposter/Esposter/commit/388c0a97f0833c2794b0ac7cd2884b7594cf5fa9))
* **emoji:** keep the Options API runtime for the emoji picker ([289c79e](https://github.com/Esposter/Esposter/commit/289c79ea7970804ec5d8dbb0ab71b709665720fd))
* **emoji:** render the picker's overlay, and name its category tabs ([40470db](https://github.com/Esposter/Esposter/commit/40470db2a8cec96f1d03e1004472fdd31e5dc4bb))
* **esbabbler:** default a call session to the room's own thread ([a6264b3](https://github.com/Esposter/Esposter/commit/a6264b3aacc912469079a222eec4a694bed5272c))
* **esbabbler:** give the emoji picker the hover colour a button has ([ced8059](https://github.com/Esposter/Esposter/commit/ced80596e97eca8a9fe0892b63f7657debfb1d8d))
* **esbabbler:** make the settings rail slide between groups, not from zero ([f5354a8](https://github.com/Esposter/Esposter/commit/f5354a8cec76e92a18af5ad581685a9dd08fcb43))
* **esbabbler:** validate an emoji name through whichever form its rule took ([e860291](https://github.com/Esposter/Esposter/commit/e860291d880ebe6707b0fd6a5df22e0846141829))
* green up CI, and close the review findings it did not catch ([dde8ffe](https://github.com/Esposter/Esposter/commit/dde8ffebb357415245186d6e803242608bcaf53e))
* **image:** register @nuxt/image with vitest, and refresh the snapshot ([73239f0](https://github.com/Esposter/Esposter/commit/73239f0e80f88732ac5195294fce3da2a10481e0))
* **invites:** answer the review — lock the room around the pause check, and stop two rollbacks resurrecting dead state ([d287e80](https://github.com/Esposter/Esposter/commit/d287e80c9d5e8649022a768fd921bacf89412563))
* keep content.config.ts on a literal, since postinstall runs before the build ([c73e6df](https://github.com/Esposter/Esposter/commit/c73e6dfcaf9de1db7b4f10dac419a6397dbdf7e5))
* lint ([4fcd9af](https://github.com/Esposter/Esposter/commit/4fcd9afc1d01a14689625955eeacd0b28cce0da4))
* **lint:** disable the .then ban where a fire-and-forget deregisters itself ([d8f76db](https://github.com/Esposter/Esposter/commit/d8f76db0818d0b3eed9dc60762906ad4e19ee612))
* **lint:** drop the unused room store from the call store ([c625d53](https://github.com/Esposter/Esposter/commit/c625d534b46bbbc8b1670ec71905e2f669a920a1))
* **lint:** hoist the vote-button like factory out of its describe ([a786151](https://github.com/Esposter/Esposter/commit/a786151fd23778f10dccfc708d5e0ca8d2e03371))
* **message-search:** never issue a search with nothing in it ([3068612](https://github.com/Esposter/Esposter/commit/30686121699f72a212c752ba639946c12305c902))
* **message:** keep drafts and thread replies that a race would drop ([f460e0c](https://github.com/Esposter/Esposter/commit/f460e0cea54e160efb7d4ca48dfc385ebb10bf8b))
* **messages:** client-render the messages routes ([c83d430](https://github.com/Esposter/Esposter/commit/c83d430cc2e6649759a5902cfecbeac9c5e4ddb5))
* **overflow-menu:** carry disabled and colour into a submenu ([6cf91b8](https://github.com/Esposter/Esposter/commit/6cf91b835c1b329bc2286342d9892015b0405410))
* **pagination:** give the unkeyed slice the appending read too ([346a260](https://github.com/Esposter/Esposter/commit/346a260ed4b3ccf2ba3729da5b9664498f66f32d))
* **pagination:** single-flight the appending read ([18a343e](https://github.com/Esposter/Esposter/commit/18a343ee4b3c4f1614b26f5f9cbc76f7e9a9eec0))
* **pagination:** stop SSR'd lists reading twice per page load ([17a40f4](https://github.com/Esposter/Esposter/commit/17a40f426c06e2e9ab3f5cc880bfeb881b4ab158))
* **posts:** answer the review — an edit reports whether it landed, like a create ([4e2e646](https://github.com/Esposter/Esposter/commit/4e2e6462ee91ffe43bf114e92c16ccbf24c217c4))
* **posts:** sweep posts and achievements against the ux rules ([cff9cd1](https://github.com/Esposter/Esposter/commit/cff9cd1b337d8e9c05e07ea7cc58c550bcc6ca46))
* **rbac,moderation:** close the two hierarchy bypasses and answer the review ([3583254](https://github.com/Esposter/Esposter/commit/3583254f9c703b1a78b073078e16cfce55a1db61))
* **resource-editors:** sweep the dashboard and flowchart editors against the ux rules ([149b5bd](https://github.com/Esposter/Esposter/commit/149b5bd4b5f36bfb598127b5ed26a6320e1d035e))
* **resource:** give each import/export format its own icon ([2ff8225](https://github.com/Esposter/Esposter/commit/2ff82255112f9bd336d391574e4cd492dd62de0e))
* restore the vue-phaserjs POSIX bundle snapshot, and normalise esbabbler link text ([ed8338b](https://github.com/Esposter/Esposter/commit/ed8338bcb8d2c638d0bcac7f4ef203a5ae062462))
* restore typecheck and lint to green ([198d8d4](https://github.com/Esposter/Esposter/commit/198d8d4da263462eaec7552a6cd05018de8f75b5))
* **review:** address the CodeRabbit findings on the emoji picker and testing docs ([58f604c](https://github.com/Esposter/Esposter/commit/58f604ca2e7efa1d5494e85dbc93e917962401f4))
* **review:** address the CodeRabbit findings on the hydration and search changes ([3b85352](https://github.com/Esposter/Esposter/commit/3b85352b9bb78ff4ec1fb353e73c485d698ffb36))
* **room-settings:** file a room-scoped write under the room that issued it ([8b554e6](https://github.com/Esposter/Esposter/commit/8b554e6ff1399c6cef85a423e81ec2a300402952))
* **room-settings:** open another room's settings without going there ([5eac69f](https://github.com/Esposter/Esposter/commit/5eac69f9eeea4523b145dbbee60816b7bf450007))
* **routing:** keep the breadcrumb trail a history entry can hold ([7172bd8](https://github.com/Esposter/Esposter/commit/7172bd80d37e9b00a7edeaeb18769e439e419f60))
* **search:** close the menu on blur, so Vuetify's clear is swallowed ([1e218d8](https://github.com/Esposter/Esposter/commit/1e218d8d923a8ff12a43ba0830d02ed26c1b4743))
* **search:** restore the focus save/restore, guarding only the race ([4bb1a99](https://github.com/Esposter/Esposter/commit/4bb1a9969b491f9837a4255dce802fc05b14e0a8))
* **search:** search on typed text instead of forcing it into a filter ([63ea583](https://github.com/Esposter/Esposter/commit/63ea583895c41468a5578f7048a525464553b413))
* **search:** stop Vuetify's focus clear from eating the typed query ([e284231](https://github.com/Esposter/Esposter/commit/e28423157decb3896390eab1e8c6cf6e9955430c))
* **sheet-export:** tick the columns the export is actually going to send ([4815ffd](https://github.com/Esposter/Esposter/commit/4815ffd5feb108d481d9c7a6b7ffc1a4c49e9659)), closes [#1086](https://github.com/Esposter/Esposter/issues/1086)
* **sheet:** make Import one control with a menu, the way Export already is ([f0c30d1](https://github.com/Esposter/Esposter/commit/f0c30d15cb76b7e9a5706c8cd2bb0d2804f37155))
* **sheet:** name a format the way the format is written, and stop the empty state naming one ([231c566](https://github.com/Esposter/Esposter/commit/231c56604ab90abd3aa4e3c1237977738feb4cdc))
* **sheet:** one place to import or export, and one menu for the data tools ([03d7e8c](https://github.com/Esposter/Esposter/commit/03d7e8c1e204f8808df54513e3079da74ac1c133))
* **skills,docs:** answer the fifth review and refresh the azure-functions bundle ([2f48e76](https://github.com/Esposter/Esposter/commit/2f48e76e2dfd34068d8ab415dba90441612e9e56))
* **slide-indicator:** key the remeasure watch on an encoding keys cannot collide in ([e605ead](https://github.com/Esposter/Esposter/commit/e605ead4faa0318ead828986832a435f59aaac8e))
* **store:** file a room emoji read and write under the room it was issued for ([aa9525b](https://github.com/Esposter/Esposter/commit/aa9525b2d664abffad9693d27f24162d9192c7d2))
* **store:** name the partition for the last four ambient writes ([7ea7b8c](https://github.com/Esposter/Esposter/commit/7ea7b8c26d254b8371337f4236d85e40ed3d0fe0))
* swap the platform bundle snapshots and answer the docs review ([368f392](https://github.com/Esposter/Esposter/commit/368f39208af5f03070c49eda54648c9177e27c51))
* **test:** satisfy the mock-type and scoping rules in the save-edit test ([bd80073](https://github.com/Esposter/Esposter/commit/bd80073303ceaeade277b31fa97ddfbc14887611))
* **test:** stop two createRoomMember calls consuming each other ([95986c0](https://github.com/Esposter/Esposter/commit/95986c06ff745eb683d59fdcbb29a0d9a12b14fc))
* **theme:** resolve the system theme server-side via client hints ([023a4c5](https://github.com/Esposter/Esposter/commit/023a4c5968764a6a9b632d227ab0031c62273f9d))
* **user-settings:** put identity where the settings that describe it already are ([bd84711](https://github.com/Esposter/Esposter/commit/bd847111c149f9dacdea04cc8a13be582909d949))
* **vuetify:** ban per-field hide-details now every call site is clean ([81ddab2](https://github.com/Esposter/Esposter/commit/81ddab209b28d8846ad013e8fba56df1adb9a33a))
* **vuetify:** drop the drawer elevation override ([42dbac6](https://github.com/Esposter/Esposter/commit/42dbac6bfbd8d9c8bc102ea2be7083de1c472a65))
* **vuetify:** give the resource explorer drawer back its elevation ([9c49552](https://github.com/Esposter/Esposter/commit/9c4955244bbf90f6c5ae6292fffaf2d6b2d2614d))
* **vuetify:** route every drawer through StyledNavigationDrawer ([6d23540](https://github.com/Esposter/Esposter/commit/6d23540e2eaaac2220f1912253f3cc31978325f6))
* **vuetify:** shadow a drawer while it is open and not temporary ([54d34e4](https://github.com/Esposter/Esposter/commit/54d34e482ab402a052f3fdc268a2b2c934a9d58c))

### Features

* **dialog:** let a command palette drop the toolbar chrome ([99f909c](https://github.com/Esposter/Esposter/commit/99f909cce06ddfa8cd5ea21bfa1e70eb2831ef1d))
* **emoji:** replace both emoji libraries with one in-repo index and picker ([8a829de](https://github.com/Esposter/Esposter/commit/8a829de9b771b3647e72039029b55685b2383b74))
* **emoji:** tone-sensitive reactions, a reaction hover card and the Reactions dialog ([6ae1cbf](https://github.com/Esposter/Esposter/commit/6ae1cbfbde31b955572f2d9eb8c0119620fd3f07))
* **esbabbler:** add custom emoji from the picker footer, not room settings ([5555a5e](https://github.com/Esposter/Esposter/commit/5555a5ec044f7e552b3cd78fe7c022af76a57080))
* **esbabbler:** make a thread a place you work in ([ee35826](https://github.com/Esposter/Esposter/commit/ee3582692730b4806a2453d5cea8523201cf4ecd))
* **esbabbler:** per-room custom emoji ([350c183](https://github.com/Esposter/Esposter/commit/350c18335ae63516a2aa259de1a369481aaf1077))
* **esbabbler:** say what a room permission grants, on the screen that grants it ([2be48ed](https://github.com/Esposter/Esposter/commit/2be48ed007a81216d28591c9e53be749d6776683))
* **image:** move every image onto NuxtImg, and ban v-img ([7465881](https://github.com/Esposter/Esposter/commit/74658817bc9d9ff8b500f45caffd9999791824c4))
* **invites:** Discord's invite surfaces — a panel that lists and pauses, a dialog that hands over a link ([7f5fdec](https://github.com/Esposter/Esposter/commit/7f5fdecf4e028a9320fd70dea3062c97e05c9927))
* **invites:** revoke a link, and one composer menu instead of two plus buttons ([32b5ae9](https://github.com/Esposter/Esposter/commit/32b5ae9ba18abf11f61be08c3a15d5f755ca8f5f))
* **lint:** ban try/catch and .then, and stop restating what oxlint enforces ([5263dd3](https://github.com/Esposter/Esposter/commit/5263dd373647adeb3dc1c03290bf24b731db31fd))
* **search:** allow many filters of one type, and add has:file ([6cd4b39](https://github.com/Esposter/Esposter/commit/6cd4b390abfd99b8a6aced9a6ffb5846d4575682))

### Performance Improvements

* **docs:** drive the table of contents from an observer, not the scroll event ([48cbc17](https://github.com/Esposter/Esposter/commit/48cbc17922f792ce228d4d205191718af70fa943))
* **docs:** stop remeasuring the rail when the active set has not moved ([7bfd24c](https://github.com/Esposter/Esposter/commit/7bfd24c8af3df75167c849409ed676c90b1832fa))
* lazy-load the full PDF viewer ([4cc5ebc](https://github.com/Esposter/Esposter/commit/4cc5ebceadc7ec1114e1afa5aff4b37cb262e067))

## [2.37.2](https://github.com/Esposter/Esposter/compare/v2.37.1...v2.37.2) (2026-08-14)

**Note:** Version bump only for package @esposter/app

## [2.37.1](https://github.com/Esposter/Esposter/compare/v2.37.0...v2.37.1) (2026-08-14)

**Note:** Version bump only for package @esposter/app

# [2.37.0](https://github.com/Esposter/Esposter/compare/v2.36.0...v2.37.0) (2026-08-14)

### Bug Fixes

* **achievement:** assign the map category last so a definition cannot overwrite it ([90097d5](https://github.com/Esposter/Esposter/commit/90097d5151e97ec8ee716f84a9397b51e5b2de47)), closes [#1059](https://github.com/Esposter/Esposter/issues/1059)
* **achievement:** stop publishing other people's locked achievements ([976dd43](https://github.com/Esposter/Esposter/commit/976dd430155096380dbce7918e707b856d715b46))
* address the CodeRabbit review, and widen the record glob ([8df25e4](https://github.com/Esposter/Esposter/commit/8df25e45352e8c9b75a7879df5d41fa1de31dea9))
* address the review round on the docs sync ([3995930](https://github.com/Esposter/Esposter/commit/39959306f109849abc41fb7a640f6d9fd5f7123e))
* answer the review on the filter pills, the reorder recipe and the probe ([8591234](https://github.com/Esposter/Esposter/commit/8591234e8cdeae520d0fbe3f90a2ef71beaac7f9))
* **app:** answer the review ([0292ba6](https://github.com/Esposter/Esposter/commit/0292ba62a5f25a6d4b30952e3e7d73e1aa617a20))
* **app:** answer the review on the status draft, the webpage load and a shared test list ([957ae18](https://github.com/Esposter/Esposter/commit/957ae186f484e05e0962408cb7db53126438a6dc))
* **app:** answer the review's store-test findings ([96db6c8](https://github.com/Esposter/Esposter/commit/96db6c84ccc8f294bd52a36f8d22217013ea715c))
* **app:** make a key mean what it reads as, and derive what is derivable ([b8176f8](https://github.com/Esposter/Esposter/commit/b8176f8d3d82365451315aa283f0e4630d3b784d))
* **app:** scope every optimistic rollback to the write that made it ([3b79428](https://github.com/Esposter/Esposter/commit/3b7942864a8ee8be8b11dfc87d29b1f8232dc07a))
* **azure:** distinguish an absent entity from a read that failed ([696379f](https://github.com/Esposter/Esposter/commit/696379f253dad65af6b6655a37bff2e9b055fdd9))
* bind per-key state where an operation is issued ([71f47c6](https://github.com/Esposter/Esposter/commit/71f47c6fc77fec4101e4958a901753c5892f488b))
* **build:** stop the shared build preset from squatting on configuration's own build config ([7926319](https://github.com/Esposter/Esposter/commit/792631944592810a2a60eb24184fdd0c3de45555))
* **call:** drop the last isHandRaised drilled beside the participant carrying it ([3deb69f](https://github.com/Esposter/Esposter/commit/3deb69fea138e12b9cc87e58c0d488f16833617b))
* **ci:** green the two checks that have been red on develop ([49d5640](https://github.com/Esposter/Esposter/commit/49d5640418e97f4907d933820b266f65f51e1bba))
* close the CodeRabbit review findings ([1827015](https://github.com/Esposter/Esposter/commit/18270158f5b8b0134e9a85e4da3f1504ba5b2756))
* close the review findings in the mirror excludes and the review workflow ([fa4d878](https://github.com/Esposter/Esposter/commit/fa4d878d4ab302ae9fd487d9c3c59dfdfa647a02))
* close the review findings on the drained release window ([f9290fe](https://github.com/Esposter/Esposter/commit/f9290fe9406f62b9a73858e6e96f542e944abbb7))
* close the review round on account linking, rate limiting and the record ([4515b31](https://github.com/Esposter/Esposter/commit/4515b3190de08d45037a466252e70da21c65ff44))
* close the seams the merged review branches left ([f2c0b26](https://github.com/Esposter/Esposter/commit/f2c0b26d3f405ef1c6fceae05f93eaea16e74e8b))
* code review comments ([813b854](https://github.com/Esposter/Esposter/commit/813b854939772e4f8600b85116a22dfbe6374d2b))
* coderabbit review comments ([0bd90d5](https://github.com/Esposter/Esposter/commit/0bd90d5666c7fb23d70a8f3fce5b782d312ff8c1))
* converge resource client list, search and sheet review findings ([92bef09](https://github.com/Esposter/Esposter/commit/92bef09d207bf64d25827935e9cabd61c6167774))
* **dashboard:** make autosave actually fire, and tick the sheet sweep ([ed21970](https://github.com/Esposter/Esposter/commit/ed219702d923dbf566fdb09c3465d0647b0991fe))
* derive worktree excludes from git's recorded facts ([f3f1c65](https://github.com/Esposter/Esposter/commit/f3f1c65e0c37f1528f9cc3da2d114bba04527178))
* dialog UI ([b708502](https://github.com/Esposter/Esposter/commit/b708502804a1848d172e4e5740bffc889c1c0b4e))
* docs ([c01bb99](https://github.com/Esposter/Esposter/commit/c01bb9960fa28f34529612963580bda3331335e6))
* **docs:** give the navigation overview items unique list values ([ae4d753](https://github.com/Esposter/Esposter/commit/ae4d753a17bf908d7a5713913ea0f63fb09cf35b))
* **docs:** highlight the active category tab instead of Overview ([dd9c9f2](https://github.com/Esposter/Esposter/commit/dd9c9f2fac6a69e41916c5d7a8aadeea629f08ac))
* **docs:** pre-bundle mermaid so its dayjs chunk is not re-optimized mid-session ([4522ccc](https://github.com/Esposter/Esposter/commit/4522ccc93e862a38414049eb4dcc008d755bfe61))
* **docs:** stop the sidebar rendering a folder's index twice ([6b20f97](https://github.com/Esposter/Esposter/commit/6b20f9712a737780d593ab1420adb89d6815afca))
* **docs:** validate repo-root paths in Key Files tables ([c016e11](https://github.com/Esposter/Esposter/commit/c016e11bc4ee1956f2478f5bce35021603a7ed73))
* **grapesjs:** restore the catchall both editor schemas lost to a shape spread ([9426138](https://github.com/Esposter/Esposter/commit/94261389f7a3ad44c84ad239869f80c2fc68e782))
* lint ([5184c21](https://github.com/Esposter/Esposter/commit/5184c2188828c36afa4f1e165508c5676b01c5a4))
* lint ([b01e838](https://github.com/Esposter/Esposter/commit/b01e83872201df9380eca41551ca9748441cbdfb))
* lint ([7a9e825](https://github.com/Esposter/Esposter/commit/7a9e825b34ed00c6adfcec467d01a2f34b188e40))
* lint ([5edb305](https://github.com/Esposter/Esposter/commit/5edb305273553d8f8a196a68bec81675b95ec0cb))
* lint + warnings ([a80e67d](https://github.com/Esposter/Esposter/commit/a80e67dc589d9b87d69270d741c35baadb150d3d))
* lint and snapshots ([cba23c7](https://github.com/Esposter/Esposter/commit/cba23c7f291eee44e615e0f226d0d4cbf1a6da78))
* lint and snapshots ([9957a4a](https://github.com/Esposter/Esposter/commit/9957a4a6c46d712c1a9f49a4fb3ecf8af79bf5b3))
* **lint:** move the messages layout comment out of the template root ([62cbbfb](https://github.com/Esposter/Esposter/commit/62cbbfbd5334367151306474ef8fea077ad39662))
* **lint:** read the rate-limiter key branch positively ([a810e61](https://github.com/Esposter/Esposter/commit/a810e61b97e7a35c498ece56f51dd0fa3a14f50f))
* **lint:** use mockReturnValue for the console.warn spy ([8513f57](https://github.com/Esposter/Esposter/commit/8513f576b91ba1d2b5af22a7f4d4cd4ca42b44d2))
* make the indexedDb mock restore unconditional ([755d99d](https://github.com/Esposter/Esposter/commit/755d99d3c717825106fc5a3dc02e98e865f495bc))
* **message:** stop votes deleting poll labels and re-following unfollowers ([10a997c](https://github.com/Esposter/Esposter/commit/10a997c546f064774e5ea8b45ab1763d8e817086))
* parse virrun's machine JSON without the date reviver ([68a2d24](https://github.com/Esposter/Esposter/commit/68a2d24949a1d5d4f6252ab163bb1978feeb370a))
* **platform:** close the storage-quota review findings ([bb01ac6](https://github.com/Esposter/Esposter/commit/bb01ac6a74405af5d71debd46b7a30b5f811c1a2))
* **platform:** correct the residual-quota-gap bound, lock users in a fixed order ([a707ea0](https://github.com/Esposter/Esposter/commit/a707ea05686587a72228e645306e6da317970cc9))
* remove disabling necessary rules ([17369c1](https://github.com/Esposter/Esposter/commit/17369c1a6e09bfcb3391539dfb803bb9abfe9f3a))
* resolve the mirror excludes once from the run's environment ([6b687cc](https://github.com/Esposter/Esposter/commit/6b687cc16931fa233f61634973aa54079f87736c))
* **resource-explorer:** answer the review on the router and blade tests ([e06522b](https://github.com/Esposter/Esposter/commit/e06522bbe41820d3308bf371eef65713b41feb48))
* **resource-explorer:** clear the lint failures and the review findings ([17e2269](https://github.com/Esposter/Esposter/commit/17e226974b5d7c86c104980b9dedbf2cfdea57d8))
* **resource-explorer:** clear the oxlint errors my last commit introduced ([ca575d9](https://github.com/Esposter/Esposter/commit/ca575d98fd84f5476bb1b6b12f6da310cadf9e8a))
* **resource-explorer:** make the service menu a Home-only hamburger drawer ([55d0035](https://github.com/Esposter/Esposter/commit/55d0035d61704067f7dc1d549cf3bfa154b1c2a0))
* **resource-explorer:** make the tag controls look like controls ([de89e78](https://github.com/Esposter/Esposter/commit/de89e7845498bfd8137e62d1f6828852d3b97a61))
* **resource-explorer:** restore a filename's case, and answer the review ([498e50d](https://github.com/Esposter/Esposter/commit/498e50d9f90e2aa66faad3590c86d68bfc9f1dd3))
* **resource:** guard the post-commit binding write on its own version ([aaf76be](https://github.com/Esposter/Esposter/commit/aaf76be66511ec05a73cb602728da3b8d6cbf9f0)), closes [#1059](https://github.com/Esposter/Esposter/issues/1059)
* **resource:** parse content at the one path that writes it ([6f8d1a3](https://github.com/Esposter/Esposter/commit/6f8d1a3a36cbbb6eeefbf440aabc3c69336151a8))
* **review:** address the open CodeRabbit findings ([68a3331](https://github.com/Esposter/Esposter/commit/68a333188408d4fdb3ef1c559c86247cb5a13a72))
* **review:** address the second round of CodeRabbit findings ([f8d62ad](https://github.com/Esposter/Esposter/commit/f8d62adef4e085c173530816c463ff814d73e2c8))
* **review:** answer the CodeRabbit findings on the Styled window ([9470340](https://github.com/Esposter/Esposter/commit/9470340e396e8f5e1d84632aca0fd396270e9001))
* **review:** close the backfill race and the stale-binding window ([51f2a99](https://github.com/Esposter/Esposter/commit/51f2a99aa7963b6ee78a027ed889e49aacc3b732))
* **review:** drain the CodeRabbit findings from the routing-ban review ([1b7c4bc](https://github.com/Esposter/Esposter/commit/1b7c4bce8fe75137278d19c4557fc48984437d24))
* **review:** drain the open findings from the last review cycle ([6654740](https://github.com/Esposter/Esposter/commit/6654740f01b802a998a48ebab1c90c6b18e31f70))
* **review:** drain the review findings and clear the root lint gate ([66c8f53](https://github.com/Esposter/Esposter/commit/66c8f53991305944abdd0d1df658229ce5197391))
* **review:** land every partial save on a binding the blob backs ([2df3fd1](https://github.com/Esposter/Esposter/commit/2df3fd1d4a86c693d105b5272c4f3be820c3d8d1))
* **routing:** read the live route, and ban the API that froze it ([61430f3](https://github.com/Esposter/Esposter/commit/61430f321456d320d36e38831bbada6816732ece))
* satisfy oxlint in the docs consistency test ([7113569](https://github.com/Esposter/Esposter/commit/7113569e6000696d99345db9ca968af3bc33ce9a))
* **search:** throttle the search call, not a copy of the query ([f87a034](https://github.com/Esposter/Esposter/commit/f87a0345a90b7966782aed03c48b7628ce01c8fd))
* **server:** let withResourceRollback return the promise it declares ([66de5ee](https://github.com/Esposter/Esposter/commit/66de5eeb3512aac9fdd50ea53aecf559b3e37b71))
* settle the two things the main merge broke ([df8c6fc](https://github.com/Esposter/Esposter/commit/df8c6fc97247405ecad6d6d3e8c554b7b455f321))
* **shared:** rewrite jsonDateParse's reviver as guard clauses ([cd922c9](https://github.com/Esposter/Esposter/commit/cd922c90dbc70cd4aace6b4cb9c8dc762ef92943))
* **sheet-editor:** clear the lint errors the ported window carries ([2f2f7d2](https://github.com/Esposter/Esposter/commit/2f2f7d2f7944593b831c8f697815e13f06c0a23b))
* **sheet-editor:** make develop green without the queue window ([28d3db7](https://github.com/Esposter/Esposter/commit/28d3db7fc635e1e7aa04c85de479687f8bfd0897))
* **sheet-editor:** make undo a true inverse, and prove it for every command ([b6a673c](https://github.com/Esposter/Esposter/commit/b6a673c9bb321ccb86693310bce9c788cae83af5))
* **sheet-editor:** say what extractSchemaFields returns, and narrow a test to its claim ([3c30091](https://github.com/Esposter/Esposter/commit/3c3009143ea6b37bb9ecf1ec6517550780fc2d17))
* **sheet-editor:** stop CSV and JSON imports corrupting cells ([fe659e1](https://github.com/Esposter/Esposter/commit/fe659e120f840b58fd93e35d2a0c1f89b1174cc7))
* **sheet:** suppress TS2590 in place instead of moving the click-outside ref ([2e54209](https://github.com/Esposter/Esposter/commit/2e542098dab5a344a9bb70ddc6924338fe7469b2))
* skills ([af5fa7d](https://github.com/Esposter/Esposter/commit/af5fa7dd768c3b014b886a89a0e708f657cbfc50))
* **styled:** stop the form shell fabricating an actions slot ([e6ef4b7](https://github.com/Esposter/Esposter/commit/e6ef4b7aa3b99da956475282bcf50ace5782268b))
* **styles:** drop the global border reset that erased every Vuetify input ([b014409](https://github.com/Esposter/Esposter/commit/b014409be348ff4c6d00683d1b2be258f6376d72))
* **styles:** stop bare b-solid painting a 3px frame on every side ([ab2b864](https://github.com/Esposter/Esposter/commit/ab2b86465e0d4353dc83d5896ef19b1f89b25935))
* **styling:** let de-emphasised text follow the theme ([59e2ab3](https://github.com/Esposter/Esposter/commit/59e2ab3e108c8b33731da7577619830aad2e6777))
* **survey:** give a survey one response total, not two ([750ba6c](https://github.com/Esposter/Esposter/commit/750ba6c040fb0ae0804523203486905e67d5142c))
* test ([e8b9c0f](https://github.com/Esposter/Esposter/commit/e8b9c0f78a21b13f62fb111813c8f391e0249d42))
* test renames ([c106891](https://github.com/Esposter/Esposter/commit/c1068915c3c9e9f277332641a328e010ea7abe33))
* **test:** hold the search result list's navigation inside the test ([15983f1](https://github.com/Esposter/Esposter/commit/15983f18c93e691af45eddeebf980b424f85e5d3))
* **test:** keep the admin action table as literals ([70462d1](https://github.com/Esposter/Esposter/commit/70462d13f8045c261a99d9a1465b3da86c8555ec))
* **test:** keep the vitest environment directive on the first line ([947d50e](https://github.com/Esposter/Esposter/commit/947d50ecbc879444095ec8dbdaf8666a2bccd49a))
* **test:** stop faking the clock the row keys are built from ([94aed33](https://github.com/Esposter/Esposter/commit/94aed334192847622654740eb069cb2f0e1f821b))
* **test:** stub the search result list's navigation instead of flushing it ([64233ef](https://github.com/Esposter/Esposter/commit/64233ef8ab7f71afc61376efaba4f0209e6efc90))
* **trpc:** add the two rejection guards 6788f6bfa left untracked ([f03301b](https://github.com/Esposter/Esposter/commit/f03301bd71ebdecaea6decf89163a08d4b774e22))
* **trpc:** stop leaking other members' search histories, and delete a bypass ([3298298](https://github.com/Esposter/Esposter/commit/3298298ce365cb3c8131cb998084265feeecc5ef))
* **users:** keep a settings sidebar item active through a callback query ([ce8f3f7](https://github.com/Esposter/Esposter/commit/ce8f3f76e9ebf14b38f772753ec33cdbb97e041f))
* virrun ghost paths ([4ab9236](https://github.com/Esposter/Esposter/commit/4ab923680fd64aa3e2dc59c960403f1f8290768a))
* wip ([142bc52](https://github.com/Esposter/Esposter/commit/142bc52b94f49ebe179bb1540f423a2f26014759))
* wip ([b6957a3](https://github.com/Esposter/Esposter/commit/b6957a3c0ef807704c990032047710d344b10d65))
* wrong components ([fb20de7](https://github.com/Esposter/Esposter/commit/fb20de7171a4a3467327e7baf9f826949d49e01b))

### Features

* **cache:** invalidate session caches by tag ([e17cf65](https://github.com/Esposter/Esposter/commit/e17cf6574f64aa959a36c6bca9785eff3cacb566))
* **db:** drop the storage_blobs sweep index ([3680a7b](https://github.com/Esposter/Esposter/commit/3680a7b02ee334a994679b21bc097a405e46e702))
* **lint:** enable accessibility linting on Vue templates ([8bef605](https://github.com/Esposter/Esposter/commit/8bef605af27985370c6380ffb6a355eba25a3d65))
* **platform:** enforce per-user blob storage quotas ([d6aab71](https://github.com/Esposter/Esposter/commit/d6aab71ecf5565cf287a63e43cc4e18214f12368))
* **platform:** resource shell layout, storage meter, and a click-path breadcrumb ([7d1d954](https://github.com/Esposter/Esposter/commit/7d1d954e8471a46b955472c27e386a4b97f333bb))
* **resource-explorer:** add the service menu, with Recent and Favorites as list routes ([cd23cc5](https://github.com/Esposter/Esposter/commit/cd23cc594c2145e10a252e1a1e352eb2e94bee1c))
* **resource-explorer:** drop the split view, and name the area everywhere ([6b6f03f](https://github.com/Esposter/Esposter/commit/6b6f03fade342eaf96d8e8414bd6124343ab4bf6))
* **resource:** spend the header's width instead of repeating the name ([4440e87](https://github.com/Esposter/Esposter/commit/4440e87c6d1bac05e61dcc740e225051037c1afe))
* **sheet-editor:** render and search formatted cell values ([0ac7afc](https://github.com/Esposter/Esposter/commit/0ac7afcf1b63c9de510af22b07dcd05c576d400a))
* **styled:** let a dialog have nothing to confirm ([b23a224](https://github.com/Esposter/Esposter/commit/b23a22419caed0c376e83f9ca8b12e21280e0594))
* **users:** link several social providers to one account ([06e52bb](https://github.com/Esposter/Esposter/commit/06e52bb4fed26d583fbc5244837b53f306fc1e83))
* **vuetify:** give every navigation drawer the drawer shadow ([2fd5f2d](https://github.com/Esposter/Esposter/commit/2fd5f2d6018bee28f59967eeaa1fb3bab7f12a61))

### Performance Improvements

* **app:** load the xlsx codecs at use, and stop rewriting an unchanged flowchart ([a1faa6b](https://github.com/Esposter/Esposter/commit/a1faa6b76d232cf91808b632719d59cdc8ebbe3b))
* **survey:** resolve a participant token from a column, not every program's blob ([0900d47](https://github.com/Esposter/Esposter/commit/0900d4736403f909b1e6efe37acc82ad7a9472cd))

# [2.36.0](https://github.com/Esposter/Esposter/compare/v2.35.0...v2.36.0) (2026-07-30)

### Bug Fixes

* accept Vuetify null emit shape in useVotePoll ([2c0746d](https://github.com/Esposter/Esposter/commit/2c0746d8fbe13217cdf0fb0257ba2ff3bc17a84b))
* add back now ([68dd867](https://github.com/Esposter/Esposter/commit/68dd867bcf24a64936c6ca91f5c7efa9cec9fcb1))
* add blob lifecycle ([5001670](https://github.com/Esposter/Esposter/commit/50016704baeebc277bfa1705c98a0104c9277fb8))
* add docs + modifications ([e3b82f1](https://github.com/Esposter/Esposter/commit/e3b82f1284e96089b6376467a155fad28fa1d6dc))
* add missing Note entry to ResourceOwnedTablesMap and dedupe owned-resource lookup ([b05855e](https://github.com/Esposter/Esposter/commit/b05855ea41156488a3a8d49dd68aa4c6d3dc5ae9))
* add missing regression tests ([a5c0040](https://github.com/Esposter/Esposter/commit/a5c0040443bc57a5423f71cb3d93147f50f64668))
* add oxlint plugins ([1ae699b](https://github.com/Esposter/Esposter/commit/1ae699ba9c243a251505ed414705fae57a3fab89))
* add tests ([9071a90](https://github.com/Esposter/Esposter/commit/9071a90170bfb2a643b85f1e838fca8d7c5ed380))
* address [#993](https://github.com/Esposter/Esposter/issues/993) review findings ([19dc309](https://github.com/Esposter/Esposter/commit/19dc3095deb678fc67d5fed13ade0ffa776294c1))
* address code review findings on blob lifecycle and attachment urls ([b6213bf](https://github.com/Esposter/Esposter/commit/b6213bfb0d8f9d8544051da920c0abe2718a5d2c))
* address CodeRabbit findings on storage-quotas and policy rename ([a0af799](https://github.com/Esposter/Esposter/commit/a0af799b148b9566fd3c639f88793f7ad35dd772))
* address CodeRabbit findings on the review-workflow changes ([090e639](https://github.com/Esposter/Esposter/commit/090e639c5cf017eae6c5d6be3ec70eb51200fbc1))
* address CodeRabbit PR 1008 review findings and lint ([91a43f8](https://github.com/Esposter/Esposter/commit/91a43f8724a09b2b56a61564b91e7dfa4805d42b))
* address CodeRabbit review and lint findings ([4fa9b3e](https://github.com/Esposter/Esposter/commit/4fa9b3ee4e357f24d710b3690d74183a04f4b824))
* address CodeRabbit review findings ([41c7088](https://github.com/Esposter/Esposter/commit/41c70882200152677be4c64cf2acc462331f4d27))
* address CodeRabbit review findings on develop ([b6968d3](https://github.com/Esposter/Esposter/commit/b6968d3946a8f93599ecbbee3f58195699a8b554))
* address CodeRabbit review findings on PR [#1027](https://github.com/Esposter/Esposter/issues/1027) ([20edca9](https://github.com/Esposter/Esposter/commit/20edca938c715efb797e52eb80f52141224bb30e))
* address local code review findings on PR [#1027](https://github.com/Esposter/Esposter/issues/1027) ([e9d5c10](https://github.com/Esposter/Esposter/commit/e9d5c104290331de9b86a94c0886b1a71503389f))
* address phase-1 CI failures ([4548d91](https://github.com/Esposter/Esposter/commit/4548d91ba5dad7c1ce3d8e2a81d6a636e6c9623a))
* address post-merge code review findings ([548024d](https://github.com/Esposter/Esposter/commit/548024df27a73e4b9a8f1467c91717c734021812))
* address PR 1000 and 1003 post-merge review findings ([17cfed0](https://github.com/Esposter/Esposter/commit/17cfed06cbf6deca727410d1176a4d80e9c5d12b))
* address PR 1001 and 1003 post-merge review findings ([ad04d84](https://github.com/Esposter/Esposter/commit/ad04d8494b14f86b567b1f0be766ee22a9d026ad))
* address PR 1008 workflow review findings ([4f7eb9d](https://github.com/Esposter/Esposter/commit/4f7eb9d09d62c118171462ad487456e3ef01d8db))
* address recent CodeRabbit findings ([ca909ce](https://github.com/Esposter/Esposter/commit/ca909cea39c035ef532b5dddeffe4b0a289c8fd9))
* anchor the asset url, attribute the automod log, age-gate the reaper ([aac93e1](https://github.com/Esposter/Esposter/commit/aac93e17e85221d9e964c27ba3a9bfb176072238))
* app lint errors + azure-functions bundle snapshot ([19cdfbf](https://github.com/Esposter/Esposter/commit/19cdfbfd57189952db0b5b2594f9af9f8dfdc3f1))
* **app:** address PR 1017 CodeRabbit findings, CI failures, and docs mobile nav ([924f963](https://github.com/Esposter/Esposter/commit/924f96330477222b10f94c578c36d2012f0ef4d0))
* await the creation activity write before a rollback can run ([836598a](https://github.com/Esposter/Esposter/commit/836598a72db4bbb5978a7426ea41f8abb362ff58))
* block-body visitor callbacks in deepVisitStrings test ([da72256](https://github.com/Esposter/Esposter/commit/da722565d0570c4fea0b5b0c9b20fd029fd5382a))
* bloh urls ([78a8e96](https://github.com/Esposter/Esposter/commit/78a8e962fc900aad984858bb8377e5eabacdcf8f))
* **blueprint:** close the blueprint review findings ([2259869](https://github.com/Esposter/Esposter/commit/2259869a65f869dcc9c98c54b5f595ba35e7c7a7))
* capitalize comment continuation for oxlint ([95188e6](https://github.com/Esposter/Esposter/commit/95188e681b63312baebd76098a330be7482e868d))
* CI failures, CodeRabbit findings, and Basic-tier reminder dedupe ([96fd87a](https://github.com/Esposter/Esposter/commit/96fd87a1af102dd0314d60b040d3199e546848aa))
* cleanup button ([9542f44](https://github.com/Esposter/Esposter/commit/9542f44a97a22c8f12a6813f868aa278c8af4962))
* cleanup oxlint ([afcf55c](https://github.com/Esposter/Esposter/commit/afcf55c376dbfb2fc0e3ae0dab1a27d679546170))
* clear the remaining confirmed findings from the seam review ([8709cd8](https://github.com/Esposter/Esposter/commit/8709cd8b0687e32fdbec8320bfc0d661c916d043))
* close cross-feature gaps in guard, rollback and revert paths ([eac8e17](https://github.com/Esposter/Esposter/commit/eac8e17afc5be3d37a54605e4a2fa1d1e4b6b7db))
* close lint findings on the resource cleanup tests ([c1c3230](https://github.com/Esposter/Esposter/commit/c1c323010a0ef3c9391050962571c07376a813a0))
* close the blob-delete gaps this review found ([08f6c83](https://github.com/Esposter/Esposter/commit/08f6c830c439fc96010bb94aefa16908b76bf75d))
* close the CodeRabbit findings on the publish/replay cohort ([c8db3a5](https://github.com/Esposter/Esposter/commit/c8db3a5651104c7420d5efc3e6119adb54c5b08a))
* close the CodeRabbit items the earlier rounds left open ([7288f94](https://github.com/Esposter/Esposter/commit/7288f9446b264c53260f0e27ef62f127df18e04f))
* close the critical send-path and publish-repair findings ([ff65685](https://github.com/Esposter/Esposter/commit/ff65685d4cfbeb60754f0d15841cb0b39cb4c846))
* close the defects the develop -> main review found ([2b05608](https://github.com/Esposter/Esposter/commit/2b0560891365eaeade126e5f76ae33ca9982d258))
* close the defects the develop-to-main review found ([494120b](https://github.com/Esposter/Esposter/commit/494120bf742e6946cc347867187f66e91e2d7a91)), closes [#1029](https://github.com/Esposter/Esposter/issues/1029)
* close the defects the previous fix round introduced ([d7676dc](https://github.com/Esposter/Esposter/commit/d7676dcd3604ee36b014f3daec203f28ba8e02d9))
* close the develop -> main review findings ([5e0046b](https://github.com/Esposter/Esposter/commit/5e0046b1d0170a85ac8537ba9696666300c27e69))
* close the develop-to-main review findings ([3f29155](https://github.com/Esposter/Esposter/commit/3f29155a720cebf09405c443aa1f5e0ffbb4f04e))
* close the latest review findings ([74e62c3](https://github.com/Esposter/Esposter/commit/74e62c3149fc93b673998105b603d82ddd61dc32))
* close the messaging and client-feedback findings ([e4c33e9](https://github.com/Esposter/Esposter/commit/e4c33e9423489e0443b190730d89a2cf457973c2))
* close the remaining develop-to-main review findings ([358e350](https://github.com/Esposter/Esposter/commit/358e3504c273bf91fad6ec96f4d30092d0cc92fa))
* close the second CodeRabbit round on the develop -> main PR ([df4b09b](https://github.com/Esposter/Esposter/commit/df4b09ba3423f96d6e60a77805f44e42ed87771a))
* close the third CodeRabbit round on the develop -> main PR ([cd144f0](https://github.com/Esposter/Esposter/commit/cd144f0ed9865c8885d21248a52031ffb4409cdd))
* coalesce duplicate alerts, scope the session read, settle rename ([45a8b6a](https://github.com/Esposter/Esposter/commit/45a8b6a99a92b0913c3095e8ce7a42daac8d0652))
* code review comments ([f602165](https://github.com/Esposter/Esposter/commit/f6021655008edf71b4df919ed47afec376575118))
* code review comments ([922b90e](https://github.com/Esposter/Esposter/commit/922b90e6479f0084f29c5dbfb5018500844835b5))
* code review comments ([a739015](https://github.com/Esposter/Esposter/commit/a739015af42462afb2890c6532220a86b974b1c9))
* code review comments ([208fbbe](https://github.com/Esposter/Esposter/commit/208fbbe1545def1aa33c701f33124635d707858d))
* code review comments ([d6638ee](https://github.com/Esposter/Esposter/commit/d6638ee62fc45d57f327e5219f5fdc7d5d09aaf2))
* code review comments ([5f98907](https://github.com/Esposter/Esposter/commit/5f98907bd78739c37ace0dcee88062fa2f23dce2))
* code review comments ([420ea0c](https://github.com/Esposter/Esposter/commit/420ea0cd7fc89253d1ef2605a6f5cd358a28a6c2))
* code review comments ([da0c931](https://github.com/Esposter/Esposter/commit/da0c93177206f8337a1873c0ab2e9a12037d882a))
* code review comments + refactor away complicated regexes ([eca7d01](https://github.com/Esposter/Esposter/commit/eca7d01d9e2bb8335a75b085604468601c395fb2))
* comments and snapshots ([2bd05d9](https://github.com/Esposter/Esposter/commit/2bd05d9ac2e6be0304bf06fb569663578fced448))
* computing ([9eb176b](https://github.com/Esposter/Esposter/commit/9eb176b75f4562aa06b10b6745c46a38cd7fdfee))
* consolidate app lint scripts + add storage-quotas proposal ([5ce7605](https://github.com/Esposter/Esposter/commit/5ce76057d85db12576fe46656ffa5fcd226b9afc))
* **db:** escape single quotes in Azure OData filter values ([cccc469](https://github.com/Esposter/Esposter/commit/cccc469bdf80374401f32df0b0e6448227254289))
* **db:** linearize forked migration snapshot chain, drop unapplied thread-follows gen ([db5a374](https://github.com/Esposter/Esposter/commit/db5a374fe5483ef766d0b7dcdd1ad13d20773774))
* deps ([7584a49](https://github.com/Esposter/Esposter/commit/7584a491e73b7c91cf060784e5281b43ff4fc7ae))
* dialog bugs and also review issues ([ba25b09](https://github.com/Esposter/Esposter/commit/ba25b09cea140e24e5936795105e302288ae393e))
* docs ([f7ae114](https://github.com/Esposter/Esposter/commit/f7ae114e45ec268afb6e23f1219812ed6433c275))
* docs ([349d2c5](https://github.com/Esposter/Esposter/commit/349d2c54649580597fd01ac4fb6931d30f63cace))
* docs ([2247c95](https://github.com/Esposter/Esposter/commit/2247c951d58cc237a328b1bff17bf3caf6878749))
* docs ([1f97df3](https://github.com/Esposter/Esposter/commit/1f97df382be798f43cd6f7080d7f544299a607ca))
* docs & test ([558dfa3](https://github.com/Esposter/Esposter/commit/558dfa3f044d160ba4c632f8450479bfc2035933))
* docs and snapshots ([211fee5](https://github.com/Esposter/Esposter/commit/211fee5280c8f3697cf021800178ed5be0edee7c))
* docs and workflow ([2b61c7d](https://github.com/Esposter/Esposter/commit/2b61c7d3aad0614799638864a5662f458befc176))
* drain fire-and-forget work deterministically in tests ([a330c74](https://github.com/Esposter/Esposter/commit/a330c7413e57a74fe0749307e112a91818318d78))
* drop the shared trpc client stand-in and pin the new deletion contract ([484ec54](https://github.com/Esposter/Esposter/commit/484ec54490c136ef2e057e2424ebf651bf980ac0))
* **esbabbler:** address CodeRabbit review findings on PR [#1017](https://github.com/Esposter/Esposter/issues/1017) ([99cc3e3](https://github.com/Esposter/Esposter/commit/99cc3e3e967c92fd9f5203dc01eaf2f34e2cec9f))
* **esbabbler:** display invites from the shared per-room store map ([4a9a58c](https://github.com/Esposter/Esposter/commit/4a9a58ceaf205616bb2b5a68167800d5cc5b7641))
* **esbabbler:** null-narrow followed-thread roots + session-user image type ([d2b82c0](https://github.com/Esposter/Esposter/commit/d2b82c01c2bc1a12d9407150ba877c0224a3c83f))
* favourite toggle tints the star icon, not the button background ([698f426](https://github.com/Esposter/Esposter/commit/698f4261625dbd077e9e1fbea3d018a86033f28a))
* guard notification action button against double-fire and await navigateTo ([80616ea](https://github.com/Esposter/Esposter/commit/80616ea90b094a9c44d157599fa4954bf3b4d3f4))
* have clear timeout error messages ([8ab229d](https://github.com/Esposter/Esposter/commit/8ab229d0b99531bb7fff12593da86473f02a35e8))
* import VoiceInputMode as value for template member access ([ce5c07c](https://github.com/Esposter/Esposter/commit/ce5c07c5d12cf76f2a30509ee65389f304007401))
* **infra:** tear down the storage system-topic subscription with the guard ([d9a4807](https://github.com/Esposter/Esposter/commit/d9a4807cf3d5f5f2b50d6a623169208140eb4557))
* isPending ([2438d27](https://github.com/Esposter/Esposter/commit/2438d27f2bf25c1f9dc5b25024562ff42de9be91))
* key per-entity mutations, harden notification actions, lint ([071939c](https://github.com/Esposter/Esposter/commit/071939c7ac555b573b71cd4164aa6da0f712b3f6))
* key remaining per-entity mutations, close dialogs only on success ([309734f](https://github.com/Esposter/Esposter/commit/309734fed11e50f12150a323ae98f5317f7abd48))
* land send-now guard ordering + realign scheduled-message docs with the delivery claim ([0618a89](https://github.com/Esposter/Esposter/commit/0618a89e646e9f69fa406c616b5ebb1ffa01de6f))
* lint ([479af2e](https://github.com/Esposter/Esposter/commit/479af2e9dfdec5ae00cd0a6e30febe76db00a284))
* lint ([422d97a](https://github.com/Esposter/Esposter/commit/422d97aae5fd2731da8f12670f2196185c6c2439))
* lint ([d19515e](https://github.com/Esposter/Esposter/commit/d19515eca2dd0301ce9c73f01a9f2c0116753e35))
* lint ([88f6724](https://github.com/Esposter/Esposter/commit/88f67243af9536f409658d4a17aa481ba5b8657d))
* lint ([a4868db](https://github.com/Esposter/Esposter/commit/a4868db6ed6a8557dd796e3cc03a87689409a1bc))
* lint ([77aab13](https://github.com/Esposter/Esposter/commit/77aab136024f3d7c7429e3991b4b3b2a7c1f0377))
* lint ([be22cf8](https://github.com/Esposter/Esposter/commit/be22cf8213dfbc76e3eebad8bb7c713309daa87d))
* lint ([4acfa5c](https://github.com/Esposter/Esposter/commit/4acfa5cfa64f93467dfe3ad53e6db0cde86b9779))
* lint ([dbe49e2](https://github.com/Esposter/Esposter/commit/dbe49e220e421699f7059209bf757f8ec58f8e97))
* lint ([7a9fc42](https://github.com/Esposter/Esposter/commit/7a9fc428e40fee58783dafa9c2465a9513f2f3ef))
* lint ([b0fd3fa](https://github.com/Esposter/Esposter/commit/b0fd3fabd2da3ce73003b057f00d11a50053143c))
* lint ([961bfbf](https://github.com/Esposter/Esposter/commit/961bfbf69bd61f68504e45e2c05fa190a34cc0a9))
* lint ([ce66bad](https://github.com/Esposter/Esposter/commit/ce66badc681f3c448e7c07fedd1d763b379abf6c))
* lint ([b437313](https://github.com/Esposter/Esposter/commit/b43731360dcb952447215ce1a356c312c7932914))
* lint ([35d371f](https://github.com/Esposter/Esposter/commit/35d371f0b3654eec75212f387a7e03bffd7f41fa))
* lint ([a267140](https://github.com/Esposter/Esposter/commit/a267140ca8dc8d691db49ca89edd306ceae89faf))
* lint ([812b9b9](https://github.com/Esposter/Esposter/commit/812b9b9b74dbc970291bac55c047ee75e2656d56))
* lint ([1bbd766](https://github.com/Esposter/Esposter/commit/1bbd7663c9116a8bcd4316f5ec6130d8b24e9a76))
* lint ([2afff1b](https://github.com/Esposter/Esposter/commit/2afff1b428c6443db54568f58fd2f9e12314881e))
* lint ([a1b7508](https://github.com/Esposter/Esposter/commit/a1b750832f227379d2dc689bf4528122d48fe76a))
* lint ([5646a90](https://github.com/Esposter/Esposter/commit/5646a901b960040bebd0f4e3aaa6c2c7a67d3efd))
* lint and snapshot ([93ce821](https://github.com/Esposter/Esposter/commit/93ce82156ccf2f20ee21977df02592927119ad10))
* lint and snapshot ([b5b333c](https://github.com/Esposter/Esposter/commit/b5b333c7c437d239207a3926212625c9f8a680d1))
* lint and snapshot ([c3710a9](https://github.com/Esposter/Esposter/commit/c3710a9eed9e42b25f44d5741693143f939469c2))
* lint and snapshots ([678a3e1](https://github.com/Esposter/Esposter/commit/678a3e12af21e1a73a6bcdae5d77fbb279ce0498))
* lint and tests ([d3dc93a](https://github.com/Esposter/Esposter/commit/d3dc93a81f1bb0dca065d47ed91c7ab252579979))
* lint and toctou race ([5af6974](https://github.com/Esposter/Esposter/commit/5af69740326d6e415f96b28a74d4caa6624817da))
* lint and types ([c1c67cb](https://github.com/Esposter/Esposter/commit/c1c67cbbbeb1642690b0cbc9742e1d9de36dae1a))
* lint develop and refresh package size snapshots ([bb0c40e](https://github.com/Esposter/Esposter/commit/bb0c40e872cdb23e03c9ed7c2931b1479310ed8c))
* lint, tests and deps ([28d82a3](https://github.com/Esposter/Esposter/commit/28d82a3696421c76add79f43841a38a43f22bc5f))
* **lint:** stop oxlint type-aware hang on useFluidSimulator + clear surfaced errors ([404ced5](https://github.com/Esposter/Esposter/commit/404ced53bd00bb2bbf79d15dc3e5079da8881b20))
* **lint:** widen DocsNavigationSlugs to string[] for indexOf + keep oxlint codeframes in CI ([3377ddb](https://github.com/Esposter/Esposter/commit/3377ddb57fb5f6fb2bfacff8c18344c26f7ec4d7))
* md ([4a365aa](https://github.com/Esposter/Esposter/commit/4a365aa26fbbf125af8354523681790285b738dd))
* more lint ([9625e7b](https://github.com/Esposter/Esposter/commit/9625e7bba87ea2bccdf00fee6fc91ef5dfc9fbbf))
* mutate resource ref in place when adopting contentVersion ([db84169](https://github.com/Esposter/Esposter/commit/db84169919b762361e91b1a382f42a9eae63fb17))
* overrides + null vs undefined ([347e88d](https://github.com/Esposter/Esposter/commit/347e88dc04a79d2efd19a935a4e15d835b87aca1))
* **platform:** address CodeRabbit review findings on the survey/program surfaces ([1a24f97](https://github.com/Esposter/Esposter/commit/1a24f97570b26b141880b6be69c2c9e02a4bcc9a))
* **platform:** PR [#993](https://github.com/Esposter/Esposter/issues/993) re-review correctness fixes ([2f45709](https://github.com/Esposter/Esposter/commit/2f4570967f7c8b3bbbd04dc9524d4785de6cfa91))
* **platform:** resolve verified review findings from develop code review ([bc8fa29](https://github.com/Esposter/Esposter/commit/bc8fa29cf4d02b90471a6890919464fbeb168613))
* post-merge integration fallout ([d7f882c](https://github.com/Esposter/Esposter/commit/d7f882cbef6cf79fc4aa781366b27a6bababdb47))
* post-merge integration fallout ([338a728](https://github.com/Esposter/Esposter/commit/338a7280dcca4d5886fae20fb10b63c045da8ade))
* publish assets ([adebb49](https://github.com/Esposter/Esposter/commit/adebb49b9bbc6cf43ea7e482d606585ad9b77bc0))
* publish blob deletion on creator-initiated room deletion ([642f430](https://github.com/Esposter/Esposter/commit/642f430f9a093de6bf6fb6ec9b173d25c9a2e8f9))
* race ([f2f55a5](https://github.com/Esposter/Esposter/commit/f2f55a53d0492bf46c4b75b89ab44f10888bd866))
* re-enable no-shadow and rename all shadowing variables ([0faab46](https://github.com/Esposter/Esposter/commit/0faab46e00078013464161144498ad94d1ac866e))
* re-mint expiring read urls and de-collide asset clones ([abe7331](https://github.com/Esposter/Esposter/commit/abe7331485d16f4c407c52b6f229051e7a5bc33f))
* reconcile publish-history with merged develop ([cbfe794](https://github.com/Esposter/Esposter/commit/cbfe794ab14b51c8fe80a0141dbff7cc2f777792))
* record the facts these fixes kept guessing at ([376dbb0](https://github.com/Esposter/Esposter/commit/376dbb0c56b264b4128e3da56377e6d9be5928b1))
* refactor wip ([9d767d4](https://github.com/Esposter/Esposter/commit/9d767d4c8ac150c66eeed49881f8da5120587fd6))
* refactor wip ([dd75212](https://github.com/Esposter/Esposter/commit/dd7521242dec77e1d59bdc3f79071bd53f9b7221))
* remaining code review comments ([5b0604c](https://github.com/Esposter/Esposter/commit/5b0604cce82ea4080c65a667e4ad3486c74c37be))
* remaining econn reset errors ([a165fea](https://github.com/Esposter/Esposter/commit/a165fea7e801cd5c250362ef9f8a5b04e3f625e6))
* remaining tests ([7315b02](https://github.com/Esposter/Esposter/commit/7315b0219dbae103cb0461618ae7549e868b7976))
* remove unnecessary lints ([0db3054](https://github.com/Esposter/Esposter/commit/0db3054ddc6808b7cb09912820f66b27d4858450))
* rename leftover dataset provider label File to Sheet ([0909d47](https://github.com/Esposter/Esposter/commit/0909d47da2844557451e6a60f96804b4e29ea40e))
* resolve notify closures by binding, restore dead-lettering on recreate ([14bb140](https://github.com/Esposter/Esposter/commit/14bb1404ff931ba1657178b8a1dd1b7fb1ac9f83))
* resolve oxlint errors ([d9129c7](https://github.com/Esposter/Esposter/commit/d9129c790a6e01acdba2b769c0b2c8c3907f83d4))
* **resource:** anchor blob url matching on its opening delimiter ([520efc7](https://github.com/Esposter/Esposter/commit/520efc7a217ade4ac45970a4a28ab703d92c6c0f))
* restore lint suppressions as oxlint-disable directives ([4085893](https://github.com/Esposter/Esposter/commit/4085893e4972dd5deb290524a3b05930a45a8d78))
* restore real error assertions after stale package rebuild ([58e6984](https://github.com/Esposter/Esposter/commit/58e6984bc33b39372bad3a76bbcf4d1d67d8d47d))
* review findings ([2e4ad9c](https://github.com/Esposter/Esposter/commit/2e4ad9c3b6185e4bc8fceed0602df245f78f86dd))
* review findings ([b8da841](https://github.com/Esposter/Esposter/commit/b8da8418d25bf41c671a4ab89fc27c4403615c2f))
* review findings for PR 1029 — dangling asset refs + encoding dedupe ([a6383d9](https://github.com/Esposter/Esposter/commit/a6383d9c6f9f3c4539158347160028b365ab4fcf))
* **review:** resolve full-PR review findings with regression tests ([c246edc](https://github.com/Esposter/Esposter/commit/c246edc25e1fe47c58b4cc3e3a06cc5f36fbb24c)), closes [#1017](https://github.com/Esposter/Esposter/issues/1017)
* room-keyed url writes, asset rate-limit bucket, encoded router param ([d56f0e3](https://github.com/Esposter/Esposter/commit/d56f0e353eafdfe07bfe4c6e4c0ea7f4279119d7))
* settle blob fan-outs before rolling back, and gate the publish sweep ([c4a5192](https://github.com/Esposter/Esposter/commit/c4a51925877e87722980a0f8674af63e6597f459))
* settle the publish-race and restore-transaction findings ([b700c62](https://github.com/Esposter/Esposter/commit/b700c6282456e231d08d0be75361f9491bdf3ed2))
* settle the three CodeRabbit findings on the skill and test edits ([93dc891](https://github.com/Esposter/Esposter/commit/93dc8915aa39162ca16c38f7342977c5c4724009))
* **shared-node:** validate dead-letter blobs and add a replay entry point ([a48d6ff](https://github.com/Esposter/Esposter/commit/a48d6ff0182eeeb3b79879b6b4b0af4d1acd5e97))
* skills ([7bd63ac](https://github.com/Esposter/Esposter/commit/7bd63acf07faee25f0128a1e6fb8ed0acdc03639))
* snapshot ([bd0fbc9](https://github.com/Esposter/Esposter/commit/bd0fbc97911382e6141cd57cc2a053349f25ee87))
* snapshots ([d505054](https://github.com/Esposter/Esposter/commit/d505054f6b852fca4fb57131c682cc8a8e1d7466))
* snapshots ([e55471d](https://github.com/Esposter/Esposter/commit/e55471d43085dd03cc7f0cc8ba7866e09486767c))
* snapshots ([7a984f8](https://github.com/Esposter/Esposter/commit/7a984f81f0b37c8604af4562d2481f197f6ccdba))
* snapshots and review wip ([dc3dad0](https://github.com/Esposter/Esposter/commit/dc3dad0c3bb93a3121e82b621a63b2735ff229fc))
* some bugs ([ce9954b](https://github.com/Esposter/Esposter/commit/ce9954b2d1317fee34cf51419e0846ef528168b7))
* stdout ([3d6d889](https://github.com/Esposter/Esposter/commit/3d6d889090a9a9a1cf92256820a394e146b4140a))
* stop reviving ISO datetime strings inside resource content ([b3a89c0](https://github.com/Esposter/Esposter/commit/b3a89c047988ebab75f2f55cf6197ec321e9ce0d))
* **styled:** render delete-confirm name row as v-code with inline copy button ([b376826](https://github.com/Esposter/Esposter/commit/b376826d50b96f02825682a40673f03cf91adc80))
* submit batches ([b922958](https://github.com/Esposter/Esposter/commit/b922958647d3c5d3085b50aab3b6a82cf728f5f4))
* tar exe ([844742b](https://github.com/Esposter/Esposter/commit/844742bf86402f0c95bd30505215e996cc3338a3))
* test ([f309e23](https://github.com/Esposter/Esposter/commit/f309e23faefa08d251901b1c360ccfb79e9844c4))
* **test:** guard optional test config before environment reset ([09c1862](https://github.com/Esposter/Esposter/commit/09c1862d00478bc0f3de6e9145f234cf49f8ba45))
* **test:** inject the view-counter failure on the methods it actually calls ([7d41479](https://github.com/Esposter/Esposter/commit/7d41479258da9d8a7be9d7c81338acc957d647b0))
* tests ([a67b17e](https://github.com/Esposter/Esposter/commit/a67b17e6be4856f556e8bf578b76230964bec3fe))
* tests ([097d9e2](https://github.com/Esposter/Esposter/commit/097d9e2014015556c3da43009d71024ae22de2bd))
* tests ([97bdc81](https://github.com/Esposter/Esposter/commit/97bdc81353183907175d54eb2e6f7cd2cd863a4f))
* tests ([f1036af](https://github.com/Esposter/Esposter/commit/f1036af873ac971339dc4301c7699a70d1114a76))
* tests and urls ([c857917](https://github.com/Esposter/Esposter/commit/c85791767dbf80fe9c53c25c3b09b567bd44b750))
* tests and virrun ([eef931f](https://github.com/Esposter/Esposter/commit/eef931f4af59f56934391cf81d63bfa88b092044))
* **test:** sync db bundle snapshot and dashboard bake expectation after develop merge ([4b84eb4](https://github.com/Esposter/Esposter/commit/4b84eb480c3706f1cb01d98d86e40e10178423e8))
* types ([464f5d3](https://github.com/Esposter/Esposter/commit/464f5d3db8114148a2df401f1cdc75ef36e7930e))
* types ([93de98d](https://github.com/Esposter/Esposter/commit/93de98d1d88430a847d292137293c8c66ac0f2a7))
* types ([f986e4e](https://github.com/Esposter/Esposter/commit/f986e4e5481b9ffa39f344f274a756ddc6450d24))
* types and tests ([e866d77](https://github.com/Esposter/Esposter/commit/e866d772c57ad1f320603b053674729c11713fb8))
* update docs ([e470990](https://github.com/Esposter/Esposter/commit/e4709909ea211579bef7ae631a05b3e562e7458b))
* update program invites ([3e6f1fe](https://github.com/Esposter/Esposter/commit/3e6f1fe94d0d31eea90fcbbbbd16df84231d1e17))
* update scheduled messages ([c7e0cde](https://github.com/Esposter/Esposter/commit/c7e0cde2a04d2d1a7074f6b58504040ada778e28))
* use mutation pending ([abe7a51](https://github.com/Esposter/Esposter/commit/abe7a51669d082a9bab926d1c1129ed200b49762))
* use native theme transition ([378a8d8](https://github.com/Esposter/Esposter/commit/378a8d8e6e791723b34d8ba7f637fbe5b82f6964))
* use pointer event type ([858d1f2](https://github.com/Esposter/Esposter/commit/858d1f2823ddbdf9debc877a8578f83dfa7cf8eb))
* use vuetify to prop ([8c2e999](https://github.com/Esposter/Esposter/commit/8c2e99958fb53371b209333e89b30a372f08520c))
* **virrun:** tolerate a source path that vanishes mid-archive ([331224a](https://github.com/Esposter/Esposter/commit/331224a188f32360e913b294902f8cdf772b2f59))
* wip ([acf6466](https://github.com/Esposter/Esposter/commit/acf6466c3340699b1ef5593a27cd5ac80f1e2049))
* wip ([c79a454](https://github.com/Esposter/Esposter/commit/c79a454e14ba9c3cf08836f41a1dac6f7fb24a9a))
* wip ([60a99b8](https://github.com/Esposter/Esposter/commit/60a99b8dde872db6cbc0dd5ac1e006439f3e2881))
* wip ([b02cc3b](https://github.com/Esposter/Esposter/commit/b02cc3b3d3e90cb6215ccbe21d15c9234cadb765))
* wip ([efe6f55](https://github.com/Esposter/Esposter/commit/efe6f553039e9e05c48ed7600073748038a75f6d))
* wip ([ea2c132](https://github.com/Esposter/Esposter/commit/ea2c13272d49318bc3e252e54e6f4765fe905f12))
* wip ([726c18a](https://github.com/Esposter/Esposter/commit/726c18af1b45b2bc4b438d24f255ba1be69c159d))
* ws adapter ([e4577d8](https://github.com/Esposter/Esposter/commit/e4577d81d164326f5bb26e0669c1e2f077b0c62d))

### Features

* **achievements:** global points leaderboard ([3b37df5](https://github.com/Esposter/Esposter/commit/3b37df54934d1ecb56bb07685177335ba90f1b9b))
* Add process blob deletion handler ([1d66a2c](https://github.com/Esposter/Esposter/commit/1d66a2c6a445de75e285c5ae2629d75d939c13b0))
* add Publish history blade and owner-only view-route version param ([805480d](https://github.com/Esposter/Esposter/commit/805480d51ed2f7589bbf55204a1ac153764d61ec))
* add publish-history read and restore-to-draft owner procedures ([134aac1](https://github.com/Esposter/Esposter/commit/134aac1031dbdf8197da0602c8d0119c04273864))
* Add stats formatter ([6d44ce0](https://github.com/Esposter/Esposter/commit/6d44ce06506e4f7b6fa409a54d6f2945fb3f2a04))
* Blueprint resource type with deploy and capture ([b70e0d0](https://github.com/Esposter/Esposter/commit/b70e0d07e79068954839dad498513ec265b0030b))
* **db-schema:** add resource favorites, tags, activity log schema ([f7277bf](https://github.com/Esposter/Esposter/commit/f7277bf5db5f78490c5ffd62bab75e6b82c8e2bf))
* **db:** add Note resource_type enum value ([f337b6b](https://github.com/Esposter/Esposter/commit/f337b6b358a02b162d231b1a9369e3686ab0844f))
* **db:** regenerate thread-follows/automod migration via db:gen, sync drifted enums ([16dc40c](https://github.com/Esposter/Esposter/commit/16dc40c847745e47c29d3d7174bfa24376816f08))
* **esbabbler:** automod word-filter actions + schema foundation ([1e433fb](https://github.com/Esposter/Esposter/commit/1e433fb42ca71fd0e849020ba37636be863b903a))
* **esbabbler:** consolidate file uploads, add thumbnails, room limits, and files tab ([87acbcf](https://github.com/Esposter/Esposter/commit/87acbcf61dac83023ebe2b98a2e433b2cc1c562a))
* **esbabbler:** member list group totals synced via top-role change hooks ([99c512c](https://github.com/Esposter/Esposter/commit/99c512c1941c1ec670051f7ccf68affdf3e08b8d))
* **esbabbler:** private per-member moderator notes ([4baac21](https://github.com/Esposter/Esposter/commit/4baac21604e405fc2ae208805660e2a64218ef63))
* **esbabbler:** thread-follow procedures + auto-follow + reply notifications ([9d5d5c5](https://github.com/Esposter/Esposter/commit/9d5d5c5eeaaefa9348b37b6e6a689876448b1631))
* **esbabbler:** Threads drawer + thread follow button (client) ([8fb27d5](https://github.com/Esposter/Esposter/commit/8fb27d5da5a51052982167a83028a92f40c6cf3f))
* **infra:** automatic dead-letter replay with attempt cap and quarantine ([4874ab6](https://github.com/Esposter/Esposter/commit/4874ab6677872e4970b54c7c5dfcc2acf5355447))
* message search index status + rebuild tooling ([65149f2](https://github.com/Esposter/Esposter/commit/65149f2715979273e132b5c0aeda4de7bbb1c448))
* **platform:** close the end-to-end survey funnel ([adc0d50](https://github.com/Esposter/Esposter/commit/adc0d50af12103710cbd5a85550d824c38f5deec))
* **platform:** explorer parity — summary view, row-cap warning, create-from-file, share ([2d711ea](https://github.com/Esposter/Esposter/commit/2d711ea5a03b3e42ec795f71b57abbadc8f8b2ca))
* **platform:** FileAssets capability and publish parity for the GrapesJS surfaces ([97579cd](https://github.com/Esposter/Esposter/commit/97579cd6711cc615b1a542ae2e86d8d59655cc3f))
* **platform:** TodoList due reminders ([78089f2](https://github.com/Esposter/Esposter/commit/78089f2475bc87e3070e3db57890d6f4507a282d))
* real-time todo list via onSaveResourceContent subscription ([2d42a1d](https://github.com/Esposter/Esposter/commit/2d42a1d67f3f4e39a58e8b4d47083e73ccdc31f2))
* **resource:** add Note tRPC router ([2c88b49](https://github.com/Esposter/Esposter/commit/2c88b49d9ae1840eed38ea4de31895889dcbdd09))
* **resource:** favorites, recents, tags, recycle bin and activity blade UI ([4c9ede9](https://github.com/Esposter/Esposter/commit/4c9ede9416c96296bce2f4a9f27d8e795618cb20))
* **resource:** register Note rich-text document resource ([415ff0e](https://github.com/Esposter/Esposter/commit/415ff0e05fcf5ae4f0cec1f50669a9603d651adb))
* **resource:** serialize overlapping saves via getSequentialFunction ([e920d5c](https://github.com/Esposter/Esposter/commit/e920d5ce29a14bf5833b298aa7bc42c62ea085af))
* **resource:** soft delete, favorites, tags, activity log, trigram search ([f741b0f](https://github.com/Esposter/Esposter/commit/f741b0ff4d11082a14be098ab95d3ca9497b06ad))
* **sheet-editor:** copy computed values on range copy ([eb9d31a](https://github.com/Esposter/Esposter/commit/eb9d31aa870f8328a653cbaeca4014e030001e35))
* stable asset urls wip ([53846a3](https://github.com/Esposter/Esposter/commit/53846a35e52d4980cdd5389f754fdae487fb8d54))
* upgrade to apexcharts v6 with themed chart wrapper ([f24d91d](https://github.com/Esposter/Esposter/commit/f24d91d2938e6e4fdb8fcc3cf9b46612e058cf9f))
* **users:** public profile page and author links ([a7194fc](https://github.com/Esposter/Esposter/commit/a7194fc06ce4c018d0d1eed43991388dc006c420))
* **users:** public readUser query and userId filter on readPosts ([a238b98](https://github.com/Esposter/Esposter/commit/a238b98fc89764073ba650e3dbf5838b9d82eded))
* **users:** return a 404 for a missing profile ([377fcb7](https://github.com/Esposter/Esposter/commit/377fcb773fe944ce424e61f0ae45907d3e081853))
* **virrun:** age-prune the task cache and report its payload size ([54955a7](https://github.com/Esposter/Esposter/commit/54955a7df4a5e2bc07be21d291437bcd5ab3b8b9))

### Performance Improvements

* cut the cache write off the optimistic update path ([5a1b142](https://github.com/Esposter/Esposter/commit/5a1b1423748ce14a66e8338bd5e8032c821880c1))
* hoist blob-url search regex out of per-leaf replace callback ([0cb3f1c](https://github.com/Esposter/Esposter/commit/0cb3f1cedb5abdae259f9554b24ddc31d8efa269))
* **message:** read the create-message gate once instead of rule by rule ([ffa0e59](https://github.com/Esposter/Esposter/commit/ffa0e594d0aa3c7609f51105a4cce7eeade30aab))
* **program:** batch participant inserts into one transaction per 100 ([67f5c86](https://github.com/Esposter/Esposter/commit/67f5c865e40c3cc65590ddcffa9380338a9647a2))
* render optimistic message before running create hooks ([4bae755](https://github.com/Esposter/Esposter/commit/4bae75535c194ff5465a95442e8bd3b6bce0c91f))
* stop double-linting oxlint-covered rules in eslint ([e30e92a](https://github.com/Esposter/Esposter/commit/e30e92aeee573c1a8bfe042fc137d9f1185b248e))
* **survey:** assign the response key instead of spreading a fresh row ([22bba48](https://github.com/Esposter/Esposter/commit/22bba483d2d42f73ee148e6b6a72cac66a631c5e))
* **test:** restore node-default vitest environment for app tests ([cf60afe](https://github.com/Esposter/Esposter/commit/cf60afe740ca493654742e25902475cf01fd83b5))

### Reverts

* remove eslint stats formatter ([170b594](https://github.com/Esposter/Esposter/commit/170b5941772e223602924921dc1bf2dff174f456))

# [2.35.0](https://github.com/Esposter/Esposter/compare/v2.34.2...v2.35.0) (2026-07-15)

### Bug Fixes

* add class ([df6ac54](https://github.com/Esposter/Esposter/commit/df6ac54cb62bab239335d4e07c0f3c0bdfaaaa66))
* add db migrations ([fabe3e0](https://github.com/Esposter/Esposter/commit/fabe3e077cf7c464e278f1870600d6f16b9b8f15))
* add docs ([cb40862](https://github.com/Esposter/Esposter/commit/cb40862912b627e8e33ff6f74fe94d82f2700ccb))
* add documents ([f408d57](https://github.com/Esposter/Esposter/commit/f408d577dde1fb1f3a345ffb3851a978ccdbbeec))
* add launching editor ([daf281b](https://github.com/Esposter/Esposter/commit/daf281b22e4df86f0583ad5d38904f0a149917ff))
* address CodeRabbit findings on resource list and score audit ([f4b2397](https://github.com/Esposter/Esposter/commit/f4b2397b648d4af3f6cbadd05eb633dc1bee5d5b))
* address survey review comments ([a8bbcc7](https://github.com/Esposter/Esposter/commit/a8bbcc72577ab4b06a5cf6387c4ce11f0fed4d82))
* await the sheet delete commands before closing their dialogs ([58cffe2](https://github.com/Esposter/Esposter/commit/58cffe2b46fbee32cc485420e69cb352fd370ff5))
* bugs and add roadmap ([cd3e0ab](https://github.com/Esposter/Esposter/commit/cd3e0abd051c0d17d7d7bc0b9a7a0d9b9d602f51))
* capitalize comment for oxlint ([3615790](https://github.com/Esposter/Esposter/commit/36157901790c48147e52c882b4639cf4bd40c201))
* capitalize the mic teardown comment for oxlint ([8975cac](https://github.com/Esposter/Esposter/commit/8975cac575a193c34b96948a71cb87d72a66eae5))
* cleanup borders ([27925ad](https://github.com/Esposter/Esposter/commit/27925ad67a32b9e7477728ae053007e0cb6619c3))
* cleanup borders ([28fa868](https://github.com/Esposter/Esposter/commit/28fa868540c831e005b90e006578e6210d575621))
* cleanup docs ([639c50c](https://github.com/Esposter/Esposter/commit/639c50c825e420fe1765b5e52a7ac1aeb56a953c))
* cleanup unused components ([ffa32fd](https://github.com/Esposter/Esposter/commit/ffa32fd4766dc266d05260de3a482cfbd7594ad8))
* clenaup styles ([588915a](https://github.com/Esposter/Esposter/commit/588915a3541889f65faee3950227862a8e9cda1b))
* code review comments ([03b53f6](https://github.com/Esposter/Esposter/commit/03b53f6ffdcef13e7acb5160d235c56c3a5cef2c))
* code review comments ([90e6319](https://github.com/Esposter/Esposter/commit/90e6319e7f4b6e8f69ce9905705a676ede10bf3a))
* code review comments ([4226788](https://github.com/Esposter/Esposter/commit/4226788d5940d71773b24ccb424ab9eb87ed706f))
* code review comments ([0098cab](https://github.com/Esposter/Esposter/commit/0098cab1f08e734fc1b84dbf8256b5196b37b80e))
* code review comments ([bb0cf26](https://github.com/Esposter/Esposter/commit/bb0cf261c2c79307d7528698b13457aa595920af))
* code review comments ([f583ddb](https://github.com/Esposter/Esposter/commit/f583ddb03fa3f8bad54cbee2274a8b9bb9bb5eff))
* code review comments ([007b7f4](https://github.com/Esposter/Esposter/commit/007b7f4c49477892e5734f7ce648d123b2a78758))
* code review comments ([3ba5624](https://github.com/Esposter/Esposter/commit/3ba5624e1eade7e32163edded5005101fa075c28))
* code review comments ([71154ff](https://github.com/Esposter/Esposter/commit/71154ff98d9e56eef6e571376ae86e86110f12ee))
* code review comments ([e5d9658](https://github.com/Esposter/Esposter/commit/e5d9658aa458b8f3304bca7ed95a9adbbebae6d8))
* code review comments ([75256b1](https://github.com/Esposter/Esposter/commit/75256b195dc52f474467abd9748c03c9ae809e2c))
* code review comments ([cb67a98](https://github.com/Esposter/Esposter/commit/cb67a9890d7f0b374efe5a6b996ec71fa4a0e5c5))
* db schema ([831c8c1](https://github.com/Esposter/Esposter/commit/831c8c10aeda8a97a6f2b590a523f9edec2515c5))
* dedupe items + fix tests ([e2275f8](https://github.com/Esposter/Esposter/commit/e2275f86a19aa376e6537759cf11bb32f81b67a5))
* docs ([2dc80c7](https://github.com/Esposter/Esposter/commit/2dc80c78921088f58239cad253f31f4c3f0b40de))
* docs + skills ([fd274a1](https://github.com/Esposter/Esposter/commit/fd274a1db9f48dc3816a4ab00abe718f377605df))
* docs and refactor sort menu ([8cf1fbb](https://github.com/Esposter/Esposter/commit/8cf1fbb2c1f6c69d44e25b33a9b37da7cc81bdfe))
* docs wording and snapshot the whole vuetify config ([2b707ba](https://github.com/Esposter/Esposter/commit/2b707ba13470eed4e9886d2af6653b221e5addf6))
* **docs:** include content/ in tsconfig.root so eslint project service parses docs.test.ts ([2f4b1e7](https://github.com/Esposter/Esposter/commit/2f4b1e758fdfe48843d2f9aee39aa96eda0571d7))
* **docs:** lint — named capture group + u flag, oxlint-disable for nuxt env marker ([7835f93](https://github.com/Esposter/Esposter/commit/7835f93586e83bd33489c1c67a74ef2f45a17c4a))
* enums and arrays ([faa3f2f](https://github.com/Esposter/Esposter/commit/faa3f2fc2d8e7453fead1ba02cb9b0f294b1b70f))
* handle the last three floating promises ([0c53a05](https://github.com/Esposter/Esposter/commit/0c53a0519e0d1fd00674fed172ad4a899fc72e4a))
* hoist void expression out of getSynchronizedFunction assertion ([b60d683](https://github.com/Esposter/Esposter/commit/b60d683e3fe6ad9cf16a7473cb10039cb1bac576))
* indicator ([713f7fc](https://github.com/Esposter/Esposter/commit/713f7fc14e2e159707e08ae0427511bd216260e1))
* json content type ([3f2b4eb](https://github.com/Esposter/Esposter/commit/3f2b4eb593f313a62228ef0c376f7f4a9cec197b))
* likes ([2bf5030](https://github.com/Esposter/Esposter/commit/2bf50302c1da4cb5d3d030ef5cb0c22c3c040adf))
* lint ([efca886](https://github.com/Esposter/Esposter/commit/efca886f54859c3284ef8f563f4b34c790177a18))
* lint ([b5cc419](https://github.com/Esposter/Esposter/commit/b5cc419831dfaf56cb28ea35e7de4c87204cef17))
* lint ([0dddf4e](https://github.com/Esposter/Esposter/commit/0dddf4e1cefe6e2a3610ebac83e6ce2daf124efe))
* lint ([3cfaca2](https://github.com/Esposter/Esposter/commit/3cfaca22bee44e866d8b303591e175c8ac1d48d8))
* lint ([0585f65](https://github.com/Esposter/Esposter/commit/0585f65205d8fc91fb2b3573678faca86194d0f6))
* lint ([5b18451](https://github.com/Esposter/Esposter/commit/5b18451b226f872dde0d15e141c4cf573cdd857e))
* lint ([d9bd70b](https://github.com/Esposter/Esposter/commit/d9bd70b3139022a5e9d4c4074e59d21f754c239d))
* lint ([a4c7288](https://github.com/Esposter/Esposter/commit/a4c7288c8ed94b34053c7284e40245dffa661de6))
* lint ([321056c](https://github.com/Esposter/Esposter/commit/321056c38325f96a4c9734a305e9094701844413))
* lint ([6795dc9](https://github.com/Esposter/Esposter/commit/6795dc973a57bc8672486eb153b0e17dc4c48030))
* lint ([b048d55](https://github.com/Esposter/Esposter/commit/b048d55cf7f936c8012587c874607b16caa7f9da))
* lint ([4dae45f](https://github.com/Esposter/Esposter/commit/4dae45f1c0ac136b9965087b4cb2d838fe06c9c5))
* lint ([5dbeaea](https://github.com/Esposter/Esposter/commit/5dbeaea947d76a2f5d820291572f695d14a12ddc))
* lint ([56405aa](https://github.com/Esposter/Esposter/commit/56405aab9bccdba38ebd6d3fb142a14305757afe))
* lint ([672f336](https://github.com/Esposter/Esposter/commit/672f3367a48c21c982c3aeda4ef1f6fa4ce78a90))
* lint ([a9bbaed](https://github.com/Esposter/Esposter/commit/a9bbaed23b8cb4c3e1d7fee602ea89c8fa3d428c))
* lint ([c2b031b](https://github.com/Esposter/Esposter/commit/c2b031b4c35f05756a9fbb46e4d38fbab86012b6))
* lint ([ffc3dc7](https://github.com/Esposter/Esposter/commit/ffc3dc74bc5d38b22b41f8cb94570ea22703a202))
* lint + md files ([86b882a](https://github.com/Esposter/Esposter/commit/86b882a7f0f6bcce9b8fcc3a84c4e32c7db8f213))
* lint + sanitize html ([cebc09e](https://github.com/Esposter/Esposter/commit/cebc09e9f1cae9eee5da927ea5b1b49a58455dcb))
* lint and code review comments ([1d52d73](https://github.com/Esposter/Esposter/commit/1d52d7303aa02b7e6d9089a22a2fcb69eb53798d))
* lint and tests ([643227b](https://github.com/Esposter/Esposter/commit/643227be2953addc4e7eb0ffbd9db79075273596))
* lint and update deps ([4a7e50b](https://github.com/Esposter/Esposter/commit/4a7e50b2969f545175866d7079d5f1347f281947))
* lint errors and warnings ([5879fa9](https://github.com/Esposter/Esposter/commit/5879fa99bed79521a25c8ce20dbf14d747542114))
* make optimistic mutations and achievement counting concurrency-safe ([f1716c4](https://github.com/Esposter/Esposter/commit/f1716c4a50b22ea7bc2b46c410d5ba2172b00068))
* md files ([c2daa19](https://github.com/Esposter/Esposter/commit/c2daa19f77ac909703e44bab3d509e3dfa9332d9))
* mount + refactor webpage ([7aa30f9](https://github.com/Esposter/Esposter/commit/7aa30f92bbb4073bffbdfeec1f15e507e3985902))
* navigation ([75ffabc](https://github.com/Esposter/Esposter/commit/75ffabc0edcdcbca403c4bafe4fb3d1b5a0f7bca))
* optimize templates ([f712e55](https://github.com/Esposter/Esposter/commit/f712e558a4ed10823b5700e5e8dc28caaa97e923))
* post-merge integration for esbabbler, platform, and posts branches ([a14af16](https://github.com/Esposter/Esposter/commit/a14af16951d55266948f62c378c7490a6854f166))
* prerender build and migrate script ([4e5f563](https://github.com/Esposter/Esposter/commit/4e5f563ec01bf277c3635594f03f1425a23442b9))
* reconcile clicker WIP with develop ([55c63b5](https://github.com/Esposter/Esposter/commit/55c63b5d072756a8ef72deddf79c8b781710a01d))
* refactor ([47e6295](https://github.com/Esposter/Esposter/commit/47e629569ca054d66507d2a9b85e6d45114671a7))
* refactor inline commands ([ad4abd1](https://github.com/Esposter/Esposter/commit/ad4abd18424f79f60ef902ac374aeaf95b237e97))
* regressions ([eae1fa7](https://github.com/Esposter/Esposter/commit/eae1fa7013c04e9919385130ec570d6c96d65639))
* remaining things ([9ccb3af](https://github.com/Esposter/Esposter/commit/9ccb3afc8c278333353236679998c52cb2573434))
* resolve audit follow-ups across role store, styling, and skills ([bd5008f](https://github.com/Esposter/Esposter/commit/bd5008f06b906e375bfda934a845f7f296a3f76c)), closes [Frame#glTexture](https://github.com/Frame/issues/glTexture)
* resource explorer design ([2112ec3](https://github.com/Esposter/Esposter/commit/2112ec3e14e9de929f7dfb81ff0977e976e93b83))
* resources page ([64392ae](https://github.com/Esposter/Esposter/commit/64392aeeceeca17e4ba0fce173426f785e76260f))
* restore alphabetical sort order after the Sheet rename ([4b4d5ef](https://github.com/Esposter/Esposter/commit/4b4d5efae0c0116811100fffbb9426e052ead6f5))
* roll back optimistic like delta and defer room/DM navigation ([ffe7de8](https://github.com/Esposter/Esposter/commit/ffe7de8f1a42df8cd1eafb2be30aa2a0d8e338d0))
* route rules ([ea21395](https://github.com/Esposter/Esposter/commit/ea213953a3b08c14fde8877c9f869e20a87c8a87))
* route rules ([fb37e77](https://github.com/Esposter/Esposter/commit/fb37e77b43fe5dbba2a34a3c4551619f076f3d74))
* rsync => tar for best performance ([32e82ac](https://github.com/Esposter/Esposter/commit/32e82ac83ce01fe99423bc57de8fbfa30d950827))
* scripts etc ([e84fe22](https://github.com/Esposter/Esposter/commit/e84fe2275dbb553c45ab5f16dfc438e4940a4dc9))
* server side ([2f7c400](https://github.com/Esposter/Esposter/commit/2f7c400e55be7c7437c3a01dd3fb71b40aa257d5))
* simplify mobile UI ([bc2bb88](https://github.com/Esposter/Esposter/commit/bc2bb883314591f05f8283e679318959ea1d70e7))
* snapshot ([180b973](https://github.com/Esposter/Esposter/commit/180b973fe9a6f3798e773c954439997b3f79d7a6))
* some lint issues ([6348cf8](https://github.com/Esposter/Esposter/commit/6348cf8e0eff40eccdbaa63f5cb13244e5e343a7))
* ssr false for resource explorer ([305a70f](https://github.com/Esposter/Esposter/commit/305a70f3f03380d045aebeec2e2cdd184896656a))
* styles ([0bcd3b6](https://github.com/Esposter/Esposter/commit/0bcd3b6d4ec7e93be26c70f2669dbff098bc48bf))
* styles ([7970a72](https://github.com/Esposter/Esposter/commit/7970a72fbf5d4be9885ba04dd57132ca71dc99d3))
* symlinks for tar + lint ([247d74b](https://github.com/Esposter/Esposter/commit/247d74b53693f4a697832f67ceefaa81fbf15f59))
* test bundle size and refactor ([ecd748e](https://github.com/Esposter/Esposter/commit/ecd748e2e964936c9afb3061ae5d57f9bd05547f))
* tests and lint ([d7a3960](https://github.com/Esposter/Esposter/commit/d7a3960eb3a3f1d503bbcea2a0efe1a7492777b9))
* tests and md ([40c2560](https://github.com/Esposter/Esposter/commit/40c2560782503822ebc6b1d4c0867b40f7c2156c))
* tests and types ([e6d64d1](https://github.com/Esposter/Esposter/commit/e6d64d114c92e5c38f03b1c21a2b1c96fe51d521))
* text field ([c6510cb](https://github.com/Esposter/Esposter/commit/c6510cbbd78f7d865f595e83edceeac7b7e9a76a))
* things ([a76de19](https://github.com/Esposter/Esposter/commit/a76de19beb6761be96fc0d6904437ba250e0c191))
* tidy the delete confirmation dialog layout ([936d10e](https://github.com/Esposter/Esposter/commit/936d10ec7f09c408476ab5e0ed902a903f9acd1c))
* tighten zod schemas ([2676108](https://github.com/Esposter/Esposter/commit/2676108ab50ca99ccb56d4e1db00ac749fc084f3))
* tooltip + defineSlots ([b71a30b](https://github.com/Esposter/Esposter/commit/b71a30bc521847e574026d523f012d5947c25ae3))
* truncate long names in ConfirmDeleteDialogButton ([50968a4](https://github.com/Esposter/Esposter/commit/50968a4dd5a0b4c41129f7cee6b16ee7a1d643c6))
* types ([108161e](https://github.com/Esposter/Esposter/commit/108161ec071738e4b7bbc4e4d291ed8eccb2f455))
* types ([d6fe7b8](https://github.com/Esposter/Esposter/commit/d6fe7b8db6130384b592006fab252ff7a2969b5c))
* types ([0354d53](https://github.com/Esposter/Esposter/commit/0354d53cb8a6efb2a7c4509b0e2d49bb1e3742bb))
* types ([43af6a3](https://github.com/Esposter/Esposter/commit/43af6a34edfed0406760edb6060aa75fc82cbcc8))
* types ([f68d51d](https://github.com/Esposter/Esposter/commit/f68d51d972d3fa7404a452989a60f34ed67ec626))
* types ([b0dc6d2](https://github.com/Esposter/Esposter/commit/b0dc6d268279594fe11086bf1fd511d72f356390))
* types and partial lint ([b672a10](https://github.com/Esposter/Esposter/commit/b672a10ba489be55b40c1ef11b6aaef4c7e8f233))
* types and tests ([e4ae90a](https://github.com/Esposter/Esposter/commit/e4ae90a1b0cbd5139b28e9e6ffb53dbd3dea0bdc))
* unocss attributify order ([f9e61b4](https://github.com/Esposter/Esposter/commit/f9e61b4da7ce69b501df6775d30160a6b068a93a))
* update back the vue-tsc ([eb26324](https://github.com/Esposter/Esposter/commit/eb26324e7910fe40fb49ec3a3bd05f22eccfa255))
* use global imports ([598c717](https://github.com/Esposter/Esposter/commit/598c7173d577028471c090e7b1b1fce63a67d35e))
* virrun to use tar ([83d8b87](https://github.com/Esposter/Esposter/commit/83d8b8716ec092a1227d148ab19569bc2b274af2))
* wip ([7789f0c](https://github.com/Esposter/Esposter/commit/7789f0c82a26262f04ed34571641a2e1c38d9480))
* wip ([cf2c92b](https://github.com/Esposter/Esposter/commit/cf2c92b108efb84bad50e151bb749b9cf3257bf8))
* wip ([7166dbf](https://github.com/Esposter/Esposter/commit/7166dbfe79082fff53ac921bb75602aa90afeeee))
* wip UI ([8404beb](https://github.com/Esposter/Esposter/commit/8404bebf1973aea141a58d7cfff0d22b497c0df4))
* wip UI ([5634f11](https://github.com/Esposter/Esposter/commit/5634f112bd48e0cd9fcf9f33aa5e2c63db05a255))

### Features

* /all list workbench — filter pills, bulk select, column chooser, CSV export ([609adf2](https://github.com/Esposter/Esposter/commit/609adf25ff339c1ec24a8284d65e49d9db43ad09))
* add docs ([816eb13](https://github.com/Esposter/Esposter/commit/816eb13d56b8de186100ca4d4d44a4d2597040d8))
* Add document hub ([515126c](https://github.com/Esposter/Esposter/commit/515126ca01ede96a5b1a63131d1db76fc3f55d15))
* add document test ([490c936](https://github.com/Esposter/Esposter/commit/490c936468666f54ef6bf3823510c6550e375096))
* Add global route rules ([831c731](https://github.com/Esposter/Esposter/commit/831c7313f52ba1503e3c83975d11fc43b3e091c1))
* add list view ([e5283d0](https://github.com/Esposter/Esposter/commit/e5283d038e51374cf795fc0c6bf23526da475ff3))
* add reodrer endpoint ([5d808c9](https://github.com/Esposter/Esposter/commit/5d808c958bff0dc7984285e7adbe4ba0a0cab339))
* align room settings with Discord Server Settings IA ([bcd1240](https://github.com/Esposter/Esposter/commit/bcd12403bdda4424789d95a34bd9a622cee98b31))
* category drag-reorder and room shell empty states ([71e5062](https://github.com/Esposter/Esposter/commit/71e506269ad289e65e8764f970b8aad68ba8052e))
* clicker core refactors - normalized saves, single game tick, exponential prices ([10974d4](https://github.com/Esposter/Esposter/commit/10974d4c60c037e9e3c83d4c490f866cfedc5324))
* cozy/compact message display density ([290cb18](https://github.com/Esposter/Esposter/commit/290cb18700c1d6b03bbc7be3c635ec1a4c1850f5))
* **docs:** category tabs, grouped sidebars, multi-highlight TOC rail, search, back-to-top ([732f3a6](https://github.com/Esposter/Esposter/commit/732f3a64b8bec417e7c3f3440c633af268317709))
* **docs:** full-screen toggle for mermaid diagrams ([148907e](https://github.com/Esposter/Esposter/commit/148907e1a422ed128d802398610694a15191ef49))
* **docs:** mermaid parse gate + pan/zoom, search field names, sidebar/TOC typography ([6f19588](https://github.com/Esposter/Esposter/commit/6f195888f43b98a4d2de9818247c35d6c49c2428))
* dungeons combat foundations — single save + attack power and defense ([f729638](https://github.com/Esposter/Esposter/commit/f729638016baa6e12f21133b5873c1dbe2bb45d0))
* dungeons milestone achievements ([4d630a7](https://github.com/Esposter/Esposter/commit/4d630a7a17347d2c1a4f52ef80ed18b25510c925))
* dungeons monster roster expansion ([858ea06](https://github.com/Esposter/Esposter/commit/858ea061f2bb9027aa24fca2a6bdff36bbc8b4d7))
* esbabbler mention badges + push-to-talk keybind with release delay ([3cc0602](https://github.com/Esposter/Esposter/commit/3cc060227b201fcac212b11be6d401312a9b5f74))
* finish phase 5 ([9ab17cb](https://github.com/Esposter/Esposter/commit/9ab17cbb1e3e9e7fd248c27725a227c6a57995dc))
* migrate to service bus ([60572d9](https://github.com/Esposter/Esposter/commit/60572d945321e2953abd3bb43f61553c7221f43d))
* notifications bell — app-bar panel, snackbar queue, G N chord ([48c0104](https://github.com/Esposter/Esposter/commit/48c0104a60f2e50a09548ec954a4e1c2b6bf9f95))
* phase 1 & 2 ([a7cc471](https://github.com/Esposter/Esposter/commit/a7cc4719f3d53b7678e8268a2649f737c551bb42))
* platform global search overhaul ([5aa7783](https://github.com/Esposter/Esposter/commit/5aa7783cf2a0c816e3d6da03728ac1f8280efa48))
* **platform:** resource filters, bulk delete, duplicate procedures + command bar parity ([14ac2fd](https://github.com/Esposter/Esposter/commit/14ac2fd686402cbfc3368316139c2f8bb3ac21e4))
* **posts:** viewer-scoped likes, feed block filtering, and Hot/New/Top sort options ([72d5932](https://github.com/Esposter/Esposter/commit/72d5932e3f94ea2fd2f43f59b36cf3e830442d18))
* resilient achievement plugin — failures never fail the parent mutation ([4563d39](https://github.com/Esposter/Esposter/commit/4563d390b504cd0fa9f45b1110dec92b090e6f68))
* resizable persisted sidebars and mobile action bar ([49f1be4](https://github.com/Esposter/Esposter/commit/49f1be40699a787d1a02c641ee779a723e2d3d65))
* setup content ([8efeeb3](https://github.com/Esposter/Esposter/commit/8efeeb320b16d0be29063c5992c6ea6d774dbe5f))
* wip ([9a46fe9](https://github.com/Esposter/Esposter/commit/9a46fe9ea31a83a401383c1ef554e992969058ec))
* wip ([f7d2acf](https://github.com/Esposter/Esposter/commit/f7d2acf6441b61339c5ba3f099a1ab18e1687166))
* wip ([8789e7b](https://github.com/Esposter/Esposter/commit/8789e7baef6ac9a4730770e6e214f9f48bc997de))
* wip ([a704083](https://github.com/Esposter/Esposter/commit/a704083c21166a5ef492fa18656d2cf8dcf06b49))
* wip ([d70d22b](https://github.com/Esposter/Esposter/commit/d70d22b1982ce9ed30f1af0fee36f269f8b32312))

### Performance Improvements

* completely fix and optimize message item menus ([643ef1f](https://github.com/Esposter/Esposter/commit/643ef1fd318e7da5027d7ab722ab18e3e3de63c0))

## [2.34.2](https://github.com/Esposter/Esposter/compare/v2.34.1...v2.34.2) (2026-07-05)

### Bug Fixes

* lint ([d668291](https://github.com/Esposter/Esposter/commit/d66829181390e45f6fdf9f30ef379b8d2494804a))
* lint ([44f820b](https://github.com/Esposter/Esposter/commit/44f820b06ecbd6454b6a8f994decd1bc802dff05))
* lint ([15b9814](https://github.com/Esposter/Esposter/commit/15b98148685d815e3f1d9b10a3f0ff58ad79c743))
* lint and skip test for now ([3558dca](https://github.com/Esposter/Esposter/commit/3558dcaf3084b13b8c05cb7857f983bcf781329e))
* lint and snapshot ([f97bf86](https://github.com/Esposter/Esposter/commit/f97bf867b5e420c861754bfb0cd9c2a48e9ee1cc))
* pagination ([e605637](https://github.com/Esposter/Esposter/commit/e605637d7675c514a13e8b354f97147cdd4da22f))
* reactive value ([21ff8bf](https://github.com/Esposter/Esposter/commit/21ff8bf45e3cd27b938efb352d9976f54ef6abf1))
* snapshots ([5a04f18](https://github.com/Esposter/Esposter/commit/5a04f18c732cd3e7028e901823b515aff6c3cb7a))
* tests ([f882fb5](https://github.com/Esposter/Esposter/commit/f882fb5c4e6dbbbfb031a5f9b3d5ffe29b82bdbb))
* types ([4a3ec57](https://github.com/Esposter/Esposter/commit/4a3ec57ac7cf9eb0a3b3a5104af57402596d941f))
* types and skills md ([be7f6c9](https://github.com/Esposter/Esposter/commit/be7f6c95a01c853505e49b52608db63db5f0a7af))

## [2.34.1](https://github.com/Esposter/Esposter/compare/v2.34.0...v2.34.1) (2026-07-04)

### Bug Fixes

* code review comments ([e848577](https://github.com/Esposter/Esposter/commit/e8485770ad3ccafe723073613d82bf31a17f4d59))
* lint warnings ([0f5ba91](https://github.com/Esposter/Esposter/commit/0f5ba91bab503102af6772f53cf19eeb6efe3315))

# [2.34.0](https://github.com/Esposter/Esposter/compare/v2.33.0...v2.34.0) (2026-07-04)

**Note:** Version bump only for package @esposter/app

# [2.33.0](https://github.com/Esposter/Esposter/compare/v2.32.1...v2.33.0) (2026-07-03)

### Bug Fixes

* tests and snapshot ([ecf9684](https://github.com/Esposter/Esposter/commit/ecf9684d78fe741545cb785392a5dab40be237c3))

## [2.32.1](https://github.com/Esposter/Esposter/compare/v2.32.0...v2.32.1) (2026-07-01)

**Note:** Version bump only for package @esposter/app

# [2.32.0](https://github.com/Esposter/Esposter/compare/v2.31.1...v2.32.0) (2026-07-01)

### Bug Fixes

* bench ([b23a8c1](https://github.com/Esposter/Esposter/commit/b23a8c1b287e519bbbca5c27e2fb921ea33dec65))
* disable linting for vue-tsc for now ([1986687](https://github.com/Esposter/Esposter/commit/1986687fbd26b1a12d15adb5f11eec2a65f0ee3a))
* lint ([4c80dc2](https://github.com/Esposter/Esposter/commit/4c80dc2ced8c814d232ba9b93e0f1a8b83fd95d3))
* lint ([47cca52](https://github.com/Esposter/Esposter/commit/47cca525b3cf3d1f27ba5cc794ce5da0e096edd3))
* lint ([fd3dbc8](https://github.com/Esposter/Esposter/commit/fd3dbc8cc876c1b95dfca869f447428c51a2c921))
* remaining disable comment ([d55a7f8](https://github.com/Esposter/Esposter/commit/d55a7f86e8551f85fcc47d64c2d1e13dfc37b6c0))
* warmup nuxt env ([0162d21](https://github.com/Esposter/Esposter/commit/0162d21c21d9f1c8914eb574023b0c31eff685f7))

### Features

* Add wsl backend ([518b045](https://github.com/Esposter/Esposter/commit/518b04533cd761b5ab2dbc72af7d6323e051b486))
* fixed-iteration benchmark runner for machine-stable results ([6be4473](https://github.com/Esposter/Esposter/commit/6be4473066c634fd57ab854c59175316d24f9dde))

## [2.31.1](https://github.com/Esposter/Esposter/compare/v2.31.0...v2.31.1) (2026-06-25)

**Note:** Version bump only for package @esposter/app

# [2.31.0](https://github.com/Esposter/Esposter/compare/v2.30.0...v2.31.0) (2026-06-25)

### Bug Fixes

* lint ([2edafd9](https://github.com/Esposter/Esposter/commit/2edafd930e602607fbd5a2c9aab6b640bdda4962))
* lint ([594135c](https://github.com/Esposter/Esposter/commit/594135c537ffbdf8dd856437fd9cab37c3fa2905))

### Features

* add CodSpeed hosted benchmarking dashboard ([28efb0e](https://github.com/Esposter/Esposter/commit/28efb0e92eeb7865be9a54f52e25049dc08510fd))

# [2.30.0](https://github.com/Esposter/Esposter/compare/v2.29.0...v2.30.0) (2026-06-24)

### Bug Fixes

* emit oxfmt-aligned bench tables and guard empty bench samples ([640154c](https://github.com/Esposter/Esposter/commit/640154c2fba53330bb82259f40d9696c177112d1))
* lint ([2a8bd20](https://github.com/Esposter/Esposter/commit/2a8bd2081be730f4c7ccf1f389884357fd3c79ea))
* lint ([3f8a761](https://github.com/Esposter/Esposter/commit/3f8a7616392b1cd883edf3304d81bce145e57df0))
* reset isScrollingToSection via withFinalizerAsync ([c13597f](https://github.com/Esposter/Esposter/commit/c13597fd52e773c1eb81745f9c9378a3626666d5))
* settings scrollspy header overlap + simplify to visibility-driven ([367a695](https://github.com/Esposter/Esposter/commit/367a6950611eaf5fb9d40e23d856023c77d41c13)), closes [#header](https://github.com/Esposter/Esposter/issues/header)
* wip ([b0aa40f](https://github.com/Esposter/Esposter/commit/b0aa40fc4865554a7ed6f3cb6b172409dcc0bfc8))
* wip ([0f62fc7](https://github.com/Esposter/Esposter/commit/0f62fc73399c252422695a7385d39b6c9d7d33f0))
* wip ([ffc3a67](https://github.com/Esposter/Esposter/commit/ffc3a67bc0c427dd76f5ac3fc2dea6f99fcacbce))
* wrap pip control bar on overflow ([cc31d00](https://github.com/Esposter/Esposter/commit/cc31d007af9d8d4576e8c4e4e60be894f53d3e56))

### Features

* animated active-section rail + typed section ids for settings sub-nav ([08cc69b](https://github.com/Esposter/Esposter/commit/08cc69ba55c3335885fba5806e72ed54695e8362))
* Discord-aligned Voice & Video settings + live-call wiring ([6997f2f](https://github.com/Esposter/Esposter/commit/6997f2ffab77643f91827915f5170ecb40601167))
* root recursive bench script + vs-base multiplier in bench report ([ebb4afe](https://github.com/Esposter/Esposter/commit/ebb4afe18df064792017dffce39e0910082ebd08))
* sandbox-runtime os backend MVP (bwrap RAM-overlay exec, Linux core) ([8741186](https://github.com/Esposter/Esposter/commit/8741186212042fcb03ba962b88eb438a6d875843))
* shared-node bench reporter + migrate benches to vitest bench ([0e39cf7](https://github.com/Esposter/Esposter/commit/0e39cf713eea30d36d50879ba4d56a6bf00fe73e))
* split user settings into message dialog + global route with scrollspy sub-nav ([3dcad0b](https://github.com/Esposter/Esposter/commit/3dcad0bd83372b84a5a98c579a7582dfbd66b185))
* unify device selection as single source of truth across call surfaces ([775805f](https://github.com/Esposter/Esposter/commit/775805f33067fe2aa65c2766329d13cad5c6407d))
* voice settings polish, screen-share stop + settings buttons ([64c9d23](https://github.com/Esposter/Esposter/commit/64c9d2342aff1bb565c381c53841afe7856597df))

# [2.29.0](https://github.com/Esposter/Esposter/compare/v2.28.0...v2.29.0) (2026-06-21)

### Bug Fixes

* await re-linked stylesheets in document PiP to avoid FOUC ([8b18e24](https://github.com/Esposter/Esposter/commit/8b18e243ef58c48795fb519f55607bd0022c286a))
* cleanup styles ([933bd7e](https://github.com/Esposter/Esposter/commit/933bd7ecda53cde67cb530e062e3911ed97263e3))
* code review comments ([d7c4a0f](https://github.com/Esposter/Esposter/commit/d7c4a0f4d899a7dee0fc55051816c795694f012a))
* document styles ([8d9bf8c](https://github.com/Esposter/Esposter/commit/8d9bf8c90a0318e5c676256b6989f5c121c97ff6))
* drop @nuxtjs/seo under vitest to stop schema-org teardown leak ([5860fa7](https://github.com/Esposter/Esposter/commit/5860fa728521ef566c6412cbfe1f22df7a701a7e))
* **esbabbler:** await floating promises and fix draft init scan ([19c55a8](https://github.com/Esposter/Esposter/commit/19c55a8eecf471bc8d34d7d9f3c142788599e71f))
* **esbabbler:** guard media/view-transition APIs and concurrent settings updates ([6ddc7cd](https://github.com/Esposter/Esposter/commit/6ddc7cded2782a956693d460036d19b1d0d305b2))
* full screen & pip on share ([056c3a8](https://github.com/Esposter/Esposter/commit/056c3a8cf5e32e3cf35db96af351166af191005f))
* lint ([b8410e7](https://github.com/Esposter/Esposter/commit/b8410e7d8e31fa06932ef8bfdbe36f074ab59610))
* lint ([d8e0203](https://github.com/Esposter/Esposter/commit/d8e0203593b999f1b183af9a2f45cbf926633885))
* lint ([2c6623b](https://github.com/Esposter/Esposter/commit/2c6623b13812eabd091554ed9ee7e8f796979459))
* lint ([c3c95fc](https://github.com/Esposter/Esposter/commit/c3c95fcd0f09196a506fa01fc6b19214be259345))
* lint ([7f859de](https://github.com/Esposter/Esposter/commit/7f859deb27ee2043c70e7135fa55e4c1741f0820))
* lint ([5bb1c58](https://github.com/Esposter/Esposter/commit/5bb1c58aa54a6663bde4ceb03c85ce2b730dca43))
* lint ([a8ec4d8](https://github.com/Esposter/Esposter/commit/a8ec4d883352522b8ff069b4888614b57de61142))
* lint + comments etc ([13de898](https://github.com/Esposter/Esposter/commit/13de898e802444afc16acd33145538c9034727ea))
* lint and snapshot ([cda7f33](https://github.com/Esposter/Esposter/commit/cda7f33c8c54e3f52a25551101ff0794dd74086c))
* relink linked stylesheets in document PiP so MDI font icons load ([5dca41b](https://github.com/Esposter/Esposter/commit/5dca41b143fe1271b8dd7d46aa894a13c085c952))
* remaining styles and video ([36f1671](https://github.com/Esposter/Esposter/commit/36f167119ceb68b84ea04a72f6ff9b490797d3d4))
* screenshare in pip ([77d867a](https://github.com/Esposter/Esposter/commit/77d867a0d0d028dd42d92fea822b8b484f401908))
* start mic on mount and don't block if not enabled ([8dc0dda](https://github.com/Esposter/Esposter/commit/8dc0dda218c4aa1b8fba4e1a23c158ee4e30c6b4))
* styles + pip ([8ab03db](https://github.com/Esposter/Esposter/commit/8ab03db3b9443ed9076624822308a9144f992b75))
* styles and deps ([f059ffd](https://github.com/Esposter/Esposter/commit/f059ffd3fd3fc488e2ee93fde6a4cfb54e87cc36))
* **test:** run vitest on windows via minimal module allowlist ([abe2279](https://github.com/Esposter/Esposter/commit/abe2279ed2909a13908910374ca87c62dd4ac0ae))
* tests ([2865e58](https://github.com/Esposter/Esposter/commit/2865e58e8f12c4e5ffd97c07ccf5fcffa4b8e551))
* tests + remove unnecessary plugin ([420448a](https://github.com/Esposter/Esposter/commit/420448a450ce2056c68566e5da8326dbf1f9b700))
* tests and push notifs for webhooks ([c88d5e6](https://github.com/Esposter/Esposter/commit/c88d5e6985276d33a23047479da76650f5dcfbc1))
* types and commands ([e0ad825](https://github.com/Esposter/Esposter/commit/e0ad82515d8bb6c1adc46b3ee30b7fa35650910c))
* unifying vitest ([8e3e6bf](https://github.com/Esposter/Esposter/commit/8e3e6bf186a7fecbd3054cf5b9e80e5763d3c8b0))
* visibility ([5eb2f77](https://github.com/Esposter/Esposter/commit/5eb2f7773c44a38703edfed1b2f87124e398e087))
* wip ([1bb9874](https://github.com/Esposter/Esposter/commit/1bb9874ea021e6b09833c595c743d72d6c7aea9c))

### Features

* Add pip ([cd007b7](https://github.com/Esposter/Esposter/commit/cd007b744c586d68d0df438c75a732b61357ff2a))
* **esbabbler:** add voice/notification user settings and adopt vueuse media composables ([9eb80e5](https://github.com/Esposter/Esposter/commit/9eb80e5b095d408117d59358db6341ca97bca1d8))
* **esbabbler:** DB-backed Discord-style user-settings surface ([b61bf66](https://github.com/Esposter/Esposter/commit/b61bf6649da89c1be1d1c38feef41bfe31c44dda))

### Performance Improvements

* fix lint + optimize ([0756cc6](https://github.com/Esposter/Esposter/commit/0756cc6f5fc6b2f067959cd484631a45d6e1ee00))

# [2.28.0](https://github.com/Esposter/Esposter/compare/v2.27.0...v2.28.0) (2026-06-14)

### Bug Fixes

* add back color pack ([c049125](https://github.com/Esposter/Esposter/commit/c04912599694879c31b9149fce91c10840affa21))
* add back lock ([266b5c5](https://github.com/Esposter/Esposter/commit/266b5c58bfaabe5714b22a8a60212e9f16830eeb))
* add file ([b086876](https://github.com/Esposter/Esposter/commit/b0868766946e3cd9b5ee5313afbe3a7fa116d1da))
* add files ([5374ab0](https://github.com/Esposter/Esposter/commit/5374ab0fdc3913b20c4b9d300eeaae2152514153))
* app types ([13e21ec](https://github.com/Esposter/Esposter/commit/13e21ecca8184a007707a6ff21eddd44f7a6fad7))
* chat + read app users ([dfbda40](https://github.com/Esposter/Esposter/commit/dfbda40fcd7ac02d3f798e280a3e9b5fec4cd1b4))
* cleanup code ([c377566](https://github.com/Esposter/Esposter/commit/c37756616760798a63929f537ae52300a27dbbef))
* cleanup scheduled at values ([47cf943](https://github.com/Esposter/Esposter/commit/47cf943817acb287b5891898d365674c40081dd4))
* cleanup test ([188e6f1](https://github.com/Esposter/Esposter/commit/188e6f1599afecd4064f3ea06cea79fb934298ea))
* cleanup tests and skills mds ([9983303](https://github.com/Esposter/Esposter/commit/99833037fb5c1308a34af214d5162de8af77289b))
* cleanup unnecessary numbers and time to use dayjs durations ([028ec14](https://github.com/Esposter/Esposter/commit/028ec144d8c9943b7d691ed70874362d49937c26))
* code review comments ([5e74251](https://github.com/Esposter/Esposter/commit/5e74251595576af2a7c86cc13b66a7fceeb27b4e))
* code review comments ([f448253](https://github.com/Esposter/Esposter/commit/f44825346577b5c8afb5231af31dbc2a986eb60e))
* code review comments ([3c654a9](https://github.com/Esposter/Esposter/commit/3c654a9376d85ff05d8e69acf372aca775830c6a))
* code review comments ([09db4c9](https://github.com/Esposter/Esposter/commit/09db4c906ae9458021c0ea3c2960e798c516e7a4))
* code review comments ([61cbffd](https://github.com/Esposter/Esposter/commit/61cbffd5767549d1a787bbd3bc0193bfd78733d4))
* css ([70df863](https://github.com/Esposter/Esposter/commit/70df8638d93959d29ea3e6ece681e8d89bb673d3))
* declarations & test values ([fe3febb](https://github.com/Esposter/Esposter/commit/fe3febb4a70b7bef0a715e8236cc92a9200f814e))
* deps ([a3c175d](https://github.com/Esposter/Esposter/commit/a3c175dc66c67be014c6ed0effea478420653eaf))
* duration + hopefully azure-functions ([dd1f905](https://github.com/Esposter/Esposter/commit/dd1f90595f65a918da7e89a75844112b949d876e))
* game and constants ([0152909](https://github.com/Esposter/Esposter/commit/0152909ecfade5ee50e270a53e6e43d8fd5990a6))
* lint ([6fa078d](https://github.com/Esposter/Esposter/commit/6fa078d74f5e5a185899dddac19816e639891a88))
* lint ([c599299](https://github.com/Esposter/Esposter/commit/c5992991ec8b50dad47ab936534eb8f5357abbd1))
* lint & types ([d7cb7e2](https://github.com/Esposter/Esposter/commit/d7cb7e28f1fe71e6e0d0288f0237dfb484cfc8f5))
* lint and types ([dbd2cff](https://github.com/Esposter/Esposter/commit/dbd2cff9011d99d9fd6afa1a855a8a40a56673f7))
* lint and types ([1a2cf36](https://github.com/Esposter/Esposter/commit/1a2cf36ac8acce3d3c27ea901c8a376154e158d8))
* lint and types ([80b8453](https://github.com/Esposter/Esposter/commit/80b845322b58709a72ce26c912fc145304340ade))
* lint and use coercion for enum routes ([fb0a8c4](https://github.com/Esposter/Esposter/commit/fb0a8c4dacc0d7912015ce0156849fe193253235))
* more tests + refactors ([4d060ba](https://github.com/Esposter/Esposter/commit/4d060bae8b00eeb8bfde2515ecac1a9b928bf85e))
* ready room UI ([cc585e3](https://github.com/Esposter/Esposter/commit/cc585e38df14cb9dc86578f7cdfb3d2deaa06350))
* rename to offset ([5598bd6](https://github.com/Esposter/Esposter/commit/5598bd68e6ab33ffd918a82ddc724057db481cf9))
* revert unnecessary 'fix' ([08376c3](https://github.com/Esposter/Esposter/commit/08376c3a6b8fa611ff75681d828a982ecd7a8884))
* snapshot ([142909a](https://github.com/Esposter/Esposter/commit/142909a9184f63231bf9541d12293cfae177ffea))
* snapshot ([7c2eedf](https://github.com/Esposter/Esposter/commit/7c2eedf387aeb87689c7021cfa296e4b9fa90f7d))
* snapshots and dev env for now ([c774f1c](https://github.com/Esposter/Esposter/commit/c774f1c58f72f5274c74bc97eca204d30bbc09ee))
* snapshots and tests ([9b2a6f2](https://github.com/Esposter/Esposter/commit/9b2a6f2102395a230ef4cd0b1f3a31fe37408c08))
* styles ([5b10be9](https://github.com/Esposter/Esposter/commit/5b10be940bb3a0f2c0104a91f2fc88dc6d6d8dc9))
* tests ([7e4cec9](https://github.com/Esposter/Esposter/commit/7e4cec983d30c51a3be50975738995d1be588e45))
* tests ([9f8278b](https://github.com/Esposter/Esposter/commit/9f8278b2747387b11c3fd3ff6fbbad196c2f7124))
* tests ([25e6eda](https://github.com/Esposter/Esposter/commit/25e6edae501249b79b86401e7e65b93de1ab3cd6))
* types ([29f935b](https://github.com/Esposter/Esposter/commit/29f935bcfc4d43fba153378ceceb29dbf89315ba))
* types ([567c242](https://github.com/Esposter/Esposter/commit/567c2422c3b14492b140d02c871643f947f95599))
* types and migration ([f9b7d92](https://github.com/Esposter/Esposter/commit/f9b7d92c58f4d1fae9ff03e4fa09587e49ef975b))
* unblock page render + z index ([92efd69](https://github.com/Esposter/Esposter/commit/92efd69e590e81d05c56a6f54b0134f7bba91d62))
* vue component ([982eeae](https://github.com/Esposter/Esposter/commit/982eeae3841b53b38ab88b20faa9fcdd0cac5c92))
* wip ([fb38ad5](https://github.com/Esposter/Esposter/commit/fb38ad5ea5f2bc5fef84aa2fead3df34b262130c))
* wip ([ffb8b3e](https://github.com/Esposter/Esposter/commit/ffb8b3e25832225b6f177e9a8d331ea1bf813f09))

### Features

* Add drafts and sent ([f86443c](https://github.com/Esposter/Esposter/commit/f86443c1600895a4cbb872e405a0e5417d581239))
* Add mock search db ([56c5461](https://github.com/Esposter/Esposter/commit/56c546111c798846a7c21fb6a8093cee91dc4231))
* Add reminders ([6f5d6b7](https://github.com/Esposter/Esposter/commit/6f5d6b70c233c74140864b5a4cca23df5a186d81))
* Add tests ([f8638ed](https://github.com/Esposter/Esposter/commit/f8638ed017da4092b7aa91179ad449b7d808143b))
* Add uno config test ([6f1a226](https://github.com/Esposter/Esposter/commit/6f1a226dbcfb13c1814d71d8a4dea9afec955c44))
* consolidate sanitize html to message ([b586502](https://github.com/Esposter/Esposter/commit/b5865027c92744e360110f522b4107df183fece2))
* refactor up call UI ([77ba5cb](https://github.com/Esposter/Esposter/commit/77ba5cba4ca227ea33fd61f998aec98b4b844661))
* refactor up call UI ([f912752](https://github.com/Esposter/Esposter/commit/f912752844766d7b8c2d2b094a94f6ca3697016d))
* refactor up call UI ([bf5cf17](https://github.com/Esposter/Esposter/commit/bf5cf17198127ba9f8aea48c6625b160b3c60fab))
* wip ([4f094da](https://github.com/Esposter/Esposter/commit/4f094da70109cc17533f2e6d70bd995fac477d0d))

# [2.27.0](https://github.com/Esposter/Esposter/compare/v2.26.0...v2.27.0) (2026-06-05)

### Bug Fixes

* add async context to fix rendering ([e3ba565](https://github.com/Esposter/Esposter/commit/e3ba56523c5625e56e401de571df8f1e36164491))
* add back ts-nocheck for nuxt config ([27c783e](https://github.com/Esposter/Esposter/commit/27c783ef72c945dcc9603b316e1fc47b0beaad08))
* add back value ([319ccb3](https://github.com/Esposter/Esposter/commit/319ccb36e3841d323cd81dc1fefa53872a818e2c))
* call view ([f1808fa](https://github.com/Esposter/Esposter/commit/f1808fa7c617035096ad947075034a98a1cc5771))
* CI/CD ([134d9bb](https://github.com/Esposter/Esposter/commit/134d9bbf50b82b29ec3f9417295a866ab4503b36))
* cleanup knocker state earlier ([eb1572e](https://github.com/Esposter/Esposter/commit/eb1572e622a18abbe1e41b1ed5c99df785e54fb1))
* cleanup normalize string and add tests ([b5085f6](https://github.com/Esposter/Esposter/commit/b5085f677b00a8a5f705637d43de8dae6c66e4d4))
* cleanup onclick ([718dda5](https://github.com/Esposter/Esposter/commit/718dda542a30e460d02ef683ba015188a470b2f3))
* code review comments ([f8352e9](https://github.com/Esposter/Esposter/commit/f8352e9303b3c0c224110bfd9b53eafef1c7ed7c))
* code review comments ([a634229](https://github.com/Esposter/Esposter/commit/a634229abe64dfe2caf991af6aaac5e7bf9998c2))
* code review comments ([9c0a26c](https://github.com/Esposter/Esposter/commit/9c0a26cffa15fe72e52f87222b16dee3815e765c))
* code review comments ([3c8eccf](https://github.com/Esposter/Esposter/commit/3c8eccfb0ba8403a9678e5aa04ef7a913ee1790d))
* code review comments & snapshot ([96e93cd](https://github.com/Esposter/Esposter/commit/96e93cdc0ec0bc81b681e99b6d1f788f16f23048))
* deps + lint ([ae95bc1](https://github.com/Esposter/Esposter/commit/ae95bc10d6894476f663b0d3758a3d1787cbb87e))
* deps + snapshot ([6840d8c](https://github.com/Esposter/Esposter/commit/6840d8ccb08baf73483027684067ced234b67a7c))
* deps wip ([3c6f204](https://github.com/Esposter/Esposter/commit/3c6f2048a3bc56abc7422e07eaca17dedd6f30e6))
* file rendering wip ([b4a885e](https://github.com/Esposter/Esposter/commit/b4a885e3980d1f500127b6ba38a68c71039ed613))
* finally fix up file rendering ([ee72f5d](https://github.com/Esposter/Esposter/commit/ee72f5d7e09ccb0251ef7582ee6de5312e2f15f2))
* lint ([2fdb50f](https://github.com/Esposter/Esposter/commit/2fdb50f7c90708219a29b47abb5213dbfb5fdd64))
* make filename for default files present ([f11ca1d](https://github.com/Esposter/Esposter/commit/f11ca1d95ab2401f46e9643a0ccc138576e98f92))
* make inspector be created on mount ([bfcd013](https://github.com/Esposter/Esposter/commit/bfcd013a4a8cb96ec4ab9faa333b7ea6fc1fdb5d))
* perms ([a247df3](https://github.com/Esposter/Esposter/commit/a247df3e7cbfb7575e8d5b6c05ab597146a3acab))
* rasterize svg ([d95661c](https://github.com/Esposter/Esposter/commit/d95661c36080af192902200d6635871161525267))
* reconnect message creation ([b0b0e77](https://github.com/Esposter/Esposter/commit/b0b0e77bccd91613dcbccff818d9e1c7262f009c))
* refinement ([baa7e90](https://github.com/Esposter/Esposter/commit/baa7e9042946c79f36d562a60dc338affc423347))
* remove unnecessary attr ([89e5620](https://github.com/Esposter/Esposter/commit/89e562070bdb4db8ed209bb4da6949ea6a1548b5))
* revert ([8360cdd](https://github.com/Esposter/Esposter/commit/8360cdd61d473b12b6775996a9b69e8de7e11744))
* snapshot ([aa3d8c5](https://github.com/Esposter/Esposter/commit/aa3d8c5a86d19da5b52a981544f0fec86142acdb))
* snapshot ([d90a1b1](https://github.com/Esposter/Esposter/commit/d90a1b16b7ae94fbc3f5cbced4f5533ebedf9314))
* snapshot ([7932583](https://github.com/Esposter/Esposter/commit/7932583d15be36b167716157a0ecae1e00458dc9))
* snapshot ([7ae781a](https://github.com/Esposter/Esposter/commit/7ae781a54fdb09bfe998ef544596609ac893c2ee))
* snapshot ([19b1178](https://github.com/Esposter/Esposter/commit/19b1178f800ca3c600c9c60ca56f51c1f8ff6b1c))
* snapshot ([6d495ad](https://github.com/Esposter/Esposter/commit/6d495adc80788297b2f1cb54caa136e653f4987f))
* snapshot ([ab17d12](https://github.com/Esposter/Esposter/commit/ab17d1201b2bdee2d46711147b7f1fdb385fe1e8))
* styles ([0fcb9e8](https://github.com/Esposter/Esposter/commit/0fcb9e840fc56480a5cec5fc2c2e30940cde6925))
* styles and vite deps ([d664d49](https://github.com/Esposter/Esposter/commit/d664d49986b330f4acd44607a60707f037b282a7))
* test syntax ([d0c4f38](https://github.com/Esposter/Esposter/commit/d0c4f38f438c128bd3b51009217003cc5b8f48be))
* tests + snapshots ([f09b387](https://github.com/Esposter/Esposter/commit/f09b387e51e6b7a6139a4f50189bd4cfcf97302c))
* tests and lint ([59bcf59](https://github.com/Esposter/Esposter/commit/59bcf59310701d7a1b49934bec2217ce3d77fc42))
* transformer to revive dates as well ([30f87f9](https://github.com/Esposter/Esposter/commit/30f87f9b0de085c724dc00b18c44849078d0d56b))
* ts6 ([a0e8448](https://github.com/Esposter/Esposter/commit/a0e84485b2ff8c50b8511a86f71006bbeb71d382))
* types ([5bbd321](https://github.com/Esposter/Esposter/commit/5bbd321bb17bc79cbde36d4a230f393a0d9ad830))
* types ([97908b7](https://github.com/Esposter/Esposter/commit/97908b726fb61f68b009674ce0cb81c84c2adb5e))
* types ([cb3ac38](https://github.com/Esposter/Esposter/commit/cb3ac38452ba5c7f0253c4eccfdf9266997e272c))
* types ([ca9ccfa](https://github.com/Esposter/Esposter/commit/ca9ccfae2446211b2e332c9fda708f9b72857dea))
* types and code review comments ([c01ab87](https://github.com/Esposter/Esposter/commit/c01ab8738a06ae40906b3726052f02e744989799))
* types and migrations ([3cb6145](https://github.com/Esposter/Esposter/commit/3cb6145d43cfb1e046fdf0f589bce9ecad311c3d))
* use var as well for fixed layout styles ([b1deb9b](https://github.com/Esposter/Esposter/commit/b1deb9b804f4197b668434f93f5cc26a22cb3bbc))

### Features

* Add better UX for edit form dialog ([868c01a](https://github.com/Esposter/Esposter/commit/868c01a546dca0155d7114a3e6d24d58650459de))
* Add call health ([3b69564](https://github.com/Esposter/Esposter/commit/3b695643a87cd09b5d8b7f7e2de61b4305d97dae))
* Add create unique array schema ([b3787f6](https://github.com/Esposter/Esposter/commit/b3787f68be7b0775fae39da02ca4aa57a60641f5))
* upgrade to ts6 and unplugin-dts v1.0.2 ([adcba0e](https://github.com/Esposter/Esposter/commit/adcba0e5c651643044c543c1f35f52b68d391a37))

# [2.26.0](https://github.com/Esposter/Esposter/compare/v2.25.0...v2.26.0) (2026-06-01)

### Bug Fixes

* add import types ([fedea83](https://github.com/Esposter/Esposter/commit/fedea83283412831625fa53c18a3bc3e9682afce))
* add isWindows check ([2b101a5](https://github.com/Esposter/Esposter/commit/2b101a5b8d67bb0751d1c7ef01b0253e6aef8190))
* add sanitize message html ([0e9bc6c](https://github.com/Esposter/Esposter/commit/0e9bc6c2d58b0b28b25019e3085d1add86acb8ad))
* cleanup use push subscription ([81c1b4e](https://github.com/Esposter/Esposter/commit/81c1b4eba3aa147d7572512d4ec821149423c97d))
* code review comments ([925344c](https://github.com/Esposter/Esposter/commit/925344c79ce33bb524401fa4ed6728a7639bc4d8))
* code review comments ([f4c116d](https://github.com/Esposter/Esposter/commit/f4c116dbbc15fd54e04019aa27cc63c9e6c85266))
* code review comments ([679b17b](https://github.com/Esposter/Esposter/commit/679b17ba862a81c665616aebff7f9a7a1f3027d4))
* created at defaults ([babfaa3](https://github.com/Esposter/Esposter/commit/babfaa3771a2f3a776373243a33151723d3569c6))
* delete if exists mock ([7515580](https://github.com/Esposter/Esposter/commit/751558025e548c9b63b7fa1279f64a96445209c5))
* ensure create message is idempotent ([3eb319b](https://github.com/Esposter/Esposter/commit/3eb319b8e13cde6bfb3f8f5237ef253d0ae512b5))
* env ([75c8fea](https://github.com/Esposter/Esposter/commit/75c8fea8faae419ca1f923c0e890aff27f3d662f))
* format ([97800d7](https://github.com/Esposter/Esposter/commit/97800d763300a65d42742bbb919ec9ac2b7c46f8))
* format + perms ([5231b9a](https://github.com/Esposter/Esposter/commit/5231b9a3ec19477ee70573477273d7ba312d3659))
* lint ([a833e13](https://github.com/Esposter/Esposter/commit/a833e1329d343af51adc801445d4670dc705bdf6))
* lint ([0175bc7](https://github.com/Esposter/Esposter/commit/0175bc719906204dfbf49728e7cbf6a41cda0854))
* lint ([1a6ab76](https://github.com/Esposter/Esposter/commit/1a6ab764624468941ae95814fea48588dde7d839))
* lint ([fc95fe9](https://github.com/Esposter/Esposter/commit/fc95fe92f05eec1e211861c446069da2911126cd))
* lint ([a1c7d4c](https://github.com/Esposter/Esposter/commit/a1c7d4c98f6c8e20185935f8981db4d9bbc68076))
* lint ([a3ee984](https://github.com/Esposter/Esposter/commit/a3ee9848b927010cb60b79664de613bd7d8e5b2c))
* lint ([e3f033f](https://github.com/Esposter/Esposter/commit/e3f033f5a1bc4383e9d722b3b1860114ac5a8de6))
* lint ([d6d2fb1](https://github.com/Esposter/Esposter/commit/d6d2fb1a933870c8d9ecd5c5d36008f0f0c2a6e1))
* lint and test snapshots to include linux ([2389fbc](https://github.com/Esposter/Esposter/commit/2389fbc9f692c65fcff37f5e4e766af6b3e3f722))
* migrations + types ([444c5e4](https://github.com/Esposter/Esposter/commit/444c5e42213ab207348e07cc5f845f477c50caf2))
* nitpicks ([650c56b](https://github.com/Esposter/Esposter/commit/650c56b81d9bc18884f010b9b38101c6cec57dfa))
* peer deps ([32a7a7a](https://github.com/Esposter/Esposter/commit/32a7a7ab7276f5ad16170e54c74926bb0dbfdf03))
* push subcriptions and notif bugs ([50bda79](https://github.com/Esposter/Esposter/commit/50bda79f22177aa6976c25290264244c76c9dae3))
* refactor ([3f5bea8](https://github.com/Esposter/Esposter/commit/3f5bea8ad16df509cf0aacbcb391d114411dc266))
* refactor trpc ([6385938](https://github.com/Esposter/Esposter/commit/6385938b1fc271a2bf04626ef1df2143ca122934))
* renames ([083a8e3](https://github.com/Esposter/Esposter/commit/083a8e3e12bf958cf2e1825f9d380be5cf53686f))
* room image field ([982eca0](https://github.com/Esposter/Esposter/commit/982eca05d14e2b4ebe2a992bf216b80cd83d955a))
* sanitize message ([d52c8be](https://github.com/Esposter/Esposter/commit/d52c8be322eb973a411f4218b5e5f6237bc376d3))
* scroll ([c88d056](https://github.com/Esposter/Esposter/commit/c88d0565c662055981cf3e56bf152892e4419852))
* search bar menu behaviour ([59ddfb9](https://github.com/Esposter/Esposter/commit/59ddfb93d59df72c5f8165cefd76826eb5083bfe))
* skip unstable bundle size test for app ([0f026f8](https://github.com/Esposter/Esposter/commit/0f026f8ed53c2d0f765e696dacaf7cb8fafae54f))
* snapshot ([bccbe76](https://github.com/Esposter/Esposter/commit/bccbe76b21895307afbe2f39a8279ca09b5c2b6b))
* snapshot ([90129c0](https://github.com/Esposter/Esposter/commit/90129c00631715d44f879e527c2893ebafd5eea5))
* snapshot ([8216f7e](https://github.com/Esposter/Esposter/commit/8216f7ec33ca4d26e8ef9cf43c7cc2e142243023))
* snapshot ([c4869ae](https://github.com/Esposter/Esposter/commit/c4869ae967199cc29094e715ef10973aae0a0046))
* snapshot ([c7e8285](https://github.com/Esposter/Esposter/commit/c7e8285254b468bb0952f6405001ca35a278b0d2))
* snapshot ([7406968](https://github.com/Esposter/Esposter/commit/7406968802aa5b072762d87efb1fe6a73d0a5f87))
* snapshot ([d05f212](https://github.com/Esposter/Esposter/commit/d05f2128e5ca241cde6c28a86beb88de46d6ead9))
* snapshot + h3 ([b777cb3](https://github.com/Esposter/Esposter/commit/b777cb38305447e7ba35da2a460e303f67dc177e))
* styles and v-if ([cd43db6](https://github.com/Esposter/Esposter/commit/cd43db631bf1a7e11970862941d0751b547b9e5e))
* syntax ([2c0ec11](https://github.com/Esposter/Esposter/commit/2c0ec11b012061f8fbd387e88997cce11748f603))
* tests ([6b3c0e9](https://github.com/Esposter/Esposter/commit/6b3c0e99f921fa7e7528d83e9f89772b40127765))
* tests ([69be85f](https://github.com/Esposter/Esposter/commit/69be85f0470aba792f9906b9edb60022aad450d2))
* tests ([1f10236](https://github.com/Esposter/Esposter/commit/1f10236637acb9c78de2d2b876534e6474c2f743))
* tests ([f6db3be](https://github.com/Esposter/Esposter/commit/f6db3bec16323874196b7354f2611f7b146edac5))
* tests ([067b250](https://github.com/Esposter/Esposter/commit/067b2504d8dece5a2d20d3276b10c2fbbe87bcfb))
* types ([a2fa725](https://github.com/Esposter/Esposter/commit/a2fa7257dc13b80c2ce16056b5e561410dada691))
* unocss classes ([c5bab43](https://github.com/Esposter/Esposter/commit/c5bab4351685d3dc9a5fe61935d98726f524150e))
* wip tests ([87dcb4d](https://github.com/Esposter/Esposter/commit/87dcb4db2a8b0b2d3de7d9eca87d6daab9a47056))

### Features

* Add create/delete group dms ([649ea22](https://github.com/Esposter/Esposter/commit/649ea2285c47909ce365c5f38b8a1e5fe21cc344))
* Add raise hand ([18fa9df](https://github.com/Esposter/Esposter/commit/18fa9df3e07dda085b4827b9b8187f686becaf47))
* Add remove icon ([f86c48c](https://github.com/Esposter/Esposter/commit/f86c48c9e67a8b615cec0364d7c8f7c29c745d35))
* Add roles mentions ([3207313](https://github.com/Esposter/Esposter/commit/32073134328a66a0a2429ce595d77f34da4cd614))
* implement upload files ([1968668](https://github.com/Esposter/Esposter/commit/1968668d9c8b6f9980d2418e3b75a4b62024bf8c))

# [2.25.0](https://github.com/Esposter/Esposter/compare/v2.24.0...v2.25.0) (2026-05-21)

### Bug Fixes

* add app webhooks ([14e534e](https://github.com/Esposter/Esposter/commit/14e534e17c13611b88eb0d84b3e71fc315318b6e))
* add back vue-tsc ([94915d0](https://github.com/Esposter/Esposter/commit/94915d0471b8b8e6f03d839abc20a17c4a0d92e7))
* add oxlint disable ([a351d87](https://github.com/Esposter/Esposter/commit/a351d87e8281d337a321c192b72fa8c5d817b211))
* desmos to be undefined on server ([51d44d9](https://github.com/Esposter/Esposter/commit/51d44d9cf8d8599284c71002df76b9d55d628515))
* instance ([56bab96](https://github.com/Esposter/Esposter/commit/56bab9669984edee71223c18f23ae962dd6b820a))
* lint ([4e1b640](https://github.com/Esposter/Esposter/commit/4e1b640788e95a388361a407e5b315f80d1c42bd))
* lint ([e2dda0a](https://github.com/Esposter/Esposter/commit/e2dda0a603f895b04ee670ea9b23af5bd3e19548))
* lint + optimize some docker ([e110ea9](https://github.com/Esposter/Esposter/commit/e110ea9ae5f2bad6dc45429741a540b517598b10))
* node memory + update naming conventions ([3ed843a](https://github.com/Esposter/Esposter/commit/3ed843ae7b0b29e11f060484ae922629490d252b))
* rip pnpm v11 doesn't let us npmrc memory anymore :c ([04bf6b7](https://github.com/Esposter/Esposter/commit/04bf6b7e0cc5247fab3c0da2e6600d6ec749f950))
* throw error ([fb55e04](https://github.com/Esposter/Esposter/commit/fb55e04c2247950a4b3ab3ab35c1b9aa06b3e455))
* title ([7be091c](https://github.com/Esposter/Esposter/commit/7be091c9a2a7c2ded12093b706dc07829aa95143))
* types and build docs warnings ([e1e70e2](https://github.com/Esposter/Esposter/commit/e1e70e2e21e7c4c70cdb0b4e73c1c2a4f6db3d09))
* upgrade grid-engine ([6cf6345](https://github.com/Esposter/Esposter/commit/6cf634564eaa6b14e613203d95c25e036d1b7882))
* use class expression ([aa75ee5](https://github.com/Esposter/Esposter/commit/aa75ee5f44159b8e3d5bab9503b54088547bbeae))
* use function keyword ([210ccc9](https://github.com/Esposter/Esposter/commit/210ccc9481554ab4bdd721c014f906da1542111a))

# [2.24.0](https://github.com/Esposter/Esposter/compare/v2.23.0...v2.24.0) (2026-05-15)

### Bug Fixes

* add snapshot ([f690fbb](https://github.com/Esposter/Esposter/commit/f690fbb42962108ab4cc9622d4c9f9c27e2cb1eb))
* button, spine and skills md + comments ([110b422](https://github.com/Esposter/Esposter/commit/110b422e7a831c55fdeb00eda90765bd342bb5f9))
* cache wip ([6add2a3](https://github.com/Esposter/Esposter/commit/6add2a3fa2395208843c5aa9db6ec1c18b0d6a37))
* cache wip ([8114a75](https://github.com/Esposter/Esposter/commit/8114a75d218930786c0d11f6a50a52a30b2a8b61))
* calls and cleanup things ([37e883e](https://github.com/Esposter/Esposter/commit/37e883ed639746dd92874586ece2bd2c4686bcef))
* camera issues ([3668328](https://github.com/Esposter/Esposter/commit/3668328ec554170d7fa26821e53d9bf12086a4af))
* checks ([3dfdc06](https://github.com/Esposter/Esposter/commit/3dfdc06f557557f723a48e945beec7101234ac1d))
* cleanup string | undefined ([3da6ef4](https://github.com/Esposter/Esposter/commit/3da6ef4760c640e5b126478481436392f80aa9bf))
* cleanup unnecessary returning boolean ([2482636](https://github.com/Esposter/Esposter/commit/2482636ebf0e0340721624821ee5e6551b97f677))
* clearing cell selection ([9abcd8b](https://github.com/Esposter/Esposter/commit/9abcd8b6693f6c7d0ca136356f74b37480d3bc9e))
* code review comments ([327e95a](https://github.com/Esposter/Esposter/commit/327e95acda7deb51101d96a06e0a69ed07093565))
* code review comments ([bd48985](https://github.com/Esposter/Esposter/commit/bd48985d5b7be7b293ffacbde1ae72c73bb7b6ef))
* code review comments ([96ea7df](https://github.com/Esposter/Esposter/commit/96ea7df5c1808871c072c6d5c209e4c87c42593a))
* code review comments ([53ec6c0](https://github.com/Esposter/Esposter/commit/53ec6c0d4c76b54197d4a7bc26f5b9c96c7d1eb2))
* code review comments ([603cf23](https://github.com/Esposter/Esposter/commit/603cf237993bee3e1e10ad24f310efd2d5ee20d8))
* code review comments ([01d6cb2](https://github.com/Esposter/Esposter/commit/01d6cb2e10f9e630627a3bd79eeb3048998944ce))
* code review comments ([1afb768](https://github.com/Esposter/Esposter/commit/1afb768e84949d6fc99d1df74e1ba9da717fe81c))
* code review comments ([5e9378c](https://github.com/Esposter/Esposter/commit/5e9378c1e7829e24b0bcd522a102834025eff67a))
* code review comments ([67911c7](https://github.com/Esposter/Esposter/commit/67911c7d9edc28d080151799faccaaa53a949ebc))
* code review comments ([9140545](https://github.com/Esposter/Esposter/commit/914054599d0690e095ecd550d484f30316881f69))
* code review comments ([f759f5d](https://github.com/Esposter/Esposter/commit/f759f5d5b42e5596495f51f0cf07c1b3091ec3ce))
* code review comments ([7318ba5](https://github.com/Esposter/Esposter/commit/7318ba51d3e529899acdd5506bcf283591ff4440))
* code review comments ([c11a999](https://github.com/Esposter/Esposter/commit/c11a999d5daff8abb21d8e25aa88be964514ac24))
* code review comments ([6c9a2bf](https://github.com/Esposter/Esposter/commit/6c9a2bff45b9fa9fdc23a03316dcacc391be1240))
* code review comments ([8afe5ed](https://github.com/Esposter/Esposter/commit/8afe5ed306a559e29282be437e2de6126c33ff89))
* column statistics ([deb5ceb](https://github.com/Esposter/Esposter/commit/deb5ceb1c1143d26af3a32f50d506edd7f5b1c24))
* comment and reply ([b4977fc](https://github.com/Esposter/Esposter/commit/b4977fcfaf17295f163b454801b603171b249090))
* don't use reserved keyword ([94a73fd](https://github.com/Esposter/Esposter/commit/94a73fddedc8ab93b848c4da4f5cd36efb7f9d66))
* final cache issues I think ([648987e](https://github.com/Esposter/Esposter/commit/648987ed1b265d477994d789bd25d5699fae93eb))
* grid engine referencing phaser globally ([71ac015](https://github.com/Esposter/Esposter/commit/71ac0155000532f6e946ba6a281859b8b4ef7db5))
* guard call session access ([5ce13ba](https://github.com/Esposter/Esposter/commit/5ce13ba1b2ab3c2e6aa8d53f789c60b54fe49a13))
* index ([4034cec](https://github.com/Esposter/Esposter/commit/4034cecdfa51b94d6d408a7e3f23842ad031a2f2))
* issues ([b6a8d24](https://github.com/Esposter/Esposter/commit/b6a8d246ee8629e161981346da69f89a4a285d12))
* issues ([8f883fe](https://github.com/Esposter/Esposter/commit/8f883fea3eac1b1e154975396c06284b0fa2ed78))
* layer and calc ([87b31bf](https://github.com/Esposter/Esposter/commit/87b31bf0d4b61c109786a48eacb2f86e35294fb5))
* lint ([6660579](https://github.com/Esposter/Esposter/commit/6660579af77755101788c894075cbad2431bcf17))
* lint ([d4787b0](https://github.com/Esposter/Esposter/commit/d4787b04f20274f76f479c08582798ebbdf9bf70))
* lint ([d74be9f](https://github.com/Esposter/Esposter/commit/d74be9ff1628b73a1bfac07444a43bd4735a3f18))
* lint ([73eb1b7](https://github.com/Esposter/Esposter/commit/73eb1b7c959596909bbff90e1e93f472c22729c9))
* lint ([787d507](https://github.com/Esposter/Esposter/commit/787d507139ab5b572f92dc1dc1d5f258b3b09c99))
* lint ([7dfd175](https://github.com/Esposter/Esposter/commit/7dfd1753bd3d4b822bbf0ecb6a9d27c4dee49c84))
* lint ([d2f3a99](https://github.com/Esposter/Esposter/commit/d2f3a991715c49af54d2b043ed84d4c68295fb3c))
* lint ([dd44a64](https://github.com/Esposter/Esposter/commit/dd44a64b96228adc155ab60afdb2829c35c8d036))
* lint ([61c154e](https://github.com/Esposter/Esposter/commit/61c154eac4542ab450e27530b259a893e87cc6dd))
* lint ([32ba662](https://github.com/Esposter/Esposter/commit/32ba662e213f7f784ada82b2badeebed294d4cbe))
* lint ([21f7754](https://github.com/Esposter/Esposter/commit/21f775451c6975f87c6cd7a244053a34abba0f05))
* lint ([92cce33](https://github.com/Esposter/Esposter/commit/92cce33cbe510ba04dbdf152a0091b231b5e05b3))
* lint ([d77bfd5](https://github.com/Esposter/Esposter/commit/d77bfd5a3191cad1a5c7008ef20bf2eafbfcfec1))
* lint ([06e755d](https://github.com/Esposter/Esposter/commit/06e755da9e39929a32f4aee801c61aed8602c255))
* lint ([9b70464](https://github.com/Esposter/Esposter/commit/9b70464c5466ac2acf3b985e62567e8dc67faa8f))
* lint ([87de628](https://github.com/Esposter/Esposter/commit/87de628df886dd33318ff1c9aff65aecd3131c65))
* lint ([07deca7](https://github.com/Esposter/Esposter/commit/07deca7aa5b9975b8a73b4fcf5f360bac25eb28f))
* lint ([73cb6ec](https://github.com/Esposter/Esposter/commit/73cb6ec39c4df3d996536f9138752df5d3e1a81a))
* lint ([b849cee](https://github.com/Esposter/Esposter/commit/b849ceec5bc60c4a91c298141040253637787bb8))
* lint and code review comments ([1deecd4](https://github.com/Esposter/Esposter/commit/1deecd4770db4f7efd86c670f159a4d20ca9801f))
* lint and snapshot ([83841f3](https://github.com/Esposter/Esposter/commit/83841f3e2f874541f22c9c312259bbfcdeecb9a2))
* lint and store ([18aa5d3](https://github.com/Esposter/Esposter/commit/18aa5d330d0ccb3eb3501bf87d06ad9d77ed21d3))
* max read limit ([9e333b3](https://github.com/Esposter/Esposter/commit/9e333b3659782883bb646cd7baaebd095520768d))
* md and snapshot ([6f1a40b](https://github.com/Esposter/Esposter/commit/6f1a40b5e336041cf805df0dedbca70dd3dbdb93))
* md files and elevation ([4f37cb5](https://github.com/Esposter/Esposter/commit/4f37cb5f87d681618a427a90705118db717d81d4))
* merge conflicts ([b4d2b7d](https://github.com/Esposter/Esposter/commit/b4d2b7dea13f4732ca4e1f4c2b64ea5d3aec69ed))
* mock use is prod so our trpc routers can run without nuxt instance ([30d2f95](https://github.com/Esposter/Esposter/commit/30d2f959cf242d71cf61e520940ec686fd6a300e))
* namings ([56d2a45](https://github.com/Esposter/Esposter/commit/56d2a455e7c071d636506eea1fa4c0e66f060646))
* partition key ([2c7357e](https://github.com/Esposter/Esposter/commit/2c7357eeeccadece1b0a1d415e3d027610ac1f97))
* read metadata input ([c852fde](https://github.com/Esposter/Esposter/commit/c852fde31614a53c8881138f8617a93aa7ea41d2))
* refactor resetting db ([1a3bf92](https://github.com/Esposter/Esposter/commit/1a3bf92c525829d51e5423cc2035cfaf064b8308))
* refactor syntax ([b213125](https://github.com/Esposter/Esposter/commit/b2131254a10a4e9454b55942326f2deca358cc00))
* refactor wip ([4281d74](https://github.com/Esposter/Esposter/commit/4281d74e26cbc3b8bbd7227f8e5eec85d75f7464))
* remaining var ([f70fa31](https://github.com/Esposter/Esposter/commit/f70fa31c2a0a2cde2e65afadd675e6080c30b3ce))
* remove opaquing name ([2e61751](https://github.com/Esposter/Esposter/commit/2e617515db6d97f42649506664bf4ef480631036))
* remove redundant primary keys ([cc08d6d](https://github.com/Esposter/Esposter/commit/cc08d6d31c6ac36f9bc32155e7d65437e9f491b3))
* remove tests we can't mock ([8b40c9f](https://github.com/Esposter/Esposter/commit/8b40c9f212cde532ac22741b1cf1264302a7b60e))
* remove unnecessary css file ([8ed6e6c](https://github.com/Esposter/Esposter/commit/8ed6e6cf3783f99110fe7e74a4fcb274f971c85a))
* remove unnecessary styles ([2d47589](https://github.com/Esposter/Esposter/commit/2d475894120374a6cce259c776d23d59e80b4b65))
* reuse createId for closer mocking ([543cf59](https://github.com/Esposter/Esposter/commit/543cf59e6ad8c9db4862b67702bdb279fec75d3f))
* revert test ([6967584](https://github.com/Esposter/Esposter/commit/6967584969dd11f9e13c4068ba15eedcece41b7b))
* score and code review comments ([ac2bb52](https://github.com/Esposter/Esposter/commit/ac2bb523795a390106dad26ec0036dc0730f22a5))
* snapshot ([02f65dc](https://github.com/Esposter/Esposter/commit/02f65dcf741c6119bcb7bd41e90c7b6aa1da53b8))
* snapshot ([77a5502](https://github.com/Esposter/Esposter/commit/77a55024aafb6a5a820d9704f4a890f44878d0a9))
* space ([ef34246](https://github.com/Esposter/Esposter/commit/ef342462a06e9d6a54a729d0d516dd7f49e37bfd))
* state issues ([3156122](https://github.com/Esposter/Esposter/commit/31561224303026171d699cf7afae74247c5686e5))
* store send message ([5e22b1b](https://github.com/Esposter/Esposter/commit/5e22b1b386a8111bdc9746f05edce9b05e8c45e2))
* stubbing globals ([081bf9a](https://github.com/Esposter/Esposter/commit/081bf9a743aaca0e25b8743e50029796397bced1))
* stubbing globals ([d32ab57](https://github.com/Esposter/Esposter/commit/d32ab5763c7bc4bf91782574bde42eb2785b6e4c))
* style in progress ([b630e23](https://github.com/Esposter/Esposter/commit/b630e233815accbf454580e7dd5d707bcafdd5c4))
* styles ([0ee20c9](https://github.com/Esposter/Esposter/commit/0ee20c90171e3f8bb79fd306fd8f47a924fe4d22))
* styles ([9c68e23](https://github.com/Esposter/Esposter/commit/9c68e23485c35f7d8cde0ebebe5bc150e7611edf))
* styles wip ([b02cc0d](https://github.com/Esposter/Esposter/commit/b02cc0d165259e2c9ddaddac658d8ef06567ef6c))
* styles wip ([d13818e](https://github.com/Esposter/Esposter/commit/d13818e072a5ea7dcd1096a5610086311d595996))
* styles wip ([af7e055](https://github.com/Esposter/Esposter/commit/af7e0554478b579c44f14f16f1a82b1c2f515c36))
* tests ([0ea0083](https://github.com/Esposter/Esposter/commit/0ea0083915333ceebcc88e97a59f12a3c051d682))
* tests ([e3ed863](https://github.com/Esposter/Esposter/commit/e3ed863fd803176a26825dfc407ae0bf0e55eabd))
* tests ([1e0a143](https://github.com/Esposter/Esposter/commit/1e0a1430d70263f3c6adaedde8350400ca59be5d))
* tests ([ef2fa28](https://github.com/Esposter/Esposter/commit/ef2fa288910a7e5b53651e92a368b411fbbdfe82))
* tests + commands ([5bc07a7](https://github.com/Esposter/Esposter/commit/5bc07a74c5f6eefb235802810cff024b3792e99a))
* text ([29e67b2](https://github.com/Esposter/Esposter/commit/29e67b2714ecd7ac1c327d54d9b38df35aa91128))
* things ([88f0890](https://github.com/Esposter/Esposter/commit/88f0890ff736bdadf33bb3f8f4a2d745bc6b26ed))
* typechecking and code review comments ([2a85e3f](https://github.com/Esposter/Esposter/commit/2a85e3fe2652b11a563b91e1749a6f1ce38be6dc))
* types ([0174cd2](https://github.com/Esposter/Esposter/commit/0174cd2cfb24f40b7d4ca90e5b019cb0c66e660e))
* types ([3a9486a](https://github.com/Esposter/Esposter/commit/3a9486a5b9cc2242edae2d069c51fa7cd2678998))
* types and code review comments ([de3612f](https://github.com/Esposter/Esposter/commit/de3612fa7cafdb2284281e47adcc8cd03bfecaa4))
* warnings ([cb6930e](https://github.com/Esposter/Esposter/commit/cb6930e29f9faf3f458a6a958470c1bc5b0590e7))
* webhook ([9452e14](https://github.com/Esposter/Esposter/commit/9452e14cc48af799495de2c0a333a24c219ffdaf))
* wip ([f43f51b](https://github.com/Esposter/Esposter/commit/f43f51b45dd67b3bd92641a701e56a1d85f5ca8d))
* wip ([0bc7692](https://github.com/Esposter/Esposter/commit/0bc76929b7627306e172f1cf78e995857c9eeacd))
* wip ([7995b1a](https://github.com/Esposter/Esposter/commit/7995b1a40791ffc2d6a2fedf874f71dd375087eb))
* wip ([6d3919d](https://github.com/Esposter/Esposter/commit/6d3919de232531400e84e9cf87e8625d641b91c3))
* wip ([0fed507](https://github.com/Esposter/Esposter/commit/0fed507e04d4c5f97c68442a47da3d53f9a35ce1))
* wip ([83a1c60](https://github.com/Esposter/Esposter/commit/83a1c605815090fe4c386a235ce17d86e5a03c45))
* wip ([bab2109](https://github.com/Esposter/Esposter/commit/bab21094018551b3661c0420286253b19feaf539))
* wip ([b00c68a](https://github.com/Esposter/Esposter/commit/b00c68a168444d582ccbabbc34cfa56f09530534))
* wip ([4428f58](https://github.com/Esposter/Esposter/commit/4428f58ed36d3cee155186673d3c4f2e5c39ba4c))
* wip ([bfce7f1](https://github.com/Esposter/Esposter/commit/bfce7f1cd653feb0955d6c1ee4267d463dc3f4f8))

### Features

* Add admitting and dismissing ([786d214](https://github.com/Esposter/Esposter/commit/786d214e69f212b98b0116cae697626e5786aa4e))
* add call token page ([1428174](https://github.com/Esposter/Esposter/commit/14281742d516d8da6b93d866780fa5e44a6f9102))
* Add emoji suggestion list ([cd1c020](https://github.com/Esposter/Esposter/commit/cd1c020973a46511d8d35a9499df8693dcb9a91b))
* Add highlight and select ([6d8ca99](https://github.com/Esposter/Esposter/commit/6d8ca99cee4deb7616cc14e1dc6b4d1bee944068))
* add livekit ([9323c6a](https://github.com/Esposter/Esposter/commit/9323c6ae4f67732d3c1878a587edc2ca4f8c1bd5))
* add nickname ([074449a](https://github.com/Esposter/Esposter/commit/074449a3d2a8ee58bcd32edb361abde4c19e0fc4))
* add tsv instead to support excel ([96605f8](https://github.com/Esposter/Esposter/commit/96605f80ec6caad2827a32b41f29dbd9f3b7d489))
* Add UI ([3866644](https://github.com/Esposter/Esposter/commit/3866644051fe053518d923c660cdcc2f448eba69))
* fix up things ([2c1d860](https://github.com/Esposter/Esposter/commit/2c1d860de9605d84734155768fe41673f39789ad))
* screenshare wip ([bb0a78c](https://github.com/Esposter/Esposter/commit/bb0a78cb19068dfff12d9595bb8b25f0f7e3f58f))
* split reading ([5f95bf5](https://github.com/Esposter/Esposter/commit/5f95bf51008fffb5510591272a4986683f8de75b))

### Performance Improvements

* memoize column map ([f4d518b](https://github.com/Esposter/Esposter/commit/f4d518bc38aaa94da3c8bdcd7a3e6c73ed317d13))
* migrate scss to css vars ([5a34ff5](https://github.com/Esposter/Esposter/commit/5a34ff5134fb0ddaef804220666e738a3ba4f551))
* migrate to wind4 ([f376d19](https://github.com/Esposter/Esposter/commit/f376d1979bd225f85560b100b41b731f6d203770))
* optimize rasterize ([9f1fd81](https://github.com/Esposter/Esposter/commit/9f1fd81b8db27a05d2c8e985b3a0f552dad88487))

# [2.23.0](https://github.com/Esposter/Esposter/compare/v2.22.0...v2.23.0) (2026-05-07)

### Bug Fixes

* ajv ([7c5a2ff](https://github.com/Esposter/Esposter/commit/7c5a2ffb0bb3ae7d39aa6ede7f64eda01ddaaf7a))
* align syntax ([e3e731f](https://github.com/Esposter/Esposter/commit/e3e731fb420f5baa492a507fee1c9d37c14ad93e))
* also make table names camel case, now all namings are aligned ([c504b0e](https://github.com/Esposter/Esposter/commit/c504b0e68c6b5247ef34cb763c86aabd15a1bf64))
* assignment ([6f825eb](https://github.com/Esposter/Esposter/commit/6f825ebd7b7747e5bbc3964db2128090daca7311))
* bookmark ([44fe375](https://github.com/Esposter/Esposter/commit/44fe375b02aa24f85042b9b2b9800e78aabbf2f1))
* cleanup unnecessary blank lines ([8ce5868](https://github.com/Esposter/Esposter/commit/8ce58687d1c0621abedaff74cded3d72bab0dbe8))
* cleanup unnecessary extra UI ([898f8ca](https://github.com/Esposter/Esposter/commit/898f8caefa05b6a5460dfbeddc31ada1fe7fc3c9))
* cleanup unnecessary tests for unnecessary endpoint ([78f2ca8](https://github.com/Esposter/Esposter/commit/78f2ca8c866dc86f0c954aa82bbd3f1521ead575))
* code comment issues ([52e4bfb](https://github.com/Esposter/Esposter/commit/52e4bfb58fa542500f56552f7a1a658a7077d0f6))
* code review comments ([680b85e](https://github.com/Esposter/Esposter/commit/680b85ec2fd3d4fcb178b10b6c3b75495382b5ca))
* code review comments ([c9a8f1c](https://github.com/Esposter/Esposter/commit/c9a8f1c368b7036eddb76a2c1099ae22fb80c434))
* code review comments ([4ab7a46](https://github.com/Esposter/Esposter/commit/4ab7a460facafb0a35aa65cac34333f2cc1415d4))
* code review comments ([340d042](https://github.com/Esposter/Esposter/commit/340d042ebd9d0580047f67b84f415c5ecafb74be))
* code review comments ([c3f41ff](https://github.com/Esposter/Esposter/commit/c3f41ff57b20f793d8864bd8a2ebb39bb29b16c8))
* code review comments ([2960a35](https://github.com/Esposter/Esposter/commit/2960a35493c6679140729031ba311f9ea2082b7e))
* code review comments ([f341fb8](https://github.com/Esposter/Esposter/commit/f341fb84518c610871b05f5cf416d41c63aad7a0))
* code review comments ([3cbfc3e](https://github.com/Esposter/Esposter/commit/3cbfc3e25158375dc3ebcc9badd5e7422419eceb))
* condition ([9a13aa0](https://github.com/Esposter/Esposter/commit/9a13aa0f4041a29f8f439fd672598577b064dd55))
* imports ([bc2ba37](https://github.com/Esposter/Esposter/commit/bc2ba370b86a1ddc241bd818d7ff30fc0bf066e3))
* imports ([3b1d1bf](https://github.com/Esposter/Esposter/commit/3b1d1bf8072a171b086d43e36518031d9a589408))
* lint ([67a64e8](https://github.com/Esposter/Esposter/commit/67a64e8e302eb660727c74155dd3f956f9bf5a81))
* lint ([7bb3ecb](https://github.com/Esposter/Esposter/commit/7bb3ecbc02283f581ff12ad30b82485b6c49c697))
* lint ([e5a02f5](https://github.com/Esposter/Esposter/commit/e5a02f57216f13a19d19feb5b3bedd06122db041))
* lint ([b4f6695](https://github.com/Esposter/Esposter/commit/b4f6695aa5005276b3a9e5c2b80016989bc99439))
* lint ([c5ac182](https://github.com/Esposter/Esposter/commit/c5ac1827af7f467265a01fc7e0fefcc669d1aa86))
* lint ([5b22751](https://github.com/Esposter/Esposter/commit/5b22751305c996dbd20d619dc8f7004743e7c55f))
* lint ([e11d2e3](https://github.com/Esposter/Esposter/commit/e11d2e3c8bdca7213c617dc65fa731d913c652e2))
* lint ([5bb03c7](https://github.com/Esposter/Esposter/commit/5bb03c776d19846ea88163c5b194a1adde370d92))
* lint ([ec79a25](https://github.com/Esposter/Esposter/commit/ec79a25eb467340949bcb061e7bb6fc052a6ebdd))
* lint ([a9444a7](https://github.com/Esposter/Esposter/commit/a9444a7d308ca84648e62b9a710749a3fda2a7c3))
* lint ([671af11](https://github.com/Esposter/Esposter/commit/671af1170558b8574c3d0ef3e7fe9a6d8eb4dcb4))
* lint and typecheck ([92a9fe8](https://github.com/Esposter/Esposter/commit/92a9fe8d0898f5d964554167a8a7615426cecaf6))
* lint and typecheck ([bb450a9](https://github.com/Esposter/Esposter/commit/bb450a96f9a02f3c2d8fa9dbdb94967125c7a55b))
* lint and typedoc warnings ([dcd64f4](https://github.com/Esposter/Esposter/commit/dcd64f45e16e41d8002a3cc5c9002c484cd01a43))
* lint wip ([8acd30e](https://github.com/Esposter/Esposter/commit/8acd30e554910d92719864b0f706e78833d27ebc))
* lint wip ([7bd8c17](https://github.com/Esposter/Esposter/commit/7bd8c1773da3866e9aafc53222a71af1dd17e3f1))
* lint wip ([53f7f9e](https://github.com/Esposter/Esposter/commit/53f7f9e59d29a0120f261ac9c115caf88f78d50f))
* maybe try empty string ([4bd4ec9](https://github.com/Esposter/Esposter/commit/4bd4ec9960225ad97fc5490241484f06ebdff037))
* migrate omitDeep to pkg ([b5c18aa](https://github.com/Esposter/Esposter/commit/b5c18aa3b2252aa0a312f0934811e6e343cffa7f))
* only anchor if bottom sentinel visible ([8f70cea](https://github.com/Esposter/Esposter/commit/8f70cea73fe61626a7e523b88c109a7776de6402))
* options + build error ([8530fc2](https://github.com/Esposter/Esposter/commit/8530fc2d313f58aca3726b717fb266d5ac224384))
* refactor syntax ([a611eaf](https://github.com/Esposter/Esposter/commit/a611eafc3dfae1c6b52e22e21b80079d62097d12))
* regex lint ([c8d3ead](https://github.com/Esposter/Esposter/commit/c8d3eadad12fe7b292fd0f10a864c742d0b65edd))
* relations ([22defa7](https://github.com/Esposter/Esposter/commit/22defa7c4cc42b64c4138b660345657e3c64f36b))
* remaining issues ([808764d](https://github.com/Esposter/Esposter/commit/808764d68404871df4632d4b7eadd83af780be0d))
* remaining migrations ([14c864f](https://github.com/Esposter/Esposter/commit/14c864f5b31a0c61544e07bd34ea18bbd9df1af2))
* remove unnecessary bookmarks feature ([cf27594](https://github.com/Esposter/Esposter/commit/cf275943c727cc6f63baa90d7aa8070ebc5f063d))
* remove unnecessary import ([fc6161e](https://github.com/Esposter/Esposter/commit/fc6161ea1ff568dcd53678b9eabf70caa0364797))
* remove unnecessary toAppError now ([7e72a64](https://github.com/Esposter/Esposter/commit/7e72a6441adb3014b74d3b4fafb25bf3887a0ca6))
* schema ([b1547b4](https://github.com/Esposter/Esposter/commit/b1547b41f6a56ab697cc7705d601ab33103335cd))
* slowmode checks etc ([9da9054](https://github.com/Esposter/Esposter/commit/9da905406baf74b2e9670cb78f34e57c1a49b4d6))
* some comments ([f814c24](https://github.com/Esposter/Esposter/commit/f814c24bf886afd666cf63c15ec523546aa18e82))
* subscribables only in client side ([95635d4](https://github.com/Esposter/Esposter/commit/95635d4986f97583d1da3eb315c86c13e5a0f6ac))
* test and migration ([ce03487](https://github.com/Esposter/Esposter/commit/ce03487ae2a7bad1c986876780dcd92e826526d3))
* test asserts ([f1d5130](https://github.com/Esposter/Esposter/commit/f1d51301cd758f5fcee48b4f295bb7242bd82f29))
* tests ([7c9fadf](https://github.com/Esposter/Esposter/commit/7c9fadf91759fb2f749b9b718b75d722d6c501e6))
* tests ([89f5242](https://github.com/Esposter/Esposter/commit/89f5242ab0a900ecb9e0ecc4e049f803c9f19530))
* tests ([e4a85c9](https://github.com/Esposter/Esposter/commit/e4a85c99a2b787afc2416864b192964e5fac5569))
* tests ([5022579](https://github.com/Esposter/Esposter/commit/502257990a7936e1ed01b8b31e43389445e88ed1))
* tests ([673f5fc](https://github.com/Esposter/Esposter/commit/673f5fc85990cde266d53d266eb365dfb0132675))
* tests wip ([2eeb386](https://github.com/Esposter/Esposter/commit/2eeb3866ec3769d639c48eb2a71ab5b9f0e4e9f1))
* transforms + types + align skills md ([7da475a](https://github.com/Esposter/Esposter/commit/7da475a6634d312ae299b13960688b61e6494191))
* types ([04f8f8d](https://github.com/Esposter/Esposter/commit/04f8f8d5681cc18423b2a4c0e9e8be31295105ec))
* types ([7c17571](https://github.com/Esposter/Esposter/commit/7c1757190737bd9984e7d3de9f8f963cb247cceb))
* types ([862d25b](https://github.com/Esposter/Esposter/commit/862d25b5c012513f7632f75540df854441ccf2f4))
* types ([0666268](https://github.com/Esposter/Esposter/commit/06662682cefc15a6b332d3a665d0b405c496fe66))
* types ([8a36847](https://github.com/Esposter/Esposter/commit/8a36847071d88a9c3e0813d3ac7b2529b102f44e))
* types ([823f32a](https://github.com/Esposter/Esposter/commit/823f32ac1d2dadaa419888b3945d96396f9b7e4c))
* types ([80728a1](https://github.com/Esposter/Esposter/commit/80728a16da11440d4ad4583040a98dd45cb2a7a7))
* use message cache ([3f37475](https://github.com/Esposter/Esposter/commit/3f37475090f6e3942e9b2edd3951992eb1b29e73))
* wip ([26a6fe1](https://github.com/Esposter/Esposter/commit/26a6fe1952674dac4cbf798b6129806c16eb198a))
* wip ([c0962e4](https://github.com/Esposter/Esposter/commit/c0962e4852cd751ebf2748aaea97e9122397e3a3))

### Features

* Add tests ([c25c182](https://github.com/Esposter/Esposter/commit/c25c18218bb36e618a59be07bc871c3157eedf99))
* add topic/drafts features ([0818c28](https://github.com/Esposter/Esposter/commit/0818c281d530e4a6fce3eb6e32b2d33d3659b81b))
* error handling wip ([74b7969](https://github.com/Esposter/Esposter/commit/74b796949376815f1f54982b7fc52d69bf31986f))
* migrate to profile card ([1ad5f1c](https://github.com/Esposter/Esposter/commit/1ad5f1cf678b84bad6907df33ccd3b830f2c54f9))
* turn on compat ver 5 ([981b1b8](https://github.com/Esposter/Esposter/commit/981b1b81b78dbb76ae2970096d3ea941f1723ea4))
* upgrade drizzle ([17b9f41](https://github.com/Esposter/Esposter/commit/17b9f41b180ba109382d34e9507ead13cbbb95b2))
* upgrade to phaser 4 rex plugins ([88def4f](https://github.com/Esposter/Esposter/commit/88def4f478fe9c27d6b6548725c0d00de52ac0e0))
* wip ([16aab97](https://github.com/Esposter/Esposter/commit/16aab97be86dead24d438cb654f16e73117e6304))

# [2.22.0](https://github.com/Esposter/Esposter/compare/v2.21.0...v2.22.0) (2026-04-28)

### Bug Fixes

* achievement tests ([3534399](https://github.com/Esposter/Esposter/commit/35343993eb7ad80cdaa12597be6554f94a34cdc7))

* add back junction table relations ([2631f2d](https://github.com/Esposter/Esposter/commit/2631f2dfbe6d35541b0ae8e7d0e6731a2a5b7633))

* add files ([ed8acf8](https://github.com/Esposter/Esposter/commit/ed8acf85bc404e941263b79b5e20b9f0cdcdd61b))

* add files ([5133e5a](https://github.com/Esposter/Esposter/commit/5133e5a036bff9443e19da09002c90e4dd985d03))

* add types ([4e939f6](https://github.com/Esposter/Esposter/commit/4e939f638a1c692f0eca92bf47ca489f6f6bcdfc))

* all tests ([755e2fb](https://github.com/Esposter/Esposter/commit/755e2fba16fb531daf7664642b75813187cdf3fe))

* also migrate db checks ([43dfd26](https://github.com/Esposter/Esposter/commit/43dfd26ef51d53f4e3e9f06c9c9c1c983d616c47))

* batch room ids ([e8fc438](https://github.com/Esposter/Esposter/commit/e8fc438c41f3f4d9caeb2c5da0b4ab401837dc2b))

* bugs ([70417cd](https://github.com/Esposter/Esposter/commit/70417cd42515c5cfee36d179f75d8b46898cbfda))

* cache ([457f2f9](https://github.com/Esposter/Esposter/commit/457f2f937d36ab947f3ac2d57e6ed8f7ea5098e0))

* cleanup ([4a5b114](https://github.com/Esposter/Esposter/commit/4a5b1147d6f8f95e108e139f8f9b56395c02c2f9))

* cleanup pinia ([da2feb5](https://github.com/Esposter/Esposter/commit/da2feb541edbc4f3943df5dc66e1d6aa82df3ef9))

* cleanup syntax ([56494c8](https://github.com/Esposter/Esposter/commit/56494c8f4ab11ab1f1e575212f0d74eaf1eabfc7))

* cleanup unnecessary tests ([7c92fa4](https://github.com/Esposter/Esposter/commit/7c92fa41dae69d4863cf57ab33f4a8b886111ba4))

* close button v-show ([60a5cb4](https://github.com/Esposter/Esposter/commit/60a5cb49c66daaad6cb7a4e79cc2216ccfe30110))

* code review comments ([346b7f9](https://github.com/Esposter/Esposter/commit/346b7f947c18f6a1dc753b530f22be69e74db5b7))

* code review comments ([bc643c3](https://github.com/Esposter/Esposter/commit/bc643c377fee97f8a68ee71c66d7bbd3c9dbdf8d))

* code review comments ([b847e54](https://github.com/Esposter/Esposter/commit/b847e54e53fe2156e4a64ef7ae1c0b24207711af))

* code review comments ([c655535](https://github.com/Esposter/Esposter/commit/c65553551e8cb9561f2b46fa21af2a50827a82cf))

* code review comments ([144d33c](https://github.com/Esposter/Esposter/commit/144d33c40c6a9f643ede58a9922c5defb8742342))

* code review comments ([75daab3](https://github.com/Esposter/Esposter/commit/75daab36a8c403e3bbc8dbddc477f78f09253e3d))

* code review comments ([1130252](https://github.com/Esposter/Esposter/commit/11302526cdc66fe3bc3f2dfd717624b12752ccbc))

* code review nitpicks ([9dbfc78](https://github.com/Esposter/Esposter/commit/9dbfc78b5b987a9cbd559c7bf0d7a4d2ae6cbb72))

* default env to node ([f347f92](https://github.com/Esposter/Esposter/commit/f347f927539441860ed7a6b19f2789f8a91a4686))

* deps and types ([ca1f5dd](https://github.com/Esposter/Esposter/commit/ca1f5dd6f5a39d1b43ffc8b98ea4833cedebfacf))

* don't need check ([4d92d34](https://github.com/Esposter/Esposter/commit/4d92d34d36845f4e05405aaa25300d1bc3b827ea))

* filter query ([07f1564](https://github.com/Esposter/Esposter/commit/07f1564a6b8825cd38e7ae8540d14872f1afc2c6))

* fine, we'll cast ([c137e07](https://github.com/Esposter/Esposter/commit/c137e0714d4dab8d8f9471ddaad690f706472510))

* format ([79cdb0f](https://github.com/Esposter/Esposter/commit/79cdb0f5c3a477d144c53a4034c95e59216f2ebf))

* format ([0be4f09](https://github.com/Esposter/Esposter/commit/0be4f091d46a54cc9dcb04fe8a4e6c209b0c40a9))

* imports ([a6f6431](https://github.com/Esposter/Esposter/commit/a6f643103e2f7312cd6c68f22752b4ad316fb1e6))

* imports ([636af14](https://github.com/Esposter/Esposter/commit/636af1499cbe949b5d9bd4a635caf11b1573283b))

* imports ([8d692b6](https://github.com/Esposter/Esposter/commit/8d692b64669364730c77c8a07593ffc2f2d8a434))

* imports ([22e7c1a](https://github.com/Esposter/Esposter/commit/22e7c1a8335f82c9a4cc68922233f63cca365bb1))

* imports ([2cc140e](https://github.com/Esposter/Esposter/commit/2cc140ee6f5507054b2fa7b8c319656b9dc2ee77))

* imports ([4eb34f0](https://github.com/Esposter/Esposter/commit/4eb34f0d8c4c269a862032a2c0c3ed90d032e324))

* imports ([500f0aa](https://github.com/Esposter/Esposter/commit/500f0aab0443f9b391dff230cab1e4265484c1bb))

* in ([b17b956](https://github.com/Esposter/Esposter/commit/b17b9567b2765387ebbbbd6aa9a3530a5a189465))

* index names ([bd355d6](https://github.com/Esposter/Esposter/commit/bd355d62e8afafdbdd667745e8592f45ff2f9461))

* indexes ([704bab4](https://github.com/Esposter/Esposter/commit/704bab44077401766bbcda54aaec9c9b1dedd205))

* invisible class ([7fc7bcc](https://github.com/Esposter/Esposter/commit/7fc7bcc64bbf7d9d9eae0509e0d095c256fcd3f6))

* lint ([b3ba9c9](https://github.com/Esposter/Esposter/commit/b3ba9c9310df46bcc6d52b18ca2221d40186858a))

* lint ([863174d](https://github.com/Esposter/Esposter/commit/863174de4c2c552012dc3eb5f2c8a49a6d492833))

* lint ([7179c23](https://github.com/Esposter/Esposter/commit/7179c23b725e8ccf6cd9764d40ed74b21b5ee754))

* lint ([f2278b6](https://github.com/Esposter/Esposter/commit/f2278b6e6f74e73ec29f4372a90ec2e17ebbd678))

* lint ([45bbbe3](https://github.com/Esposter/Esposter/commit/45bbbe3db7009317e69c20911f630387634a5e2c))

* lint ([8bdeca0](https://github.com/Esposter/Esposter/commit/8bdeca036e2f65ec9ee1b46546becf3623b9786f))

* lint ([f7e7c43](https://github.com/Esposter/Esposter/commit/f7e7c430a81064d50e5049111e542507248b5d4e))

* lint ([1fe6dc9](https://github.com/Esposter/Esposter/commit/1fe6dc9b63ae70fc31f5f1fae3541dda0f59a087))

* lint ([e7929e0](https://github.com/Esposter/Esposter/commit/e7929e0a75faa1cff15f450750ead8b0f46cd3d9))

* lint ([c0b4091](https://github.com/Esposter/Esposter/commit/c0b4091651b612e38f677da1581336edd22260f0))

* lint ([3ddaac0](https://github.com/Esposter/Esposter/commit/3ddaac01ac1abd11f70e0ea3429d6d8c66ae8051))

* lint ([13cc7f3](https://github.com/Esposter/Esposter/commit/13cc7f3f2262947fa8ef1c5832490d79819f10db))

* lint ([c848c31](https://github.com/Esposter/Esposter/commit/c848c31b5403aaf95dd047c55affb74e4d59a8a3))

* lint ([52b6638](https://github.com/Esposter/Esposter/commit/52b66385ae15cf3000a69785a0ea66389a2e12dc))

* lint ([0db5751](https://github.com/Esposter/Esposter/commit/0db57517ee33ca142b0e981bc9f43df33d9a23ae))

* lint ([b59b466](https://github.com/Esposter/Esposter/commit/b59b466183decfe0579af3082e664905a2fd05f7))

* lint ([09df7c8](https://github.com/Esposter/Esposter/commit/09df7c8525373de546369ecaca9f6952e3338021))

* lint ([e9a0a4e](https://github.com/Esposter/Esposter/commit/e9a0a4ed703256f0b9a3f3b2ab39ebac859436ea))

* lint and foreign keys ([edc697b](https://github.com/Esposter/Esposter/commit/edc697bbf7d9f89fd1d67f4232e63004da84956e))

* lint and review comments ([df9ad6d](https://github.com/Esposter/Esposter/commit/df9ad6d05530f162021e2e754f94e10f37d57db8))

* member panel and setting status ([4351904](https://github.com/Esposter/Esposter/commit/4351904ff87341c83ea9dd44187f3341c9b204b0))

* migrate files ([0b398c0](https://github.com/Esposter/Esposter/commit/0b398c0aaa333e5703d8a948db2862b717a1938f))

* migration wip ([73268a8](https://github.com/Esposter/Esposter/commit/73268a856748e134bf1866af4bcfd3faf264862e))

* moderation ([07c4533](https://github.com/Esposter/Esposter/commit/07c4533a7520457404fe9c8efbe7d9e6b30a605c))

* more type issues ([6a468b6](https://github.com/Esposter/Esposter/commit/6a468b6c2b2b0f3579737dcb1c466f394210cf2e))

* move create mock db ([b024631](https://github.com/Esposter/Esposter/commit/b0246312f69f77e2db4ace0803688b64b3b16304))

* move to db-mock package ([2df4164](https://github.com/Esposter/Esposter/commit/2df416413bb4385f050c81213193bff200f24a66))

* name for direct message is null ([61a7af5](https://github.com/Esposter/Esposter/commit/61a7af5c7a34e90549e98b2b9f0e3c749079da76))

* pg table types ([49e7ca0](https://github.com/Esposter/Esposter/commit/49e7ca035936d289bdad23049b78469ae52c26ac))

* push subscription rename ([4d42ccc](https://github.com/Esposter/Esposter/commit/4d42ccc61aa0271a88ce7df047a5f3ca90c24262))

* refactor things ([3be1176](https://github.com/Esposter/Esposter/commit/3be11767c8d48da3ff66265a4ec3c066380ef51c))

* refactor things ([722bb22](https://github.com/Esposter/Esposter/commit/722bb22c50e0ef59af667361233329f458c0ee87))

* refactor things ([1278f18](https://github.com/Esposter/Esposter/commit/1278f18f5c1f1f494cafb9ae37a24275ed476329))

* refactor to relational api ([dd22cd9](https://github.com/Esposter/Esposter/commit/dd22cd9b86434029b93f95575726ea1c07f3c1bb))

* refactor to use property names ([a41c6d6](https://github.com/Esposter/Esposter/commit/a41c6d6c7edba9180c1611ba231744a2c74581a0))

* refactors ([582bbfb](https://github.com/Esposter/Esposter/commit/582bbfbfa973c7f7fc944881259df93ab05cf9d0))

* remaining issues ([1580e7c](https://github.com/Esposter/Esposter/commit/1580e7c540caed62b3e633ce3d8f2c0e69c9312f))

* remaining types ([56b8b10](https://github.com/Esposter/Esposter/commit/56b8b102d57f3e9a343fe04f80efe9e95a59a187))

* remove unnecessary owner ([91add57](https://github.com/Esposter/Esposter/commit/91add57cb24e844eb2938a135da529ae57236d18))

* remove unnecessary test ([3a2d666](https://github.com/Esposter/Esposter/commit/3a2d666a964428b3c6b758d732def96f5b5d1f25))

* renames ([03a7ec7](https://github.com/Esposter/Esposter/commit/03a7ec76f8e24247bbf658885df8377f1778423f))

* role subscribables ([adfdc85](https://github.com/Esposter/Esposter/commit/adfdc8567b996d40be48734fca5075c91de777fd))

* room permissions ([1ceae16](https://github.com/Esposter/Esposter/commit/1ceae1644034f52ca9cd0e4ba5e9ffc2da801c3a))

* rooms import ([6f0bf32](https://github.com/Esposter/Esposter/commit/6f0bf324da32bb5b8be4f45d91975250bf1ead8d))

* save context for online subscribable ([00d07f7](https://github.com/Esposter/Esposter/commit/00d07f768e258c7f7562765dd81246c36e17555d))

* select schema ([a1bf006](https://github.com/Esposter/Esposter/commit/a1bf006468f2e0d4e82ee89d0ff99533ba64508c))

* some lint issues ([6ac5961](https://github.com/Esposter/Esposter/commit/6ac596184c37d1b4ac79298de564541066f01895))

* styles and things ([8e94ffd](https://github.com/Esposter/Esposter/commit/8e94ffdfbd66dd48832c30d30dfc130973d9c311))

* test subquery ([2d75d76](https://github.com/Esposter/Esposter/commit/2d75d76a4d1df6b0a88dfb74405e8ab314cd7a45))

* tests ([3561021](https://github.com/Esposter/Esposter/commit/35610212ed8540bf3db13addd98d2c0db88c02ed))

* tests ([4edbe2a](https://github.com/Esposter/Esposter/commit/4edbe2a2ac2fe941cb29955a338247289f5d93c5))

* tests ([e613f0e](https://github.com/Esposter/Esposter/commit/e613f0e1b81f2cc4ee4c3823670bf3b04129200a))

* tests ([4862533](https://github.com/Esposter/Esposter/commit/48625333c4f47f90f75d7838151cc32093903ec7))

* tests ([dceb07e](https://github.com/Esposter/Esposter/commit/dceb07e39f365649e857f3fd0a145bdfc6af5503))

* tests ([f0d497e](https://github.com/Esposter/Esposter/commit/f0d497ea2ada0cb9030dd1f59937a715a59399b7))

* tests ([b27e4c6](https://github.com/Esposter/Esposter/commit/b27e4c6fcd75d55a0e93047fe8cc84bc8242a506))

* tests and achievements ([fe67521](https://github.com/Esposter/Esposter/commit/fe67521f450046c03524dce6498ac45cfb4d48ce))

* tests and lint ([ce12352](https://github.com/Esposter/Esposter/commit/ce12352b7a6909e5b85598f08c9a9119024e1ad4))

* tests and refactor code ([6a450be](https://github.com/Esposter/Esposter/commit/6a450be88b20af468d85a9a0e07611b5db10518f))

* tests and review comments ([0514154](https://github.com/Esposter/Esposter/commit/0514154260419a7562d17db920bea94137903645))

* tests wip ([02a5d6a](https://github.com/Esposter/Esposter/commit/02a5d6a5305bd208f746bb5bddd20025044b6dbe))

* tests wip ([f35d53e](https://github.com/Esposter/Esposter/commit/f35d53e749862276e53efb771ee5ba9fb1685628))

* tests wip ([92792ba](https://github.com/Esposter/Esposter/commit/92792baac2d258661ec8606cb2c4173706d7c4a1))

* tests wip ([8433964](https://github.com/Esposter/Esposter/commit/84339645b9ff3e73967cea760b2629f7ff5f21b4))

* truncate ([ccb1365](https://github.com/Esposter/Esposter/commit/ccb1365eb32286df855aff13f7fde559c919799e))

* tweaks ([0e145e4](https://github.com/Esposter/Esposter/commit/0e145e4570db705e8a94325d376ebba8314f6abf))

* types ([8d48f18](https://github.com/Esposter/Esposter/commit/8d48f1819894240c85a5e5b43191a95141a92f34))

* types ([2740f0a](https://github.com/Esposter/Esposter/commit/2740f0a82dae4508af54d06b732bb421f031807f))

* types ([e0e426b](https://github.com/Esposter/Esposter/commit/e0e426b280b7f625c618e952fb6f9e2d54510068))

* types ([77601a6](https://github.com/Esposter/Esposter/commit/77601a6297dd12c5e87ddd114450e71c9db9135c))

* types ([f82e38c](https://github.com/Esposter/Esposter/commit/f82e38c090e082193ec1da306e4a9025dc7c3f44))

* types ([7d6f574](https://github.com/Esposter/Esposter/commit/7d6f5749bf3c6964730c39876245aeb085fca7dd))

* types ([caf4700](https://github.com/Esposter/Esposter/commit/caf47007ad6bfaada08adca4c7283361e3995d61))

* types ([489f8f9](https://github.com/Esposter/Esposter/commit/489f8f901481d4dfd374f31f3161ba6df9ae0779))

* types ([ddcf02b](https://github.com/Esposter/Esposter/commit/ddcf02b0a5eb9818f9fd62f310028294989a69aa))

* types ([3f8ead7](https://github.com/Esposter/Esposter/commit/3f8ead719ded6a33dd21c69a61de13e0078f5d5e))

* types ([390675c](https://github.com/Esposter/Esposter/commit/390675cf090bcf179dd9b7edba7bc68fc7a9b918))

* types and lint ([ad56572](https://github.com/Esposter/Esposter/commit/ad56572087670f66d878cfa8f1778a78582c950b))

* types and tests ([67d17e9](https://github.com/Esposter/Esposter/commit/67d17e9c43f101042c78152e33c347e8170b44af))

* undefined ([45f5de5](https://github.com/Esposter/Esposter/commit/45f5de5653f6b7928060cb0e8e996d1233decd00))

* updated schema name ([bb7af01](https://github.com/Esposter/Esposter/commit/bb7af01118a534de691cb9e3664d450e30b6426e))

* use upsert ([8794f62](https://github.com/Esposter/Esposter/commit/8794f620187c671f881773e2b2d5546051cb256c))

* useFetch in sessions for composables used in vue components ([3234250](https://github.com/Esposter/Esposter/commit/3234250613456e39353507dab34a578d6aecc7d2))

* visible button ([d923fe2](https://github.com/Esposter/Esposter/commit/d923fe2d63613ddf628115a360a3a35523963bc3))

* webhooks relation types as well as drizzle types ([6aaa379](https://github.com/Esposter/Esposter/commit/6aaa37935553103c7cb79829cf7e7fc1475356fc))

* wip ([7bcd4ec](https://github.com/Esposter/Esposter/commit/7bcd4ecf53bdd44ad7dee8a2fb5a9ec429718a40))

* wip ([c430c0f](https://github.com/Esposter/Esposter/commit/c430c0f92dff1475a18a823f61d8fff5cedb7fdf))

* wrap webhook creation in transaction ([e18362f](https://github.com/Esposter/Esposter/commit/e18362fe3fce9b8f8cda369c63cf5f3680daf5a2))

* zod schemas ([d9eb27d](https://github.com/Esposter/Esposter/commit/d9eb27d957eb704d5b221c7278ace1c6717dbdab))

### Features

* add back users to rooms relations ([811708c](https://github.com/Esposter/Esposter/commit/811708c54c85cd13c37d0c6c1af6da1c53d7731f))

* Add bio ([9ba1709](https://github.com/Esposter/Esposter/commit/9ba17094fdc4456bbc50705e067274960c083795))

* Add roles ([6374285](https://github.com/Esposter/Esposter/commit/6374285474f5aba65309e59e5270ec1ad1816b06))

* Add search history relations ([07d5f2e](https://github.com/Esposter/Esposter/commit/07d5f2e767d13b987a66f9aeafdf1cc4fc0da9e1))

* Add tests and components ([b637bb0](https://github.com/Esposter/Esposter/commit/b637bb0781c98a2b8d61182f059ec3b02a7d6eb5))

* Add UI ([b09c23d](https://github.com/Esposter/Esposter/commit/b09c23da94ebd67c6382997e58d8d70d9e2aecdb))

* Add user achievement relations ([8ff1f6e](https://github.com/Esposter/Esposter/commit/8ff1f6e50e9c208a71fce04dec37c8cf2f6a8183))

* completely fix up db ([48512b8](https://github.com/Esposter/Esposter/commit/48512b885b1fae604f3d8bff87bc73b3c2cddf8c))

* migrate invites ([a126d6b](https://github.com/Esposter/Esposter/commit/a126d6b5636d4ce0eea67593daf342ea9fb59b82))

* migrate push subscriptions ([bcc7f9a](https://github.com/Esposter/Esposter/commit/bcc7f9abfe53ec854f317534a08fb1e8c1f25608))

* migrate search histories ([3cfbdab](https://github.com/Esposter/Esposter/commit/3cfbdabf4fa01c4dfe6b03520f75c14be5aa9683))

* migrate syntax for like,post and achievements ([57eaa25](https://github.com/Esposter/Esposter/commit/57eaa25e4870069e16b55d9233fb74d86ecd3bd0))

* migrate user statuses in message ([ffe3408](https://github.com/Esposter/Esposter/commit/ffe34083300de924820139a4898943c277477f96))

* migrate user to rooms in message ([49ee9f2](https://github.com/Esposter/Esposter/commit/49ee9f2fe536592f2c26a02829773e3aeff40e9b))

* moderation wip ([c9b5310](https://github.com/Esposter/Esposter/commit/c9b5310d50b22ce68fb27d2975fc36ed20494602))

* reimplement caching ([34c635c](https://github.com/Esposter/Esposter/commit/34c635c567e8745a6f343b38e20b7b973076eca7))

* tick off things ([e08130d](https://github.com/Esposter/Esposter/commit/e08130d5570b01fd4485429b4934e85524ef5bbc))

* Upgrade to drizzle v1 and run db up ([ee5db87](https://github.com/Esposter/Esposter/commit/ee5db87207aacf882197ad93b8380984896e849e))

* wip ([159c457](https://github.com/Esposter/Esposter/commit/159c457351a7c4f9ade60856dae0e186804264d5))

### Performance Improvements

* optimize db calls ([fa68ad1](https://github.com/Esposter/Esposter/commit/fa68ad147b9a3d8a84d7639d1ff28aa4547f2a56))

* optimize db calls ([a613334](https://github.com/Esposter/Esposter/commit/a613334cd3e0e69dc66665282498415865cd082e))

# [2.21.0](https://github.com/Esposter/Esposter/compare/v2.20.0...v2.21.0) (2026-04-15)

### Bug Fixes

* add computed column as part of serialization ([16e3e85](https://github.com/Esposter/Esposter/commit/16e3e85b7c2c207e7355b807662164454d1d04cd))

* add defaults for string split ([1c58090](https://github.com/Esposter/Esposter/commit/1c580906882b7de196c8f958bd73c24f60f04b7e))

* add file ([a3132d0](https://github.com/Esposter/Esposter/commit/a3132d06fd22ae5b37902460df967365fe06a535))

* add indexes and constraints ([7e1ed02](https://github.com/Esposter/Esposter/commit/7e1ed028ab60a246fd1bb8bfba86e4bc6cfbb04d))

* add overflow anchor none ([8333bf3](https://github.com/Esposter/Esposter/commit/8333bf3a6eac28cf33610034ac27531098637039))

* add resiliency to functions ([2ccf9a0](https://github.com/Esposter/Esposter/commit/2ccf9a009c46dd5f7e22c4e40b284f173d60d2d0))

* add trpc tests ([b565b8b](https://github.com/Esposter/Esposter/commit/b565b8b9ea3a71b2e7040ecd2583fe88cdfccdbd))

* assert is room and index tests ([671d559](https://github.com/Esposter/Esposter/commit/671d559610f69fc9f511dfff0491a605af5026a3))

* batch insert ([9a7a80d](https://github.com/Esposter/Esposter/commit/9a7a80d47611aefd7c8783e336c02ffd937781a8))

* broaden types so vue can infer it ([421fd4c](https://github.com/Esposter/Esposter/commit/421fd4c21aa9063748b64c82175e8e8e5abe1a07))

* builds ([b36de2f](https://github.com/Esposter/Esposter/commit/b36de2f5b8852c1e61a56bd16c4b5c0dfde1dd02))

* checks ([6dcb1a5](https://github.com/Esposter/Esposter/commit/6dcb1a59bb703e9d4af3e76801b26f71d329b448))

* cleanup query ([8fd2668](https://github.com/Esposter/Esposter/commit/8fd2668ddbfc08bd78f42391bc7c05f6fdae3316))

* cleanup schemas to be non-negative ([db5d026](https://github.com/Esposter/Esposter/commit/db5d026529d7860a74164ed66e478c70c918e896))

* cleanup some comments ([dbc62b1](https://github.com/Esposter/Esposter/commit/dbc62b1f3c1421a7b5224479ec002f4d45af9404))

* cleanup unnecessary type params ([5b07478](https://github.com/Esposter/Esposter/commit/5b074781164197e4df85d90c9919d171294a2958))

* cleanup unnecessary watches ([cc76806](https://github.com/Esposter/Esposter/commit/cc76806d78265f0f04d11ddaccf2ea2be810dbaa))

* code review comments ([6d331e6](https://github.com/Esposter/Esposter/commit/6d331e6c6a56551b8de0488fd3367f2466cfcdd3))

* code review comments ([15f7704](https://github.com/Esposter/Esposter/commit/15f77045099b54447005a5f0418f97e16bfbbd5a))

* code review comments ([e242d03](https://github.com/Esposter/Esposter/commit/e242d03d7def0ebbaabbd61008260425d82bb9b7))

* code review comments ([206bdb0](https://github.com/Esposter/Esposter/commit/206bdb041b3c8f52baff40a6d37035533a9bc9f5))

* code review comments ([460c76e](https://github.com/Esposter/Esposter/commit/460c76e8af050d783680274ce379a3f57daf9b32))

* code review comments ([676f70a](https://github.com/Esposter/Esposter/commit/676f70ac168de27637a9ae8058bf129a4968d6f4))

* code review comments ([b8fcfe0](https://github.com/Esposter/Esposter/commit/b8fcfe0c4086f2453184928ff868f47beab2577e))

* code review comments ([8bae6bb](https://github.com/Esposter/Esposter/commit/8bae6bb6b6a3d716f32e36702c89f1b433b4ab8f))

* column statistics ([33329cb](https://github.com/Esposter/Esposter/commit/33329cb32ad542a6cff9bcab42a5eef0d91f524a))

* comments ([eb07f94](https://github.com/Esposter/Esposter/commit/eb07f9480aa14d7a2947e23a65c4590fd2290cc0))

* comments ([7afd25b](https://github.com/Esposter/Esposter/commit/7afd25bd99995d139c15c25a96f91155a369971f))

* creating new messages to always be in correct order when fetching new messages and fix up slash commands to be per-room ([c08732f](https://github.com/Esposter/Esposter/commit/c08732f2c2c1cfeeb703db8817dfdc3f4fb51a20))

* custom errors ([d5e26f7](https://github.com/Esposter/Esposter/commit/d5e26f76c1eeceb8b3c2797ae1dc3a07f61d9bf0))

* delete polls ([63555b4](https://github.com/Esposter/Esposter/commit/63555b4585cacded1ab30f67c2c7268a1f789916))

* dragging columns and remove unnecessary description ([0879b14](https://github.com/Esposter/Esposter/commit/0879b14aad7cf14039c8978dac1e435faff5ffa9))

* error messages ([7e92c76](https://github.com/Esposter/Esposter/commit/7e92c76535a969cc3b478c4ffae06653c57356ca))

* finally fix up slash commands ([66529ac](https://github.com/Esposter/Esposter/commit/66529ac921acfaeaec0869fe740ef04fd8655102))

* finally fix up slash commands ([9d02cde](https://github.com/Esposter/Esposter/commit/9d02cdedf22f0fcf38184688e77bb629aae21fed))

* finally, the perfect fix to custom errors ([901daed](https://github.com/Esposter/Esposter/commit/901daed43b1d7ac9500768e73cde664aee9e2f74))

* footer slot ([502a16e](https://github.com/Esposter/Esposter/commit/502a16e7c08990f80d369b921075d1cb111a3f05))

* form dialog ([cf0a544](https://github.com/Esposter/Esposter/commit/cf0a544b4e2cf39ae9d944071c2c7d22f1df9e1f))

* format ([f1a5502](https://github.com/Esposter/Esposter/commit/f1a55027dca34be99afe47c9e9889b8d21a106a5))

* friend input ([757addd](https://github.com/Esposter/Esposter/commit/757addda140184c54f9046baeece3e447c86cadf))

* friend req table ([2dc91c8](https://github.com/Esposter/Esposter/commit/2dc91c8778f85f23cc90cdaea0e75bbf7964a80a))

* header ([3973869](https://github.com/Esposter/Esposter/commit/3973869ccf265d38d699deea2f2ecc141da9a27f))

* imports ([c57b990](https://github.com/Esposter/Esposter/commit/c57b9902fd47c2cb7c5da8af62c61b53307c1c26))

* imports ([114cf17](https://github.com/Esposter/Esposter/commit/114cf171e858f5c8e862d4e070024cebbf375607))

* imports ([0477cb9](https://github.com/Esposter/Esposter/commit/0477cb9d0c24268c5b3b73bacbdb49784984ecb1))

* integration testing issues ([b4cff5f](https://github.com/Esposter/Esposter/commit/b4cff5fec8d27773da97348930c89656131a0a4e))

* interfaces ([8177473](https://github.com/Esposter/Esposter/commit/817747328cd2343ae5bec6e5e65c5fdedc236f09))

* joining channel flow + add architectural diagram ([6cd71cf](https://github.com/Esposter/Esposter/commit/6cd71cf126fddf3501f1d1d81171a44855b39fcd))

* lint ([84e1c9e](https://github.com/Esposter/Esposter/commit/84e1c9ea95542460675a6695d51515a993180297))

* lint ([938fcce](https://github.com/Esposter/Esposter/commit/938fcce34296e4845e1148c09d2c31e617ec26b5))

* lint ([af6c0d7](https://github.com/Esposter/Esposter/commit/af6c0d7f574fbc493182737a9c7188e27cfc22b3))

* lint ([977045b](https://github.com/Esposter/Esposter/commit/977045b1ff1318d135d8dd283efe97df7ed34ecc))

* lint ([099d260](https://github.com/Esposter/Esposter/commit/099d260039d5eff038883ae957b22b39d02a5f19))

* lint ([3e61518](https://github.com/Esposter/Esposter/commit/3e6151837f6d5a4e583a0d56295b17a52b6ec8d8))

* lint ([6c54998](https://github.com/Esposter/Esposter/commit/6c5499884e3a819de44e7aecaec8482d1de51a0d))

* lint ([b20dafc](https://github.com/Esposter/Esposter/commit/b20dafcda48c56fe6d23a864be629a2babf3530a))

* lint ([cff78b3](https://github.com/Esposter/Esposter/commit/cff78b312dff611d2375580eb4afc636c78a383b))

* lint ([dbc3e29](https://github.com/Esposter/Esposter/commit/dbc3e29eb5a47200a5a089dac661eaa60b4a03d2))

* lint ([f3efa40](https://github.com/Esposter/Esposter/commit/f3efa40cc66fb6f866762f7affeb5aa778b3d2d0))

* lint ([0e0d76a](https://github.com/Esposter/Esposter/commit/0e0d76a314c0909f75da8de6f84c82d56d75d14b))

* lint and code review comments ([f476766](https://github.com/Esposter/Esposter/commit/f476766af58ddcaa125faddf83dcd569cc164329))

* lint and docs ([fa716b0](https://github.com/Esposter/Esposter/commit/fa716b06816192b9685fe313f65986bbdd3e7dab))

* lint and height of div when empty ([76ec593](https://github.com/Esposter/Esposter/commit/76ec5939e4a608885b1eb69bad998f77ec762d6d))

* lint and tests ([4ab4c88](https://github.com/Esposter/Esposter/commit/4ab4c882130a3c413bb5e0c7bee6211fd5a3483a))

* local voice ([48cddea](https://github.com/Esposter/Esposter/commit/48cddea07a7235a7738d5130418224a9f44ae065))

* masks ([dc92b0b](https://github.com/Esposter/Esposter/commit/dc92b0bf517c58c172e48957b9510f4b1c1cad75))

* merge conflicts ([010e3bb](https://github.com/Esposter/Esposter/commit/010e3bb3ce0943af200de411253c2ec95d3907f1))

* migration ([8248975](https://github.com/Esposter/Esposter/commit/8248975e0c3e7e51f2e8604f7dac0606116d233c))

* more fixes ([ab522db](https://github.com/Esposter/Esposter/commit/ab522db2467925a5d296565f948e781815cf0a5c))

* nitpicks ([c12b958](https://github.com/Esposter/Esposter/commit/c12b95850a240a6a0e92926e2c13febc46f63721))

* only update description ([b86c3ae](https://github.com/Esposter/Esposter/commit/b86c3aef87f46486df2e3b8b441b9880ec22e6f7))

* optimistically create messages ([ee8d4c2](https://github.com/Esposter/Esposter/commit/ee8d4c2f6bb236129c4ab89f60d5a710cb1daa60))

* parse markdown ([61bbaf0](https://github.com/Esposter/Esposter/commit/61bbaf0e636933a357cff8e1f66202836efdde71))

* pending slash command ([97d60fc](https://github.com/Esposter/Esposter/commit/97d60fc309834f003f104cc0745d6d25ffcaa6b6))

* rate limit + table editor hook map ([1cadcbc](https://github.com/Esposter/Esposter/commit/1cadcbc56a02560d5178257b450f068de8ed8bf1))

* refactor executing slash commands ([f441746](https://github.com/Esposter/Esposter/commit/f441746ef50fd421c0c77220eb2c89add3b27a33))

* refactor some things ([c63ed78](https://github.com/Esposter/Esposter/commit/c63ed78730ee1b95cb8d5361eeae05c9b0fe92ce))

* refactors ([1ee7b6b](https://github.com/Esposter/Esposter/commit/1ee7b6b7d419c14bb806d2226f6134fd99eb72a4))

* relations ([f6bc608](https://github.com/Esposter/Esposter/commit/f6bc60848404aa400f12b4916f026a78151805ef))

* remaining comments ([2c02605](https://github.com/Esposter/Esposter/commit/2c02605541dfa14fe1557ad5d74008359eb2c1d6))

* remaining issues ([2361d4d](https://github.com/Esposter/Esposter/commit/2361d4d7fcc207ad59e12f864b16aff41812bdad))

* remove order ([3e3e382](https://github.com/Esposter/Esposter/commit/3e3e382dbbb7f9c2c49d59839950787f17bf9f84))

* remove order prop ([fa91a94](https://github.com/Esposter/Esposter/commit/fa91a94fd047aec87027b2f7ed1f03f0bee5765f))

* remove unnecessary format ([32c45e7](https://github.com/Esposter/Esposter/commit/32c45e77b34dac6147a488959119511cca52467f))

* remove unnecessary is hidden ([af89e2e](https://github.com/Esposter/Esposter/commit/af89e2e94793c179066e695552029157e6e47929))

* remove unnecessary server check ([453ff47](https://github.com/Esposter/Esposter/commit/453ff4752b2a83242da3eb11bc37dd0b7b3a30dd))

* remove unnecessary test ([91c4c9c](https://github.com/Esposter/Esposter/commit/91c4c9c63b9f8199cc47b9a27d9753445cd1db15))

* rename ([43d3ee2](https://github.com/Esposter/Esposter/commit/43d3ee2bc5fd73479a6467115fccea797cd91e44))

* renames ([d5b8378](https://github.com/Esposter/Esposter/commit/d5b83789d0934ab801d64e03136419a1c4428305))

* renames ([dbed4ee](https://github.com/Esposter/Esposter/commit/dbed4ee73f7fdb3d03a2132026ac7d27c94722ad))

* render poll correctly ([878250a](https://github.com/Esposter/Esposter/commit/878250a8b94395b5f321afc3f7ebd20c79c74129))

* review and tests ([efc5227](https://github.com/Esposter/Esposter/commit/efc52273f42581b0c6985d0a76add53701b265e9))

* review comments ([7d73920](https://github.com/Esposter/Esposter/commit/7d739208fff3c295296afda42e3dedce484b25cd))

* review comments ([7595427](https://github.com/Esposter/Esposter/commit/75954276709bec54a574c371af07d15e74c63638))

* review comments ([db1986b](https://github.com/Esposter/Esposter/commit/db1986b8d1dc873123afcb288e4f98ad508a4d35))

* review comments ([2396844](https://github.com/Esposter/Esposter/commit/23968440ae923c0fd1d1fce3d178eb69c31485c4))

* review comments ([d226c52](https://github.com/Esposter/Esposter/commit/d226c525365eed742a82d3012b489d677efd0805))

* review comments ([3e8ed87](https://github.com/Esposter/Esposter/commit/3e8ed87d9fd1a67b3b7be5bb8496d4ce49e72ed2))

* schema ([9d2159c](https://github.com/Esposter/Esposter/commit/9d2159cc410f2077f36153914e7707cd44f8c463))

* scroll issue ([3c4eb56](https://github.com/Esposter/Esposter/commit/3c4eb564926ed774c69c06b0acc61b8daa480c53))

* show focused error ([c7031f0](https://github.com/Esposter/Esposter/commit/c7031f053afc421990dc8a214f89e0e89e1c14f7))

* slash command params ([30d7632](https://github.com/Esposter/Esposter/commit/30d7632fcc42079102363d2b19e17b688a3936b5))

* snapshot ([0b38fca](https://github.com/Esposter/Esposter/commit/0b38fca700ad06d4d9eacf40e3a5a89fd6d64c1b))

* snapshot ([903774c](https://github.com/Esposter/Esposter/commit/903774ccf7ad11d9019072bd4bc1a88cb937a162))

* some comments ([b6412a2](https://github.com/Esposter/Esposter/commit/b6412a2eb632056cc9f4550a62b6bf3ec2d7240f))

* styles ([f2247ff](https://github.com/Esposter/Esposter/commit/f2247ff62bb973ca5946d44c8ed620e1fecef40f))

* switch ([d41a78a](https://github.com/Esposter/Esposter/commit/d41a78ad646498805e054f0571643d492733c37c))

* syntax ([b1c52fe](https://github.com/Esposter/Esposter/commit/b1c52fe57f94a330d67eeed9669ffb2d56d584b4))

* tests ([338f59c](https://github.com/Esposter/Esposter/commit/338f59caae6f03bd03caf817357da85cbc3949b0))

* tests ([e817ee7](https://github.com/Esposter/Esposter/commit/e817ee739277b65e8e72e78cba9ed1d5b38056fa))

* tests ([29d14c3](https://github.com/Esposter/Esposter/commit/29d14c3095476bffce768f740334951848e0acb3))

* tests ([8a4bbee](https://github.com/Esposter/Esposter/commit/8a4bbee90135aaf7b8eaea1765c029a93b2a72f2))

* tests ([92fd303](https://github.com/Esposter/Esposter/commit/92fd3032fd8b1657691148e41ff1a9361b6acff1))

* tests ([c23cc6f](https://github.com/Esposter/Esposter/commit/c23cc6f12138724174726270692f6425113a9df2))

* tests ([065186b](https://github.com/Esposter/Esposter/commit/065186bb7119e651bc5235091687906df7619353))

* tests ([7a3d57b](https://github.com/Esposter/Esposter/commit/7a3d57bf5a517260a4e03b2b43da5c34b0032b3c))

* tests ([95cd9f1](https://github.com/Esposter/Esposter/commit/95cd9f1c2b1b30855daef47607d6d9c4d8a9e14a))

* tests ([8c98b5a](https://github.com/Esposter/Esposter/commit/8c98b5a199e44ed9a040d917801ca6c7ca9417a4))

* tests ([9fe132b](https://github.com/Esposter/Esposter/commit/9fe132b04904b21fb65832d8fe9cf8925521464b))

* tests ([1f3a4b5](https://github.com/Esposter/Esposter/commit/1f3a4b50c637b2779ee5784d662d48d63aa039c5))

* tests ([6312311](https://github.com/Esposter/Esposter/commit/631231125e0a6ef61a68ef4313aa2ab738cd1079))

* tests ([300d408](https://github.com/Esposter/Esposter/commit/300d408e86ad4db5ce7fe32870827a533074f35f))

* tests ([71a9156](https://github.com/Esposter/Esposter/commit/71a91562f7824cb2fe0c4546097a55a83ee5a11c))

* tests and slash command descriptions ([50675f6](https://github.com/Esposter/Esposter/commit/50675f697d0ac7d130c5ea2e897b402fa41f14bd))

* types ([914e794](https://github.com/Esposter/Esposter/commit/914e794eb9d6a598aedd3898e134a24e6b7e0317))

* types ([7bc3e10](https://github.com/Esposter/Esposter/commit/7bc3e10fd1462338c3bec0faa2212f2704c5bd08))

* types ([7b9c431](https://github.com/Esposter/Esposter/commit/7b9c43106c245ed6b4994d7063492a8355f1e586))

* types ([1852d58](https://github.com/Esposter/Esposter/commit/1852d5857f3948b5e8aecb6e70a98b72dfaed8be))

* types ([53b57a8](https://github.com/Esposter/Esposter/commit/53b57a88ac7464329cf41e9d75db7c89f3be3d34))

* types ([ef73a3c](https://github.com/Esposter/Esposter/commit/ef73a3c2a5502c2e26ed5d97382d380f0474f5b1))

* types ([1ae9295](https://github.com/Esposter/Esposter/commit/1ae929571ac701aabe7fdbdf0c3730f3c5ceb1ac))

* types ([a09080c](https://github.com/Esposter/Esposter/commit/a09080ca8d3eb6f626c693f36aec7dbd3cf0f23b))

* types ([22a0234](https://github.com/Esposter/Esposter/commit/22a02346dd9012fbf266225cd4f7fce7e279e6c7))

* types ([ed8290a](https://github.com/Esposter/Esposter/commit/ed8290ab0bef8913b8b6c8bc4b49b41dad16fe60))

* types and emits ([91d4a9c](https://github.com/Esposter/Esposter/commit/91d4a9c0114aa5094839a7911e25b3834bfca0a8))

* unnecessary spread ([d3da94f](https://github.com/Esposter/Esposter/commit/d3da94f7e47375c6055aa1692a012c49d7bf1e84))

* update lint ([05dbe96](https://github.com/Esposter/Esposter/commit/05dbe96ce427cfcea3fff07450579ff74ee1bfc5))

* use div ([48747cd](https://github.com/Esposter/Esposter/commit/48747cd09a5d3d2debe017149b8be81ea6c94639))

* use superrefine for context ([35152ef](https://github.com/Esposter/Esposter/commit/35152efa94fb3cb86354b4629dabeaeba11d5911))

* user to rooms table ([a0426de](https://github.com/Esposter/Esposter/commit/a0426dea6ca3df478e17cd00525ad3d288f99e45))

* voice ([73c0a11](https://github.com/Esposter/Esposter/commit/73c0a1166584ae816a49f5458cf0385a060a0f5e))

* wip ([e918df7](https://github.com/Esposter/Esposter/commit/e918df78d9d36ebd830eabb01f15cb4a132915c6))

* wip ([f059663](https://github.com/Esposter/Esposter/commit/f0596630b4b1dffbf9bb1b294c4c4b8be37eae36))

* wip ([46204e6](https://github.com/Esposter/Esposter/commit/46204e666fd5c9c1c69fee23368a270c57374015))

* wip ([199600f](https://github.com/Esposter/Esposter/commit/199600fbab5f53d505fd768016acc70630da5c0c))

* wip ([e7db4c1](https://github.com/Esposter/Esposter/commit/e7db4c198ab2a76009ab5338c39bb32d0d765874))

* wip ([df5c276](https://github.com/Esposter/Esposter/commit/df5c2769dbd07018c449d43290d323365278b231))

* wip ([5e675d7](https://github.com/Esposter/Esposter/commit/5e675d7ab4e981b0ecebe67611d501920f70540c))

* wip ([7150d67](https://github.com/Esposter/Esposter/commit/7150d675afcbed1da9f811c79e474f8e9ef838c9))

* wip ([9e057ad](https://github.com/Esposter/Esposter/commit/9e057adb4c894f72a8fb859b0b0cb46b84e9da2d))

* wip ([08bd1d7](https://github.com/Esposter/Esposter/commit/08bd1d76b3d30f35922439de4af2958353b40fef))

* wip ([b6ad1ef](https://github.com/Esposter/Esposter/commit/b6ad1ef8a8484530c49c56150d81b48b4262b8d1))

* wip ([52a3ba5](https://github.com/Esposter/Esposter/commit/52a3ba58288c49b37072407f1514bed94fd90f2a))

* zod to json schema ([bb0f183](https://github.com/Esposter/Esposter/commit/bb0f18337e0b666b8b675d843e6f3da822e7a869))

### Features

* Add [@here](https://github.com/here) and [@everyone](https://github.com/everyone) ([710b702](https://github.com/Esposter/Esposter/commit/710b7026e2f6705513f4561327f2d04fb70350e1))

* Add blocks table ([bf5b182](https://github.com/Esposter/Esposter/commit/bf5b182e8d98c6da488138852ce72a946bb6ba8f))

* Add custom keyword ([29abcea](https://github.com/Esposter/Esposter/commit/29abcea0babfe0932ce064903370f5a8a5883c3c))

* Add DMs ([d6315b1](https://github.com/Esposter/Esposter/commit/d6315b1a385e9df8bfcc720394bdd666bd6ffd89))

* add friend request notification ([3bbd448](https://github.com/Esposter/Esposter/commit/3bbd448dcc23330bee926215d8ad196ce0388c94))

* Add friends ([9ff1c3e](https://github.com/Esposter/Esposter/commit/9ff1c3e02c6c016d358189b7fe557d48273e54ef))

* Add green circle ([09f5efd](https://github.com/Esposter/Esposter/commit/09f5efda9755d748df876e8ee3d0c8767d28dd4a))

* add input ([fd6307e](https://github.com/Esposter/Esposter/commit/fd6307e10d548614e1d0d028159dfd2905fa6280))

* Add keyboard shortcut ([46d8bee](https://github.com/Esposter/Esposter/commit/46d8bee5f47620c53c2772101f241f9c8ba4528a))

* Add migration ([3e50606](https://github.com/Esposter/Esposter/commit/3e506067103ad5088c2b863c8ca21ea392ea4455))

* Add node annotation for pure js tests ([1187d0d](https://github.com/Esposter/Esposter/commit/1187d0ded3c946049cf39ddba080957a46a86868))

* Add slash commands ([89d5ffc](https://github.com/Esposter/Esposter/commit/89d5ffce07f42e847f8d37d534174bcd40461c5f))

* Add string split + validation ([27eb78f](https://github.com/Esposter/Esposter/commit/27eb78f7852cde331d5eeeec24e221a87ba85b8f))

* Add tests ([ce9bee8](https://github.com/Esposter/Esposter/commit/ce9bee8f386ee192348ab53745b77fe71aeb93c9))

* Add tests ([f93e397](https://github.com/Esposter/Esposter/commit/f93e39794e9dff287cc89a708a4c56c5d5bac8d6))

* add v5 features ([4cb2b61](https://github.com/Esposter/Esposter/commit/4cb2b6148cb2545028e36ce3acbb15c67bc173d5))

* Add voice channel ([359b23c](https://github.com/Esposter/Esposter/commit/359b23cf2563e2ca2da33f074bd2e78586091a57))

* extend slash commands for params ([405ae9f](https://github.com/Esposter/Esposter/commit/405ae9ff16869378842fe3371a07471506db74a3))

* finally fix up poll styles ([b230645](https://github.com/Esposter/Esposter/commit/b23064584a01d5ccd0badebd4e6feba965a90ac8))

* implement features + fix lint ([e62cdd4](https://github.com/Esposter/Esposter/commit/e62cdd42a44775ba52e06d57030da740c61e1a7a))

* refactor ([d8dd1a9](https://github.com/Esposter/Esposter/commit/d8dd1a930221818e0a603600a0e91399e606ffeb))

* slash command params chip ([458dfbb](https://github.com/Esposter/Esposter/commit/458dfbbfd5a0e01727c9fc7d985e11c66eea8e4f))

* wip ([8befe1f](https://github.com/Esposter/Esposter/commit/8befe1f9698c000e6924512a5a5f46890d7a690a))

* wip ([7e5afb7](https://github.com/Esposter/Esposter/commit/7e5afb71132ca4db8a2c55bb15916e583095cfd4))

* wip ([efdfaeb](https://github.com/Esposter/Esposter/commit/efdfaeb3ee1b86edf2083dbc1f02fb3338111663))

### Performance Improvements

* optimize room categories computed ([9d26e65](https://github.com/Esposter/Esposter/commit/9d26e65c2ece40dd7456be8de8b1963a9f9ca8c1))

# [2.20.0](https://github.com/Esposter/Esposter/compare/v2.19.2...v2.20.0) (2026-03-29)

### Bug Fixes

* achievement to get from raw input ([a929371](https://github.com/Esposter/Esposter/commit/a929371391f3201b0d6156e374774224c1d16e59))

* adapter ([e739859](https://github.com/Esposter/Esposter/commit/e739859c68d8bfc7dad6454e7fd0779a590e58ea))

* add back changes ([526fc25](https://github.com/Esposter/Esposter/commit/526fc252d3155c5b1294c47878b842ffbcd08ac6))

* add back disable ws link in dev ([66a388c](https://github.com/Esposter/Esposter/commit/66a388c8fa71eb5a31359160c7a32f9ea3279575))

* add back rule since oxfmt enables it ([bd3717f](https://github.com/Esposter/Esposter/commit/bd3717f9a26290e025df141926b48e500aa978a7))

* add back ws ([97639fb](https://github.com/Esposter/Esposter/commit/97639fb12855354340f5c10c46d5cb0bc039a9a4))

* add changes ([120f209](https://github.com/Esposter/Esposter/commit/120f20916229f7c5588cbcf29b89ce71a506d77b))

* add coderabbit config file ([376d1ee](https://github.com/Esposter/Esposter/commit/376d1ee73299f232c57bf6a8226949ede529989e))

* add error icon for prepend ([1740268](https://github.com/Esposter/Esposter/commit/1740268793f6fc04b7731cd5565d90ec708fdc4c))

* add file ([bff4b25](https://github.com/Esposter/Esposter/commit/bff4b25bbedba4ee89e32e3f3d1f6fe66e5cf8a0))

* add file ([d77559a](https://github.com/Esposter/Esposter/commit/d77559ac114d6927f4cd6a29207222329594f764))

* add files ([9de79f1](https://github.com/Esposter/Esposter/commit/9de79f1e803c36c5859e419de731a327e317d512))

* add globals override to revert to old grid behaviour ([d2e6122](https://github.com/Esposter/Esposter/commit/d2e61228d4a7cc30eadd9531c3f9ebf6fdf268f2))

* add meta ([eee90de](https://github.com/Esposter/Esposter/commit/eee90de7786df080023bef068942cd86e3a786c3))

* add offline error ([e82cd64](https://github.com/Esposter/Esposter/commit/e82cd6485f53b4b80982965a1cf9f9a6c351f84c))

* add partial ([56e1239](https://github.com/Esposter/Esposter/commit/56e1239d44bcb1dfcfbd372c5a9ec5aa382c3630))

* add prepend form ([0d2d596](https://github.com/Esposter/Esposter/commit/0d2d596a8d1fb0b54959b806e981a67846010016))

* add revert and snapshots ([5e3397e](https://github.com/Esposter/Esposter/commit/5e3397ed830fb014562dd7b8efa7732378b82329))

* add satisfies ([7797519](https://github.com/Esposter/Esposter/commit/77975199fe0b9298c5c5fe6b1eaaeb19d4f269ac))

* add schema map ([0c9e977](https://github.com/Esposter/Esposter/commit/0c9e977a0a3cb82f07aceaa7bd672609cfb288bd))

* add schemas ([5a145e9](https://github.com/Esposter/Esposter/commit/5a145e90e266752d69ccc9a22114e575aa539818))

* add setup file ([284cf44](https://github.com/Esposter/Esposter/commit/284cf44c67c582447c6b6354c8628d47231941be))

* add snapshot ([05f68a0](https://github.com/Esposter/Esposter/commit/05f68a056f6f7383f90dd4e6efe37a6d8ed287d6))

* add stats ([2627192](https://github.com/Esposter/Esposter/commit/2627192aa2718793fe5dfa9a4bc0af8575d6d098))

* add test case ([676448f](https://github.com/Esposter/Esposter/commit/676448fe669319bb9d86b8afc5c76b45e305bdaa))

* add tests ([4287fcc](https://github.com/Esposter/Esposter/commit/4287fccb1163d9d9b951dc9d305363ee3b65ecab))

* add tests ([e2a1c74](https://github.com/Esposter/Esposter/commit/e2a1c74ba699b057e5918a2a367e615e08bd9f03))

* add use composable for data source configuration ([13f1f80](https://github.com/Esposter/Esposter/commit/13f1f80a9f43c4d1208100ebab1cb6d3e23761e8))

* add visual schema ([24436ab](https://github.com/Esposter/Esposter/commit/24436abef677cf2be58ff5732dbb855376641949))

* add with ([c2277e8](https://github.com/Esposter/Esposter/commit/c2277e8ba602c9b5f2f1744e0308efa313d4dde3))

* add zod to json tests ([a86a3af](https://github.com/Esposter/Esposter/commit/a86a3afa69854d612301401c42f8af39da1bf5e5))

* align tooltip and descriptions ([a741fd9](https://github.com/Esposter/Esposter/commit/a741fd95e23d006d6dfde12b76d1d5ba4692c0b4))

* allow attributes ([75c4c80](https://github.com/Esposter/Esposter/commit/75c4c805e77d72f784d73971545b2c9f12199bc1))

* assert ([b3f9ead](https://github.com/Esposter/Esposter/commit/b3f9ead4072895977b57448064c290e58725a8b5))

* avatar ([083f71b](https://github.com/Esposter/Esposter/commit/083f71b3097d6eaa2f4b55c3d9f2588faae4cd38))

* benchmark ([c96530e](https://github.com/Esposter/Esposter/commit/c96530e1b64b7f3f6be4cecb19bdc9597725458d))

* bg transparent style ([074c237](https://github.com/Esposter/Esposter/commit/074c237b6ef5d03310e4b3dbb238d482383240d5))

* bugs ([9ec99a0](https://github.com/Esposter/Esposter/commit/9ec99a0b9aec3013552aa7b7a93eebf78d70ca20))

* casts ([328b817](https://github.com/Esposter/Esposter/commit/328b81787ce3d2e8a2813e0a18ac17cd03bc6713))

* center columns ([36ef661](https://github.com/Esposter/Esposter/commit/36ef6614d81c4a5900a19557cb1146927b411fe1))

* class ([97b8753](https://github.com/Esposter/Esposter/commit/97b8753537aa5e4f18a2f7de6490e1e283949eee))

* class instances & on mounted edit item ([2fe5909](https://github.com/Esposter/Esposter/commit/2fe5909a0c40f0e7b75e7e25ef6b7ef463ee6edb))

* cleaning up dbs ([a404f94](https://github.com/Esposter/Esposter/commit/a404f94b94464757ce2a78772663539becdb7082))

* cleanup AColumn ([7c9121f](https://github.com/Esposter/Esposter/commit/7c9121f94a92cbcb8e8999ccc24f1080c9566937))

* cleanup copying to clipboard ([8364bef](https://github.com/Esposter/Esposter/commit/8364bef244d104ddc41c8527515b39f6970f0a8b))

* cleanup docs ([d6009f3](https://github.com/Esposter/Esposter/commit/d6009f367c2c3ae2b34fed4dd78bb1d8cf64eb0f))

* cleanup drag commands ([d0ee330](https://github.com/Esposter/Esposter/commit/d0ee33031c25410b1d9ee5febb1e9373f05bc0e1))

* cleanup export dialog ([6bff03b](https://github.com/Esposter/Esposter/commit/6bff03be0c0e8e279e553f110072012c82a879ea))

* cleanup height styles ([59b37da](https://github.com/Esposter/Esposter/commit/59b37daaae1bed53b144bfd1fcff273e0ef8914d))

* cleanup md and types ([d2d127b](https://github.com/Esposter/Esposter/commit/d2d127bb5acfa424a6c34a2cd8fda1046dbb86bf))

* cleanup parse clipboard rows ([0d28c32](https://github.com/Esposter/Esposter/commit/0d28c32980a734e7b92d44b92d9a349c3f7d7c88))

* cleanup parse clipboard rows ([6db7593](https://github.com/Esposter/Esposter/commit/6db7593a192903789e75fe88e5f3743aa3b72846))

* cleanup tests ([ae9f4a4](https://github.com/Esposter/Esposter/commit/ae9f4a4cbc606ce8b9b800cbab78f4e0866f2c32))

* cleanup tojson ([33079be](https://github.com/Esposter/Esposter/commit/33079be6c915f062fb7f1029b05d95be0c0ee0bb))

* cleanup types ([e323410](https://github.com/Esposter/Esposter/commit/e3234109352839da2a538a97687be08240c3cce5))

* cleanup types ([09825c0](https://github.com/Esposter/Esposter/commit/09825c0a450fdc73b4e89b9da9d1dfa5fd6e2cf8))

* cleanup types ([c2b64a6](https://github.com/Esposter/Esposter/commit/c2b64a66ab0c9db9d6ecaebee741881d31138032))

* cleanup types ([32aeec4](https://github.com/Esposter/Esposter/commit/32aeec4478dd9285a4184d9d993dacb194ae9d48))

* cleanup unnecessary coalesces ([e8cae7a](https://github.com/Esposter/Esposter/commit/e8cae7af42e5fa70ebeab9d5de053e4519899e60))

* co-locate tests ([e834169](https://github.com/Esposter/Esposter/commit/e834169a6d373643357907f7d3a69bd190e92f51))

* code rabbit review ([290c955](https://github.com/Esposter/Esposter/commit/290c95586d3c563e3f5b4b76dcd6266d73c2934a))

* code review issues ([49972b2](https://github.com/Esposter/Esposter/commit/49972b2c79a2843ff9ce239df27f5db7006e738a))

* code reviews ([f3bc86f](https://github.com/Esposter/Esposter/commit/f3bc86fcedb2fc1b34b72dd827afbfa72510e777))

* code reviews ([2db0883](https://github.com/Esposter/Esposter/commit/2db0883e0fa3e9bda3b7f66737b0c0b5812e70a7))

* code reviews ([9d281ab](https://github.com/Esposter/Esposter/commit/9d281ab2f6959dc2c1b77fd50bf9e12f6118d20a))

* coerce ([3e1b30e](https://github.com/Esposter/Esposter/commit/3e1b30e9ec4592099a8da30520c54f999ff1aca8))

* coerce ([e15903e](https://github.com/Esposter/Esposter/commit/e15903eb843fc6a82dd33e0b984e34b1254f1788))

* column item ([3c39afd](https://github.com/Esposter/Esposter/commit/3c39afd3a4423f01150191ef9347b9af7e59bf14))

* comments ([0f59c11](https://github.com/Esposter/Esposter/commit/0f59c1188c843b75baf9683d075ad615d233934a))

* comments and schema ([b5456f2](https://github.com/Esposter/Esposter/commit/b5456f225d4a19ca4de5e1d14128bbad23259b79))

* compare ([5097e4d](https://github.com/Esposter/Esposter/commit/5097e4d3d10793276e8e593ff4f8f5a7abc3aef2))

* compute column stats ([ea08368](https://github.com/Esposter/Esposter/commit/ea08368d146752b0f94a8be6952264df2b581872))

* compute value ([386f3b1](https://github.com/Esposter/Esposter/commit/386f3b1c7b2439f19f29623f5e2d335b812e3677))

* config ([e1d7fb9](https://github.com/Esposter/Esposter/commit/e1d7fb9d28fdf8cbe06bf2bae5ed41e8e550c59a))

* conslidate meta ([a56160f](https://github.com/Esposter/Esposter/commit/a56160f619467b51827cd81d4a3c0a5308cd14ae))

* copy and paste as markdown ([07c8b3e](https://github.com/Esposter/Esposter/commit/07c8b3e7bb9ada2b0f4882202b16c461942b0b2a))

* copy to clipboard ([c4489ab](https://github.com/Esposter/Esposter/commit/c4489ab87260c4119cdd57bb033606f88c329415))

* copy to clipboard ([65f2098](https://github.com/Esposter/Esposter/commit/65f209850ab9dc872ebd3fcba890eeb6641dd094))

* creating column dialog ([fe581f4](https://github.com/Esposter/Esposter/commit/fe581f44b2621edd29800b4673c86d4f650bb472))

* declare vars ([5f326e8](https://github.com/Esposter/Esposter/commit/5f326e8d2c8b9408e0769ace493fcce2cfe33cbd))

* deps ([b265ed1](https://github.com/Esposter/Esposter/commit/b265ed15ebfa223fd1b0a77a37ad5c9468a6bd96))

* destructuring ([e173856](https://github.com/Esposter/Esposter/commit/e17385638404050dccee5d71e5db74cf71161355))

* disable dragging when active filtering/searching ([933f000](https://github.com/Esposter/Esposter/commit/933f000b0ec619a6aa08be68507ff94758e329ba))

* do normal query instead with simple implementation of isPending ([a7fac7e](https://github.com/Esposter/Esposter/commit/a7fac7ed5f0f3ab8bc095e4cfe89ed0d20ffcf7f))

* don't destructure events ([1013b06](https://github.com/Esposter/Esposter/commit/1013b064acf349bb803a70f5298e8c6187a75261))

* edit name ([16ccadc](https://github.com/Esposter/Esposter/commit/16ccadc77d0c2247252131ab0544427dbd61176c))

* editable column value ([b6c3f97](https://github.com/Esposter/Esposter/commit/b6c3f97e9759726c6152ec2ba4c8c39e25672ae5))

* empty dates ([7bb8cfa](https://github.com/Esposter/Esposter/commit/7bb8cfafaac409fb9bdb096f8c15c054d0723c1e))

* errors ([ec0b0e2](https://github.com/Esposter/Esposter/commit/ec0b0e2f3a91c642725b5aa7e1214f937b0bea4f))

* errors ([ba9d6b0](https://github.com/Esposter/Esposter/commit/ba9d6b09f73b8e302fd4ca6620e594690fc5a52e))

* eslint ([0594926](https://github.com/Esposter/Esposter/commit/0594926f89d42693242ec46a9b911fb58b18beb4))

* export ([a0a9515](https://github.com/Esposter/Esposter/commit/a0a95150a004413aaffa3cba676a7ab6b32fb1f7))

* export schema from enum ([a5f370a](https://github.com/Esposter/Esposter/commit/a5f370a8b6c18c45d51f5474a8649ad402a26faa))

* extract schema fields ([da67ec4](https://github.com/Esposter/Esposter/commit/da67ec48a318938ae6ac45cdf0ce56d1ebbd44f8))

* feedback ([826eebd](https://github.com/Esposter/Esposter/commit/826eebdc89ba2bcf0f96fad4e0c12f71955e0cd5))

* finally fix up everything ([20e392f](https://github.com/Esposter/Esposter/commit/20e392f0565cfb7a3a303b1531001ef11107af06))

* find and replace and reset tooltip ([97e9582](https://github.com/Esposter/Esposter/commit/97e9582fb81e3a6f1f79f1992ecc8d1001d8cecf))

* fix back core reset styles ([9cfeb4c](https://github.com/Esposter/Esposter/commit/9cfeb4c7637817641db35ce5c283c7d810915580))

* flatten zod schema finally ([a6c5270](https://github.com/Esposter/Esposter/commit/a6c52703a72bcf240e4f1ef0d867124e4f7f8bca))

* flush code ([c716725](https://github.com/Esposter/Esposter/commit/c71672596f4c6bb33d75e9c36193e7fa0e630efe))

* flush operations ([aa32e28](https://github.com/Esposter/Esposter/commit/aa32e28907c2e43dfa942331b677eb043e81e1bc))

* folder and things ([6c911b8](https://github.com/Esposter/Esposter/commit/6c911b84ab28fb80920aae42e12c8425de7b4f3c))

* form id and add key ([3942b75](https://github.com/Esposter/Esposter/commit/3942b75053a5ee9c09ac07ef2d353dfe7b45ad26))

* format ([1d2a6de](https://github.com/Esposter/Esposter/commit/1d2a6de76a6394fe9aeab39afdbe16f979c2e558))

* format ([bb26a21](https://github.com/Esposter/Esposter/commit/bb26a21df37fd89622dc587e6616ab0ae775c614))

* format + fix up some ignores ([6cd632f](https://github.com/Esposter/Esposter/commit/6cd632ff672ad8e0adee51b42cb6f6925f894b96))

* globals ([fa12cbb](https://github.com/Esposter/Esposter/commit/fa12cbb57a574cd1e52bd4baa9dbc810ea769a0a))

* grab pinia from inside instance ([423dab3](https://github.com/Esposter/Esposter/commit/423dab38e2d76e1046e6a9607d2288a85efba988))

* headers ([6e25e70](https://github.com/Esposter/Esposter/commit/6e25e7007d6bff1308d5035b6c98c76c1bde3c7a))

* IME ([52a7be0](https://github.com/Esposter/Esposter/commit/52a7be0e9f3b6680be7d6351dd1e06cbe24d7a0e))

* import/export ([01495e5](https://github.com/Esposter/Esposter/commit/01495e5ba09c3bb269854aab4749a75ea8d0341a))

* imports ([c34f5b5](https://github.com/Esposter/Esposter/commit/c34f5b56dc12a4600c8b5f39234e5296c90ec279))

* imports ([a511b26](https://github.com/Esposter/Esposter/commit/a511b2626a7200912f9e29572269b3d585e6d3eb))

* indexed column ([20eda51](https://github.com/Esposter/Esposter/commit/20eda513cac2c839fcb459277c5923c36d675b25))

* infer column type ([3a3f827](https://github.com/Esposter/Esposter/commit/3a3f82777e3e1c021115f4c00946212aa5a27575))

* inline snapshot tests ([29dd95e](https://github.com/Esposter/Esposter/commit/29dd95ed188a5a5d2a1e38e2dfdc0e1cb73528df))

* issues ([4f77ae3](https://github.com/Esposter/Esposter/commit/4f77ae33ff0a8e9475ba9fef5b7173d98545ed6f))

* item category definitions ([d78cc90](https://github.com/Esposter/Esposter/commit/d78cc9093bf1a9a4051c2df12aeaccc8a2a5dded))

* key stroke ([e7af6f0](https://github.com/Esposter/Esposter/commit/e7af6f01a8968103917e95c0a5140d6905905cc2))

* layer order ([143e94c](https://github.com/Esposter/Esposter/commit/143e94c920cb6dd77e48428b160c5b78469507cc))

* links ([ad7fb52](https://github.com/Esposter/Esposter/commit/ad7fb52753cdeab755f1c54e1c3c6662c356d5d5))

* lint ([d33173c](https://github.com/Esposter/Esposter/commit/d33173cc67c018c2f3c30ad014db13a4d0f2563d))

* lint ([02bcb1e](https://github.com/Esposter/Esposter/commit/02bcb1efb072300516978d6e55070c8d937bfb73))

* lint ([c2791fb](https://github.com/Esposter/Esposter/commit/c2791fb77b0310d52842e852327b85009021ccb1))

* lint ([8eb0113](https://github.com/Esposter/Esposter/commit/8eb01130bb6c8518029fef5a9787c0729ff6c5ce))

* lint ([866ec18](https://github.com/Esposter/Esposter/commit/866ec181bfd5e724d3430be10f4d84c5d1c040b5))

* lint ([5ad9c7e](https://github.com/Esposter/Esposter/commit/5ad9c7ec3d6899184ffbe0d00071186f75e55cb3))

* lint ([6ac39ae](https://github.com/Esposter/Esposter/commit/6ac39aeebf286f37c0b4e2af20b0cb992a905075))

* lint ([100ff1d](https://github.com/Esposter/Esposter/commit/100ff1d8eb2503df0262c3f432a54a96cb9976c5))

* lint ([cb22da4](https://github.com/Esposter/Esposter/commit/cb22da4b939f3ba13736bb19d54a9c52f4c5002c))

* lint ([b1481fb](https://github.com/Esposter/Esposter/commit/b1481fb991fc43a384b3f58e8d2090249b0e3195))

* lint ([9889603](https://github.com/Esposter/Esposter/commit/9889603fd0f14100122e324e022a7d809558f975))

* lint ([26f8451](https://github.com/Esposter/Esposter/commit/26f8451dc00bd81b8c1694453311a72d2dbd1278))

* lint ([8e76d68](https://github.com/Esposter/Esposter/commit/8e76d689953131beb15892d20747efebbf819fea))

* lint ([68530fe](https://github.com/Esposter/Esposter/commit/68530fea5f8a50f0cd0396b42ae25f3d2b4a9449))

* lint ([3d2e1ef](https://github.com/Esposter/Esposter/commit/3d2e1ef58b20d0d03949ad18749e0b3ad5d4a7bb))

* lint ([7fa4a54](https://github.com/Esposter/Esposter/commit/7fa4a54a46ab6044f787b2e1aafcc0b757ccc6f6))

* lint ([5239927](https://github.com/Esposter/Esposter/commit/52399274cb89db74c1ad27e3eebe6ea19382028f))

* lint ([9174edf](https://github.com/Esposter/Esposter/commit/9174edf1a4defa13ac9a37c0c79bf459ac54fbab))

* lint ([43fb827](https://github.com/Esposter/Esposter/commit/43fb827bc76282873e2c139ebac3cd06767e4385))

* lint ([902681f](https://github.com/Esposter/Esposter/commit/902681fae330e7ac92c01ca14738fc93c4be5c75))

* lint ([ce08d91](https://github.com/Esposter/Esposter/commit/ce08d91599e02f0ed06133fa774b07721f153fdc))

* lint ([2766e93](https://github.com/Esposter/Esposter/commit/2766e93d6b1d5a8e02dd8f2696f129ce08e611ca))

* lint ([70f2a33](https://github.com/Esposter/Esposter/commit/70f2a3386a58b327ba984dbb2c81b98891f0b1a1))

* lint ([1caaecb](https://github.com/Esposter/Esposter/commit/1caaecb157c6f5369573815bb5b53b88e8d8d16b))

* lint ([974c27a](https://github.com/Esposter/Esposter/commit/974c27a3da0921ec5d523d4bd29b0a718bcfed7d))

* lint ([1674989](https://github.com/Esposter/Esposter/commit/1674989c93d5a7d093bb71745be39fe455fc96a4))

* lint ([82e0aad](https://github.com/Esposter/Esposter/commit/82e0aadfafa9640640963c6b2bcbd8685da1bc48))

* lint ([cf683af](https://github.com/Esposter/Esposter/commit/cf683af23704f3f73668fb25f23ddd8fa7050545))

* lint ([0ca441e](https://github.com/Esposter/Esposter/commit/0ca441e0a3a3761d7897dd5b3ec4d98446a3471a))

* lint ([df4df97](https://github.com/Esposter/Esposter/commit/df4df97f993b5af4a3580421a77ef8b4e1a16e06))

* lint ([3cd5912](https://github.com/Esposter/Esposter/commit/3cd5912fd5b52ebf90d3b27801d688d5789be0c9))

* lint ([1856851](https://github.com/Esposter/Esposter/commit/185685163c4daa889ead9c72221604c232c62981))

* lint ([d59aa88](https://github.com/Esposter/Esposter/commit/d59aa88333ac704712427fe9b38ef480a0a4dfc5))

* lint ([0339f5b](https://github.com/Esposter/Esposter/commit/0339f5b510cf9d524a982f768a2dba1b80c5706a))

* lint ([b3e065f](https://github.com/Esposter/Esposter/commit/b3e065f23ae0c2e19ace4037040f8331c647b43c))

* lint ([4515b13](https://github.com/Esposter/Esposter/commit/4515b13b94c3c9b9a99cdab23f91f4bb33f478a8))

* lint ([9452d6a](https://github.com/Esposter/Esposter/commit/9452d6a6f90bd0614781285b70dbee3f7179aadb))

* lint ([c25e84d](https://github.com/Esposter/Esposter/commit/c25e84d889b96869047dc4beb3921f380540c9ee))

* lint and add features docs ([7e17501](https://github.com/Esposter/Esposter/commit/7e17501a286d38472b06d4dab397fd55261ed1e7))

* lint and errors ([b6da2a4](https://github.com/Esposter/Esposter/commit/b6da2a4892f1f60fe70676a65dd0a4fdbb7a8d91))

* lint and is savable ([b1cec6e](https://github.com/Esposter/Esposter/commit/b1cec6e74a4f7d3185144dadf6a7a24192836f9a))

* lint and remove unnecessary options ([619dac8](https://github.com/Esposter/Esposter/commit/619dac87654a95fc5c58d75c04999cd116f4e93d))

* lint and remove unnecessary param for takeOne ([0d9e637](https://github.com/Esposter/Esposter/commit/0d9e6372079385520875a515d0a07e381832ee5f))

* lint and skills ([2ae2eaa](https://github.com/Esposter/Esposter/commit/2ae2eaab32d04807a8594674005fbbb7887828d3))

* lint and syntax ([1da4889](https://github.com/Esposter/Esposter/commit/1da48895328d91e0945553148688103c95a51853))

* lint and typecheck ([0e4aa28](https://github.com/Esposter/Esposter/commit/0e4aa28f7581f9d8c52d73cb39985d3e4632de1c))

* lint and types ([fc4fc23](https://github.com/Esposter/Esposter/commit/fc4fc23529da60e85f54dea0ef6cb45101e55a47))

* lint and types ([80077e9](https://github.com/Esposter/Esposter/commit/80077e96e1cb2f1f760b1c8e2eed681fe0b0ac64))

* lint and types and syntax ([7341bd4](https://github.com/Esposter/Esposter/commit/7341bd4e4431ac5ed1fcdb1c86dfbb539911e76a))

* lint rules ([837bf4d](https://github.com/Esposter/Esposter/commit/837bf4d56ecd37c3a9643310140492099117a213))

* lint rules ([1b8a6c3](https://github.com/Esposter/Esposter/commit/1b8a6c3ffea21bbbf86ae37edaaf6319b87f8189))

* lookup and types ([acc3567](https://github.com/Esposter/Esposter/commit/acc356779321cd0bfc86f91ab599e431959ba82b))

* make column schema properly generic ([17d6e66](https://github.com/Esposter/Esposter/commit/17d6e660ac6f4baf583ca195f89c2cf31c4ba877))

* make types strict ([b78b31c](https://github.com/Esposter/Esposter/commit/b78b31cfc8854275f8e981354881ba95ff4d9062))

* merge conflicts ([b797e41](https://github.com/Esposter/Esposter/commit/b797e41f64a733be195ba7573532d942c5d5622f))

* merge conflicts ([b3b94d4](https://github.com/Esposter/Esposter/commit/b3b94d4bb65b8f28f59a147b2f8150b78aa1b0ab))

* meta ([f47d183](https://github.com/Esposter/Esposter/commit/f47d183133bf1264eb20b94c4092cad1995b1abe))

* meta and lint ([0ccc8c1](https://github.com/Esposter/Esposter/commit/0ccc8c109d362f13ef0b9b7cc0ce14147bd3cd01))

* migrate some things ([8ce4da4](https://github.com/Esposter/Esposter/commit/8ce4da46230c14a522480858d59e2c72712d2194))

* mime type ([ec3d33f](https://github.com/Esposter/Esposter/commit/ec3d33f23d57daedcc52556ba822818faf358e50))

* missing files ([ff64c10](https://github.com/Esposter/Esposter/commit/ff64c10ad3523c488abb5ba5bea2363a2c6b6618))

* model values ([8be2f5f](https://github.com/Esposter/Esposter/commit/8be2f5fdf57223154b75b679fb5fe53565814a8b))

* more review feedback ([442af14](https://github.com/Esposter/Esposter/commit/442af14c8b66e8bf0868ebbfc9c7e81981456766))

* move to text slot ([bbdf912](https://github.com/Esposter/Esposter/commit/bbdf912bf020ea42b884723398ce31d5a1bad5c4))

* names ([5d3f5fd](https://github.com/Esposter/Esposter/commit/5d3f5fd41eef8b2b841ee9cfc3ebe39ebf8f5f6e))

* nitpicks ([b16d5f5](https://github.com/Esposter/Esposter/commit/b16d5f548c80b761988312d5b54fda5ad6ee3d2b))

* node tests ([28be7fd](https://github.com/Esposter/Esposter/commit/28be7fd33591328ec808b575fdaf5f9553a3e711))

* now cleanup creating command ([71e6160](https://github.com/Esposter/Esposter/commit/71e616039864c82a9427306fcf13dc143adc9978))

* optimize and fix types ([81fd191](https://github.com/Esposter/Esposter/commit/81fd191cb37da47b7051c278439ec65f50830f5d))

* organized imports ([029c848](https://github.com/Esposter/Esposter/commit/029c84876bf90cbef1e9073d63b0e1089c3f94f2))

* persist datasource ([b20cd2e](https://github.com/Esposter/Esposter/commit/b20cd2ead522c479f7b9cbaa655d4589cfccd3ab))

* prettify names ([74ac7ec](https://github.com/Esposter/Esposter/commit/74ac7ecba012970ca8dfe5e259ea99421b45f7c7))

* proper imports ([86f6a49](https://github.com/Esposter/Esposter/commit/86f6a49edfa633a47123deb95191dff551bad627))

* proper imports ([3835dc2](https://github.com/Esposter/Esposter/commit/3835dc211a3c336f91496cbbf63617f8640a2a81))

* props ([a71abb0](https://github.com/Esposter/Esposter/commit/a71abb016c16d22a05d544192f78e8762a191b3c))

* props precedence & icons & default values for reset ([b1e85ab](https://github.com/Esposter/Esposter/commit/b1e85abab5299fc32f07c96e2a6dce0824de50a9))

* pull to refresh style ([2ccf2f2](https://github.com/Esposter/Esposter/commit/2ccf2f2a9a4e429f2e0d4121493acfb76a5e9f68))

* raise error and alert ([6bde844](https://github.com/Esposter/Esposter/commit/6bde8449b3a4f8aa15c9a376a47ef7f9f990b249))

* re-mount on reset ([51a794e](https://github.com/Esposter/Esposter/commit/51a794e87bc6be920ecd46e40a6ef673a1f19fd1))

* reading json files ([36734b7](https://github.com/Esposter/Esposter/commit/36734b709107cdbcd4e2a53a519da2bd8ea0dac7))

* recursive key of ([df3047c](https://github.com/Esposter/Esposter/commit/df3047cd6289b8e5037ad092f4c7788fc40af193))

* refactor constants ([1cfb457](https://github.com/Esposter/Esposter/commit/1cfb4578ec8bfd18ed818d219214a46855fde755))

* refactor date formats ([e63c2f0](https://github.com/Esposter/Esposter/commit/e63c2f013edd9fa8cda508f5e9a32576f62744c4))

* refactor out some things ([11571c3](https://github.com/Esposter/Esposter/commit/11571c32558c1802e368632753920c21e3288dc1))

* refactor to use function ([0d7e31c](https://github.com/Esposter/Esposter/commit/0d7e31c1c8d2196508217585d3401be739df5cd4))

* refresh lockfile ([99cc3f9](https://github.com/Esposter/Esposter/commit/99cc3f921421ca77888f2a1fc39821572642710b))

* remaining types ([636bc56](https://github.com/Esposter/Esposter/commit/636bc561b3f27e009406f1b2960c1e6f653089cb))

* remove !important and revert to older default options ([6792440](https://github.com/Esposter/Esposter/commit/6792440cfa0b05344ea25c9ea4c7f08985ebed4c))

* remove comments ([1e7dc87](https://github.com/Esposter/Esposter/commit/1e7dc87b8ca7a2b800d6fa8b2d76abbf39a229c5))

* remove import ([83a85bb](https://github.com/Esposter/Esposter/commit/83a85bb69368c8d07ee584d3981967aa05278a4a))

* remove invalid id field from AggregationTransformation test objects ([8423739](https://github.com/Esposter/Esposter/commit/842373912c7abf759b380c1eca85e74b4d49d833))

* remove no longer necessary scss overrides ([145f81c](https://github.com/Esposter/Esposter/commit/145f81c83c9f59a8da453872345b0b222051f51f))

* remove nuxt/hints ([bfa2a60](https://github.com/Esposter/Esposter/commit/bfa2a607c5950883f7bbe7d0dfa04154b1c5437f))

* remove unnecessary async ([d509963](https://github.com/Esposter/Esposter/commit/d509963ba55fe0ad604f7ebf6705ca9ec2684b5a))

* remove unnecessary badge slot ([20012c6](https://github.com/Esposter/Esposter/commit/20012c6e2667ceba5b25952d403b804c491df769))

* remove unnecessary cast ([375cf5d](https://github.com/Esposter/Esposter/commit/375cf5de0e88b55a789357576ed7d946c140642d))

* remove unnecessary datasource computed ([b3a1427](https://github.com/Esposter/Esposter/commit/b3a1427e4bc421852ad55b20cb5cf319c7e91cb1))

* remove unnecessary edit form schema map now ([971d04a](https://github.com/Esposter/Esposter/commit/971d04a8fb68ac466ec6dfddd5c7731112d17b7f))

* remove unnecessary elevated ([fa534c6](https://github.com/Esposter/Esposter/commit/fa534c634ffe95ef75ee30037a7f91f2bb916ca5))

* remove unnecessary files ([02a094f](https://github.com/Esposter/Esposter/commit/02a094ffe756024c57d9b8f3d753931976015eae))

* remove unnecessary files ([2e4bbd8](https://github.com/Esposter/Esposter/commit/2e4bbd8db4da7893d8bf2ab2d937b0683f77d2bb))

* remove unnecessary import ([22a3c70](https://github.com/Esposter/Esposter/commit/22a3c70e01d68e7440c19d91560bac7b6974de5f))

* remove unnecessary invalid op ([fd1629b](https://github.com/Esposter/Esposter/commit/fd1629b19c3780b9db20746a46728bd1c2b476ac))

* remove unnecessary onMounted and unmounted ([2aab058](https://github.com/Esposter/Esposter/commit/2aab058f2badb2a318e26daec82b32a1baa16e78))

* remove unnecessary partial ([cb12af3](https://github.com/Esposter/Esposter/commit/cb12af3c63049d0a121d8ff95440cfbe9af1b45e))

* remove unnecessary re-render ([381c8c3](https://github.com/Esposter/Esposter/commit/381c8c30cd64918cccc2276cbcc6480d7420ce1b))

* remove unnecessary readonly ([d088709](https://github.com/Esposter/Esposter/commit/d088709612afa0a787193cc691ddb7c8153f1956))

* remove unnecessary self closing tags ([b8d0e63](https://github.com/Esposter/Esposter/commit/b8d0e6372ca66d380646eafbfa7e8a3078b6575e))

* remove unnecessary test ([15c5237](https://github.com/Esposter/Esposter/commit/15c5237b33485346ab2e1791fefdc6027ea65ddc))

* remove unnecessary type ([0a5e250](https://github.com/Esposter/Esposter/commit/0a5e2500b7967260ee89736ed37dd64f5e01bfdd))

* remove unnecessary variant outlined ([1caad11](https://github.com/Esposter/Esposter/commit/1caad11e60e756a88a2a250314e077f0735891b5))

* remove variant ([7e70d45](https://github.com/Esposter/Esposter/commit/7e70d453a86ac8d13c1463922e544d0ab2f2d16c))

* rename things ([d4ada05](https://github.com/Esposter/Esposter/commit/d4ada05fe8e78dc60b428c9d9c070c8ea49b2377))

* rename to string transformation ([ab222b1](https://github.com/Esposter/Esposter/commit/ab222b169d19a20de76c17023cb2ae48a57c7014))

* renames ([83abc7f](https://github.com/Esposter/Esposter/commit/83abc7fe92213c024702ce8668cb321b287bb017))

* renames ([18f7937](https://github.com/Esposter/Esposter/commit/18f79372056ed6e4e8c2cca517c1cf588bcb320d))

* renames and merge aggregation to computed ([995bbe6](https://github.com/Esposter/Esposter/commit/995bbe6cf2df7ead2409cc94e8c251b42c153165))

* reordering ([eb7beeb](https://github.com/Esposter/Esposter/commit/eb7beeb8fc35347c0a22c2656fc4e4ff66398acf))

* reordering + delete tests ([08e0792](https://github.com/Esposter/Esposter/commit/08e07928b25206faddb5c49823e3e53dd87c665e))

* return false if nothing defined ([60b2314](https://github.com/Esposter/Esposter/commit/60b231423b3e639574e8c52dbb27b2fd5c28722c))

* revert back ([7640215](https://github.com/Esposter/Esposter/commit/7640215c8fd43548c0b4baf897b43e5f15a68d11))

* revert back fmt ([45e0fdc](https://github.com/Esposter/Esposter/commit/45e0fdc2fe889f6d3d1f6a3d38b67067129492c7))

* revert flat ([111d7e6](https://github.com/Esposter/Esposter/commit/111d7e6bdd636f37d1f67ec18626411f29622069))

* revert wslink ([5da856a](https://github.com/Esposter/Esposter/commit/5da856ab9598aa3b04913f26159f7e4e9dc7568a))

* reviews and inline cell editing ([ecc8df8](https://github.com/Esposter/Esposter/commit/ecc8df8058defe76d56ea0f0dcdf035407732075))

* route ([11e4117](https://github.com/Esposter/Esposter/commit/11e41178b44bcb1ac53fe874e4b43ab46753e491))

* row ids and imports ([c7e1d66](https://github.com/Esposter/Esposter/commit/c7e1d661d964ec60a123a2773bd9b83ea92e8750))

* row to data ([a895194](https://github.com/Esposter/Esposter/commit/a895194cf878509451ad0d7415d4a77519ab5a04))

* rows ([d31d87a](https://github.com/Esposter/Esposter/commit/d31d87ad2049fd4db75a7bf554042c1f2586a8ac))

* rules ([b0db540](https://github.com/Esposter/Esposter/commit/b0db540cbdf0eb17bb01f6c0449bf1e238487978))

* rules ([8643d67](https://github.com/Esposter/Esposter/commit/8643d670b005cbe02e80c1005bd60fd85411363e))

* run with node context for server tests ([8d43e24](https://github.com/Esposter/Esposter/commit/8d43e2471360d28728f93de960fce02aafd3e894))

* safe parse and get the data from original values ([52108ae](https://github.com/Esposter/Esposter/commit/52108ae3a142ceb85daf38d18ef5f33b1f0e69c4))

* satisfies ([aeb7b1f](https://github.com/Esposter/Esposter/commit/aeb7b1f12e6775a98d002ce5d7e263874b7875cc))

* save to local storage ([6f29544](https://github.com/Esposter/Esposter/commit/6f295441998a090ca73df04921587ef4e053b338))

* schema ([000ee96](https://github.com/Esposter/Esposter/commit/000ee9651e80d41a65ce931b43b0a33f97e23d55))

* schema ([f645fcb](https://github.com/Esposter/Esposter/commit/f645fcb9ebc0127a16887fd6dfd81e38786432a5))

* schema ([9e12957](https://github.com/Esposter/Esposter/commit/9e129575ba5e2b148ffd8d5a5ae2c85879599f2f))

* schema ([f4d6e3f](https://github.com/Esposter/Esposter/commit/f4d6e3fcb5bff18c45d9863461f3a78f813d8fb0))

* schemas ([25faa77](https://github.com/Esposter/Esposter/commit/25faa77b566ecda5144a83383defc49bc46281d7))

* schemas and issues ([994c88b](https://github.com/Esposter/Esposter/commit/994c88bae9c46a64d211734163e0db10afd679bc))

* serialize and deserialize ([174e157](https://github.com/Esposter/Esposter/commit/174e157a27fea7d7d628ba15c67e15dd35d36fa5))

* shorthand syntax ([9cf3410](https://github.com/Esposter/Esposter/commit/9cf3410082a38337ae61a2ff5eda132b5ab7b440))

* shorthand syntax + types ([2e00494](https://github.com/Esposter/Esposter/commit/2e00494f50f3e16a7686bf998127027787298c1c))

* should be using edited item ([5ee3dd6](https://github.com/Esposter/Esposter/commit/5ee3dd638d1a153d72759f0a4f4895e94677619c))

* skills and comments ([0bbdbb3](https://github.com/Esposter/Esposter/commit/0bbdbb3e4f01d89c972706bb10923246491aca5a))

* slots ([91331f0](https://github.com/Esposter/Esposter/commit/91331f093e132b4b3c08f59f5ded4666a1971889))

* snapshots ([871a493](https://github.com/Esposter/Esposter/commit/871a4932020d6fef4e8d280ea81f3a3a99d53f1a))

* some types ([c3cdce5](https://github.com/Esposter/Esposter/commit/c3cdce50935fca52a4f236c5413cff0df3c055fa))

* some types ([e118569](https://github.com/Esposter/Esposter/commit/e11856941c7c2f6b5db145c4f74a443e05e6f68c))

* spacing ([8a1a36c](https://github.com/Esposter/Esposter/commit/8a1a36c0798cde3751e1b4bd94e1ba58524d16b8))

* structuredClone defaultColumn to fix reset button equality check ([b019c31](https://github.com/Esposter/Esposter/commit/b019c31be0cf5037886e1ea63ea7e4d2c567a0cc))

* styles ([7d24693](https://github.com/Esposter/Esposter/commit/7d24693bc67f0d5d06a8360e03920ebf4b1f3e79))

* styles ([fb61f41](https://github.com/Esposter/Esposter/commit/fb61f41bcbe8fe76e4df64d772e5ca47e24b0959))

* switch ([bd6d033](https://github.com/Esposter/Esposter/commit/bd6d033f49bf191ef13704a1d6af616ad61a2fa9))

* table editor ([186626c](https://github.com/Esposter/Esposter/commit/186626c80df36206cb4c2a2455d3f31a79dbe8df))

* table headers ([5c48c99](https://github.com/Esposter/Esposter/commit/5c48c99e6e41187ac2fa706e1f02b8c348be5670))

* taking names ([fd37549](https://github.com/Esposter/Esposter/commit/fd37549f17926e2f72b889100f55b37ef848f913))

* test ([f6d1ae9](https://github.com/Esposter/Esposter/commit/f6d1ae9977653a520efb949a0f5d8c4ed141adb6))

* test ([cac1ca8](https://github.com/Esposter/Esposter/commit/cac1ca81f1d45ad81b4000fb61a86322cf12a55b))

* test ([9d47e7b](https://github.com/Esposter/Esposter/commit/9d47e7b37d2694f66284ab49b1060a464125b8b9))

* test snapshot ([d4c833d](https://github.com/Esposter/Esposter/commit/d4c833d2a5e60327d5ca3a16582f965fdf1e1a4a))

* test snapshots ([f2a7d23](https://github.com/Esposter/Esposter/commit/f2a7d234ea72ac915cbe945ca25e80324c9171dc))

* test try stub window ([b94aa0d](https://github.com/Esposter/Esposter/commit/b94aa0d14d37eec9d3e9d6d04a6cb7a8472df4d8))

* tests ([6624823](https://github.com/Esposter/Esposter/commit/6624823eb76fd78d932ad85719cad86b0a709255))

* tests ([163d19b](https://github.com/Esposter/Esposter/commit/163d19bb54fcdffa9fcd5d056ad63432b0e09c06))

* tests ([7dd2c7e](https://github.com/Esposter/Esposter/commit/7dd2c7ea7f1065c5e5b26fb38290bf80efd3e691))

* tests ([e115221](https://github.com/Esposter/Esposter/commit/e11522187854bd28d2bfe1f2dd03e33233260dca))

* tests ([63b8796](https://github.com/Esposter/Esposter/commit/63b879680ba9cccac532bc709f3ae7559dc3d2c1))

* tests + lint ([9f7488b](https://github.com/Esposter/Esposter/commit/9f7488b3c7e8ea08079ea739fd1ce69e9d90eeb7))

* tests and table vue optimization ([ea6761c](https://github.com/Esposter/Esposter/commit/ea6761c23c0989bc389ffc526e11c74cdcdf9df9))

* text ([3983306](https://github.com/Esposter/Esposter/commit/3983306718b7d756720ec0fc823b438ddbd61a68))

* to raw deep ([34f653c](https://github.com/Esposter/Esposter/commit/34f653c6eb4c5427bc98e1bcdad0990765a3b965))

* toolbar color + no gutters ([f5acb2a](https://github.com/Esposter/Esposter/commit/f5acb2ac4cd2c80940da6d8e165baa48198e6586))

* tooltips ([137a261](https://github.com/Esposter/Esposter/commit/137a261701120c368de2c8aa63710d90f26aa789))

* try fix column schema ([eca2120](https://github.com/Esposter/Esposter/commit/eca2120721706996f7b1eab3bee16c0cf1105790))

* try mock indexed db ourselves ([f5ca32e](https://github.com/Esposter/Esposter/commit/f5ca32e0025c8910b8e51f3b7c729c0fc902e4d7))

* try remove resolved tags ([4b7d5ee](https://github.com/Esposter/Esposter/commit/4b7d5ee2b9695d862066b8627303e412f13425fd))

* try use env node ([b2cd207](https://github.com/Esposter/Esposter/commit/b2cd207cf6c9831400d2f1d14534512c58e6c19d))

* turn ws link back on ([8c59507](https://github.com/Esposter/Esposter/commit/8c5950744fda8c2b92441f8c868aa3566e30e424))

* type ([af662ea](https://github.com/Esposter/Esposter/commit/af662ea5ae591815899c8d18aba7c50ca0e197e6))

* type only imports ([6a56eb0](https://github.com/Esposter/Esposter/commit/6a56eb052e18e9c6571415ddec99ac3472b09033))

* types ([a397b84](https://github.com/Esposter/Esposter/commit/a397b846e856abfb48a4368768e33af182d8d2a4))

* types ([a960f37](https://github.com/Esposter/Esposter/commit/a960f37e570fc11c39721c501117ea279e90f164))

* types ([fa76547](https://github.com/Esposter/Esposter/commit/fa76547412e8d319474ac08388bfe7d56f069ba7))

* types ([5f1eeee](https://github.com/Esposter/Esposter/commit/5f1eeeec133d2c948d91364cd25ba45f9474be05))

* types ([f04268e](https://github.com/Esposter/Esposter/commit/f04268e5f8dbab18a784e9ecf275adbfb7038952))

* types ([6b4cd02](https://github.com/Esposter/Esposter/commit/6b4cd0231106280f1f5d2a994c3b13b5fd133eb8))

* types ([b23cc97](https://github.com/Esposter/Esposter/commit/b23cc97943810f9371208e48bedf2f3437bdba08))

* types ([fd16b50](https://github.com/Esposter/Esposter/commit/fd16b506dd1f4cf6eecbc0ce532acfbd44fa5958))

* types ([abec295](https://github.com/Esposter/Esposter/commit/abec29557276210ab2c867d0f718bf50ac143f63))

* types ([4e83f43](https://github.com/Esposter/Esposter/commit/4e83f438d554e990429920e5f7c059d417cd0a14))

* types ([77147d6](https://github.com/Esposter/Esposter/commit/77147d616ac90f4b56ee2444f54bdce32ae89b0d))

* types ([eb5405d](https://github.com/Esposter/Esposter/commit/eb5405dcc371b642860d57b50a3a61481c5e8c31))

* types ([28c9891](https://github.com/Esposter/Esposter/commit/28c98910b07073873008475a00598a241aecf856))

* types ([4ac6e7c](https://github.com/Esposter/Esposter/commit/4ac6e7c584b15ee11d21420d9cd8f91823b27971))

* types ([f2d8d24](https://github.com/Esposter/Esposter/commit/f2d8d245452acbe48afb24c1952545a5a29ad378))

* types ([09e2615](https://github.com/Esposter/Esposter/commit/09e2615925d7e6bdea26ff1184a94502ccb5d386))

* types ([8ebe2ad](https://github.com/Esposter/Esposter/commit/8ebe2ad74fa93e9c2e2513ae24616ea6264d505c))

* types ([bae1026](https://github.com/Esposter/Esposter/commit/bae1026b0d856328fd8c8fc718342989964481e3))

* types ([8f139eb](https://github.com/Esposter/Esposter/commit/8f139ebf1c6e1f556b6d4cf586d55db461e7b46c))

* types ([c713852](https://github.com/Esposter/Esposter/commit/c7138521b3d2b3d72ca68248a8eb0a2cb6fe6e52))

* types ([d0be21c](https://github.com/Esposter/Esposter/commit/d0be21c3ba626a94eb1b5f2e58cf8723008b9505))

* types ([8f4f376](https://github.com/Esposter/Esposter/commit/8f4f376eec3f85b0fc11b4c312af566308f8ccbe))

* types ([959070b](https://github.com/Esposter/Esposter/commit/959070bd1c88abc05bc11665487b10654a1d4cca))

* types ([e8f2081](https://github.com/Esposter/Esposter/commit/e8f208147ad05b0599b2e40de30ea163cadc7d53))

* types ([4006931](https://github.com/Esposter/Esposter/commit/4006931efa79140b76f831cfd108839e2844edb7))

* types ([14f831a](https://github.com/Esposter/Esposter/commit/14f831ac081c9db6f4cf63cb4f0ed67394c5ef98))

* types ([ec4a6c1](https://github.com/Esposter/Esposter/commit/ec4a6c10e9ac682b8fdda2ef6bb7e23bb5444ee3))

* types and ignore item metadata keys ([ea03c09](https://github.com/Esposter/Esposter/commit/ea03c09c41fda9da4f39d8e99233a663106a09c3))

* types and remove additional ([185c68b](https://github.com/Esposter/Esposter/commit/185c68baa54d99d3734a6d9e849468995b2d0af5))

* types and schemas ([4cc7f97](https://github.com/Esposter/Esposter/commit/4cc7f977a21465c517c20221db089b48fe44bbe3))

* types and test ([eb7f160](https://github.com/Esposter/Esposter/commit/eb7f16020d61fcffdb3a1cfb59ec32acd921e42c))

* types, concurrency and use online subscribable ([b4bf59b](https://github.com/Esposter/Esposter/commit/b4bf59bdfceeb741a75e35347ed6676ffb0e116c))

* udpate row ([863eebb](https://github.com/Esposter/Esposter/commit/863eebb9ebff3de8ef71cd03217a72a713e583a6))

* unnecessary meta ([c282ed9](https://github.com/Esposter/Esposter/commit/c282ed90b94858caa1305160e726cdf3d63be1d4))

* update bench ([0f70b39](https://github.com/Esposter/Esposter/commit/0f70b39bea102325ef5ea623f6d94c631a72872d))

* upgrade test ([18c499e](https://github.com/Esposter/Esposter/commit/18c499e15062ffd3a9c77960e69b206717daff66))

* use back type-based schema ([80f218c](https://github.com/Esposter/Esposter/commit/80f218cff4c9b014a01a20cef139263d7cb42959))

* use better icons for import/export ([568cb58](https://github.com/Esposter/Esposter/commit/568cb58541c884faad2481257e767d22a6170270))

* use boolean and date format value enums ([eae515d](https://github.com/Esposter/Esposter/commit/eae515dd266eb14ace8b88cd551a78199909abcf))

* use db schema user ([c36d76d](https://github.com/Esposter/Esposter/commit/c36d76ded6d4db54382468e5193968d374aa65b6))

* use mimetype in map ([803d13d](https://github.com/Esposter/Esposter/commit/803d13d27cadd06a14738b968f0a2218ed3e6897))

* use name as the source of truth ([f8d87ca](https://github.com/Esposter/Esposter/commit/f8d87caa99e8a86c752aad165339592c97608d8d))

* use store type ([ebf857e](https://github.com/Esposter/Esposter/commit/ebf857e34c17ea78f122e84ff49cd853da135d43))

* use type check instead ([17d41d9](https://github.com/Esposter/Esposter/commit/17d41d91d7db88d40d106e612fa51717e16459c4))

* vue-phaserjs ([fc702b0](https://github.com/Esposter/Esposter/commit/fc702b0484e1748ee2429088476ccf2cfc86e4df))

* watch occurrence ([f4c6eba](https://github.com/Esposter/Esposter/commit/f4c6ebaf5690cc51be038528c409064db5c85fff))

* wip ([22a4f23](https://github.com/Esposter/Esposter/commit/22a4f239c03cb3c16c3006919c595cc8d1f7c3ae))

* wip ([f13ee8d](https://github.com/Esposter/Esposter/commit/f13ee8d9591372720535df4e64c89cc003929a90))

* wip ([eb104e6](https://github.com/Esposter/Esposter/commit/eb104e64e98ebe7c79c92b1b7a581d0c420d489f))

### Features

* Add architecture ([b6bc9e4](https://github.com/Esposter/Esposter/commit/b6bc9e4bca19de775f1b904da6edb9755d792fcb))

* add back nuxt hints ([983b086](https://github.com/Esposter/Esposter/commit/983b0869ff768329dca9e324be35cb7fb10095d8))

* add bench json and add perf optimizations ([3e3f25d](https://github.com/Esposter/Esposter/commit/3e3f25d4d18d524ae30c68b978637c2cc934feea))

* Add bulk selection ([042acec](https://github.com/Esposter/Esposter/commit/042acec5cf4b050f6dacc2a51cddb099acc56046))

* Add column edit ([ab1c5ea](https://github.com/Esposter/Esposter/commit/ab1c5ea5e3f878211872b893a274de1a273ce0fc))

* Add column stats ([7e5e0cf](https://github.com/Esposter/Esposter/commit/7e5e0cf4177d2303ff74a5107b6832c9777edade))

* Add column stats outlier + chart preview ([4f98332](https://github.com/Esposter/Esposter/commit/4f98332720d40d78b206001e52b84c292b9caa62))

* Add computed ([da17656](https://github.com/Esposter/Esposter/commit/da176569c04afd77adffcacfb75aac6ddd17d7f0))

* Add computed ([2b1cffb](https://github.com/Esposter/Esposter/commit/2b1cffb891e0e53b414ecfb8370a15d2a9626896))

* Add copy and paste ([14b9dee](https://github.com/Esposter/Esposter/commit/14b9deeb0f8912ae8dbb8503ed0014264e76eb53))

* Add date column + stats ([641ec9b](https://github.com/Esposter/Esposter/commit/641ec9be42213cf1049355f6a70176460aa64e8d))

* Add draggable rows ([569439c](https://github.com/Esposter/Esposter/commit/569439c1085a67f36e714888b61777c193cddeec))

* Add export and import buttons ([664efc3](https://github.com/Esposter/Esposter/commit/664efc3a97500abc5a495b45a6de1ca10511318c))

* Add file table editor ([84ee0ec](https://github.com/Esposter/Esposter/commit/84ee0ece646952c58bb682ace78c0bdf0b831531))

* Add find & replace ([b4aaff4](https://github.com/Esposter/Esposter/commit/b4aaff4fed073c7be98c24c442048f2bd68afca5))

* Add hooks ([64de86a](https://github.com/Esposter/Esposter/commit/64de86ac6f2771832cdcc986ecbe3245130143e6))

* Add import/export butons ([2b7205c](https://github.com/Esposter/Esposter/commit/2b7205c7845b57563d8336c342f5d1a47081cc6b))

* Add indexed db cache ([8d5289f](https://github.com/Esposter/Esposter/commit/8d5289fae694dedda2ebbe405882b09c10d439c4))

* Add json ([6fe30ca](https://github.com/Esposter/Esposter/commit/6fe30ca94c1c028379c2ba4fd2a6519da5a1d200))

* Add normalize strings ([371744a](https://github.com/Esposter/Esposter/commit/371744ab11240871c46001614e503c4889d01cb7))

* Add oxlint type aware ([eb40e2d](https://github.com/Esposter/Esposter/commit/eb40e2d7da8c606c66053582284264e0fb3a2592))

* Add redo/undo ([546e6dc](https://github.com/Esposter/Esposter/commit/546e6dca70bb6603188093512dba6ae4eb9ae353))

* Add row number ([2b0fd7e](https://github.com/Esposter/Esposter/commit/2b0fd7ebe2a182f17cbaf3237307b23370a52dee))

* Add sanitize ([ffaa06d](https://github.com/Esposter/Esposter/commit/ffaa06d88654e9a02f250763f05efb0556f52458))

* add test ([80d43ef](https://github.com/Esposter/Esposter/commit/80d43efcf60a1b2c4e707043278e37debf2c85cd))

* Add tests ([12197fe](https://github.com/Esposter/Esposter/commit/12197fe2b1651fe8a71b88763f4369e7e57f7750))

* Add tests ([bf73daf](https://github.com/Esposter/Esposter/commit/bf73daf8b7202a90b073183d157d4216b41b312d))

* Add tests ([14c515e](https://github.com/Esposter/Esposter/commit/14c515e253d76d58f630dc855f2a89a9bc447442))

* Add toggle visibility ([aee14ef](https://github.com/Esposter/Esposter/commit/aee14ef32fee6b5e69a91e7f47b95262e6070764))

* Add vue-phaserjs tests ([cd2100f](https://github.com/Esposter/Esposter/commit/cd2100f5c7fd98c8932a48f22f5601d1bba6a905))

* Add vue-phaserjs tests and consolidated scene class ([cc800b6](https://github.com/Esposter/Esposter/commit/cc800b63cff283500e32f5910b669d2c56d34395))

* change to use property names for fully typed ([374d69b](https://github.com/Esposter/Esposter/commit/374d69bb6cce8270a4182469a0103353b7593ea4))

* fix up types ([4899e0b](https://github.com/Esposter/Esposter/commit/4899e0bf9b379d5b9122e3d10c57c9b6ed113010))

* fixup issues ([caf2dc5](https://github.com/Esposter/Esposter/commit/caf2dc561d734185e96d40a247d892561206eb6a))

* fixup modals ([b539c95](https://github.com/Esposter/Esposter/commit/b539c95c199c1f49b932b0ef0046de0328232d33))

* Implement description ([eef3986](https://github.com/Esposter/Esposter/commit/eef398675e5597774d99beebfd400e84c6c2ad5e))

* Implementing remaining features ([60519e2](https://github.com/Esposter/Esposter/commit/60519e2a9a71dfcb890a17428d820f9cafea168e))

* migrate to nitro with trpc adapter ([6f53490](https://github.com/Esposter/Esposter/commit/6f534908146609673e79f8a1a591eec75b4e4bb3))

* migrate to oxfmt ([e7a0212](https://github.com/Esposter/Esposter/commit/e7a0212f9ec18d7193c96cc6069ac6ecf168e8bb))

* more features ([742f013](https://github.com/Esposter/Esposter/commit/742f013be49663188afc64f461a8370d2e4b5e63))

* optimized get properties ([5d0989e](https://github.com/Esposter/Esposter/commit/5d0989edf40586db47880394e6fb104842c0dc72))

* refactor mimetype and cleanup dep updates ([80b9fd5](https://github.com/Esposter/Esposter/commit/80b9fd5d2158b2d38a1c99507c6aa0111c35afd1))

* refactor to classes ([cb5f774](https://github.com/Esposter/Esposter/commit/cb5f7741834e647af584ac9ce713eca4c400cd78))

* refactor to use mathjs expression ([7daca22](https://github.com/Esposter/Esposter/commit/7daca2299860a159aa40e9e1f079d4703c63dab8))

* render table diff ([79527b4](https://github.com/Esposter/Esposter/commit/79527b4f0f5b8764c74436ab6f64e7d85f82c54a))

* try adding custom rules ([7db9651](https://github.com/Esposter/Esposter/commit/7db9651ba3e1a71d22d99726cfb4798ebd872dce))

* update copy rows tooltip ([b95fb3c](https://github.com/Esposter/Esposter/commit/b95fb3c9b20cced485c9736edce4eaccef988740))

* update subset of columns ([2c73783](https://github.com/Esposter/Esposter/commit/2c737839106a252e41413b3fc05b380e602a4f35))

* update vuetify nuxt module ([54ea65e](https://github.com/Esposter/Esposter/commit/54ea65e2589448ecc8f91d47f7c0d07b7401193e))

* upgrade to better auth 1.5 ([46237d2](https://github.com/Esposter/Esposter/commit/46237d23f7a8e68cf85ac794c4d9c17ca4cff3ea))

* Upgrade to vuetify 4 ([8a44a15](https://github.com/Esposter/Esposter/commit/8a44a1514b81127bc629e4aef678c9243900c2e5))

* WIP ([828d7bd](https://github.com/Esposter/Esposter/commit/828d7bd249eacc42afc8f7f8fe9fdb69b5394086))

* xlsx ([d1346a0](https://github.com/Esposter/Esposter/commit/d1346a09f334e420865232ecad60e2cecffc0cc9))

### Performance Improvements

* optimize and add benching ([56e9e67](https://github.com/Esposter/Esposter/commit/56e9e6754092e1cda555e709a79aa81f10a56340))

## [2.19.2](https://github.com/Esposter/Esposter/compare/v2.19.1...v2.19.2) (2026-02-05)

**Note:** Version bump only for package @esposter/app

## [2.19.1](https://github.com/Esposter/Esposter/compare/v2.19.0...v2.19.1) (2026-02-05)

**Note:** Version bump only for package @esposter/app

# [2.19.0](https://github.com/Esposter/Esposter/compare/v2.18.2...v2.19.0) (2026-02-05)

### Bug Fixes

* add back test files ([7ed6168](https://github.com/Esposter/Esposter/commit/7ed6168d5c88bf1f7896593bf8171c8c8cd97d60))

* add back transpile ([f202230](https://github.com/Esposter/Esposter/commit/f20223041c58a9be20bb85c269ad20914de00c69))

* add comments and fixup takeOne to just be semantically the same ([d0f74d7](https://github.com/Esposter/Esposter/commit/d0f74d747bd63b968c2a6739fd8a3815430233f7))

* add layout + remove for unused props for now ([a6d7198](https://github.com/Esposter/Esposter/commit/a6d71983eaee56feca33c841b342b02820c86739))

* add more fixes ([01d99c3](https://github.com/Esposter/Esposter/commit/01d99c3999de559c97947d9548ee6d2926c2dc36))

* add todo ([8200943](https://github.com/Esposter/Esposter/commit/8200943c77705cfcc3ead98f5520942ff4dda906))

* circular deps ([c6aabb4](https://github.com/Esposter/Esposter/commit/c6aabb4e48263cc10e1b13abe521ac23da753ed1))

* cleanup to have interface in type folder ([e2ddc57](https://github.com/Esposter/Esposter/commit/e2ddc57fbaee004ae656c40aa18d13c06f83b13b))

* comment ([b6801c6](https://github.com/Esposter/Esposter/commit/b6801c68614fb170a1189c501996712f313e7d4d))

* dev command ([4b59de9](https://github.com/Esposter/Esposter/commit/4b59de9cf3129fbcadba9662407d47141aedaa02))

* dev env + profiler z index + no longer need to transpile trpc-nuxt ([cc7ba75](https://github.com/Esposter/Esposter/commit/cc7ba755c0244cb0b7716bbfe35c7510c97b4ed5))

* directly use index access instead of find boolean ([69fdae5](https://github.com/Esposter/Esposter/commit/69fdae5efd850805ce06595e973c90bed4ddb430))

* dispose renderer last ([4d6bcf0](https://github.com/Esposter/Esposter/commit/4d6bcf09d98521ebd4b7234b9627094cdfbdfdab))

* don't dispose renderer when we're using the inspector, it's not reliable sadly ([70a1a61](https://github.com/Esposter/Esposter/commit/70a1a61a6712f70e6863f1aa75ff91b8b4448cf8))

* don't throw if unauthorized ([a9fb19f](https://github.com/Esposter/Esposter/commit/a9fb19f0f5a1d2e076f55d1ba5d84d97f82af743))

* don't use watch handle on error ([4e64179](https://github.com/Esposter/Esposter/commit/4e6417919269c1dca70b2ebbba0f4ed7583a1bd1))

* events ([f813789](https://github.com/Esposter/Esposter/commit/f813789bcf9f7b9212cd08bbbfbcca560bc0f1f0))

* finally fix up all type issues ([179e963](https://github.com/Esposter/Esposter/commit/179e9639f3cfdf05e08aff88e4844748158f0a1c))

* globe material ([ff56b5a](https://github.com/Esposter/Esposter/commit/ff56b5a00c9f2ecc341ec110f4d73bc38584ba3c))

* globe switch back to webgl and fix up water normals texture ([1f54c11](https://github.com/Esposter/Esposter/commit/1f54c115e89ff4d6ecca059d91cb709c4e2a1def))

* imports ([3e82b87](https://github.com/Esposter/Esposter/commit/3e82b87a25d22e13040564ca911050dff99faa3e))

* init renderer ([5a14181](https://github.com/Esposter/Esposter/commit/5a1418164545c08239499779951128be83bc6b1b))

* inspector styles ([beae59f](https://github.com/Esposter/Esposter/commit/beae59f069357baf1b115569aecb1397b3857ef1))

* just dispose manually ([0ca77b0](https://github.com/Esposter/Esposter/commit/0ca77b02a7bf9d88f1bd8015db1aa03f81f09927))

* lint ([5b8b46c](https://github.com/Esposter/Esposter/commit/5b8b46ca0040cea474d7b6147fb096431949af93))

* lint ([e9c15a4](https://github.com/Esposter/Esposter/commit/e9c15a42d958fbc960ba343822808cd1ab6c92b3))

* lint ([8ae8505](https://github.com/Esposter/Esposter/commit/8ae850534e5ef18b8d86c1ab1813497775d4fc24))

* lint ([7ace84b](https://github.com/Esposter/Esposter/commit/7ace84b2f3add94d5f555c17d5f3751864f0427b))

* lint ([3d91154](https://github.com/Esposter/Esposter/commit/3d9115421346a98f3bc3791c4ae7c9f8febdd6be))

* make async ([e654b8b](https://github.com/Esposter/Esposter/commit/e654b8b614f7afec5f9e541ac719fbc00b12bc9d))

* material ([b0572b3](https://github.com/Esposter/Esposter/commit/b0572b3cf4800b495c94fda9696434a17df8709f))

* more cleanups ([2ccffef](https://github.com/Esposter/Esposter/commit/2ccffefe3592e991644609eb1d9d908b7923643c))

* oxlint ([3df2ec1](https://github.com/Esposter/Esposter/commit/3df2ec1ad17f36d77780656e27d3034cd3ac32de))

* pin vite ver for now ([71b41f3](https://github.com/Esposter/Esposter/commit/71b41f3084b8c38e9166ad894867c25c56475cf8))

* remaining type issues ([8d87ab9](https://github.com/Esposter/Esposter/commit/8d87ab99a01f59fd70a05a0980a3180416e15bd6))

* remove event ([0dd1132](https://github.com/Esposter/Esposter/commit/0dd1132d9f59b0dd09ceb72a93560925901e5658))

* remove page ([b287b34](https://github.com/Esposter/Esposter/commit/b287b34cf1d899b1c304c300eb74f549dbf43506))

* remove todo ([fb1b9c1](https://github.com/Esposter/Esposter/commit/fb1b9c1b1efcac210c7cfb39df13a5fc64c2faba))

* remove unnecessary checks ([5f9f9d7](https://github.com/Esposter/Esposter/commit/5f9f9d77eb125091e042ed7763972c33a21d4d64))

* render target ([68a2606](https://github.com/Esposter/Esposter/commit/68a260628b7771920de940075350830802a42493))

* replace with takeOne ([845c9ed](https://github.com/Esposter/Esposter/commit/845c9ed7d1fd9d8b9a4d5e730f2f92ad03e3085d))

* revert emoji changes ([4863e3a](https://github.com/Esposter/Esposter/commit/4863e3ac4bf237d8c48ccef49ce5a4e2d6f6db1a))

* settings ([97791c1](https://github.com/Esposter/Esposter/commit/97791c1ff2625eed0c85923f46542a9624b5f2d5))

* snapshots ([c12e75e](https://github.com/Esposter/Esposter/commit/c12e75ec5fc9e0756d7f9ccb0a3cc205050f8673))

* stick to old version for now ([d015e80](https://github.com/Esposter/Esposter/commit/d015e805c7504d9c62b9dd44323bb6a555a96f8c))

* texture disposal ([df7c6ab](https://github.com/Esposter/Esposter/commit/df7c6abf59d7e5c93f293aeb80277361ad58704e))

* todos and cleanup unnecessary vuetify plugin ([f8375ae](https://github.com/Esposter/Esposter/commit/f8375aea3a1187686e400292844975843bfa3df9))

* type ([af790ae](https://github.com/Esposter/Esposter/commit/af790aef9369ec23897e83c7fc167d8aa306ac8c))

* types ([5282fc2](https://github.com/Esposter/Esposter/commit/5282fc2d52e0164921aa553008e2438aa4b25423))

* types ([e5a09cb](https://github.com/Esposter/Esposter/commit/e5a09cb992a60d1ec5fcee7ff631d5e93ed28b1c))

* use back renderer ([b5bfee8](https://github.com/Esposter/Esposter/commit/b5bfee8c5dd372e397cb448973b33474637c747b))

* use post processing which is render pipeline ([c4d181d](https://github.com/Esposter/Esposter/commit/c4d181d34e0fe24839a552e12e391a5034259d75))

### Features

* Add fluid simulator ([6c37027](https://github.com/Esposter/Esposter/commit/6c370272187d3892c5bcf97ce6230fa8000d5248))

* Add orbit controls and dispose ([d416a5a](https://github.com/Esposter/Esposter/commit/d416a5a512d3c548ca461501922d55b32c81dd85))

* Add page ([d186eba](https://github.com/Esposter/Esposter/commit/d186eba58e1e8b1417d0831722876acfee3b67b3))

* Add stats ([40e9bc8](https://github.com/Esposter/Esposter/commit/40e9bc8a77012f0018dc64fb9477fb27f8be4cd9))

* migrate gem to tresjs ([4ecaa76](https://github.com/Esposter/Esposter/commit/4ecaa7625bbd2ce83a7f00915642881ed654c63f))

* test webgpu ([d1beadb](https://github.com/Esposter/Esposter/commit/d1beadbb2f3050ffa5d823fadccc0118e813d5b5))

* **test:** Add misc tests ([bcd0a9c](https://github.com/Esposter/Esposter/commit/bcd0a9c847f45a4686e126e2a10d5b8a9a704c10))

* **test:** add more tests + some refactors ([a0ec126](https://github.com/Esposter/Esposter/commit/a0ec12663c8b42ec91d6e87b949c7a21ce744cf1))

* **test:** Add some misc tests ([704bdca](https://github.com/Esposter/Esposter/commit/704bdca66fff695fee12bd2f507b99783eeb0336))

* **Test:** Add some more tests ([9adee7d](https://github.com/Esposter/Esposter/commit/9adee7da9ebc9f06bb0f8f959b2fb994c4ef800c))

* **test:** add some more text tests ([d6bec50](https://github.com/Esposter/Esposter/commit/d6bec5086b1e88c6829e04d49a2fb36dab27de75))

* **test:** Add some omit tests ([0a44737](https://github.com/Esposter/Esposter/commit/0a44737e9535ed6de24533d40a670e41cdffdd73))

* **test:** Add some pagination tests ([8fef0c5](https://github.com/Esposter/Esposter/commit/8fef0c51115d1a122bc975eaa5ff2509e0982d45))

* upgrade nuxt ([caed6cb](https://github.com/Esposter/Esposter/commit/caed6cbd85ea4c2ca32494d7e3e45f217ce568c2))

## [2.18.2](https://github.com/Esposter/Esposter/compare/v2.18.1...v2.18.2) (2025-12-10)

**Note:** Version bump only for package @esposter/app

## [2.18.1](https://github.com/Esposter/Esposter/compare/v2.18.0...v2.18.1) (2025-12-10)

**Note:** Version bump only for package @esposter/app

# [2.18.0](https://github.com/Esposter/Esposter/compare/v2.17.0...v2.18.0) (2025-12-10)

### Bug Fixes

* achievement condition tests ([96e4b71](https://github.com/Esposter/Esposter/commit/96e4b7189a7f256855cafbcd3ce200ba704dce21))

* achievement endpoints ([6ef007f](https://github.com/Esposter/Esposter/commit/6ef007f719946777d671e122634dfaffc807d953))

* add achievement definitions + only show achievement snackbar for authed users ([458b26a](https://github.com/Esposter/Esposter/commit/458b26afbcc53a9e391bb5380ecfc9437b7c004f))

* add achievement migration ([a81ea9a](https://github.com/Esposter/Esposter/commit/a81ea9a13e087b8181e9e83ab07b4269ed9f6e77))

* add auth middleware ([fb276e8](https://github.com/Esposter/Esposter/commit/fb276e8b963ac818d5e367ce4b7782dc6b53c0c7))

* add back type ([c3a32f6](https://github.com/Esposter/Esposter/commit/c3a32f6faf4eea2a13669181c28f40dedbfde86f))

* add idle state too ([ce0269b](https://github.com/Esposter/Esposter/commit/ce0269bb6dc44ca19e8c9669362c46bf48b334eb))

* add mathwhiz + fix up recursive get props ([294460d](https://github.com/Esposter/Esposter/commit/294460dde615386683fb7bd0de3c5bf0d8e55b90))

* circular deps ([e6e0da6](https://github.com/Esposter/Esposter/commit/e6e0da6fe47606c91e1c581078c401642c2d5112))

* cleanup edit form dialog closing to be optimistic ([da49b85](https://github.com/Esposter/Esposter/commit/da49b85a5231ed3e26a942ac7e1819ff2dcfd94b))

* cleanup error messsages ([ecb372b](https://github.com/Esposter/Esposter/commit/ecb372bbdc4642b005302b0fbca8d94feb5969b2))

* cleanup time config ([edd6130](https://github.com/Esposter/Esposter/commit/edd6130f3cb2719ac59cc7bcf2babd7e2b526091))

* cleanup watch queries ([5bb2cd2](https://github.com/Esposter/Esposter/commit/5bb2cd2469621daa258f29bfe6c514364637edb8))

* composable import types manually ([bdf9738](https://github.com/Esposter/Esposter/commit/bdf973858ce3fcde1f60804b6a70b0008796e7d3))

* definitions ([e7d2301](https://github.com/Esposter/Esposter/commit/e7d2301406c39b5cfd58e6537dd4f1786f1ffb3d))

* don't ssr achievement subscribables ([5ad1bd0](https://github.com/Esposter/Esposter/commit/5ad1bd067928fe9a42fdc73bd35bba73d4ef1b07))

* finally fix up vuetify type issues ([d6f4e82](https://github.com/Esposter/Esposter/commit/d6f4e826b633acb5dab8f41f5e6d132a3ae80e4f))

* finally upgrade nuxt ([8d14285](https://github.com/Esposter/Esposter/commit/8d14285bdb5fdd2f43b2ff0dd58f70d6aacae848))

* flush post for watch immediate ([abbe2ca](https://github.com/Esposter/Esposter/commit/abbe2ca1c7ea389c3613545855a8973019d38afb))

* hide horizontal scrollbar ([65873b2](https://github.com/Esposter/Esposter/commit/65873b2fde8979648063b339633baa6ac89d206a))

* icon size ([a6ef12c](https://github.com/Esposter/Esposter/commit/a6ef12ca4f5970f9bebf6d79195a925bd632510a))

* imports ([3ffef27](https://github.com/Esposter/Esposter/commit/3ffef27bac298a52c5812170ec89deee25dcc3e9))

* imports ([357ce4a](https://github.com/Esposter/Esposter/commit/357ce4a8f4a47f127bd0595af7565d5a85c7cde1))

* imports ([f953ac2](https://github.com/Esposter/Esposter/commit/f953ac249d0881c59e6dfaf2dc7f0581cb333c13))

* initialize achievements in notification instead which is global ([85d7fcf](https://github.com/Esposter/Esposter/commit/85d7fcf99078c8ed662ad76996b5e2a346e8ca54))

* just call it on mounted ([2ed353d](https://github.com/Esposter/Esposter/commit/2ed353da2e6ad3b356626abd475abdd9864f30c0))

* lint ([784f2ff](https://github.com/Esposter/Esposter/commit/784f2ff4fbf03930c2464639372467ac4ce730a7))

* lint ([a6effdd](https://github.com/Esposter/Esposter/commit/a6effdd1fdb781cfe1010758c19550480a365444))

* many type issues ([53a5f2b](https://github.com/Esposter/Esposter/commit/53a5f2b136538e2ce90bcb0318642ec803e28120))

* mapping ([86384b3](https://github.com/Esposter/Esposter/commit/86384b335f202e43103d8a899a2558ad10cdf9a0))

* more fixes ([fe2193a](https://github.com/Esposter/Esposter/commit/fe2193ab7831a3b9bc0eab12003f78175417eea1))

* move mic next to send ([66ed944](https://github.com/Esposter/Esposter/commit/66ed944d2cc5395a5ab079c6d02b441aa6dcfc40))

* move more types to shared ([6509541](https://github.com/Esposter/Esposter/commit/65095415e8099a230c7f30743dbfab58ff47fc22))

* move types to shared ([7f1885a](https://github.com/Esposter/Esposter/commit/7f1885a0516bb9a0df26670208e7b6ff4e21d387))

* on creates ([54e3106](https://github.com/Esposter/Esposter/commit/54e3106e02b873ade6c3766002b8624769b8f3ea))

* only close after it's been updated by store ([7c951d8](https://github.com/Esposter/Esposter/commit/7c951d830166f8f099e05e699eaee2334350322c))

* only include user achievement amount if it was already there ([dec67bb](https://github.com/Esposter/Esposter/commit/dec67bb91f59070782b537fb4543a909c61d6579))

* pin nuxt due to memory leak issue for now ([5c5e339](https://github.com/Esposter/Esposter/commit/5c5e339b8e42f1e9e0dfc9f4d38d202d204334cd))

* recently unlocked ([9b831e9](https://github.com/Esposter/Esposter/commit/9b831e9f5824e31c06bb3486561f0944c9f19103))

* remaining tests ([a0af85a](https://github.com/Esposter/Esposter/commit/a0af85af43f1c083cb7f864dba0ba3f88ecff6f0))

* remove unnecessary flush post ([c47a0af](https://github.com/Esposter/Esposter/commit/c47a0af70ecd14cef4809dcc8f453b64dfed8fc8))

* replace routes + fix handles ([fb1268c](https://github.com/Esposter/Esposter/commit/fb1268c67fb15d5d5e253ed5cdaa32ce0c6226a4))

* reset timer ([47d4820](https://github.com/Esposter/Esposter/commit/47d482090db7c9ba7111e05d8bb5e5677c2aa715))

* revert back ([a02dd7f](https://github.com/Esposter/Esposter/commit/a02dd7fb6cb4441d58909d2c06a8d9658af892d9))

* search click emit + refactor up some types ([6e7445d](https://github.com/Esposter/Esposter/commit/6e7445d3199106e69f83d2c8e32bc64853ad31eb))

* security allow mic ([f467ad9](https://github.com/Esposter/Esposter/commit/f467ad9c8f69275754554344fd08fc29766cc93a))

* tests ([b0ecf2f](https://github.com/Esposter/Esposter/commit/b0ecf2f4195bb7b4c93490a1a0c90689d9abea3f))

* tests ([b3429a7](https://github.com/Esposter/Esposter/commit/b3429a7b56e69563dc615682f1cdb0de5b171780))

* tests ([d8ef6b1](https://github.com/Esposter/Esposter/commit/d8ef6b18be98ad9fd333d24745c4e0761249b627))

* tests ([d0bcf61](https://github.com/Esposter/Esposter/commit/d0bcf610277db7f914056fab7144e75e418a451a))

* tests ([7867793](https://github.com/Esposter/Esposter/commit/7867793e6c2a9de51b55a4cca37b4181b1a20c6b))

* tests ([d23d73d](https://github.com/Esposter/Esposter/commit/d23d73d38979023be7731182be24578082bdefce))

* tests ([be2a1be](https://github.com/Esposter/Esposter/commit/be2a1be6c92da786751c3c58cbbbf4da0a671912))

* trpc path types ([b7a31c4](https://github.com/Esposter/Esposter/commit/b7a31c4a288b55ebb480ad112facfb04517e6b51))

* type ([18639b8](https://github.com/Esposter/Esposter/commit/18639b85cd808b8f25343b00d49aa208d97a04c5))

* types ([75e163b](https://github.com/Esposter/Esposter/commit/75e163b82db750c6f3aee773c58d70a44d88d156))

* types ([8e56201](https://github.com/Esposter/Esposter/commit/8e56201f09bb7dbc9740c59aa3ac63bcda5d624d))

* types ([8cedb39](https://github.com/Esposter/Esposter/commit/8cedb39bd5bd4eb51e3a048fdb1ddd97559f28e8))

* types ([02db3d1](https://github.com/Esposter/Esposter/commit/02db3d1deb61bf2959e090088bea6b7abb6409ad))

* types ([aada69f](https://github.com/Esposter/Esposter/commit/aada69f31c3e199bd814e013883462b0b7f7fcd5))

* types add verbatim module syntax for server ([8950237](https://github.com/Esposter/Esposter/commit/895023768f73536347032bcee7c6e7ffc72d383a))

* types and definitions ([5e26573](https://github.com/Esposter/Esposter/commit/5e26573953ece560c67e5d29cfbd642a1b723dc6))

* UI ([9932f85](https://github.com/Esposter/Esposter/commit/9932f851fed7465e563e54bc8ab7d8ba16eac403))

* update no data text ([f0c020d](https://github.com/Esposter/Esposter/commit/f0c020dce5d9f3f506925f265811f36cbd995320))

* upgrade nuxt ([8efd8ec](https://github.com/Esposter/Esposter/commit/8efd8ec25668f5b41d5184bcc925e270ece05bce))

* use esm imports ([e583736](https://github.com/Esposter/Esposter/commit/e5837369bff15c20868d9486d93bf5192c48c58c))

* use plugin instead to define context ([f31affa](https://github.com/Esposter/Esposter/commit/f31affa15ed984590c96176ec6c5ce1d3e5c581e))

### Features

* Add achievement definitions ([97accb3](https://github.com/Esposter/Esposter/commit/97accb397c869a649855cff7b486b6c6a46de8bc))

* add achievement notifs ([3715a82](https://github.com/Esposter/Esposter/commit/3715a82a8b86e639cec8ad41f650763077f33268))

* Add achievements ([b77aa1d](https://github.com/Esposter/Esposter/commit/b77aa1d74af96d1e1445b94417f798b69464a1e4))

* add activity plugin ([75aab58](https://github.com/Esposter/Esposter/commit/75aab58238f9a64954c2cff870f3a5ffc1536f01))

* Add endpoints for user room settings ([316ccff](https://github.com/Esposter/Esposter/commit/316ccff0a3fb23f701778b1004a1af0bf0d7de34))

* Add more definitions ([4d8e17d](https://github.com/Esposter/Esposter/commit/4d8e17d00457ffe5efcbf2bea10c8e11946446e5))

* Add more definitions ([59623cf](https://github.com/Esposter/Esposter/commit/59623cf708634b9c9c2b7cda75dafde61bf6142c))

* Add notification settings as menu ([d936424](https://github.com/Esposter/Esposter/commit/d936424a0a32b4e16171d602d25d43749c954dc2))

* Add notification settings button ([0f49913](https://github.com/Esposter/Esposter/commit/0f49913a0190ea3784e549a0264ef3711d06338c))

* Add nuxt hints ([0584c6c](https://github.com/Esposter/Esposter/commit/0584c6c42ca405e0f9e37a2207424ad1e260d3dd))

* Add on updates test ([2580849](https://github.com/Esposter/Esposter/commit/2580849a008c70e3c68d1244727e9a0402b83f81))

* Add procedure type ([b63f37d](https://github.com/Esposter/Esposter/commit/b63f37d1512c5a85265527e209580379f33eebda))

* Add recursion ([ab86cae](https://github.com/Esposter/Esposter/commit/ab86caeee85d75db76bcf0baf20077082d888eae))

* Add subscribable ([7a6d9c1](https://github.com/Esposter/Esposter/commit/7a6d9c1e3d49d9a332a70553407e219c24554c24))

* Add switching bell icon ([e576b2c](https://github.com/Esposter/Esposter/commit/e576b2c08ca946af8335aa6be62cbd8aab149be7))

* Add tests ([7edbcff](https://github.com/Esposter/Esposter/commit/7edbcffb419dcd3501814bb25a9138e0e60ce9e5))

* Add tests ([3cdf15e](https://github.com/Esposter/Esposter/commit/3cdf15e45670b4b6f2d1895d8b07c353fc8a4e53))

* add trpc paths ([aff1d52](https://github.com/Esposter/Esposter/commit/aff1d52da642e79212e121056f4905be9e17c117))

* Add voice record ([320ca16](https://github.com/Esposter/Esposter/commit/320ca16b4179329ac7a1cb34d3311b1eccb12164))

* finally complete insane type-inference for endpoint paths ([6233094](https://github.com/Esposter/Esposter/commit/62330944a7296353921bd4fc03983e69ad704e22))

* fix up the UI to be nice ([a02a4ae](https://github.com/Esposter/Esposter/commit/a02a4ae84884fee5824a22caf0f57a8da845394f))

* make achievements hidden ([a5f4824](https://github.com/Esposter/Esposter/commit/a5f48240891ce39bdcd44983d392148d9cf44703))

* opt-in to env api ([24721f6](https://github.com/Esposter/Esposter/commit/24721f6e88bd9b8af5da0bdfc01e70234247df23))

* Support multiple snackbars ([d6a7c7a](https://github.com/Esposter/Esposter/commit/d6a7c7a86ff54c1f1198c7900751b10a14965d33))

* **test:** Add push subscription tests for push notifications with settings ([15ca319](https://github.com/Esposter/Esposter/commit/15ca3190e2a52e41885f65741799057127d0b2e9))

### Performance Improvements

* batch achievement updates ([9e993cd](https://github.com/Esposter/Esposter/commit/9e993cdbd0bd269941ee85ff2b95ea50a2996959))

# [2.17.0](https://github.com/Esposter/Esposter/compare/v2.16.0...v2.17.0) (2025-11-03)

### Bug Fixes

* add back standard message entity ([dc03657](https://github.com/Esposter/Esposter/commit/dc03657a721334d1800d29f855189888ebce31fc))

* add perfect service worker code ([1fba7ee](https://github.com/Esposter/Esposter/commit/1fba7eebd1c7cd2aff4c26f3f8c80743e304a374))

* add rail to navbar for mobile ([da791a0](https://github.com/Esposter/Esposter/commit/da791a09ea5fcfa76c9715ae6db0c055ad472832))

* bunch of todos, refactor to use consistent count variable, add tests etc ([bbc559c](https://github.com/Esposter/Esposter/commit/bbc559cf66daaaef62eefe56bdf8f1cff1b1bb8e))

* close dialog ([f87ae0f](https://github.com/Esposter/Esposter/commit/f87ae0fc2617bd821accb3d89db528bf68d86cb5))

* don't send notif to self ([eb5be0d](https://github.com/Esposter/Esposter/commit/eb5be0dece285943425a09199ac6a5a74f701bfd))

* emit types ([2a8b296](https://github.com/Esposter/Esposter/commit/2a8b296049c395c6525c293faec38198ce067101))

* enum value ([6a14e3f](https://github.com/Esposter/Esposter/commit/6a14e3ffa2d2277184eddf856061eaaa0cc59568))

* finally fix up members ([bfdbbe1](https://github.com/Esposter/Esposter/commit/bfdbbe1cefd78963b402e2c83c3a5655668dc556))

* just define model value as Date | null ([d4174f1](https://github.com/Esposter/Esposter/commit/d4174f14ea8d106b56364df6ab924f7d8b5fde7b))

* just use back ref type ([2d4936f](https://github.com/Esposter/Esposter/commit/2d4936f5517e80a12e233964427321a6e8a8cef7))

* lint ([7f61b6c](https://github.com/Esposter/Esposter/commit/7f61b6c99005456b1608c3a1ca756d5bcd0b88bc))

* lint ([6ca4a32](https://github.com/Esposter/Esposter/commit/6ca4a324b503d10c63fca4b65914035318343af7))

* move rate limit to backend api ([ba62838](https://github.com/Esposter/Esposter/commit/ba6283886ea1407bc68fa7b26b070a03ff98c2ec))

* not need for async ([bb7c129](https://github.com/Esposter/Esposter/commit/bb7c129e30eb05f6921b73934e73b8844341e0db))

* post message ([ac0f451](https://github.com/Esposter/Esposter/commit/ac0f45147252e3ea799f96f7c1c92eda75877f94))

* properly await ([157d6c0](https://github.com/Esposter/Esposter/commit/157d6c02b75aa024ee7c40a20ebae00862aa26e0))

* props and rail if not desktop size ([e7ff672](https://github.com/Esposter/Esposter/commit/e7ff672c47f5b02acd3c76ebe6fe57d93acd748b))

* proxy to writable computed ref properly ([bc4f3db](https://github.com/Esposter/Esposter/commit/bc4f3dbaee5635df42fe7efaf30d97c9a81a3e39))

* proxy webhook request ([5954c95](https://github.com/Esposter/Esposter/commit/5954c95b326b85aa091e17d595fd50dd908a73b4))

* revert back to using lists for absolute accuracy ([a9fb13f](https://github.com/Esposter/Esposter/commit/a9fb13f1fc5b80411c8d5180f1b0e2950be85d7f))

* service worker ([b993dac](https://github.com/Esposter/Esposter/commit/b993dac2a4c1da8a88694f8b1e121cc3cc970cdb))

* service worker ([71251ef](https://github.com/Esposter/Esposter/commit/71251efc2675626aca41bf0dd1068e5822078ed2))

* types ([3df2267](https://github.com/Esposter/Esposter/commit/3df22674c6632c90d235636e2e6fe901172d13fe))

* types ([511fec7](https://github.com/Esposter/Esposter/commit/511fec7d8eb414c3f6a22b803963754a3b1fa48f))

* unsubscribing ([b293d47](https://github.com/Esposter/Esposter/commit/b293d47769529212a84628a06f1b0be3bedcf676))

* update to plural ([85aae3c](https://github.com/Esposter/Esposter/commit/85aae3c3b83fbc554b3e74894179b7ac0bc00294))

* use proper global routerules config ([d52f7ab](https://github.com/Esposter/Esposter/commit/d52f7aba0ae6ef9c6e4f51f9b5f29cdd5fec1fc4))

* webhook to be based on room id ([4f0a701](https://github.com/Esposter/Esposter/commit/4f0a7019cad8061bff1077711ff708434cb56283))

### Features

* Add message client middleware ([f2324c5](https://github.com/Esposter/Esposter/commit/f2324c585142df7741dc99acbb19eb229f69497f))

* Add mock queue client ([079340a](https://github.com/Esposter/Esposter/commit/079340a01b61f47cb0ac753cc811de5676dc0e65))

* Add queue pushing ([5bf052a](https://github.com/Esposter/Esposter/commit/5bf052a89762871279ce4c310d11c6060097cf45))

* migrate to event grid instead of storage queue ([6987115](https://github.com/Esposter/Esposter/commit/69871155a7f1114cb62229173c4c70a7f3ce1d81))

# [2.16.0](https://github.com/Esposter/Esposter/compare/v2.15.1...v2.16.0) (2025-10-19)

### Bug Fixes

* actually use the composable ([2e53bda](https://github.com/Esposter/Esposter/commit/2e53bdad694e214e7b998f332b78fb6450e7e446))

* add files ([90585b7](https://github.com/Esposter/Esposter/commit/90585b731433c77ba7f31e2cb171509d0a5e64e9))

* add forward map + remaining badge ([2dfafbe](https://github.com/Esposter/Esposter/commit/2dfafbe400a90f0cc5c707b568fc7ef04da7b2de))

* add get web pub sub client url ([f5e8b6a](https://github.com/Esposter/Esposter/commit/f5e8b6a53ca14edcbfef1efc3175ad9c053b4ee8))

* add is creator and name slots activator to be consistent ([886033f](https://github.com/Esposter/Esposter/commit/886033f6669c0555852a96b3d17b4f7b4256407b))

* allow delete webhook for creators ([800e9d2](https://github.com/Esposter/Esposter/commit/800e9d2018271833d9b791b67a2ec49c0c1a70da))

* better split between webhook messages and standard messages ([e73a83c](https://github.com/Esposter/Esposter/commit/e73a83c8abdea17047523594507155149d895923))

* cleanup create btn to use styled button ([b860675](https://github.com/Esposter/Esposter/commit/b860675e18eeceb9994bffce50fc034a445bdc25))

* cleanup queries to only select required columns ([45499bb](https://github.com/Esposter/Esposter/commit/45499bb60cd521c3d96c67f82d9d3b7ebf62f5d2))

* constructor ([292e9b5](https://github.com/Esposter/Esposter/commit/292e9b502d5af9e951276bda81f72f1bad65d431))

* container should be fluid ([00ad1f6](https://github.com/Esposter/Esposter/commit/00ad1f6232c70dcbe5d259081fdd57ab49428e83))

* don't need to stringify in send to all ([4e7a409](https://github.com/Esposter/Esposter/commit/4e7a40973c9b40da8e068a44e529965072462862))

* endpoint to be a url ([904ad02](https://github.com/Esposter/Esposter/commit/904ad020918dfbb06f08481e6496dc81f35bb691))

* finally only show settings button if creator ([d4d025f](https://github.com/Esposter/Esposter/commit/d4d025fd6bdb2418b2bb608b88d4c26d88e32c31))

* getBlobUrl ([a1e5281](https://github.com/Esposter/Esposter/commit/a1e52810d0ba498fb387f2ef4967e659e76a9111))

* include webhook messages ([7ab137c](https://github.com/Esposter/Esposter/commit/7ab137cd50038ba3e65e0feb8188b00af327452e))

* instantiate class based on type ([c2ca9f7](https://github.com/Esposter/Esposter/commit/c2ca9f7cb55baab5a1f3d3f37645b613b5a57d46))

* join on connect ([aee62c9](https://github.com/Esposter/Esposter/commit/aee62c9fba8d65844bcb2e3f1b0723ebccd9e527))

* lint ([c9085c0](https://github.com/Esposter/Esposter/commit/c9085c0a90df7c95191da7727a2a907eabcdbd12))

* lint and remove unnecessary type cast ([7870709](https://github.com/Esposter/Esposter/commit/7870709d4230bb9051cc0d5b51664634337593c5))

* make creator message type agnostic ([3295d32](https://github.com/Esposter/Esposter/commit/3295d32d82e34f80dd460b37dfb78623493e2c7c))

* make creator message type agnostic in server as well ([c329d57](https://github.com/Esposter/Esposter/commit/c329d57df58367751e68d6323696fdd5be8e1106))

* make getting env function so it is always latest ([9b11dd5](https://github.com/Esposter/Esposter/commit/9b11dd5e6ec352913050100bd50da0575c6875a6))

* mocking base url ([776ca09](https://github.com/Esposter/Esposter/commit/776ca091d4d145e7c4c000a11fca7997cfa20b49))

* most of env ([9ac50f9](https://github.com/Esposter/Esposter/commit/9ac50f925b92c64cac1e6d9ef27fb46f5d2ef2af))

* move components over ([fe5c5d9](https://github.com/Esposter/Esposter/commit/fe5c5d9ee372116830e3239ad8319b3f241bbf2a))

* move shared code to db-schema away from server code ([610c70e](https://github.com/Esposter/Esposter/commit/610c70e1b5bbbb831f622877bf35fd0ddb48fa56))

* move types to shared ([3c6dfdc](https://github.com/Esposter/Esposter/commit/3c6dfdccf651ed3d1201e461e1606e4f61f3ec04))

* only disable webpush on localhost ([8c165f0](https://github.com/Esposter/Esposter/commit/8c165f0404249f84f206c68337ee4516dfabcb44))

* polyfill instead ([ec78635](https://github.com/Esposter/Esposter/commit/ec786351f8f36adcd39ae26af7ddeb8168fff741))

* put back the environments ([3ea1f39](https://github.com/Esposter/Esposter/commit/3ea1f39fe69d86c3c35fd84ec412079e4b013f60))

* reading messages by rowkeys ([62607d2](https://github.com/Esposter/Esposter/commit/62607d2770bd970797d6e16f795feb26155e75b8))

* recompute pos instead ([58d4ef3](https://github.com/Esposter/Esposter/commit/58d4ef33505dd88d7e8f2a87c2ce3d989d9e4343))

* remove profanity from message ([a54bd0a](https://github.com/Esposter/Esposter/commit/a54bd0a25d42cf5677a46082166612753c4938c6))

* remove unnecessary inject ([ea81643](https://github.com/Esposter/Esposter/commit/ea8164303338652e71b07ee317f150878eef7083))

* remove unnecessary watch ([ecc3273](https://github.com/Esposter/Esposter/commit/ecc32734e4178567849ca5b6cdb187a5407e6280))

* rename folder casing ([1ccbd62](https://github.com/Esposter/Esposter/commit/1ccbd629a418bd496c3d3a658250819827891241))

* revert forward map ([3e6e78c](https://github.com/Esposter/Esposter/commit/3e6e78c0243060bfd2e68a7c90e4ab673e648fd6))

* revert scrollfactor ([fe88b6f](https://github.com/Esposter/Esposter/commit/fe88b6f4407aaceee9c2dc70029434589aae2367))

* set scrollfactor of menu ([bb8860f](https://github.com/Esposter/Esposter/commit/bb8860f35ff4113a083c778e6902b6d009d19f5b))

* tests + add validation ([2a3f6f4](https://github.com/Esposter/Esposter/commit/2a3f6f4a33d2261fae776057a0d52cd9310c80b0))

* try adding scrollfactor to container ([6cc27f5](https://github.com/Esposter/Esposter/commit/6cc27f509a570a9fd6ff964e6892209dec542427))

* try test class ([fdf942a](https://github.com/Esposter/Esposter/commit/fdf942a960f58e5dea0ca1eaf3b855c91c688cc8))

* type and reduce host logs ([3f01b23](https://github.com/Esposter/Esposter/commit/3f01b23a691401284d04e6f80bd9291c587210ef))

* unify creator ([88aeaa6](https://github.com/Esposter/Esposter/commit/88aeaa6d21a790516dfab92a1dd06dc9ab2f17df))

* use app env instead ([ac502f2](https://github.com/Esposter/Esposter/commit/ac502f2fe432487c5253523857c7442bf0b9ada3))

### Features

* Add app user badge ([b359e34](https://github.com/Esposter/Esposter/commit/b359e3439d3c7aca1f2c1c2c425d0f71f97865f6))

* Add app user tests ([ebbbfcb](https://github.com/Esposter/Esposter/commit/ebbbfcb425ffffc96014819a5cb41bd2de32d183))

* Add forward map + fixup to use creator ([20781c0](https://github.com/Esposter/Esposter/commit/20781c0a3eb38d9e311eeb25a8cf3a45682f180b))

* Add reading app users by ids ([cf7c1f5](https://github.com/Esposter/Esposter/commit/cf7c1f5f2dd0014c3f0afa9550fc20cfc76fe9d5))

* Add UI ([7b230ae](https://github.com/Esposter/Esposter/commit/7b230aec56077a247372d0cb9aafa0700dfc394b))

* Add web pubsub ([bf65e17](https://github.com/Esposter/Esposter/commit/bf65e170039e7307b9ec24792176b883206dbeb8))

* Add web push to azure func ([cda5d52](https://github.com/Esposter/Esposter/commit/cda5d529235d8d317fb9cd615969cfd68443e697))

* Add webhook UI ([68db86b](https://github.com/Esposter/Esposter/commit/68db86b98a9faebc666e1f7e86ee7cdcf0115597))

* cleanup some webhook UI ([fc46c5e](https://github.com/Esposter/Esposter/commit/fc46c5e59d90d47eb3e09d361326716e23666672))

* switch rate limiter for diff endpoints ([bc50ccd](https://github.com/Esposter/Esposter/commit/bc50ccdf36bfdfd713c1082e01f2b352362874e9))

## [2.15.1](https://github.com/Esposter/Esposter/compare/v2.15.0...v2.15.1) (2025-10-10)

### Bug Fixes

* imports ([8814647](https://github.com/Esposter/Esposter/commit/8814647903a4d6d200ea195d5f7ed0e65b7545d2))

* lint ([dce643a](https://github.com/Esposter/Esposter/commit/dce643a4389e35445167122d214403e31ed47166))

* lint ([a86f226](https://github.com/Esposter/Esposter/commit/a86f22607293dfc151dbffc1d5a05bd1b3376456))

* migrate schema ([df55198](https://github.com/Esposter/Esposter/commit/df55198279c3cfd62913bc2e959287fe82d0d0d2))

* provide js version for nuxt config ([4c7bdac](https://github.com/Esposter/Esposter/commit/4c7bdac0c60c15001efb69d90e194fb77d957ead))

* schema ([6869f80](https://github.com/Esposter/Esposter/commit/6869f80e081eb0e3c594c500b81b6d2733d460bc))

* split to db-schema pkg that is browser-friendly ([549fcac](https://github.com/Esposter/Esposter/commit/549fcacfe755039fb2a85e17baaa11f2ddfc6d4f))

* tests ([cfb9a92](https://github.com/Esposter/Esposter/commit/cfb9a92579f4a591be9cd0aac3a7f4cecfd8e26f))

# [2.15.0](https://github.com/Esposter/Esposter/compare/v2.14.0...v2.15.0) (2025-10-09)

### Bug Fixes

* abort before adding new controller ([f1564b0](https://github.com/Esposter/Esposter/commit/f1564b09c0ae742b6c2dba0e66387b7c743d51b0))

* Add abort controller + remove unnecessary cursor searcher ([781ec1a](https://github.com/Esposter/Esposter/commit/781ec1a9db05f2d63bca3745c083359098296ffd))

* add back missing migrations ([091c8e5](https://github.com/Esposter/Esposter/commit/091c8e5753d190f6296431641b5c692b01e00c58))

* add back route change + fix up edit form overflow ([06b69f9](https://github.com/Esposter/Esposter/commit/06b69f97f8e8a86cff59ff667ceac719ee3e2684))

* add back skeleton item ([4b09887](https://github.com/Esposter/Esposter/commit/4b0988740cd380e8252f07ac1e359b4a3ee507ee))

* Add mentions to params ([154741c](https://github.com/Esposter/Esposter/commit/154741ce561ca12ee7bbf0ae777dae101ee1970f))

* add more sensible rate limit defaults ([6849046](https://github.com/Esposter/Esposter/commit/6849046070c1689566552308cb9d03112140f27f))

* add onComplete ([9819a44](https://github.com/Esposter/Esposter/commit/9819a44a3b2396a9f47c4ccc9a371db3620ef2cf))

* also watch for session value ([a102747](https://github.com/Esposter/Esposter/commit/a102747081cbd92cddd4046bf1c92c54732c76a2))

* always add the bottom offset ([94cb808](https://github.com/Esposter/Esposter/commit/94cb8089b34fad8bd8a8fb65af3a29129ac87ef5))

* apply effect on mounted instead ([2d9bd3b](https://github.com/Esposter/Esposter/commit/2d9bd3b7d35745460bec4a3bce8822f1e0fec7ee))

* call abstracted create message fn ([f3f77a6](https://github.com/Esposter/Esposter/commit/f3f77a686e5ded515023ba973b7f22cda620457e))

* change to accomodate types ([8bd92a0](https://github.com/Esposter/Esposter/commit/8bd92a0441253ff0c3136ca6e8783b65a09b5b1f))

* cleanup dates to be based on today/yesterday/earlier ([64d77ed](https://github.com/Esposter/Esposter/commit/64d77ed6f1f38f72f3fc6bca02ccba159b58c88e))

* cleanup remaining v-btn styles ([f1946c2](https://github.com/Esposter/Esposter/commit/f1946c2bc4ed4b028d2cf3b39fcef1bc17dda703))

* close menu when searching ([730a915](https://github.com/Esposter/Esposter/commit/730a915a32ae1586c0600f8adba5833f4509042d))

* comment out unsupported filter types for now ([52e01fc](https://github.com/Esposter/Esposter/commit/52e01fc42646113d846dca85ce3a9c5f3d680e5d))

* comment out unsupported filter types for now ([794c475](https://github.com/Esposter/Esposter/commit/794c475ed5ceec72dbc4d5002e0c17ca31d4beb5))

* condition ([1a52f88](https://github.com/Esposter/Esposter/commit/1a52f88aa9f39e80f27aa96999585e673fb64604))

* crazy fix to fix the layout structure ([288d7c6](https://github.com/Esposter/Esposter/commit/288d7c66f074029dc42e5b5cbf7e9c8bbd18dfcb))

* date filter value ([f34de46](https://github.com/Esposter/Esposter/commit/f34de46c2197e41589d82dbab1c3186287ec8422))

* date picker and use iso strings ([73f30e4](https://github.com/Esposter/Esposter/commit/73f30e4c0e3073a4ad1a76db5f7ef249a3412c40))

* default slot values + remaining style fixes ([918bbc8](https://github.com/Esposter/Esposter/commit/918bbc807efb9ebaefb88a5ffc214690558f1547))

* default value of rowKey should be undefined ([fbd81af](https://github.com/Esposter/Esposter/commit/fbd81af2056e335948afeef37dfd5784645147a6))

* deserializing key + make checking length consistent ([736f771](https://github.com/Esposter/Esposter/commit/736f771406a70640b1d81f028e29097aeeb26a5a))

* don't have update/delete actions for non-normal messages ([188bf41](https://github.com/Esposter/Esposter/commit/188bf41c8fa59d5e01a37dacad98e1e00eca7bda))

* don't use runtimeconfig for db ([7816dc4](https://github.com/Esposter/Esposter/commit/7816dc477d6334ef6d65c19dc65f44320edd9e4d))

* editable name button ([bde8b0c](https://github.com/Esposter/Esposter/commit/bde8b0ce8ecdef8a32b5ed2aee7b505de0f2b714))

* finally fix up remaining table filter predicate issues ([ae864b9](https://github.com/Esposter/Esposter/commit/ae864b991fae6b29969ee43935666351da36ce17))

* handle both date and strings since it returns string when read from search history ([3f54885](https://github.com/Esposter/Esposter/commit/3f548851d0d477c0f1477826fe4a7bdac0bb9b23))

* hide picker on preview + update constants name ([04b64ff](https://github.com/Esposter/Esposter/commit/04b64ff06e694227ebbea79d9379cb0e24fb5579))

* lint ([7084e07](https://github.com/Esposter/Esposter/commit/7084e07ba62aba240b1600402f2c3f3afcdbf222))

* lint ([437f01f](https://github.com/Esposter/Esposter/commit/437f01f31e381d85717db8e97b5e29d516bf92d8))

* lint ([6da6b6c](https://github.com/Esposter/Esposter/commit/6da6b6c65db459e9682afe834e7f6064749227b0))

* lint ([c9c697a](https://github.com/Esposter/Esposter/commit/c9c697ac7efb5b83a3e19586da41a8b5f0013640))

* lint ([19c81d7](https://github.com/Esposter/Esposter/commit/19c81d7ba3254365d5d7f00dd384e736d56449fc))

* lint ([8a2bc17](https://github.com/Esposter/Esposter/commit/8a2bc17f1e35723652c404307f76dc0b96b46113))

* lint ([e14456a](https://github.com/Esposter/Esposter/commit/e14456aa5db23ee5fe3150f4dfe753241354e9ce))

* lint and condition ([8a3fce8](https://github.com/Esposter/Esposter/commit/8a3fce886fdb895b4a461b6cb3b130615b136590))

* lint and plugins ([402e1fc](https://github.com/Esposter/Esposter/commit/402e1fc09ec98e74f91f05593892a80a1f7b16e4))

* make bottom offset dynamic based on element ([198ff07](https://github.com/Esposter/Esposter/commit/198ff07b0113b0f6638af18a1090dfc125fad477))

* members operational data ([67f827b](https://github.com/Esposter/Esposter/commit/67f827b21c2ab6a06520a8484fd9293c394d78bb))

* message metadata + tests ([56a7c73](https://github.com/Esposter/Esposter/commit/56a7c739f6d5beae7214a0172668a1018523daa2))

* migration folder paths ([1f10e76](https://github.com/Esposter/Esposter/commit/1f10e761f56f717f2b4db02d8553aac0c3f79dd6))

* move back insert ([ccca6bf](https://github.com/Esposter/Esposter/commit/ccca6bf6f3e96eef65b429fd808522c79f056e79))

* move deps back to respective packages properly ([5a55e2d](https://github.com/Esposter/Esposter/commit/5a55e2d29f3de9d88bb68779780e983e9388457f))

* offset on non-desktop screens ([f481292](https://github.com/Esposter/Esposter/commit/f481292a3cfeca3102a5f066d313464f651f25c2))

* offset pagination data ([45e4b67](https://github.com/Esposter/Esposter/commit/45e4b67e949cffe24350e50972ac57959dffa04c))

* offset should just replace items ([e4e70c5](https://github.com/Esposter/Esposter/commit/e4e70c54c5163c7f40c38a548b40bfa163420390))

* only show waypoints if not pending ([ca72661](https://github.com/Esposter/Esposter/commit/ca72661df34bb8e7851862865ced245c5d1053fe))

* pin better-auth for now ([f25d370](https://github.com/Esposter/Esposter/commit/f25d3708ccf0d7cf1397643fcc157271ac16ff67))

* pin nuxt for now ([51fdfe6](https://github.com/Esposter/Esposter/commit/51fdfe664cbf40cc2dffc966f0d74e1881efbe57))

* props ([0324640](https://github.com/Esposter/Esposter/commit/0324640a904f511a5231037497e8d6420cd21f25))

* query check constraint ([a1b326b](https://github.com/Esposter/Esposter/commit/a1b326b04b3d7d65da069ae190c52e51c1a015d1))

* query check constraint ([8c01ab6](https://github.com/Esposter/Esposter/commit/8c01ab66b87654e1c5d04d0461146108a6c7fb63))

* query restrictions ([161f941](https://github.com/Esposter/Esposter/commit/161f941de6c0f5558ffd90217e962e743f13a5d5))

* query search to use * if no query + move components over to search ([6b7cbc5](https://github.com/Esposter/Esposter/commit/6b7cbc5dfc4c12514a943c48e5bb902ca86d2511))

* refactor out name + placeholder logic ([d17ffaf](https://github.com/Esposter/Esposter/commit/d17ffaf9642ec7f3023140c5a91f90aa7672078b))

* remaining room name too ([3098893](https://github.com/Esposter/Esposter/commit/3098893689738510e3e4b84db61b0f726e59b8fb))

* remaining typecheck errors ([96a80af](https://github.com/Esposter/Esposter/commit/96a80af8dd5e9b885c222c88b831b259e66e8cca))

* remove element on mention ([8e29506](https://github.com/Esposter/Esposter/commit/8e29506e27ab8be9048b9f94475f52eecb700858))

* remove unnecessary attr ([d006726](https://github.com/Esposter/Esposter/commit/d00672693117514d701a2c7467fbc56cf46c26b1))

* remove unnecessary slot ([2d3ebe9](https://github.com/Esposter/Esposter/commit/2d3ebe9bbe956f9e45e693c2e7e98d7f34f3eb42))

* remove unnecessary styles ([890fd1a](https://github.com/Esposter/Esposter/commit/890fd1a5a153257fcabda5558f0af8bde2917cce))

* rename var ([da2934c](https://github.com/Esposter/Esposter/commit/da2934cba9f30e40634ad14e04c460f0601f42cf))

* resetting page when searching ([f124b8e](https://github.com/Esposter/Esposter/commit/f124b8e4e0f992410c98fbfca486e002e624c684))

* revert back to maybe ref ([a0afd9f](https://github.com/Esposter/Esposter/commit/a0afd9f5eb1d62024e957ba721490749adb1015d))

* scrollbar position ([e222c9b](https://github.com/Esposter/Esposter/commit/e222c9b7c94a813cb9cdff6ecde1f1f54589ec48))

* search styles ([8333706](https://github.com/Esposter/Esposter/commit/833370675a9a0c7b4729f7e5b15dd8b0daa72f98))

* some styles ([405048c](https://github.com/Esposter/Esposter/commit/405048c00738aa163d308e1124ac9ed9b1bd627e))

* some unused vars ([e90ade6](https://github.com/Esposter/Esposter/commit/e90ade69d806b11879cdfe9dd01d1684696be916))

* stop the auto input clear.. ([cb29a4b](https://github.com/Esposter/Esposter/commit/cb29a4bbe622174fbb2d498cb2a8cd8b0c4199b7))

* styles ([627a749](https://github.com/Esposter/Esposter/commit/627a749336ae23c3b792ee1a234e9daa1878a06f))

* test imports ([2196ee8](https://github.com/Esposter/Esposter/commit/2196ee842d51e513c193d9e72a4245dacbe7dbbb))

* tests ([e36b7ee](https://github.com/Esposter/Esposter/commit/e36b7ee7c2703515dbc39e7c1b50c7fccad2d980))

* tests + room query + serialize entity ([c184b6a](https://github.com/Esposter/Esposter/commit/c184b6a3b20eb60784e6efa55bc6bebcb9e2be89))

* throw error if room id doesn't exist ([6badae4](https://github.com/Esposter/Esposter/commit/6badae4049cac8dff3b0a78a26f81ee2aadb38cd))

* trpc search history get cursor where ([91a15bf](https://github.com/Esposter/Esposter/commit/91a15bf1693a05eccf01c91f2ba2905f61ad0036))

* try catch parse ([28304a0](https://github.com/Esposter/Esposter/commit/28304a011eb10f4330d0fd05182f5336faa8cdd3))

* type errors and using correct room ([1834452](https://github.com/Esposter/Esposter/commit/183445257678810c393bde8452c867bd410602ea))

* types ([b2d2807](https://github.com/Esposter/Esposter/commit/b2d280748b1783a076e2a5eb6ff8c8664f4797ba))

* types ([f57d658](https://github.com/Esposter/Esposter/commit/f57d65811ac5aa95cfaa9307bca5b90d45a3f560))

* types & slots for message ([d41a056](https://github.com/Esposter/Esposter/commit/d41a0569b561aae37d4e6a9e4064995b3cac7bf8))

* types and lint ([6518c40](https://github.com/Esposter/Esposter/commit/6518c40541d214b22d72e691fbc1aeba56623c70))

* update partition key ([6056c63](https://github.com/Esposter/Esposter/commit/6056c639c94ee9a9a6560bffd9eac0390d560cc8))

* use array contains for checking mimetypes ([f878f91](https://github.com/Esposter/Esposter/commit/f878f91a6d4cf55e0be9fe03d75d77c32929994a))

* use editable name as origin ([33966a1](https://github.com/Esposter/Esposter/commit/33966a19b5f782fc85421bbaebeed4bcfcb579c2))

* use v-model to handle outside clicks as well ([ebb15e5](https://github.com/Esposter/Esposter/commit/ebb15e5433f0e309e34f9345e49bded4b9aaadb8))

* useRuntimeConfig for now ([d20a951](https://github.com/Esposter/Esposter/commit/d20a9516c751fee6f0346a48d39447dad1029f42))

### Features

* Add amazing search menu behaviour same as discord ([08c0f94](https://github.com/Esposter/Esposter/commit/08c0f94af220789865f9b72fd51089116b54d9b9))

* Add current room name ([67ffaaa](https://github.com/Esposter/Esposter/commit/67ffaaa5f4c3a5ecf008a73ea866a849de106fc4))

* Add date picker ([b1cba14](https://github.com/Esposter/Esposter/commit/b1cba14594830339fed08a11c51f3cd1470b88fd))

* Add deduping + mentions ([526f21f](https://github.com/Esposter/Esposter/commit/526f21fe5d9572ba99f8cc3ae8d4499f91e17f5d))

* Add emoji list to edit room as well ([96b6565](https://github.com/Esposter/Esposter/commit/96b656529a0ff31316c2933a26ef71b776a3d611))

* Add has filter ([052999c](https://github.com/Esposter/Esposter/commit/052999cb1e255d2756ac8a0b6405810cd6fb8800))

* Add help tooltip ([2c93022](https://github.com/Esposter/Esposter/commit/2c93022c70672d214d6cfcad6a0cd2f4da70ef5d))

* Add hover plus icon + select history ([16d6647](https://github.com/Esposter/Esposter/commit/16d6647bf75d7dcdc19b35eac305564f1140c849))

* Add lerna watch ([495631f](https://github.com/Esposter/Esposter/commit/495631fc018bfe3cf44674b8249378fa29dcc7fd))

* Add mentions to created message ([811ec09](https://github.com/Esposter/Esposter/commit/811ec0991b785c35a744bf7eab4917bed420c831))

* Add message component map ([f4dace0](https://github.com/Esposter/Esposter/commit/f4dace04b0ba7a48d720b20ab89d389da19c6eca))

* Add message type ([1248429](https://github.com/Esposter/Esposter/commit/12484295f94673af5ff16de7d6903f4628e4a92b))

* Add overload to support different interfaces ([b98dcd7](https://github.com/Esposter/Esposter/commit/b98dcd73960643b6f22def97105d032ef3be7d9e))

* Add pin message UI ([bbbc388](https://github.com/Esposter/Esposter/commit/bbbc38815924cb6a3ae07c2cc448a5c47e559395))

* add pin picker + fix up forward ([ffd8c2f](https://github.com/Esposter/Esposter/commit/ffd8c2f72aa3ff43f6360fa7e39850d3043adc42))

* Add pin/unpin messages ([039b7ea](https://github.com/Esposter/Esposter/commit/039b7ea48a0613fb1e6bfaf1e604df683a8695cd))

* Add room skeleton ([45e83b2](https://github.com/Esposter/Esposter/commit/45e83b2f5137924e9881485db7c0860aadd94e2b))

* Add room test ([e676d3e](https://github.com/Esposter/Esposter/commit/e676d3e87a458a1bb7cbcd5eae8aa06cf0491e60))

* Add search history router ([2f6d243](https://github.com/Esposter/Esposter/commit/2f6d2431a378808e0d28cf8335ea63215e400cbc))

* Add search history tests ([b31a2ad](https://github.com/Esposter/Esposter/commit/b31a2ad9dd460b962265645eb62e774ee91bd588))

* Add search operator with array contains ([d88f723](https://github.com/Esposter/Esposter/commit/d88f72329a185554268c47e29d794e9c6f306a3e))

* Add serializing and converting filters to clauses ([780fa36](https://github.com/Esposter/Esposter/commit/780fa363ab78d193c1917d44d1b34f2dcfce98d3))

* Add update search history with tests ([1aee332](https://github.com/Esposter/Esposter/commit/1aee332d5470ce5f78f815fee76d2a57c873e2d1))

* Add webhook pkg ([ae1477f](https://github.com/Esposter/Esposter/commit/ae1477f28b6b6df94da98cec1c944ff9de96e258))

* Add webhook schema ([501b9ce](https://github.com/Esposter/Esposter/commit/501b9ce2e1c3f43869ac954cdc449202c781d119))

* Add webhook types ([b4029ef](https://github.com/Esposter/Esposter/commit/b4029efe1a5bfed430dabaef49ffffcd0b218ad6))

* enable native plugins ([d5b72fb](https://github.com/Esposter/Esposter/commit/d5b72fb4fd3fa80e0a6531e8d65da82e84a4d709))

* fix and add up headers ([5b953e0](https://github.com/Esposter/Esposter/commit/5b953e02c5cd85ea494f5274b2ca6ed282f43d42))

* hijack options to reactively change styles ([8a23a2b](https://github.com/Esposter/Esposter/commit/8a23a2bd330aea22c907f5787d9e7d3a4f68e3ec))

* migrate to new db schema ([4c63fbe](https://github.com/Esposter/Esposter/commit/4c63fbe289ce89ed18001e09cf6970501a15c9bb))

* migrate to rate limiter drizzle ([00091a2](https://github.com/Esposter/Esposter/commit/00091a2d8b31c16fb6cb749a1a278817e312dd87))

* migrate to schema ([991e738](https://github.com/Esposter/Esposter/commit/991e7380da75858173fc7bb28f1c53c32267a655))

* move db schema to package ([39895ca](https://github.com/Esposter/Esposter/commit/39895cab56fbe31d35f6178e2cdd7e5bf0a37ab7))

* refactor to search icon ([db8fb75](https://github.com/Esposter/Esposter/commit/db8fb758a503b5767be81c51227220cdf6b55995))

* split drawer components neatly ([4eea0c7](https://github.com/Esposter/Esposter/commit/4eea0c731b58f6c57b8738f99bc6dab0f04d5eb3))

* split drawer components neatly into enum ([f8e6164](https://github.com/Esposter/Esposter/commit/f8e6164ef8dca900ec3dcba5bd25a476275bb4c6))

* Support opening dialog from separate message ([441327b](https://github.com/Esposter/Esposter/commit/441327b3588222537bb1447713b26e11baa1cd21))

* Update search index fields ([20bcceb](https://github.com/Esposter/Esposter/commit/20bcceb4d82e095e12c280d0c81a3e0c206e71e4))

# [2.14.0](https://github.com/Esposter/Esposter/compare/v2.13.1...v2.14.0) (2025-09-14)

### Bug Fixes

* add v-else ([a558410](https://github.com/Esposter/Esposter/commit/a558410b12a39726da4ae295f98366be9191d0ce))

* conditions ([7ea99fc](https://github.com/Esposter/Esposter/commit/7ea99fc35be58f5ace20b5189101522123272979))

* don't require offset to be part of data ([dd2090a](https://github.com/Esposter/Esposter/commit/dd2090a03ce0cba10ffd05155549ae5b27a69eba))

* handle start spaces ([b7b0dcd](https://github.com/Esposter/Esposter/commit/b7b0dcd6ebf54bf20b773fea815a0473c2808cb0))

* hover ([b91327d](https://github.com/Esposter/Esposter/commit/b91327d046ba1a28b447f9d7c00283e0332b9dba))

* move hoisted outside of runtime code ([8acf61a](https://github.com/Esposter/Esposter/commit/8acf61a8f107a2a075f62fed42c9d1ceef49986c))

* node options + add hover plus icon ([72b7e89](https://github.com/Esposter/Esposter/commit/72b7e892443f1ec4908f2e1686cebf832a574bdc))

* object layer should be per tilemap ([10b2271](https://github.com/Esposter/Esposter/commit/10b2271234bf4fc60cd37307f20ef692c93b0686))

* remove unnecessary composables ([0b85e80](https://github.com/Esposter/Esposter/commit/0b85e80af9ade3bdc54c5c8c6439c3047c03c6ef))

* storeToRefs ([1ae99bd](https://github.com/Esposter/Esposter/commit/1ae99bd8ed48734a2aca7d18ddb9e9f67cb2171f))

* update tileset paths + re-export map ([7f10532](https://github.com/Esposter/Esposter/commit/7f1053214225f62478adbc6e72bd0b8ceebb82c8))

* use return object and item value ([b9470a2](https://github.com/Esposter/Esposter/commit/b9470a256fa9e59d97322616430226dcbffb313c))

### Features

* Add count ([3670619](https://github.com/Esposter/Esposter/commit/367061974de1497b0ab1bf8b3965efdda4443bc7))

* Add history messages ([6ab2039](https://github.com/Esposter/Esposter/commit/6ab2039a1757e46c76a9e2992294a0b7e84cf4da))

* Add member skeleton ([c20c785](https://github.com/Esposter/Esposter/commit/c20c7858a0461ce0fe37c23d199a9243f8a05f5f))

* Add skeleton on beginning as well ([cb37784](https://github.com/Esposter/Esposter/commit/cb37784d69d5ec12e659adcb6928b282620bece2))

* Add some basic search func ([ba85959](https://github.com/Esposter/Esposter/commit/ba859597c9558c206e92fec418f1fe4167255eb3))

* Add user picker ([870a1f9](https://github.com/Esposter/Esposter/commit/870a1f9c3037b37ce1db1f309e92e9f3edba5b4e))

* upgrade type-fest to ESM only ([e2a7bb6](https://github.com/Esposter/Esposter/commit/e2a7bb6067fb9d87092ec274d709e3d15a4ffddf))

## [2.13.1](https://github.com/Esposter/Esposter/compare/v2.13.0...v2.13.1) (2025-08-31)

**Note:** Version bump only for package @esposter/app

# [2.13.0](https://github.com/Esposter/Esposter/compare/v2.12.0...v2.13.0) (2025-08-31)

### Bug Fixes

* add files ([ffdcdfc](https://github.com/Esposter/Esposter/commit/ffdcdfc350a63776d5496ea7ed44fc8f0fef07de))

* add files ([fdcf797](https://github.com/Esposter/Esposter/commit/fdcf79779ad68ab12f835221ded0fa9dd2c7de10))

* add filter type and esc blur ([1e08050](https://github.com/Esposter/Esposter/commit/1e08050ef87701541f94b78557db39fe8a2b7e11))

* add min to filters ([08339d7](https://github.com/Esposter/Esposter/commit/08339d7f49aac22c38fbb2fb9aae9cdf4e062148))

* add self-ref fk ([ed75f7d](https://github.com/Esposter/Esposter/commit/ed75f7d1880455d462a4da63b4fdb8f5517e7aa0))

* add type so I don't need that type assertion error ([e8325ae](https://github.com/Esposter/Esposter/commit/e8325ae4e97133d2ff848dca1c17f72602589631))

* add types ([cf51805](https://github.com/Esposter/Esposter/commit/cf51805b577613747dd8235304e15b6e40162a52))

* cursor + menu ([3bff4fe](https://github.com/Esposter/Esposter/commit/3bff4fe6b14090100ce9ddd5479960742c308641))

* discriminated union key && cleanup unnecessary dom elements ([994eb25](https://github.com/Esposter/Esposter/commit/994eb257f10ecc79ef7385a73bc3911b77e68841))

* filter type order ([91a03f5](https://github.com/Esposter/Esposter/commit/91a03f56f72aa5099ad91692657867a6a0d5741f))

* lint ([0bf6184](https://github.com/Esposter/Esposter/commit/0bf6184850ffb22d4b488fcee8c55b11a7aa4f8a))

* migrate to floating ui ([9cbb7f5](https://github.com/Esposter/Esposter/commit/9cbb7f591555605ac6360482188138a222302326))

* move is partition key and is row key to shared and fix up some things with search bar ([a3409c4](https://github.com/Esposter/Esposter/commit/a3409c476fed907a2ac9f0c26816c0a621821ca7))

* pricing ([873d341](https://github.com/Esposter/Esposter/commit/873d34117685112ff0e0e79f7129b4014f92513d))

* remove unnecessary Boolean ([23c0c38](https://github.com/Esposter/Esposter/commit/23c0c38aa27afc4407027c593e3c09f17ab54c36))

* remove unnecessary weird fix ([63b1c96](https://github.com/Esposter/Esposter/commit/63b1c968e59a8df7f5069a6dfe162170405ed902))

* remove unused isPartitionKey ([7ca950b](https://github.com/Esposter/Esposter/commit/7ca950be88d3bac852b68606d3c741463d405aed))

* reset after create ([9ff4f2d](https://github.com/Esposter/Esposter/commit/9ff4f2d843ccff4222e7c5c994308eba7e271c7a))

* tests ([61d3e20](https://github.com/Esposter/Esposter/commit/61d3e2095692d60307c81598387cb1405e528007))

* types ([cc6c165](https://github.com/Esposter/Esposter/commit/cc6c165091977613999be3fb8e7b5f4af8106e33))

* undefined accesses ([649d4fd](https://github.com/Esposter/Esposter/commit/649d4fd388d9ce7c41dc3558fe2f6aabae7c974f))

* using search client composable ([8e8ec93](https://github.com/Esposter/Esposter/commit/8e8ec939fee16b2f569284dadb7e7f982e97056a))

### Features

* Add basic search first ([8d413dc](https://github.com/Esposter/Esposter/commit/8d413dc1707db91a8370d1777dab3dc538d90826))

* Add placeholders ([37df36a](https://github.com/Esposter/Esposter/commit/37df36a17c75c6e9d85affd80272149d40c91023))

* Add search filter chips ([b5eeacc](https://github.com/Esposter/Esposter/commit/b5eeacc7db4422ac913d4d00ed986d099f946daf))

* Add search filter store ([0342175](https://github.com/Esposter/Esposter/commit/034217546c8ad6ae7f0adae09d90bde617cd4e6e))

# [2.12.0](https://github.com/Esposter/Esposter/compare/v2.11.0...v2.12.0) (2025-08-15)

### Bug Fixes

* add back watch ([1890c55](https://github.com/Esposter/Esposter/commit/1890c553c28357245d4cef33b32d90b07f6b3475))

* inline type ([7586ced](https://github.com/Esposter/Esposter/commit/7586cedb2d2e12e8d6927707ef095e3911045166))

* only navigate if message exists ([eb6ae15](https://github.com/Esposter/Esposter/commit/eb6ae158f8161967389940fb7c50b3970d0a0219))

* specify tsconfig for tsx ([03b7691](https://github.com/Esposter/Esposter/commit/03b7691c1dcfa6f576249d7b423eb5c0da0bf891))

* support unary operators and ne binary operator ([b70e1b1](https://github.com/Esposter/Esposter/commit/b70e1b16654ad1ddcdf38191acfbfb00141818b4))

* tiptap 3 has dynamic placeholder yay ([99805a7](https://github.com/Esposter/Esposter/commit/99805a7d05a9d98f635cb3b3e6fa3d6f4910ed6b))

* types ([02d8117](https://github.com/Esposter/Esposter/commit/02d81170cb6df47d3cb73cfb60346471cfe25f7b))

* use icon button for now ([be8bcbb](https://github.com/Esposter/Esposter/commit/be8bcbb9e560d29192e085e4818f2c30708146ba))

### Features

* Add confirmation dialog ([f4dd45c](https://github.com/Esposter/Esposter/commit/f4dd45c0cbde47e59d71f3a195aa72352d2f09ae))

* Add kicking user ([484ed48](https://github.com/Esposter/Esposter/commit/484ed486f628f21b8e3dc06d5580a177798240fb))

* Add linking to reply ([b4ffe39](https://github.com/Esposter/Esposter/commit/b4ffe3903119a760e196aae0e107773c04382f3b))

* Add member tests ([0bdf52e](https://github.com/Esposter/Esposter/commit/0bdf52efcc119bc882b18bf553e3bb8fc32a23c7))

* soft delete messages ([9305888](https://github.com/Esposter/Esposter/commit/93058887adcfa25d94ee7476187816a8de197e3b))

# [2.11.0](https://github.com/Esposter/Esposter/compare/v2.10.0...v2.11.0) (2025-08-11)

### Bug Fixes

* lint ([98009c9](https://github.com/Esposter/Esposter/commit/98009c99b5ab2dcefd0352599a4d0206f72c1a5c))

* lint ([a61b545](https://github.com/Esposter/Esposter/commit/a61b545779cd690eb2cfc5de8f5eff96c184fa89))

### Features

* Add filter parser ([e70e1f3](https://github.com/Esposter/Esposter/commit/e70e1f3f8982dbcbe876e431db0ec388bd6fdb67))

* Add message rowkey also to the link ([c376d64](https://github.com/Esposter/Esposter/commit/c376d644451b44bd7155c26d10f9ac12222df645))

* Add pasting files ([927ae85](https://github.com/Esposter/Esposter/commit/927ae85ad5442ccee47cbe253452590375f3b93b))

# [2.10.0](https://github.com/Esposter/Esposter/compare/v2.9.0...v2.10.0) (2025-08-10)

### Bug Fixes

* actually you can reply to yourself lol, makes sense ([4e7b00d](https://github.com/Esposter/Esposter/commit/4e7b00d786b07685f544498d62199a0d44e3b29e))

* add is include value for normal fetching so the order includes it ([457d4f7](https://github.com/Esposter/Esposter/commit/457d4f740c1bb25e7d125e72a8bfbcea6f9905aa))

* Add isScrolling check to not push users up ([00fb7d6](https://github.com/Esposter/Esposter/commit/00fb7d6d15ddfe4b99b23b693aabd993b8e9123e))

* add messages layout ([5528b69](https://github.com/Esposter/Esposter/commit/5528b691caf8bea99359f704f455e4716b574b1e))

* finally fix up remaining types for now ([4589acb](https://github.com/Esposter/Esposter/commit/4589acb77213ad8d047aa09cae7c4d3201ae8cf5))

* fugly fix for the scroll top for now ([3671e27](https://github.com/Esposter/Esposter/commit/3671e27ddc3f90183feef75647da152eab19e37e))

* graph edge type ([e49d0b9](https://github.com/Esposter/Esposter/commit/e49d0b94cd6c970aba236eb042e5df1b38d7ad97))

* jump to present ([680c54b](https://github.com/Esposter/Esposter/commit/680c54b4dd41ff77761ae5815ba4b4b9bd5963b3))

* jump to present snackbar ([c2d18eb](https://github.com/Esposter/Esposter/commit/c2d18ebe84582c06e88e37d5186cd54e6dd98bb0))

* move copy text to separate section ([da7fc5d](https://github.com/Esposter/Esposter/commit/da7fc5dcb43874afedc7eeab98a34938fe7705f7))

* remove dupe ([821953e](https://github.com/Esposter/Esposter/commit/821953e345d67780c4aa11ef7197f2087ce37e28))

* remove unnecessary background transparent ([ed86abf](https://github.com/Esposter/Esposter/commit/ed86abf36d8e0a24e03d73403d3313a95ac0dd4b))

* remove unnecessary nuxt-site-config dep ([99a7800](https://github.com/Esposter/Esposter/commit/99a7800c9babf42489c5989075cd5a5f5ac54821))

* remove unnecessary type ([bc77c95](https://github.com/Esposter/Esposter/commit/bc77c95ed2453cf49f3bb7f618ecd418e1ed5812))

* revert back pglite ([4f2945f](https://github.com/Esposter/Esposter/commit/4f2945f4736c3de468cbb133c030dd20e1218183))

* revert back to nuxt v4.0.1 for now ([26d9abb](https://github.com/Esposter/Esposter/commit/26d9abb59a5f4af386575a3a66c3f66dbb921648))

* sanitize key ([f694d5f](https://github.com/Esposter/Esposter/commit/f694d5f5744094239164744e620c6d50c72f8953))

* sanitize key ([d550593](https://github.com/Esposter/Esposter/commit/d550593983a55791aa49fc6e8388b120ac9d94d2))

* save after update ([de1d724](https://github.com/Esposter/Esposter/commit/de1d7241e58b448501585c209fcc4e662834e23c))

* serialize and bunch of rowkey cursor issues ([5171005](https://github.com/Esposter/Esposter/commit/5171005ab50be692222e91d3377b5166854bbf63))

* serialize rowkey as cursor ([eeec613](https://github.com/Esposter/Esposter/commit/eeec613113ee4790e5785cd061ba35d1b8b4cf00))

* support serialize/deserialize in browser + node ([266f6aa](https://github.com/Esposter/Esposter/commit/266f6aae9aafaa11a84e9e55e28764c80319b026))

* tests ([8c7a7b4](https://github.com/Esposter/Esposter/commit/8c7a7b42de08809c267d55141aa3edf8de8918a8))

* thanks friend, got perfect solution, use requestAnimationFrame ([20eb275](https://github.com/Esposter/Esposter/commit/20eb2759f0b8ddb57f1d7e3871914744abcbe447))

* types ([b17f9b9](https://github.com/Esposter/Esposter/commit/b17f9b93c6016a9d93910f18084a7ff26a6b2066))

* types ([8bf54fd](https://github.com/Esposter/Esposter/commit/8bf54fd9d247678f124a38255215b2fc570c9953))

* types ([0abab74](https://github.com/Esposter/Esposter/commit/0abab7463cdc88540e72b17b8b783b9135cc2552))

* types + reconnect logic ([959c534](https://github.com/Esposter/Esposter/commit/959c534a2f362c9cddcf5c25dcf14698445f2423))

* use get element by id, better API ([8186414](https://github.com/Esposter/Esposter/commit/8186414f0df5294e47b76c29d93a43811038c7b5))

* validate message first and also fix use sortBy ([4b9a924](https://github.com/Esposter/Esposter/commit/4b9a924971f16fec1e54087a429ec5c513c569ea))

* we also needed to reverse the day timestamp as well... ([c96fc2b](https://github.com/Esposter/Esposter/commit/c96fc2bd158f6cb9df23c1c75be55669b78e22c1))

* workaround sticky scroll on loading new messages ([9247da1](https://github.com/Esposter/Esposter/commit/9247da16b060859331848bcaba786278ade244bc))

### Features

* Add copy message link ([21fe9ed](https://github.com/Esposter/Esposter/commit/21fe9ed3a648ebf7056ea50850cb6db41018d086))

* Add copy text ([a0df02a](https://github.com/Esposter/Esposter/commit/a0df02a5c1c018d46bf21684568f0ec61605cbcd))

* Add jumping to specific messages ([4fdd9fa](https://github.com/Esposter/Esposter/commit/4fdd9faeff5c1bf6a558162edde66745ab55d79e))

* Add panel ([39f788e](https://github.com/Esposter/Esposter/commit/39f788e568d3446690641786f165eac8e1c6c80b))

* Add skeletons ([ab33c06](https://github.com/Esposter/Esposter/commit/ab33c06b746f4caa1d25fc3fa00b269062af5e1e))

* Add styles ([ea9d2d2](https://github.com/Esposter/Esposter/commit/ea9d2d2d643aa5177c97687017f3f17cf00cfbff))

* Add zod types ([6bb60a4](https://github.com/Esposter/Esposter/commit/6bb60a4962c9165fa485cbbe0e1b545e21f0ba40))

### Performance Improvements

* make waypoint v-show ([719c5d4](https://github.com/Esposter/Esposter/commit/719c5d48abb279a5aa1af2c8c9ab71d206126c1e))

# [2.9.0](https://github.com/Esposter/Esposter/compare/v2.8.1...v2.9.0) (2025-07-19)

### Bug Fixes

* Add warning instead ([0d37e83](https://github.com/Esposter/Esposter/commit/0d37e83dcefe7c5b97615e0bbacca61dfe942cc4))

* lint ([56b937a](https://github.com/Esposter/Esposter/commit/56b937a8be564dbd51150175e0ba2c3bd9f971d7))

* lint ([28c92c6](https://github.com/Esposter/Esposter/commit/28c92c68176d1f4c6dd4367e9b2b3201da1b6e06))

* local builds ([a5cec4a](https://github.com/Esposter/Esposter/commit/a5cec4af3963c5c6fe92e2be3f5c48299bbb97e7))

* make test todo for now ([eda5ab5](https://github.com/Esposter/Esposter/commit/eda5ab514d71ea008f9c232ecba95fa0edd110e8))

* most remaining tests ([47b92ed](https://github.com/Esposter/Esposter/commit/47b92ed39bcb5a21a14cc1a568aed2aea7a0cb67))

* snapshot ([7f919f9](https://github.com/Esposter/Esposter/commit/7f919f96e298697c2bfb51bee9021332fc04ba93))

* update message only allow message itself ([0623b51](https://github.com/Esposter/Esposter/commit/0623b51e349cb940f9b40276a53db13c38246b76))

### Features

* Add edge case test ([e8a6f7b](https://github.com/Esposter/Esposter/commit/e8a6f7bffade9ef1c865db65ec60b10491c53773))

* Add failing emoji tests and stop updates from deleting ([84584cc](https://github.com/Esposter/Esposter/commit/84584cc05a115998e6edfc3ea0ec07cc07f88266))

* Add remaining emoji test ([f4783b2](https://github.com/Esposter/Esposter/commit/f4783b2b3a7b89d02bf19b0758e150b881426761))

* Add remaining message fail tests ([13a6c05](https://github.com/Esposter/Esposter/commit/13a6c05417c8737094a34855ec6dcd19cd6db45b))

* Implement beginCopyFromUrl + add message fail tests ([642780f](https://github.com/Esposter/Esposter/commit/642780fdb7907e6a95662e95f9b29aec06b42233))

* Implement message tests ([9b250d7](https://github.com/Esposter/Esposter/commit/9b250d72f6a218c498b7973c373f2956b7787cc3))

* Update zod ([2ca3248](https://github.com/Esposter/Esposter/commit/2ca3248076fc529c23c20b3e82638f58c699fa48))

* Upgrade to tiptap 3 ([62c6951](https://github.com/Esposter/Esposter/commit/62c69515aaa5ec173ae7bbe6e1b222ea6af7f604))

### Performance Improvements

* optimize like ([7ac6112](https://github.com/Esposter/Esposter/commit/7ac61129280718a161a037a9319f1e32c664ce81))

* optimize post ([17192fb](https://github.com/Esposter/Esposter/commit/17192fb28bc13a7b81a2d0ad205dc649a7b7c990))

* optimize room and user ([700407f](https://github.com/Esposter/Esposter/commit/700407fe5315c61a8e138fc6e7e89390f8d0562f))

## [2.8.1](https://github.com/Esposter/Esposter/compare/v2.8.0...v2.8.1) (2025-07-09)

**Note:** Version bump only for package @esposter/app

# [2.8.0](https://github.com/Esposter/Esposter/compare/v2.7.0...v2.8.0) (2025-07-09)

### Features

* Add MockBlobBatchClient ([bf23646](https://github.com/Esposter/Esposter/commit/bf23646a075d0bc516a0ad9c18a3b24c31b7b41a))

# [2.7.0](https://github.com/Esposter/Esposter/compare/v2.6.0...v2.7.0) (2025-07-09)

### Features

* Add azure-mock library ([7391d18](https://github.com/Esposter/Esposter/commit/7391d1822b7fc6249efc58f041e2c99fb77cef5c))

# [2.6.0](https://github.com/Esposter/Esposter/compare/v2.5.0...v2.6.0) (2025-07-09)

### Bug Fixes

* Add some more border radius ([9c87c22](https://github.com/Esposter/Esposter/commit/9c87c22cdac4749fc4a2ab2cfe8226e206f9415e))

* add types folder ([1b78203](https://github.com/Esposter/Esposter/commit/1b78203d2adcf0922bcec7900e761ff46151db57))

* align constructor params ([5e26f33](https://github.com/Esposter/Esposter/commit/5e26f33570aa5849d9bcf5396b06eeb815db5e37))

* case ([77f89cd](https://github.com/Esposter/Esposter/commit/77f89cdc1e8519b1bb7607f3c87e19a7d3b0eff3))

* delete should have click.stop ([3011006](https://github.com/Esposter/Esposter/commit/30110063c619728f9b426256b3550519ac4ff860))

* env.d.ts and global.d.ts ([f5f85cb](https://github.com/Esposter/Esposter/commit/f5f85cbc3c097aee5ff11f92881cb97ed328133d))

* get segment ([cf79a03](https://github.com/Esposter/Esposter/commit/cf79a033444fcb744c5e36b99f68ddd41da37f9e))

* lint ([4c6e7b1](https://github.com/Esposter/Esposter/commit/4c6e7b11cf23b3aed2441fc12c07a07fa965d772))

* move happy-dom to workspace ([e81f40e](https://github.com/Esposter/Esposter/commit/e81f40e1a55f0e043e07d8ae91f02df638cf62e2))

* move items and monsterdata assets ([dae887b](https://github.com/Esposter/Esposter/commit/dae887b6437d2234cfba405e1e92bf0934cd0bfe))

* move server types ([5aa258d](https://github.com/Esposter/Esposter/commit/5aa258df9ad8b7a35002961947bcc93290dd154e))

* move types folder to app ([249fcc2](https://github.com/Esposter/Esposter/commit/249fcc2642b689a076a1c1e231a0872972de6932))

* remove more unnecessary eslint disables ([fab6bed](https://github.com/Esposter/Esposter/commit/fab6bed761d900dd7f24f8c2dea83c7c7460f054))

* remove unnecessary blob url from env ([cc97ad9](https://github.com/Esposter/Esposter/commit/cc97ad96bbe835c8dceaa2157aabf49cef3b716b))

* remove unnecessary clear ([74da3f6](https://github.com/Esposter/Esposter/commit/74da3f65a463fc779ef18e613f765944e4770e93))

* replace monster and item ([b91ce95](https://github.com/Esposter/Esposter/commit/b91ce956f0712092d98a606453cfb6b73e8ec8bd))

* root tsconfig ([4eed9e6](https://github.com/Esposter/Esposter/commit/4eed9e608e61ec5a99bb452e4a6a59d408e03c62))

* test snapshots ([636b4bb](https://github.com/Esposter/Esposter/commit/636b4bb7929620f3b794b6f34440e319750b6a10))

* tests ([c5f8cd6](https://github.com/Esposter/Esposter/commit/c5f8cd6ff6b380ce94c3c3c799ba8906d79cadc3))

* tsconfig ([693ad43](https://github.com/Esposter/Esposter/commit/693ad4368c17463865199e91ca9ea7df0ede0ded))

* tsconfig types ([f5afec7](https://github.com/Esposter/Esposter/commit/f5afec76e28676b66becdfd2357f3645fd6007af))

* tsroot config files ([b13add2](https://github.com/Esposter/Esposter/commit/b13add2f1f357d5d326ca9c7ff216868aafae5c0))

* types ([3a108f8](https://github.com/Esposter/Esposter/commit/3a108f8689e1ccb9981c11457915fb85718149ce))

* types ([513083b](https://github.com/Esposter/Esposter/commit/513083befa5e25175a0565d80951310a29299781))

* types and title ([df7b194](https://github.com/Esposter/Esposter/commit/df7b19401dab8378ffbfb68dd83ff0d559288e19))

* versions ([66c1451](https://github.com/Esposter/Esposter/commit/66c1451cf9d4e866bed741de6fdc94f5889a3c70))

* workaround eslint disable more elegantly ([d272bb2](https://github.com/Esposter/Esposter/commit/d272bb231555f6499a0fe1cf524434176cf2e175))

* zod snapshot ([7f57feb](https://github.com/Esposter/Esposter/commit/7f57feb1ab540d6542f6fe2ce25b043cc84d8243))

### Features

* Add azure storage mocks ([177900e](https://github.com/Esposter/Esposter/commit/177900eeca2be55cc3e1425d28d2dd7a7a3cbccf))

* Add azure table mocks ([9fa8d92](https://github.com/Esposter/Esposter/commit/9fa8d9265f693b953eb2c53f93788ad5feb7bb27))

* Add back tests now ([6ea0870](https://github.com/Esposter/Esposter/commit/6ea087064ca521ec48581809f8e0cd0ddd997c54))

* Add body to buffer ([fd547c9](https://github.com/Esposter/Esposter/commit/fd547c956c10b00ebf9c3f155c13256fe021d527))

* Add oxlint rules to prep eslint migration later in the future ([45d8b00](https://github.com/Esposter/Esposter/commit/45d8b00c2223a92d937dc0734ff8702661c9882c))

* Add user settings button ([770f590](https://github.com/Esposter/Esposter/commit/770f59092147e921b01a815713de95f5225e5a62))

* Add user status bar ([7977720](https://github.com/Esposter/Esposter/commit/7977720e22d19f7d3c33b9e55dff7228a9d5b56d))

* finalise and fix up remaining type errors for blob hierarchy ([2814d72](https://github.com/Esposter/Esposter/commit/2814d72e2ab722028d994ca149670f8f8c8b75e4))

# [2.5.0](https://github.com/Esposter/Esposter/compare/v2.4.1...v2.5.0) (2025-06-19)

### Bug Fixes

* accept multiple files ([72f4fe1](https://github.com/Esposter/Esposter/commit/72f4fe102be875fcf1ec4c8ce27165c7abed8bc8))

* add back show notif ([2d2acf8](https://github.com/Esposter/Esposter/commit/2d2acf8ec0c46ebb609fecf0687d2e4ad69dc5a5))

* Add check session id for emojis ([6823299](https://github.com/Esposter/Esposter/commit/6823299b1d5355ac96a52c6cc012de6137ab4d88))

* Add check session id for messages ([098349d](https://github.com/Esposter/Esposter/commit/098349dd090a1e0f3aa05d5b7ef7c8092d96e1fd))

* Add check session id for rooms ([051c4e2](https://github.com/Esposter/Esposter/commit/051c4e2e17eb0c3c2a0bcba278c824ee023f4228))

* Add cleaning up background image ([ca82216](https://github.com/Esposter/Esposter/commit/ca822162bb5e0b6698e1fdc1e8d7cff1fa51f519))

* add member id on join room ([c8b0fd3](https://github.com/Esposter/Esposter/commit/c8b0fd3a4b6873f8f7dd313344fadb19a412b535))

* Add oxlint files to turn off eslint ones ([bdc7aed](https://github.com/Esposter/Esposter/commit/bdc7aed1dfab9d0c8527588cec61a7eb073aa523))

* Add prefault ([a649b7e](https://github.com/Esposter/Esposter/commit/a649b7ef1d6fe92124abe4d300d9b2403bbfe0a5))

* add preserve entry signatures ([b4d8e20](https://github.com/Esposter/Esposter/commit/b4d8e20c08e141a441744558711912d2d3b651ed))

* add route rules for allowing img src in messages ([46d7c62](https://github.com/Esposter/Esposter/commit/46d7c629f948d1459cb403a44079fe984dfd6f04))

* Add some cleaner notification settings ([e098c75](https://github.com/Esposter/Esposter/commit/e098c751a8450254a958b9f4778c61359a5d09b1))

* add user image and use user as source of truth for push notifs ([57f394b](https://github.com/Esposter/Esposter/commit/57f394beb6e6908132ca36773afed4757f24b5cd))

* add web-push to cjs ([ca225b7](https://github.com/Esposter/Esposter/commit/ca225b7a13a70e24e15917de7326066c755cfce4))

* alerts to pop on bottom center ([9241668](https://github.com/Esposter/Esposter/commit/9241668a7178fb54f639f5ac93959fe3a1ccac91))

* allow github user image ([12abf31](https://github.com/Esposter/Esposter/commit/12abf3123584db346be62ad04ac4718b956b7e39))

* always import from z ([511d158](https://github.com/Esposter/Esposter/commit/511d1585863f6155ef4b093ae93a091e1ad6ea2f))

* apply temp fix to manually refresh editor ([8127d7d](https://github.com/Esposter/Esposter/commit/8127d7d7e011a7b3005c8f48b9ade00b986ec05c))

* badge color maps + status detection ([4297ec7](https://github.com/Esposter/Esposter/commit/4297ec78f6e00a90e35a5fcbb4f5e77384727c57))

* catch errors and generate link previews ([279746b](https://github.com/Esposter/Esposter/commit/279746b104d793b4f04412a35c78af215a7a1d4b))

* check if is member and directly go to room ([e330a10](https://github.com/Esposter/Esposter/commit/e330a10efe097a51aeb5f84dc3297961fe7efefe))

* check is not server before create alert ([80130b0](https://github.com/Esposter/Esposter/commit/80130b00f4aa75db0eb24846c33030b9f0b63692))

* cleanup types ([182551a](https://github.com/Esposter/Esposter/commit/182551a7e78b8544cff70e24c2cdeebe16220784))

* cleanup unused vars and events ([be57c63](https://github.com/Esposter/Esposter/commit/be57c638c9b94f7a9402854c1e504d75c932da09))

* condition ([646b42f](https://github.com/Esposter/Esposter/commit/646b42ff2176a36c263ef6c74cbfe20198ffcced))

* connect/disconnect to all send events in the same consistent way ([3c22d03](https://github.com/Esposter/Esposter/commit/3c22d03dac818559134fb62b97eed21e597c9536))

* context + target ([75f8fca](https://github.com/Esposter/Esposter/commit/75f8fca5d24e9e6f8b302be6ef07c51dee827187))

* data url ([cd2bf87](https://github.com/Esposter/Esposter/commit/cd2bf874df4ffc5fb16c4777383014f8514965ce))

* deleting room can just be done locally for same device ([9553d67](https://github.com/Esposter/Esposter/commit/9553d670d6b98561828db4e21f5cd5df0a6bd558))

* detect lang first ([fdd49f3](https://github.com/Esposter/Esposter/commit/fdd49f336712cbc030a9fb0f3c4edb2fea605b3a))

* don't destructure ([d6e3ee9](https://github.com/Esposter/Esposter/commit/d6e3ee942d56324a91a488bd7f12ac80dd535cff))

* don't set vapid on dev ([fd618b4](https://github.com/Esposter/Esposter/commit/fd618b47ae0bfb6d8836af2b861c4128e9413c41))

* don't storeToRefs as it's used in the store ([030ae21](https://github.com/Esposter/Esposter/commit/030ae213777ee363a6ca7b91c3cefdd5e57b57cb))

* don't subscribe if there are 0 rooms ([9896314](https://github.com/Esposter/Esposter/commit/9896314c8f6e8e0bf283fbac5f3fbbd5c8e89c5f))

* emit offline status if lost connection ([5046984](https://github.com/Esposter/Esposter/commit/504698408e18a8c400ed9ab102a7a28b619fcae2))

* emoji selection details ([c33676a](https://github.com/Esposter/Esposter/commit/c33676a88a6485b72f29dddb9fb0af699f4dd42f))

* export ([1b313c5](https://github.com/Esposter/Esposter/commit/1b313c5745767a9027e296daabfd107a743dd78e))

* file css ([07fd1d6](https://github.com/Esposter/Esposter/commit/07fd1d6b86feec1e2396bcd81716d43be6ea0faa))

* file max height + code renderer ([3d9e4c8](https://github.com/Esposter/Esposter/commit/3d9e4c8d5e7ffcc55245ca06a57ef24f461020da))

* file previews ([77954f9](https://github.com/Esposter/Esposter/commit/77954f916918d25f96927a58ee7d41624c7e45d9))

* finally fix up all the weird extend bugs, just spread the object ([a812478](https://github.com/Esposter/Esposter/commit/a812478e17021f6fb04ada5239c83894ad07ca21))

* fine, we'll import it as a pkg ([71c7dff](https://github.com/Esposter/Esposter/commit/71c7dff8b3276ec2400dcc22dceaec0e84049daa))

* font size types ([b264f97](https://github.com/Esposter/Esposter/commit/b264f97b837a76626e4abd06d8f2bca2a2198033))

* handle edge cases of non-existent statuses ([1b7d837](https://github.com/Esposter/Esposter/commit/1b7d8378a9702f5b9f6f77a35f4344b80b8333a8))

* import script ([36338c4](https://github.com/Esposter/Esposter/commit/36338c4850ad962f236b6fb4d2c52d6b5706468c))

* json schema ([5d4defa](https://github.com/Esposter/Esposter/commit/5d4defa1b83bdfa71f58f8f59207b609d09de0c6))

* just send the entire user status object, it's all useful info ([bdcc2f0](https://github.com/Esposter/Esposter/commit/bdcc2f0df42378e6fa30288f25092c5150c65728))

* just use name ([f016315](https://github.com/Esposter/Esposter/commit/f0163157542d31eaaa787ffce74c4ce913ccac28))

* leave room confirm button text ([3248f2b](https://github.com/Esposter/Esposter/commit/3248f2bc63321f70b411fcf58a6f09015593427e))

* link preview response url ([be4cc72](https://github.com/Esposter/Esposter/commit/be4cc7289666370b3012ac7a405fbfeff618a72f))

* link preview to grab from correct text content from message html ([3c452f1](https://github.com/Esposter/Esposter/commit/3c452f11aa7805def9ada0a57ed10f9150a9c993))

* lint ([fe03161](https://github.com/Esposter/Esposter/commit/fe031614ac4bbd38abec711517df7e9326391e7d))

* lint ([d1b10ba](https://github.com/Esposter/Esposter/commit/d1b10ba6325971b704b05c7c82c5a2fb78e2bfb8))

* lint ([53bd58e](https://github.com/Esposter/Esposter/commit/53bd58ea547267fa3252596f2e8c6c2f25c5e06f))

* lint ([aaa4b4e](https://github.com/Esposter/Esposter/commit/aaa4b4e41a9b3e24a6387cceb30dc66202da6f00))

* lint ([ccbab13](https://github.com/Esposter/Esposter/commit/ccbab13775b65b268ff249b57b605efc9cd6ffa4))

* lint ([a243b76](https://github.com/Esposter/Esposter/commit/a243b76bd9653c355676180267c2a6c528eb8638))

* lint + add base emoji tests ([7bee7b7](https://github.com/Esposter/Esposter/commit/7bee7b74c446ff456896145f36450383a8dc89b6))

* make cutoff date after await call to be a little bit more lenient ([c012614](https://github.com/Esposter/Esposter/commit/c012614e007cdd6d6b458fe8cf782d6434713858))

* make schemas consistent ([4f7dfb3](https://github.com/Esposter/Esposter/commit/4f7dfb3cca9164bb0418b70fd7f465dae5b09663))

* make sure protocol is https ([ee35334](https://github.com/Esposter/Esposter/commit/ee35334853330c2d7c1e21a22dc8cd2b55460511))

* merge conflicts ([966c8ab](https://github.com/Esposter/Esposter/commit/966c8ab2f240feffd460083292ac038826c476f8))

* merge conflicts ([756481c](https://github.com/Esposter/Esposter/commit/756481cc0af0072da0bee3aa3415fe7d0b04a9cc))

* move check above ([0de6c91](https://github.com/Esposter/Esposter/commit/0de6c915d33d9bc5c2c1f7ef1c3cdf8ca0ad183c))

* move server create message entity to server folder ([2d28978](https://github.com/Esposter/Esposter/commit/2d289781329bb2a34db85d2891da825daf4efc8b))

* only allow uploading files in create message ([6ee0f7d](https://github.com/Esposter/Esposter/commit/6ee0f7d55f7c146083392f79194a8aabb4541849))

* only create non-empty messages ([5602a18](https://github.com/Esposter/Esposter/commit/5602a18cc54330dc2c6a21bed37223ddc9b799f6))

* only creator can change room name ([9cfe56b](https://github.com/Esposter/Esposter/commit/9cfe56b45fc051256d6343c4e9c499ebd75959c3))

* only show delete message item if creator ([6a63833](https://github.com/Esposter/Esposter/commit/6a638330588cc2dd078672975e6bc1ae587aaa6c))

* parse survey model ([c238c37](https://github.com/Esposter/Esposter/commit/c238c370e912945b24f73acbda36b0141e54d3db))

* partial ([f43a50e](https://github.com/Esposter/Esposter/commit/f43a50e78baf299efc84d007b016dbecefcf014f))

* prefault types ([919c46f](https://github.com/Esposter/Esposter/commit/919c46f7ae4f014e40072348a4e0e00f6ce9cf02))

* properly subscribe on mount/unmount hooks ([555a587](https://github.com/Esposter/Esposter/commit/555a5878784782a697803f2d0177691cabe6284b))

* query params ([7e3ceec](https://github.com/Esposter/Esposter/commit/7e3ceeceabce0eb07936400e05ad489b3eb87d64))

* read statuses should also return all fields ([44aee08](https://github.com/Esposter/Esposter/commit/44aee080947b94a8e754b24bdd9a4f996b556bb4))

* refine message schema + fixup all generics ([5b50370](https://github.com/Esposter/Esposter/commit/5b50370c7531614190ccc5ca40322334dbd24df8))

* refreshing room after delete ([10e6c08](https://github.com/Esposter/Esposter/commit/10e6c0886d960d3dadb267d0b688c3349384e1da))

* reload after sign out + fix up joining rooms ([cc86de1](https://github.com/Esposter/Esposter/commit/cc86de139dd04e49c69b585a930fd3c01012ea0b))

* remaining type issues ([ec32d55](https://github.com/Esposter/Esposter/commit/ec32d550508a239021fbc9fbbd3a010e41eacab3))

* remove divider as well ([65e5324](https://github.com/Esposter/Esposter/commit/65e5324698077baa97c39130f46bf1d92d5e4597))

* remove flex from v-row ([6ef9105](https://github.com/Esposter/Esposter/commit/6ef910539bdb82bc29525e6a04d48cd456a83d00))

* remove referencing vuetify internal types + update headers const names to be pascal case ([13d7c2c](https://github.com/Esposter/Esposter/commit/13d7c2c11fc30402a39cc09e3fa07c8c034f5c98))

* remove unnecessary and ([fc52696](https://github.com/Esposter/Esposter/commit/fc52696e0dcb0d16b3e5a9bcf55c196a726669ae))

* remove unnecessary badge ([5719ee4](https://github.com/Esposter/Esposter/commit/5719ee49cd4d07c121728f0bc7d7ec4e6a3a9bc3))

* remove unnecessary composable ([3046268](https://github.com/Esposter/Esposter/commit/3046268429bdb24812bb73e3af75f1132574e2f3))

* remove unnecessary create emoji ([649d18f](https://github.com/Esposter/Esposter/commit/649d18f6f9e65fb73660562afe616468677d4567))

* remove unnecessary margin ([515d66c](https://github.com/Esposter/Esposter/commit/515d66c5ab4f5fdf73c935ec5a96be915f906e70))

* remove unnecessary message listener ([1b5a685](https://github.com/Esposter/Esposter/commit/1b5a6858460bc68d7d88d13c1b890a74972be4fa))

* remove unnecessary type files + remove remaining unnecessary internal vuetify type ([1b22be6](https://github.com/Esposter/Esposter/commit/1b22be6dab7317ddee39f49962baedef7a68957b))

* remove unnecessary v-card-actions ([98db804](https://github.com/Esposter/Esposter/commit/98db8045c37634b8902db4cf8879b1d6ae27c08c))

* remove v-if for esbabbler ([77beaef](https://github.com/Esposter/Esposter/commit/77beaefde26c24a44c5ea73c2c46884d3aa07bba))

* rename ([2a7b616](https://github.com/Esposter/Esposter/commit/2a7b61678b13a71bb9425ec2f3428a98a810bb59))

* revert back lol ([4767f2e](https://github.com/Esposter/Esposter/commit/4767f2e0e6b80c9721521e2a9c114f1311b0b718))

* revert back to watch for web notif ([cc559f9](https://github.com/Esposter/Esposter/commit/cc559f9d6dc9af3877bbbcae65ec97634ce246f7))

* revert native plugin ([03ab03c](https://github.com/Esposter/Esposter/commit/03ab03cfa4ede9560cb48e395e5697307329b74e))

* run subscription at the beginning ([32a2731](https://github.com/Esposter/Esposter/commit/32a27311d803b44cda0ef2c84bae3b17e3f1bc21))

* set details based on hostname + add actually showing the notif ([54bff77](https://github.com/Esposter/Esposter/commit/54bff77fd6494950626f66b50537b5e297f71756))

* styles ([0a587a8](https://github.com/Esposter/Esposter/commit/0a587a835451b5511f6b234dde1bcc1a11020229))

* test msg ([b15269c](https://github.com/Esposter/Esposter/commit/b15269ccbcf456c5663c9709f7e85500f6ec5764))

* test what data is ([7431d2e](https://github.com/Esposter/Esposter/commit/7431d2e34b72001e9c0f5d2c64e80461e9c4a52d))

* tests to use the proper field ([094b99a](https://github.com/Esposter/Esposter/commit/094b99a69fa14daf2269e0984749ea4e4cfb6dd2))

* try show notif on post message ([bbdaa51](https://github.com/Esposter/Esposter/commit/bbdaa512b225ba2f7acc55ad3a1459b102ed6308))

* try subscribe on mount instead ([1cbaadf](https://github.com/Esposter/Esposter/commit/1cbaadf62b11cf9fea5e505476c828d4958c0cc7))

* try use the proper base url ([b1536c4](https://github.com/Esposter/Esposter/commit/b1536c46f76301d5a2b86cba18759e6dd8d77ad4))

* try using the registration to show notifs ([71451ec](https://github.com/Esposter/Esposter/commit/71451ece120c9e0e7b1be3d27c258233c206af2e))

* types ([e9298e8](https://github.com/Esposter/Esposter/commit/e9298e8061147421ed0e6cdb27931a575687ee3e))

* types ([b126707](https://github.com/Esposter/Esposter/commit/b126707aa502036b9efa208537b748c541829ed7))

* types ([a4c00c3](https://github.com/Esposter/Esposter/commit/a4c00c3b6ed73ebc68319f55aaf7669777b668e5))

* types ([4b74952](https://github.com/Esposter/Esposter/commit/4b74952e3072c5ef5c55fd2f502699283c73d92d))

* types ([0ee0d28](https://github.com/Esposter/Esposter/commit/0ee0d2811c4cb15fae9ede479ae22ce8ae80f600))

* unnecessary check ([469865a](https://github.com/Esposter/Esposter/commit/469865a9e3e857eb2097a0fe74a673b92cc958fc))

* unnecessary filter ([34e857f](https://github.com/Esposter/Esposter/commit/34e857f13d33259e81601e6b4872447fc26676cc))

* update edited value if initial value changes ([6ceefa4](https://github.com/Esposter/Esposter/commit/6ceefa48cff11c1dc61810dd694bd9e06ee3720f))

* update emoji for self ([cb64265](https://github.com/Esposter/Esposter/commit/cb642650198151122d4d35a2a70bfef2d72782ca))

* updating emojis ([306729f](https://github.com/Esposter/Esposter/commit/306729f03f445eedf02bcf3175e3c64a1104eb1d))

* use anchor href ([36eb910](https://github.com/Esposter/Esposter/commit/36eb910866a903542a91d84997799965d5056a7b))

* use app base url ([3e2aa4c](https://github.com/Esposter/Esposter/commit/3e2aa4c213c0e2fe52ef654593ef05ee83daa2d2))

* use back js ([59434f9](https://github.com/Esposter/Esposter/commit/59434f9dca25485bd18dee3dee028b9bf4de41aa))

* use back js ([761a124](https://github.com/Esposter/Esposter/commit/761a124783244f4546b4dc7b66b7ea418378b286))

* use badge props ([9296d70](https://github.com/Esposter/Esposter/commit/9296d70472989d7969bc13054fa6cca8c44c4c40))

* use files.json ([e81656a](https://github.com/Esposter/Esposter/commit/e81656ab208869fbc6a8d4820966fd96c854abfd))

* use inbuilt func ([8445964](https://github.com/Esposter/Esposter/commit/84459645ae502c19b9b2b7320c9a8fba0904bac2))

* use interface ([ad713ac](https://github.com/Esposter/Esposter/commit/ad713acb17f817ade97f9b87f6a92664eebc9d7c))

* use pinia to store global push subscription ([13fcdc9](https://github.com/Esposter/Esposter/commit/13fcdc932272c3700ff933ba10b58479d8c93145))

* use window timeouts ([4592c40](https://github.com/Esposter/Esposter/commit/4592c40ba050b449150d4abec56f19047580784a))

* use ZodInterface ([624ea49](https://github.com/Esposter/Esposter/commit/624ea49da6b56737c79643a7e547edd338b15151))

* user status enum ([5630545](https://github.com/Esposter/Esposter/commit/5630545db74ea96b42af3793984d1e28e5000a92))

* validation ([895df69](https://github.com/Esposter/Esposter/commit/895df69591b2e383860e24312012804b6658e959))

* video and audio size ([0c77e5e](https://github.com/Esposter/Esposter/commit/0c77e5e01d1fd748b149f409758050736e61c28e))

* vitest config paths + update plugin ([552deda](https://github.com/Esposter/Esposter/commit/552deda54e0346ddabaf92dd778dd546878c0bc5))

### Features

* Add heartbeat reconnect + tracking on create message ([3a6ed27](https://github.com/Esposter/Esposter/commit/3a6ed27919c9897642641688910e717119c782b3))

* Add link preview ([0d1b98c](https://github.com/Esposter/Esposter/commit/0d1b98c37ddf61b1fe3a362305ea7f7aa63b6bba))

* Add push subscriptions ([7767821](https://github.com/Esposter/Esposter/commit/7767821586f0bc263e1d6c6f1c9876ae01ca6f34))

* Add read statuses ([7152028](https://github.com/Esposter/Esposter/commit/715202818f9736479c22f87882c0bc45837005b4))

* Add themes tab ([efca03c](https://github.com/Esposter/Esposter/commit/efca03c255dbde850b125afa71264f5d6f73d415))

* Add update status + subscriptions ([cead6ad](https://github.com/Esposter/Esposter/commit/cead6ad8f6b7055037df348e5b2bd69b0e3715a7))

* Add upload file button ([d421e1a](https://github.com/Esposter/Esposter/commit/d421e1ac9244afe4e7d1f25a648adcf265ad43ac))

* Add user status ([fdffdca](https://github.com/Esposter/Esposter/commit/fdffdca68962c8634f631727b059d88304f87cf7))

* Add user status map store + subscribable ([bddee9b](https://github.com/Esposter/Esposter/commit/bddee9b89570a600d77b295eb40f01bd6d6bbcb8))

* Allow more options and fix refine to be comparing undefined ([a29a637](https://github.com/Esposter/Esposter/commit/a29a637a7cc08cf0328a49c48460897f6abc9728))

* nuxt use rolldown ([4b4465a](https://github.com/Esposter/Esposter/commit/4b4465a50ad648d9e6a0204e46451fa25fd70877))

* **test:** Add base tests for read multiple objects ([3bfb7d1](https://github.com/Esposter/Esposter/commit/3bfb7d15c44aba5d330623e587b8db8e035c608e))

* **test:** Add base user status tests ([ab51d2a](https://github.com/Esposter/Esposter/commit/ab51d2aadf1a898c126849755f794d0218ae3ca9))

* **test:** Add subscription tests ([fff6194](https://github.com/Esposter/Esposter/commit/fff6194c4d137521660c5cb603b292a5db2451c3))

* **test:** Add testing scripts as well ([3d2bd1b](https://github.com/Esposter/Esposter/commit/3d2bd1b75ebb323d7998d2f833fb3c112d2cea4c))

* try migrate to zod 4 ([b0e7ba1](https://github.com/Esposter/Esposter/commit/b0e7ba1fa154cb3ddc2d228b37dbc11283b4e1ac))

* update room on create message ([6e1b78d](https://github.com/Esposter/Esposter/commit/6e1b78d5fe807f231d96b9343d3266c658103cca))

* use rust native plugins ([d2c57fb](https://github.com/Esposter/Esposter/commit/d2c57fb49a3940d881aab632427c1db67ee3f04c))

### Performance Improvements

* Add oxlint ([2e92e38](https://github.com/Esposter/Esposter/commit/2e92e38522ba45bc223543e714010567aee6a0b2))

* don't include self status updates ([d54af56](https://github.com/Esposter/Esposter/commit/d54af565008aa20452a93a82516acb80f00f0be4))

* optimise remaining input validators ([5c8b9c2](https://github.com/Esposter/Esposter/commit/5c8b9c2b73f014f26c0cbbedc2dab782e12da937))

* partial select required fields ([ce9548a](https://github.com/Esposter/Esposter/commit/ce9548aacc2e56b773156a5cd8d8bda4768085e1))

* sanitise at beginning ([08fb95f](https://github.com/Esposter/Esposter/commit/08fb95fcbee7e9e9f4daffa42bf0447f99be350c))

## [2.4.1](https://github.com/Esposter/Esposter/compare/v2.4.0...v2.4.1) (2025-05-28)

### Bug Fixes

* cleanup types ([b59f652](https://github.com/Esposter/Esposter/commit/b59f65299c9112719d636347bc98ac1f503951b0))

* types ([c918317](https://github.com/Esposter/Esposter/commit/c918317dcd6a9de8220f393b93bc17048524fe52))

# [2.4.0](https://github.com/Esposter/Esposter/compare/v2.3.0...v2.4.0) (2025-05-23)

### Bug Fixes

* add back generate survey model sas url + add uploading files ([0367e45](https://github.com/Esposter/Esposter/commit/0367e45765c8a56dd765cf58740128b12c1dc2f3))

* add callbacks and validation not to save the same model ([86cbc13](https://github.com/Esposter/Esposter/commit/86cbc13111126ee015f87e9fe07ac84975842e4e))

* Add more delete file events ([f7926f5](https://github.com/Esposter/Esposter/commit/f7926f5def34d5e6894794c146b80274f95c4754))

* add question image model delete file ([6f7da33](https://github.com/Esposter/Esposter/commit/6f7da33b6543cd5237534929dc7cc072d4df46a4))

* calling correct containers + endpoints ([0f931cd](https://github.com/Esposter/Esposter/commit/0f931cd9b6a1a431ae15b74bc8ada0ee0889ad0b))

* decrement total items length ([b8f559a](https://github.com/Esposter/Esposter/commit/b8f559ae151c9626b3439188e21f0bb58a4f049a))

* don't do weird processing for now ([87d8593](https://github.com/Esposter/Esposter/commit/87d85938f5b7140760694a7d7c7e78e1d9f2ebde))

* don't serialize dates ([23192b3](https://github.com/Esposter/Esposter/commit/23192b35a9af62d80ffc0f2df3e09bda0f6ef52f))

* endpoint names ([51bc634](https://github.com/Esposter/Esposter/commit/51bc6348ad476fc792ee0f9232daf4cd74e9bcf1))

* escape regexp ([afa3c65](https://github.com/Esposter/Esposter/commit/afa3c653e4a5930a08120fb6414087f14f8a181c))

* get blob name ([80e0080](https://github.com/Esposter/Esposter/commit/80e00805fd5314294e42d1084b854127950cd339))

* imports ([4423f0d](https://github.com/Esposter/Esposter/commit/4423f0d36a4268926103c92b93e7f9397b3908c3))

* inline snapshots ([1a6f590](https://github.com/Esposter/Esposter/commit/1a6f590eb60ffddab7390ef0faec138cd8fdfc5a))

* lint ([2a5f055](https://github.com/Esposter/Esposter/commit/2a5f055786a57764285af5d5b6bddc938cd81692))

* make blob urls unique ([452f699](https://github.com/Esposter/Esposter/commit/452f6999a37879c00e38bf27c7d462471d18a0e0))

* make schemas consistent ([999bb39](https://github.com/Esposter/Esposter/commit/999bb390c801e0b3ad970632511da83fc0a462d4))

* make tests todo until we can someday mock azure storage :c ([2753b21](https://github.com/Esposter/Esposter/commit/2753b2194323d664d2cfedd03f2a5ec6106d412e))

* not calling await on promises ([0c2ad2b](https://github.com/Esposter/Esposter/commit/0c2ad2b2bd565f8c3a0beabfa8faa2b91f0cc0dc))

* publish survey ([d2d073d](https://github.com/Esposter/Esposter/commit/d2d073d620acf2f1c06c000d0762854f3e6302d7))

* reading survey ([b08254f](https://github.com/Esposter/Esposter/commit/b08254f2de4e8c6d21c74df5a16a9d122ec4fe8e))

* remove file ids ([20cfced](https://github.com/Esposter/Esposter/commit/20cfced944f599ab9a9ad1d8fd3f8b6c43b5bc83))

* styles and updates for toolbar title ([c6cda63](https://github.com/Esposter/Esposter/commit/c6cda6316f4c783c00d9fb9ee1fc563466e995bf))

* switch to only cloning proper blob urls ([37a7df8](https://github.com/Esposter/Esposter/commit/37a7df80e7e188b295d902fc549b8a75a6098ed4))

* tests ([0781e45](https://github.com/Esposter/Esposter/commit/0781e4570a668825d793ca7045d3b7c7bb2b6011))

* tests ([83073d7](https://github.com/Esposter/Esposter/commit/83073d7a8113a37fab4b6c54eb3456f392b28022))

* try updating the blob url regex ([c65fe12](https://github.com/Esposter/Esposter/commit/c65fe12fecb869aad5371a68dae61891397e1b85))

* type ([ca04433](https://github.com/Esposter/Esposter/commit/ca04433ea8dad4c4a47017f3e7da3e33a0d63bb5))

* type ([3ba7203](https://github.com/Esposter/Esposter/commit/3ba72033facc92ad0e89f9248f4d6e09ea837264))

* type ([c6613dc](https://github.com/Esposter/Esposter/commit/c6613dc7696d196b607c7870b171ab575074e717))

* unnecessary map ([c9a05e2](https://github.com/Esposter/Esposter/commit/c9a05e2ca6a66f681bc08a4ba76838a9bd239464))

* update blob urls when reading survey and model ([889a0a9](https://github.com/Esposter/Esposter/commit/889a0a92286ba723c328f88b809b0ad83d231fa9))

* updating survey ([2356661](https://github.com/Esposter/Esposter/commit/235666128bcd2a9a06eaa18152cf7274d25f2459))

* use $fetch ([8ac5691](https://github.com/Esposter/Esposter/commit/8ac5691f8fd7c060fd0cc8e2c3cddefd515ec421))

### Features

* Add cleaning up file ([edcd4a5](https://github.com/Esposter/Esposter/commit/edcd4a5e38dd42cad1ba7b9f4ddb0dc4d9357c82))

* Add clone directory ([76487d8](https://github.com/Esposter/Esposter/commit/76487d839a68909705dda51e52036595a565e7cc))

* Add create and update survey response endpoints ([1c13668](https://github.com/Esposter/Esposter/commit/1c1366865847c5f83cdb6937dad547d9e4737baa))

* Add creating survey response ([dc70787](https://github.com/Esposter/Esposter/commit/dc70787c1822c879120af07526d58ca16cbdaa36))

* Add custom toolbar buttons ([c47885f](https://github.com/Esposter/Esposter/commit/c47885fdc11dbea92fac9e5e81f25e26f39f0e94))

* Add deleting directory deep/non-deep ([3249585](https://github.com/Esposter/Esposter/commit/32495850b233f9498e723d039b388e87999d8934))

* Add download survey ([1f6f7e6](https://github.com/Esposter/Esposter/commit/1f6f7e61ad1e64507982b89874e61278ddef2ff5))

* Add generate survey model sas url endpoint ([3d22573](https://github.com/Esposter/Esposter/commit/3d2257354dcdfb96bedc332475d86f17e08deb45))

* Add loading survey response from local storage ([e0acc0f](https://github.com/Esposter/Esposter/commit/e0acc0fb70cebab6953f825d89c5fa8f65a24892))

* Add upload survey ([6ce2131](https://github.com/Esposter/Esposter/commit/6ce2131c642755e5bf16b54cda5269fdafc0a4f6))

* grab published survey blob instead ([8a80dbc](https://github.com/Esposter/Esposter/commit/8a80dbc61e9761486b87141e88ae6c1e6ba3112a))

* **test:** Add like wrong user tests ([78ed386](https://github.com/Esposter/Esposter/commit/78ed386d7623356e64f9f9b3b637f5521be66bb0))

* **test:** Add post with wrong user tests ([a076198](https://github.com/Esposter/Esposter/commit/a07619862c96645845f02340fdf591a38fe8f992))

* **test:** Add room with wrong user tests ([21ac2ee](https://github.com/Esposter/Esposter/commit/21ac2ee6e7602897ba61cc4fc3a5ba1b63951bfc))

* **test:** Add survey wrong user tests, but todo for now ([90b1cd6](https://github.com/Esposter/Esposter/commit/90b1cd6f342b5290bac617edcef59940f200069a))

# [2.3.0](https://github.com/Esposter/Esposter/compare/v2.2.1...v2.3.0) (2025-05-16)

### Bug Fixes

* add files ([657132f](https://github.com/Esposter/Esposter/commit/657132f5b55d525d14dd97b63edf55c38b135f5f))

* include trailing slash ([d7e5db8](https://github.com/Esposter/Esposter/commit/d7e5db8cc3efaf086f947b57c39294aab59f0739))

* make all user avatars use styled component ([6f757ad](https://github.com/Esposter/Esposter/commit/6f757adde873440b846ac60816b830790f374ba5))

* tidy up import types and css ([c4395a0](https://github.com/Esposter/Esposter/commit/c4395a07eb1916ad4a44992eb2b5e7c21741a114))

### Features

* Add cmaps ([53bb18d](https://github.com/Esposter/Esposter/commit/53bb18d4a5cfd8cff4e353a5c92fa6f6c80ca0ca))

* Add dividers to segment message actions ([574c8e9](https://github.com/Esposter/Esposter/commit/574c8e912bf3dec7b2c06bbcc489fb1c1e4aea53))

* Add emoji shortcuts ([4951e55](https://github.com/Esposter/Esposter/commit/4951e5569a49a4f9be28ad8597d6a036a19c09d8))

* Add insane reaction menu with fallback ([1b27930](https://github.com/Esposter/Esposter/commit/1b279306b1d5e4a5cc10c69d9a10f182abc1f052))

* add shortcut reactions to menu + make gap classes more succinct ([0257bed](https://github.com/Esposter/Esposter/commit/0257bed729c64c06576ba665dc445c677e08d16c))

* Make emoji operations optimistic ([b48efff](https://github.com/Esposter/Esposter/commit/b48efff49c20f295038ea736c0dec2965b6e0f6c))

## [2.2.1](https://github.com/Esposter/Esposter/compare/v2.2.0...v2.2.1) (2025-05-14)

**Note:** Version bump only for package @esposter/app

# [2.2.0](https://github.com/Esposter/Esposter/compare/v2.1.0...v2.2.0) (2025-05-14)

### Bug Fixes

* Add default content ([5d9fdec](https://github.com/Esposter/Esposter/commit/5d9fdec24979a5e75062c52927fdc0bdde14f861))

* add default fallback so counter appears on the right always ([f2e192b](https://github.com/Esposter/Esposter/commit/f2e192beb020f4b9d3f1711d87617382326f37f9))

* Add defaults + change to only delete single file ([9af02c4](https://github.com/Esposter/Esposter/commit/9af02c4a06d659d42a6bd3bca034b8f3c37ef124))

* Add file ([a56fe68](https://github.com/Esposter/Esposter/commit/a56fe68259f42388e2447fcc8dd7d407080d4ec4))

* add is preview to file container as well ([8585f26](https://github.com/Esposter/Esposter/commit/8585f26458f0e0e434d2ec0069f7a09b175a8f6e))

* add vue test utils back ([80adaf0](https://github.com/Esposter/Esposter/commit/80adaf0e3aba3fdec455a25e763aef2c21355b52))

* allow full screen ([a816d67](https://github.com/Esposter/Esposter/commit/a816d6798afb971804b3e6949638667a557f76a5))

* allow removing message when there are files, discord doesn't do this c: ([a9b50d1](https://github.com/Esposter/Esposter/commit/a9b50d1a12c6d83541e6cb7bdcaaa65eedfdd3d3))

* clone default value so reactivity doesn't leak ([712b6ee](https://github.com/Esposter/Esposter/commit/712b6ee1213758e8bd4da7591a269ca2fce1a66e))

* commit block list headers + add files to schema ([6cb8820](https://github.com/Esposter/Esposter/commit/6cb88200278b02855d17f0c89dea7ce709717b68))

* CSP images ([7374e0d](https://github.com/Esposter/Esposter/commit/7374e0d3fbeebfa1bff43bfaebd08108d7e43032))

* deep assertion ([5a5660b](https://github.com/Esposter/Esposter/commit/5a5660bac524f174f0b240f1932d8eee45c4574b))

* default ([8c30aad](https://github.com/Esposter/Esposter/commit/8c30aadd4fdff28a475e9637271cbb4dcb47bce3))

* disable pointer events and user select for preview ([da76ec2](https://github.com/Esposter/Esposter/commit/da76ec2943b010ac796ca1cdecad915ddbf8c437))

* document remaining policies ([b1ce1e0](https://github.com/Esposter/Esposter/commit/b1ce1e0ad599926812d673be8af25445a3b7245c))

* don't allow delete forward file ([37b5367](https://github.com/Esposter/Esposter/commit/37b536780f16e0cfa02cd5befca8652450a64952))

* don't allow delete forward file in endpoint ([5c3b768](https://github.com/Esposter/Esposter/commit/5c3b7681cdb9c3ffe26d3297e1833e6fc62a0e92))

* emit name to not collide with vuetify internal emits ([7b892ee](https://github.com/Esposter/Esposter/commit/7b892eee61b2afb3d5f78f150ccf4665e79312ab))

* file validation ([b6345f8](https://github.com/Esposter/Esposter/commit/b6345f87a12f5e8c935b2e6a9d7d57ee66285f25))

* finally fix up forwarding to handle proper ordering... ([9819dc2](https://github.com/Esposter/Esposter/commit/9819dc2506893c18b50e5d5f175d43988305a8eb))

* floating promises ([13566c4](https://github.com/Esposter/Esposter/commit/13566c4f46a9f60c0956d9a075f1438fda231196))

* floating promises ([7abd187](https://github.com/Esposter/Esposter/commit/7abd18741481fd448d45f6cf3c667caf93484ec1))

* just re-implement same api to achieve best perf and elegance in API ([b0e6bd3](https://github.com/Esposter/Esposter/commit/b0e6bd3907ff36b674b19ad8936239387a684e42))

* lint ([a9472bd](https://github.com/Esposter/Esposter/commit/a9472bd1ffd8df63a9cd5a3988efc3a7c4657101))

* lint ([094fbd9](https://github.com/Esposter/Esposter/commit/094fbd92b7c8c355b7e6af37959d101807e03d9c))

* lint ([104d11c](https://github.com/Esposter/Esposter/commit/104d11c127d2db9061db904891c6eb3618b48b5a))

* lint ([81d62f4](https://github.com/Esposter/Esposter/commit/81d62f465ced14d4442e8cdeeb417629ddb3cb6e))

* make file renders with images eager ([96a4b10](https://github.com/Esposter/Esposter/commit/96a4b10d7cb31da634f1c3e55702f55fac9f250a))

* make placeholder simple ([14e845c](https://github.com/Esposter/Esposter/commit/14e845c724620ecda636cf1d9a5dd9653670840b))

* make text center ([0320bf6](https://github.com/Esposter/Esposter/commit/0320bf6d97a50a6190883eb7e62a903ce4d73538))

* move resetting till after complete hook ([7a68c7d](https://github.com/Esposter/Esposter/commit/7a68c7d916bb88a613fe41cc2355155edf8f9ffe))

* only allow viewing images for now ([b85364d](https://github.com/Esposter/Esposter/commit/b85364d7d53c543f614b628dafa76417d222744c))

* only reset after send ([5b71afa](https://github.com/Esposter/Esposter/commit/5b71afa9dc85f5f6fa6e6092761c2f0817bff2dd))

* only show header if files ([21b6147](https://github.com/Esposter/Esposter/commit/21b6147bfe4c9df486abe45957e0e735f7d49a46))

* optimistically update UI + add is edited UI ([075ccd0](https://github.com/Esposter/Esposter/commit/075ccd013dc32c8e959592b1aaa135a2357c48df))

* put back useTimeoutFn and use it directly ([0310b45](https://github.com/Esposter/Esposter/commit/0310b45fde0a7773a9905307db8ff81ac4952ba2))

* refactor some unnecessary code ([7eb35c4](https://github.com/Esposter/Esposter/commit/7eb35c4732008856bc6929a2cec57257db295965))

* remove annoying events dep ([0b93036](https://github.com/Esposter/Esposter/commit/0b930366d033844656a104003fc68f838c08599c))

* remove unnecessary description ([ce3edc7](https://github.com/Esposter/Esposter/commit/ce3edc7e7f305c82e009556bf9a2376b774f086f))

* remove unnecessary if check ([a62b6f0](https://github.com/Esposter/Esposter/commit/a62b6f04aeae1f112b555bc2b360faef0a68a97b))

* remove unnecessary important styles ([9271dd6](https://github.com/Esposter/Esposter/commit/9271dd6fe0425b02fe1ea4a08e24fe0e2a34bf50))

* remove unnecessary margin in v-row ([1c78ea4](https://github.com/Esposter/Esposter/commit/1c78ea4914d65ae692086f1d59d239a7468ce524))

* remove unnecessary sort in frontend ([c83c626](https://github.com/Esposter/Esposter/commit/c83c626cd6e5820a71595337fff0545bc2c66ff3))

* rename ([5bbce36](https://github.com/Esposter/Esposter/commit/5bbce36f0eebc9069302741659a025c5587712bc))

* reply name + created at ([5b8dfbf](https://github.com/Esposter/Esposter/commit/5b8dfbfcc6167a805f67d3a602daf9ce74a95ec8))

* return links that will download file ([29dd760](https://github.com/Esposter/Esposter/commit/29dd760d16f6a8d79534fd93416a68eeaf1b1824))

* searcher keys + delay ([355389f](https://github.com/Esposter/Esposter/commit/355389fd1adeee0ce24ad5c7f0a4f482f5896f28))

* snapshot ([1e65ac5](https://github.com/Esposter/Esposter/commit/1e65ac51ab4a2492a063e0b94a206541d96e6fe1))

* some lint rules ([1c049c2](https://github.com/Esposter/Esposter/commit/1c049c21cc7991723cb8608ea6732526c1c6904e))

* some preview sizes ([b92461a](https://github.com/Esposter/Esposter/commit/b92461a72c9e811b3108b76eb90b7f666c100803))

* some scss lint errors + document some security policies ([a0b6191](https://github.com/Esposter/Esposter/commit/a0b61910c0ba1a2877febb4b266f77ab5f91e95e))

* specify worker url ([fa14571](https://github.com/Esposter/Esposter/commit/fa145714db7767b1cc8c5c41a95f43bdc71f0573))

* survey ([4cab0fc](https://github.com/Esposter/Esposter/commit/4cab0fc59fa04d5309434fac482089503d308909))

* switch back to absolute pos ([90a07b1](https://github.com/Esposter/Esposter/commit/90a07b144239ceaa1a09ef820d693e4e917a8bcf))

* try emit new message instead ([a177643](https://github.com/Esposter/Esposter/commit/a17764320d43c2127f4f50fb0463660770db5fc4))

* type ([b7d69fb](https://github.com/Esposter/Esposter/commit/b7d69fb23c8b38596750bd0215ea860643edfbf8))

* type ([57e308a](https://github.com/Esposter/Esposter/commit/57e308a461dba5603e34d5b73880b2c9cde4a5c3))

* type generics ([c9e595f](https://github.com/Esposter/Esposter/commit/c9e595f54922e22271e0cf84fd3716a234c7db78))

* **types:** remove remaining extends z.ZodType generics and use primitive extends for succinctness ([90b081f](https://github.com/Esposter/Esposter/commit/90b081f130180fb37b9e25ccd9f3b7f50edbbc45))

* **types:** update generic zod type schema to be more succinct ([635371a](https://github.com/Esposter/Esposter/commit/635371aa35240530429563a4f580fb296542acb7))

* **UI:** forward & reply ([c88310c](https://github.com/Esposter/Esposter/commit/c88310c58317dded8a7d345578e4677bb31cc4d1))

* **UI:** Update borders to completely match ([fd1188b](https://github.com/Esposter/Esposter/commit/fd1188b9356293335bd500d9a3e26b2fc302cc48))

* update and delete message validation ([c662b39](https://github.com/Esposter/Esposter/commit/c662b394565d064be76e92e90160cb5860703949))

* uploading new files + polish rendered file UI ([0814ce5](https://github.com/Esposter/Esposter/commit/0814ce57cef5974a4b70b72f9d39a9fb5c2227a9))

* uploading new files + rendering ([466bb2b](https://github.com/Esposter/Esposter/commit/466bb2b1d21d1799e9708750c48e904b3f038809))

* use esm import for require ([f733554](https://github.com/Esposter/Esposter/commit/f7335546c50735d9202f9fae4aa61219890aed59))

* user schema + add mock db ([bc1c1bf](https://github.com/Esposter/Esposter/commit/bc1c1bfb6d9768bd0a107a9c56fcfbc8aaae8563))

* validations ([46e76fb](https://github.com/Esposter/Esposter/commit/46e76fb2f4279f3427225d5d0be856b2df6b1c02))

* where clauses ([610b33c](https://github.com/Esposter/Esposter/commit/610b33cbde569e0a7409a596e268ba4ef32ad1f3))

### Features

* Add basic test support for trpc endpoints ([6f87850](https://github.com/Esposter/Esposter/commit/6f8785010226a06a9b376988cbe3350dcb779d39))

* Add batch message UI ([2096a3c](https://github.com/Esposter/Esposter/commit/2096a3cb898ba4f2164398978cd4f6dae5bc8c90))

* Add better webpage defaults ([8d903a2](https://github.com/Esposter/Esposter/commit/8d903a2bc9c88dc9004f0f4e6d7b2b39058200f4))

* Add crazy context menu map click ([cdf3503](https://github.com/Esposter/Esposter/commit/cdf350394a3e7bd8c38424ec8a2bba60c72ddc22))

* Add crazy dynamic column layout ([9ff9639](https://github.com/Esposter/Esposter/commit/9ff9639d230f9d5149fc08f3d394cade603892e0))

* Add crown for room creator ([8fd01ab](https://github.com/Esposter/Esposter/commit/8fd01ab9ac0bbbcbc89fb7ea16d6697e7d27a766))

* Add delete file option menu ([f88fcea](https://github.com/Esposter/Esposter/commit/f88fcea04fdeb303f1719ffc40f666afbb805071))

* Add delete files endpoint ([0f3594d](https://github.com/Esposter/Esposter/commit/0f3594dcd1006838f1ff4a4629ce444611f805dd))

* Add downloading files ([a71402d](https://github.com/Esposter/Esposter/commit/a71402d63fd934dc276e4c0f3be3fe5cd1fcb0fa))

* Add dropzone ([e525b1e](https://github.com/Esposter/Esposter/commit/e525b1ee56487908cea3f2b94def41073dc17c7c))

* Add esc to cancel ([03d82ea](https://github.com/Esposter/Esposter/commit/03d82eaa463e2f27f6bbf97d5ae5d999b0760355))

* Add file size ([60aedb4](https://github.com/Esposter/Esposter/commit/60aedb402066c23ea19abfceb180c0092f1da985))

* Add forward checkboxes ([a685433](https://github.com/Esposter/Esposter/commit/a685433e3acd92efbdc5363d0f5183981e51860e))

* Add indicator of number of forwards ([79b796f](https://github.com/Esposter/Esposter/commit/79b796f8e404928477febe14e9dacc7dd2bc64bd))

* Add insane border radius calc ([515e594](https://github.com/Esposter/Esposter/commit/515e594d854b9119a4646f0ede13ee685ad4f988))

* Add is edited prop ([644de20](https://github.com/Esposter/Esposter/commit/644de20c91719a6f273ff86f888098d1c72f3f7d))

* Add is loading visual state ([664d3ec](https://github.com/Esposter/Esposter/commit/664d3ec0382ce1df8f529b43dda86c47bf4e248c))

* Add mock sessions + add more tests ([cb11a51](https://github.com/Esposter/Esposter/commit/cb11a513e7d2ff01296d67c5930c40a678698b0e))

* Add nice file UI ([2f7bc46](https://github.com/Esposter/Esposter/commit/2f7bc464912d0179cd76a22c06dcfb38da5ccf02))

* Add pdf support ([0ceafcb](https://github.com/Esposter/Esposter/commit/0ceafcbd291dd4b5a67a66ef373623aaf6aeda4d))

* Add preview message to forward ([d7dc749](https://github.com/Esposter/Esposter/commit/d7dc74952c727f4ba72d4bb6fd3982ffc46f2276))

* Add remaining basic tests c: ([ba94691](https://github.com/Esposter/Esposter/commit/ba946912acfa3b6aa9f4c2a551b5315efd7ad822))

* Add rendering file in messages ([dec3bc4](https://github.com/Esposter/Esposter/commit/dec3bc4cf7a62a398d9e476a308c28641921f75b))

* Add room filters ([4bd24f8](https://github.com/Esposter/Esposter/commit/4bd24f8f45307d59dec1f2232b3a3f30f263f530))

* Add sample tmx snapshot tests ([aa4545c](https://github.com/Esposter/Esposter/commit/aa4545cca2fb621f8c8a586eb3ef66774e448049))

* Add upload and commit blocks ([7ce625e](https://github.com/Esposter/Esposter/commit/7ce625e08368294e76aaa58009607baec49c3d67))

* Add v-viewer + refactor forward ([faffe01](https://github.com/Esposter/Esposter/commit/faffe01806b446c592c0848ff8c296ef9d94e220))

* Add validation ([5706ca8](https://github.com/Esposter/Esposter/commit/5706ca863c829b5dda8022d40b58660b32ec14ca))

* Add validation for empty files ([0f90bd4](https://github.com/Esposter/Esposter/commit/0f90bd41c089d3f6231cb09bef595c22160a3eb9))

* Add view files ([f77e65c](https://github.com/Esposter/Esposter/commit/f77e65cea18c1a30200120109eca17109f5e85e5))

* change to reply if cannot edit ([ec35c66](https://github.com/Esposter/Esposter/commit/ec35c668f14306b9c2af97b9fd777c77c8521e8c))

* Delete files when deleting message ([f026047](https://github.com/Esposter/Esposter/commit/f02604737eb022db337cdd1a86a6bc607002fd94))

* Delete files when deleting room ([6175944](https://github.com/Esposter/Esposter/commit/6175944ed211dd68ec295f070d8b5743a53b3396))

* Enable back survey + add dark mode + fix up reading surveys ([777ab9d](https://github.com/Esposter/Esposter/commit/777ab9d49fa3c4201472bd95fea76302b36d77d7))

* Finally add last piece of the puzzle with deleting file ([682b5c0](https://github.com/Esposter/Esposter/commit/682b5c037aedd07a5f509a478b9e7b0f6b41f2b4))

* Finally fix up edge cases of replying and forwarding... ([3ef54d9](https://github.com/Esposter/Esposter/commit/3ef54d9ece789ee3489d33744ab71837e856294a))

* fix up on join and leave to also accept list of room ids ([6fd1aa8](https://github.com/Esposter/Esposter/commit/6fd1aa803721e4fbc550ba4bc0f0d741f1e81596))

* Remove bottom padding to add more real-estate ([89c6dca](https://github.com/Esposter/Esposter/commit/89c6dca61394ff36e990255ca6a5e1c8f5681966))

* rewrite xml2js to typescript ([ec28805](https://github.com/Esposter/Esposter/commit/ec28805140c79c9f8bc0746b7ee0c1c948cbb506))

* Switch forward room dialog to use unified searcher composable ([ce79d6b](https://github.com/Esposter/Esposter/commit/ce79d6bd462008b8cab2913e90a7cf15e4e26d14))

* switch to unified useSearcher composable that contains all the possible functionality + pagination ([5375a4e](https://github.com/Esposter/Esposter/commit/5375a4ee118826dd001fad6c62a1be1dc9b6090b))

* **test:** Add basic room endpoint tests ([c29da65](https://github.com/Esposter/Esposter/commit/c29da65a5a2256a3d9e4b5e16aa6147a25e2024c))

* **test:** Add comment endpoint tests ([e8972fa](https://github.com/Esposter/Esposter/commit/e8972faba83b9d0a16f7972727e56da47198e1ee))

* **test:** Add coverage to root ([fd36fc1](https://github.com/Esposter/Esposter/commit/fd36fc109c81fbf79a3f3636d03716876985fe3a))

* **test:** Add leave room tests ([a99521a](https://github.com/Esposter/Esposter/commit/a99521abb75bc64d85cb7ea248ce3a3cfdacb396))

* **test:** Add more insane room tests ([5876a08](https://github.com/Esposter/Esposter/commit/5876a08b284cc9a8e598f24bbd5c58141f5afca0))

* **test:** Add remaining comment endpoint tests ([78991e7](https://github.com/Esposter/Esposter/commit/78991e79a247ae365fff8c1017dee1a762e12618))

* **test:** Add remaining post endpoint tests ([1d36e11](https://github.com/Esposter/Esposter/commit/1d36e11d00ea15bb26cbdfa0690091e12d143c23))

* **test:** Add simulating mock user joining room ([557853b](https://github.com/Esposter/Esposter/commit/557853be652657d98f6a8adc794a820eb18ded7a))

* **test:** Add survey endpoint tests ([20b6678](https://github.com/Esposter/Esposter/commit/20b6678b658a59b44048d7cc8fdab0d5bc6cf6f9))

* Upgrade to nuxt 3.17 + fix up trailing slash for only external docs ([e6707a9](https://github.com/Esposter/Esposter/commit/e6707a963e337d44675a5cbb8aecf559779c358b))

### Performance Improvements

* optimise to only run setup mock context per file ([fc791e6](https://github.com/Esposter/Esposter/commit/fc791e61b441242463f6bef085e16194be6808e0))

# [2.1.0](https://github.com/Esposter/Esposter/compare/v2.0.0...v2.1.0) (2025-04-25)

### Bug Fixes

* Add support for octet input parser for file uploads ([a6c407b](https://github.com/Esposter/Esposter/commit/a6c407b7c0e5dd11ac0326c92b63527b571e510e))

* docs links ([f4257b4](https://github.com/Esposter/Esposter/commit/f4257b416d4ef9a42c34cc05769a2d80a6535fdc))

* export methods ([edc1d6b](https://github.com/Esposter/Esposter/commit/edc1d6b629c9cbf98e977f7136be916860982782))

* remove non-existent func ([29c77ae](https://github.com/Esposter/Esposter/commit/29c77aed35e034ecef073f13bbdc3606533dd8fa))

* remove unused datamap ([3289b40](https://github.com/Esposter/Esposter/commit/3289b40139ce9d0943a9f45c527ea95fdf535c93))

* split containers based on access level ([1b58fe9](https://github.com/Esposter/Esposter/commit/1b58fe98d67429828a28544a769a61cb445499e4))

* update vue-phaserjs types ([6b83156](https://github.com/Esposter/Esposter/commit/6b83156ab738bc28798875cdc27c940290bd8938))

### Features

* Add reply spine ([9884809](https://github.com/Esposter/Esposter/commit/9884809313c6cc2c52a919fd847a8cb9f66932de))

* Add room subscriptions ([6dc335f](https://github.com/Esposter/Esposter/commit/6dc335fe716e24d8c763e3806dd18a9dc2c5e1ed))

* Add scrolling to reply ([9aefd83](https://github.com/Esposter/Esposter/commit/9aefd8311554a3d191c976e6a46afa90d9573b7f))

* Add shared vitest.config and add basic test for parse-tmx ([5953090](https://github.com/Esposter/Esposter/commit/5953090532f3457647aec85cc2df3351a7689183))

* make container properties code-first ([65d6698](https://github.com/Esposter/Esposter/commit/65d6698d609bd48381612c34bdfe7f97451252f5))

### Performance Improvements

* remove unnecessary vite plugin node polyfills ([dfb299e](https://github.com/Esposter/Esposter/commit/dfb299e975a25f46b38136bcf8b04b6fe38c1a8d))

# [2.0.0](https://github.com/Esposter/Esposter/compare/v1.42.3...v2.0.0) (2025-04-19)

**Note:** Version bump only for package @esposter/app

## [1.42.3](https://github.com/Esposter/Esposter/compare/v1.42.2...v1.42.3) (2025-04-19)

**Note:** Version bump only for package @esposter/app

## [1.42.2](https://github.com/Esposter/Esposter/compare/v1.42.1...v1.42.2) (2025-04-19)

**Note:** Version bump only for package @esposter/app

## [1.42.1](https://github.com/Esposter/Esposter/compare/v1.42.0...v1.42.1) (2025-04-19)

**Note:** Version bump only for package @esposter/app

# [1.42.0](https://github.com/Esposter/Esposter/compare/v1.41.0...v1.42.0) (2025-04-19)

### Bug Fixes

* Add migration sql ([08b38f6](https://github.com/Esposter/Esposter/commit/08b38f62579283bb8593d93a4e1797dcbbf43f8e))

* adjust padding ([0c318e1](https://github.com/Esposter/Esposter/commit/0c318e1787e81da5b27887a6be9d8379efc39d6d))

* auto navigate if already joined ([9ba387b](https://github.com/Esposter/Esposter/commit/9ba387b99abf65b6097dc69223c13c9995167de3))

* avatar size ([5dd4698](https://github.com/Esposter/Esposter/commit/5dd4698cf068fc970f3667bf52e9d9c8bc2e3ace))

* css styles ([d7802b6](https://github.com/Esposter/Esposter/commit/d7802b6aa2e9deb1f9abd45265e2d80404398bfb))

* data types ([e469184](https://github.com/Esposter/Esposter/commit/e469184709671a5360ebbd01485e7d26af83fb8a))

* db migrations + fix up some small UI ([54faf71](https://github.com/Esposter/Esposter/commit/54faf71808c0748da14a1b7d8aa47a4e25fa36f2))

* debounce search ([85b330f](https://github.com/Esposter/Esposter/commit/85b330f21e8f5fb5c21a2ce000cf326c95d3f655))

* deps ([92932ba](https://github.com/Esposter/Esposter/commit/92932ba2f042e7fe4e7a077d84480b4df2fce9e3))

* finally fix up mention styles ([bdf3497](https://github.com/Esposter/Esposter/commit/bdf34974b8d7f247b68901fe203b5f200b7ff5e0))

* finally fix up remaining relative path issues ([8968893](https://github.com/Esposter/Esposter/commit/896889345b312ab498ff8794ca588f2c5cdb7a8c))

* fix up typedoc relative paths ([a847aa6](https://github.com/Esposter/Esposter/commit/a847aa60becb944d814d30337eafbf6dbd840103))

* fix up typedoc relative paths continued ([dc0de55](https://github.com/Esposter/Esposter/commit/dc0de555e03585715173c2017d8f3d1daae0ed5d))

* get current instance before first await ([62e7dbe](https://github.com/Esposter/Esposter/commit/62e7dbec1d23b8a199775901ce549e69785e1651))

* lint ([c237159](https://github.com/Esposter/Esposter/commit/c237159c6ffd5af15ddfb1604dedea095282691e))

* mention background color ([129bb84](https://github.com/Esposter/Esposter/commit/129bb84ea8bb8e2e1b6aca0c408dd86f0aed68b6))

* missed reactivity set ([9165f16](https://github.com/Esposter/Esposter/commit/9165f16c1184903e01839aae71677b08f3dadee8))

* no longer need random tracker since was an issue with useReadData ([78f4c90](https://github.com/Esposter/Esposter/commit/78f4c90d690b0f865ac3a506b6d760564f20aa3b))

* page title ([98be994](https://github.com/Esposter/Esposter/commit/98be9942712c2a011072a57f4eee18ce72def0b7))

* perms + navigation path ([c5e9003](https://github.com/Esposter/Esposter/commit/c5e9003437d8e293db19442feb0a2921e4ec49e8))

* positions to make UI a bit better ([3869380](https://github.com/Esposter/Esposter/commit/3869380bb59bd132436df70ad6161ce539c5901f))

* reactivity issues, use ReadonlyRefOrGetter ([c6bb5c9](https://github.com/Esposter/Esposter/commit/c6bb5c9771c2217c674e7cb1f2444d4dd3c3793a))

* remove unnecessary top level await ([6efa6fa](https://github.com/Esposter/Esposter/commit/6efa6fa05062c48adce340d33ba9009e73edd6ba))

* rename to just reply for succinctness + fix up reactivity issue by setting the map then retrieving it ([87423ae](https://github.com/Esposter/Esposter/commit/87423aecf3ca63bc85e7739ad0c557aa230edf10))

* revert back changes ([ad04b43](https://github.com/Esposter/Esposter/commit/ad04b43a848aed36299ce52ee7054099166018b9))

* styles ([79a3259](https://github.com/Esposter/Esposter/commit/79a32594cf957f7597d20e82cc4b41bb03594957))

* try only replacing certain paths... ([c4aa4c2](https://github.com/Esposter/Esposter/commit/c4aa4c2d03dfa6db3b2ef3a6831831d749b7e248))

* try updating modules too ([2c14517](https://github.com/Esposter/Esposter/commit/2c1451788ae1a0d635155bc5b9d971a5e1901387))

* typing timeout use map ([118069f](https://github.com/Esposter/Esposter/commit/118069fea9532f61f100cc7fb784837df8dffe76))

* update check to be stricter ([abb3095](https://github.com/Esposter/Esposter/commit/abb3095fd6b7b9f38b8e20182b4d8f43c9b000b3))

* update snapshots ([b11d87c](https://github.com/Esposter/Esposter/commit/b11d87cbcb84377d6b6e03a378038ece4616bdbe))

* use class which is reactive for some reason ([ab5b4cb](https://github.com/Esposter/Esposter/commit/ab5b4cb40e7bf8474ec4e49ba300f36a5a5ebfa9))

* use tsx + add tsconfig.json at root ([9abf1bd](https://github.com/Esposter/Esposter/commit/9abf1bd21e1ce692a00bf59864a227e378e29177))

### Features

* Add invite page ([f961532](https://github.com/Esposter/Esposter/commit/f9615329b06615a2fa96f1acb3568b45022be56d))

* Add num members info + update deps ([84b4a60](https://github.com/Esposter/Esposter/commit/84b4a608988aa1a95ba2769eee53834c1ca46776))

* Add polyfills ([f2e60ba](https://github.com/Esposter/Esposter/commit/f2e60baa41aacdf1d0f49ecfe0876312c7ad8f12))

* Add some little nicer UI for copying ([811f017](https://github.com/Esposter/Esposter/commit/811f017c8694d4d14a1ae4b759f57c505c485306))

* Add tsconfig.json at root to enable complete devtooling with eslint + tsconfig across the whole monorepo in both packages and at the root for scripts ([5b1e48c](https://github.com/Esposter/Esposter/commit/5b1e48c742a023852a7ab1ed5a53f2400228be20))

* Change to use symlinks ([6efc67a](https://github.com/Esposter/Esposter/commit/6efc67a13aa2aec0b3d2b494a857095106b9ad44))

* Move invites from azure to postgres since we need the joins ([bf0b085](https://github.com/Esposter/Esposter/commit/bf0b0856a9df0bab7b526a254836ad8a5cc724ae))

# [1.41.0](https://github.com/Esposter/Esposter/compare/v1.40.0...v1.41.0) (2025-04-06)

### Bug Fixes

* also check for empty text ([95bc612](https://github.com/Esposter/Esposter/commit/95bc61230ad8638bba24665c3dbd0d38e486d914))

* configuration shouldn't have metadata since it auto creates fields ([6beaead](https://github.com/Esposter/Esposter/commit/6beaead7f78cb1b944ba72245d6145628a4bc8d3))

* disable xss validator for now ([d309123](https://github.com/Esposter/Esposter/commit/d3091232dc4ce951c4008916f0acb9584595a99f))

* edit item ([e96dc31](https://github.com/Esposter/Esposter/commit/e96dc319e5aac6a90296da49f9fafe997b848f34))

* likes ([51d3d3b](https://github.com/Esposter/Esposter/commit/51d3d3b6d6b9cea619f5270b1b23b7fdfe163981))

* loosen types to include AzureEntity for paginations ([7250f7a](https://github.com/Esposter/Esposter/commit/7250f7a88402f330907283d242bf04caa4fc9a09))

* reactivity issue with room id ([a6c1c16](https://github.com/Esposter/Esposter/commit/a6c1c1656b58cf38a1fcd6101444d5b86f9afd93))

* render rich text in tooltip ([fbec71b](https://github.com/Esposter/Esposter/commit/fbec71b718e495c65449d63e164628f2ed953685))

* subscibe on watch + fix up timeline ([d62a351](https://github.com/Esposter/Esposter/commit/d62a351418bd643fc209fc413312749c6c0cbbc2))

* toast too many requests error ([dec0c61](https://github.com/Esposter/Esposter/commit/dec0c613619c51da3b6c3700d797af231091d1fe))

* types ([e49c693](https://github.com/Esposter/Esposter/commit/e49c6933e8b2b57681e8d7526149e66cacaa040f))

* types ([e66131a](https://github.com/Esposter/Esposter/commit/e66131a6b7f635d0367368beac675e3467fa80a4))

* use session at the top ([4b47e82](https://github.com/Esposter/Esposter/commit/4b47e82fb2a418604bc8e08228148e863e0a836d))

* use throttle instead of debounce + don't use ssr useFetch for subscribables, not needed ([047b287](https://github.com/Esposter/Esposter/commit/047b2870101337e0f51e3798faf0eec45a4d6407))

* useFetch to be SSR compatible ([2e90a6a](https://github.com/Esposter/Esposter/commit/2e90a6a8504d305fe8ddea411c91917d1e6ee10c))

### Features

* Add crazy typing to make generic operations data ([ffdb026](https://github.com/Esposter/Esposter/commit/ffdb02643cdfb6dc1d00cbdd5dbf77de6d7a0d77))

* Add readReplies pagination ([95c81e7](https://github.com/Esposter/Esposter/commit/95c81e71bedf556863df3d7d9797602f25f173be))

# [1.40.0](https://github.com/Esposter/Esposter/compare/v1.39.0...v1.40.0) (2025-03-31)

### Bug Fixes

* Add back show room list button ([23b62ac](https://github.com/Esposter/Esposter/commit/23b62ac24945e0feb96b10411fdd459e1f49d08f))

* Add emitSerialized and onDeserialized ([3ffad0b](https://github.com/Esposter/Esposter/commit/3ffad0b70c6bba815419e35e62c4cab16cef217a))

* add file ([696eb31](https://github.com/Esposter/Esposter/commit/696eb319ed8b14845b1df0876672424fb40f33bb))

* cleanup logic ([9a4867c](https://github.com/Esposter/Esposter/commit/9a4867c63afabf238445b202616fc56d6f0e0313))

* cleanup remaining unnecessary funcs ([21110cb](https://github.com/Esposter/Esposter/commit/21110cbf3307c4861e85ebfbc5ec0f15aed9304d))

* completely fix up room sql queries ([e891c07](https://github.com/Esposter/Esposter/commit/e891c07cb248e345ceb3f3641c38804dca21fd80))

* condition ([d473d3a](https://github.com/Esposter/Esposter/commit/d473d3a3f090f3e439d49702ab15173da78eeed6))

* creating emojis + add azure operation tests ([ed7a50b](https://github.com/Esposter/Esposter/commit/ed7a50b179f78eba342068a24f0af111f543edca))

* don't need mutation return values since they will be returned via subscriptions ([79b9ac5](https://github.com/Esposter/Esposter/commit/79b9ac52d2bc4f74c80c5dd27079c8c46dc225fb))

* don't put comments at root node ([243da7d](https://github.com/Esposter/Esposter/commit/243da7d26ccf6848d31379193ab50844b106c0cd))

* don't use permanent on left nav drawer since it's not compatible with nuxt ([85356f4](https://github.com/Esposter/Esposter/commit/85356f42cbb1af71b3093ac86c480e70b47517b7))

* Finally fix up all the superjson issues ([0a6bb49](https://github.com/Esposter/Esposter/commit/0a6bb49a01bc67025507fed5e63e71dd2e173e5f))

* get headers from http req ([d006d51](https://github.com/Esposter/Esposter/commit/d006d51d9ae6ddda257bb592dc6eab0b800a6e59))

* move doc query select outside ([06a8d9b](https://github.com/Esposter/Esposter/commit/06a8d9b9a2bbf8531b91a21159f3960750e4d87f))

* override parent head ([4cc0697](https://github.com/Esposter/Esposter/commit/4cc0697b2cfe4639d83e6a67914fa43ca4faadca))

* permanent with proper model value changes ([f80a553](https://github.com/Esposter/Esposter/commit/f80a55364c6bc5bc50fd2895294981257a17793b))

* refactor the legacy react code for our vue use case c: ([d940e26](https://github.com/Esposter/Esposter/commit/d940e262c8799099fa0509864a5a5c280304eb90))

* remove bad padding ([ddc5d1a](https://github.com/Esposter/Esposter/commit/ddc5d1aa7babb81b4a92c18fcc037129f6231f67))

* remove unnecessary if condition ([96a931b](https://github.com/Esposter/Esposter/commit/96a931b6bbb3296ecae0fd5c40c8b76bb9aae3e8))

* return if undefined ([7a716ef](https://github.com/Esposter/Esposter/commit/7a716ef3ee1beb0f5562322efd31ed3a17ae3410))

* rich text editor height ([eb2ed18](https://github.com/Esposter/Esposter/commit/eb2ed18176466420c214290c42e54dadadfca7f4))

* room padding ([0c33c87](https://github.com/Esposter/Esposter/commit/0c33c8737334747c1a4dcb3d1857eb199d1c31f6))

* run onLoaded after onMounted ([c57d9d1](https://github.com/Esposter/Esposter/commit/c57d9d17512e5faa62ecd6963148ba844a22ce65))

* some message stylings + make navigation drawer props available ([b216f4d](https://github.com/Esposter/Esposter/commit/b216f4d40eeefd812a5c3538f0bc20051f3a3d2d))

* subscriptions ([eaf8393](https://github.com/Esposter/Esposter/commit/eaf839344eba816574b36d9b539a217427c30361))

* tests ([e482bdd](https://github.com/Esposter/Esposter/commit/e482bdd208cba6da0cad755c60ae55df094c9e25))

* update messages ([509a749](https://github.com/Esposter/Esposter/commit/509a749713a907e9c8480d8c8c0e7c2e9240c25f))

* use reverse ticked timestamp ([15feef8](https://github.com/Esposter/Esposter/commit/15feef8f9d08ffe823eca9d2821efbffd0976213))

* uuid search regex ([de006ab](https://github.com/Esposter/Esposter/commit/de006ab5486a55f8ba6c67154567d889f5d9b9ca))

### Features

* Add completely type-safe metadata map ([76d205a](https://github.com/Esposter/Esposter/commit/76d205a9a7dbb9ccea28cc08a4c842791b9985b5))

* Add creating invite codes ([0ea90f1](https://github.com/Esposter/Esposter/commit/0ea90f106246a85686823c7412faf49e79758b92))

* Add metadata map tests ([84aa954](https://github.com/Esposter/Esposter/commit/84aa9547d4dbb76ccee020be16463075e788e2cf))

* Add onCreateTyping ([12a3d8e](https://github.com/Esposter/Esposter/commit/12a3d8e15dd8c44eff2d7f19276024ea46260b0e))

* Migrate from class-transformer to custom serialisation/deserialisation ([7917419](https://github.com/Esposter/Esposter/commit/791741920da64bec7a2b056da10107efec8cf3a1))

### Performance Improvements

* disable devtools unless necessary ([f89d2fd](https://github.com/Esposter/Esposter/commit/f89d2fd65c896e2bceb5391ad409be9852d6441d))

# [1.39.0](https://github.com/Esposter/Esposter/compare/v1.38.1...v1.39.0) (2025-03-28)

### Bug Fixes

* add back no-deprecated check & add vue expect errors ([0a70edb](https://github.com/Esposter/Esposter/commit/0a70edbc48737b7f668fe6fc6744010633e7aa6a))

* add files ([df8ec27](https://github.com/Esposter/Esposter/commit/df8ec274479d3e223ddd378f124d59320b95c75c))

* Add identifier ([e5f68c1](https://github.com/Esposter/Esposter/commit/e5f68c1d6bcdaf9ec08ff2795002326d1afeb907))

* don't use deprecated stuff ([71d9b1b](https://github.com/Esposter/Esposter/commit/71d9b1bb35d3c3bf00f2788565a3375ad67a680b))

* input hanging workaround + migrate in plugin instead ([c679635](https://github.com/Esposter/Esposter/commit/c679635d2d95320ae5d18dfb92ac313eab4fc026))

* lint ([e8cbbae](https://github.com/Esposter/Esposter/commit/e8cbbaec64ff0c825d7c05fc02ebb112644a9e6e))

* only satisfies for zod ([edb5b86](https://github.com/Esposter/Esposter/commit/edb5b86f95e3ef3c6d20d5c05f9eb16a1106df2e))

* put test to todo for now ([f751d35](https://github.com/Esposter/Esposter/commit/f751d35aa56efca12ed784e121544440a1bec4cd))

* remove unnecessary weird non json serializble stuff ([50a2730](https://github.com/Esposter/Esposter/commit/50a2730906a4327196d076e616db1740da14ccb4))

* trpc transformer ([49bbbc1](https://github.com/Esposter/Esposter/commit/49bbbc13830a2ce8af0346868b6fa8933deebc75))

* update dependencies + fix types ([a06fe37](https://github.com/Esposter/Esposter/commit/a06fe37d55bd3564309f8405e647338b742c695b))

* update snapshots ([b19a925](https://github.com/Esposter/Esposter/commit/b19a9251f294c3308b876481dfcc656a1f2d2bc2))

* update to latest ver of scripts to fix up typechecking issues ([a9d0af6](https://github.com/Esposter/Esposter/commit/a9d0af6cd764d0b0c3fff03242b10647b4410ae3))

### Features

* Migrate to async generators ([c0d2d83](https://github.com/Esposter/Esposter/commit/c0d2d838b7eb2bf4b28c2d32862285e367d195ad))

* Try support websockets ([5f2f70d](https://github.com/Esposter/Esposter/commit/5f2f70dbacd21abe461b4f3e07a1154787dc195f))

* Upgrade to trpc 11 ([1494045](https://github.com/Esposter/Esposter/commit/1494045fbc518b0a8446fd6d99da458eac30f965))

## [1.38.1](https://github.com/Esposter/Esposter/compare/v1.38.0...v1.38.1) (2025-03-12)

**Note:** Version bump only for package @esposter/app

# [1.38.0](https://github.com/Esposter/Esposter/compare/v1.37.1...v1.38.0) (2025-03-12)

### Bug Fixes

* pin better-auth ver ([0bbe946](https://github.com/Esposter/Esposter/commit/0bbe946d089541786d3d654da5ea47661bf7e2da))

* src ([0d249c2](https://github.com/Esposter/Esposter/commit/0d249c20790b957850f3b6b7c6093318271e5ada))

* update apply surveyjs v2 migrations ([09ae32b](https://github.com/Esposter/Esposter/commit/09ae32bfeeb28a1d7763a06729e00f6dd63673a2))

* update apply surveyjs v2 migrations ([e99ac81](https://github.com/Esposter/Esposter/commit/e99ac819a29b63e9d5852834d4d99b7a53071650))

* update dependencies + fix types ([d7c1817](https://github.com/Esposter/Esposter/commit/d7c18178f7dc691002fae384dace58b77808605c))

* update vue-tsc finally ([0d24bae](https://github.com/Esposter/Esposter/commit/0d24baeb4005459511e0a0fea883355f88adf6d0))

### Features

* Upgrade to nuxt 3.16 ([e77f6a3](https://github.com/Esposter/Esposter/commit/e77f6a31f153c5dc7e549bca1bba356546279d27))

## [1.37.1](https://github.com/Esposter/Esposter/compare/v1.37.0...v1.37.1) (2025-02-15)

**Note:** Version bump only for package @esposter/app

# [1.37.0](https://github.com/Esposter/Esposter/compare/v1.35.0...v1.37.0) (2025-02-15)

### Bug Fixes

* build command ([6aa3f3a](https://github.com/Esposter/Esposter/commit/6aa3f3a5227dd20e36f7ccebc11fac798037f977))

* format file automatically ([707debf](https://github.com/Esposter/Esposter/commit/707debfc0d8dad040f3c581d5f280e2dd4bafe23))

* linting rules ([41249de](https://github.com/Esposter/Esposter/commit/41249de7e766fc9cf334ba69b7bc9ce07497bd17))

* move single-use packages to their own package folder and build with rollup ([b8970e4](https://github.com/Esposter/Esposter/commit/b8970e4f4eb5872944693ebd73a75cd28ca4b94e))

* pwa manifest ([f85b4de](https://github.com/Esposter/Esposter/commit/f85b4de8b7a086abd9c079fcdfa888cb0d31c133))

### Features

* Add generating filepack ([d180318](https://github.com/Esposter/Esposter/commit/d1803183dba7af41a3fce09e1c98501ae3b644aa))

* Add unique FileKey + support font ([ccb1d13](https://github.com/Esposter/Esposter/commit/ccb1d13802031f6b40a18e61f459224b5b0e6bec))

* Simplify cross-os to ts and change all scripts to single command ([f44bc56](https://github.com/Esposter/Esposter/commit/f44bc565987b380e1a534adfa63b773afb0fe77a))

* Support audio as well ([1ba645a](https://github.com/Esposter/Esposter/commit/1ba645a7047b479652080bbb6ddbb3efbba821b4))

# [1.35.0](https://github.com/Esposter/Esposter/compare/v1.34.0...v1.35.0) (2025-02-08)

### Bug Fixes

* add error handling ([f2e2515](https://github.com/Esposter/Esposter/commit/f2e251591e73ec68a309cd5470fd5b698a1d7f8e))

* add login loading state ([19aeae4](https://github.com/Esposter/Esposter/commit/19aeae466eed982475ef0e571195e081ca3799ae))

* disable button when loading ([29bc5d5](https://github.com/Esposter/Esposter/commit/29bc5d5bb0a5d27cd9dddf4881c30704fb6668b0))

* make dash gap bigger ([5536b89](https://github.com/Esposter/Esposter/commit/5536b89f42d87328d175b92e04ba81f20a6a391c))

* only render a subset ([c4357c9](https://github.com/Esposter/Esposter/commit/c4357c9873d58e5c6a4c6f441cc100cfac81611a))

* pin some deps ([988e083](https://github.com/Esposter/Esposter/commit/988e0832e48b990672c04ff6e9d78e02a0a8fa9c))

* points data + add rings ([22aa96d](https://github.com/Esposter/Esposter/commit/22aa96dfe184efe1d8af036282711fe9003f5a60))

* remove tresjs ([ed7e0cc](https://github.com/Esposter/Esposter/commit/ed7e0cc4d89d18c1b11cf72ca9197fed6cecaa60))

* remove unnecessary one off execution packages from being installed ([4f2a854](https://github.com/Esposter/Esposter/commit/4f2a854908619a21d8ccf0eb3c4f0815136714b7))

* update snapshot ([7e0e90c](https://github.com/Esposter/Esposter/commit/7e0e90c3205f313f72902edf3ead615892caa91a))

### Features

* Add countries ([594c651](https://github.com/Esposter/Esposter/commit/594c651536c0396f764f6e9b6f9e477629aabc2a))

* Upgrade to pnpm 10 + refactor property names ([ef364d2](https://github.com/Esposter/Esposter/commit/ef364d29be7e82b6ffdc1e0233854c50a231e83c))

# [1.34.0](https://github.com/Esposter/Esposter/compare/v1.33.0...v1.34.0) (2025-01-23)

### Bug Fixes

* add back rate limited procedure ([ae505e2](https://github.com/Esposter/Esposter/commit/ae505e26b7f40402902fb52ee13397f78d9f2a7a))

* Add util polyfill ([c6bcabd](https://github.com/Esposter/Esposter/commit/c6bcabde60d350463cf5f71770c0c8ad6c4ad07f))

* generating pwa images ([53983fc](https://github.com/Esposter/Esposter/commit/53983fc0b9b88c953134d3480601bd2d11b962cf))

* generating pwa images to be transparent + add node polyfills ([aa0d2c0](https://github.com/Esposter/Esposter/commit/aa0d2c0d913915402bcd618f9a26e65f1b1a6c56))

* remove unnecessary clear ([5c83bfb](https://github.com/Esposter/Esposter/commit/5c83bfb2d3bb78e7099e045809e1b2e71912558e))

* remove util polyfill ([3d16ae1](https://github.com/Esposter/Esposter/commit/3d16ae1aef5633f67656a9e1d5d6d759d1de3b4e))

* typescript eslint ([141b4e2](https://github.com/Esposter/Esposter/commit/141b4e217984fb3ebcb9a9b1cbce770e92100f50))

* update PWA ([f5dffd1](https://github.com/Esposter/Esposter/commit/f5dffd11dceb4a9385b5e186a625bdbcba943d77))

### Features

* Add more snapshots ([a1421f6](https://github.com/Esposter/Esposter/commit/a1421f69f7430d5c1f6e6bbd9c437b9339e780d6))

* Add snapshot test ([7211b4f](https://github.com/Esposter/Esposter/commit/7211b4f031d83f409013097c3d6cc00f24e590a0))

* Add upload user profile image ([68609ac](https://github.com/Esposter/Esposter/commit/68609acb628932995fea6a6fdd6d6e4ef59d5044))

* Add zod-form-data ([43400e2](https://github.com/Esposter/Esposter/commit/43400e2a8b9bc239ff1d08714a8dd7801eaddfa4))

* update app links ([b9303d1](https://github.com/Esposter/Esposter/commit/b9303d1f1fbd74bcd2da1b56b16af098b6e44d3d))

* update PWA ([8fa31d0](https://github.com/Esposter/Esposter/commit/8fa31d0e380f20d83ab3c76498cff96c9aeb0af8))

# [1.33.0](https://github.com/Esposter/Esposter/compare/v1.32.0...v1.33.0) (2025-01-14)

### Bug Fixes

* composable cannot have await with lifecycle hooks ([3b9ef18](https://github.com/Esposter/Esposter/commit/3b9ef1887e8ebde0aca8023c10f35a3cc77e754e))

* converting image ([55e34a4](https://github.com/Esposter/Esposter/commit/55e34a41f1d2ee083a1a240990114606e9a0d13e))

* json class names ([f0d7f76](https://github.com/Esposter/Esposter/commit/f0d7f76f0e99c62708255b1a7d4cbdcf517c25dc))

* migrations ([5c4b03b](https://github.com/Esposter/Esposter/commit/5c4b03b6d47843afc4ba5aefb9d899caf7f6c534))

* migrations ([cd373eb](https://github.com/Esposter/Esposter/commit/cd373ebacad7a19a6b7822c2766c6dcbd31cfb56))

* posts must have non-empty titles + fix up profanity middleware ([3127751](https://github.com/Esposter/Esposter/commit/312775134d9f2dca7c6b5c8b6306324387918c82))

* remove devalue ([84aa708](https://github.com/Esposter/Esposter/commit/84aa70845af402d6702da7bcba2273c594bbf334))

* watch for new session data instead ([bd31d33](https://github.com/Esposter/Esposter/commit/bd31d3360098cfdde298182090dd040a633643c6))

### Features

* Add image ([b6d59ef](https://github.com/Esposter/Esposter/commit/b6d59ef582360ec7f53527d1afc8e212e2d482c8))

# [1.32.0](https://github.com/Esposter/Esposter/compare/v1.31.0...v1.32.0) (2025-01-03)

### Bug Fixes

* Add overflow anywhere ([6b181a9](https://github.com/Esposter/Esposter/commit/6b181a9cfce332e3ffe9d3a4af70bd3f3cce4408))

* migrations ([861a2ef](https://github.com/Esposter/Esposter/commit/861a2ef57a19f4e160419989f0805ef5c67b3098))

* migrations ([b661494](https://github.com/Esposter/Esposter/commit/b66149466c14f5887fcb60a76ecb5af16613c3f1))

* migrations ([eefe5b6](https://github.com/Esposter/Esposter/commit/eefe5b6ffb3f30dd32749c5074349139742e54a0))

* migrations ([b3c8cbc](https://github.com/Esposter/Esposter/commit/b3c8cbcf79dec091170c847d22468d830606b037))

* migrations ([cf5395a](https://github.com/Esposter/Esposter/commit/cf5395a506697238f40ffae1b6be27d055b4666a))

* Update drizzle-zod ([9e324cb](https://github.com/Esposter/Esposter/commit/9e324cb6db876c7e663849c1865d52bf253275cd))

### Features

* Add auth ([84355f8](https://github.com/Esposter/Esposter/commit/84355f8c2367dc60b46e7dafa319b84b0ad93a9b))

* Add check constraints ([7ab0fa6](https://github.com/Esposter/Esposter/commit/7ab0fa6579b95973f6d05bd325faac97de682962))

# [1.31.0](https://github.com/Esposter/Esposter/compare/v1.30.0...v1.31.0) (2024-12-06)

### Bug Fixes

* deep copy serializable objects to json stringify properly ([4b22329](https://github.com/Esposter/Esposter/commit/4b22329dd97b746e306e168be5514bee3cff6e66))

* lint ([bb647fe](https://github.com/Esposter/Esposter/commit/bb647fec0d004b6e8215d3a8bce64339b8965d4c))

* move types ([5650063](https://github.com/Esposter/Esposter/commit/5650063c20e39cfbc0e2b44e1fbf2813146a1907))

* nuxt scripts types ([62a72fa](https://github.com/Esposter/Esposter/commit/62a72fa18366adf29a02408336e56613dd85e444))

* parse-tmx ([32a522d](https://github.com/Esposter/Esposter/commit/32a522db4c0a50ff5b3531d6e389e74bb965dc10))

* scripts + parse-tmx perf improvement ([c89e711](https://github.com/Esposter/Esposter/commit/c89e71123e873be9ac8999d7212e7b1d6ced73b9))

* synchronized functions ([4e20f36](https://github.com/Esposter/Esposter/commit/4e20f36b101d1ea3cf200858125f043cb7469972))

* types ([82673bc](https://github.com/Esposter/Esposter/commit/82673bc1edeb0a80c049f76814bb63a6bebf1b33))

* types ([dc0413c](https://github.com/Esposter/Esposter/commit/dc0413c5dba98cbc4e9b72112ef8eb5ea1e5c988))

### Features

* Upgrade trpc to v11 ([1c2fc2b](https://github.com/Esposter/Esposter/commit/1c2fc2b33d151d1378d0e31d407faf812599fb9a))

# [1.30.0](https://github.com/Esposter/Esposter/compare/v1.29.2...v1.30.0) (2024-11-28)

### Bug Fixes

* lint ([b084139](https://github.com/Esposter/Esposter/commit/b084139a18c5aaf5d0ac29b88729cd3b8c5bc7ee))

* move app component to app folder ([a3160ab](https://github.com/Esposter/Esposter/commit/a3160ab3b5111ce07d275f1fd0f4596f2fc38230))

* scripts ([92a1396](https://github.com/Esposter/Esposter/commit/92a139613da3f7a5d6a17f43243ec33ac64942a5))

### Features

* migrate to nuxt4 folder structure ([dea2097](https://github.com/Esposter/Esposter/commit/dea209757f99985672ddb4c1d425e00769a44b39))

## [1.29.2](https://github.com/Esposter/Esposter/compare/v1.29.1...v1.29.2) (2024-11-27)

### Bug Fixes

* imports ([5280aba](https://github.com/Esposter/Esposter/commit/5280abac8f348130afdf86bfb9b45286b914c16d))

* lint ([577fdc5](https://github.com/Esposter/Esposter/commit/577fdc53055d1e3f950347cace5767c38ebce886))

* lint ([9292876](https://github.com/Esposter/Esposter/commit/9292876a2c37aac2ca381f9de673cc68f5b274a3))

* lint ([f92d291](https://github.com/Esposter/Esposter/commit/f92d29162a07f3b278f889f814bd25fce03147c7))

* lint + refactor sorting models ([5d04851](https://github.com/Esposter/Esposter/commit/5d048511901f5af13bc2d618e2c0681430979b1b))

## [1.29.1](https://github.com/Esposter/Esposter/compare/v1.29.0...v1.29.1) (2024-11-26)

**Note:** Version bump only for package @esposter/app

# [1.29.0](https://github.com/Esposter/Esposter/compare/v1.28.1...v1.29.0) (2024-11-26)

### Bug Fixes

* make util folder consistent across the board ([19acc81](https://github.com/Esposter/Esposter/commit/19acc813362713828521a3acae5b8fe06793584a))

* use nuxt 4 + fix up imports ([71f3728](https://github.com/Esposter/Esposter/commit/71f37281d32f958278f6f3a589f789fdd53f3de8))

### Features

* Add nuxtjs seo module ([836ce14](https://github.com/Esposter/Esposter/commit/836ce1412021fabc04bbf6c02543c349d22fdf28))

## [1.28.1](https://github.com/Esposter/Esposter/compare/v1.28.0...v1.28.1) (2024-11-20)

**Note:** Version bump only for package @esposter/app

# [1.28.0](https://github.com/Esposter/Esposter/compare/v1.27.0...v1.28.0) (2024-11-16)

### Bug Fixes

* move cast to when we return ([2716dcd](https://github.com/Esposter/Esposter/commit/2716dcd43ca9b876073577a4df92d966ce1ffec4))

### Features

* move fonts to load with native phaser ([fb91551](https://github.com/Esposter/Esposter/commit/fb91551e50abf370f5317278a5cfe3faab8433b1))

# [1.27.0](https://github.com/Esposter/Esposter/compare/v1.26.0...v1.27.0) (2024-11-05)

### Bug Fixes

* add back esnext target for top level await ([8e9aa8b](https://github.com/Esposter/Esposter/commit/8e9aa8b5884961eaf80f4e67048ebf9b17e69982))

* lint && types ([abc4876](https://github.com/Esposter/Esposter/commit/abc4876b327f871ec8360e8850f40f0b68454f38))

* overrides ([937ab6a](https://github.com/Esposter/Esposter/commit/937ab6aa893a5488502240a9d6f146c525cd499d))

* pin nitro ([bee211a](https://github.com/Esposter/Esposter/commit/bee211ab9b7e35fdf359f49b5c3ed40db890617e))

* Update dependencies + fix up drizzle orm + enable back auto update deps ([c266a5a](https://github.com/Esposter/Esposter/commit/c266a5a0713ec088145a685ac19cf1bcdacf2b30))

### Features

* Add check constraint ([9e5efc8](https://github.com/Esposter/Esposter/commit/9e5efc84357e891153b7809273986f0cad12ca55))

# [1.26.0](https://github.com/Esposter/Esposter/compare/v1.25.0...v1.26.0) (2024-11-02)

### Features

* add getting random values cuz it's cool ([3d4968d](https://github.com/Esposter/Esposter/commit/3d4968d1597088897b97272d65d0d7dc04dbb2a3))

# [1.25.0](https://github.com/Esposter/Esposter/compare/v1.24.2...v1.25.0) (2024-10-22)

### Bug Fixes

* lint ([7bdea2f](https://github.com/Esposter/Esposter/commit/7bdea2f6b67423bfae6a4617faea2c5c50df10c9))

* lint for vue files and remaining packages ([11bb52f](https://github.com/Esposter/Esposter/commit/11bb52fbe53725a6fd1f835f9ce128a7a911b276))

* remaining lint stuff ([d95927e](https://github.com/Esposter/Esposter/commit/d95927ec38e9b7a371af7ba801ed3b61c6f60d4e))

### Features

* Add profanity filters to all inputs ([d83351d](https://github.com/Esposter/Esposter/commit/d83351d68237a16edb3ce99190bfcf3331f1e595))

## [1.24.2](https://github.com/Esposter/Esposter/compare/v1.24.1...v1.24.2) (2024-10-17)

**Note:** Version bump only for package @esposter/app

## [1.24.1](https://github.com/Esposter/Esposter/compare/v1.24.0...v1.24.1) (2024-10-17)

### Bug Fixes

* lint ([99efc7e](https://github.com/Esposter/Esposter/commit/99efc7e8c074e2a66916c58c0ecc0a5c332becee))

* Update drizzle-orm + fix up base table func ([1feaf8e](https://github.com/Esposter/Esposter/commit/1feaf8e470a0bb78826de72b78d9960e922da80c))

# [1.24.0](https://github.com/Esposter/Esposter/compare/v1.23.0...v1.24.0) (2024-10-14)

### Bug Fixes

* lint ([4354c66](https://github.com/Esposter/Esposter/commit/4354c6608dfa8d0ae23227f1ee17ad8e8cd47b21))

* lint ([6813e10](https://github.com/Esposter/Esposter/commit/6813e105c89767bca018b33f08d71635ee003b95))

* lint ([e66c1fa](https://github.com/Esposter/Esposter/commit/e66c1faebf90cada133bb9c7a93f627318554796))

* tests ([401264f](https://github.com/Esposter/Esposter/commit/401264fab96952b2116cc1f7fb56961a57f6cc59))

### Features

* Add prettify tests ([7d740fe](https://github.com/Esposter/Esposter/commit/7d740fe6b7f73447df0b8ead66a77abe1034b4ad))

# [1.23.0](https://github.com/Esposter/Esposter/compare/v1.22.0...v1.23.0) (2024-10-08)

### Bug Fixes

* add back background ([93b6eca](https://github.com/Esposter/Esposter/commit/93b6eca9718da2d574778e4722683ae1bc40f357))

* classify border styles to be more consistent ([a221fe5](https://github.com/Esposter/Esposter/commit/a221fe585112c5e2eaa11f0028ac68cf727c0dc6))

* lint ([2b6c450](https://github.com/Esposter/Esposter/commit/2b6c4509c4ed32ea72b7eed0a64f409a1003bb1a))

* local storage key ([afa9d56](https://github.com/Esposter/Esposter/commit/afa9d561dbf972609158e8a84809517ddefa77e3))

* more border styles consistency ([1a5edaf](https://github.com/Esposter/Esposter/commit/1a5edaf3b968e8538f3766f392332c599b450f12))

* more types ([8235f37](https://github.com/Esposter/Esposter/commit/8235f37b8fcd1a4b77899b2b867dea63cef661a1))

* move anything frontend to only use undefined instead of null for consistency ([f8d9305](https://github.com/Esposter/Esposter/commit/f8d93052c401f285343d5c69bce2b91182548083))

* remove now unnecessary ts expect error ([e8a51eb](https://github.com/Esposter/Esposter/commit/e8a51eb525f02d504808b18005285a1d3fc1c7b4))

* resetting viewport ([3f478d8](https://github.com/Esposter/Esposter/commit/3f478d8cb948c7853f152d6b017694f314695f7b))

* saving ([377c047](https://github.com/Esposter/Esposter/commit/377c047f268e6ab07525052607cc4a2890b9567b))

* some pinia todos ([7efdc7f](https://github.com/Esposter/Esposter/commit/7efdc7f569dc8cf8b825195522d770203bd5f3a8))

* survey updates ([9bd40e4](https://github.com/Esposter/Esposter/commit/9bd40e4136f2ca2155628b34b19628a83d5eadfd))

* types ([d111b55](https://github.com/Esposter/Esposter/commit/d111b55d42168f5520592a737d06e781fa687d1c))

* types ([56c2115](https://github.com/Esposter/Esposter/commit/56c2115249412c93334fcdab96fa6f9231d1759c))

* unocss config ([e4e0a1d](https://github.com/Esposter/Esposter/commit/e4e0a1df03134acaf1ad8b95c7c6a6684b1b6b23))

* use  and fix up some [@vue-ignores](https://github.com/vue-ignores) ([e3ec037](https://github.com/Esposter/Esposter/commit/e3ec037f13c829130d0e0f968f95cb362e80d8d5))

* use custom node + add header ([4c0e0f0](https://github.com/Esposter/Esposter/commit/4c0e0f03102bc655bf7475eb59982c81f86f244b))

### Features

* Add connect + colors ([94cb08e](https://github.com/Esposter/Esposter/commit/94cb08e4fffa2654f2dd0302dfc809286912aae3))

* Add debounced autosave ([db835fa](https://github.com/Esposter/Esposter/commit/db835faa44cdd830522cbcf0e6a3b9b48027531a))

* Add dnd ([d3326ca](https://github.com/Esposter/Esposter/commit/d3326ca76033f6bd63fc9b01bed6fe34d42bd1a5))

* Add easy identification of node being updated ([b64f0bb](https://github.com/Esposter/Esposter/commit/b64f0bbfdfa0e06db3d84e2a87588e4737214bab))

* Add fully featured email editor ([758924b](https://github.com/Esposter/Esposter/commit/758924bf43800df64f0d59402a670c831cd55603))

* Add fully featured webpage editor ([2a151a3](https://github.com/Esposter/Esposter/commit/2a151a34e68301566f6f017e80f8900ecb1e5d4f))

* Add loading data ([456d908](https://github.com/Esposter/Esposter/commit/456d908b51126d413ec6b865d2565355f9898c56))

* Add sidebar button to support mobile ([63f9cd2](https://github.com/Esposter/Esposter/commit/63f9cd2a970de5b87045b33034a4c7e2afec648f))

* Add undo/redo ([323357d](https://github.com/Esposter/Esposter/commit/323357d7f51f150b3979967075b09aa87b36983e))

* finish converting remaining non-db related frontend stuff all from null to undefined ([fad154c](https://github.com/Esposter/Esposter/commit/fad154cda273182dc7972897cc42adda5ec6866a))

* format html/css output ([c60ff96](https://github.com/Esposter/Esposter/commit/c60ff96c460ecc803b881aff48805d07f76cc5ad))

# [1.22.0](https://github.com/Esposter/Esposter/compare/v1.21.5...v1.22.0) (2024-09-28)

### Bug Fixes

* lint ([7cf8e80](https://github.com/Esposter/Esposter/commit/7cf8e802d2ee7c86acecfdcf402d99e625580ca6))

* remove wrong v-if ([428cd3b](https://github.com/Esposter/Esposter/commit/428cd3b839d616906d3407d6e28966edd78595a1))

* vitest lint ([f25a701](https://github.com/Esposter/Esposter/commit/f25a701da896e7a84abf7dde5d7681a71b178347))

### Features

* Add flowchart ([dd691a6](https://github.com/Esposter/Esposter/commit/dd691a614811bcbc8cbc4eed319923f474c3e759))

* Add rich text to todolist + migrate v-for to use of ([4353429](https://github.com/Esposter/Esposter/commit/4353429857a6a852f9a0421da413b475543884d9))

## [1.21.5](https://github.com/Esposter/Esposter/compare/v1.21.4...v1.21.5) (2024-09-18)

### Bug Fixes

* add sleep func as part of lib and use scene delayedcall ([0965cc3](https://github.com/Esposter/Esposter/commit/0965cc30ff94760ae390f30f2e5d3b3bed12c5e7))

## [1.21.4](https://github.com/Esposter/Esposter/compare/v1.21.3...v1.21.4) (2024-09-18)

### Bug Fixes

* revert @nuxt/scripts ver ([9940713](https://github.com/Esposter/Esposter/commit/994071312ee14f0541e420c6c6eabc0d97656150))

## [1.21.3](https://github.com/Esposter/Esposter/compare/v1.21.2...v1.21.3) (2024-09-16)

### Bug Fixes

* order + add tests ([720e668](https://github.com/Esposter/Esposter/commit/720e66852aa42267927430342fd490bf36bc3114))

* Update dependencies + fix types ([e145bf8](https://github.com/Esposter/Esposter/commit/e145bf8c3b6b752df24c4d549017481206abecbf))

## [1.21.2](https://github.com/Esposter/Esposter/compare/v1.21.1...v1.21.2) (2024-09-14)

**Note:** Version bump only for package @esposter/app

## [1.21.1](https://github.com/Esposter/Esposter/compare/v1.21.0...v1.21.1) (2024-09-14)

### Bug Fixes

* add back prop destructure option for now ([013f1f6](https://github.com/Esposter/Esposter/commit/013f1f67ea5bd9530d6cd6d4cb96d3843a32f357))

* add read from env ([44bf360](https://github.com/Esposter/Esposter/commit/44bf3609f2c466807a5de617e51611a6e9cc2f74))

* docs is external ([a507057](https://github.com/Esposter/Esposter/commit/a507057e043a97d4c5e213e772cea5c058758531))

* remove now unnecessary casts ([60564a0](https://github.com/Esposter/Esposter/commit/60564a0e83bed0985f74b810b6f9660db92a47f8))

* use back original tsconfig ([0d01770](https://github.com/Esposter/Esposter/commit/0d0177054c770bdc59b7ac5d5f993dbc62793f87))

# [1.21.0](https://github.com/Esposter/Esposter/compare/v1.20.2...v1.21.0) (2024-09-14)

### Bug Fixes

* actually on second thought, we want latest docs so just rebuild everytime, it's pretty quick anyways ([d00cf37](https://github.com/Esposter/Esposter/commit/d00cf37adf9601ab19a0660bac9aee52957cf5e2))

* cache docs instead to optimise perf ([e1fbae7](https://github.com/Esposter/Esposter/commit/e1fbae7dba7e411b42582262d909a5fb0d964e08))

* imports + moving input active setter to lib ([2a62a9b](https://github.com/Esposter/Esposter/commit/2a62a9b01d40d8f615639f2df4d2a285cfacdb14))

* lint + settings types ([332ce48](https://github.com/Esposter/Esposter/commit/332ce484b19b9859b5cb2760e6635b96e6c708ed))

* move fading listeners to lib ([730d942](https://github.com/Esposter/Esposter/commit/730d942efd7e93f76e4ee32a219743a6e4e5282b))

### Features

* Add documentation btn ([c3eb7f3](https://github.com/Esposter/Esposter/commit/c3eb7f3b5fb5ae8fd098d206055b173b588caf76))

## [1.20.2](https://github.com/Esposter/Esposter/compare/v1.20.1...v1.20.2) (2024-09-13)

**Note:** Version bump only for package @esposter/app

## [1.20.1](https://github.com/Esposter/Esposter/compare/v1.20.0...v1.20.1) (2024-09-13)

**Note:** Version bump only for package @esposter/app

# [1.20.0](https://github.com/Esposter/Esposter/compare/v1.19.0...v1.20.0) (2024-09-13)

### Bug Fixes

* package imports ([4602c42](https://github.com/Esposter/Esposter/commit/4602c42e695aa12043b8694c25b8f20e667fec44))

### Features

* Upgrade vue-tsc to v2 + enable same name shorthand + fix up workspace packages ([749c3c2](https://github.com/Esposter/Esposter/commit/749c3c2a8f99518460f624c80433fa7dae52326b))

# [1.19.0](https://github.com/Esposter/Esposter/compare/v1.18.0...v1.19.0) (2024-09-13)

### Features

* Add vue-phaserjs package ([5f158f5](https://github.com/Esposter/Esposter/commit/5f158f5e07da10dd0593257a7ba06d53a49323c9))

# [1.18.0](https://github.com/Esposter/Esposter/compare/v1.17.0...v1.18.0) (2024-09-13)

### Bug Fixes

* Add back lab components ([a4b10c5](https://github.com/Esposter/Esposter/commit/a4b10c576245c07330475346e04125ce8927ebae))

* add back sleep ([3401f77](https://github.com/Esposter/Esposter/commit/3401f770023110cc7bef756816926be9114f3268))

* add files ([baa1167](https://github.com/Esposter/Esposter/commit/baa116797544bbfaf3710db0ab3bd955521e1ed9))

* Add item id to tiled ([768778e](https://github.com/Esposter/Esposter/commit/768778ecd365e2594e57ee29af4a873717e75e8e))

* add on unmounted reset ball state ([4ecccc1](https://github.com/Esposter/Esposter/commit/4ecccc1b630983de42a39dd101f8a2abf0470d27))

* chestmap ([2e20a86](https://github.com/Esposter/Esposter/commit/2e20a864922a08576da8fdb143c0558971c3799e))

* cleanup unnecessary types ([bdddd9c](https://github.com/Esposter/Esposter/commit/bdddd9cf6a5ba2bebc08756870b4aca97a5efbd4))

* font family not style you baka ([f96bb51](https://github.com/Esposter/Esposter/commit/f96bb5175451fbc09ff5165518fae137e5263c26))

* goddam pinia key issue ([f8b540a](https://github.com/Esposter/Esposter/commit/f8b540ad92eba7e41a9b7d032501f75b56e29c99))

* have default menu option grid ([d6bd70e](https://github.com/Esposter/Esposter/commit/d6bd70eaa2eb8b6b4be677367e1c6c4642836874))

* import text ([37c74de](https://github.com/Esposter/Esposter/commit/37c74de5c61775ca588fc0a00aba4f5bab8272b6))

* importing components + module augmentation ([fc6e642](https://github.com/Esposter/Esposter/commit/fc6e642e564415a28d349316a66b2d3eb7c928ab))

* just switch to something that works... ([55de1b3](https://github.com/Esposter/Esposter/commit/55de1b3ee1fcb4fe7f1e6158250a41ec1dd31bec))

* lint ([72280bc](https://github.com/Esposter/Esposter/commit/72280bc35af87783e8bb6f9a01fe754e5397dd5e))

* lint ([693eb9e](https://github.com/Esposter/Esposter/commit/693eb9ed9687712a81477d37ac30998a93ee5664))

* lint + types ([73ad2bd](https://github.com/Esposter/Esposter/commit/73ad2bd81e6f81102b781b96395602c255905085))

* messages are reversed ([aa3d143](https://github.com/Esposter/Esposter/commit/aa3d143141164e3c7f7a56cf3c09adc33efbe528))

* more types and scenekey imports ([3434e95](https://github.com/Esposter/Esposter/commit/3434e9515c4b433f51d67a57d7b7b323974c8531))

* most remaining imports/type issues ([04d51f5](https://github.com/Esposter/Esposter/commit/04d51f5c5e6dc17446185f306f339169197dbcb9))

* optimise setting and watch inventory ([74ccfe6](https://github.com/Esposter/Esposter/commit/74ccfe652deb8ad08f99ec1b0600d8b3eda7ddf2))

* optimise updating settings ([70c85ec](https://github.com/Esposter/Esposter/commit/70c85ecd887543af122216b55d54609591d21e2c))

* prettify active monster names + attack ids ([9aa074d](https://github.com/Esposter/Esposter/commit/9aa074dc3dd59950926669b23ed59143e3de09b0))

* prettify monster & item id names ([a936343](https://github.com/Esposter/Esposter/commit/a9363435136e4dabf4425c02b53dbacb5e0526fd))

* prettify name ([d62c8fa](https://github.com/Esposter/Esposter/commit/d62c8fae68132e4087cc7c95801749bcdfdbd608))

* remove grid immediate and just populate default val normally ([0bf45a2](https://github.com/Esposter/Esposter/commit/0bf45a2219877b6ae3e3000c3ea7bbe163267c7c))

* remove now unnecessary rule ([76a4d87](https://github.com/Esposter/Esposter/commit/76a4d87d492049fff99c3c4c7bbd46a7c0911e11))

* remove unnecessary todos for unwrap ref, just cast it, it's fine ([e3d8810](https://github.com/Esposter/Esposter/commit/e3d8810379139f6f61958799ec1a19f06de00499))

* shared + vue-phaser pkgs + app usage ([b560736](https://github.com/Esposter/Esposter/commit/b5607366da843044a2229337f90a6613b3ec44b7))

* show message in the proper scene ([b4c1a5e](https://github.com/Esposter/Esposter/commit/b4c1a5e44d500c1af3d20068ae8104ba52704ae0))

* simplify state machine to also make it async/await based ([78ed91b](https://github.com/Esposter/Esposter/commit/78ed91bca8c6b8670398a84e02e0df3b96635bf8))

* skip animations condition + add catch monster success vs fail animations ([8bab2db](https://github.com/Esposter/Esposter/commit/8bab2db644d2e8cbc9874554226d7aef20b1d684))

* some ids etc ([838bd27](https://github.com/Esposter/Esposter/commit/838bd27dc94955054b37f1024b1c4fc4d4a572fe))

* type guards + validations ([691e89f](https://github.com/Esposter/Esposter/commit/691e89f08e3bbedc3f237fb921e2adb6a0498646))

* types ([9cad3b3](https://github.com/Esposter/Esposter/commit/9cad3b36cfbbb22a090f4e27fbddc969b9a709ad))

* update capitalization to be consistent ([5655aab](https://github.com/Esposter/Esposter/commit/5655aab1b2d2eb85a33872afc6141822266bb3e4))

* use text from lib instead because we can't map emits.. ([db57897](https://github.com/Esposter/Esposter/commit/db5789711a49b0d09c3c057fded3b7f46a2e1c9b))

* use text wrapper ([5fbc443](https://github.com/Esposter/Esposter/commit/5fbc44312a215a15148d55ab10f23fb0169eafa6))

* vue-phaser imports ([db73bf0](https://github.com/Esposter/Esposter/commit/db73bf0a551ff9d143031fc639b0be3113c16bbb))

* vue-phaser to use scenekey types + dungeons text ([474d22e](https://github.com/Esposter/Esposter/commit/474d22e971c6854774231b5f4308e9b45f2d6f56))

* woohoo! that's the last of em scenekey issues ([706a09e](https://github.com/Esposter/Esposter/commit/706a09e10149115f5ab58b15b8a5826d63403007))

* worker ([4340631](https://github.com/Esposter/Esposter/commit/43406312083fde8a183e33de64b62779ffcf8827))

### Features

* Add ball animations ([bc321d4](https://github.com/Esposter/Esposter/commit/bc321d479b69cfa10d8d0ab591aaccca63ed8543))

* Add capture algo ([2207493](https://github.com/Esposter/Esposter/commit/2207493300e3167dff16dec2fb7c417535977475))

* Add capture item resolver ([93cc6ff](https://github.com/Esposter/Esposter/commit/93cc6ffeb5339cd160eb2a8489a370de8eb45677))

* Add catch enemy animation ([bdaa2d6](https://github.com/Esposter/Esposter/commit/bdaa2d67549e88cc6b94ab2a5ce142628d3e1053))

* Add catch enemy failed animation + sleep ([34d183d](https://github.com/Esposter/Esposter/commit/34d183d5b689a4bbd2b6e9bf059320c93bd8b7c8))

* Add drizzle adapter + remove custom adapter + add authenticators table & refactor user id names in table to be consistent ([2b38055](https://github.com/Esposter/Esposter/commit/2b38055f430489ebc07644ad2188374f827b0eed))

* Add isActive condition to inventory items ([66023f8](https://github.com/Esposter/Esposter/commit/66023f8ed8084603ab0335fee8542783abcf0957))

* Add item effect type for capture ([be7fbae](https://github.com/Esposter/Esposter/commit/be7fbae4ee3a0e412d72910bc63d2f3e3cfa4423))

* Add path follower ([c0b82bd](https://github.com/Esposter/Esposter/commit/c0b82bd814f6f7bef71d435091b13365531717cb))

* Add release + confirmation menu ([e660a74](https://github.com/Esposter/Esposter/commit/e660a74ef8a69299a225b2be410961a7fd88d48b))

* Add vueuse integrations ([3d43a7c](https://github.com/Esposter/Esposter/commit/3d43a7c22d1f048123a848f641bb446e114d80ec))

* capture rate takes into account monster hp ([4f22021](https://github.com/Esposter/Esposter/commit/4f22021af98568a80c3486d1a00794bc0f361acd))

* move type test to file ([2acba3b](https://github.com/Esposter/Esposter/commit/2acba3b2641857d305c88661db67cc2026cce383))

* successfully transform remaining on completes to async/await ([8fdcb2e](https://github.com/Esposter/Esposter/commit/8fdcb2ed38195358a1978cf53b4098d982594110))

* upgrade nuxt-security and remove unnecessary rate limiting ([6b9b67a](https://github.com/Esposter/Esposter/commit/6b9b67a279bcaaf9f0b28b360159f835b9214972))

# [1.17.0](https://github.com/Esposter/Esposter/compare/v1.16.0...v1.17.0) (2024-08-07)

### Bug Fixes

* types ([1c1b0ad](https://github.com/Esposter/Esposter/commit/1c1b0ad8acace1b05cf0af45e1901911b85a7d46))

### Features

* Add monster party menu ([93201aa](https://github.com/Esposter/Esposter/commit/93201aa5fd84a14b3a23b2d7d0e91b1620ddf957))

* Add moving monsters ([fe838a7](https://github.com/Esposter/Esposter/commit/fe838a72e6424e51f18ece3934bb25f072607ce6))

* Add summary + remove unnecessary select ([a5d86f3](https://github.com/Esposter/Esposter/commit/a5d86f3a971611e3b54b6bc432995edf9b1c7b66))

* Add UI to show monsters ([ea8349e](https://github.com/Esposter/Esposter/commit/ea8349e34d75cb7d9c013e33cb2c0f5f434c16ce))

* fix up and refactor out input resolvers for world + add input resolvers for monster party ([3622eea](https://github.com/Esposter/Esposter/commit/3622eeac9ff8ce2d662a1e2214a91cfd1deaca6d))

# [1.16.0](https://github.com/Esposter/Esposter/compare/v1.15.0...v1.16.0) (2024-08-01)

### Bug Fixes

* actually update ref value during tween ([af735a8](https://github.com/Esposter/Esposter/commit/af735a8266c7d3f4ceef856b2353aa949c05c3b8))

* Add back disable ([6414478](https://github.com/Esposter/Esposter/commit/64144789738731ee2b4d29b76fe2413c8859d6cd))

* Add file ([6aa1e36](https://github.com/Esposter/Esposter/commit/6aa1e3608328981e4cabf56f7b284b9b7aea3618))

* Add fragment ([88c14da](https://github.com/Esposter/Esposter/commit/88c14daa7090b2e690c9033e1b94362445d587d5))

* button bg color + positions ([352d916](https://github.com/Esposter/Esposter/commit/352d916c2cd125bfe9e384725cbc793553a2b517))

* change to use function call for perf ([6c7615c](https://github.com/Esposter/Esposter/commit/6c7615c3c0c71932e9c6eb1bfc98544715ef9bca))

* don't use global item in func ([debb772](https://github.com/Esposter/Esposter/commit/debb772b10a23cef2391fc6494ed3e191721d1e5))

* ensure tweening from correct pos ([dfe82df](https://github.com/Esposter/Esposter/commit/dfe82dfccc80a82a3b527021a03c55a9b21ed4c5))

* event handler names ([9934d8f](https://github.com/Esposter/Esposter/commit/9934d8f2eebd92f944364049564a18b515d8fc5f))

* icon ([408f0a7](https://github.com/Esposter/Esposter/commit/408f0a7e225f48d9a2937b13ba22c578450af824))

* ignore ([9fba0db](https://github.com/Esposter/Esposter/commit/9fba0dbb21dc650c7dc89cdecf8b035fc361869e))

* more fixes to position since I'm stoopid ([7087ef0](https://github.com/Esposter/Esposter/commit/7087ef02efe3e76e4d2db680e7311a35b7e5b37e))

* move container further ([6df5b1e](https://github.com/Esposter/Esposter/commit/6df5b1e343abdb07620c409dbdf50a036e41e141))

* move to left ([86e3293](https://github.com/Esposter/Esposter/commit/86e32938143e5dd74a802444431b4145e8fecdcf))

* no idea why but we don't need to specify width/height.. ok thanks ([9c80bac](https://github.com/Esposter/Esposter/commit/9c80bacc115965295698343ff81c91a1f184c612))

* positions ([d84db19](https://github.com/Esposter/Esposter/commit/d84db19f1d56c13f35fdd5c927ff085d95aee620))

* positions anyways ([3c29bc4](https://github.com/Esposter/Esposter/commit/3c29bc41c41d8c94b25a93a4a2b04656384cce8d))

* remove bounds since we allow zoom ([8214743](https://github.com/Esposter/Esposter/commit/8214743810263ad1e43831c39ec4243e44210ec0))

* resetting monster switching ([a9d854a](https://github.com/Esposter/Esposter/commit/a9d854ab0762d405599fa2bb4c384620b3ab57c0))

* revert back to sync properly with ref ([efde677](https://github.com/Esposter/Esposter/commit/efde677ae1fd6af467a9e64d57b210b0438e0cd1))

* revert back vue renderer changes ([2530770](https://github.com/Esposter/Esposter/commit/25307709416afdd78b81692b88a5455ab786e3dd))

* still coalesce to undefined ([1e77219](https://github.com/Esposter/Esposter/commit/1e772195a6e2112d4a2c699481e4676d0717c3ad))

* switch active monster instead of replacing it ([504b91a](https://github.com/Esposter/Esposter/commit/504b91a10fdc525676669c9b988d2c696555dfa4))

* tell ts it's fine ([8b79d4b](https://github.com/Esposter/Esposter/commit/8b79d4b4d5eec5c6d4bf0bd790e79278600a00fb))

* tween should be on x ([4a6dc76](https://github.com/Esposter/Esposter/commit/4a6dc767928993e3149b00d6b7b5050168c3079d))

* update getting ref from vue renderer ([5914d53](https://github.com/Esposter/Esposter/commit/5914d53e9db75c2ebae6cb5951d1e2d8cd72c91f))

* update on skip animations ([cab02ac](https://github.com/Esposter/Esposter/commit/cab02ac5910824ea2af299aea046ea02d78ddd3d))

* use move instead ([dc457db](https://github.com/Esposter/Esposter/commit/dc457db3d7b465f6e5483a8daf0523949fbcf80a))

* use onComplete instead of onUpdate to improve perf ([b995739](https://github.com/Esposter/Esposter/commit/b995739aad735b4df32c66cfb52e13c8b5d55180))

* vnode ([a1e20fa](https://github.com/Esposter/Esposter/commit/a1e20fa3cf7f0edf4672191f0553b70eb855f49a))

* weird but seems like we don't need to disable here ([a98b051](https://github.com/Esposter/Esposter/commit/a98b05118ea816f8326c552019e216c3754099ae))

### Features

* Add animate ([718a5dc](https://github.com/Esposter/Esposter/commit/718a5dcb878ebb29ecfa4bcfcd82b4f2f29f089c))

* Add azunyan! C: ([d7e95ec](https://github.com/Esposter/Esposter/commit/d7e95ec29eb78c4ae9db322caf56d00cb260b7c3))

* Add ball assets ([5cf6c74](https://github.com/Esposter/Esposter/commit/5cf6c745538f7b36d5f9b0a3f8147b2cdf00d722))

* Add better UX to add info dialog message and don't jump straight back ([b41771f](https://github.com/Esposter/Esposter/commit/b41771f1a709095dc618132ffb4e6e300ee80a87))

* Add crazy ass math function anime drawing ([5060eac](https://github.com/Esposter/Esposter/commit/5060eac87ea3ca5a2d30f1161b98c95052c4b225))

* Add expressions ([40c2adc](https://github.com/Esposter/Esposter/commit/40c2adc113621afa39d67899c16a644d3f46e41f))

* Add insane way to render vue components inside a custom html container ([4df88bc](https://github.com/Esposter/Esposter/commit/4df88bcfc0a0fe78504ac4ca7cb485d16cca41ff))

* Add interactable calendar ([1f69e13](https://github.com/Esposter/Esposter/commit/1f69e13c294a9ac4d9c76423edcc168bc1bcbd37))

* Add monster info container disappear tween ([2633dec](https://github.com/Esposter/Esposter/commit/2633dec21ef7f57bc9ca8ed1600b54580b8e8e0f))

* Add switching monsters ([1f7b151](https://github.com/Esposter/Esposter/commit/1f7b15188676f8a84a6b7c95de1eacdc59d2d2f4))

* Add switching monsters ([8bb7ab9](https://github.com/Esposter/Esposter/commit/8bb7ab984bf5f8062007786921bd71c67a7e2c01))

* Add yui ([90bc76a](https://github.com/Esposter/Esposter/commit/90bc76a4f4648d14afac99a145c46fbcca5d1dd0))

* move animate button behind expressions list menu ([e1b3495](https://github.com/Esposter/Esposter/commit/e1b349500a19155218b588659a8864243f6cf62b))

* Optimise to use interval instead of timeout ([ce52c6d](https://github.com/Esposter/Esposter/commit/ce52c6de785a6544e1ddd23fe45dd67bb357b832))

# [1.15.0](https://github.com/Esposter/Esposter/compare/v1.14.0...v1.15.0) (2024-07-01)

### Bug Fixes

* just compare cloned ver of original item ([54acd28](https://github.com/Esposter/Esposter/commit/54acd28b5c8c51a0d44abfba934cb3da796c736f))

# [1.14.0](https://github.com/Esposter/Esposter/compare/v1.13.0...v1.14.0) (2024-06-27)

### Bug Fixes

* add gain exp for non active monsters ([4ac107d](https://github.com/Esposter/Esposter/commit/4ac107de1d4bd9f512f1db62b9a84e2089f22ed7))

* Add state ([94360f4](https://github.com/Esposter/Esposter/commit/94360f433369997ff4fc040ec8106d65d480ab9f))

* clamp bar ([cc04c27](https://github.com/Esposter/Esposter/commit/cc04c27f0302f314b8e4d60994d851b59973e4a0))

* destroy tween when set to undefined ([e7209e7](https://github.com/Esposter/Esposter/commit/e7209e7723509263a555963b189860efb96d03b6))

* finally fix up all the remaining issues, works fine now ([0960e29](https://github.com/Esposter/Esposter/commit/0960e292722505a63b31bf86b06ec5e0736a7ec8))

* finally whew, smoothen out exp flow ([0e3fde8](https://github.com/Esposter/Esposter/commit/0e3fde84b9a1893ed9a809576f5d8d9e6e4926bc))

* keep skip animation ref separate ([7f9ad08](https://github.com/Esposter/Esposter/commit/7f9ad08dec2d8880c940178147d57f147e599f2c))

* level up complete ([3ebdcbb](https://github.com/Esposter/Esposter/commit/3ebdcbb57898a100134c28db835f2553d5f6c956))

* leveling up ([a8ee50d](https://github.com/Esposter/Esposter/commit/a8ee50d746262d7c7fbb606fb7baae13379e4260))

* monsters data ([ff9e08b](https://github.com/Esposter/Esposter/commit/ff9e08b92167640c5744641811d371878d148538))

* most of remaining exp issues ([5f36edb](https://github.com/Esposter/Esposter/commit/5f36edb7e5c0114fb4934a6bc7bad708be786f1b))

* revert back exp ([51dcb7d](https://github.com/Esposter/Esposter/commit/51dcb7de465c4c7db7c2f08f21fca4596b2d4b59))

* revert unnecessary reset ([2622f3a](https://github.com/Esposter/Esposter/commit/2622f3af94d9279a701c2a757530921fba562f9d))

* schema ([f684405](https://github.com/Esposter/Esposter/commit/f684405d507690b4d5a6a499f43e58ac45a9ab71))

* set not animating var to false in correct place ([78dbb54](https://github.com/Esposter/Esposter/commit/78dbb54e474c1a94ac3d565abc533e9ad4b3ca1a))

* show gain exp msg after leveling has fully completed ([3552055](https://github.com/Esposter/Esposter/commit/3552055abb15b81c6ad788b657cb0636bded4950))

* simplify exp ([9dc82b9](https://github.com/Esposter/Esposter/commit/9dc82b907567ce52b9209ac76e594933efa9f6e7))

* stupid while loop issue ([11c2798](https://github.com/Esposter/Esposter/commit/11c27989f5f48f2f61ae9330ecb7c0c6ea8a94c9))

* Support recursive onComplete calls ([1dd6a95](https://github.com/Esposter/Esposter/commit/1dd6a953ec4bb4cf3d22900925f536e3b468e603))

* use back scene delay call ([26b9b53](https://github.com/Esposter/Esposter/commit/26b9b5318b78c6887ae8ad38ddf9596794c3871b))

* uuuh actually level up monster thanks ([9dd59b5](https://github.com/Esposter/Esposter/commit/9dd59b56a6a8a2b48580a0dd2a0d4f98fb1c5ec9))

* while loop again ([23562c2](https://github.com/Esposter/Esposter/commit/23562c293294bdf7119949b7dc357227aa9e37a1))

### Features

* Add exp & refactor into status ([1b71855](https://github.com/Esposter/Esposter/commit/1b71855c3819efbd31948d9c1ce10a28604f2274))

* Add exp bar + emit level up ([1a5ac58](https://github.com/Esposter/Esposter/commit/1a5ac583c1d1db7c2180ba2cd17809384a4fd169))

* Add gaining exp ([1a8bf90](https://github.com/Esposter/Esposter/commit/1a8bf9054b0dcf9b9c9d57bc3f63f0148b44bf40))

* Add is running level animation to skip later ([571d97e](https://github.com/Esposter/Esposter/commit/571d97ed1fd2176923d155985a2ed83e4a22fc22))

* Add lvl up fn ([65611a2](https://github.com/Esposter/Esposter/commit/65611a23f8d35cd05e9269d91c19a4fb8ae4bb40))

* Divide exp by 7 ([9fc9f26](https://github.com/Esposter/Esposter/commit/9fc9f26d9db3ee64d080ce1e47f374b6436ed37a))

* fix up issues and properly emit and detect level up ([51624cb](https://github.com/Esposter/Esposter/commit/51624cbb20b38f6f0e908a183f57b3fb53dcdae4))

* Update bar to grab from monster exp ([0c03a38](https://github.com/Esposter/Esposter/commit/0c03a381d9c39079ff63a16ff0236e3a883172e0))

* Update monster details bar to also grab from monster exp ([0c67c6b](https://github.com/Esposter/Esposter/commit/0c67c6bf85b83c7fa06d7e2b1029bafed9335422))

### Reverts

* back to old tween setter map ([f4c109a](https://github.com/Esposter/Esposter/commit/f4c109a466045e1a73aff3750916fcbfa4511969))

# [1.13.0](https://github.com/Esposter/Esposter/compare/v1.12.0...v1.13.0) (2024-06-18)

### Bug Fixes

* component names ([d31f67c](https://github.com/Esposter/Esposter/commit/d31f67c99c41d26be7535b21189c37c2f18b5f22))

* disabling eslint for file ([a8283b6](https://github.com/Esposter/Esposter/commit/a8283b6fe7b6256f0a7d8d05f7b6bf1fde414a51))

* imagekey ([ca6fc12](https://github.com/Esposter/Esposter/commit/ca6fc1231552cdb6dea63c4de8812d57b8fdf74e))

* lint ([6f5c7dc](https://github.com/Esposter/Esposter/commit/6f5c7dc76fc0a93a45ec108e719e2e44dfa79cba))

* lint ([6be80e6](https://github.com/Esposter/Esposter/commit/6be80e62fe588fd942ce705644f225a1821350d6))

* make cloned class reactive ([696724e](https://github.com/Esposter/Esposter/commit/696724ebe53d8db902ec5a43591eaefe65d0785e))

* properly clone class to also pass test with strict equals ([35a92a2](https://github.com/Esposter/Esposter/commit/35a92a2ef22f1435bd4cde1552e51d7d10d1ea27))

* revert back to structured clone so we don't puck ourselves with trying to copy class prototype as well ([4fb535a](https://github.com/Esposter/Esposter/commit/4fb535a6dccbeb9ec34852838e064980dce461fe))

* types ([06a1151](https://github.com/Esposter/Esposter/commit/06a1151a937176b3cfc9b1411fa6f7b9196be2f2))

* use sleep anyways since it works + fix up types ([40fad06](https://github.com/Esposter/Esposter/commit/40fad0623149644a419bdcbd58c1cf5281d9bc1e))

* worker src ([23b1623](https://github.com/Esposter/Esposter/commit/23b1623b93bf074bb2accbb65b5a1d7969664c23))

### Features

* Add bar chart ([00af995](https://github.com/Esposter/Esposter/commit/00af99543e959b95523688ce706f5407c2d77963))

* Add bubble chart types ([a03bef2](https://github.com/Esposter/Esposter/commit/a03bef20ba68ed48f47e42650a452de58a5c48a4))

* Add candlestick + box plot charts ([fba6733](https://github.com/Esposter/Esposter/commit/fba6733d10d95c950c7f1f16e68c5eaf6e10b572))

* Add donut resolver ([4bd4474](https://github.com/Esposter/Esposter/commit/4bd4474249e32a349c15bb3a9b50be6da62344d4))

* Add exp bar asset ([2fc01a5](https://github.com/Esposter/Esposter/commit/2fc01a53d8e3b4094c99a4dec857ea0678bd98dd))

* Add heatmap chart ([be48e2f](https://github.com/Esposter/Esposter/commit/be48e2f62d4699a101d01674038dfcdbfd63a688))

* Add pie ([8f704ee](https://github.com/Esposter/Esposter/commit/8f704ee392d436fdd52a8187d0053b1f8fee933e))

* Add radial bar ([9740704](https://github.com/Esposter/Esposter/commit/97407047378737a3bc2c8f82b700e20f7b502512))

* Add range area chart ([be8d3f9](https://github.com/Esposter/Esposter/commit/be8d3f948430163206e9f21b8904b4d7e0a3bf01))

* Add range bar + funnel ([4df0c44](https://github.com/Esposter/Esposter/commit/4df0c44cccf6212c7a7bd578566005883365aa73))

* Add remaining polar area chart ([50eb08c](https://github.com/Esposter/Esposter/commit/50eb08ce62d26d11a2c78f06249c54453248b47e))

* Add scatter chart ([be4c7bb](https://github.com/Esposter/Esposter/commit/be4c7bb5959a23bf920d6c798ee8c7e6adb68600))

* Add slope ([8d134ce](https://github.com/Esposter/Esposter/commit/8d134cee691dd659c0ac36514a24f15bd1b3567e))

* Add specific chart type data ([5c103e0](https://github.com/Esposter/Esposter/commit/5c103e071a5c721ffe1394ca7da0a1757075824f))

* Add specific chart types for different visual types ([dc2ec57](https://github.com/Esposter/Esposter/commit/dc2ec577302b2468eb117f0d10c7072dde259640))

* Add treemap chart ([dd3db1f](https://github.com/Esposter/Esposter/commit/dd3db1f5974bb4b6ae84dfab0d8c2d0e8d5991f9))

* Add watch tracker test ([25d5ed4](https://github.com/Esposter/Esposter/commit/25d5ed4d4020cede63c71d09953803972ba6b20a))

* Enhance bar to acommodate different types/variations ([ad9b90c](https://github.com/Esposter/Esposter/commit/ad9b90c16cd71f649e7fb9c7ee514211e71d1ee1))

* move data labels to just a prop ([e44bb44](https://github.com/Esposter/Esposter/commit/e44bb44a2f6776e907ea4cdcc1c34d0bea9da330))

* use defu to add defaults ([d2d9196](https://github.com/Esposter/Esposter/commit/d2d91963802fc8c996f0f6c547dace8ac5a5a991))

# [1.12.0](https://github.com/Esposter/Esposter/compare/v1.11.2...v1.12.0) (2024-06-08)

### Bug Fixes

* appbar title padding ([5ae8007](https://github.com/Esposter/Esposter/commit/5ae80076ba8ffa313f9e3f8ae35679e1fe46958c))

* color ([4d3f927](https://github.com/Esposter/Esposter/commit/4d3f927c45d06c5f48a3b00509c85cb42627fc55))

* debounce time ([8eb7fc9](https://github.com/Esposter/Esposter/commit/8eb7fc911c1acf85e3496b85f2402b27e4aa1832))

* enum and vue component name collision ([fff1ba2](https://github.com/Esposter/Esposter/commit/fff1ba26d76d5b3c4a4c6e42a304a7a09ed99242))

* formatting ([2998886](https://github.com/Esposter/Esposter/commit/2998886881b314888ca572f914d839ffc35909d0))

* paddings ([ac25477](https://github.com/Esposter/Esposter/commit/ac25477f5d2d916ca49a22696308abedf471bbde))

* rename ([3e335a2](https://github.com/Esposter/Esposter/commit/3e335a2018f45e89c167a36e6aeaa2c6cf281ac4))

* stringify json ([410e3db](https://github.com/Esposter/Esposter/commit/410e3db4c0041ee409d49380a508ea6cf978f699))

* styles ([576fb59](https://github.com/Esposter/Esposter/commit/576fb5940153ea4c3fd5723ff834e508c4396b4a))

### Features

* Add counter ([54c1069](https://github.com/Esposter/Esposter/commit/54c1069ea78ed201c9d38984d14a92a41d0b250c))

* Add dark mode for code mirror ([460e2df](https://github.com/Esposter/Esposter/commit/460e2df7df6eea57a6b6f80f2424a58a4f7c02ea))

* Add email editor ([8e54f48](https://github.com/Esposter/Esposter/commit/8e54f486dd121879e99b9ff117b245a657e1ddba))

* Add superjson ([627e902](https://github.com/Esposter/Esposter/commit/627e9021fa12ee30a7421aa046fcffe80740f9f6))

* add tabs and preview ([f734f9c](https://github.com/Esposter/Esposter/commit/f734f9cd92fcdaf11b7bf48e81f681bad5c34fcd))

## [1.11.2](https://github.com/Esposter/Esposter/compare/v1.11.1...v1.11.2) (2024-06-04)

**Note:** Version bump only for package @esposter/app

## [1.11.1](https://github.com/Esposter/Esposter/compare/v1.11.0...v1.11.1) (2024-06-04)

**Note:** Version bump only for package @esposter/app

# [1.11.0](https://github.com/Esposter/Esposter/compare/v1.10.0...v1.11.0) (2024-06-04)

### Bug Fixes

* Add defaults so vjsf also defaults ([2718713](https://github.com/Esposter/Esposter/commit/2718713c333e427b4578da4a8b2d44e63d12659a))

* Add watch tracker ([2636b5c](https://github.com/Esposter/Esposter/commit/2636b5cd234e92b66ce302ba0c43675ecb99353c))

* defaults ([82c7b0c](https://github.com/Esposter/Esposter/commit/82c7b0c8b5f07d79459911c207da4619e584dd75))

* imports ([5424713](https://github.com/Esposter/Esposter/commit/54247138e0e9ed213ac3622b417551b98b809c1e))

* improve types ([61d7d07](https://github.com/Esposter/Esposter/commit/61d7d079f619c6c6ff34ddad3e9865a4241200c8))

* just use size full ([8e81230](https://github.com/Esposter/Esposter/commit/8e81230308d8adb926d0da8b79df22f5a4ab2985))

* lint ([cd8221f](https://github.com/Esposter/Esposter/commit/cd8221f9f5a663e61be43a37bb320eb8c71267a3))

* move folder ([89c09c3](https://github.com/Esposter/Esposter/commit/89c09c35be22be8466f32b329155fe64558b715f))

* re-assigning schema ([30bbbaa](https://github.com/Esposter/Esposter/commit/30bbbaa53c9850aaaf09d5057bc964ee69631b44))

* remove unnecessary deep ([c197630](https://github.com/Esposter/Esposter/commit/c197630a9d0ecf83e46c00e5be57d6e5e742cc7a))

* render table editor in client only ([f4c2dc1](https://github.com/Esposter/Esposter/commit/f4c2dc17cfb30073e6eaec6de8d7e60f2da71c11))

* schema and using resolvers ([484ffe8](https://github.com/Esposter/Esposter/commit/484ffe831fadd1639a0c73d930464ab92b802094))

* schema field orders, now it's perfect c: ([0faaebb](https://github.com/Esposter/Esposter/commit/0faaebb95c98e1bc783f8f9e6b982efbceb669e4))

* types ([ee67111](https://github.com/Esposter/Esposter/commit/ee671118a1678f2e139498d386c5b14a7f54be07))

* types ([cfe5c46](https://github.com/Esposter/Esposter/commit/cfe5c465298fc8f11170af5a641cf0deb8404dd6))

* types & clone ([6653163](https://github.com/Esposter/Esposter/commit/6653163495dec2aafbcc0c378f1813269097af33))

* types & dashboard ([b02836c](https://github.com/Esposter/Esposter/commit/b02836c1628f6aeff937e8533a2dabebbd19a821))

* use click event ([ac0036b](https://github.com/Esposter/Esposter/commit/ac0036b04cd86262f0ae33c244814dd3fc03de6d))

* use edited item type ([49d5224](https://github.com/Esposter/Esposter/commit/49d52245b8e08a8a68cb3d0402f679515eeffbf1))

* use icd ([cd3a587](https://github.com/Esposter/Esposter/commit/cd3a5870355ab489df422b1001ae0abe77ba6079))

* use mouse events to determine drag/click ([dfc909f](https://github.com/Esposter/Esposter/commit/dfc909f1f3f372c10a5135a0dee456c769f37023))

* use object assign to override proper values ([d50ff3d](https://github.com/Esposter/Esposter/commit/d50ff3d33f707f98920832e5f0ee0df6cd540ff1))

* use prevent to also have vuetify prevent submit default natively ([f84fbe7](https://github.com/Esposter/Esposter/commit/f84fbe76503220f2e3781030c3688a30bd0c8be5))

* visual list + vuetify styles ([a12a6bd](https://github.com/Esposter/Esposter/commit/a12a6bdabd8e62ada7bf3df5730e76c3b28dbccc))

### Features

* Add complete type-safe resolver ([5527a1c](https://github.com/Esposter/Esposter/commit/5527a1c8de330342473376b7771ae12dd4018e4d))

* Add proper removing/keeping only expected propreties when switching types ([b729c1f](https://github.com/Esposter/Esposter/commit/b729c1f48e3a871025f5868f2d87d905d395009c))

* Add vite pkg ([837a130](https://github.com/Esposter/Esposter/commit/837a1306a226e44b061a3f8a6c660e33dff99078))

* move subtitle to  base ([3aba2d1](https://github.com/Esposter/Esposter/commit/3aba2d10a2a1cebe88e797816abb57e08fadbee5))

* Move to on click except drag composable + refactor preview container ([ab0c5ac](https://github.com/Esposter/Esposter/commit/ab0c5ac99dfaa7a239ca87c18a4c7faceddd3fd4))

* successfully used vue package ([5d1ac61](https://github.com/Esposter/Esposter/commit/5d1ac61970afe222f3841232e2225a88cf097b2b))

* support different types of charts ([3cb020e](https://github.com/Esposter/Esposter/commit/3cb020e2bedc7dd6b4c390da184f01f48f5d8d1e))

* Support switching chart types, this was crazy ([cdcc153](https://github.com/Esposter/Esposter/commit/cdcc153ce2ac350d23df9929803847021e95dfb9))

# [1.10.0](https://github.com/Esposter/Esposter/compare/v1.9.1...v1.10.0) (2024-05-28)

### Bug Fixes

* abstract out use confirm before navigation ([b382460](https://github.com/Esposter/Esposter/commit/b382460fe70d98ee0f834a1089d9ad7f7ed47539))

* add back return value ([bc0019c](https://github.com/Esposter/Esposter/commit/bc0019ce82a34a99e19a59fdbd1a44023d109f5c))

* Add file ([cea1e0d](https://github.com/Esposter/Esposter/commit/cea1e0d7cbe184445355f848ac2c8a24ee45943c))

* Add to chart configuration ([9182665](https://github.com/Esposter/Esposter/commit/91826651fd57f170dfd960d75a9c0336eb1bdf3f))

* add use confirm before navigation ([009512c](https://github.com/Esposter/Esposter/commit/009512c859f1c99600fc2ca86320a34e07be352f))

* Add worker-src ([01a8cb9](https://github.com/Esposter/Esposter/commit/01a8cb924991bbb51494d6ed2c32674738270b4b))

* autosave when things change ([1c23ee9](https://github.com/Esposter/Esposter/commit/1c23ee99efce39ec51d6410469dd2c5007e061de))

* autosaving ([df3a5be](https://github.com/Esposter/Esposter/commit/df3a5be1d24b9284beed6c698809d7045efdba4a))

* bubble data ([cba9658](https://github.com/Esposter/Esposter/commit/cba965895c66b8befc6d6e225355819e048880cf))

* coalesce types to string ([852f51c](https://github.com/Esposter/Esposter/commit/852f51ca76e92d627c8c00769ddf1b36caea03c0))

* custom payload ([b30ebc9](https://github.com/Esposter/Esposter/commit/b30ebc942a917fe9eb4652eef9433b6b85608508))

* deep equals ([1d2b793](https://github.com/Esposter/Esposter/commit/1d2b793becd4208793c84007245248aee62331dd))

* don't need check ([7abf93e](https://github.com/Esposter/Esposter/commit/7abf93eec28626c615d20255936190ed44b6db03))

* don't stretch flexed items ([c32e7de](https://github.com/Esposter/Esposter/commit/c32e7de27bb97d4025fe20dd272fd2f598f57523))

* header ([b32df1d](https://github.com/Esposter/Esposter/commit/b32df1dcbcbb4fb8b50fdb9fac802a3a933ec9c3))

* header & add fade ([359a7c1](https://github.com/Esposter/Esposter/commit/359a7c16409fd0f8f5eddd6fd711ce280f2c62d5))

* height ([200781d](https://github.com/Esposter/Esposter/commit/200781d2009b2952452516e7975a7a732e78fb97))

* image padding ([696774c](https://github.com/Esposter/Esposter/commit/696774c1eb15faff45b692c0611c7c8078a963fd))

* jesus, finally fix up dashboard visuals ([cf1146f](https://github.com/Esposter/Esposter/commit/cf1146f5e5ee080021ba11ed87cb31903e8b9337))

* just use old grid layout ([1ba9308](https://github.com/Esposter/Esposter/commit/1ba93083f195062d735e8e9ea82387558ab1ddd8))

* link ([be4997e](https://github.com/Esposter/Esposter/commit/be4997e3a6258655ea7e8f79ce81841b7014b458))

* loading editor in csr only + update config properly ([9f4c33b](https://github.com/Esposter/Esposter/commit/9f4c33b24970cc8f2cbdada208eda80dd770e716))

* min height ([863fd65](https://github.com/Esposter/Esposter/commit/863fd65632762be2f07b5d282afb3c4f128cd750))

* no longer need to move line down ([0bc7974](https://github.com/Esposter/Esposter/commit/0bc79749677badb531de7c0674542b00b0075b57))

* omit deep ([f1aa573](https://github.com/Esposter/Esposter/commit/f1aa5736acf2ab77b14e69cad3ee6891d77172c5))

* onMounted edit item ([39ac09f](https://github.com/Esposter/Esposter/commit/39ac09f8d7edb22018fa9485ef35bd27e4815756))

* reference the function ([2082212](https://github.com/Esposter/Esposter/commit/2082212701c7d881ef0ccebbe0539ef29e9ce793))

* remaining recursive types ([a252661](https://github.com/Esposter/Esposter/commit/a2526616a9d06bd5f31389d67fa24859e04e4311))

* remove height full ([3091096](https://github.com/Esposter/Esposter/commit/3091096fc48b793be6ff7ab9a46ae7b133620e73))

* remove submit and just use vue native events ([ec2c1ad](https://github.com/Esposter/Esposter/commit/ec2c1ad4cc0df57e7e8aa15361c4243051e8a3f3))

* remove unnecessary build include dep paths ([2294a2c](https://github.com/Esposter/Esposter/commit/2294a2c774eb6adeb9ec9af116c924f0dc016cf4))

* remove unnecessary hide-details ([4cc1ee4](https://github.com/Esposter/Esposter/commit/4cc1ee413cd94d918e735fe4714d9c7c705c1162))

* remove unnecessary style ([b74afbd](https://github.com/Esposter/Esposter/commit/b74afbd2019f6a4da9149d3974f5001793c8d4dc))

* rendering schema ([3b326e1](https://github.com/Esposter/Esposter/commit/3b326e14a6abf61cbd595c3bef3f2f1fcaba0e67))

* row height and close button ([25d1406](https://github.com/Esposter/Esposter/commit/25d1406eaec9f20c6e0b110835d74d44a4e0b7b5))

* rules ([5797ee1](https://github.com/Esposter/Esposter/commit/5797ee1eaa0df1f1918b043cd6717e0e5522edb9))

* store id ([5193d40](https://github.com/Esposter/Esposter/commit/5193d406662b18a3bb19c08f51ef98c2e0e0fde8))

* styles ([1a94b2e](https://github.com/Esposter/Esposter/commit/1a94b2e674fcaa0b733f97d2ae2525dbdfaf77a0))

* third party image + immediate flag ([32924de](https://github.com/Esposter/Esposter/commit/32924de7038c0439298a628b4c0d6661e043c4bc))

* types ([b222d6d](https://github.com/Esposter/Esposter/commit/b222d6d9627bf790428220aefe04b24ddb674ac9))

* types ([10006ba](https://github.com/Esposter/Esposter/commit/10006ba656e85ff08470b158106daca5369daf6b))

* types ([b8b825d](https://github.com/Esposter/Esposter/commit/b8b825d9b52a8fb20716fcdace5e14df031caa58))

* use edited item, you dum dum ([1364707](https://github.com/Esposter/Esposter/commit/1364707b3e065918640967c23e22df7a1b515017))

### Features

* Add auto gen json schema from zod schema ([4cc6900](https://github.com/Esposter/Esposter/commit/4cc6900ed1592540cb5425e4cfa91e3acdc1c9dd))

* Add basic chart support ([6364d4d](https://github.com/Esposter/Esposter/commit/6364d4dc2c3ab0134a750104af8fd711ed8f0676))

* Add chart configuration ([9588c65](https://github.com/Esposter/Esposter/commit/9588c65fa8a7b28b1081fe4777f0ea77c4267ff4))

* Add column type ([97dcc13](https://github.com/Esposter/Esposter/commit/97dcc13514b154ee12c8775bd91bfe3648353c73))

* Add dashboard grid ([90fb25a](https://github.com/Esposter/Esposter/commit/90fb25a552f4c29d479e05d0472f617fd4dc4d52))

* Add demo visuals ([0bc7d1c](https://github.com/Esposter/Esposter/commit/0bc7d1c9088a82ac77f540df3c5fdaa8e95646c7))

* Add edit form now to visual ([303818b](https://github.com/Esposter/Esposter/commit/303818b2f362ecc90b5d61cf4ae8e94cbc7b3c2f))

* Add models + have dashboard visuals now ([1a90fe8](https://github.com/Esposter/Esposter/commit/1a90fe8351c395380c4c527f2b23c0d04b8e6a1a))

* Add offset to support edge cases ([31a47d0](https://github.com/Esposter/Esposter/commit/31a47d0f168901967dfa71e828de51f9ad28a1bc))

* Add recursive keyof type ([342a888](https://github.com/Esposter/Esposter/commit/342a8887a07b9632786d08badb4490d6c299a9df))

* Add remove button ([b47fdab](https://github.com/Esposter/Esposter/commit/b47fdabb879933721d58b8eba810db4c7706d7ab))

* Add sample data ([4c1ef7a](https://github.com/Esposter/Esposter/commit/4c1ef7a42d079754ec34e53e60d7d157e8946b08))

* Add tooltip ([7eac228](https://github.com/Esposter/Esposter/commit/7eac228f3dfbff5f4007fc20e84cff6053465af4))

* Add type for chart ([a4e8627](https://github.com/Esposter/Esposter/commit/a4e86270c73393a2ffc89de70b5c817e5afc37ba))

* Add vuetify json schema ([9079179](https://github.com/Esposter/Esposter/commit/90791796f5f100dbbec5dae3f684f38bec4af7a4))

* Also support offset in same row ([0eecdb2](https://github.com/Esposter/Esposter/commit/0eecdb2a11e34e9e6e409d1e944b847f30c48e6d))

* apply focus within to only emphasise if not clicking inside child ([2e44503](https://github.com/Esposter/Esposter/commit/2e44503a8bde61b563610a41d575c67ddcf6ce3b))

* move things to stores ([8be6175](https://github.com/Esposter/Esposter/commit/8be6175a638830283510ad52f38a0074f2387c04))

* persist dashboard data ([e1440cf](https://github.com/Esposter/Esposter/commit/e1440cf03e5164b34e3d18e994a48d555fb470ac))

* switch to apex charts demo which is much cleaner ([f8e9268](https://github.com/Esposter/Esposter/commit/f8e926835f2470ca725063315a2286774b188647))

* switch to use vjsf ([a26722d](https://github.com/Esposter/Esposter/commit/a26722df834f116bded1902b3ac90ab9c0914390))

* try use abstracted edit form dialog ([ccf7af2](https://github.com/Esposter/Esposter/commit/ccf7af2d94c0495f7afdff8b2b9b9dab09407739))

* try use quickchart for preview ([e11884a](https://github.com/Esposter/Esposter/commit/e11884a89c1e5e5ec33dc9dbc76ae82154b1c3f6))

* Update visual to extend existing interfaces ([8a699ed](https://github.com/Esposter/Esposter/commit/8a699ed8413a398fabaa7f7856f2c83ce1975440))

* Use better indication of drag ([88a7c41](https://github.com/Esposter/Esposter/commit/88a7c41f51f1e59639cc61c74a3679eb76a52498))

* use display grid to support all sorts of weirdness with dashboard layouts ([0ea57a2](https://github.com/Esposter/Esposter/commit/0ea57a22a3400da30d0cd237ab8b84bb62b18fe0))

* used vuetify grid system to show grid visuals ([1d60b82](https://github.com/Esposter/Esposter/commit/1d60b82e3b8002da34a510360ace357b13946e1e))

### Performance Improvements

* use fast deep equals to check if savable ([279be25](https://github.com/Esposter/Esposter/commit/279be25287cc6969ec2e8a41f2d05778a874dcec))

## [1.9.1](https://github.com/Esposter/Esposter/compare/v1.9.0...v1.9.1) (2024-05-21)

### Bug Fixes

* use tsx back ([f5981df](https://github.com/Esposter/Esposter/commit/f5981df689fafc12411b94e99f9b27411ddd1389))

# [1.9.0](https://github.com/Esposter/Esposter/compare/v1.7.1...v1.9.0) (2024-05-20)

### Bug Fixes

* add separate tsconfig for scripts ([b8b96ca](https://github.com/Esposter/Esposter/commit/b8b96cadd367d411353804fdb3e8cf81b6966780))

* lint ([2620a47](https://github.com/Esposter/Esposter/commit/2620a472120d9d53079b8ae0fc5230c772b2fc4d))

* remove deprecated stuff ([11aae13](https://github.com/Esposter/Esposter/commit/11aae139b259a55ff7e2d5349c0b6b53e3c67b48))

* remove unnecessary vscode settings + move data-urls to root ([7d7ba46](https://github.com/Esposter/Esposter/commit/7d7ba466f0bd137d25472591a81a7b4b9a979117))

* stuff up ([1852568](https://github.com/Esposter/Esposter/commit/185256899307c2e9a0e9f64c1a0e038498cb9ad9))

* use pnpm ([8cc8394](https://github.com/Esposter/Esposter/commit/8cc8394d89714053aa8ff4782e85c4f2842ba7f0))

* use pnpm ([930416f](https://github.com/Esposter/Esposter/commit/930416f0fa32dc37b8af72d622d4d1d5a3f5df0c))

* use pnpm ([7116647](https://github.com/Esposter/Esposter/commit/7116647d2d18827b36659a96499dcbb8c63fe457))

### Features

* Add shared rollup ([89b938f](https://github.com/Esposter/Esposter/commit/89b938f6c27b52d5883b78d7b98be93b8d09f946))

## [1.7.1](https://github.com/Esposter/Esposter/compare/v1.7.0...v1.7.1) (2024-05-18)

### Bug Fixes

* lerna publish ([5f362b4](https://github.com/Esposter/Esposter/commit/5f362b4e50e01cc4ed3cced3208730fa24335938))

# [1.5.0](https://github.com/Esposter/Esposter/compare/v1.1.2...v1.5.0) (2024-05-18)

### Bug Fixes

* commit changes ([25b569d](https://github.com/Esposter/Esposter/commit/25b569d3529ea01b7bcebe78114267dea523a92f))

### Features

* move nuxt app to separate package ([a0546f6](https://github.com/Esposter/Esposter/commit/a0546f672564ac0fe26e44eee29c9b752b1ee851))

# [1.4.0](https://github.com/Esposter/Esposter/compare/v1.1.2...v1.4.0) (2024-05-18)

### Bug Fixes

* commit changes ([25b569d](https://github.com/Esposter/Esposter/commit/25b569d3529ea01b7bcebe78114267dea523a92f))

### Features

* move nuxt app to separate package ([a0546f6](https://github.com/Esposter/Esposter/commit/a0546f672564ac0fe26e44eee29c9b752b1ee851))

# [1.3.0](https://github.com/Esposter/Esposter/compare/v1.1.2...v1.3.0) (2024-05-18)

### Bug Fixes

* commit changes ([25b569d](https://github.com/Esposter/Esposter/commit/25b569d3529ea01b7bcebe78114267dea523a92f))

### Features

* move nuxt app to separate package ([a0546f6](https://github.com/Esposter/Esposter/commit/a0546f672564ac0fe26e44eee29c9b752b1ee851))

# [1.2.0](https://github.com/Esposter/Esposter/compare/v1.1.2...v1.2.0) (2024-05-18)

### Features

* move nuxt app to separate package ([a0546f6](https://github.com/Esposter/Esposter/commit/a0546f672564ac0fe26e44eee29c9b752b1ee851))
