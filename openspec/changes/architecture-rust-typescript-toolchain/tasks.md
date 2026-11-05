# Tasks

## 1. Plain typecheck on `tsrs`

- [x] 1.1 Every package's plain `typecheck` script, and the root project's `typecheck:root` task in `vite.config.ts`, runs `tsrs --fast`, with `noEmit` read from the shared `tsconfig` chain. Verified by the package scripts and the workspace typecheck passing.

## 2. Vue checks

- [x] 2.1 Carry the Vue checks through `vize`, as the sibling change [architecture-vize-vue-typecheck](../archive/2026-11-05-architecture-vize-vue-typecheck/tasks.md) planned. Done: every Vue type check and every `.vue` declaration runs through `tsrs` with the `vize` mapper, and no package depends on `vue-tsc`. Verified by that change's gates passing.

## 3. The override

- [ ] 3.1 Retire the `typescript-native-bridge` override once `typescript-eslint`, the `attw` gate and `rolldown-plugin-dts` no longer read the classic `typescript` API. Verified by no override entry remaining in the manifests.

## 4. The `typescript` package

- [x] 4.1 Parse `scripts/` sources with `oxc-parser` and drop `typescript` from `scripts/package.json`. Verified by no `scripts/` file importing `typescript` and the scoped sweep tests passing.
- [ ] 4.2 Drop the `typescript` package once the build and tooling peers listed in `design.md` no longer need it. Verified by the root manifest no longer declaring it.
