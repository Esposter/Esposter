## 1. Provenance

- [ ] 1.1 Write the one stamp writer and its reader: the schema, the game version read from the install's config, the tool's version and SHA-256, the operating system, the command, and a reader that refuses a stamp of another version or none. Verify: `provenance.test.ts` written first and seen failing, asserting 'A written export carries its stamp beside it', 'A reader reports output made before a later change to its producer', 'A fit refuses an export stamped with another game version', 'A fit refuses an export with no stamp' and 'The map is remade for another game version'.
- [ ] 1.2 Make every writer call the one stamp writer and delete `producer.json`: the extraction, witness, inventory, avatar, shaders (with the operating system's build), clips, playlist, interface, city areas, scene scripts, the fits and the lock. Verify: `extractComponent.test.ts` written first and seen failing, asserting 'An extraction leaves no earlier stamp file' and 'A written export carries its stamp beside it'.

## 2. Pinned sources

- [ ] 2.1 Pin the text repository to one commit constant, fetch the dump at that commit, and record the commit in the output's stamp. Verify: `genshinText.test.ts` written first and seen failing, asserting 'A fetched source is pinned to a commit' and 'A moved branch does not change a run'.
- [ ] 2.2 Pin the asset-path index to one commit constant, record its SHA-256 with the derived names, and keep its fetch to a missing file. Verify: `ensureAssetPathIndex.test.ts` written first and seen failing, asserting 'A fetched source is pinned to a commit' and 'A moved branch does not change a run'.
- [ ] 2.3 Pin the gcsim kits to one commit constant and read them raw at that commit. Verify: `readGcsimMainCharacters.test.ts` written first and seen failing, asserting 'A fetched source is pinned to a commit'.
- [ ] 2.4 Pin the decoder constants to the commit whose decoder matches the install's version, or read them from the install's chunks when no commit does (needs the game install). Verify: `decoderConstants.test.ts` written first and seen failing, asserting 'A fetched source is pinned to a commit'.

## 3. Pinned tools

- [ ] 3.1 Build the Windows AnimeStudio archive from the pinned commit, pack it as a record, install it through `installPinnedTool` with its SHA-256, and remove the default under the Downloads folder (needs the PC). Verify: `installAnimeStudioCli.test.ts` written first and seen failing, asserting 'A tool whose archive fails its SHA-256 is refused'.
- [ ] 3.2 Install the vkd3d compiler through `installPinnedTool` and remove its `VKD3D_COMPILER` and `PATH` fallback. Verify: `disassembleWithVkd3d.test.ts` written first and seen failing, asserting 'A stage ignores a tool of the same name on the PATH'.
- [ ] 3.3 Pin the macOS vgmstream archive beside the Windows one, and choose the archive by platform. Verify: `resolveVgmstream.test.ts` written first and seen failing, asserting 'A tool whose archive fails its SHA-256 is refused' and 'A stage ignores a tool of the same name on the PATH'.
- [ ] 3.4 Pin the macOS ffmpeg archive, read the gcsim kits without the GitHub CLI, and name the system `tar` and `sysctl` by their paths. Verify: `resolveFfmpeg.test.ts` written first and seen failing, asserting 'A stage ignores a tool of the same name on the PATH'.
- [ ] 3.5 Decide whether the system `tar` and `sysctl` are pinned like the other tools or exempt from the pinned-archive requirement, since `installPinnedTool` runs the system `tar` and the requirement forbids an unpinned tool. Write the choice into the requirement's scenarios and the design's tools decision, and make task 3.4 follow it. Verify: the requirement, the design and task 3.4 name the same rule for `tar` and `sysctl`, and a scenario covers it.

## 4. Paths

- [ ] 4.1 Make the data root one constant in the shared-node package, derive the content cache, the parity folder, the tools folder and the fleet's parity default from it, and drop the Downloads defaults. Verify: `dataRoot.test.ts` written first and seen failing, asserting 'Every machine root derives from one data root'.
- [ ] 4.2 Write block links and map sources relative to the data root, replacing each absolute symlink. Verify: `linkBlockFiles.test.ts` written first and seen failing, asserting 'An export holds no absolute machine path' and 'A block link resolves under another data root'.

## 5. Records

- [ ] 5.1 Register each record and its writer command in one table that `references pack --kind record` reads, and refuse any path no row names. Verify: `recordTable.test.ts` written first and seen failing, asserting 'A record has one writer' and 'A record with no writer is refused'.
- [ ] 5.2 Give each record with no writer a writer or retire it, check each key for a second writer, and split the catalogue's fitted outlines into their own key. Verify: `recordTable.test.ts` asserts 'A record has one writer' for every key in the table.

## 6. Fits and refits

- [ ] 6.1 Make each fit write its record into the records folder instead of the world data folder, and read the catalogue outlines, the region camps and the capitals through the lock. Verify: `writeWorldData.test.ts` written first and seen failing, asserting 'A fit leaves the authored world files as they are'.
- [ ] 6.2 Keep each fit's report beside its record, and publish with the report's SHA-256 in the publish body. Verify: `publishObjectsStep.test.ts` written first and seen failing, asserting 'A fit's report is kept beside its record'.
- [ ] 6.3 Make the refits (`notes`, `expression`, `instruments` and `calibrate --write`) name the hash of the record they read, and refuse a record whose hash has changed. Verify: `refitInput.test.ts` written first and seen failing, asserting 'A refit refuses a record whose hash differs from its report's' and 'A refit runs on the record its report names'.

## 7. Extraction, fleet and lock

- [ ] 7.1 Make the interface, playlist, inventory and witness writers clear the folders they own before they write, as the clips, shaders and avatar writers already do. Verify: `clearOwnedFolders.test.ts` written first and seen failing, asserting 'Re-extracting leaves no stale file' and 'A writer clears only the folder it owns'.
- [ ] 7.2 Make the fleet copy decide each file by a content digest, copy a link as the data it points at, and refuse a folder stamped with another game version. Verify: `fleetCopy.test.ts` written first and seen failing, asserting 'A file of equal size and time but other content is copied', 'A link is copied as the data it points at' and 'The fleet copy refuses a folder stamped with another game version'.
- [ ] 7.3 Make `genshin:data verify` compare the generated lock with the committed lock, and fail on a difference. Verify: `verifyCommand.test.ts` written first and seen failing, asserting 'Verify fails when the lock differs from the committed lock' and 'Verify passes when the lock matches the committed lock'.

## 8. Decoders and the game-running guard

- [ ] 8.1 Commit the Windows build's reference block counts beside the build, and accept the macOS build only at those counts (the Windows counts need the PC). Verify: `checkAnimeStudioParity.test.ts` written first and seen failing, asserting 'The Windows counts are committed beside the build' and 'A Mac build whose counts differ from the Windows counts is refused'.
- [ ] 8.2 Add the macOS branch to the game-running guard as a process check. Verify: `checkIsGameRunning.test.ts` written first and seen failing, asserting 'A block run refuses while the game is running on macOS' and 'A block run proceeds when the game is not running on macOS'.

## 9. Measured values

- [ ] 9.1 Move the glow scales, the other hand-set fit constants and the values measured from captures (the cloud band spreads, the sky colours, the light strengths and the camera path) into measurement files that name each capture and frame, and make the reader refuse an entry with no capture. Verify: `measurements.test.ts` written first and seen failing, asserting 'A measured value names the capture it was read from' and 'A measurement entry with no capture is refused'.

## 10. Owning pages

- [ ] 10.1 Carry the owning pages with the code they describe: the derived assets page and its spec (the producer requirement is replaced), the AnimeStudio macOS page, the hosted game data page, the recoverability page, the scene derivation page, the game text page, and the genshin-data and genshin-parity skills. Verify: `pnpm -C scripts exec vitest run src/services/openspec src/workspace/openspecLinks.test.ts src/workspace/citations.test.ts` passes.

## 11. Reproduction

- [ ] 11.1 Run the pipeline on a fresh PC and a fresh Mac, each holding the install, and compare the two generated locks (needs the PC and a Mac with the install). Verify: the run's output shows the two lock files are the same file, as 'A fresh pair publishes the same lock from one install' requires.
