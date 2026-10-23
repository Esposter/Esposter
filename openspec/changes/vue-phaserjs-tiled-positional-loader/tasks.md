# Tasks

- [x] Decide between deleting the positional form and adding a `tilesetURLs` parameter to it (decided in the proposal: delete; there is no vue-phaserjs design file to record it in, and the proposal travels with the change into the specs on archive)
- [ ] Delete the positional branch from `registerTiledJSONExternalLoader.ts` and make `TiledJSONExternalFile`'s constructor take the configuration object only; update the static-assets design's description of the loader. Verify: `pnpm typecheck` and `pnpm test TiledJSONExternalFile --run`, both in `packages/vue-phaserjs`, pass, and `grep -rn "tilemapTiledJSONExternal(" packages/vue-phaserjs/src` finds no call that passes positional arguments
