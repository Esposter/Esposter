# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.39.0](https://github.com/Esposter/Esposter/compare/v2.38.1...v2.39.0) (2026-09-04)

### Bug Fixes

* **azure-functions:** declare the entry point the Functions host loads ([b3a3721](https://github.com/Esposter/Esposter/commit/b3a3721bd388d0787c4d5e483dddccb27f59f431))
* **ci:** resnapshot the infra bundle for the shorter action pattern ([9bb18a6](https://github.com/Esposter/Esposter/commit/9bb18a6ecfc5f12b520d7d6740c664a29699679f))
* **ci:** unbreak the function deploy pnpm 12 broke, and pin the rule ([6c874d2](https://github.com/Esposter/Esposter/commit/6c874d274abeab8072e782838c709f9db86bff7f))
* **infra:** fetch each Function App's package with its own identity ([1e45b4b](https://github.com/Esposter/Esposter/commit/1e45b4b6a96bcec9c6c5d52d15ebbac8554f23ff))
* **storage:** reject a BlobCreated event older than the one already applied ([6ec9ce8](https://github.com/Esposter/Esposter/commit/6ec9ce891ae2cf1a3f2f1ec27b8f78b405891ef5))

### Performance Improvements

* **ci:** install pnpm and node from GitHub releases via pnpm/setup ([60cd635](https://github.com/Esposter/Esposter/commit/60cd6359cb01ce321529629ed06f92e954a06209))
* **platform:** a private package emits no declarations ([fa31aa4](https://github.com/Esposter/Esposter/commit/fa31aa4b26d5ba1d3e1573e2d1464990dd9272cb))
* **platform:** the build generates its own barrel, and skips it when it can ([696835c](https://github.com/Esposter/Esposter/commit/696835c457837d8737b8cd09b940dc97577cfc24))

## [2.38.1](https://github.com/Esposter/Esposter/compare/v2.38.0...v2.38.1) (2026-08-23)

### Bug Fixes

* **build:** export source under a condition, so Node still resolves the build ([42fb8d4](https://github.com/Esposter/Esposter/commit/42fb8d471a8917cc53d9b105fddfc481fc58ddaf))
* **build:** keep workspace source out of Node's own module loader ([4c3bfdd](https://github.com/Esposter/Esposter/commit/4c3bfddaf246c21f03d103a7aac44c7de9b8f97d))

# [2.38.0](https://github.com/Esposter/Esposter/compare/v2.37.2...v2.38.0) (2026-08-23)

### Bug Fixes

* **ci:** make Merge Coverage fail instead of skip, and unstick main ([0f78c22](https://github.com/Esposter/Esposter/commit/0f78c2277f9d15a3b7f85a82b3d74281dd1f2253)), closes [#1070](https://github.com/Esposter/Esposter/issues/1070)

## [2.37.2](https://github.com/Esposter/Esposter/compare/v2.37.1...v2.37.2) (2026-08-14)

**Note:** Version bump only for package @esposter/infra

## [2.37.1](https://github.com/Esposter/Esposter/compare/v2.37.0...v2.37.1) (2026-08-14)

**Note:** Version bump only for package @esposter/infra

# [2.37.0](https://github.com/Esposter/Esposter/compare/v2.36.0...v2.37.0) (2026-08-14)

### Bug Fixes

* answer the review on the filter pills, the reorder recipe and the probe ([8591234](https://github.com/Esposter/Esposter/commit/8591234e8cdeae520d0fbe3f90a2ef71beaac7f9))
* **build:** stop the shared build preset from squatting on configuration's own build config ([7926319](https://github.com/Esposter/Esposter/commit/792631944592810a2a60eb24184fdd0c3de45555))
* code review comments ([813b854](https://github.com/Esposter/Esposter/commit/813b854939772e4f8600b85116a22dfbe6374d2b))
* lint and snapshots ([cba23c7](https://github.com/Esposter/Esposter/commit/cba23c7f291eee44e615e0f226d0d4cbf1a6da78))
* lint and snapshots ([bb38abb](https://github.com/Esposter/Esposter/commit/bb38abbab7430f5d86d8b2eecf744d2648c0c062))

# [2.36.0](https://github.com/Esposter/Esposter/compare/v2.35.0...v2.36.0) (2026-07-30)

### Bug Fixes

* address CodeRabbit findings on storage-quotas and policy rename ([a0af799](https://github.com/Esposter/Esposter/commit/a0af799b148b9566fd3c639f88793f7ad35dd772))
* address post-merge code review findings ([548024d](https://github.com/Esposter/Esposter/commit/548024df27a73e4b9a8f1467c91717c734021812))
* CI failures, CodeRabbit findings, and Basic-tier reminder dedupe ([96fd87a](https://github.com/Esposter/Esposter/commit/96fd87a1af102dd0314d60b040d3199e546848aa))
* close lint findings on the resource cleanup tests ([c1c3230](https://github.com/Esposter/Esposter/commit/c1c323010a0ef3c9391050962571c07376a813a0))
* close the CodeRabbit findings on the publish/replay cohort ([c8db3a5](https://github.com/Esposter/Esposter/commit/c8db3a5651104c7420d5efc3e6119adb54c5b08a))
* close the develop-to-main review findings ([3f29155](https://github.com/Esposter/Esposter/commit/3f29155a720cebf09405c443aa1f5e0ffbb4f04e))
* close the remaining develop-to-main review findings ([358e350](https://github.com/Esposter/Esposter/commit/358e3504c273bf91fad6ec96f4d30092d0cc92fa))
* code review comments ([a739015](https://github.com/Esposter/Esposter/commit/a739015af42462afb2890c6532220a86b974b1c9))
* docs ([a8e82da](https://github.com/Esposter/Esposter/commit/a8e82dac4f8eca451a036e4bda8f8aa61aa4df3f))
* **infra:** grant the Logic App identities EventGrid Contributor ([70a8594](https://github.com/Esposter/Esposter/commit/70a85940e19fe91c375f9a23af2794329b0edcc2))
* **infra:** let the event subscription watchdog write its dead-letter link ([ffb50ab](https://github.com/Esposter/Esposter/commit/ffb50ab6d6a0b95053f92fb5eea1f13264797abb))
* **infra:** tear down the storage system-topic subscription with the guard ([d9a4807](https://github.com/Esposter/Esposter/commit/d9a4807cf3d5f5f2b50d6a623169208140eb4557))
* lint ([4c7d254](https://github.com/Esposter/Esposter/commit/4c7d25424784f4632d82778e22b7ece6a48f51c7))
* lint and tests ([d3dc93a](https://github.com/Esposter/Esposter/commit/d3dc93a81f1bb0dca065d47ed91c7ab252579979))
* pulumi ([beae6b8](https://github.com/Esposter/Esposter/commit/beae6b82efcf850e3b6e1b8492148d2eed265a95))
* resolve notify closures by binding, restore dead-lettering on recreate ([14bb140](https://github.com/Esposter/Esposter/commit/14bb1404ff931ba1657178b8a1dd1b7fb1ac9f83))
* snapshot ([01966c3](https://github.com/Esposter/Esposter/commit/01966c3534f5bfd6e389239be4fd9cb94ba8b02a))
* snapshot ([6b137e7](https://github.com/Esposter/Esposter/commit/6b137e7366439814ad41c165bd864b28435bd425))
* snapshots ([7e6429c](https://github.com/Esposter/Esposter/commit/7e6429c68b51eb9e6cbf064fab938eee349d87c2))
* snapshots ([881ecb1](https://github.com/Esposter/Esposter/commit/881ecb15f284319aa6867ccb42b7a7269a9cae66))
* snapshots ([d505054](https://github.com/Esposter/Esposter/commit/d505054f6b852fca4fb57131c682cc8a8e1d7466))
* snapshots ([f5eadf4](https://github.com/Esposter/Esposter/commit/f5eadf4a15126ab6c3de9d088f1419bd6ea625db))
* status checks and snapshots ([d5865d6](https://github.com/Esposter/Esposter/commit/d5865d6e27cdab38240462b59ccf51e668aa1a5a))
* tests ([97bdc81](https://github.com/Esposter/Esposter/commit/97bdc81353183907175d54eb2e6f7cd2cd863a4f))
* types and tests ([e866d77](https://github.com/Esposter/Esposter/commit/e866d772c57ad1f320603b053674729c11713fb8))
* wip ([60a99b8](https://github.com/Esposter/Esposter/commit/60a99b8dde872db6cbc0dd5ac1e006439f3e2881))
* wip ([b02cc3b](https://github.com/Esposter/Esposter/commit/b02cc3b3d3e90cb6215ccbe21d15c9234cadb765))
* wip ([efe6f55](https://github.com/Esposter/Esposter/commit/efe6f553039e9e05c48ed7600073748038a75f6d))

### Features

* Add process blob deletion handler ([1d66a2c](https://github.com/Esposter/Esposter/commit/1d66a2c6a445de75e285c5ae2629d75d939c13b0))
* **infra:** adopt Function App runtime settings into Pulumi ([7b36e3b](https://github.com/Esposter/Esposter/commit/7b36e3b3b3bc83a8d924025ac656ffe5752d52b4))
* **infra:** automatic dead-letter replay with attempt cap and quarantine ([4874ab6](https://github.com/Esposter/Esposter/commit/4874ab6677872e4970b54c7c5dfcc2acf5355447))
* **infra:** cap Log Analytics daily ingestion and adaptively sample App Insights ([0dbd500](https://github.com/Esposter/Esposter/commit/0dbd5004f658d9649302b9435c065a47dd6a1f4c)), closes [high-volume](https://github.com/hi/issues/volume)
* **infra:** Event Grid dead-letter container, retry tightening, and replay script ([df83e24](https://github.com/Esposter/Esposter/commit/df83e246ced8a7be1d5ce415544ca7e5ac0d09e1))
* **platform:** TodoList due reminders ([78089f2](https://github.com/Esposter/Esposter/commit/78089f2475bc87e3070e3db57890d6f4507a282d))

### Reverts

* drop spurious alias on paEsposter001 ([515051d](https://github.com/Esposter/Esposter/commit/515051d5761985d6507b1dc8907309757b12b89b))

# [2.35.0](https://github.com/Esposter/Esposter/compare/v2.34.2...v2.35.0) (2026-07-15)

### Features

* migrate to service bus ([60572d9](https://github.com/Esposter/Esposter/commit/60572d945321e2953abd3bb43f61553c7221f43d))

## [2.34.2](https://github.com/Esposter/Esposter/compare/v2.34.1...v2.34.2) (2026-07-05)

**Note:** Version bump only for package @esposter/infra

## [2.34.1](https://github.com/Esposter/Esposter/compare/v2.34.0...v2.34.1) (2026-07-04)

**Note:** Version bump only for package @esposter/infra

# [2.34.0](https://github.com/Esposter/Esposter/compare/v2.33.0...v2.34.0) (2026-07-04)

**Note:** Version bump only for package @esposter/infra

# [2.33.0](https://github.com/Esposter/Esposter/compare/v2.32.1...v2.33.0) (2026-07-03)

### Bug Fixes

* cleanup debug logs ([fa0a35d](https://github.com/Esposter/Esposter/commit/fa0a35daae80aadf3d32745aec9b4e5c165cc614))

## [2.32.1](https://github.com/Esposter/Esposter/compare/v2.32.0...v2.32.1) (2026-07-01)

**Note:** Version bump only for package @esposter/infra

# [2.32.0](https://github.com/Esposter/Esposter/compare/v2.31.1...v2.32.0) (2026-07-01)

### Bug Fixes

* correct Build Packages required check context for reusable workflow ([938ac99](https://github.com/Esposter/Esposter/commit/938ac995c80421f2e949bf82bf3d9134a38cd2e6))
* lint ([e9f93c2](https://github.com/Esposter/Esposter/commit/e9f93c29d3ab8c559a2c4cec00245149df1ac54e))

## [2.31.1](https://github.com/Esposter/Esposter/compare/v2.31.0...v2.31.1) (2026-06-25)

**Note:** Version bump only for package @esposter/infra

# [2.31.0](https://github.com/Esposter/Esposter/compare/v2.30.0...v2.31.0) (2026-06-25)

### Bug Fixes

* update perms ([362b962](https://github.com/Esposter/Esposter/commit/362b962eee76c753b37883b963869dcce2f81538))

# [2.30.0](https://github.com/Esposter/Esposter/compare/v2.29.0...v2.30.0) (2026-06-24)

**Note:** Version bump only for package @esposter/infra

# [2.29.0](https://github.com/Esposter/Esposter/compare/v2.28.0...v2.29.0) (2026-06-21)

### Bug Fixes

* **infra:** stop native auto-delete nuking develop on merge ([5dae10b](https://github.com/Esposter/Esposter/commit/5dae10b60ca750cff0ac9fba0f89b7fb6e4ea1c8))
* lint ([5b8545e](https://github.com/Esposter/Esposter/commit/5b8545ec26e59a1b066d138e6c03dca9112c5c02))
* remove unnecessary ruleset ([b8ab2fa](https://github.com/Esposter/Esposter/commit/b8ab2fae9b7decbee3f3c75efb6be71494a756f9))
* test ([4484052](https://github.com/Esposter/Esposter/commit/4484052dd587b62985ffe8925e8f3ce6608304d4))
* unifying vitest ([8e3e6bf](https://github.com/Esposter/Esposter/commit/8e3e6bf186a7fecbd3054cf5b9e80e5763d3c8b0))

### Features

* Add github resources ([81f1c0c](https://github.com/Esposter/Esposter/commit/81f1c0c0677321943fccd9c486332b549d756334))
* **infra:** add branch-creation ruleset, dedupe github actor IDs and repo name ([2e3af97](https://github.com/Esposter/Esposter/commit/2e3af97b1dfaa4fd4ceba073f46d83e836a3247f))
* **infra:** finalize GitHub provider (v12) and harden repo settings ([76c6d98](https://github.com/Esposter/Esposter/commit/76c6d982bde4edf2c1c1319a53488c658e77720f))

### Performance Improvements

* tier old message attachments to cool/cold to cut blob storage cost ([9f6881e](https://github.com/Esposter/Esposter/commit/9f6881edb63e601d2091ed52194362701daa7e66))

# [2.28.0](https://github.com/Esposter/Esposter/compare/v2.27.0...v2.28.0) (2026-06-14)

### Bug Fixes

* cleanup unnecessary numbers and time to use dayjs durations ([028ec14](https://github.com/Esposter/Esposter/commit/028ec144d8c9943b7d691ed70874362d49937c26))
* code review comments ([3c654a9](https://github.com/Esposter/Esposter/commit/3c654a9376d85ff05d8e69acf372aca775830c6a))
* code review comments ([61cbffd](https://github.com/Esposter/Esposter/commit/61cbffd5767549d1a787bbd3bc0193bfd78733d4))
* snapshots and dev env for now ([c774f1c](https://github.com/Esposter/Esposter/commit/c774f1c58f72f5274c74bc97eca204d30bbc09ee))

### Features

* wip ([4f094da](https://github.com/Esposter/Esposter/commit/4f094da70109cc17533f2e6d70bd995fac477d0d))

# [2.27.0](https://github.com/Esposter/Esposter/compare/v2.26.0...v2.27.0) (2026-06-05)

**Note:** Version bump only for package @esposter/infra

# [2.26.0](https://github.com/Esposter/Esposter/compare/v2.25.0...v2.26.0) (2026-06-01)

### Bug Fixes

* add isWindows check ([2b101a5](https://github.com/Esposter/Esposter/commit/2b101a5b8d67bb0751d1c7ef01b0253e6aef8190))
* add missing resource ([4c52914](https://github.com/Esposter/Esposter/commit/4c52914ef1666d24fc3419cb8cb72e4d207aa0ab))
* delete unused files ([106bf08](https://github.com/Esposter/Esposter/commit/106bf08e5feb745648c78c1cd1d671d38b786b31))
* format + perms ([5231b9a](https://github.com/Esposter/Esposter/commit/5231b9a3ec19477ee70573477273d7ba312d3659))
* lint and test snapshots to include linux ([2389fbc](https://github.com/Esposter/Esposter/commit/2389fbc9f692c65fcff37f5e4e766af6b3e3f722))
* wip tests ([87dcb4d](https://github.com/Esposter/Esposter/commit/87dcb4db2a8b0b2d3de7d9eca87d6daab9a47056))

### Features

* Add dts bundle size tests ([dfc255a](https://github.com/Esposter/Esposter/commit/dfc255a50259cc6364b6edd97dcd5403c775aa1d))
* Add remaining bundle tests ([d9b0f1a](https://github.com/Esposter/Esposter/commit/d9b0f1a0cd27ac92e8921bc23e0ed0ddcf337a1d))

# [2.25.0](https://github.com/Esposter/Esposter/compare/v2.24.0...v2.25.0) (2026-05-21)

### Bug Fixes

* action groups are global ([25bb5f7](https://github.com/Esposter/Esposter/commit/25bb5f776e2103741d6db77edceea4e9323f9134))
* add files ([431a94a](https://github.com/Esposter/Esposter/commit/431a94adb5cd4960ef7b37c39c521c1603db9bf9))
* add files and fix urls ([603940c](https://github.com/Esposter/Esposter/commit/603940cef493450b32e72699e29e09ceda88473d))
* add require application ([0846a6f](https://github.com/Esposter/Esposter/commit/0846a6fa5f9820fc63963063fbdca063bd27ffbc))
* cleanup and refactor names ([9c74dc1](https://github.com/Esposter/Esposter/commit/9c74dc14004ece7f75bbf7918807a74d0d0b6e34))
* cleanup bgt resources ([ea08ee0](https://github.com/Esposter/Esposter/commit/ea08ee0cfc28dde7e2e9e49d96c976e9fda3aef7))
* correct stale rollback sections and idempotent search indexer commands ([806b653](https://github.com/Esposter/Esposter/commit/806b653fa30ba0982ddd04a2860a95ca79e75968))
* drift ([9968475](https://github.com/Esposter/Esposter/commit/9968475a490ac8cd3c2d0305df2f6ec7912fc4d3))
* externalize @azure/functions to include Worker.js in deployment ([2461160](https://github.com/Esposter/Esposter/commit/2461160677af3f5f2c47a7cdaf41212fb063a7ca))
* function apps finally ([1701fa4](https://github.com/Esposter/Esposter/commit/1701fa440caf0f5757290da6d434e2e6f05a2ad8))
* infra ([500d6b1](https://github.com/Esposter/Esposter/commit/500d6b19eaf4a435bc7667c77118e9df92dd556b))
* infra ([6061760](https://github.com/Esposter/Esposter/commit/6061760aa0e560269cfed55bfee83e3db1c6baf3))
* lint ([8cb10ad](https://github.com/Esposter/Esposter/commit/8cb10ad0aeb0c2794f6a6b95c4e999e53361f1d4))
* lint ([994a0af](https://github.com/Esposter/Esposter/commit/994a0af8723a48b242c978a14b27bbf0f16a89ca))
* lint ([151cf5e](https://github.com/Esposter/Esposter/commit/151cf5e89138d5cd2db9728023b1132b8326858a))
* lint ([7e6c918](https://github.com/Esposter/Esposter/commit/7e6c918d2bb2099865375d4b9ccd217e86e8cacc))
* node memory + update naming conventions ([3ed843a](https://github.com/Esposter/Esposter/commit/3ed843ae7b0b29e11f060484ae922629490d252b))
* redeploy ([b7e3517](https://github.com/Esposter/Esposter/commit/b7e3517d7d75544de8d9ec9f241f4a92654e0549))
* search index ([4e6e0fe](https://github.com/Esposter/Esposter/commit/4e6e0fece59f0920d6e0122c0f59fb2035ef42c5))
* types and build docs warnings ([e1e70e2](https://github.com/Esposter/Esposter/commit/e1e70e2e21e7c4c70cdb0b4e73c1c2a4f6db3d09))
* update role assignments to be least privilege ([6ad529c](https://github.com/Esposter/Esposter/commit/6ad529cb09f8811d491c45fd073a69f390b83fba))
* v1 ([44fd2ca](https://github.com/Esposter/Esposter/commit/44fd2cab83e3c2b22f9ed1d4d75cca3538560238))
* v2 ([7d251b8](https://github.com/Esposter/Esposter/commit/7d251b8b5bec920fb3e1754d76bbc8127f57e199))
* v4 ([b64e142](https://github.com/Esposter/Esposter/commit/b64e1422f83357df11ca1bc14e4e8280207e2c93))

### Features

* Add docs ([c049c14](https://github.com/Esposter/Esposter/commit/c049c14c4ce23ca40bf8eb10b0d1e49673c6e60f))
* add migration plan ([87871d6](https://github.com/Esposter/Esposter/commit/87871d6d3ee77f4a9e2f4fafb11d99fc5e5cb4be))
* add migration plan ([8d8620f](https://github.com/Esposter/Esposter/commit/8d8620f7c79a12e0b4570b6ca57b10fdeca68ac3))
* add migration step version plan ([1a67540](https://github.com/Esposter/Esposter/commit/1a675404743d0f31b6397ce9bdf6a6ac56e1e472))
* Add role assignments ([dc0c2a9](https://github.com/Esposter/Esposter/commit/dc0c2a97af93c127bf2cbd978a58ebf677ccff9a))
* Add role assignments ([db2473e](https://github.com/Esposter/Esposter/commit/db2473e64762593ff9ea68bbb6555c1603132e1f))
* finalize namings ([bc69a7c](https://github.com/Esposter/Esposter/commit/bc69a7c4c5c17d59f97a50a4310d78fd2d6c7fb4))
