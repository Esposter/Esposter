## 1. Paths

- [ ] 1.1 Make the data root one constant in the shared-node package, derive the content cache, the parity folder, the tools folder and the fleet's parity default from it, and drop the Downloads defaults, except the Windows CLI's, which genshin-pipeline-provenance task 3.1 removes, and hold the Windows install folder in that same one place rather than in a constant of its own. Verify: `dataRoot.test.ts` written first and seen failing, asserting 'Every machine root derives from one data root'.
- [ ] 1.2 Write block links and map sources relative to the data root, replacing each absolute symlink. Verify: `linkBlockFiles.test.ts` written first and seen failing, asserting 'An export holds no absolute machine path' and 'A block link resolves under another data root'.

## 2. Records

- [ ] 2.1 Register each record and its writer command in one table that `references pack --kind record` reads, and refuse any path no row names. Verify: `recordTable.test.ts` written first and seen failing, asserting 'A record has one writer' and 'A record with no writer is refused'.
- [ ] 2.2 Give each record with no writer a writer or retire it, check each key for a second writer, and split the catalogue's fitted outlines into their own key. Verify: `recordTable.test.ts` asserts 'A record has one writer' for every key in the table.

## 3. Fits and refits

- [ ] 3.1 Make each fit write its record into the records folder instead of the world data folder, and read the catalogue outlines, the region camps and the capitals through the lock (after genshin-pipeline-provenance task 1.2, so each record carries its stamp). Verify: `writeWorldData.test.ts` written first and seen failing, asserting 'A fit leaves the authored world files as they are'.
- [ ] 3.2 Keep each fit's report beside its record, and publish with the report's SHA-256 in the publish body. Verify: `publishObjectsStep.test.ts` written first and seen failing, asserting 'A fit's report is kept beside its record'.
- [ ] 3.3 Make the refits (`notes`, `expression`, `instruments` and `calibrate --write`) name the hash of the record they read, and refuse a record whose hash has changed. Verify: `refitInput.test.ts` written first and seen failing, asserting 'A refit refuses a record whose hash differs from its report's' and 'A refit runs on the record its report names'.

## 4. Extraction, fleet and lock

- [ ] 4.1 Make the interface, playlist, inventory and witness writers clear the folders they own before they write, as the clips, shaders and avatar writers already do. Verify: `clearOwnedFolders.test.ts` written first and seen failing, asserting 'Re-extracting leaves no stale file' and 'A writer clears only the folder it owns'.
- [ ] 4.2 Make the fleet copy decide each file by a content digest, copy a link as the data it points at, and leave a file only the target holds as it is. Verify: `fleetCopy.test.ts` written first and seen failing, asserting 'A file of equal size and time but other content is copied' and 'A link is copied as the data it points at'.
- [ ] 4.3 Make `genshin:data verify` compare the generated lock with the committed lock, and fail on a difference. Verify: `verifyCommand.test.ts` written first and seen failing, asserting 'Verify fails when the lock differs from the committed lock' and 'Verify passes when the lock matches the committed lock'.
