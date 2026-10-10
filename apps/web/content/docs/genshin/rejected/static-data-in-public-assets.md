---
title: Static data in public assets
description: Keeping the game's generated tables and words in the app's own public assets, so they ship in the build and the deploy image and are served through Railway, rather than published to Blob storage.
---

# Static data in public assets

The first way to get the game's data to the browser without bundling it was to leave it in the app: the generated JSON would sit in the public directory, Nitro would serve it beside the pages, and the browser would fetch it from the same origin.

**Why not:** the data is about 100 MB, and serving it from the app puts all of it back into three places the [hosted game data](/docs/proposals/genshin/hosted-game-data) proposal takes it out of. Every app build compresses the public assets again, since `apps/web/configuration/nitro.ts` turns on the brotli copies the server hands out. The deploy image carries the files. And every read leaves through Railway, which bills $0.05 per GB for the bytes it sends. A dev-only mirror module would hide the real host from development, so the first visit in dev would never test what production serves. Blob storage serves the same objects with an immutable cache header for cents a month, and development reads the dev account through the same path that production reads the prod account.

## Sources

- [Railway pricing](https://railway.com/pricing) — egress for services is $0.05 per GB, the rate that serving the data from the app would be billed at.
