# Hosted assets

## Intent

Every product that ships large or engine-read files fetches them from one generic hosted-asset system, so a product declares its assets and never writes its own publish, lock, url or cache code.

## Why

Genshin already publishes its game data as content-addressed objects under a committed lock, and reads them by key. The dungeons game bundles about 70 MB of images, audio and Tiled files into the app, which the Worker deploys and the PWA downloads whole. The same publish, lock, url and cache machinery should serve both, and the placement rule that decides which files are bundled, hosted or public should be written once.

## Changes

- A generic hosted-asset system: content-addressed objects, one committed lock per product, a generated typed key map, a publish with dry run, dev then prod and byte verification, one url builder, one cache contract, one preloader that works for any engine, and one local mirror for dev and tests. It moves out of Genshin's `gameData` machinery, which becomes the first product declaration of it, so there is one copy.
- A placement rule that replaces the two-place rule in the static-assets design: bundled, hosted or public, decided by size, format and the loader that reads the file.
- One shared public bucket, `public-hosted-assets`, with one custom domain per environment in place of the Worker route, so hashed objects are cached at the edge by one Cache Rule. Each product's scope is a key prefix, so a new product edits no infrastructure. The Worker route keeps serving the user buckets.
- Genshin's binaries are audited: parity references and snapshots stay committed by their owner rule, and the one hosted candidate, the login's recordings, moves.
- The dead file-pack generator under `apps/web/scripts/phaser` is removed.

## Capabilities

- `hosted-assets` (new, architecture): the generic system, its placement rule, its cache contract and its enforcer.

## Impact

- `openspec/specs/architecture/static-assets/design.md` loses its two-place rule, and the `pnpm phaser:gen` row in the generated-artifacts design goes.
- `openspec/specs/genshin/hosted-game-data/design.md` and the genshin-data skill describe the generic system in place of Genshin's own machinery.
- The change depends on no other change. `dungeons-assets-on-r2` depends on it.
- The two game buckets, `public-genshin-assets` and `public-dungeons-assets`, are retired once the shared bucket verifies and the app reads from it. This change retires the first, and the dungeons change the second.
- Size: this change holds more open tasks than the change size budget, because the owner asked for one task per migrating Genshin group in the same arc. The owner accepted the size.
