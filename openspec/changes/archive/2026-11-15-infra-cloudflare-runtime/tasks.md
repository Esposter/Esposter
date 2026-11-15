# Tasks

## 1.

- [x] 1.1 Build the app with the `cloudflare_module` preset and run it on Workers. Verified by `dev.esposter.com` serving the home page and the messages page, whose server render runs tRPC.

## 2.

- [x] 2.1 Set VAPID details where a push is sent, and keep `node:zlib`'s zstd and gunzip on the resource read path, which workerd runs under `nodejs_compat`. Verified by the resource read tests and a zstd round trip in Miniflare.

## 3.

- [x] 3.1 Keep the web Worker's server bundle under the 64 MiB code cap, a component leaving it only as a `.client.vue` or under an `ssr: false` route, and check its size in CI after the app build (`server-bundle:check`). Verified by the check passing at 28.21 MiB.
