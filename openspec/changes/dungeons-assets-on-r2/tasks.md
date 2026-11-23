# Tasks

Depends on `architecture-hosted-assets` sections 1 to 4. Ordered by dependency. Each task names how it is verified.

Precondition for section 2: the WAV-to-MP3 and over-2-MiB WebP re-encodes are in the source folder, so the publish has no WAV to refuse.

## 1. Declaration

- [ ] 1.1 Declare the dungeons product: its source folder, its scope `dungeons`, its bucket `public-dungeons-assets`, its content types, and the path-to-key derivation. Verify: a test that `Scene/Battle/ForestBackground.png` derives `SceneBattleForestBackground`, seen failing first.
- [ ] 1.2 Add the Tiled sources to the declaration: `tilemap.json` and the `.tsx` tilesets read from the Tiled tree, published and never imported. Verify: `pnpm -C scripts hosted-assets publish --dry-run dungeons` lists each `.tsx` and each `tilemap.json` by its hash.
- [ ] 1.3 Move the third-party notices to `apps/web/third-party/dungeons/`, out of `app/assets`, and check no import names them. Verify: `git grep -n "license.pdf\|License.txt\|notes.txt" -- apps/web/app` returns no hit.

## 2. Publish

- [ ] 2.1 Pull every object of the dungeons lock to a working copy, with `hosted-assets pull --all`, so the source folder exists on this machine. Verify: a test that each pulled file hashes to its key.
- [ ] 2.2 Run `hosted-assets publish --dry-run dungeons` and read the output: each record named, each key added, and no refusal. Verify: the dry run exits zero and prints the object count.
- [ ] 2.3 Publish to dev, then prod, then commit the lock. Verify: `pnpm -C scripts hosted-assets verify dungeons` prints the object count from both buckets with no failure, and `git diff --stat` shows the lock and the generated key map only.

## 3. Key map and save-safe lookups

- [ ] 3.1 Collapse the image, sound and font keys into `FileKey`, and make `Attack.soundEffectKey` `fileKey`. Verify: `pnpm -C apps/web exec vue-tsc --noEmit` passes, and the typecheck names no removed key.
- [ ] 3.2 Add `MonsterKeyFileKeyMap` and `CaptureItemFileKeyMap` as the save-safe lookups. Verify: a test that a species saved before the change resolves its portrait, seen failing first.
- [ ] 3.3 Drop the saved `asset` field from `monsterSchema`. Verify: a test that a saved monster carrying the field parses and a saved monster without it parses, seen failing first.
- [ ] 3.4 Add the capture test: a saved inventory holding a Damaged Ball with no texture field captures. Verify: the test, seen failing first.
- [ ] 3.5 Narrow `Asset` to `SpritesheetKey` and move it to `app/models`. Verify: `pnpm -C apps/web exec vue-tsc --noEmit` passes.

## 4. Loaders and the Preloader

- [ ] 4.1 Rewrite `loadImages`, `loadSounds`, `loadFonts` and `loadSpritesheets` to take keys and read the key map's urls. Verify: a test that `scene.load.image` receives an absolute `https://` url, seen failing first.
- [ ] 4.2 Set `scene.load.setCORS('anonymous')` in the Preloader before the loads start. Verify: a test that the loader's `crossOrigin` reads `anonymous` before its first file, seen failing first.
- [ ] 4.3 Replace the Preloader's `setBaseURL` and `pack` with the generic preloader's bar and the per-file loads. Verify: a driven browser run of the Preloader shows the bar advance and the title scene start after `complete`.
- [ ] 4.4 Build the tilemap and tileset urls from the key map in `TiledJSONExternalFile`'s `tilesetURLs`. Verify: `pnpm -C packages/vue-phaserjs exec vitest run src/models/plugins/TiledJSONExternalFile.test.ts` passes with the map built from the key map.
- [ ] 4.5 Delete `TilesetUrlMap.ts` with its test, `toXmlBlobUrl.ts`, and the asset maps. Verify: `git grep -n "TilesetUrlMap\|toXmlBlobUrl\|ImageAssetMap\|TilemapAssetMap" -- apps packages` returns no hit.

## 5. Removals

- [ ] 5.1 `git rm` the hosted binaries under `apps/web/app/assets/dungeons/`, after section 2 verifies. Verify: `git ls-files apps/web/app/assets/dungeons | grep -E "\.(png|wav|mp3|woff2)$"` prints nothing.
- [ ] 5.2 `git rm` the file-pack generator under `apps/web/scripts/phaser/`, the `phaser:gen` script, and the committed `apps/web/shared/generated/phaser/` files. Verify: `git grep -n "phaser:gen\|generated/phaser\|scripts/phaser" -- ':!openspec'` returns no hit.
- [ ] 5.3 Update `openspec/specs/dungeons/monsters-and-items/design.md` and `openspec/specs/dungeons/scenes-and-input/design.md` to the key map they now describe, and read each against the code. Verify: `pnpm exec openspec validate dungeons-assets-on-r2 --strict` passes.

## 6. Tests and the browser

- [ ] 6.1 Point the dungeons suites that read a texture at the local mirror. Verify: `pnpm -C apps/web exec vitest run app/services/dungeons` passes with the network disabled.
- [ ] 6.2 Run a driven browser pass of the title, world and battle scenes on the dev server against the dev bucket, per the run-app skill. Verify: each scene draws its hosted textures with no 404 in the console, recorded in the change's verification note.
- [ ] 6.3 Record the client bundle size before and after, per `openspec/specs/architecture/bundle-sizes/design.md`. Verify: the two totals in the verification note, the second smaller by the hosted media.

## 7. Prior art and the branch

- [ ] 7.1 Port the commit `158d95e9d1` from `origin/migrate-assets` onto `ai/queue` as a new commit, carrying the decisions in the design's Save-safe key decisions and dropping the rest. Verify: `git log --oneline -1` names the new commit, and `git show --stat` names none of the dropped files.
- [ ] 7.2 After review, the owner deletes `origin/migrate-assets`. This task is the owner's step, not the session's.
