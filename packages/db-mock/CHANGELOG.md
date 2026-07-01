# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.32.0](https://github.com/Esposter/Esposter/compare/v2.31.1...v2.32.0) (2026-07-01)

**Note:** Version bump only for package @esposter/db-mock

## [2.31.1](https://github.com/Esposter/Esposter/compare/v2.31.0...v2.31.1) (2026-06-25)

**Note:** Version bump only for package @esposter/db-mock

# [2.31.0](https://github.com/Esposter/Esposter/compare/v2.30.0...v2.31.0) (2026-06-25)

**Note:** Version bump only for package @esposter/db-mock

# [2.30.0](https://github.com/Esposter/Esposter/compare/v2.29.0...v2.30.0) (2026-06-24)

### Features

* voice settings polish, screen-share stop + settings buttons ([64c9d23](https://github.com/Esposter/Esposter/commit/64c9d2342aff1bb565c381c53841afe7856597df))

# [2.29.0](https://github.com/Esposter/Esposter/compare/v2.28.0...v2.29.0) (2026-06-21)

### Bug Fixes

* lint ([8a8511d](https://github.com/Esposter/Esposter/commit/8a8511d46aa233ce8c15b8954de9a5d83f4436eb))
* timeouts by actually waiting until db is ready in before all setups before running tests ([3346f72](https://github.com/Esposter/Esposter/commit/3346f72b112d0bb7ec16e0e08069fcb8a590b6ce))
* unifying vitest ([8e3e6bf](https://github.com/Esposter/Esposter/commit/8e3e6bf186a7fecbd3054cf5b9e80e5763d3c8b0))

### Features

* **esbabbler:** DB-backed Discord-style user-settings surface ([b61bf66](https://github.com/Esposter/Esposter/commit/b61bf6649da89c1be1d1c38feef41bfe31c44dda))

# [2.28.0](https://github.com/Esposter/Esposter/compare/v2.27.0...v2.28.0) (2026-06-14)

### Bug Fixes

* no longer need bigint polyfill ([21c1723](https://github.com/Esposter/Esposter/commit/21c17237a32abe31e1ed30ccf3cca48cf4ac0eed))
* snapshots and dev env for now ([c774f1c](https://github.com/Esposter/Esposter/commit/c774f1c58f72f5274c74bc97eca204d30bbc09ee))
* snapshots and tests ([9b2a6f2](https://github.com/Esposter/Esposter/commit/9b2a6f2102395a230ef4cd0b1f3a31fe37408c08))
* use back latest pglite ver after updating snapshot ([cb1ab97](https://github.com/Esposter/Esposter/commit/cb1ab970968ce9cb7a40fc29bcbdf1ee0eb858d9))

### Performance Improvements

* snapshot mock db so we save huge amounts of wasted testing time ([dddd69a](https://github.com/Esposter/Esposter/commit/dddd69aee7c57f1a92490fd70c2fc7b77d02fe05))

# [2.27.0](https://github.com/Esposter/Esposter/compare/v2.26.0...v2.27.0) (2026-06-05)

**Note:** Version bump only for package @esposter/db-mock

# [2.26.0](https://github.com/Esposter/Esposter/compare/v2.25.0...v2.26.0) (2026-06-01)

### Bug Fixes

* add isWindows check ([2b101a5](https://github.com/Esposter/Esposter/commit/2b101a5b8d67bb0751d1c7ef01b0253e6aef8190))
* format + perms ([5231b9a](https://github.com/Esposter/Esposter/commit/5231b9a3ec19477ee70573477273d7ba312d3659))
* lint and test snapshots to include linux ([2389fbc](https://github.com/Esposter/Esposter/commit/2389fbc9f692c65fcff37f5e4e766af6b3e3f722))
* wip tests ([87dcb4d](https://github.com/Esposter/Esposter/commit/87dcb4db2a8b0b2d3de7d9eca87d6daab9a47056))

### Features

* Add dts bundle size tests ([dfc255a](https://github.com/Esposter/Esposter/commit/dfc255a50259cc6364b6edd97dcd5403c775aa1d))
* Add remaining bundle tests ([d9b0f1a](https://github.com/Esposter/Esposter/commit/d9b0f1a0cd27ac92e8921bc23e0ed0ddcf337a1d))

# [2.25.0](https://github.com/Esposter/Esposter/compare/v2.24.0...v2.25.0) (2026-05-21)

**Note:** Version bump only for package @esposter/db-mock

# [2.24.0](https://github.com/Esposter/Esposter/compare/v2.23.0...v2.24.0) (2026-05-15)

### Bug Fixes

* typechecking and code review comments ([2a85e3f](https://github.com/Esposter/Esposter/commit/2a85e3fe2652b11a563b91e1749a6f1ce38be6dc))

# [2.23.0](https://github.com/Esposter/Esposter/compare/v2.22.0...v2.23.0) (2026-05-07)

### Bug Fixes

* tests ([77569ab](https://github.com/Esposter/Esposter/commit/77569ab9ea48b48bf880220f9861834fe735d4ec))

### Features

* upgrade drizzle ([17b9f41](https://github.com/Esposter/Esposter/commit/17b9f41b180ba109382d34e9507ead13cbbb95b2))

# [2.22.0](https://github.com/Esposter/Esposter/compare/v2.21.0...v2.22.0) (2026-04-28)

### Bug Fixes

* add relations ([f06b387](https://github.com/Esposter/Esposter/commit/f06b387798a98acf7664373b8506279beefc424f))

* default env to node ([f347f92](https://github.com/Esposter/Esposter/commit/f347f927539441860ed7a6b19f2789f8a91a4686))

* migration wip ([73268a8](https://github.com/Esposter/Esposter/commit/73268a856748e134bf1866af4bcfd3faf264862e))

* move to db-mock package ([2df4164](https://github.com/Esposter/Esposter/commit/2df416413bb4385f050c81213193bff200f24a66))
