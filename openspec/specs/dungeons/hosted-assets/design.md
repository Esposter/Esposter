# Dungeons hosted assets

The dungeons game loads every image, sound, font and Tiled file its engine reads from the hosted objects of its own product, so the app's bundle holds none of them. The publish, the lock, the url builder, the cache and the preloader are the shared system's, described on the [hosted assets](../../architecture/hosted-assets/design.md) page. This page covers what the game declares, what stays in git, how its loaders and Preloader use the objects, and how its saved values keep their textures.

## What the game declares

The game is one files product, `DUNGEONS_PRODUCT` in `scripts/src/services/dungeons/constants.ts`. Its folder is `apps/web/app/assets/dungeons`, its one scope is `dungeons` in the shared bucket, and its lock is `apps/web/shared/generated/hostedAssets/dungeonsLock.json`, which is committed. Every file under the folder is an object unless its extension is unhosted: the TypeScript modules, which the bundle imports, and the Tiled project and Tiled map sources, which only the editor reads. A file's object key is its path under the folder, so `scene/battle/forestBackground.png` is the object `dungeons/scene/battle/forestBackground.png`, and `pull` restores the file to that path.

The key map is what the loaders import. The Nuxt module that writes it is registered in `apps/web/configuration/modules.ts` with the dungeons options, and its output is gitignored, so no key is spelled by hand. A key names a file by its path, as the architecture page describes, so `SceneBattleForestBackground` is the key of the battle background.

## What stays in git

- The Tiled project, `apps/web/app/assets/dungeons/scene/world/index.tiled-project`, and each map's `index.tmx` stay in git. The `pnpm tiled:gen` generator reads them for the property types, and the editor needs them beside the tilesets.
- Each tileset's `.tsx` definition and each map's `tilemap.json` stay in git beside those maps, because the editor reads them there. They are also hosted objects, and the game loads the hosted copy. The git copy is never the one the runtime reads.
- The code under the folder stays in git, since the bundle imports it.
- The binaries, the images, the sounds and the font, are not kept in git. The lock names each one, and a working copy is restored from the lock by `pull`.

## How the game loads its files

Every file is requested by its absolute url, taken from the key map and the lock through `getDungeonsUrl`. The Phaser loader does not join an absolute url with its base url or its path, so the game uses no file pack and no base url. A file pack with a base url is rejected for that reason: Phaser reads a pack file's base url when that file loads, not when the pack adds it, so a relative url in a pack takes whichever base url is current at its own load, and a pack cannot mix a hosted file with a local one reliably.

The Preloader requests every file with anonymous CORS, which `loadDungeonsFiles` sets before its first file, since the hosted origin is another origin.

- Images and spritesheets are loaded under their keys from `loadImages` and `loadSpritesheets`, and sounds from `loadSounds`.
- The font is loaded inline by its own url, through `FontFace`.
- Each map's Tiled JSON loads by its url, and `loadTilemaps` builds the map of tileset urls from the key map's `.tsx` keys, each under its tileset's name. The external tileset loader in `packages/vue-phaserjs` reads each tileset from that map, so no tileset is turned into a blob url.
- The Preloader sets the nearest-neighbour filter on each texture of the pixel-art list, which is read from the key map.

## The Preloader

The Preloader scene, `apps/web/app/components/Dungeons/Preloader/Scene.vue`, shows one loading bar. Its preload set is `readDungeonsPreloadSet`, which holds every object the lock names but the third-party license notices, which `DUNGEONS_LICENSE_NOTICE_REGEX` matches: they are hosted beside their packs' files under `thirdParty/`, and no scene reads them. So the bar's share is the download of the objects the browser lacks. Once every object is held, the bar reads full and the Phaser pass starts. Its requests are answered from the cache, so the pass only decodes the files, and Phaser's `complete` event switches the scene to the title. The bar follows the download rather than Phaser's own progress events, which would move in jumps.

A failed download leaves the bar on a failure line, and the title scene does not start. The error names the object paths that failed, and it is logged.

## Saved values keep their textures

A save stores a monster's species key, a capture item's id and the rest of the monster as they were, so each texture is looked up from one of those values rather than stored with it.

- A monster's portrait comes from `getMonsterFileKey`, which reads `MonsterKeyFileKeyMap` by species and throws for a species the map lacks, so an unknown species fails its lookup with its name. The monster schema carries no texture field, and Zod strips any unknown key, so a save from before the textures moved still parses.
- A capture item's texture comes from `CaptureItemFileKeyMap` by the item's id, so a saved inventory without any texture field still captures, and the ball's texture is the hosted one.
- The world's foreground for each map comes from `TilemapForegroundFileKeyMap`.

No stored value changes shape, so no backfill is owed.

## Dev and tests

The dungeons suites mock the loader, and `loadDungeonsFiles.test.ts` checks the order of its calls, so no suite of the game reads an object or needs the mirror ([hosted assets](../../architecture/hosted-assets/design.md)). `pnpm dev` reads the dev origin through the same runtime config as production reads the prod origin, so the development path is the production path.

## Rejected

- **A file pack with a base url.** Its relative urls take the base url current at each file's own load, as the section above explains.
- **Making the species key itself a file key.** Every saved monster would be renamed, the battle label would read the file's name, and the typing needed a workaround to compile. The species key stays the save's key, and its portrait is a lookup.

## Key files

| File                                                                        | Role                                                                               |
| :-------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `scripts/src/services/dungeons/constants.ts`                                | `DUNGEONS_PRODUCT`, the game's folder, scope, lock and unhosted extensions         |
| `apps/web/shared/generated/hostedAssets/dungeonsLock.json`                  | the committed lock that names every object the game reads                          |
| `apps/web/configuration/modules.ts`                                         | registers the key map module with the dungeons options                             |
| `apps/web/app/assets/dungeons/`                                             | the Tiled sources and the code that stay in git, with the binaries removed from it |
| `apps/web/app/services/dungeons/loader/loadDungeonsFiles.ts`                | every file the game loads by its url, with anonymous CORS set first                |
| `apps/web/app/services/dungeons/loader/getDungeonsUrl.ts`                   | a key's absolute url, read from the lock                                           |
| `apps/web/app/services/dungeons/loader/readDungeonsPreloadSet.ts`           | the Preloader's set: every object but the license notices, and the scope prefix    |
| `apps/web/app/services/dungeons/loader/loadTilemaps.ts`                     | each map's Tiled JSON and the map of tileset urls                                  |
| `apps/web/app/services/dungeons/loader/loadImages.ts`                       | each image loaded under its key from its url                                       |
| `apps/web/app/services/dungeons/loader/dungeonsLock.ts`                     | the committed lock as the app imports it                                           |
| `apps/web/app/services/dungeons/loader/PixelArtTextureKeys.ts`              | the pixel-art textures, read from the key map                                      |
| `apps/web/app/components/Dungeons/Preloader/Scene.vue`                      | the one loading bar, over the shared preload composable                            |
| `apps/web/app/services/dungeons/monster/getMonsterFileKey.ts`               | a monster's portrait by species, throwing for a species the map lacks              |
| `apps/web/app/services/dungeons/monster/MonsterKeyFileKeyMap.ts`            | each species' portrait key                                                         |
| `apps/web/app/services/dungeons/item/CaptureItemFileKeyMap.ts`              | the capture ball's texture by item id                                              |
| `apps/web/app/services/dungeons/scene/world/TilemapForegroundFileKeyMap.ts` | each map's foreground texture key                                                  |
| `apps/web/app/services/dungeons/loader/loadDungeonsFiles.test.ts`           | holds the Preloader's order of calls, with CORS set before the first file          |
| `apps/web/scripts/tiled/`                                                   | the `tiled:gen` generator that reads the Tiled sources that stay in git            |
| `packages/vue-phaserjs/src/models/plugins/TiledJSONExternalFile.ts`         | reads each tileset's url from the map of tileset urls                              |
