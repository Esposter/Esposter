# Tasks

## 1.

- [x] 1.1 Rename `AzureContainer` to `StorageBucket` and move the container services to `packages/db/src/services/storage` over the R2 binding. Verified by their tests over Miniflare's R2.
- [x] 1.2 Replace SAS signing with presigned R2 URLs and the block upload with one PUT. Verified by the presign tests and a presigned PUT and GET round trip against the develop estate's `user-assets` bucket; the identifiers still named for SAS are renamed under program task 8.2.
- [x] 1.3 Serve the public buckets through the web Worker's asset route. Verified by `https://assets.dev.esposter.com/public-app-assets/logo.png` answering 200.
