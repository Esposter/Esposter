# AnimeStudio on macOS

`pnpm -C scripts genshin:animestudio:build` fetches AnimeStudio and Texture2DDecoder at their pinned commits, builds the CLI for `osx-arm64` and its natives as dylibs, and prints the path to set as `GENSHIN_ANIMESTUDIO_CLI`. The sources and builds stay under `{data-root}/tools` (`--directory` to move them), outside the repository, and nothing it fetches is committed `scripts/src/services/recreation/animeStudio/buildAnimeStudio.ts`.

- **Pinned commits:** AnimeStudio `db860e1f9bf0e0314b892782304d44f3ac42c261` (the CLI, its Ooz and ACL sources), Texture2DDecoder `c974dbda1209a6af34cb03941fa0b999627c3623` (`KiruyaMomochi/Texture2DDecoder`, the native behind the `Kyaru.Texture2DDecoder` wrapper, the one whose macOS build the NuGet package does not ship) `scripts/src/services/recreation/animeStudio/constants.ts`.
- **Edits it applies to the clone:** every project retargets `net10.0`, and the `win-x64` runtime identifier is dropped `scripts/src/services/recreation/animeStudio/buildAnimeStudio.ts`. Ooz's match copy is replaced by one that copies a byte at a time when the match is closer than eight bytes: the defect is drafted in [AnimeStudio upstream defects](../animestudio-upstream/design.md).
- **Staging:** the CLI is published to a staging folder under `{data-root}/tools` first, and replaces the published `animestudio-cli` only once the parity check passes, so failures before publication begins leave the published CLI, and the `GENSHIN_ANIMESTUDIO_CLI` naming it, as they were `scripts/src/services/recreation/animeStudio/constants.ts`, `scripts/src/services/recreation/animeStudio/buildAnimeStudio.ts`.
- **Maps:** a rebuild keeps the CAB map. AnimeStudio writes it to `Maps` beside the published CLI, so on a pass the build moves that folder into the staged CLI's before the staged folder replaces the published one `scripts/src/services/recreation/animeStudio/buildAnimeStudio.ts`. The parity runs pass no map, so the staged CLI is checked without it.
- **Acceptance:** before the staged CLI replaces the published one, the build exports each reference block in `PARITY_REFERENCE_BLOCKS` once per type with it, into an `animestudio-parity` folder under `{data-root}/tools`, and fails unless each type's file count matches Windows AnimeStudio's on game 7.1.0 and no run names an exception `scripts/src/services/genshinAssets/shared/constants.ts` (`PARITY_REFERENCE_BLOCKS`), `scripts/src/services/genshinAssets/shared/checkParityBlock.ts`. `--skip-parity` skips the check only when the game's blocks are absent, and prints why `scripts/src/services/genshinAssets/shared/checkAnimeStudioParity.ts`.
- **Leviathan:** the build makes the decoder's match offsets signed (`ptrdiff_t`) instead of `size_t` `scripts/src/services/recreation/animeStudio/buildAnimeStudio.ts`. The defect is drafted in [AnimeStudio upstream defects](../animestudio-upstream/design.md).
- **Natives:** `Texture2DDecoderNative` and Ooz build and load; ACL's MHY library builds and loads `{data-root}/tools/animestudio-cli/libTexture2DDecoderNative.dylib`, `{data-root}/tools/animestudio-cli/libAnimeStudio.Ooz.dll.dylib`, `{data-root}/tools/animestudio-cli/libAnimeStudio.ACL.MHY.dylib`. The other ACL libraries (SR, ZZZ, DB) fail to compile under clang, and ZZZV2 needs `windows.h`, so animation clips from those are not available.
- **Requirements:** .NET 10 and CMake to build `scripts/src/services/recreation/animeStudio/buildAnimeStudio.ts`. The CLI is published self-contained, so it runs with no `DOTNET_ROOT` however .NET was installed `scripts/src/services/recreation/animeStudio/buildAnimeStudio.ts`, and the game-running check reads Windows' process list `scripts/src/services/genshinParity/shared/checkIsGameRunning.ts`.
- **Not on arm64:** FMOD audio, FBX export and HLSL shader decompilation ("AnimeStudio.HLSLDecompiler") are Windows-only or proprietary, so `genshin:assets` steps that need them do not run here.

The macOS default is this published CLI, so setting `GENSHIN_ANIMESTUDIO_CLI` to the printed path is needed only for a CLI kept elsewhere (the Windows default is an `AnimeStudio.CLI.exe` in an `AnimeStudio` folder under Downloads, `scripts/src/services/genshinAssets/shared/constants.ts`) `scripts/src/services/genshinAssets/shared/constants.ts`.

```mermaid
flowchart TD
  FETCH["fetch the pinned sources"] --> EDIT["apply the edits to the clones"]
  EDIT --> STAGE["build and publish to the staging folder"]
  STAGE --> PARITY{"parity check passes?"}
  PARITY -->|"no"| KEEP["stop: the published CLI is untouched"]
  PARITY -->|"yes"| MAPS["move the published Maps into staging"]
  MAPS --> SWAP["remove the published CLI and rename staging into place"]
  SWAP --> PRINT["print the path to set as GENSHIN_ANIMESTUDIO_CLI"]
```

## Key files

| File                                                                       | Role                                                                                                             |
| :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `scripts/src/animeStudio/index.ts`                                         | The macOS build command, `genshin:animestudio:build`                                                             |
| `scripts/src/services/recreation/animeStudio/buildAnimeStudio.ts`          | Fetches the pinned sources, builds the natives, publishes the CLI and copies the dylibs under their import names |
| `scripts/src/services/recreation/animeStudio/readAnimeStudioExceptions.ts` | Reads the exception lines off the CLI's output, so a run that skipped an asset does not read as clean            |

## Open

- [ ] **All six reference blocks match Windows AnimeStudio's file counts on the current build** — no source yet: no parity run output is on disk, and `{data-root}/tools` holds no `animestudio-parity` folder.
- [ ] **The game-running check passes on macOS, where the game has no build** — no source yet: no macOS run of the check is recorded in a checked file.
- [ ] **Windows' build does not overflow the backward match offset** — no source yet: no Windows build or run is checked for it.
- [ ] **The other ACL libraries (SR, ZZZ, DB) fail to compile under clang, and ZZZV2 needs `windows.h`** — no source yet: no build log of those libraries is checked.
- [ ] **FMOD audio, FBX export and HLSL decompilation are Windows-only, so the steps needing them do not run here** — no source yet: no gating code for those steps is located.
