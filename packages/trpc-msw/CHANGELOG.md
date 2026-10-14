# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.2.0](https://github.com/Esposter/Esposter/compare/v4.1.2...v4.2.0) (2026-10-14)

**Note:** Version bump only for package trpc-msw

## [4.1.2](https://github.com/Esposter/Esposter/compare/v4.1.1...v4.1.2) (2026-10-14)

**Note:** Version bump only for package trpc-msw

## [4.1.1](https://github.com/Esposter/Esposter/compare/v4.1.0...v4.1.1) (2026-10-14)

**Note:** Version bump only for package trpc-msw

# [4.1.0](https://github.com/Esposter/Esposter/compare/v4.0.0...v4.1.0) (2026-10-13)

### Bug Fixes

* **trpc-msw:** the mock procedure takes its input through the real procedure's own parsers, so the resolver receives what a transforming parser returns ([1819c59](https://github.com/Esposter/Esposter/commit/1819c599f67a1dd524e2127a514c1873d9c043a9))
* **trpc-msw:** the mock router judges input through the Standard Schema interface, not tRPC's unstable core ([#37](https://github.com/Esposter/Esposter/issues/37)) ([339546f](https://github.com/Esposter/Esposter/commit/339546f1cc31e79609ac4e720f795eb30c19ff4a))
* **trpc-msw:** the mock router parses input through tRPC's public .input(), so its rejection body is the server's ([472f052](https://github.com/Esposter/Esposter/commit/472f0529d59e4bdad5f353a7b7210b664839386d))

### Performance Improvements

* **trpc-msw:** the HTTP router is built once, and rebuilt only when a path is first registered ([9510b37](https://github.com/Esposter/Esposter/commit/9510b3799256166cb3bc21ae0fe0a095d6f29e54))

# [4.0.0](https://github.com/Esposter/Esposter/compare/v3.9.0...v4.0.0) (2026-10-06)

### Bug Fixes

* **ci:** repair main's red lint and coverage after the world screen veil test ([676aefe](https://github.com/Esposter/Esposter/commit/676aefe8167ef2f0c5129a289d68967538194bec))
* repair main's red typecheck, lint and coverage after the trpc-msw input parsers ([36d40ad](https://github.com/Esposter/Esposter/commit/36d40adb66d93bc61d255f6420ee2a3263d2d0a4))
* **trpc-msw:** a mocked procedure runs the real input parsers in order and stops at the first rejection ([1156e78](https://github.com/Esposter/Esposter/commit/1156e787364aad31ca5c02233ef1afb71f29407f))

### Features

* **trpc-msw:** a router option holds every mocked call to the real procedure's input parsers ([a77fde7](https://github.com/Esposter/Esposter/commit/a77fde77a7254d5d8598fbe1155e4176e040b8a8))

# [3.9.0](https://github.com/Esposter/Esposter/compare/v3.8.1...v3.9.0) (2026-10-01)

**Note:** Version bump only for package trpc-msw

## [3.8.1](https://github.com/Esposter/Esposter/compare/v3.8.0...v3.8.1) (2026-09-30)

**Note:** Version bump only for package trpc-msw

# [3.8.0](https://github.com/Esposter/Esposter/compare/v3.7.0...v3.8.0) (2026-09-30)

**Note:** Version bump only for package trpc-msw

# [3.7.0](https://github.com/Esposter/Esposter/compare/v3.6.0...v3.7.0) (2026-09-29)

**Note:** Version bump only for package trpc-msw

# [3.6.0](https://github.com/Esposter/Esposter/compare/v3.5.1...v3.6.0) (2026-09-29)

### Bug Fixes

* repair main's reds — trpc-msw docs section, dependency graph and size snapshots ([bbbdb5f](https://github.com/Esposter/Esposter/commit/bbbdb5fcb914ed5adef55f37e0ffb82de68cf8cd))

### Features

* **trpc-msw:** absorb msw-trpc into a package of our own ([d66013e](https://github.com/Esposter/Esposter/commit/d66013e8289597e238aeefe04645ae6e829e5432)), closes [#19](https://github.com/Esposter/Esposter/issues/19) [#51](https://github.com/Esposter/Esposter/issues/51) [#49](https://github.com/Esposter/Esposter/issues/49)
