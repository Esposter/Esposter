# Positional Tiled JSON external loader

## Why

The external Tiled JSON loader accepts two call forms. The config-object form reads `tilesetURLs`, which maps each tileset's name to its definition url, and the app uses it. The positional form, which `registerTiledJSONExternalLoader` still exposes as `load.tilemapTiledJSONExternal(key, tilemapURL, path, baseURL, tilemapXhrSettings, tilesetXhrSettings)`, has no parameter for `tilesetURLs`. Since the static-assets change that resolves each tileset from that map, a map loaded through the positional form throws `NotFoundError` on its first tileset, where the same call loaded before that change. No caller in the repository uses the positional form, so the break reaches only the public plugin API.

Fixing it means choosing between two shapes, which the code cannot choose on its own:

- Delete the positional form, so the object form is the only one. This follows [no-compatibility-debt](../../specs/architecture/no-compatibility-debt/design.md): the old form goes in the change that replaces it.
- Add a seventh positional parameter for `tilesetURLs`, keeping both forms.

## What Changes

Decided: delete the positional form. The loader registration keeps only the object form, its positional parameter list and the `ArrayTail` import go, and `TiledJSONExternalFile`'s constructor takes the configuration object alone, which already carries `tilesetURLs`. This is the smallest shape: a seventh positional argument would extend a signature that cannot take any new field without another position, and it would keep two forms alive for one loader. The removal is a `refactor` under the [no-compatibility-debt](../../specs/architecture/no-compatibility-debt/design.md) published-packages rule, not a major.

Then bring [the static-assets design](../../specs/architecture/static-assets/design.md) and the vue-phaserjs specs into line with the decision.

## Capabilities

- **vue-phaserjs** (modified, once decided)

## Impact

- `packages/vue-phaserjs/src/plugins/registerTiledJSONExternalLoader.ts`, its positional branch.
- `packages/vue-phaserjs/src/models/plugins/TiledJSONExternalFile.ts`, its constructor's positional parameters.
