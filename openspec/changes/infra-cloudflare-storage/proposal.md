# Cloudflare storage

## Why

Files live in Azure Blob Storage and the browser uploads them in committed blocks through SAS URLs. They move to R2 with presigned PUTs.

## What changes

`AzureContainer` becomes `StorageBucket`; SAS URLs become presigned R2 URLs; uploads are one PUT; server reads and writes use the bucket binding. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md); the mechanics are in [design](design.md).
