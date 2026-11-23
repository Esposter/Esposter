# Dungeons assets on R2

This change is the first adopter of [hosted assets](../architecture-hosted-assets/design.md). The generic system owns the publish, the lock, the url builder, the cache, the preloader and the mirror. This design decides only what the dungeons game declares and what its code changes.

## Which files move

Every file Phaser or a loader reads moves. A file the app's code never reads at runtime is decided by who reads it.

| Files                                                                                                                                          | Read by                                                    | Decision                                                                                                                    |
| :--------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| PNG (52), WebP (1), WOFF2 (1)                                                                                                                  | Phaser, by url                                             | **hosted**; git removes the binaries after the first publish verifies them                                                  |
| MP3 (10)                                                                                                                                       | Phaser, by url                                             | **hosted**; the publish refuses a WAV, and none remains in the repository                                                   |
| `tilemap.json` (3)                                                                                                                             | Phaser, as the map's Tiled JSON                            | **hosted**, published from the Tiled export beside `index.tmx`; the file stays in git as the editor's export                |
| `.tsx` tilesets (10)                                                                                                                           | Phaser's external tileset loader, by url                   | **hosted**, published from the Tiled tree; the file stays in git, since the Tiled editor and the `.tmx` need it beside them |
| `index.tmx` (3), `index.tiled-project` (1)                                                                                                     | `pnpm tiled:gen` (`apps/web/scripts/tiled/`), not the game | **stays** in git as the authoring source of the property types                                                              |
| Asset-map `.ts` files (`TilesetAssetMap`, `TilesetUrlMap`, `ImageAssetMap`, the sound and spritesheet maps, `TilemapAssetMap`, `FontAssetMap`) | the loaders                                                | **deleted**; the key map replaces them                                                                                      |
| Attribution `.txt` (5), `license.pdf` (1) and `license.png` (1)                                                                                | nothing at runtime                                         | **moved** out of `app/assets/` to "apps/web/third-party/dungeons/", since no code imports them                              |

The `.tmx`, `.tiled-project`, `.tsx` and export `tilemap.json` files stay in git for the same reason the genshin-data skill keeps an authored world file after it is published: deleting an authored file once it is published is a settled rejection there. The runtime never reads the git copy. It reads the published copy the lock names, and the bundle holds none of these files.

The binaries are different. They leave git after the first publish verifies them. The first publish reads the repository's files, and a repository file is removed only after its object's sha256 equals the file's. The original bytes then live in the shared bucket under their hashes, which the architecture design's recoverability decision accepts ("the repository or R2 under a committed lock"). `hosted-assets pull --all` restores a working copy for a later edit.

## Object names and keys

- **Content hash.** Each object is `dungeons/<sha256><extension>`. Edge caching is immutable because a changed file is a new name.
- **Bucket and prefix.** The shared `public-hosted-assets` bucket, under the `dungeons/` prefix. Objects are `dungeons/<sha256><extension>`, served from the shared hosted domain. The game declares its prefix and owns no bucket.
- **Keys.** The key of each file is derived from its path, as the file-pack generator derived it: `Scene/Battle/ForestBackground.png` is `SceneBattleForestBackground`. The derivation lives in the product's declaration, and the generic renderer writes the names into `FileKey`.
- **Key map.** The keys are a `FileKey` value set. Its literal union is generated into a gitignored file at install, and every url is read from the lock by that key, so no key is a string the code spells by hand.

## Save-safe key decisions

The prior art's decisions on keys are carried. The branch's reasons are in its commit message (`158d95e9d1`), and these are the parts that touch a save:

- **Carried:** the species key stays `MonsterKey` and its portrait is `getMonsterFileKey(key)`, the guarded read of `MonsterKeyFileKeyMap` that throws for a species the map lacks, so no saved monster is renamed and the battle label stays readable. The saved `asset` field is dropped from the plain `monsterSchema`, which parses old saves because zod strips unknown keys.
- **Carried:** the capture ball's texture is `CaptureItemFileKeyMap` by item id, not an optional `Item.fileKey`, so a saved inventory without the field still captures.
- **Carried:** `Attack.soundEffectKey` becomes `fileKey`, and every image, sound and font key collapses into `FileKey`.
- **Carried:** the world's foreground is `TilemapForegroundFileKeyMap`, read by `PixelArtTextureKeys`.
- **Carried:** `Asset` narrows to `SpritesheetKey` and moves to `app/models`.
- **Not carried:** `MonsterFileKey` (`6875546bce`), which made the species key itself a `FileKey`. It renamed every saved monster, made `prettify` read "U I Monsters Iguanignite" in battle, and needed a type workaround for TS2589.
- **Not carried:** the pack, its `setBaseURL` and the clearing of the base url on completion. The Phaser verdict below makes them unnecessary.
- **Not carried:** the bundled spritesheets, tilesets and tilemaps the branch left in the bundle. The owner's scope covers every file Phaser loads.

The stored data needs no backfill: no saved value changes shape. A saved value that names a species or an item id still resolves its texture through the map.

## Load

### The Phaser source verdict

The design had to settle whether a pack file can mix remote and local assets (phaserjs/phaser#7041). The answer comes from Phaser 4.2.1's source, in `node_modules/phaser/src/loader`:

`GetURL.js` returns an absolute url unchanged, and prefixes the base url only to a relative one:

> `if (file.url.match(/^(?:blob:|data:|capacitor:\/\/|file:\/\/|http:\/\/|https:\/\/|\/\/)/))` ... `return file.url;` ... `return baseURL + file.url;`

`File.js`, in the constructor, prefixes the loader's path only to a string url that is not absolute:

> `else if (typeof url === 'string' && !url.match(/^(?:blob:|data:|capacitor:\/\/|http:\/\/|https:\/\/|\/\/)/))` ... `url = loader.path + url;`

`File.js`'s `load` reads the base url at the time the file starts loading, not when it is added:

> `this.src = GetURL(this, this.loader.baseURL);`

`LoaderPlugin.js`'s `setBaseURL` and `setPath` only store their values (`this.baseURL = url;`, `this.path = path;`), and `addPack` sets the base url around the files it adds and then restores it. Because a file reads `loader.baseURL` when it loads, the base url that `addPack` set has gone by then, and a file the pack named relatively gets whichever base url is current at its own load. That is the cause of the report.

**Verdict:** an absolute `https://` url for a file skips both the base url and the path. Both constructors and `GetURL` return it unchanged. So the design loads every file by its absolute url from the typed key map, with no pack file, no `setBaseURL` and no custom loader. The `@TODO` question in the prior art goes away with the pack.

### Crossorigin

A texture from another origin needs CORS, or WebGL cannot read it. `LoaderPlugin.js` gives a file the loader's own value when the file sets none, and the loader's value is `undefined` by default:

> `//  If the file doesn't have its own crossOrigin set, we'll use the Loaders (which is undefined by default)`

So the Preloader calls `scene.load.setCORS('anonymous')` before it loads, and every image, audio file and XML or JSON file is requested with CORS. The bucket's CORS policy sends `Access-Control-Allow-Origin` on each response.

### Loaders

- `loadImages`, `loadSounds`, `loadFonts` and `loadSpritesheets` take keys and read each url from the key map, so `scene.load.image(key, url)` keeps its call shape.
- `TiledJSONExternalFile` keeps its `tilesetURLs` argument, which the loader reads by tileset name. The map is built from the lock, and each value is the tileset's absolute url. The `toXmlBlobUrl` workaround is removed: a `.tsx` is no longer read as text and turned into a `blob:` url, because it is requested from its own url by XHR.
- The `tilemap.json` is requested by its absolute url, the same as each tileset. The loader's structured copy of the map's data stays as it is, since a tilemap given as an object still needs it.
- The `PixelArtTextureKeys` list reads its keys from the generated map, not from the asset maps it replaces.

### The Preloader

`apps/web/app/components/Dungeons/Preloader/Scene.vue` shows one bar. Its share is the generic preloader's `downloadProgress`, which is the bytes of the objects the browser's cache lacks, as a fraction of the bytes it must download. The download is the first half of the bar, and the second is the Phaser pass.

The Phaser pass is near-instant. It runs after every object is held in the cache, so its requests are answered by the service worker from the cache, or by the HTTP cache under the immutable header. It does no network work, only decoding and texture upload. The bar does not follow Phaser's `progress` events, which would move in a jump: the bar stays on the download's share until Phaser's `complete` fires, then the scene switches to the title.

## Dev and tests

- The dungeons suites that load a texture read it from the local mirror the architecture change defines. A suite that mocks the loader needs no mirror.
- `pnpm dev` reads the dev custom domain through the same origin map, so the development path is the production path.

## Cleanup

- `git rm` of every hosted binary: the 52 PNG, the 10 MP3, the 1 WebP and the 1 WOFF2 under `apps/web/app/assets/dungeons/`, once the first publish's byte check passes.
- `git rm` of the asset-map files and `TilesetUrlMap.ts` with its test, and of `toXmlBlobUrl` at `apps/web/app/util/file/toXmlBlobUrl.ts`, which only `TilesetUrlMap` imports.
- The path-named objects the file-pack generator listed in `public-dungeons-assets`, such as `Scene/Battle/ForestBackground.png` (the `url` column of the retired `files.json`), are not copied. They are deleted with the bucket's retirement, once the shared domain serves the game.
- The file-pack generator: `apps/web/scripts/phaser/` with its `constants.ts`, `index.ts`, `filePack/createFilePack.ts`, its test and `services/remove.ts`; the `phaser:gen` script in `apps/web/package.json`; and the committed `apps/web/shared/generated/phaser/FileKey.ts` and `files.json`, which no file reads.
- `openspec/specs/architecture/generated-artifacts/design.md`'s row for `pnpm phaser:gen` is removed by the architecture change, not this one.
- `openspec/specs/dungeons/monsters-and-items/design.md` and `openspec/specs/dungeons/scenes-and-input/design.md` name the key maps the prior art edited, and read against the code they describe.

## Notes

- The prior-art branch `origin/migrate-assets` is the implementation's base. The change ports its commit onto `ai/queue` as a new commit, not a rebase. The session deletes the branch once the port is verified: each decision of the commit is checked as carried or recorded as dropped, then `git push origin --delete migrate-assets`, as the owner authorised.
- The driven-browser run covers the title, world and battle scenes against the bucket, with the bundle size before and after recorded as the architecture change records it.

## Key files

The rows naming a file the prior art creates (the save-safe maps, the Preloader's loaders and the third-party folder) describe what this change creates; every other row is a file that exists now.

| File                                                                        | Role                                                                                      |
| :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `apps/web/app/assets/dungeons/`                                             | the files this change moves out of git and the bundle, and the Tiled tree that stays      |
| `apps/web/app/services/dungeons/loader/loadImages.ts`                       | the image loader, which takes keys and reads their urls                                   |
| `apps/web/app/services/dungeons/loader/loadSounds.ts`                       | the sound loader, which reads its urls from the key map                                   |
| `apps/web/app/services/dungeons/loader/TilesetUrlMap.ts`                    | deleted: the tileset urls come from the key map                                           |
| `apps/web/app/util/file/toXmlBlobUrl.ts`                                    | deleted: only the tileset map imports it                                                  |
| `apps/web/app/components/Dungeons/Preloader/Scene.vue`                      | the one bar, driven by the generic preloader                                              |
| "apps/web/app/services/dungeons/monster/MonsterKeyFileKeyMap.ts"            | the portrait of each species, the save-safe lookup                                        |
| `apps/web/app/services/dungeons/monster/getMonsterFileKey.ts`               | the portrait lookup the monster components call, which throws for a species the map lacks |
| "apps/web/app/services/dungeons/item/CaptureItemFileKeyMap.ts"              | the capture ball's texture by item id                                                     |
| "apps/web/app/services/dungeons/scene/world/TilemapForegroundFileKeyMap.ts" | each map's foreground, read by the pixel-art list                                         |
| `apps/web/app/services/dungeons/loader/PixelArtTextureKeys.ts`              | the pixel-art texture list, read from the key map                                         |
| `packages/vue-phaserjs/src/models/plugins/TiledJSONExternalFile.ts`         | reads each tileset's url by its name                                                      |
| `apps/web/scripts/phaser/`                                                  | the dead file-pack generator, deleted                                                     |
| `apps/web/scripts/tiled/`                                                   | the `tiled:gen` generator that reads the `.tmx` and `.tiled-project`, which stay in git   |
| `apps/web/shared/generated/phaser/`                                         | the generated `FileKey` and `files.json`, deleted                                         |
| `apps/web/shared/generated/tiled/`                                          | the generated typed properties the dungeons game keeps                                    |
