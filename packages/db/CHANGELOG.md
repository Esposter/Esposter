# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.39.0](https://github.com/Esposter/Esposter/compare/v2.38.1...v2.39.0) (2026-09-04)

### Bug Fixes

* **azure-functions:** declare the entry point the Functions host loads ([b3a3721](https://github.com/Esposter/Esposter/commit/b3a3721bd388d0787c4d5e483dddccb27f59f431))
* **azure-functions:** key the drain on lastModified and claim each blob ([1557775](https://github.com/Esposter/Esposter/commit/155777568d3abbc89214d1c4e801488a79e3535f))
* **build:** every package answers the side-effects question ([ecb4dc1](https://github.com/Esposter/Esposter/commit/ecb4dc1d6fb1610cb446fc0560a5ba62dca22f81))
* charge the counter on every save, not just the blob's first ([72d6a33](https://github.com/Esposter/Esposter/commit/72d6a33b1f85054f599fbfaa28ce8a18a7c13fd3))
* **ci:** the checks pass on the tree the snapshot work left ([acd98a2](https://github.com/Esposter/Esposter/commit/acd98a2753b981c618d0632f9950e52f7614a033))
* **ci:** unbreak the function deploy pnpm 12 broke, and pin the rule ([6c874d2](https://github.com/Esposter/Esposter/commit/6c874d274abeab8072e782838c709f9db86bff7f))
* **db:** vendor link-preview-js so no consumer interops with its CJS barrel ([99cd1f1](https://github.com/Esposter/Esposter/commit/99cd1f1a352f4d14ce1047fc9118939e8b53f8e4))
* **message:** follow the thread a scheduled reply lands in ([0349e7f](https://github.com/Esposter/Esposter/commit/0349e7fec190c0fbd9c256548e36a5e0b7245d2c))
* **platform:** a deleted mock blob takes its metadata with it ([7d95802](https://github.com/Esposter/Esposter/commit/7d9580231534f4b75e3a26d35b684260b149192b))
* **platform:** the storage meter hears the counter its other process moves ([4cf9866](https://github.com/Esposter/Esposter/commit/4cf98664f7ebb9afd4ebccc74a2987d0c7bb7a7a))
* **storage:** address the review — badge guards, a queued badge write, and docs ([b3688f9](https://github.com/Esposter/Esposter/commit/b3688f935746e92ea8e4fdb7e02180c6167ab8e7))
* **storage:** drop a provisional charge once an event has settled the blob ([c5f83fb](https://github.com/Esposter/Esposter/commit/c5f83fb3495d26c157a5388dede35ae96e96cf9a))
* **storage:** reject a BlobCreated event older than the one already applied ([6ec9ce8](https://github.com/Esposter/Esposter/commit/6ec9ce891ae2cf1a3f2f1ec27b8f78b405891ef5))
* **virrun:** isSnapshotLowerPath is a field, so it keeps its `is*` ([02554e7](https://github.com/Esposter/Esposter/commit/02554e74026ed401fdbe39be7304d0af4636fafc))

### Features

* **storage:** charge a resource's own content blob to its owner ([245902d](https://github.com/Esposter/Esposter/commit/245902d9818693374b8f79ed965839240b274cc0))

### Performance Improvements

* **platform:** a private package emits no declarations ([fa31aa4](https://github.com/Esposter/Esposter/commit/fa31aa4b26d5ba1d3e1573e2d1464990dd9272cb))
* **platform:** the build generates its own barrel, and skips it when it can ([696835c](https://github.com/Esposter/Esposter/commit/696835c457837d8737b8cd09b940dc97577cfc24))

## [2.38.1](https://github.com/Esposter/Esposter/compare/v2.38.0...v2.38.1) (2026-08-23)

### Bug Fixes

* **build:** keep workspace source out of Node's own module loader ([4c3bfdd](https://github.com/Esposter/Esposter/commit/4c3bfddaf246c21f03d103a7aac44c7de9b8f97d))

# [2.38.0](https://github.com/Esposter/Esposter/compare/v2.37.2...v2.38.0) (2026-08-23)

### Bug Fixes

* answer the docs review, and correct three claims it caught ([934d624](https://github.com/Esposter/Esposter/commit/934d624f43ef339ea14f2b8e0b29867611c3f8ba))
* **db:** reshape the clause serializer the autofix flattened ([4f595c4](https://github.com/Esposter/Esposter/commit/4f595c4463a6caa53dbf7a6e4c30b8de75566c5f))
* green up CI, and close the review findings it did not catch ([dde8ffe](https://github.com/Esposter/Esposter/commit/dde8ffebb357415245186d6e803242608bcaf53e))
* **pagination:** single-flight the appending read ([18a343e](https://github.com/Esposter/Esposter/commit/18a343ee4b3c4f1614b26f5f9cbc76f7e9a9eec0))

### Features

* **search:** allow many filters of one type, and add has:file ([6cd4b39](https://github.com/Esposter/Esposter/commit/6cd4b390abfd99b8a6aced9a6ffb5846d4575682))

## [2.37.2](https://github.com/Esposter/Esposter/compare/v2.37.1...v2.37.2) (2026-08-14)

**Note:** Version bump only for package @esposter/db

## [2.37.1](https://github.com/Esposter/Esposter/compare/v2.37.0...v2.37.1) (2026-08-14)

**Note:** Version bump only for package @esposter/db

# [2.37.0](https://github.com/Esposter/Esposter/compare/v2.36.0...v2.37.0) (2026-08-14)

### Bug Fixes

* **azure:** distinguish an absent entity from a read that failed ([696379f](https://github.com/Esposter/Esposter/commit/696379f253dad65af6b6655a37bff2e9b055fdd9))
* **build:** stop the shared build preset from squatting on configuration's own build config ([7926319](https://github.com/Esposter/Esposter/commit/792631944592810a2a60eb24184fdd0c3de45555))
* code review comments ([813b854](https://github.com/Esposter/Esposter/commit/813b854939772e4f8600b85116a22dfbe6374d2b))
* lint and snapshots ([bb38abb](https://github.com/Esposter/Esposter/commit/bb38abbab7430f5d86d8b2eecf744d2648c0c062))
* **message:** stop votes deleting poll labels and re-following unfollowers ([10a997c](https://github.com/Esposter/Esposter/commit/10a997c546f064774e5ea8b45ab1763d8e817086))
* **platform:** close the storage-quota review findings ([bb01ac6](https://github.com/Esposter/Esposter/commit/bb01ac6a74405af5d71debd46b7a30b5f811c1a2))
* **platform:** correct the residual-quota-gap bound, lock users in a fixed order ([a707ea0](https://github.com/Esposter/Esposter/commit/a707ea05686587a72228e645306e6da317970cc9))
* **review:** address remaining CodeRabbit cleanup findings ([fd8aa84](https://github.com/Esposter/Esposter/commit/fd8aa845975f6b808ce5e324243af702792e4a29))
* **shared:** rewrite jsonDateParse's reviver as guard clauses ([cd922c9](https://github.com/Esposter/Esposter/commit/cd922c90dbc70cd4aace6b4cb9c8dc762ef92943))
* snapshots ([cd704f9](https://github.com/Esposter/Esposter/commit/cd704f9b200ead2ba85221f5c1d62e80aba0872c))
* snapshots ([7d52b59](https://github.com/Esposter/Esposter/commit/7d52b597a8a64a74a43611035e90b4dbafe35448))
* test renames ([c106891](https://github.com/Esposter/Esposter/commit/c1068915c3c9e9f277332641a328e010ea7abe33))

### Features

* **platform:** enforce per-user blob storage quotas ([d6aab71](https://github.com/Esposter/Esposter/commit/d6aab71ecf5565cf287a63e43cc4e18214f12368))

# [2.36.0](https://github.com/Esposter/Esposter/compare/v2.35.0...v2.36.0) (2026-07-30)

### Bug Fixes

* add tests ([93eaa1f](https://github.com/Esposter/Esposter/commit/93eaa1f93a329ae1ed5c4fd52664e49b87be998e))
* address code review findings on blob lifecycle and attachment urls ([b6213bf](https://github.com/Esposter/Esposter/commit/b6213bfb0d8f9d8544051da920c0abe2718a5d2c))
* address CodeRabbit PR 1008 review findings and lint ([91a43f8](https://github.com/Esposter/Esposter/commit/91a43f8724a09b2b56a61564b91e7dfa4805d42b))
* address CodeRabbit review findings ([41c7088](https://github.com/Esposter/Esposter/commit/41c70882200152677be4c64cf2acc462331f4d27))
* address post-merge code review findings ([548024d](https://github.com/Esposter/Esposter/commit/548024df27a73e4b9a8f1467c91717c734021812))
* address PR 1000 and 1003 post-merge review findings ([17cfed0](https://github.com/Esposter/Esposter/commit/17cfed06cbf6deca727410d1176a4d80e9c5d12b))
* address PR 1001 and 1003 post-merge review findings ([ad04d84](https://github.com/Esposter/Esposter/commit/ad04d8494b14f86b567b1f0be766ee22a9d026ad))
* address PR 1004 code review findings ([7d79608](https://github.com/Esposter/Esposter/commit/7d7960882836e1e3bffb7e8ccf46f1e192a05583))
* address PR 1008 workflow review findings ([4f7eb9d](https://github.com/Esposter/Esposter/commit/4f7eb9d09d62c118171462ad487456e3ef01d8db))
* anchor the asset url, attribute the automod log, age-gate the reaper ([aac93e1](https://github.com/Esposter/Esposter/commit/aac93e17e85221d9e964c27ba3a9bfb176072238))
* CI failures, CodeRabbit findings, and Basic-tier reminder dedupe ([96fd87a](https://github.com/Esposter/Esposter/commit/96fd87a1af102dd0314d60b040d3199e546848aa))
* clear a partial clone instead of stranding what it wrote ([4eca633](https://github.com/Esposter/Esposter/commit/4eca6331da64fd75383b50f36828141d3a12d045))
* clear the remaining confirmed findings from the seam review ([8709cd8](https://github.com/Esposter/Esposter/commit/8709cd8b0687e32fdbec8320bfc0d661c916d043))
* close the blob-delete gaps this review found ([08f6c83](https://github.com/Esposter/Esposter/commit/08f6c830c439fc96010bb94aefa16908b76bf75d))
* close the CodeRabbit items the earlier rounds left open ([7288f94](https://github.com/Esposter/Esposter/commit/7288f9446b264c53260f0e27ef62f127df18e04f))
* close the defects the develop -> main review found ([2b05608](https://github.com/Esposter/Esposter/commit/2b0560891365eaeade126e5f76ae33ca9982d258))
* close the defects the develop-to-main review found ([494120b](https://github.com/Esposter/Esposter/commit/494120bf742e6946cc347867187f66e91e2d7a91)), closes [#1029](https://github.com/Esposter/Esposter/issues/1029)
* close the defects the previous fix round introduced ([d7676dc](https://github.com/Esposter/Esposter/commit/d7676dcd3604ee36b014f3daec203f28ba8e02d9))
* close the develop -> main review findings ([5e0046b](https://github.com/Esposter/Esposter/commit/5e0046b1d0170a85ac8537ba9696666300c27e69))
* close the develop-to-main review findings ([3f29155](https://github.com/Esposter/Esposter/commit/3f29155a720cebf09405c443aa1f5e0ffbb4f04e))
* close the second CodeRabbit round on the develop -> main PR ([df4b09b](https://github.com/Esposter/Esposter/commit/df4b09ba3423f96d6e60a77805f44e42ed87771a))
* close the third CodeRabbit round on the develop -> main PR ([cd144f0](https://github.com/Esposter/Esposter/commit/cd144f0ed9865c8885d21248a52031ffb4409cdd))
* code review comments ([a739015](https://github.com/Esposter/Esposter/commit/a739015af42462afb2890c6532220a86b974b1c9))
* code review comments ([208fbbe](https://github.com/Esposter/Esposter/commit/208fbbe1545def1aa33c701f33124635d707858d))
* code review comments ([96cf103](https://github.com/Esposter/Esposter/commit/96cf103f7fa17f79a8227235ca1017be6aec8785))
* code review comments ([5f98907](https://github.com/Esposter/Esposter/commit/5f98907bd78739c37ace0dcee88062fa2f23dce2))
* code review comments + refactor away complicated regexes ([eca7d01](https://github.com/Esposter/Esposter/commit/eca7d01d9e2bb8335a75b085604468601c395fb2))
* collapse the match union so packages/db typechecks ([c407b26](https://github.com/Esposter/Esposter/commit/c407b263c453752b6797c0fe012dde7f20ebd075))
* collapse two duplicated-invariant defects from the seam review ([9f898b3](https://github.com/Esposter/Esposter/commit/9f898b3e435bfd167ded94ecefdcb214bd95fe06))
* **db:** escape single quotes in Azure OData filter values ([cccc469](https://github.com/Esposter/Esposter/commit/cccc469bdf80374401f32df0b0e6448227254289))
* docs & test ([558dfa3](https://github.com/Esposter/Esposter/commit/558dfa3f044d160ba4c632f8450479bfc2035933))
* drop the shared trpc client stand-in and pin the new deletion contract ([484ec54](https://github.com/Esposter/Esposter/commit/484ec54490c136ef2e057e2424ebf651bf980ac0))
* lint ([35d371f](https://github.com/Esposter/Esposter/commit/35d371f0b3654eec75212f387a7e03bffd7f41fa))
* lint ([a267140](https://github.com/Esposter/Esposter/commit/a267140ca8dc8d691db49ca89edd306ceae89faf))
* lint and snapshots ([678a3e1](https://github.com/Esposter/Esposter/commit/678a3e12af21e1a73a6bcdae5d77fbb279ce0498))
* narrow the blob deletion payload instead of reaching through the union ([7198911](https://github.com/Esposter/Esposter/commit/7198911fbbaddb326da30f4195f4b8ab487497fa))
* post-merge integration fallout ([d7f882c](https://github.com/Esposter/Esposter/commit/d7f882cbef6cf79fc4aa781366b27a6bababdb47))
* post-merge integration fallout ([338a728](https://github.com/Esposter/Esposter/commit/338a7280dcca4d5886fae20fb10b63c045da8ade))
* re-enable no-shadow and rename all shadowing variables ([0faab46](https://github.com/Esposter/Esposter/commit/0faab46e00078013464161144498ad94d1ac866e))
* record the facts these fixes kept guessing at ([376dbb0](https://github.com/Esposter/Esposter/commit/376dbb0c56b264b4128e3da56377e6d9be5928b1))
* resolve notify closures by binding, restore dead-lettering on recreate ([14bb140](https://github.com/Esposter/Esposter/commit/14bb1404ff931ba1657178b8a1dd1b7fb1ac9f83))
* resolve oxlint errors ([d9129c7](https://github.com/Esposter/Esposter/commit/d9129c790a6e01acdba2b769c0b2c8c3907f83d4))
* restore lint suppressions as oxlint-disable directives ([4085893](https://github.com/Esposter/Esposter/commit/4085893e4972dd5deb290524a3b05930a45a8d78))
* review findings ([b8da841](https://github.com/Esposter/Esposter/commit/b8da8418d25bf41c671a4ab89fc27c4403615c2f))
* **review:** resolve full-PR review findings with regression tests ([c246edc](https://github.com/Esposter/Esposter/commit/c246edc25e1fe47c58b4cc3e3a06cc5f36fbb24c)), closes [#1017](https://github.com/Esposter/Esposter/issues/1017)
* settle blob fan-outs before rolling back, and gate the publish sweep ([c4a5192](https://github.com/Esposter/Esposter/commit/c4a51925877e87722980a0f8674af63e6597f459))
* snapshots ([1fb43ed](https://github.com/Esposter/Esposter/commit/1fb43ede8f60c88b112083c5f01f06c3d8091808))
* snapshots ([d505054](https://github.com/Esposter/Esposter/commit/d505054f6b852fca4fb57131c682cc8a8e1d7466))
* snapshots ([100c3c0](https://github.com/Esposter/Esposter/commit/100c3c05787c63682b32cabd4dd896cda20fd425))
* snapshots ([ebdaee8](https://github.com/Esposter/Esposter/commit/ebdaee8198895a48c1ab275fd544d45f106f7a33))
* snapshots ([f5eadf4](https://github.com/Esposter/Esposter/commit/f5eadf4a15126ab6c3de9d088f1419bd6ea625db))
* snapshots ([b7b2153](https://github.com/Esposter/Esposter/commit/b7b21533766668aea7c88ba0527093485614e019))
* snapshots ([e55471d](https://github.com/Esposter/Esposter/commit/e55471d43085dd03cc7f0cc8ba7866e09486767c))
* snapshots ([cb38db4](https://github.com/Esposter/Esposter/commit/cb38db4e0b74a43ad9b5c72828795abc85e4d29e))
* snapshots ([7a984f8](https://github.com/Esposter/Esposter/commit/7a984f81f0b37c8604af4562d2481f197f6ccdba))
* snapshots and options ([e274338](https://github.com/Esposter/Esposter/commit/e2743386cda848caad3377c1b199e7924c2cd0f0))
* some bugs ([ce9954b](https://github.com/Esposter/Esposter/commit/ce9954b2d1317fee34cf51419e0846ef528168b7))
* submit batches ([b922958](https://github.com/Esposter/Esposter/commit/b922958647d3c5d3085b50aab3b6a82cf728f5f4))
* tests ([097d9e2](https://github.com/Esposter/Esposter/commit/097d9e2014015556c3da43009d71024ae22de2bd))
* tests ([97bdc81](https://github.com/Esposter/Esposter/commit/97bdc81353183907175d54eb2e6f7cd2cd863a4f))
* tests and urls ([c857917](https://github.com/Esposter/Esposter/commit/c85791767dbf80fe9c53c25c3b09b567bd44b750))
* **test:** sync db bundle snapshot and dashboard bake expectation after develop merge ([4b84eb4](https://github.com/Esposter/Esposter/commit/4b84eb480c3706f1cb01d98d86e40e10178423e8))
* types ([ae977fb](https://github.com/Esposter/Esposter/commit/ae977fb5b5dcc1a73d83e21f6c9746ef3e50422e))
* **virrun:** tolerate a source path that vanishes mid-archive ([331224a](https://github.com/Esposter/Esposter/commit/331224a188f32360e913b294902f8cdf772b2f59))
* wip ([acf6466](https://github.com/Esposter/Esposter/commit/acf6466c3340699b1ef5593a27cd5ac80f1e2049))
* wip ([726c18a](https://github.com/Esposter/Esposter/commit/726c18af1b45b2bc4b438d24f255ba1be69c159d))

### Features

* Add process blob deletion handler ([1d66a2c](https://github.com/Esposter/Esposter/commit/1d66a2c6a445de75e285c5ae2629d75d939c13b0))
* **esbabbler:** consolidate file uploads, add thumbnails, room limits, and files tab ([87acbcf](https://github.com/Esposter/Esposter/commit/87acbcf61dac83023ebe2b98a2e433b2cc1c562a))
* **esbabbler:** thread-follow procedures + auto-follow + reply notifications ([9d5d5c5](https://github.com/Esposter/Esposter/commit/9d5d5c5eeaaefa9348b37b6e6a689876448b1631))
* **platform:** explorer parity — summary view, row-cap warning, create-from-file, share ([2d711ea](https://github.com/Esposter/Esposter/commit/2d711ea5a03b3e42ec795f71b57abbadc8f8b2ca))
* **platform:** TodoList due reminders ([78089f2](https://github.com/Esposter/Esposter/commit/78089f2475bc87e3070e3db57890d6f4507a282d))
* **resource:** soft delete, favorites, tags, activity log, trigram search ([f741b0f](https://github.com/Esposter/Esposter/commit/f741b0ff4d11082a14be098ab95d3ca9497b06ad))
* stable asset urls wip ([53846a3](https://github.com/Esposter/Esposter/commit/53846a35e52d4980cdd5389f754fdae487fb8d54))

# [2.35.0](https://github.com/Esposter/Esposter/compare/v2.34.2...v2.35.0) (2026-07-15)

### Bug Fixes

* builds ([257b3e5](https://github.com/Esposter/Esposter/commit/257b3e505310d4dffb1676db75d8b0b8c7ff9bb3))
* enums and arrays ([faa3f2f](https://github.com/Esposter/Esposter/commit/faa3f2fc2d8e7453fead1ba02cb9b0f294b1b70f))
* post-merge integration for esbabbler, platform, and posts branches ([a14af16](https://github.com/Esposter/Esposter/commit/a14af16951d55266948f62c378c7490a6854f166))
* snapshot and script ([b2df969](https://github.com/Esposter/Esposter/commit/b2df9695cd825d4a774386621345f5ef4a79d0cb))
* snapshots ([9764b23](https://github.com/Esposter/Esposter/commit/9764b23ba8be5cb84229baf997f54ce00c9cef98))
* wip ([cf2c92b](https://github.com/Esposter/Esposter/commit/cf2c92b108efb84bad50e151bb749b9cf3257bf8))

### Features

* esbabbler mention badges + push-to-talk keybind with release delay ([3cc0602](https://github.com/Esposter/Esposter/commit/3cc060227b201fcac212b11be6d401312a9b5f74))
* migrate to service bus ([60572d9](https://github.com/Esposter/Esposter/commit/60572d945321e2953abd3bb43f61553c7221f43d))

## [2.34.2](https://github.com/Esposter/Esposter/compare/v2.34.1...v2.34.2) (2026-07-05)

### Bug Fixes

* tests and types ([67fc659](https://github.com/Esposter/Esposter/commit/67fc6595f40dce01037dee4f1ee5c703b486d26a))

## [2.34.1](https://github.com/Esposter/Esposter/compare/v2.34.0...v2.34.1) (2026-07-04)

**Note:** Version bump only for package @esposter/db

# [2.34.0](https://github.com/Esposter/Esposter/compare/v2.33.0...v2.34.0) (2026-07-04)

**Note:** Version bump only for package @esposter/db

# [2.33.0](https://github.com/Esposter/Esposter/compare/v2.32.1...v2.33.0) (2026-07-03)

### Bug Fixes

* cleanup debug logs ([fa0a35d](https://github.com/Esposter/Esposter/commit/fa0a35daae80aadf3d32745aec9b4e5c165cc614))

## [2.32.1](https://github.com/Esposter/Esposter/compare/v2.32.0...v2.32.1) (2026-07-01)

**Note:** Version bump only for package @esposter/db

# [2.32.0](https://github.com/Esposter/Esposter/compare/v2.31.1...v2.32.0) (2026-07-01)

### Bug Fixes

* snapshot size ([36993db](https://github.com/Esposter/Esposter/commit/36993dbfea849005e0655dfd5684e069cdf35f50))

## [2.31.1](https://github.com/Esposter/Esposter/compare/v2.31.0...v2.31.1) (2026-06-25)

**Note:** Version bump only for package @esposter/db

# [2.31.0](https://github.com/Esposter/Esposter/compare/v2.30.0...v2.31.0) (2026-06-25)

**Note:** Version bump only for package @esposter/db

# [2.30.0](https://github.com/Esposter/Esposter/compare/v2.29.0...v2.30.0) (2026-06-24)

**Note:** Version bump only for package @esposter/db

# [2.29.0](https://github.com/Esposter/Esposter/compare/v2.28.0...v2.29.0) (2026-06-21)

### Bug Fixes

* snapshots ([31ba759](https://github.com/Esposter/Esposter/commit/31ba759434f62d892b198d06e804fe6450acd7e5))
* snapshots ([8666a0a](https://github.com/Esposter/Esposter/commit/8666a0ac2dd3b2f520df1b85ce0516cc8ffa281f))
* types and commands ([e0ad825](https://github.com/Esposter/Esposter/commit/e0ad82515d8bb6c1adc46b3ee30b7fa35650910c))
* unifying vitest ([8e3e6bf](https://github.com/Esposter/Esposter/commit/8e3e6bf186a7fecbd3054cf5b9e80e5763d3c8b0))

# [2.28.0](https://github.com/Esposter/Esposter/compare/v2.27.0...v2.28.0) (2026-06-14)

### Bug Fixes

* add files ([d868b51](https://github.com/Esposter/Esposter/commit/d868b518a8484accc5a608ea4fa2fb489160f6dd))
* cleanup code ([c377566](https://github.com/Esposter/Esposter/commit/c37756616760798a63929f537ae52300a27dbbef))
* code review comments ([3c654a9](https://github.com/Esposter/Esposter/commit/3c654a9376d85ff05d8e69acf372aca775830c6a))
* code review comments ([09db4c9](https://github.com/Esposter/Esposter/commit/09db4c906ae9458021c0ea3c2960e798c516e7a4))
* lint ([ad23741](https://github.com/Esposter/Esposter/commit/ad23741928b6780891d22e95b99ac2b5f34d737f))
* snapshots and dev env for now ([c774f1c](https://github.com/Esposter/Esposter/commit/c774f1c58f72f5274c74bc97eca204d30bbc09ee))
* snapshots and tests ([9b2a6f2](https://github.com/Esposter/Esposter/commit/9b2a6f2102395a230ef4cd0b1f3a31fe37408c08))
* wip ([fb38ad5](https://github.com/Esposter/Esposter/commit/fb38ad5ea5f2bc5fef84aa2fead3df34b262130c))
* wip tests ([4eee636](https://github.com/Esposter/Esposter/commit/4eee63667def07f45e40499e2bb8cddc2d51e001))

# [2.27.0](https://github.com/Esposter/Esposter/compare/v2.26.0...v2.27.0) (2026-06-05)

### Bug Fixes

* snapshot ([ab17d12](https://github.com/Esposter/Esposter/commit/ab17d1201b2bdee2d46711147b7f1fdb385fe1e8))
* types ([cb3ac38](https://github.com/Esposter/Esposter/commit/cb3ac38452ba5c7f0253c4eccfdf9266997e272c))

# [2.26.0](https://github.com/Esposter/Esposter/compare/v2.25.0...v2.26.0) (2026-06-01)

### Bug Fixes

* add isWindows check ([2b101a5](https://github.com/Esposter/Esposter/commit/2b101a5b8d67bb0751d1c7ef01b0253e6aef8190))
* cleanup packages ([157c130](https://github.com/Esposter/Esposter/commit/157c13093d0967636982c33e2097b76cc18a353f))
* cleanup vitest config to also be shared package ([8c9e5c6](https://github.com/Esposter/Esposter/commit/8c9e5c6a9e2573485c899db3ccaf3b71f0320fe1))
* format ([97800d7](https://github.com/Esposter/Esposter/commit/97800d763300a65d42742bbb919ec9ac2b7c46f8))
* lint and test snapshots to include linux ([2389fbc](https://github.com/Esposter/Esposter/commit/2389fbc9f692c65fcff37f5e4e766af6b3e3f722))
* migrations + types ([444c5e4](https://github.com/Esposter/Esposter/commit/444c5e42213ab207348e07cc5f845f477c50caf2))
* peer deps ([32a7a7a](https://github.com/Esposter/Esposter/commit/32a7a7ab7276f5ad16170e54c74926bb0dbfdf03))
* snapshot ([14eac02](https://github.com/Esposter/Esposter/commit/14eac0235db8e5b2e95b4f9887e084391b6d7325))
* types ([fa20b64](https://github.com/Esposter/Esposter/commit/fa20b64971853aa4bc57d38293065eb6a5e67466))
* vitest config ts ([204792c](https://github.com/Esposter/Esposter/commit/204792cec21bf26495477d793f106dbd99f84ce6))
* wip tests ([87dcb4d](https://github.com/Esposter/Esposter/commit/87dcb4db2a8b0b2d3de7d9eca87d6daab9a47056))

### Features

* Add bundle tests + fix up mocking ([b6db055](https://github.com/Esposter/Esposter/commit/b6db055d8d087fc7cc61e3226939d41d8817f730))
* Add dep graph ([cfcaa09](https://github.com/Esposter/Esposter/commit/cfcaa0919e530ab4c7046e59ba00b95cb6cc5132))
* Add dts bundle size tests ([dfc255a](https://github.com/Esposter/Esposter/commit/dfc255a50259cc6364b6edd97dcd5403c775aa1d))
* Add roles mentions ([3207313](https://github.com/Esposter/Esposter/commit/32073134328a66a0a2429ce595d77f34da4cd614))

# [2.25.0](https://github.com/Esposter/Esposter/compare/v2.24.0...v2.25.0) (2026-05-21)

### Bug Fixes

* lint + optimize some docker ([e110ea9](https://github.com/Esposter/Esposter/commit/e110ea9ae5f2bad6dc45429741a540b517598b10))
* search index ([4e6e0fe](https://github.com/Esposter/Esposter/commit/4e6e0fece59f0920d6e0122c0f59fb2035ef42c5))

### Features

* Add role assignments ([dc0c2a9](https://github.com/Esposter/Esposter/commit/dc0c2a97af93c127bf2cbd978a58ebf677ccff9a))

# [2.24.0](https://github.com/Esposter/Esposter/compare/v2.23.0...v2.24.0) (2026-05-15)

### Bug Fixes

* code review comments ([f759f5d](https://github.com/Esposter/Esposter/commit/f759f5d5b42e5596495f51f0cf07c1b3091ec3ce))
* tests ([ef2fa28](https://github.com/Esposter/Esposter/commit/ef2fa288910a7e5b53651e92a368b411fbbdfe82))
* typechecking and code review comments ([2a85e3f](https://github.com/Esposter/Esposter/commit/2a85e3fe2652b11a563b91e1749a6f1ce38be6dc))

# [2.23.0](https://github.com/Esposter/Esposter/compare/v2.22.0...v2.23.0) (2026-05-07)

### Bug Fixes

* code review comments ([c3f41ff](https://github.com/Esposter/Esposter/commit/c3f41ff57b20f793d8864bd8a2ebb39bb29b16c8))
* lint ([f6e79f4](https://github.com/Esposter/Esposter/commit/f6e79f496c45f0d7369e7a288891846d6325bd3f))
* lint ([5bb03c7](https://github.com/Esposter/Esposter/commit/5bb03c776d19846ea88163c5b194a1adde370d92))
* lint wip ([8acd30e](https://github.com/Esposter/Esposter/commit/8acd30e554910d92719864b0f706e78833d27ebc))
* lint wip ([7bd8c17](https://github.com/Esposter/Esposter/commit/7bd8c1773da3866e9aafc53222a71af1dd17e3f1))
* remaining issues ([808764d](https://github.com/Esposter/Esposter/commit/808764d68404871df4632d4b7eadd83af780be0d))
* remaining migrations ([14c864f](https://github.com/Esposter/Esposter/commit/14c864f5b31a0c61544e07bd34ea18bbd9df1af2))
* wip ([c0962e4](https://github.com/Esposter/Esposter/commit/c0962e4852cd751ebf2748aaea97e9122397e3a3))

### Features

* error handling wip ([74b7969](https://github.com/Esposter/Esposter/commit/74b796949376815f1f54982b7fc52d69bf31986f))
* upgrade drizzle ([17b9f41](https://github.com/Esposter/Esposter/commit/17b9f41b180ba109382d34e9507ead13cbbb95b2))

# [2.22.0](https://github.com/Esposter/Esposter/compare/v2.21.0...v2.22.0) (2026-04-28)

### Bug Fixes

* add types ([4e939f6](https://github.com/Esposter/Esposter/commit/4e939f638a1c692f0eca92bf47ca489f6f6bcdfc))

* imports ([aac4bbd](https://github.com/Esposter/Esposter/commit/aac4bbd06079cc4657ef1d23c609e67441d0bbaa))

* move create mock db ([b024631](https://github.com/Esposter/Esposter/commit/b0246312f69f77e2db4ace0803688b64b3b16304))

* move create mock db back to node build ([46122a8](https://github.com/Esposter/Esposter/commit/46122a8a2fd1083dc9b8b17a561993bc75b557c7))

* move to db-mock package ([2df4164](https://github.com/Esposter/Esposter/commit/2df416413bb4385f050c81213193bff200f24a66))

* tests ([58d6224](https://github.com/Esposter/Esposter/commit/58d62241bba057c39bcc300384df577dfe846196))

* tests wip ([02a5d6a](https://github.com/Esposter/Esposter/commit/02a5d6a5305bd208f746bb5bddd20025044b6dbe))

* types ([caf4700](https://github.com/Esposter/Esposter/commit/caf47007ad6bfaada08adca4c7283361e3995d61))

* types and lint ([ad56572](https://github.com/Esposter/Esposter/commit/ad56572087670f66d878cfa8f1778a78582c950b))

* use upsert ([8794f62](https://github.com/Esposter/Esposter/commit/8794f620187c671f881773e2b2d5546051cb256c))

* wip ([821d331](https://github.com/Esposter/Esposter/commit/821d331f5b0301ec37e0a5b6269e64d66fbb07cb))

# [2.21.0](https://github.com/Esposter/Esposter/compare/v2.20.0...v2.21.0) (2026-04-15)

### Bug Fixes

* lint ([977045b](https://github.com/Esposter/Esposter/commit/977045b1ff1318d135d8dd283efe97df7ed34ecc))

### Features

* Add [@here](https://github.com/here) and [@everyone](https://github.com/everyone) ([710b702](https://github.com/Esposter/Esposter/commit/710b7026e2f6705513f4561327f2d04fb70350e1))

* add friend request notification ([3bbd448](https://github.com/Esposter/Esposter/commit/3bbd448dcc23330bee926215d8ad196ce0388c94))

* implement features + fix lint ([e62cdd4](https://github.com/Esposter/Esposter/commit/e62cdd42a44775ba52e06d57030da740c61e1a7a))

* wip ([7e5afb7](https://github.com/Esposter/Esposter/commit/7e5afb71132ca4db8a2c55bb15916e583095cfd4))

# [2.20.0](https://github.com/Esposter/Esposter/compare/v2.19.2...v2.20.0) (2026-03-29)

### Bug Fixes

* format + fix up some ignores ([6cd632f](https://github.com/Esposter/Esposter/commit/6cd632ff672ad8e0adee51b42cb6f6925f894b96))

* lint ([e99256d](https://github.com/Esposter/Esposter/commit/e99256d093f4ac789bd4840f22711998a5b98706))

### Features

* Add oxlint type aware ([eb40e2d](https://github.com/Esposter/Esposter/commit/eb40e2d7da8c606c66053582284264e0fb3a2592))

* migrate to oxfmt ([e7a0212](https://github.com/Esposter/Esposter/commit/e7a0212f9ec18d7193c96cc6069ac6ecf168e8bb))

* switch to tsgo ([1e504b3](https://github.com/Esposter/Esposter/commit/1e504b3a6ce5144dadbdd9bc543018a35e7b6808))

## [2.19.2](https://github.com/Esposter/Esposter/compare/v2.19.1...v2.19.2) (2026-02-05)

**Note:** Version bump only for package @esposter/db

## [2.19.1](https://github.com/Esposter/Esposter/compare/v2.19.0...v2.19.1) (2026-02-05)

**Note:** Version bump only for package @esposter/db

# [2.19.0](https://github.com/Esposter/Esposter/compare/v2.18.2...v2.19.0) (2026-02-05)

### Bug Fixes

* directly use index access instead of find boolean ([69fdae5](https://github.com/Esposter/Esposter/commit/69fdae5efd850805ce06595e973c90bed4ddb430))

* empty key tests ([d849357](https://github.com/Esposter/Esposter/commit/d849357f5f354425ebe105f628f3372d9f264b9b))

* explicit types ([5f602c5](https://github.com/Esposter/Esposter/commit/5f602c56958184bffd305c1f45d4f64e3ede109e))

* finally fix up all type issues ([179e963](https://github.com/Esposter/Esposter/commit/179e9639f3cfdf05e08aff88e4844748158f0a1c))

* oxlint ([3df2ec1](https://github.com/Esposter/Esposter/commit/3df2ec1ad17f36d77780656e27d3034cd3ac32de))

* update rolldown-plugin-dts and remove resolve option ([251fe7d](https://github.com/Esposter/Esposter/commit/251fe7d7811121e514fcadaafeafd20a6460dca4))

## [2.18.2](https://github.com/Esposter/Esposter/compare/v2.18.1...v2.18.2) (2025-12-10)

**Note:** Version bump only for package @esposter/db

## [2.18.1](https://github.com/Esposter/Esposter/compare/v2.18.0...v2.18.1) (2025-12-10)

**Note:** Version bump only for package @esposter/db

# [2.18.0](https://github.com/Esposter/Esposter/compare/v2.17.0...v2.18.0) (2025-12-10)

### Bug Fixes

* use esm imports ([e583736](https://github.com/Esposter/Esposter/commit/e5837369bff15c20868d9486d93bf5192c48c58c))

### Features

* Add endpoints for user room settings ([316ccff](https://github.com/Esposter/Esposter/commit/316ccff0a3fb23f701778b1004a1af0bf0d7de34))

# [2.17.0](https://github.com/Esposter/Esposter/compare/v2.16.0...v2.17.0) (2025-11-03)

**Note:** Version bump only for package @esposter/db

# [2.16.0](https://github.com/Esposter/Esposter/compare/v2.15.1...v2.16.0) (2025-10-19)

### Bug Fixes

* await in func ([8fc0de5](https://github.com/Esposter/Esposter/commit/8fc0de5ce17a77290d278a5fe65c8ba2e5ccda0d))

* better split between webhook messages and standard messages ([e73a83c](https://github.com/Esposter/Esposter/commit/e73a83c8abdea17047523594507155149d895923))

* constructor ([292e9b5](https://github.com/Esposter/Esposter/commit/292e9b502d5af9e951276bda81f72f1bad65d431))

* instantiate class based on type ([c2ca9f7](https://github.com/Esposter/Esposter/commit/c2ca9f7cb55baab5a1f3d3f37645b613b5a57d46))

* lint ([2e3a9f7](https://github.com/Esposter/Esposter/commit/2e3a9f78ae92e75082fe04869981eda5e59f2586))

* move shared code to db-schema away from server code ([610c70e](https://github.com/Esposter/Esposter/commit/610c70e1b5bbbb831f622877bf35fd0ddb48fa56))

* peer deps ([6f8d586](https://github.com/Esposter/Esposter/commit/6f8d5860fb6baf483a347cdb3bd74d9bcc83fbe8))

* put back the environments ([3ea1f39](https://github.com/Esposter/Esposter/commit/3ea1f39fe69d86c3c35fd84ec412079e4b013f60))

* rename folder casing ([1ccbd62](https://github.com/Esposter/Esposter/commit/1ccbd629a418bd496c3d3a658250819827891241))

* tests to compare correct times ([83dcb0a](https://github.com/Esposter/Esposter/commit/83dcb0a64a4f043600b19a045a95cf25631bd2b3))

* wrong instanceof check ([a7ede21](https://github.com/Esposter/Esposter/commit/a7ede21e6d7527c2ac9ae68edc5629b5ef73d06c))

### Features

* Add web pubsub ([bf65e17](https://github.com/Esposter/Esposter/commit/bf65e170039e7307b9ec24792176b883206dbeb8))

## [2.15.1](https://github.com/Esposter/Esposter/compare/v2.15.0...v2.15.1) (2025-10-10)

### Bug Fixes

* add remaining js shims ([60c6643](https://github.com/Esposter/Esposter/commit/60c66434c940ca9610333e68e10a246fa7772716))

* don't circular import self ([5c04718](https://github.com/Esposter/Esposter/commit/5c047189d8faddcdc296cb79655954c0411a398c))

* just re-implement in ts ([1d13edc](https://github.com/Esposter/Esposter/commit/1d13edcd94d52da3555377b9d943e66febcc6bc4))

* lint ([f34d2d6](https://github.com/Esposter/Esposter/commit/f34d2d6f28a1923ad45e409a073e28006d2e4f11))

* migrate schema ([df55198](https://github.com/Esposter/Esposter/commit/df55198279c3cfd62913bc2e959287fe82d0d0d2))

* provide js version for nuxt config ([4c7bdac](https://github.com/Esposter/Esposter/commit/4c7bdac0c60c15001efb69d90e194fb77d957ead))

* split to db-schema pkg that is browser-friendly ([549fcac](https://github.com/Esposter/Esposter/commit/549fcacfe755039fb2a85e17baaa11f2ddfc6d4f))

* tests ([cfb9a92](https://github.com/Esposter/Esposter/commit/cfb9a92579f4a591be9cd0aac3a7f4cecfd8e26f))

# [2.15.0](https://github.com/Esposter/Esposter/compare/v2.14.0...v2.15.0) (2025-10-09)

### Bug Fixes

* migration folder paths ([1f10e76](https://github.com/Esposter/Esposter/commit/1f10e761f56f717f2b4db02d8553aac0c3f79dd6))

### Features

* migrate to new db schema ([4c63fbe](https://github.com/Esposter/Esposter/commit/4c63fbe289ce89ed18001e09cf6970501a15c9bb))

* move db schema to package ([39895ca](https://github.com/Esposter/Esposter/commit/39895cab56fbe31d35f6178e2cdd7e5bf0a37ab7))
