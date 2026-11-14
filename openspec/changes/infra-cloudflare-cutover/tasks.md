# Tasks

## 1.

- [ ] 1.1 Move `esposter.com`'s DNS to Cloudflare with every existing record, leaving it pointed at Railway. Verified by the zone active and every record resolving as before.

## 2.

- [ ] 2.1 Build the cutover command's copy, verify and reschedule steps. Verified by its tests over Miniflare.

## 3.

- [ ] 3.1 Rehearse on the dev estate and record the copy's duration. Verified by the verify step passing on dev.

## 4.

- [ ] 4.1 Run production. Verified by the verify step passing and the smoke checks.

## 5.

- [ ] 5.1 Tear down Railway and the Azure estate once the rollback window closes. Verified by `pnpm infra:preview` showing no Azure resource.
