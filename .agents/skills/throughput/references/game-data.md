# Game data on the machines that hold it

Read when game data has to reach a machine, whether by its own download, a copy from a LAN peer, or the parity folder each machine keeps.

- **Exports and recordings never travel through git, GitHub, a cloud drive or a Claude channel.**
- **A machine gets the game itself.** It downloads the game from HoYoverse's official CDN (an open-source Sophon downloader where no launcher runs) and runs the `genshin:assets` extraction locally. That route needs no other machine, works on or off the LAN, and spreads the extraction, the heaviest CPU load, across the fleet. The `shaders` step disassembles on any machine, through `d3dcompiler_47` on Windows, which reads no DXIL program, and `vkd3d-compiler` elsewhere, which reads both; its HLSL is decompiled only where 3Dmigoto's Windows decompiler runs.
- **`pnpm ai:fleet:data` is the faster copy between LAN machines whose owner allows SSH.** A peer's public key goes in the receiver's `authorized_keys`, which is the owner's call per machine, never assumed. It copies only what the local manifest lacks, as one tar stream over SSH.
- **Each machine's `GENSHIN_PARITY_DIRECTORY` is its own copy of the parity folder.** `frames` and `tmp` are never copied; no command writes `frames` now, its `frames` command having been removed, and `tmp` is rebuilt where it is used.
- **`asset-index`, the community's asset path index, is copied with the rest** (`DATA_FOLDERS`, `openspec/specs/genshin/game-data-formats/design.md`); a machine that lacks the current asset-index file fetches it from its source instead, so no copy is needed to extract.
- **A machine holds `game-install` and `game-exports` only once it has them**, and takes only the entries its capabilities meet until then.
