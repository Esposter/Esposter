# Tasks

## 1.

- [x] 1.1 Build the app with the `cloudflare_module` preset and run it on Workers. Verified by `dev.esposter.com` serving the home page and the messages page, whose server render runs tRPC.

## 2.

- [x] 2.1 Set VAPID details where a push is sent, and keep `node:zlib`'s zstd and gunzip on the resource read path, which workerd runs under `nodejs_compat`. Verified by the resource read tests and a zstd round trip in Miniflare.

## 3.

- [ ] 3.1 Make every component importing apexcharts, three.js, pdf.js or the call's track processors client-only, and add the server bundle size check to CI. Verified by the check passing under the cap.
