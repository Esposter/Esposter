## 1. Provenance

- [ ] 1.1 Write the one stamp writer and its reader: the schema, the game version read from the install's config, the tool's version and SHA-256, the operating system, the command, and a reader that refuses a stamp of another version or none. Verify: `provenance.test.ts` written first and seen failing, asserting 'A written export carries its stamp beside it', 'A reader reports output made before a later change to its producer', 'A fit refuses an export stamped with another game version', 'A fit refuses an export with no stamp' and 'The map is remade for another game version'.
- [ ] 1.2 Make every writer call the one stamp writer and delete `producer.json`: the extraction, witness, inventory, avatar, shaders (with the operating system's build), clips, playlist, interface, city areas, scene scripts, the map (whose adoption of the CLI's CAB map takes only a map stamped with the install's version and the tool's SHA-256), the fits and the lock. Verify: `extractComponent.test.ts` written first and seen failing, asserting 'An extraction leaves no earlier stamp file' and 'A written export carries its stamp beside it'.
- [ ] 1.3 Make the fleet copy refuse a folder stamped with another game version, through the one reader of task 1.1. Verify: `fleetCopy.test.ts` written first and seen failing, asserting 'The fleet copy refuses a folder stamped with another game version'.

## 2. Pinned sources

- [ ] 2.1 Pin the text repository to one commit constant, fetch the dump at that commit, and record the commit in the output's stamp. Verify: `genshinText.test.ts` written first and seen failing, asserting 'A fetched source is pinned to a commit' and 'A moved branch does not change a run'.
- [ ] 2.2 Pin the asset-path index to one commit constant, record its SHA-256 with the derived names, and keep its fetch to a missing file. Verify: `ensureAssetPathIndex.test.ts` written first and seen failing, asserting 'A fetched source is pinned to a commit' and 'A moved branch does not change a run'.
- [ ] 2.3 Pin the gcsim kits to one commit constant and read them raw at that commit. Verify: `readGcsimMainCharacters.test.ts` written first and seen failing, asserting 'A fetched source is pinned to a commit'.
- [ ] 2.4 Pin the decoder constants to the commit whose decoder matches the install's version, or read them from the install's chunks when no commit does (needs the game install). Verify: `decoderConstants.test.ts` written first and seen failing, asserting 'A fetched source is pinned to a commit'.

## 3. Pinned tools

- [ ] 3.1 Build the Windows AnimeStudio archive from the pinned commit, pack it as a record, install it through `installPinnedTool` with its SHA-256, and remove the default under the Downloads folder (needs the PC). Verify: `installAnimeStudioCli.test.ts` written first and seen failing, asserting 'A tool whose archive fails its SHA-256 is refused'.
- [ ] 3.2 Install the vkd3d compiler through `installPinnedTool` and remove its `VKD3D_COMPILER` and `PATH` fallback. Verify: `disassembleWithVkd3d.test.ts` written first and seen failing, asserting 'A stage ignores a tool of the same name on the PATH'.
- [ ] 3.3 Pin the macOS vgmstream archive beside the Windows one, and choose the archive by platform. Verify: `resolveVgmstream.test.ts` written first and seen failing, asserting 'A tool whose archive fails its SHA-256 is refused' and 'A stage ignores a tool of the same name on the PATH'.
- [ ] 3.4 Pin the macOS ffmpeg archive, read the gcsim kits without the GitHub CLI, and name the system `tar` and `sysctl` by their paths. Verify: `resolveFfmpeg.test.ts` written first and seen failing, asserting 'A stage ignores a tool of the same name on the PATH' and 'The system's tar and sysctl run from their system paths'.
