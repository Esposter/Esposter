# Cost & Security Posture

Esposter's Cloudflare estate is deliberately small. The Workers, D1, R2, Queues, Durable Objects and RealtimeKit all run on the paid plan's included allowances, and nothing shuts a product off automatically when spend appears. This page records the posture decisions the estate keeps on purpose and why.

## Cost

The cost ceiling is the paid plan's included allowances and the usage the program's own design bounds: each room, call and person has its own object, each message is one batch of a few statements, and each upload is one presigned PUT. Nothing in the estate turns a product off on a budget, so a cost spike is seen as a spike on the account and corrected by a person.

No spend alert is declared. Cloudflare's account-wide spend alert is a billing notification with a total-spend filter, and `@pulumi/cloudflare` cannot declare that filter, so the program declares no budget. Creating the alert by hand in the dashboard was rejected, since it leaves an account resource the program does not declare. The alert is declared once the provider's notification filters can express it.

## Posture decisions

| Area               | Posture                                                                                                                                             | Why                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Workers            | The web Worker is stateless and public; the functions Worker is reached by its queues, its Cron Trigger and the web Worker's binding to its objects | Live state lives in the objects, so no isolate holds anything between requests                                       |
| D1                 | One database, `core`, reached through its binding; no connection string in code                                                                     | D1 is reached without a connection to pool, and the deploy token is the one credential the migrations use            |
| R2                 | Buckets are private by default; a `public-` bucket is served on a custom domain; private reads go through a presigned GET                           | Public assets stay stable and cacheable at the edge, and everything else is reached for a few minutes at a time      |
| Queues             | Each job has its own queue and dead-letter queue, consumed only by the functions Worker                                                             | Retries and failures stay per job, and a job's failure never blocks another job's queue                              |
| Stateful resources | D1 databases, R2 buckets, queues and queue consumers are declared `protect: true`                                                                   | They hold data, so a replace deletes it; protection makes the delete a refused change rather than a silent one       |
| Secrets            | Each secret is a schema key marked secret, read from the secrets environment and written to the Worker by the deploy job                            | No secret value is in code, in the Worker's configuration file or in the repository                                  |
| Spend alert        | None declared                                                                                                                                       | See [Cost](#cost): the provider cannot declare the filter yet, and a hand-made alert would be an undeclared resource |

## Review principles

Carried forward for any infrastructure change: keep `protect: true` on stateful resources; prefer reducing exposed surface before adding recurring cost; review dev and prod separately even though one stack owns both; and never delete a resource before checking what references it, the Workers' bindings, the queue consumers, the custom domains and the DNS records that point at it.

## Key files

| File                                                        | Role                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/infra/src/cloudflare/resources/d1Databases/`          | The `core` database per environment, protected                  |
| `apps/infra/src/cloudflare/resources/r2Buckets/`            | The buckets per environment, protected, `public-` buckets named |
| `apps/infra/src/cloudflare/resources/r2BucketLifecycles/`   | The message-assets rule moving objects to Infrequent Access     |
| `apps/infra/src/cloudflare/resources/queues/`               | One queue and one dead-letter queue per job, per environment    |
| `apps/infra/src/cloudflare/resources/queueConsumers/`       | Each queue's consumer on the functions Worker, protected        |
| `apps/infra/src/cloudflare/resources/workersCustomDomains/` | The custom domains of the web and functions Workers             |
