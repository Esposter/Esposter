# Tasks

- [x] Decide between deleting the positional form and adding a `tilesetURLs` parameter to it (decided in the proposal: delete; there is no vue-phaserjs design file to record it in, and the proposal travels with the change into the specs on archive)
- [ ] Delete the positional branch from `registerTiledJSONExternalLoader.ts` and make `TiledJSONExternalFile`'s constructor take the configuration object only; update the static-assets design's description of the loader
