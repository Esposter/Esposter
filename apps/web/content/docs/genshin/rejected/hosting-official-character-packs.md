---
title: Hosting the official character packs
description: Publishing HoYoverse's official MMD model packs to the app's Blob Storage, content-addressed and cached for good, so every player's browser fetched a character's model from the app; every pack's bundled terms forbid redistributing it.
---

# Hosting the official character packs

The first way to get a character's model to the world was to host it. A publisher, `pnpm -C scripts genshin:characters publish`, read each extracted official pack, stored its model, terms and textures in both storage accounts' public AppAssets container under a folder named by the pack's content hash, and recorded that hash in the game data lock, so a browser fetched every file from the app's own storage and cached it for good. The world treated hosting the packs as the one exception to its rule that every asset is authored in the repository, on the reading that the packs are HoYoverse's own fan release rather than files taken from the game.

**Why not:** every pack's terms forbid it. The terms bundled with each of the thirteen official releases say 「请勿二次配布」, "do not redistribute", ten of them in full and three as the short form 「请勿二配」, and the six whose terms are a readme add 「以及拆取部件以用于改造其他模型」, "nor take parts to modify other models". A public container serving the packs to every visitor is redistribution whatever the hash, the cache header or the credit shown beside the model, and a fan release's terms bind as the game's own files would. Nothing was uploaded and the lock never named a pack, so the publisher, its upload, its lock dataset, the verify that asked for each file and the prune that kept each folder were deleted with nothing left to remove.

A pack now reaches the world only from a copy its reader holds: under `nuxt dev`, the developer's own extracted packs, which the development server serves from disk and no build includes, and in a production build none, so its world draws every character as its capsule until a player can load the release they downloaded themselves ([characters](/docs/genshin/characters)).

## Sources

- The terms bundled with each official model, read from each of the thirteen releases' own terms file: "使用规则.txt" in seven of them, "readme【一定要看】.txt" in the other six.
