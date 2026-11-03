# Tasks

## 1. Plain typecheck on `tsrs`

- [x] 1.1 Every package's plain `typecheck` script runs `tsrs --fast`, with `noEmit` read from the shared `tsconfig` chain. Verified by the package scripts and the workspace typecheck passing.

## 2. Vue checks

- [ ] 2.1 Carry the Vue checks through `vize`, as the sibling change [architecture-vize-vue-typecheck](../architecture-vize-vue-typecheck/tasks.md) plans. Verified by that change's gates passing.

## 3. The override and `vue-tsc`

- [ ] 3.1 Retire `vue-tsc` and the `typescript-native-bridge` override once the Vue checks run on the Rust path everywhere. Verified by no `vue-tsc` dependency and no override entry remaining in the manifests.

## 4. The `typescript` package

- [x] 4.1 Parse `scripts/` sources with `oxc-parser` and drop `typescript` from `scripts/package.json`. Verified by no `scripts/` file importing `typescript` and the scoped sweep tests passing.
- [ ] 4.2 Drop the `typescript` package once the build and tooling peers listed in `design.md` no longer need it. Verified by the root manifest no longer declaring it.
