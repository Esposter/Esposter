# Tasks

## 1. Plain typecheck on `tsrs`

- [x] 1.1 Every package's plain `typecheck` script runs `tsrs --fast`, with `noEmit` read from the shared `tsconfig` chain, except `packages/db`, which stays on plain `tsc` because `tsrs --fast` reports TS2883 on its two thread-follow files (see `proposal.md`). Verified by the package scripts and the workspace typecheck passing.

## 2. Explain the file-set difference

- [ ] 2.1 Explain every file `tsrs` lists beyond `tsc` on `packages/shared` (1736 against 1640). Verified by each extra file named in `design.md` with its cause.
- [ ] 2.2 Extend the explanation to the whole repository. Verified by the same accounting per package recorded in `design.md`.

## 3. Vue checks

- [ ] 3.1 Carry the Vue checks through `vize`, as the sibling change [architecture-vize-vue-typecheck](../architecture-vize-vue-typecheck/tasks.md) plans. Verified by that change's gates passing.

## 4. The override and `vue-tsc`

- [ ] 4.1 Retire `vue-tsc` and the `typescript-native-bridge` override once the Vue checks run on the Rust path everywhere. Verified by no `vue-tsc` dependency and no override entry remaining in the manifests.

## 5. The `typescript` package

- [x] 5.1 Parse `scripts/` sources with `oxc-parser` and drop `typescript` from `scripts/package.json`. Verified by no `scripts/` file importing `typescript` and the scoped sweep tests passing.
- [ ] 5.2 Drop the `typescript` package once the build and tooling peers listed in `design.md` no longer need it. Verified by the root manifest no longer declaring it.
