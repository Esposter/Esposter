# Tasks

## 1. Decide how the touch cost is bounded

- [ ] 1.1 Measure one version write and one first save on a document carrying many 64-hex digests that name no stored file, counting the blob touches each makes. Verified by the counts recorded in `design.md`.
- [ ] 1.2 Choose one of the three options in `proposal.md`, and record it with its reason in `content-addressed-assets/design.md`, "A reference is a hash occurrence". Verified by the decision text naming the option and the measured counts.

## 2. Ship the chosen bound

- [ ] 2.1 Implement the chosen option in `apps/web/server/services/resource/snapshot/` and `reserveWorkingAssets`, keeping every bare id touched before its object can be collected. Verified by the existing `getSnapshotAssetHashes.test.ts` and a test named for the bound.
