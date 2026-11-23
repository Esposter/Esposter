# Tasks

Depends on `architecture-hosted-assets` sections 1 to 4. Ordered by dependency. Each task names how it is verified.

Precondition for section 2: the WAV-to-MP3 and over-2-MiB WebP re-encodes are in the source folder, so the publish has no WAV to refuse.

## 1. Declaration

- [x] 1.1 Declare the dungeons product: its scope `dungeons` under the shared bucket `public-hosted-assets`, its content types, and the path-to-key derivation. Verify: a test that `Scene/Battle/ForestBackground.png` derives `SceneBattleForestBackground`, seen failing first.
- [x] 1.2 Add the Tiled sources to the declaration: `tilemap.json` and the `.tsx` tilesets read from the Tiled tree, published and never imported. Verify: `pnpm -C scripts hosted-assets publish --dry-run dungeons` lists each `.tsx` and each `tilemap.json` by its hash.
- [x] 1.3 Move the third-party notices to "apps/web/third-party/dungeons/", out of `app/assets`, and check no import names them. Verify: `git ls-files apps/web/app/assets | grep -iE '(license\.(txt|pdf|png)|notes\.txt)$'` prints nothing, and `git grep -n "license.pdf\|License.txt\|notes.txt\|license.png" -- apps/web/app` returns no hit.

## 2. Publish

- [x] 2.1 Make the first publish from the repository's files: the PNG, MP3, WebP and WOFF2 binaries, the `.tsx` tilesets and the `tilemap.json` exports, each read from its repository path. Verify: `pnpm -C scripts hosted-assets publish --dry-run dungeons` lists one record per file, names no attribution notice (the scenario "A file the code never loads is not hosted"), and refuses nothing, since no WAV is left in the repository.
- [x] 2.2 Run `hosted-assets publish --dry-run dungeons` and read the output: each record named, each key added, and no refusal. Verify: the dry run exits zero, and prints the object count while the lock would change and `unchanged, no request made` once the committed lock matches the folder (`scripts/src/services/hostedAssets/formatHostedAssetFilesDryRun.test.ts`).
- [x] 2.3 Publish to dev, then prod, then commit the lock. Verify: `pnpm -C scripts hosted-assets verify dungeons` prints the object count from both environments with no failure, and a script hashing each repository file equals its object's name for every file, the owner's byte check.
- [x] 2.4 `git rm` the repository copies of the hosted binaries, after 2.3's byte check passes. Verify: `git ls-files apps/web/app/assets/dungeons | grep -E '\.(png|webp|mp3|woff2)$'` prints nothing.

## 3. Key map and save-safe lookups

- [x] 3.1 Collapse the image, sound and font keys into `FileKey`, and make `Attack.soundEffectKey` `fileKey`. Verify: `pnpm -C apps/web typecheck` passes (`nuxt prepare`, then `tsrs`), and the typecheck names no removed key.
- [x] 3.2 Add `MonsterKeyFileKeyMap` and `CaptureItemFileKeyMap` as the save-safe lookups. Verify: a test named after the scenario "A monster saved before the change renders its portrait" that a species saved before the change resolves its portrait, seen failing first, and one named after the scenario "An unknown species fails its lookup".
- [x] 3.3 Drop the saved `asset` field from `monsterSchema`. Verify: a test that a saved monster carrying the field parses and a saved monster without it parses, seen failing first.
- [x] 3.4 Add the capture test: a saved inventory holding a Damaged Ball with no texture field captures. Verify: a test named after the scenario "A capture with a saved ball without a texture field still captures", seen failing first.
- [x] 3.5 Narrow `Asset` to `SpritesheetKey` and move it to `app/models`. Verify: `pnpm -C apps/web typecheck` passes.

## 4. Loaders and the Preloader

- [x] 4.1 Rewrite `loadImages`, `loadSounds` and `loadSpritesheets` to take keys and read the key map's urls, and load the one font by its key's url in `loadDungeonsFiles`. Verify: a test named after the scenario "A texture the scene draws comes from its hosted url" that `scene.load.image` receives an absolute `https://` url, seen failing first.
- [x] 4.2 Set `scene.load.setCORS('anonymous')` in the Preloader before the loads start. Verify: a test that the loader's `crossOrigin` reads `anonymous` before its first file, seen failing first.
- [x] 4.3 Replace the Preloader's `setBaseURL` and `pack` with the generic preloader's bar and the per-file loads. Verify: a driven browser run of the Preloader holds "A first visit shows the download on the bar", a browser-only claim no test reaches, recorded in the verification note, with the bar advancing and the title scene starting after `complete`, and a test named after the scenario "A failed download does not start the game", seen failing first.
- [x] 4.4 Build the tilemap and tileset urls from the key map in `TiledJSONExternalFile`'s `tilesetURLs`. Verify: `pnpm -C packages/vue-phaserjs exec vitest run src/models/plugins/TiledJSONExternalFile.test.ts` passes with the map built from the key map.
- [x] 4.5 Delete `TilesetUrlMap.ts` with its test, `toXmlBlobUrl.ts`, and the asset maps. Verify: `git grep -n "TilesetUrlMap\|toXmlBlobUrl\|ImageAssetMap\|TilemapAssetMap" -- apps packages` returns no hit.

## 5. Removals

- [ ] 5.1 Retire `public-dungeons-assets` once 6.2's driven run reads the shared domain and the loaders are deployed to the environment being emptied: the dev bucket after a green Deploy on `ai/queue` carries them, the prod bucket only after `main` carries them and its deploy is green, since until then that environment's site still reads the old bucket. Empty its objects in both environments, the path-named ones the file-pack generator listed included, then remove its Pulumi resources and its `StorageBucket` member in one commit, lifting protection as the owner's explicit lifecycle change. Verify: `pnpm -C apps/infra infra:preview` shows the two buckets deleted and nothing else, and `git grep -n PublicDungeonsAssets -- apps packages scripts` returns no hit.
- [x] 5.2 `git rm` the file-pack generator under "apps/web/scripts/phaser/", the `phaser:gen` script, and the committed "apps/web/shared/generated/phaser/" files. Verify: `git grep -n "phaser:gen\|generated/phaser\|scripts/phaser" -- ':!openspec'` returns no hit.
- [x] 5.3 Update `openspec/specs/dungeons/monsters-and-items/design.md` and `openspec/specs/dungeons/scenes-and-input/design.md` to the key map they now describe, and read each against the code. Verify: `pnpm exec openspec validate dungeons-assets-on-r2 --strict` passes.

## 6. Tests and the browser

- [x] 6.1 Point the dungeons suites that read a texture at the local mirror. Verify: `pnpm -C apps/web exec vitest run app/services/dungeons` passes with the network disabled.
- [x] 6.2 Run a driven browser pass of the title, world and battle scenes on the dev server against the shared hosted domain on dev, per the run-app skill. Verify: each scene draws its hosted textures with no 404 in the console, recorded in the verification note.
- [x] 6.3 Record the client bundle size before and after, per `openspec/specs/architecture/bundle-sizes/design.md`. Verify: the two totals in the verification note, the second smaller by the hosted media.
