# Cloudflare storage

Part of the [Cloudflare program](../infra-cloudflare-program/design.md). Every Blob container becomes an R2 bucket; the browser uploads with one presigned PUT where it committed blocks today.

## Buckets

`AzureContainer` is renamed `StorageBucket`, and each member names an R2 bucket of the same kebab-case name. A `public-` bucket is served through a custom domain under `esposter.com` (`assets.esposter.com/<bucket>/...` maps to the bucket by a route on the web Worker reading the R2 binding), so a public URL is stable and cached at the edge; every other bucket is private and read through a presigned GET. `MessageAssets`'s lifecycle tier becomes an R2 lifecycle rule moving objects to Infrequent Access after thirty days; Azure's Cold tier has no R2 equivalent, so the ninety-day step is dropped.

## Presigned URLs

R2's bindings cannot sign a URL, so signing uses `aws4fetch` against the S3 endpoint with an R2 API token held in the Worker's secrets. `generateWriteSasUrl` and `generateReadSasUrl` become `createPresignedPutUrl` and `createPresignedGetUrl`, keeping their durations. A presigned URL cannot use a custom domain, so a private read URL is on the account's S3 endpoint.

## Uploads

The client's `uploadBlocks` and `commitBlockList` are replaced by one `PUT` of the file to its presigned URL, with the `Content-Type` the URL was signed with. A single PUT carries up to 5 GiB, above every upload limit the app sets, so no multipart path is built. The storage ledger's reservation and its reconciliation are unchanged, and reconciliation is fed by R2's object-create notification ([jobs](../infra-cloudflare-jobs/design.md)).

## Server reads and writes

Inside a Worker the binding is used directly: `bucket.get`, `bucket.put`, `bucket.delete` (up to a thousand keys per call), `bucket.list` with a prefix and cursor, and a copy as a `get` streamed into a `put`. `readJsonBlob`, `writeJsonBlob`, `uploadCompressedJson`, `deleteDirectory`, `cloneFiles` and their siblings move from `services/azure/container` to `services/storage` with the bucket as their first parameter. An Azure error check (`checkIsNotFound`, `checkIsPreconditionFailed`) becomes the binding's own result: `get` returns `null` for a missing object, and a conditional `put` with `onlyIf` returns `null` when its precondition fails.

## Key files

| File                                                                | Role after the change                            |
| :------------------------------------------------------------------ | :----------------------------------------------- |
| `packages/db-schema/src/models/azure/container/AzureContainer.ts`   | renamed to the bucket enum                       |
| `packages/db/src/services/azure/container/generateWriteSasUrl.ts`   | the presigned PUT                                |
| `packages/db/src/services/azure/container/generateReadSasUrl.ts`    | the presigned GET                                |
| `packages/db/src/services/azure/container/readJsonBlob.ts`          | moved under `services/storage`, over the binding |
| `apps/web/app/services/file/uploadFileToSas.ts`                     | one presigned PUT                                |
| `apps/web/app/services/azure/container/uploadBlocks.ts`             | deleted                                          |
| `apps/web/app/services/azure/container/commitBlockList.ts`          | deleted                                          |
| `apps/web/server/composables/azure/container/useContainerClient.ts` | replaced by the bucket binding                   |
| `apps/web/server/api/resource-assets/[...path].get.ts`              | redirects to a presigned GET                     |
