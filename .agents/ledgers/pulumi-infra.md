# Pulumi Infra

One resource per file named after the cloud resource it declares, `protect` on imports, a parent on every resource, outputs over repeated identifiers, and no alias.

| Unit                                                                                                                               | Swept                  | Notes                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| `apps/infra/*`, `apps/infra/src/*`                                                                                                 | —                      |                                                       |
| `apps/infra/src/github`                                                                                                            | —                      |                                                       |
| `apps/infra/src/cloudflare/resources/queueConsumers`                                                                               | 2026-11-22 · Haiku 5.5 | 28 files                                              |
| `apps/infra/src/cloudflare/resources/queues`                                                                                       | 2026-11-22 · Haiku 5.5 | 28 files                                              |
| `apps/infra/src/cloudflare/resources` — `r2BucketCors`, `r2BucketEventNotifications`, `r2BucketLifecycles`, `r2Buckets`            | 2026-11-22 · Haiku 5.5 | the R2 bucket set, 36 files                           |
| `apps/infra/src/cloudflare/resources` — `botManagements`, `d1Databases`, `dnsRecords`, `rulesets`, `workersCustomDomains`, `zones` | 2026-11-22 · Haiku 5.5 | the other resource types, 11 files                    |
| `apps/infra/src/cloudflare` — `constants`, `services`                                                                              | —                      | the shared constants and the service helper, 10 files |
