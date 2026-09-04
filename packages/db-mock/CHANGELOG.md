# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.39.0](https://github.com/Esposter/Esposter/compare/v2.38.1...v2.39.0) (2026-09-04)

### Bug Fixes

* **ci:** unbreak the function deploy pnpm 12 broke, and pin the rule ([6c874d2](https://github.com/Esposter/Esposter/commit/6c874d274abeab8072e782838c709f9db86bff7f))
* correct three message-table columns that contradict themselves ([ec9a7c8](https://github.com/Esposter/Esposter/commit/ec9a7c80282b476bef2537978624c35439a4c5d7))
* **db-mock:** regenerate the snapshot for the sessions cascade ([91dd47a](https://github.com/Esposter/Esposter/commit/91dd47a229ed35fb2810c4b75d3b3a062cf360d4))
* **platform:** the watcher exists, and the snapshot travels with the build ([cf67bc4](https://github.com/Esposter/Esposter/commit/cf67bc4d3aa9c3a08f8f2635e7eb75e1c382ce73))
* repair the CI fallout from the count column renames ([bbe1c03](https://github.com/Esposter/Esposter/commit/bbe1c035bc81988a32cbe488148b0faf24787a76))
* **storage:** reject a BlobCreated event older than the one already applied ([6ec9ce8](https://github.com/Esposter/Esposter/commit/6ec9ce891ae2cf1a3f2f1ec27b8f78b405891ef5))

### Features

* **esbabbler:** custom call backgrounds in fixed per-user slots ([573cb77](https://github.com/Esposter/Esposter/commit/573cb779ae6b4f70a496c434fdcd78c0128b545d))
* **platform:** every resource type gets revisions it can return to ([ef108dc](https://github.com/Esposter/Esposter/commit/ef108dcc49c4e3a3685d4a0e5de888a5edf9f019))
* **post:** Reddit-style reply trees, with the chain on the row ([d422cd7](https://github.com/Esposter/Esposter/commit/d422cd73faf08b60f7a5612ec1b9684f597149c9))
* **users:** list and revoke the account's sessions ([bedfeb7](https://github.com/Esposter/Esposter/commit/bedfeb7958de0771ed6b813759ac5224588f02d4))

### Performance Improvements

* **db-schema:** index the unread notification count by its own predicate ([59b96d6](https://github.com/Esposter/Esposter/commit/59b96d6a0f822df4e85832774a1c056a6c33d61b))
* **platform:** a private package emits no declarations ([fa31aa4](https://github.com/Esposter/Esposter/commit/fa31aa4b26d5ba1d3e1573e2d1464990dd9272cb))
* **platform:** the build generates its own barrel, and skips it when it can ([696835c](https://github.com/Esposter/Esposter/commit/696835c457837d8737b8cd09b940dc97577cfc24))

## [2.38.1](https://github.com/Esposter/Esposter/compare/v2.38.0...v2.38.1) (2026-08-23)

**Note:** Version bump only for package @esposter/db-mock

# [2.38.0](https://github.com/Esposter/Esposter/compare/v2.37.2...v2.38.0) (2026-08-23)

### Bug Fixes

* **rbac,moderation:** close the two hierarchy bypasses and answer the review ([3583254](https://github.com/Esposter/Esposter/commit/3583254f9c703b1a78b073078e16cfce55a1db61))

### Features

* **esbabbler:** make a thread a place you work in ([ee35826](https://github.com/Esposter/Esposter/commit/ee3582692730b4806a2453d5cea8523201cf4ecd))
* **esbabbler:** per-room custom emoji ([350c183](https://github.com/Esposter/Esposter/commit/350c18335ae63516a2aa259de1a369481aaf1077))
* **invites:** Discord's invite surfaces — a panel that lists and pauses, a dialog that hands over a link ([7f5fdec](https://github.com/Esposter/Esposter/commit/7f5fdecf4e028a9320fd70dea3062c97e05c9927))

## [2.37.2](https://github.com/Esposter/Esposter/compare/v2.37.1...v2.37.2) (2026-08-14)

**Note:** Version bump only for package @esposter/db-mock

## [2.37.1](https://github.com/Esposter/Esposter/compare/v2.37.0...v2.37.1) (2026-08-14)

**Note:** Version bump only for package @esposter/db-mock

# [2.37.0](https://github.com/Esposter/Esposter/compare/v2.36.0...v2.37.0) (2026-08-14)

### Bug Fixes

* **build:** stop the shared build preset from squatting on configuration's own build config ([7926319](https://github.com/Esposter/Esposter/commit/792631944592810a2a60eb24184fdd0c3de45555))
* **message:** stop votes deleting poll labels and re-following unfollowers ([10a997c](https://github.com/Esposter/Esposter/commit/10a997c546f064774e5ea8b45ab1763d8e817086))

### Features

* **platform:** enforce per-user blob storage quotas ([d6aab71](https://github.com/Esposter/Esposter/commit/d6aab71ecf5565cf287a63e43cc4e18214f12368))
* **resource-explorer:** add the service menu, with Recent and Favorites as list routes ([cd23cc5](https://github.com/Esposter/Esposter/commit/cd23cc594c2145e10a252e1a1e352eb2e94bee1c))

### Performance Improvements

* **survey:** resolve a participant token from a column, not every program's blob ([0900d47](https://github.com/Esposter/Esposter/commit/0900d4736403f909b1e6efe37acc82ad7a9472cd))

# [2.36.0](https://github.com/Esposter/Esposter/compare/v2.35.0...v2.36.0) (2026-07-30)

### Bug Fixes

* address CodeRabbit PR 1008 review findings and lint ([91a43f8](https://github.com/Esposter/Esposter/commit/91a43f8724a09b2b56a61564b91e7dfa4805d42b))
* **esbabbler:** address CodeRabbit review findings on PR [#1017](https://github.com/Esposter/Esposter/issues/1017) ([99cc3e3](https://github.com/Esposter/Esposter/commit/99cc3e3e967c92fd9f5203dc01eaf2f34e2cec9f))
* post-merge integration fallout ([d7f882c](https://github.com/Esposter/Esposter/commit/d7f882cbef6cf79fc4aa781366b27a6bababdb47))
* snapshots ([e55471d](https://github.com/Esposter/Esposter/commit/e55471d43085dd03cc7f0cc8ba7866e09486767c))

### Features

* Blueprint resource type with deploy and capture ([b70e0d0](https://github.com/Esposter/Esposter/commit/b70e0d07e79068954839dad498513ec265b0030b))
* **db-schema:** add resource favorites, tags, activity log schema ([f7277bf](https://github.com/Esposter/Esposter/commit/f7277bf5db5f78490c5ffd62bab75e6b82c8e2bf))
* **db:** add Note resource_type enum value ([f337b6b](https://github.com/Esposter/Esposter/commit/f337b6b358a02b162d231b1a9369e3686ab0844f))
* **esbabbler:** consolidate file uploads, add thumbnails, room limits, and files tab ([87acbcf](https://github.com/Esposter/Esposter/commit/87acbcf61dac83023ebe2b98a2e433b2cc1c562a))
* **platform:** close the end-to-end survey funnel ([adc0d50](https://github.com/Esposter/Esposter/commit/adc0d50af12103710cbd5a85550d824c38f5deec))
* real-time todo list via onSaveResourceContent subscription ([2d42a1d](https://github.com/Esposter/Esposter/commit/2d42a1d67f3f4e39a58e8b4d47083e73ccdc31f2))

### Performance Improvements

* **message:** read the create-message gate once instead of rule by rule ([ffa0e59](https://github.com/Esposter/Esposter/commit/ffa0e594d0aa3c7609f51105a4cce7eeade30aab))

# [2.35.0](https://github.com/Esposter/Esposter/compare/v2.34.2...v2.35.0) (2026-07-15)

### Bug Fixes

* add db migrations ([fabe3e0](https://github.com/Esposter/Esposter/commit/fabe3e077cf7c464e278f1870600d6f16b9b8f15))
* post-merge integration for esbabbler, platform, and posts branches ([a14af16](https://github.com/Esposter/Esposter/commit/a14af16951d55266948f62c378c7490a6854f166))

### Features

* esbabbler mention badges + push-to-talk keybind with release delay ([3cc0602](https://github.com/Esposter/Esposter/commit/3cc060227b201fcac212b11be6d401312a9b5f74))
* wip ([a704083](https://github.com/Esposter/Esposter/commit/a704083c21166a5ef492fa18656d2cf8dcf06b49))

## [2.34.2](https://github.com/Esposter/Esposter/compare/v2.34.1...v2.34.2) (2026-07-05)

**Note:** Version bump only for package @esposter/db-mock

## [2.34.1](https://github.com/Esposter/Esposter/compare/v2.34.0...v2.34.1) (2026-07-04)

**Note:** Version bump only for package @esposter/db-mock

# [2.34.0](https://github.com/Esposter/Esposter/compare/v2.33.0...v2.34.0) (2026-07-04)

**Note:** Version bump only for package @esposter/db-mock

# [2.33.0](https://github.com/Esposter/Esposter/compare/v2.32.1...v2.33.0) (2026-07-03)

### Bug Fixes

* cleanup debug logs ([fa0a35d](https://github.com/Esposter/Esposter/commit/fa0a35daae80aadf3d32745aec9b4e5c165cc614))

## [2.32.1](https://github.com/Esposter/Esposter/compare/v2.32.0...v2.32.1) (2026-07-01)

**Note:** Version bump only for package @esposter/db-mock

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
