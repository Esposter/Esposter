# Tasks

## 1. Zone

- [ ] 1.1 Declare the `esposter.com` zone and every record Namecheap serves in `apps/infra/src/cloudflare`, DNS-only. Verified by `pnpm infra:preview` listing them.
- [ ] 1.2 The owner turns off DNSSEC at Namecheap if it is on and switches the nameservers. Verified by every record resolving through public resolvers as it did through Namecheap.

## 2. The cutover command

- [ ] 2.1 Build `inventory`, `snapshot`, `copy-objects`, `copy-streams`, `copy-core`, `rewrite-urls`, `reschedule` and `verify`, each idempotent and resumable. Verified by their tests over Miniflare and a Postgres test database.
- [ ] 2.2 Add the maintenance mode to the Railway app on `ai/queue`. Verified by a request answering 503 while it is set.

## 3. Rehearsal

- [ ] 3.1 Deploy both Workers with `next.esposter.com` and run the whole sequence against the develop estate. Verified by `verify` passing on develop and the freeze duration recorded in this file.

## 4. Production

- [ ] 4.1 Snapshot, pre-copy, freeze, delta, reschedule, verify and smoke-check production. Verified by `verify` passing and every smoke check in `design.md` passing on `next.esposter.com`.
- [ ] 4.2 Switch the apex to the web Worker. Verified by `esposter.com` answering from the Worker.

## 5. Teardown

- [ ] 5.1 After the rollback window, delete the Railway services and the Azure estate, the archive bucket and the cutover command, and rewrite the Azure services page. Verified by `pnpm infra:preview` showing no Azure resource.
