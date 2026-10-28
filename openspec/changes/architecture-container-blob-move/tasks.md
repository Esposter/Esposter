# Tasks

## 1. Establish what has moved

- [ ] 1.1 The owner states whether an out-of-band copy of the four retired containers ran against production, and when. Verified by a recorded answer in this change's `proposal.md`, replacing the open question.
- [ ] 1.2 If none ran, list each old container and each new name in the mapping, to confirm which blobs exist where. Verified by the listing recorded in this change.
- [ ] 1.3 The owner decides how the four retired containers stay in the infra program until 3.2: their declarations return to `apps/infra` with their protection kept, or the owner runs no `infra:up` that drops them before 3.2. The decision and its reason are recorded in this change's `proposal.md`, under the sequencing question. Verified by that recorded decision.

## 2. Move the blobs (only if 1.1 says none ran)

- [ ] 2.1 Write a scratchpad backfill that copies each blob in the mapping to its new name, leaving the old blob in place, run dry then for real on dev and then prod under the `backfills` skill. Verified by the dry run reporting every mapped blob and the re-run reporting none left to copy.
- [ ] 2.2 Republish the hosted game data into `public-genshin-assets` under the `genshin-data` skill. Verified by `genshin:data` reporting each dataset and the game-data lock matching what is published.

## 3. Verify and retire

- [ ] 3.1 Read a dungeon save, a call background, the logo and an export archive through the app on prod, each from its new container. Verified by each read returning the stored content, not an empty result.
- [ ] 3.2 Delete the four old containers once 3.1 passes and the decision in 1.3 is applied, as the owner does, per the [azure services](../../specs/architecture/azure-services/design.md) design. Verified by the four old containers absent from the container list on dev and on prod.
