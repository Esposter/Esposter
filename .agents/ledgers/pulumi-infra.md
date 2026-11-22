# Pulumi Infra

One resource per file named after the cloud resource it declares, `protect` on imports, a parent on every resource, outputs over repeated identifiers, and no alias.

| Unit                                                                                                                               | Notes                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/infra/*`, `apps/infra/src/*`                                                                                                 |                                                       |
| `apps/infra/src/github`                                                                                                            |                                                       |
| `apps/infra/src/cloudflare/resources/queueConsumers`                                                                               | 28 files                                              |
| `apps/infra/src/cloudflare/resources/queues`                                                                                       | 28 files                                              |
| `apps/infra/src/cloudflare/resources` — `r2BucketCors`, `r2BucketEventNotifications`, `r2BucketLifecycles`, `r2Buckets`            | the R2 bucket set, 36 files                           |
| `apps/infra/src/cloudflare/resources` — `botManagements`, `d1Databases`, `dnsRecords`, `rulesets`, `workersCustomDomains`, `zones` | the other resource types, 11 files                    |
| `apps/infra/src/cloudflare` — `constants`, `services`                                                                              | the shared constants and the service helper, 10 files |
