# Dungeons assets on R2

## Intent

The dungeons game loads every file its engine reads from its hosted objects, so the app bundle holds none of them.

## Why

The dungeons game's files under `apps/web/app/assets/dungeons` total about 70 MB: 54 PNG, 7 WAV, 3 MP3, one WOFF2, ten Tiled tilesets, three tilemaps and the Tiled authoring files. Each file is imported into the bundle, so the Worker deploys all of them and the PWA downloads them whole. The generic hosted-asset system from `architecture-hosted-assets` publishes them as content-addressed objects, and the game loads them by absolute url.

This change depends on `architecture-hosted-assets`. It is the first product to adopt that system and declares its own assets; it writes no publish, lock, url or cache code.

## Changes

- Every file Phaser loads is published as a hosted object: the images, the audio, the WOFF2 font, the tileset definitions and the tilemaps. The bundle holds none of them.
- The Preloader scene shows the generic preloader's download progress as its one bar, then starts the title scene once Phaser's own load completes.
- The prior art, `origin/migrate-assets` at `158d95e9d1`, is carried for its save-safe key decisions. Its pack and base url are dropped, because the Phaser source gives every file its own absolute url (see the design).
- The dead file-pack generator under `apps/web/scripts/phaser` and its generated `FileKey.ts` and `files.json` are removed.
- The third-party notices move out of the app's asset folder, since no code imports them.

## Capabilities

- `hosted-assets` under `dungeons` (new): the game's engine files are hosted, its Preloader is the generic preloader's bar, and its saved values keep their textures.

## Impact

- **BREAKING for the public game buckets**: `public-dungeons-assets` is no longer reachable through `assets.esposter.com/public-dungeons-assets/`. The game reads it from its own custom domain.
- The save shapes do not change. The prior art's decisions keep every saved monster and capture item readable, and no backfill is owed.
- Prerequisite: the WAV-to-MP3 and over-2-MiB WebP re-encodes in progress elsewhere must land before the publish, since the publish refuses a WAV.
- The prior-art branch `origin/migrate-assets` is ported onto `ai/queue` by this change, and the owner deletes it after review.
