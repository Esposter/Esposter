# Tasks

## 1.

- [ ] 1.1 Build the app with the `cloudflare_module` preset and the `$DurableObject` binding, and run it under `wrangler dev`. Verified by the app's home page and a tRPC query answering locally.
- [ ] 1.2 Forward `/api/trpc` to the `server` object and point the server-side tRPC link at it. Verified by a subscription receiving an event emitted by a mutation sent over HTTP.

## 2.

- [ ] 2.1 Replace `node:zlib`'s zstd and gunzip on the resource read path, and set VAPID details where a push is sent. Verified by the resource read tests.

## 3.

- [ ] 3.1 Make every component importing apexcharts, three.js, pdf.js or the call's track processors client-only, and add the server bundle size check to CI. Verified by the check passing under the cap.
