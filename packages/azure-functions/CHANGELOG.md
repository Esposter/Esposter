# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.39.0](https://github.com/Esposter/Esposter/compare/v2.38.1...v2.39.0) (2026-09-04)

### Bug Fixes

* **azure-functions:** declare the entry point the Functions host loads ([b3a3721](https://github.com/Esposter/Esposter/commit/b3a3721bd388d0787c4d5e483dddccb27f59f431))
* **azure-functions:** declare the side effects its entry exists for ([346c732](https://github.com/Esposter/Esposter/commit/346c73234f76ae390e6774b2eddfdedc0f149dfe))
* **azure-functions:** drain dead letters stranded while the app was down ([1c79922](https://github.com/Esposter/Esposter/commit/1c799222c46dab0cf3eae5eca463227f7c7ee5d9))
* **azure-functions:** give each best-effort step of a scheduled send its own Result ([b707516](https://github.com/Esposter/Esposter/commit/b707516ef584db0779fd9bc61c64d1c3c8a3a91a))
* **azure-functions:** key the drain on lastModified and claim each blob ([1557775](https://github.com/Esposter/Esposter/commit/155777568d3abbc89214d1c4e801488a79e3535f))
* **azure-functions:** tsdown generates the entry field and the vendored list ([7e41246](https://github.com/Esposter/Esposter/commit/7e412461c97298ef764e634eec5f908fbf600b51))
* bundle size ([e3e7da0](https://github.com/Esposter/Esposter/commit/e3e7da0d93804d3c0cf5e8bb664d24bdb9c5ce4c))
* **ci:** close the oxlint findings and re-record the bundle sizes ([539008c](https://github.com/Esposter/Esposter/commit/539008caa99bb25762b922a049fda526dde833c3))
* **ci:** drain the lint errors and the drifted size snapshots ([a75cea2](https://github.com/Esposter/Esposter/commit/a75cea2c2cdc4376a5351d77ea4962b8abe56a1f))
* **ci:** the checks pass on the tree the snapshot work left ([acd98a2](https://github.com/Esposter/Esposter/commit/acd98a2753b981c618d0632f9950e52f7614a033))
* **ci:** the import order and the three size snapshots catch up with develop ([0cc14ea](https://github.com/Esposter/Esposter/commit/0cc14ea68b9c2a7a7ea1a1e37744fff2bcad19b7))
* **ci:** unbreak the function deploy pnpm 12 broke, and pin the rule ([6c874d2](https://github.com/Esposter/Esposter/commit/6c874d274abeab8072e782838c709f9db86bff7f))
* close the CodeRabbit findings on the call backgrounds ([c8590f7](https://github.com/Esposter/Esposter/commit/c8590f76285e5a9769d0498fcee24edab6e63952))
* **message:** follow the thread a scheduled reply lands in ([0349e7f](https://github.com/Esposter/Esposter/commit/0349e7fec190c0fbd9c256548e36a5e0b7245d2c))
* **platform:** the storage meter hears the counter its other process moves ([4cf9866](https://github.com/Esposter/Esposter/commit/4cf98664f7ebb9afd4ebccc74a2987d0c7bb7a7a))
* repair the CI fallout from the count column renames ([bbe1c03](https://github.com/Esposter/Esposter/commit/bbe1c035bc81988a32cbe488148b0faf24787a76))
* **slowmode:** a typed fraction truncates to whole seconds instead of throwing ([ac2c4a0](https://github.com/Esposter/Esposter/commit/ac2c4a073f960eae2847179905b30568887a0c64))
* **storage:** reject a BlobCreated event older than the one already applied ([6ec9ce8](https://github.com/Esposter/Esposter/commit/6ec9ce891ae2cf1a3f2f1ec27b8f78b405891ef5))

### Performance Improvements

* **azure-functions:** stop the two storage polls that dominate the bill ([8c650d5](https://github.com/Esposter/Esposter/commit/8c650d5b74e638da29acedca6f9f10a1ff4e1ec0)), closes [high-throughput](https://github.com/hi/issues/throughput)
* **platform:** a private package emits no declarations ([fa31aa4](https://github.com/Esposter/Esposter/commit/fa31aa4b26d5ba1d3e1573e2d1464990dd9272cb))
* **platform:** the build generates its own barrel, and skips it when it can ([696835c](https://github.com/Esposter/Esposter/commit/696835c457837d8737b8cd09b940dc97577cfc24))

## [2.38.1](https://github.com/Esposter/Esposter/compare/v2.38.0...v2.38.1) (2026-08-23)

### Bug Fixes

* **build:** export source under a condition, so Node still resolves the build ([42fb8d4](https://github.com/Esposter/Esposter/commit/42fb8d471a8917cc53d9b105fddfc481fc58ddaf))
* **build:** keep workspace source out of Node's own module loader ([4c3bfdd](https://github.com/Esposter/Esposter/commit/4c3bfddaf246c21f03d103a7aac44c7de9b8f97d))

### Performance Improvements

* **azure-functions:** compress the deploy artifact ([838aae4](https://github.com/Esposter/Esposter/commit/838aae4d7684adf4c661ed2e63b6dc39fd711be5))

# [2.38.0](https://github.com/Esposter/Esposter/compare/v2.37.2...v2.38.0) (2026-08-23)

### Bug Fixes

* address the CodeRabbit findings from the 0b65d92f7..db14d8d76 review ([5a3df2e](https://github.com/Esposter/Esposter/commit/5a3df2e8ac07c6ce502b253c76d355c6a4d2575b))
* **auth:** name the adapter test block after its export, drop the useless fallback ([c993bd6](https://github.com/Esposter/Esposter/commit/c993bd67bfa97ffa9323c8370fabad9f7c4cd2d8))
* **ci:** make Merge Coverage fail instead of skip, and unstick main ([0f78c22](https://github.com/Esposter/Esposter/commit/0f78c2277f9d15a3b7f85a82b3d74281dd1f2253)), closes [#1070](https://github.com/Esposter/Esposter/issues/1070)
* green up CI, and close the review findings it did not catch ([dde8ffe](https://github.com/Esposter/Esposter/commit/dde8ffebb357415245186d6e803242608bcaf53e))
* **invites:** answer the review — lock the room around the pause check, and stop two rollbacks resurrecting dead state ([d287e80](https://github.com/Esposter/Esposter/commit/d287e80c9d5e8649022a768fd921bacf89412563))
* **rbac,moderation:** close the two hierarchy bypasses and answer the review ([3583254](https://github.com/Esposter/Esposter/commit/3583254f9c703b1a78b073078e16cfce55a1db61))
* **skills,docs:** answer the fifth review and refresh the azure-functions bundle ([2f48e76](https://github.com/Esposter/Esposter/commit/2f48e76e2dfd34068d8ab415dba90441612e9e56))

### Features

* **esbabbler:** make a thread a place you work in ([ee35826](https://github.com/Esposter/Esposter/commit/ee3582692730b4806a2453d5cea8523201cf4ecd))

## [2.37.2](https://github.com/Esposter/Esposter/compare/v2.37.1...v2.37.2) (2026-08-14)

**Note:** Version bump only for package @esposter/azure-functions

## [2.37.1](https://github.com/Esposter/Esposter/compare/v2.37.0...v2.37.1) (2026-08-14)

**Note:** Version bump only for package @esposter/azure-functions

# [2.37.0](https://github.com/Esposter/Esposter/compare/v2.36.0...v2.37.0) (2026-08-14)

### Bug Fixes

* **build:** stop the shared build preset from squatting on configuration's own build config ([7926319](https://github.com/Esposter/Esposter/commit/792631944592810a2a60eb24184fdd0c3de45555))
* close the seams the merged review branches left ([f2c0b26](https://github.com/Esposter/Esposter/commit/f2c0b26d3f405ef1c6fceae05f93eaea16e74e8b))
* lint and snapshots ([cba23c7](https://github.com/Esposter/Esposter/commit/cba23c7f291eee44e615e0f226d0d4cbf1a6da78))
* lint and snapshots ([bb38abb](https://github.com/Esposter/Esposter/commit/bb38abbab7430f5d86d8b2eecf744d2648c0c062))
* **oxlint:** flag a default-exported forwarding arrow, and pin the parse in the handler test ([ae1ae63](https://github.com/Esposter/Esposter/commit/ae1ae63e351c929e0bcbd435a447c6fc16d5ae73))
* **platform:** close the storage-quota review findings ([bb01ac6](https://github.com/Esposter/Esposter/commit/bb01ac6a74405af5d71debd46b7a30b5f811c1a2))
* **review:** drain the review findings and clear the root lint gate ([66c8f53](https://github.com/Esposter/Esposter/commit/66c8f53991305944abdd0d1df658229ce5197391))
* **shared:** drop the stray quote truncate appended to every push notification ([85f8af0](https://github.com/Esposter/Esposter/commit/85f8af0cfe19f1dc10c3aca5382adcaf5ba01084))
* snapshot ([8d14ca3](https://github.com/Esposter/Esposter/commit/8d14ca320c7140c97490877839af7daa36a221d7))
* snapshots ([cd704f9](https://github.com/Esposter/Esposter/commit/cd704f9b200ead2ba85221f5c1d62e80aba0872c))
* snapshots ([7d52b59](https://github.com/Esposter/Esposter/commit/7d52b597a8a64a74a43611035e90b4dbafe35448))
* test renames ([c106891](https://github.com/Esposter/Esposter/commit/c1068915c3c9e9f277332641a328e010ea7abe33))

### Features

* **oxlint:** catch the forwarded read too, and retire the ledger ([1a6eb3c](https://github.com/Esposter/Esposter/commit/1a6eb3c799586de8e119f4a8acb79dddd9764c88))
* **platform:** enforce per-user blob storage quotas ([d6aab71](https://github.com/Esposter/Esposter/commit/d6aab71ecf5565cf287a63e43cc4e18214f12368))

# [2.36.0](https://github.com/Esposter/Esposter/compare/v2.35.0...v2.36.0) (2026-07-30)

### Bug Fixes

* add docs + modifications ([e3b82f1](https://github.com/Esposter/Esposter/commit/e3b82f1284e96089b6376467a155fad28fa1d6dc))
* add missing regression tests ([a5c0040](https://github.com/Esposter/Esposter/commit/a5c0040443bc57a5423f71cb3d93147f50f64668))
* address PR 1008 workflow review findings ([4f7eb9d](https://github.com/Esposter/Esposter/commit/4f7eb9d09d62c118171462ad487456e3ef01d8db))
* anchor the asset url, attribute the automod log, age-gate the reaper ([aac93e1](https://github.com/Esposter/Esposter/commit/aac93e17e85221d9e964c27ba3a9bfb176072238))
* app lint errors + azure-functions bundle snapshot ([19cdfbf](https://github.com/Esposter/Esposter/commit/19cdfbfd57189952db0b5b2594f9af9f8dfdc3f1))
* CI failures, CodeRabbit findings, and Basic-tier reminder dedupe ([96fd87a](https://github.com/Esposter/Esposter/commit/96fd87a1af102dd0314d60b040d3199e546848aa))
* CI virrun shim + stale bundle-size snapshots ([b64c9a6](https://github.com/Esposter/Esposter/commit/b64c9a67704629c00780afaaee26b7745d2529cc))
* clear the remaining confirmed findings from the seam review ([8709cd8](https://github.com/Esposter/Esposter/commit/8709cd8b0687e32fdbec8320bfc0d661c916d043))
* close cross-feature gaps in guard, rollback and revert paths ([eac8e17](https://github.com/Esposter/Esposter/commit/eac8e17afc5be3d37a54605e4a2fa1d1e4b6b7db))
* close lint findings on the resource cleanup tests ([c1c3230](https://github.com/Esposter/Esposter/commit/c1c323010a0ef3c9391050962571c07376a813a0))
* close the blob-delete gaps this review found ([08f6c83](https://github.com/Esposter/Esposter/commit/08f6c830c439fc96010bb94aefa16908b76bf75d))
* close the CodeRabbit findings on the publish/replay cohort ([c8db3a5](https://github.com/Esposter/Esposter/commit/c8db3a5651104c7420d5efc3e6119adb54c5b08a))
* close the defects the develop-to-main review found ([494120b](https://github.com/Esposter/Esposter/commit/494120bf742e6946cc347867187f66e91e2d7a91)), closes [#1029](https://github.com/Esposter/Esposter/issues/1029)
* close the defects the previous fix round introduced ([d7676dc](https://github.com/Esposter/Esposter/commit/d7676dcd3604ee36b014f3daec203f28ba8e02d9))
* close the develop -> main review findings ([5e0046b](https://github.com/Esposter/Esposter/commit/5e0046b1d0170a85ac8537ba9696666300c27e69))
* close the develop-to-main review findings ([3f29155](https://github.com/Esposter/Esposter/commit/3f29155a720cebf09405c443aa1f5e0ffbb4f04e))
* close the remaining develop-to-main review findings ([358e350](https://github.com/Esposter/Esposter/commit/358e3504c273bf91fad6ec96f4d30092d0cc92fa))
* code review comments ([a739015](https://github.com/Esposter/Esposter/commit/a739015af42462afb2890c6532220a86b974b1c9))
* code review comments ([208fbbe](https://github.com/Esposter/Esposter/commit/208fbbe1545def1aa33c701f33124635d707858d))
* code review comments ([96cf103](https://github.com/Esposter/Esposter/commit/96cf103f7fa17f79a8227235ca1017be6aec8785))
* code review comments + refactor away complicated regexes ([eca7d01](https://github.com/Esposter/Esposter/commit/eca7d01d9e2bb8335a75b085604468601c395fb2))
* collapse two duplicated-invariant defects from the seam review ([9f898b3](https://github.com/Esposter/Esposter/commit/9f898b3e435bfd167ded94ecefdcb214bd95fe06))
* deps ([7584a49](https://github.com/Esposter/Esposter/commit/7584a491e73b7c91cf060784e5281b43ff4fc7ae))
* do not append a pathspec to a diff command that cannot take one ([7c89118](https://github.com/Esposter/Esposter/commit/7c89118b0b3b6526229c71f2b1452611ac1c7bbf))
* docs ([f7ae114](https://github.com/Esposter/Esposter/commit/f7ae114e45ec268afb6e23f1219812ed6433c275))
* docs ([2247c95](https://github.com/Esposter/Esposter/commit/2247c951d58cc237a328b1bff17bf3caf6878749))
* docs and workflow ([2b61c7d](https://github.com/Esposter/Esposter/commit/2b61c7d3aad0614799638864a5662f458befc176))
* import VoiceInputMode as value for template member access ([ce5c07c](https://github.com/Esposter/Esposter/commit/ce5c07c5d12cf76f2a30509ee65389f304007401))
* lint ([9859ea5](https://github.com/Esposter/Esposter/commit/9859ea5f49b0ad145c7cbbc10575bbee5033b36f))
* lint ([4c7d254](https://github.com/Esposter/Esposter/commit/4c7d25424784f4632d82778e22b7ece6a48f51c7))
* lint and snapshot ([25e27fd](https://github.com/Esposter/Esposter/commit/25e27fdc7818d37b389c6a7f0c8e0f80c49eddd9))
* lint develop and refresh package size snapshots ([bb0c40e](https://github.com/Esposter/Esposter/commit/bb0c40e872cdb23e03c9ed7c2931b1479310ed8c))
* **lint:** stop oxlint type-aware hang on useFluidSimulator + clear surfaced errors ([404ced5](https://github.com/Esposter/Esposter/commit/404ced53bd00bb2bbf79d15dc3e5079da8881b20))
* narrow the blob deletion payload instead of reaching through the union ([7198911](https://github.com/Esposter/Esposter/commit/7198911fbbaddb326da30f4195f4b8ab487497fa))
* post-merge integration fallout ([d7f882c](https://github.com/Esposter/Esposter/commit/d7f882cbef6cf79fc4aa781366b27a6bababdb47))
* refactor wip ([9d767d4](https://github.com/Esposter/Esposter/commit/9d767d4c8ac150c66eeed49881f8da5120587fd6))
* remaining tests ([7315b02](https://github.com/Esposter/Esposter/commit/7315b0219dbae103cb0461618ae7549e868b7976))
* remove unnecessary lints ([0db3054](https://github.com/Esposter/Esposter/commit/0db3054ddc6808b7cb09912820f66b27d4858450))
* resolve oxlint errors ([d9129c7](https://github.com/Esposter/Esposter/commit/d9129c790a6e01acdba2b769c0b2c8c3907f83d4))
* review findings ([b8da841](https://github.com/Esposter/Esposter/commit/b8da8418d25bf41c671a4ab89fc27c4403615c2f))
* **review:** resolve full-PR review findings with regression tests ([c246edc](https://github.com/Esposter/Esposter/commit/c246edc25e1fe47c58b4cc3e3a06cc5f36fbb24c)), closes [#1017](https://github.com/Esposter/Esposter/issues/1017)
* settle blob fan-outs before rolling back, and gate the publish sweep ([c4a5192](https://github.com/Esposter/Esposter/commit/c4a51925877e87722980a0f8674af63e6597f459))
* snapshot ([57dcbd3](https://github.com/Esposter/Esposter/commit/57dcbd31f24bf074da67269b65076af8d01efc4d))
* snapshots ([633d3f2](https://github.com/Esposter/Esposter/commit/633d3f268b26221a5178efb0b9639480494fc738))
* snapshots ([9e7a603](https://github.com/Esposter/Esposter/commit/9e7a60383e4f2441af13b0283f47faed66cdb39a))
* snapshots ([7e6429c](https://github.com/Esposter/Esposter/commit/7e6429c68b51eb9e6cbf064fab938eee349d87c2))
* snapshots ([1fb43ed](https://github.com/Esposter/Esposter/commit/1fb43ede8f60c88b112083c5f01f06c3d8091808))
* snapshots ([2fefad0](https://github.com/Esposter/Esposter/commit/2fefad023c9fd772c268f592a38a97b2d3df3efd))
* snapshots ([881ecb1](https://github.com/Esposter/Esposter/commit/881ecb15f284319aa6867ccb42b7a7269a9cae66))
* snapshots ([d505054](https://github.com/Esposter/Esposter/commit/d505054f6b852fca4fb57131c682cc8a8e1d7466))
* snapshots ([100c3c0](https://github.com/Esposter/Esposter/commit/100c3c05787c63682b32cabd4dd896cda20fd425))
* snapshots ([1842fc6](https://github.com/Esposter/Esposter/commit/1842fc678909e00dfe32ecaeae3ff373a910321b))
* snapshots ([f5eadf4](https://github.com/Esposter/Esposter/commit/f5eadf4a15126ab6c3de9d088f1419bd6ea625db))
* snapshots ([b7b2153](https://github.com/Esposter/Esposter/commit/b7b21533766668aea7c88ba0527093485614e019))
* snapshots ([e55471d](https://github.com/Esposter/Esposter/commit/e55471d43085dd03cc7f0cc8ba7866e09486767c))
* snapshots ([cb38db4](https://github.com/Esposter/Esposter/commit/cb38db4e0b74a43ad9b5c72828795abc85e4d29e))
* snapshots and options ([e274338](https://github.com/Esposter/Esposter/commit/e2743386cda848caad3377c1b199e7924c2cd0f0))
* snapshots and review wip ([dc3dad0](https://github.com/Esposter/Esposter/commit/dc3dad0c3bb93a3121e82b621a63b2735ff229fc))
* some bugs ([ce9954b](https://github.com/Esposter/Esposter/commit/ce9954b2d1317fee34cf51419e0846ef528168b7))
* submit batches ([b922958](https://github.com/Esposter/Esposter/commit/b922958647d3c5d3085b50aab3b6a82cf728f5f4))
* tests ([097d9e2](https://github.com/Esposter/Esposter/commit/097d9e2014015556c3da43009d71024ae22de2bd))
* tests ([97bdc81](https://github.com/Esposter/Esposter/commit/97bdc81353183907175d54eb2e6f7cd2cd863a4f))
* tests and urls ([c857917](https://github.com/Esposter/Esposter/commit/c85791767dbf80fe9c53c25c3b09b567bd44b750))
* types and tests ([e866d77](https://github.com/Esposter/Esposter/commit/e866d772c57ad1f320603b053674729c11713fb8))
* update scheduled messages ([c7e0cde](https://github.com/Esposter/Esposter/commit/c7e0cde2a04d2d1a7074f6b58504040ada778e28))
* wip ([acf6466](https://github.com/Esposter/Esposter/commit/acf6466c3340699b1ef5593a27cd5ac80f1e2049))
* wip ([60a99b8](https://github.com/Esposter/Esposter/commit/60a99b8dde872db6cbc0dd5ac1e006439f3e2881))
* wip ([b02cc3b](https://github.com/Esposter/Esposter/commit/b02cc3b3d3e90cb6215ccbe21d15c9234cadb765))
* wip ([726c18a](https://github.com/Esposter/Esposter/commit/726c18af1b45b2bc4b438d24f255ba1be69c159d))

### Features

* Add process blob deletion handler ([1d66a2c](https://github.com/Esposter/Esposter/commit/1d66a2c6a445de75e285c5ae2629d75d939c13b0))
* **esbabbler:** thread-follow procedures + auto-follow + reply notifications ([9d5d5c5](https://github.com/Esposter/Esposter/commit/9d5d5c5eeaaefa9348b37b6e6a689876448b1631))
* **infra:** automatic dead-letter replay with attempt cap and quarantine ([4874ab6](https://github.com/Esposter/Esposter/commit/4874ab6677872e4970b54c7c5dfcc2acf5355447))
* **infra:** cap Log Analytics daily ingestion and adaptively sample App Insights ([0dbd500](https://github.com/Esposter/Esposter/commit/0dbd5004f658d9649302b9435c065a47dd6a1f4c)), closes [high-volume](https://github.com/hi/issues/volume)
* **platform:** close the end-to-end survey funnel ([adc0d50](https://github.com/Esposter/Esposter/commit/adc0d50af12103710cbd5a85550d824c38f5deec))
* **platform:** TodoList due reminders ([78089f2](https://github.com/Esposter/Esposter/commit/78089f2475bc87e3070e3db57890d6f4507a282d))
* **resource:** soft delete, favorites, tags, activity log, trigram search ([f741b0f](https://github.com/Esposter/Esposter/commit/f741b0ff4d11082a14be098ab95d3ca9497b06ad))

# [2.35.0](https://github.com/Esposter/Esposter/compare/v2.34.2...v2.35.0) (2026-07-15)

### Bug Fixes

* add db migrations ([fabe3e0](https://github.com/Esposter/Esposter/commit/fabe3e077cf7c464e278f1870600d6f16b9b8f15))
* docs + skills ([fd274a1](https://github.com/Esposter/Esposter/commit/fd274a1db9f48dc3816a4ab00abe718f377605df))
* lint ([b048d55](https://github.com/Esposter/Esposter/commit/b048d55cf7f936c8012587c874607b16caa7f9da))
* lint and tests ([643227b](https://github.com/Esposter/Esposter/commit/643227be2953addc4e7eb0ffbd9db79075273596))
* post-merge integration for esbabbler, platform, and posts branches ([a14af16](https://github.com/Esposter/Esposter/commit/a14af16951d55266948f62c378c7490a6854f166))
* prerender build and migrate script ([4e5f563](https://github.com/Esposter/Esposter/commit/4e5f563ec01bf277c3635594f03f1425a23442b9))
* scripts etc ([e84fe22](https://github.com/Esposter/Esposter/commit/e84fe2275dbb553c45ab5f16dfc438e4940a4dc9))
* snapshot ([1a341c4](https://github.com/Esposter/Esposter/commit/1a341c4e45b737c6550a6c2d1239a6682f0fd0f0))
* snapshot and script ([b2df969](https://github.com/Esposter/Esposter/commit/b2df9695cd825d4a774386621345f5ef4a79d0cb))
* snapshots ([3891df7](https://github.com/Esposter/Esposter/commit/3891df78866019f8f7453875bd8ba733f6277094))
* snapshots ([9764b23](https://github.com/Esposter/Esposter/commit/9764b23ba8be5cb84229baf997f54ce00c9cef98))
* snapshots ([4929c5e](https://github.com/Esposter/Esposter/commit/4929c5ec8bb318e2bc18cfb5b19125858f2f8e9b))
* test bundle size and refactor ([ecd748e](https://github.com/Esposter/Esposter/commit/ecd748e2e964936c9afb3061ae5d57f9bd05547f))
* tests and md ([40c2560](https://github.com/Esposter/Esposter/commit/40c2560782503822ebc6b1d4c0867b40f7c2156c))
* types and partial lint ([b672a10](https://github.com/Esposter/Esposter/commit/b672a10ba489be55b40c1ef11b6aaef4c7e8f233))
* update back the vue-tsc ([eb26324](https://github.com/Esposter/Esposter/commit/eb26324e7910fe40fb49ec3a3bd05f22eccfa255))
* use global crypto.randomUUID in remaining packages ([0c0a671](https://github.com/Esposter/Esposter/commit/0c0a671afa7908bd28785247b5ddc2171d46498b))
* wip ([cf2c92b](https://github.com/Esposter/Esposter/commit/cf2c92b108efb84bad50e151bb749b9cf3257bf8))

### Features

* esbabbler mention badges + push-to-talk keybind with release delay ([3cc0602](https://github.com/Esposter/Esposter/commit/3cc060227b201fcac212b11be6d401312a9b5f74))
* migrate to service bus ([60572d9](https://github.com/Esposter/Esposter/commit/60572d945321e2953abd3bb43f61553c7221f43d))

## [2.34.2](https://github.com/Esposter/Esposter/compare/v2.34.1...v2.34.2) (2026-07-05)

### Bug Fixes

* lint and snapshot ([f97bf86](https://github.com/Esposter/Esposter/commit/f97bf867b5e420c861754bfb0cd9c2a48e9ee1cc))
* tests and types ([67fc659](https://github.com/Esposter/Esposter/commit/67fc6595f40dce01037dee4f1ee5c703b486d26a))

## [2.34.1](https://github.com/Esposter/Esposter/compare/v2.34.0...v2.34.1) (2026-07-04)

**Note:** Version bump only for package @esposter/azure-functions

# [2.34.0](https://github.com/Esposter/Esposter/compare/v2.33.0...v2.34.0) (2026-07-04)

**Note:** Version bump only for package @esposter/azure-functions

# [2.33.0](https://github.com/Esposter/Esposter/compare/v2.32.1...v2.33.0) (2026-07-03)

### Bug Fixes

* cleanup debug logs ([fa0a35d](https://github.com/Esposter/Esposter/commit/fa0a35daae80aadf3d32745aec9b4e5c165cc614))
* snapshot ([3db69f5](https://github.com/Esposter/Esposter/commit/3db69f58d0075b7ce4e1e4613fb1440cc90d6da6))
* snapshot ([cfae1ea](https://github.com/Esposter/Esposter/commit/cfae1ea63019e0b185f29cb25a383f4a05e8d65d))
* tests + add equivalent test ([dce460c](https://github.com/Esposter/Esposter/commit/dce460ced931f719d7b3dbd15ce7cfb2d48500d1))
* tests and snapshot ([ecf9684](https://github.com/Esposter/Esposter/commit/ecf9684d78fe741545cb785392a5dab40be237c3))
* tests wip ([a2f80a8](https://github.com/Esposter/Esposter/commit/a2f80a8ab51913ffc9c4a2f75f18c26ec2311553))

## [2.32.1](https://github.com/Esposter/Esposter/compare/v2.32.0...v2.32.1) (2026-07-01)

**Note:** Version bump only for package @esposter/azure-functions

# [2.32.0](https://github.com/Esposter/Esposter/compare/v2.31.1...v2.32.0) (2026-07-01)

### Bug Fixes

* cleanup configs ([ae8c975](https://github.com/Esposter/Esposter/commit/ae8c975eefa0c621834a8bc23e726a62bade7272))
* snapshot ([5edffe4](https://github.com/Esposter/Esposter/commit/5edffe4988baa8eb26a94ba70daae53ff2c502e6))
* snapshot ([b383bd3](https://github.com/Esposter/Esposter/commit/b383bd394881916ed8fecbbffc639cc7b068dad5))
* snapshot ([241ee84](https://github.com/Esposter/Esposter/commit/241ee8435a9cfa3a524bab20c6b828e8aa883b61))
* snapshot size ([36993db](https://github.com/Esposter/Esposter/commit/36993dbfea849005e0655dfd5684e069cdf35f50))
* test snapshot ([3868551](https://github.com/Esposter/Esposter/commit/386855178a02928c7dfbca551613d7c8566b4c91))
* typedoc ([b2c36fd](https://github.com/Esposter/Esposter/commit/b2c36fd9e5899bba54dd55fe5fdd54c9a2ccf606))

## [2.31.1](https://github.com/Esposter/Esposter/compare/v2.31.0...v2.31.1) (2026-06-25)

**Note:** Version bump only for package @esposter/azure-functions

# [2.31.0](https://github.com/Esposter/Esposter/compare/v2.30.0...v2.31.0) (2026-06-25)

### Bug Fixes

* snapshot ([0518107](https://github.com/Esposter/Esposter/commit/05181071af345cd7ac43d30e06995e4ea14a01a9))
* snapshot ([1e71ddb](https://github.com/Esposter/Esposter/commit/1e71ddb78a3f3189b7b582c0dac308ee44891af8))
* snapshot ([7cd9131](https://github.com/Esposter/Esposter/commit/7cd9131241b3ff293449168624a3f7c094084824))
* snapshot ([fd92834](https://github.com/Esposter/Esposter/commit/fd928348f1649df901999e0d1dbacf557f577c82))
* snapshot ([23eeaa5](https://github.com/Esposter/Esposter/commit/23eeaa5de540983ba42dcdcdffe53ae1cfaa756d))
* wip ([1343361](https://github.com/Esposter/Esposter/commit/1343361ceec9f9638bb9aaaf4e9a30dc394563f3))

# [2.30.0](https://github.com/Esposter/Esposter/compare/v2.29.0...v2.30.0) (2026-06-24)

### Bug Fixes

* annotate webhook field shape inline to satisfy --isolatedDeclarations ([f8e5695](https://github.com/Esposter/Esposter/commit/f8e56953f20ee592492f595cf162b0879cf1ce66))
* explicit ZodObject annotations for isolated-declaration schemas; self-contained sandbox-runtime bundle ([7bf39bc](https://github.com/Esposter/Esposter/commit/7bf39bcb60235cef870fc1dab9abba66fe313390))
* snapshot ([5d9d2f4](https://github.com/Esposter/Esposter/commit/5d9d2f4b84753ff1fc383154157892b0907d519e))
* snapshot ([0de95f8](https://github.com/Esposter/Esposter/commit/0de95f8d67220e1ade49e4c785a5fbe95b880be5))
* snapshot ([7d7d23f](https://github.com/Esposter/Esposter/commit/7d7d23f9c66c66b051a5808e5c5c0c631979666b))

### Features

* sandbox-runtime os backend MVP (bwrap RAM-overlay exec, Linux core) ([8741186](https://github.com/Esposter/Esposter/commit/8741186212042fcb03ba962b88eb438a6d875843))
* voice settings polish, screen-share stop + settings buttons ([64c9d23](https://github.com/Esposter/Esposter/commit/64c9d2342aff1bb565c381c53841afe7856597df))

# [2.29.0](https://github.com/Esposter/Esposter/compare/v2.28.0...v2.29.0) (2026-06-21)

### Bug Fixes

* build ([350c450](https://github.com/Esposter/Esposter/commit/350c45001d722bff225fc2edb8ced2ff0ac098f5))
* pre-commit hook and snapshot ([b98f8bf](https://github.com/Esposter/Esposter/commit/b98f8bf426a97310a72fa3d13914149c965b5fc5))
* resolve azure-functions bundle size snapshot conflict ([08029e9](https://github.com/Esposter/Esposter/commit/08029e90ed7a318352394a8fa5f04fe2c14ef7bb))
* resolve stash pop conflict in azure-functions bundle size snapshot ([994539e](https://github.com/Esposter/Esposter/commit/994539e072fa2d4e44c16afff33467774f9b6bd7))
* snapshot ([cdc2cf2](https://github.com/Esposter/Esposter/commit/cdc2cf201c1bac1b914928a0b9947b29ff5b8a7c))
* snapshot ([5e71088](https://github.com/Esposter/Esposter/commit/5e71088d276cc6808054741523fc7cbf5298f9dc))
* snapshot ([213283f](https://github.com/Esposter/Esposter/commit/213283f347ec562a6d9fa258b6a7f52cdf925f5b))
* snapshot ([826b23b](https://github.com/Esposter/Esposter/commit/826b23b9ce24202af2520e1d93d97cfd820053c7))
* snapshot ([56872be](https://github.com/Esposter/Esposter/commit/56872befb7a1b032a5785f3bf12657b0f0952dc1))
* snapshots ([31ba759](https://github.com/Esposter/Esposter/commit/31ba759434f62d892b198d06e804fe6450acd7e5))
* snapshots ([0ddd898](https://github.com/Esposter/Esposter/commit/0ddd898b947eaa371deb6a5d9172625195af0b67))
* snapshots ([8666a0a](https://github.com/Esposter/Esposter/commit/8666a0ac2dd3b2f520df1b85ce0516cc8ffa281f))
* snapshots ([09c47ef](https://github.com/Esposter/Esposter/commit/09c47efabb36b6ec540edfd6065a70c303938dc2))
* tests + remove unnecessary plugin ([420448a](https://github.com/Esposter/Esposter/commit/420448a450ce2056c68566e5da8326dbf1f9b700))
* tests and push notifs for webhooks ([c88d5e6](https://github.com/Esposter/Esposter/commit/c88d5e6985276d33a23047479da76650f5dcfbc1))
* unifying vitest ([8e3e6bf](https://github.com/Esposter/Esposter/commit/8e3e6bf186a7fecbd3054cf5b9e80e5763d3c8b0))

### Features

* **esbabbler:** DB-backed Discord-style user-settings surface ([b61bf66](https://github.com/Esposter/Esposter/commit/b61bf6649da89c1be1d1c38feef41bfe31c44dda))
* **infra:** finalize GitHub provider (v12) and harden repo settings ([76c6d98](https://github.com/Esposter/Esposter/commit/76c6d982bde4edf2c1c1319a53488c658e77720f))

# [2.28.0](https://github.com/Esposter/Esposter/compare/v2.27.0...v2.28.0) (2026-06-14)

### Bug Fixes

* add remaining tests ([4d0fc50](https://github.com/Esposter/Esposter/commit/4d0fc50c6248ced2e375e6444e8b9b71e675af84))
* cleanup code ([c377566](https://github.com/Esposter/Esposter/commit/c37756616760798a63929f537ae52300a27dbbef))
* cleanup remaining syntax ([06d4bfe](https://github.com/Esposter/Esposter/commit/06d4bfeb8a7cacd9b629ca43c9243e0c30b59113))
* cleanup test to cover all scenarios ([1e7e7b2](https://github.com/Esposter/Esposter/commit/1e7e7b2a344b4d60b42b4ff208c84f7734c2e53f))
* code review comments ([3c654a9](https://github.com/Esposter/Esposter/commit/3c654a9376d85ff05d8e69acf372aca775830c6a))
* code review comments ([09db4c9](https://github.com/Esposter/Esposter/commit/09db4c906ae9458021c0ea3c2960e798c516e7a4))
* code review comments ([61cbffd](https://github.com/Esposter/Esposter/commit/61cbffd5767549d1a787bbd3bc0193bfd78733d4))
* duration + hopefully azure-functions ([dd1f905](https://github.com/Esposter/Esposter/commit/dd1f90595f65a918da7e89a75844112b949d876e))
* lint and types ([dbd2cff](https://github.com/Esposter/Esposter/commit/dbd2cff9011d99d9fd6afa1a855a8a40a56673f7))
* namings and warnings and types ([3858148](https://github.com/Esposter/Esposter/commit/38581482435dd67ace3fa9e8c825faa4233275c5))
* schemas ([f939bcb](https://github.com/Esposter/Esposter/commit/f939bcb5e32119e9cc7f6aebb62780dc61530e3c))
* snapshot ([0750997](https://github.com/Esposter/Esposter/commit/0750997e2392a4228fbd6acdda6103e822c9d299))
* snapshots ([84a2865](https://github.com/Esposter/Esposter/commit/84a2865faec03c9757cafdda983cecd7351c5699))
* snapshots and dev env for now ([c774f1c](https://github.com/Esposter/Esposter/commit/c774f1c58f72f5274c74bc97eca204d30bbc09ee))
* snapshots and tests ([9b2a6f2](https://github.com/Esposter/Esposter/commit/9b2a6f2102395a230ef4cd0b1f3a31fe37408c08))
* test ([e7d7a11](https://github.com/Esposter/Esposter/commit/e7d7a11d153fbb222348e6d6644ebd0baa849ede))
* test ([59c5383](https://github.com/Esposter/Esposter/commit/59c5383481eb48ed0584811fe3b95f76be94cf7f))
* tests ([2e5f9c1](https://github.com/Esposter/Esposter/commit/2e5f9c1432db06ae4999bec994bbe161d1dbcf2d))
* tests ([3c2a09b](https://github.com/Esposter/Esposter/commit/3c2a09bc8610503f6e2e925c6d4f029e87951c8f))
* tests and cleanup settings ([a0646c4](https://github.com/Esposter/Esposter/commit/a0646c454006cf2c074c5db89ae912e4e3b08876))
* tests wip ([c257bfb](https://github.com/Esposter/Esposter/commit/c257bfb9055d401ec66377ff3f05a13be42f9abc))
* try not using encoding base 64 ([0ecab21](https://github.com/Esposter/Esposter/commit/0ecab2141a372ace60e2183ae6b79a1d310da409))
* types and migration ([f9b7d92](https://github.com/Esposter/Esposter/commit/f9b7d92c58f4d1fae9ff03e4fa09587e49ef975b))
* update deps ([7ee5e2e](https://github.com/Esposter/Esposter/commit/7ee5e2e051909f5a76effa03b40f1d1b52a22ca2))
* wip ([fb38ad5](https://github.com/Esposter/Esposter/commit/fb38ad5ea5f2bc5fef84aa2fead3df34b262130c))
* wip ([ffb8b3e](https://github.com/Esposter/Esposter/commit/ffb8b3e25832225b6f177e9a8d331ea1bf813f09))
* wip tests ([4eee636](https://github.com/Esposter/Esposter/commit/4eee63667def07f45e40499e2bb8cddc2d51e001))

### Features

* wip ([4f094da](https://github.com/Esposter/Esposter/commit/4f094da70109cc17533f2e6d70bd995fac477d0d))

# [2.27.0](https://github.com/Esposter/Esposter/compare/v2.26.0...v2.27.0) (2026-06-05)

### Bug Fixes

* deps + snapshot ([6840d8c](https://github.com/Esposter/Esposter/commit/6840d8ccb08baf73483027684067ced234b67a7c))
* snapshot ([7ae781a](https://github.com/Esposter/Esposter/commit/7ae781a54fdb09bfe998ef544596609ac893c2ee))
* tests and lint ([59bcf59](https://github.com/Esposter/Esposter/commit/59bcf59310701d7a1b49934bec2217ce3d77fc42))
* types ([cb3ac38](https://github.com/Esposter/Esposter/commit/cb3ac38452ba5c7f0253c4eccfdf9266997e272c))

# [2.26.0](https://github.com/Esposter/Esposter/compare/v2.25.0...v2.26.0) (2026-06-01)

### Bug Fixes

* add isWindows check ([2b101a5](https://github.com/Esposter/Esposter/commit/2b101a5b8d67bb0751d1c7ef01b0253e6aef8190))
* delete if exists mock ([7515580](https://github.com/Esposter/Esposter/commit/751558025e548c9b63b7fa1279f64a96445209c5))
* lint and test snapshots to include linux ([2389fbc](https://github.com/Esposter/Esposter/commit/2389fbc9f692c65fcff37f5e4e766af6b3e3f722))
* push subcriptions and notif bugs ([50bda79](https://github.com/Esposter/Esposter/commit/50bda79f22177aa6976c25290264244c76c9dae3))
* sanitize message ([d52c8be](https://github.com/Esposter/Esposter/commit/d52c8be322eb973a411f4218b5e5f6237bc376d3))
* snapshot ([34c87bd](https://github.com/Esposter/Esposter/commit/34c87bdccf8a1177d7d63a5dc28f82af615c93b3))
* snapshot ([14eac02](https://github.com/Esposter/Esposter/commit/14eac0235db8e5b2e95b4f9887e084391b6d7325))
* tests ([1f10236](https://github.com/Esposter/Esposter/commit/1f10236637acb9c78de2d2b876534e6474c2f743))
* tests ([f6db3be](https://github.com/Esposter/Esposter/commit/f6db3bec16323874196b7354f2611f7b146edac5))
* tsconfig ([976e797](https://github.com/Esposter/Esposter/commit/976e79781ed30784a59412aa44c1af8f33ebe4fa))
* wip tests ([87dcb4d](https://github.com/Esposter/Esposter/commit/87dcb4db2a8b0b2d3de7d9eca87d6daab9a47056))

### Features

* Add bundle tests + fix up mocking ([b6db055](https://github.com/Esposter/Esposter/commit/b6db055d8d087fc7cc61e3226939d41d8817f730))

# [2.25.0](https://github.com/Esposter/Esposter/compare/v2.24.0...v2.25.0) (2026-05-21)

### Bug Fixes

* externalize @azure/functions to include Worker.js in deployment ([2461160](https://github.com/Esposter/Esposter/commit/2461160677af3f5f2c47a7cdaf41212fb063a7ca))
* remove unnecessary env ([35eeaea](https://github.com/Esposter/Esposter/commit/35eeaea785c03a5922b053a9557767ac8f2f4a98))

# [2.24.0](https://github.com/Esposter/Esposter/compare/v2.23.0...v2.24.0) (2026-05-15)

### Bug Fixes

* code review comments ([f759f5d](https://github.com/Esposter/Esposter/commit/f759f5d5b42e5596495f51f0cf07c1b3091ec3ce))
* typechecking and code review comments ([2a85e3f](https://github.com/Esposter/Esposter/commit/2a85e3fe2652b11a563b91e1749a6f1ce38be6dc))

# [2.23.0](https://github.com/Esposter/Esposter/compare/v2.22.0...v2.23.0) (2026-05-07)

### Bug Fixes

* add back type expect error ([9e3cf6f](https://github.com/Esposter/Esposter/commit/9e3cf6fd306b0faf14b5f1d5a3b00a5e30d74d5b))
* code review comments ([680b85e](https://github.com/Esposter/Esposter/commit/680b85ec2fd3d4fcb178b10b6c3b75495382b5ca))
* code review comments ([4ab7a46](https://github.com/Esposter/Esposter/commit/4ab7a460facafb0a35aa65cac34333f2cc1415d4))
* lint ([f6e79f4](https://github.com/Esposter/Esposter/commit/f6e79f496c45f0d7369e7a288891846d6325bd3f))
* lint ([3bbfdde](https://github.com/Esposter/Esposter/commit/3bbfdde3f875510a46c378a3df8639fdec2e739e))
* lint wip ([8acd30e](https://github.com/Esposter/Esposter/commit/8acd30e554910d92719864b0f706e78833d27ebc))
* remaining migrations ([14c864f](https://github.com/Esposter/Esposter/commit/14c864f5b31a0c61544e07bd34ea18bbd9df1af2))
* types ([1609a7c](https://github.com/Esposter/Esposter/commit/1609a7c695c72bc3d2804c4bb5f2c849e374e029))
* use ts-ignore to skip typedoc until ts-go support ([d74b67c](https://github.com/Esposter/Esposter/commit/d74b67cf8da227b10b643d5afdfcd1cb05458da1))
* wip ([26a6fe1](https://github.com/Esposter/Esposter/commit/26a6fe1952674dac4cbf798b6129806c16eb198a))

### Features

* upgrade drizzle ([17b9f41](https://github.com/Esposter/Esposter/commit/17b9f41b180ba109382d34e9507ead13cbbb95b2))

# [2.22.0](https://github.com/Esposter/Esposter/compare/v2.21.0...v2.22.0) (2026-04-28)

### Bug Fixes

* bugs ([70417cd](https://github.com/Esposter/Esposter/commit/70417cd42515c5cfee36d179f75d8b46898cbfda))

* get structured text ([63fbd76](https://github.com/Esposter/Esposter/commit/63fbd76f44462a71cb8aebfab34d15bf013fb92f))

* push subscription rename ([83dce01](https://github.com/Esposter/Esposter/commit/83dce014c94ee7b1db33933a54e3eadb48d5ac9e))

* types and lint ([ad56572](https://github.com/Esposter/Esposter/commit/ad56572087670f66d878cfa8f1778a78582c950b))

* webhooks relation types as well as drizzle types ([6aaa379](https://github.com/Esposter/Esposter/commit/6aaa37935553103c7cb79829cf7e7fc1475356fc))

# [2.21.0](https://github.com/Esposter/Esposter/compare/v2.20.0...v2.21.0) (2026-04-15)

### Bug Fixes

* lint and code review comments ([f476766](https://github.com/Esposter/Esposter/commit/f476766af58ddcaa125faddf83dcd569cc164329))

* review comments ([2396844](https://github.com/Esposter/Esposter/commit/23968440ae923c0fd1d1fce3d178eb69c31485c4))

### Features

* add friend request notification ([3bbd448](https://github.com/Esposter/Esposter/commit/3bbd448dcc23330bee926215d8ad196ce0388c94))

# [2.20.0](https://github.com/Esposter/Esposter/compare/v2.19.2...v2.20.0) (2026-03-29)

### Bug Fixes

* format + fix up some ignores ([6cd632f](https://github.com/Esposter/Esposter/commit/6cd632ff672ad8e0adee51b42cb6f6925f894b96))

### Features

* Add oxlint type aware ([eb40e2d](https://github.com/Esposter/Esposter/commit/eb40e2d7da8c606c66053582284264e0fb3a2592))

* migrate to oxfmt ([e7a0212](https://github.com/Esposter/Esposter/commit/e7a0212f9ec18d7193c96cc6069ac6ecf168e8bb))

* switch to tsgo ([1e504b3](https://github.com/Esposter/Esposter/commit/1e504b3a6ce5144dadbdd9bc543018a35e7b6808))

## [2.19.2](https://github.com/Esposter/Esposter/compare/v2.19.1...v2.19.2) (2026-02-05)

**Note:** Version bump only for package @esposter/azure-functions

## [2.19.1](https://github.com/Esposter/Esposter/compare/v2.19.0...v2.19.1) (2026-02-05)

**Note:** Version bump only for package @esposter/azure-functions

# [2.19.0](https://github.com/Esposter/Esposter/compare/v2.18.2...v2.19.0) (2026-02-05)

### Bug Fixes

* update rolldown-plugin-dts and remove resolve option ([251fe7d](https://github.com/Esposter/Esposter/commit/251fe7d7811121e514fcadaafeafd20a6460dca4))

## [2.18.2](https://github.com/Esposter/Esposter/compare/v2.18.1...v2.18.2) (2025-12-10)

**Note:** Version bump only for package @esposter/azure-functions

## [2.18.1](https://github.com/Esposter/Esposter/compare/v2.18.0...v2.18.1) (2025-12-10)

**Note:** Version bump only for package @esposter/azure-functions

# [2.18.0](https://github.com/Esposter/Esposter/compare/v2.17.0...v2.18.0) (2025-12-10)

### Bug Fixes

* imports ([f953ac2](https://github.com/Esposter/Esposter/commit/f953ac249d0881c59e6dfaf2dc7f0581cb333c13))

* types ([aada69f](https://github.com/Esposter/Esposter/commit/aada69f31c3e199bd814e013883462b0b7f7fcd5))

* use esm imports ([e583736](https://github.com/Esposter/Esposter/commit/e5837369bff15c20868d9486d93bf5192c48c58c))

### Features

* Add endpoints for user room settings ([316ccff](https://github.com/Esposter/Esposter/commit/316ccff0a3fb23f701778b1004a1af0bf0d7de34))

# [2.17.0](https://github.com/Esposter/Esposter/compare/v2.16.0...v2.17.0) (2025-11-03)

### Bug Fixes

* don't send notif to self ([eb5be0d](https://github.com/Esposter/Esposter/commit/eb5be0dece285943425a09199ac6a5a74f701bfd))

* event type ([724851d](https://github.com/Esposter/Esposter/commit/724851d2b4c600acd49cbb24ef305a93e5167463))

* export default ([8cc1e6a](https://github.com/Esposter/Esposter/commit/8cc1e6a35c92e91235b6d7a4c35f4c3c17dc166e))

* make polling period 5min to not sync with storage queue too much ([ea6440b](https://github.com/Esposter/Esposter/commit/ea6440bd82729debf411ec38f49cbf2bce44dffb))

* move rate limit to backend api ([ba62838](https://github.com/Esposter/Esposter/commit/ba6283886ea1407bc68fa7b26b070a03ff98c2ec))

* package name ([8e49e40](https://github.com/Esposter/Esposter/commit/8e49e40fd3f3b267c01c7bf794f429861c6c587c))

* process env ([a7924d5](https://github.com/Esposter/Esposter/commit/a7924d5d07f17bb83e7d5b84f4d6fb442ddbc0b0))

* properly await ([157d6c0](https://github.com/Esposter/Esposter/commit/157d6c02b75aa024ee7c40a20ebae00862aa26e0))

* proxy webhook request ([5954c95](https://github.com/Esposter/Esposter/commit/5954c95b326b85aa091e17d595fd50dd908a73b4))

* remove old build ([2ab799f](https://github.com/Esposter/Esposter/commit/2ab799f5dab1db8107ec285eec8cdbf0aa124da7))

* revert back to module ([1635ca2](https://github.com/Esposter/Esposter/commit/1635ca22d4b3e2c907e58f4788673504ba0b4f95))

* use managed identity instead ([ca191c3](https://github.com/Esposter/Esposter/commit/ca191c364ef9965bf9f14985fe058d4667f5e958))

### Features

* Add mock queue client ([079340a](https://github.com/Esposter/Esposter/commit/079340a01b61f47cb0ac753cc811de5676dc0e65))

* Add process push notifications + move to azure-functions pkg ([090f045](https://github.com/Esposter/Esposter/commit/090f0457b1131b376eab5d704ee2d319a5533ed4))

* Add queue pushing ([5bf052a](https://github.com/Esposter/Esposter/commit/5bf052a89762871279ce4c310d11c6060097cf45))

* migrate to event grid instead of storage queue ([6987115](https://github.com/Esposter/Esposter/commit/69871155a7f1114cb62229173c4c70a7f3ce1d81))

# [2.16.0](https://github.com/Esposter/Esposter/compare/v2.15.1...v2.16.0) (2025-10-19)

### Bug Fixes

* Add expiration time too ([1e6f25d](https://github.com/Esposter/Esposter/commit/1e6f25d6ac4fb543978167c09dad47e2f066b74d))

* add export to make it a module ([83456ea](https://github.com/Esposter/Esposter/commit/83456ea7991238a5d74a4628971e1d19c5469089))

* bundle in node env ([c360f92](https://github.com/Esposter/Esposter/commit/c360f92cb378bf63eedb0c72af5eecf72829a407))

* cleanup input to grab from payload better ([4bb8d58](https://github.com/Esposter/Esposter/commit/4bb8d58d57f82f6195461dc5af506e24ef3e3508))

* cleanup packages to have peer deps for db-schema ([b5ffa35](https://github.com/Esposter/Esposter/commit/b5ffa35df2c5d61c7eba8104c911b82cd75a4525))

* consume id instead ([6220b86](https://github.com/Esposter/Esposter/commit/6220b862ad6bf171941f3d0cde187832a568e71e))

* don't need to stringify in send to all ([4e7a409](https://github.com/Esposter/Esposter/commit/4e7a40973c9b40da8e068a44e529965072462862))

* filter unnecessary dts ([151f658](https://github.com/Esposter/Esposter/commit/151f65854ce3a9bcfd1f4cfc5086642d25781ad7))

* logging ([38bb23a](https://github.com/Esposter/Esposter/commit/38bb23ae2d68de2223f3e93ffc589ee156005085))

* settings ([dd7c131](https://github.com/Esposter/Esposter/commit/dd7c131e523237500941b2ade51b52692a0cba1e))

* type and reduce host logs ([3f01b23](https://github.com/Esposter/Esposter/commit/3f01b23a691401284d04e6f80bd9291c587210ef))

### Features

* Add web pubsub ([bf65e17](https://github.com/Esposter/Esposter/commit/bf65e170039e7307b9ec24792176b883206dbeb8))

* Add web push to azure func ([cda5d52](https://github.com/Esposter/Esposter/commit/cda5d529235d8d317fb9cd615969cfd68443e697))

### Performance Improvements

* externalise common packages to minimize space ([62b4756](https://github.com/Esposter/Esposter/commit/62b475665ee55ec26f6a698c97df8bd60dd31723))

## [2.15.1](https://github.com/Esposter/Esposter/compare/v2.15.0...v2.15.1) (2025-10-10)

### Bug Fixes

* split to db-schema pkg that is browser-friendly ([549fcac](https://github.com/Esposter/Esposter/commit/549fcacfe755039fb2a85e17baaa11f2ddfc6d4f))

# [2.15.0](https://github.com/Esposter/Esposter/compare/v2.14.0...v2.15.0) (2025-10-09)

### Bug Fixes

* add .funcignore in files ([a9d5e50](https://github.com/Esposter/Esposter/commit/a9d5e5020484b5bf616459440b2f430cbf42a894))

* add funcignore ([b7ec561](https://github.com/Esposter/Esposter/commit/b7ec561fcec01e9ceee2221dabf5ebd558fabe06))

* add oxlint to funcignore ([5f7b573](https://github.com/Esposter/Esposter/commit/5f7b57366336f6819cabefa7c787cd3b430c7186))

* add rate limit ([197a1a4](https://github.com/Esposter/Esposter/commit/197a1a458c466898aa2379732a0ef1db5fbda7bc))

* bundle libs that are in node to be in node platform ([92c3875](https://github.com/Esposter/Esposter/commit/92c38752e6d5e2a481f0a2107d7143e00fe4e14d))

* cleanup funcignore ([baef9d3](https://github.com/Esposter/Esposter/commit/baef9d3f1ed7e57862c4ff96dbe11ffcb8d1042a))

* cleanup webhook params ([d6929e2](https://github.com/Esposter/Esposter/commit/d6929e2347c768940a8d3470b135348241873967))

* docs ([50d1d40](https://github.com/Esposter/Esposter/commit/50d1d4081abefdbd5956198b0b1fdac11cf59f4c))

* export process web hook as well ([dda2b26](https://github.com/Esposter/Esposter/commit/dda2b26e7959fa2733297b6f37c13e28ff96a9b0))

* lint ([290b6a4](https://github.com/Esposter/Esposter/commit/290b6a4d0d22fcb500ed271653e8b1c84c2a4a87))

* move deps back to respective packages properly ([5a55e2d](https://github.com/Esposter/Esposter/commit/5a55e2d29f3de9d88bb68779780e983e9388457f))

* only consume after pass check ([3c1c08e](https://github.com/Esposter/Esposter/commit/3c1c08e0b30473d2eccf805e070ffe9e6c148315))

* package json ([f3fbfed](https://github.com/Esposter/Esposter/commit/f3fbfedc9772b653d34b2f2621d9dbf2612c3bd1))

* properly parse id ([2e4524f](https://github.com/Esposter/Esposter/commit/2e4524feb48ca68b653d246a6c8e8f70dfca584b))

* put funcignore at root ([d7e161b](https://github.com/Esposter/Esposter/commit/d7e161b8747609d68315b7ecdaeaac2d7070c6f6))

* queue webhook ([19a44c6](https://github.com/Esposter/Esposter/commit/19a44c69ea5646ce27b379c5618fcc03d6907cb5))

* remove unnecessary settings ([92066fc](https://github.com/Esposter/Esposter/commit/92066fced3f2d1f66755dff560e9c2d6e806a9d5))

* respect funcignore ([a3a7b96](https://github.com/Esposter/Esposter/commit/a3a7b96553a08e7a6449cd0b6b3c0f0912ed2817))

* save file ([4f36663](https://github.com/Esposter/Esposter/commit/4f366638340e567411a6acb3752f4e838d3cb4d8))

* set extra output ([bd93708](https://github.com/Esposter/Esposter/commit/bd937089a617a0cb87a2ebcb6cc9d7b5f05344ed))

* tsconfig ([024e507](https://github.com/Esposter/Esposter/commit/024e5075519528486f3c8325b7e8b530664fa441))

* update host.json ([0e6d65e](https://github.com/Esposter/Esposter/commit/0e6d65e05766fa39c8462ad3de72a6b08ae979c5))

* use isolated tsconfig ([665b7c2](https://github.com/Esposter/Esposter/commit/665b7c2964f0c36f60564eae3c3e79fcf630c709))

### Features

* Add proper process web hooks ([05d53c6](https://github.com/Esposter/Esposter/commit/05d53c61ec08fa620d20e8ad0ea9ed756843ebce))

* Add webhook pkg ([ae1477f](https://github.com/Esposter/Esposter/commit/ae1477f28b6b6df94da98cec1c944ff9de96e258))

* Add webhook schema ([501b9ce](https://github.com/Esposter/Esposter/commit/501b9ce2e1c3f43869ac954cdc449202c781d119))

* finally enable azure functions to use drizzle ([85471bd](https://github.com/Esposter/Esposter/commit/85471bd2246ca426084b0e78e356d21a0d1e03f8))

* migrate to new db schema ([4c63fbe](https://github.com/Esposter/Esposter/commit/4c63fbe289ce89ed18001e09cf6970501a15c9bb))
