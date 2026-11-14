# Static data in public assets

The first way to get the game's data to the browser without bundling it was to leave it in the app: the generated JSON would sit in the public directory, Nitro would serve it beside the pages, and the browser would fetch it from the same origin.

**Why not:** the data is about 100 MB, and serving it from the app puts all of it back into two places the [hosted game data](../../../specs/genshin/hosted-game-data/design.md) takes it out of. The Worker's deploy carries the files, and every read is answered by the web Worker. A dev-only mirror module would hide the real host from development, so the first visit in dev would never test what production serves. R2 serves the same objects from a public bucket with an immutable cache header, so a repeat visit never reaches a Worker, and development reads the dev bucket through the same path that production reads the prod bucket.
