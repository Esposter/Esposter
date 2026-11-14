# Tasks

## 1.

- [ ] 1.1 Rename `AzureContainer` and move the container services to `services/storage` over the R2 binding. Verified by their tests over Miniflare's R2.
- [ ] 1.2 Replace SAS signing with presigned R2 URLs and the block upload with one PUT. Verified by an upload test reaching Miniflare's R2.
- [ ] 1.3 Serve the public buckets through the web Worker's asset route. Verified by a public object fetched by its stable URL.
