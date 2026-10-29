## 1. Publish the index

- [x] 1.1 Build the index record from the packs' manifests and publish it as a game data record beside the files. Verify: a test named after the scenario 'Index lists each avatar's files' in `buildCharacterPackIndex.test.ts`, seen failing first.
- [x] 1.2 Report the index's avatar count and total bytes in a dry run, with no request to either account. Verify: a test named after the scenario 'Dry run reports the index and writes nothing', and `pnpm -C scripts genshin:assets character-packs --dry-run` printing `13 avatars` and `84982707` bytes.
- [x] 1.3 Publish to both accounts and verify the lock (run by the main session, which holds the credentials). Verify: `pnpm -C scripts genshin:data verify` passes on both accounts and `gameDataLock.json` carries the index key.

## 2. Game text

- [ ] 2.1 Add the downloading line (id 1323480176), the failure line (id 3595641979) and Retry as `GameTextKey` members and write them in every language. Verify: `pnpm -C scripts genshin:text write` leaves `packages/genshin-text/src/generated` changed only by these three keys and the key sort test passes.

## 3. Download services

- [x] 3.1 Read the index through the hosted game data with a schema that satisfies its model. Verify: a test reading the index at `GAME_DATA_LOCAL_BASE_URL` once the main session has published it, seen failing first.
- [x] 3.2 Plan the download as the files and bytes the browser's Cache Storage lacks, keyed by file url and sha256. Verify: tests named after the scenarios 'First visit downloads every file', 'Returning visit downloads nothing' and 'Republished file is fetched again', seen failing first.
- [x] 3.3 Download the planned files six at a time, streamed, reporting loaded bytes, with three attempts each. Verify: tests named after the scenarios 'Retry fetches only what is missing' and 'Failure never enters the world without the model', seen failing first.
- [x] 3.4 Serve a `CharacterPackReader` from the cache so `readCharacterMesh` and the terms read the held files. Verify: a test reading a model file and a terms file through the reader from a stubbed cache, seen failing first.

## 4. Opening and loading screen

- [ ] 4.1 Start the preload when the opening mounts and expose bytes loaded, bytes pending, failure and retry from a composable. Verify: a test mounting the opening with an empty cache and a fetch stub showing the preload begins at mount, seen failing first.
- [x] 4.2 Compose the host's bar from the bytes while any are pending and the thirds after. Verify: tests named after the scenarios 'Size shows beside the bar while bytes are pending' and 'Nothing pending shows no size' on the bar's value, seen failing first.
- [ ] 4.3 Draw the downloading line, the bytes over the bytes in the reader's language and the failure line with Retry on the startup loading screen. Verify: the screen's fixture renders with pending bytes, with none and with a failure; the owner's eyes judge the look against the game's own downloading line.

## 5. The world draws the model

- [x] 5.1 Draw the player's character from the reader in `Windrise` and load the Traveler for a save naming a character outside the index. Verify: tests named after the scenarios 'Held pack draws the character's model' and 'Character outside the index loads the Traveler', seen failing first.
- [x] 5.2 Delete the character capsule and its constant, and stop the loading when a pack is missing. Verify: `git grep CharacterPlaceholder` finds nothing and a test named after the scenario 'Missing pack stops the loading and draws no capsule' passes.
- [ ] 5.3 Show the pack's terms beside the character on the Character screen from the reader, then delete `PackLoader`. Message the Mac session before touching the Character folder. Verify: the Character screen's fixture renders the terms from a stubbed reader and `git grep PackLoader` finds nothing.
- [ ] 5.4 Decide what the world draws, or whether the loading stops, when a held model fails to read in `Character/Model`. The capsule was removed, so such a character is now invisible on the field with nothing logged beyond the console error. Verify: a test named after the chosen scenario, seen failing first.

## 6. Delete the three routes

- [x] 6.1 Delete the development server's pack route, its services, its env entry and its bundle entry. Verify: `git grep GENSHIN_CHARACTER_PACKS_DIRECTORY` finds nothing and the web app's tests of the touched paths pass.
- [x] 6.2 Delete the account's kept packs: the tRPC procedures, the API route, the models, the composable, the blob helpers and the account deletion line. Verify: `git grep -i accountCharacterPack -- apps packages scripts` finds nothing (the spec prose naming it is 7.1's) and the genshin router and account deletion tests pass.
- [x] 6.3 Delete the browser's kept packs: the zip, folder, picked and stored readers, the stores and the character pack names helpers. Verify: `git grep readCharacterPackZip -- apps packages scripts` finds nothing (the spec prose naming it is 7.1's) and `genshin-world` typechecks.

## 7. Specs and documents

- [ ] 7.1 Move the published-packs, drawing, player-packs and development-packs specs with the change and update the characters README, the published-packs design (the world now reads them) and the specs of account deletion, storage quotas, blob lifecycle, user data inventory and IndexedDB that name the removed routes. The development-packs design's paragraph on the server's `genshin-world/characterPack` entry (the entry and `packages/genshin-world/src/characterPack.ts` 5f79a93d0f deleted) and the player-packs design's `CHARACTER_PACK_INDEX_PATH` citation in `services/character/constants.ts` (removed by 5f79a93d0f) are retired with their specs. The player-packs design's Key files table and prose name the modules 8f1e8f01c3 deleted (readCharacterPackZip, readCharacterPackZips, readCharacterPackFolders, readPickedCharacterPacks, readAccountCharacterPackFile, settleEachNamed, identifyCharacterPack, the stores and the loader) and the row of the composable useAccountCharacterPacks, whose file is already deleted; the moved spec names none of them, as the workspace citations and staleNames tests hold. Verify: `git grep -n "character pack"` over `openspec/specs` names only the published packs and `scripts/src/services/openspec` tests pass.
- [x] 7.2 Refresh the genshin-world size snapshot and fix the prune test that expects a file the publish never writes. Verify: `pnpm -C packages/genshin-world test src/index.test.ts --run` and `pnpm -C scripts test src/services/gameData/pruneGameData.test.ts --run` pass.
