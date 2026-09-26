# Shared Reactive State

Read when reactive state has to be shared between callers, or a `ref` is about to sit at module scope. The one-line rules are in `SKILL.md`; this page is why both shapes are banned and where the state goes.

- **Never use `createSharedComposable`** (a `no-restricted-syntax` error) — VueUse's `createSharedComposable` creates global singletons that bypass Pinia devtools, HMR, and reactive reset. All shared reactive state must live in a Pinia store (`defineStore`).

- **A bare `ref` at module scope is the same singleton without the name** (a `no-restricted-syntax` error in any `.ts` file) — a `ref` declared outside the composable's body is process-wide state every caller shares, so it carries every cost `createSharedComposable` is banned for and announces none of them. It belongs in a Pinia store. Before writing one, check whether a store already owns that surface: a module-scope notification `ref` is almost always `useAlertStore` re-implemented, and the re-implementation is how a display surface ends up mounted nowhere while its producer keeps writing to it. Module scope is for constants and `markRaw`ed class instances, never reactive state.
