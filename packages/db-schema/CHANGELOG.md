# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.39.0](https://github.com/Esposter/Esposter/compare/v2.38.1...v2.39.0) (2026-09-04)

### Bug Fixes

* **azure-functions:** declare the entry point the Functions host loads ([b3a3721](https://github.com/Esposter/Esposter/commit/b3a3721bd388d0787c4d5e483dddccb27f59f431))
* **build:** every package answers the side-effects question ([ecb4dc1](https://github.com/Esposter/Esposter/commit/ecb4dc1d6fb1610cb446fc0560a5ba62dca22f81))
* **ci:** close the oxlint findings and re-record the bundle sizes ([539008c](https://github.com/Esposter/Esposter/commit/539008caa99bb25762b922a049fda526dde833c3))
* **ci:** drain the lint errors and the drifted size snapshots ([a75cea2](https://github.com/Esposter/Esposter/commit/a75cea2c2cdc4376a5351d77ea4962b8abe56a1f))
* **ci:** the checks pass on the tree the snapshot work left ([acd98a2](https://github.com/Esposter/Esposter/commit/acd98a2753b981c618d0632f9950e52f7614a033))
* **ci:** the import order and the three size snapshots catch up with develop ([0cc14ea](https://github.com/Esposter/Esposter/commit/0cc14ea68b9c2a7a7ea1a1e37744fff2bcad19b7))
* **ci:** unbreak the function deploy pnpm 12 broke, and pin the rule ([6c874d2](https://github.com/Esposter/Esposter/commit/6c874d274abeab8072e782838c709f9db86bff7f))
* correct three message-table columns that contradict themselves ([ec9a7c8](https://github.com/Esposter/Esposter/commit/ec9a7c80282b476bef2537978624c35439a4c5d7))
* **db-schema:** name the reverse push subscription relation after its table ([4482c70](https://github.com/Esposter/Esposter/commit/4482c70008fd4c1675fb98f71fb09aff272c840a))
* **emailEditor:** seed the dirty check on load, as every other content store does ([dde2757](https://github.com/Esposter/Esposter/commit/dde2757ecacf59d71d807059eadbbd234e6d58f0))
* **platform:** the storage meter hears the counter its other process moves ([4cf9866](https://github.com/Esposter/Esposter/commit/4cf98664f7ebb9afd4ebccc74a2987d0c7bb7a7a))
* repair the CI fallout from the count column renames ([bbe1c03](https://github.com/Esposter/Esposter/commit/bbe1c035bc81988a32cbe488148b0faf24787a76))
* **storage:** reject a BlobCreated event older than the one already applied ([6ec9ce8](https://github.com/Esposter/Esposter/commit/6ec9ce891ae2cf1a3f2f1ec27b8f78b405891ef5))
* **use-mutation:** superseding a key drops its joinable read too ([385ed67](https://github.com/Esposter/Esposter/commit/385ed67910687a9155dfbbf20a0a702f33cbee28))
* **virrun:** isSnapshotLowerPath is a field, so it keeps its `is*` ([02554e7](https://github.com/Esposter/Esposter/commit/02554e74026ed401fdbe39be7304d0af4636fafc))

### Features

* **esbabbler:** custom call backgrounds in fixed per-user slots ([573cb77](https://github.com/Esposter/Esposter/commit/573cb779ae6b4f70a496c434fdcd78c0128b545d))
* **platform:** every resource type gets revisions it can return to ([ef108dc](https://github.com/Esposter/Esposter/commit/ef108dcc49c4e3a3685d4a0e5de888a5edf9f019))
* **post:** Reddit-style reply trees, with the chain on the row ([d422cd7](https://github.com/Esposter/Esposter/commit/d422cd73faf08b60f7a5612ec1b9684f597149c9))
* **room:** manage a room's invite links, and make ManageInvites mean something ([c6b9541](https://github.com/Esposter/Esposter/commit/c6b9541482c03fced3c0e909e11931d8fd98276a))
* **users:** list and revoke the account's sessions ([bedfeb7](https://github.com/Esposter/Esposter/commit/bedfeb7958de0771ed6b813759ac5224588f02d4))

### Performance Improvements

* **db-schema:** index the unread notification count by its own predicate ([59b96d6](https://github.com/Esposter/Esposter/commit/59b96d6a0f822df4e85832774a1c056a6c33d61b))
* **platform:** a private package emits no declarations ([fa31aa4](https://github.com/Esposter/Esposter/commit/fa31aa4b26d5ba1d3e1573e2d1464990dd9272cb))
* **platform:** the build generates its own barrel, and skips it when it can ([696835c](https://github.com/Esposter/Esposter/commit/696835c457837d8737b8cd09b940dc97577cfc24))

## [2.38.1](https://github.com/Esposter/Esposter/compare/v2.38.0...v2.38.1) (2026-08-23)

### Bug Fixes

* **build:** keep workspace source out of Node's own module loader ([4c3bfdd](https://github.com/Esposter/Esposter/commit/4c3bfddaf246c21f03d103a7aac44c7de9b8f97d))

# [2.38.0](https://github.com/Esposter/Esposter/compare/v2.37.2...v2.38.0) (2026-08-23)

### Bug Fixes

* **invites:** answer the review — lock the room around the pause check, and stop two rollbacks resurrecting dead state ([d287e80](https://github.com/Esposter/Esposter/commit/d287e80c9d5e8649022a768fd921bacf89412563))
* **pagination:** single-flight the appending read ([18a343e](https://github.com/Esposter/Esposter/commit/18a343ee4b3c4f1614b26f5f9cbc76f7e9a9eec0))
* **rbac,moderation:** close the two hierarchy bypasses and answer the review ([3583254](https://github.com/Esposter/Esposter/commit/3583254f9c703b1a78b073078e16cfce55a1db61))

### Features

* **esbabbler:** make a thread a place you work in ([ee35826](https://github.com/Esposter/Esposter/commit/ee3582692730b4806a2453d5cea8523201cf4ecd))
* **esbabbler:** per-room custom emoji ([350c183](https://github.com/Esposter/Esposter/commit/350c18335ae63516a2aa259de1a369481aaf1077))
* **esbabbler:** say what a room permission grants, on the screen that grants it ([2be48ed](https://github.com/Esposter/Esposter/commit/2be48ed007a81216d28591c9e53be749d6776683))
* **invites:** Discord's invite surfaces — a panel that lists and pauses, a dialog that hands over a link ([7f5fdec](https://github.com/Esposter/Esposter/commit/7f5fdecf4e028a9320fd70dea3062c97e05c9927))
* **search:** allow many filters of one type, and add has:file ([6cd4b39](https://github.com/Esposter/Esposter/commit/6cd4b390abfd99b8a6aced9a6ffb5846d4575682))

## [2.37.2](https://github.com/Esposter/Esposter/compare/v2.37.1...v2.37.2) (2026-08-14)

**Note:** Version bump only for package @esposter/db-schema

## [2.37.1](https://github.com/Esposter/Esposter/compare/v2.37.0...v2.37.1) (2026-08-14)

**Note:** Version bump only for package @esposter/db-schema

# [2.37.0](https://github.com/Esposter/Esposter/compare/v2.36.0...v2.37.0) (2026-08-14)

### Bug Fixes

* **build:** stop the shared build preset from squatting on configuration's own build config ([7926319](https://github.com/Esposter/Esposter/commit/792631944592810a2a60eb24184fdd0c3de45555))
* code review comments ([813b854](https://github.com/Esposter/Esposter/commit/813b854939772e4f8600b85116a22dfbe6374d2b))
* **message:** stop votes deleting poll labels and re-following unfollowers ([10a997c](https://github.com/Esposter/Esposter/commit/10a997c546f064774e5ea8b45ab1763d8e817086))
* **platform:** close the storage-quota review findings ([bb01ac6](https://github.com/Esposter/Esposter/commit/bb01ac6a74405af5d71debd46b7a30b5f811c1a2))
* **platform:** correct the residual-quota-gap bound, lock users in a fixed order ([a707ea0](https://github.com/Esposter/Esposter/commit/a707ea05686587a72228e645306e6da317970cc9))
* **review:** address the third round of CodeRabbit findings ([e81f9f5](https://github.com/Esposter/Esposter/commit/e81f9f51cea29190c614ae12632b8fddcbdbef4c))
* **review:** drain the open findings from the last review cycle ([6654740](https://github.com/Esposter/Esposter/commit/6654740f01b802a998a48ebab1c90c6b18e31f70))
* **review:** drain the review findings and clear the root lint gate ([66c8f53](https://github.com/Esposter/Esposter/commit/66c8f53991305944abdd0d1df658229ce5197391))

### Features

* **platform:** enforce per-user blob storage quotas ([d6aab71](https://github.com/Esposter/Esposter/commit/d6aab71ecf5565cf287a63e43cc4e18214f12368))
* **resource-explorer:** add the service menu, with Recent and Favorites as list routes ([cd23cc5](https://github.com/Esposter/Esposter/commit/cd23cc594c2145e10a252e1a1e352eb2e94bee1c))

### Performance Improvements

* **survey:** resolve a participant token from a column, not every program's blob ([0900d47](https://github.com/Esposter/Esposter/commit/0900d4736403f909b1e6efe37acc82ad7a9472cd))

# [2.36.0](https://github.com/Esposter/Esposter/compare/v2.35.0...v2.36.0) (2026-07-30)

### Bug Fixes

* add docs + modifications ([e3b82f1](https://github.com/Esposter/Esposter/commit/e3b82f1284e96089b6376467a155fad28fa1d6dc))
* add missing Note entry to ResourceOwnedTablesMap and dedupe owned-resource lookup ([b05855e](https://github.com/Esposter/Esposter/commit/b05855ea41156488a3a8d49dd68aa4c6d3dc5ae9))
* address code review findings on blob lifecycle and attachment urls ([b6213bf](https://github.com/Esposter/Esposter/commit/b6213bfb0d8f9d8544051da920c0abe2718a5d2c))
* address PR 1004 code review findings ([7d79608](https://github.com/Esposter/Esposter/commit/7d7960882836e1e3bffb7e8ccf46f1e192a05583))
* address PR 1008 workflow review findings ([4f7eb9d](https://github.com/Esposter/Esposter/commit/4f7eb9d09d62c118171462ad487456e3ef01d8db))
* **app:** address PR 1017 CodeRabbit findings, CI failures, and docs mobile nav ([924f963](https://github.com/Esposter/Esposter/commit/924f96330477222b10f94c578c36d2012f0ef4d0))
* clear the remaining confirmed findings from the seam review ([8709cd8](https://github.com/Esposter/Esposter/commit/8709cd8b0687e32fdbec8320bfc0d661c916d043))
* close the blob-delete gaps this review found ([08f6c83](https://github.com/Esposter/Esposter/commit/08f6c830c439fc96010bb94aefa16908b76bf75d))
* close the CodeRabbit findings on the publish/replay cohort ([c8db3a5](https://github.com/Esposter/Esposter/commit/c8db3a5651104c7420d5efc3e6119adb54c5b08a))
* close the defects the develop -> main review found ([2b05608](https://github.com/Esposter/Esposter/commit/2b0560891365eaeade126e5f76ae33ca9982d258))
* close the defects the develop-to-main review found ([494120b](https://github.com/Esposter/Esposter/commit/494120bf742e6946cc347867187f66e91e2d7a91)), closes [#1029](https://github.com/Esposter/Esposter/issues/1029)
* close the develop-to-main review findings ([3f29155](https://github.com/Esposter/Esposter/commit/3f29155a720cebf09405c443aa1f5e0ffbb4f04e))
* code review comments ([a739015](https://github.com/Esposter/Esposter/commit/a739015af42462afb2890c6532220a86b974b1c9))
* comments and snapshots ([2bd05d9](https://github.com/Esposter/Esposter/commit/2bd05d9ac2e6be0304bf06fb569663578fced448))
* **db-schema:** let composite keys use any string-format schema ([1479a45](https://github.com/Esposter/Esposter/commit/1479a45194a7d0f8f3bab0c98be218ec3303b1e8))
* **db:** escape single quotes in Azure OData filter values ([cccc469](https://github.com/Esposter/Esposter/commit/cccc469bdf80374401f32df0b0e6448227254289))
* drop the shared trpc client stand-in and pin the new deletion contract ([484ec54](https://github.com/Esposter/Esposter/commit/484ec54490c136ef2e057e2424ebf651bf980ac0))
* **esbabbler:** address CodeRabbit review findings on PR [#1017](https://github.com/Esposter/Esposter/issues/1017) ([99cc3e3](https://github.com/Esposter/Esposter/commit/99cc3e3e967c92fd9f5203dc01eaf2f34e2cec9f))
* lint ([a267140](https://github.com/Esposter/Esposter/commit/a267140ca8dc8d691db49ca89edd306ceae89faf))
* lint ([a1b7508](https://github.com/Esposter/Esposter/commit/a1b750832f227379d2dc689bf4528122d48fe76a))
* lint and snapshot ([b5b333c](https://github.com/Esposter/Esposter/commit/b5b333c7c437d239207a3926212625c9f8a680d1))
* lint and toctou race ([5af6974](https://github.com/Esposter/Esposter/commit/5af69740326d6e415f96b28a74d4caa6624817da))
* lint develop and refresh package size snapshots ([bb0c40e](https://github.com/Esposter/Esposter/commit/bb0c40e872cdb23e03c9ed7c2931b1479310ed8c))
* **lint:** stop oxlint type-aware hang on useFluidSimulator + clear surfaced errors ([404ced5](https://github.com/Esposter/Esposter/commit/404ced53bd00bb2bbf79d15dc3e5079da8881b20))
* narrow the blob deletion payload instead of reaching through the union ([7198911](https://github.com/Esposter/Esposter/commit/7198911fbbaddb326da30f4195f4b8ab487497fa))
* **platform:** address CodeRabbit review findings on the survey/program surfaces ([1a24f97](https://github.com/Esposter/Esposter/commit/1a24f97570b26b141880b6be69c2c9e02a4bcc9a))
* post-merge integration fallout ([d7f882c](https://github.com/Esposter/Esposter/commit/d7f882cbef6cf79fc4aa781366b27a6bababdb47))
* post-merge integration fallout ([338a728](https://github.com/Esposter/Esposter/commit/338a7280dcca4d5886fae20fb10b63c045da8ade))
* re-mint expiring read urls and de-collide asset clones ([abe7331](https://github.com/Esposter/Esposter/commit/abe7331485d16f4c407c52b6f229051e7a5bc33f))
* record the facts these fixes kept guessing at ([376dbb0](https://github.com/Esposter/Esposter/commit/376dbb0c56b264b4128e3da56377e6d9be5928b1))
* refactor wip ([dd75212](https://github.com/Esposter/Esposter/commit/dd7521242dec77e1d59bdc3f79071bd53f9b7221))
* remove unnecessary lints ([0db3054](https://github.com/Esposter/Esposter/commit/0db3054ddc6808b7cb09912820f66b27d4858450))
* resolve oxlint errors ([d9129c7](https://github.com/Esposter/Esposter/commit/d9129c790a6e01acdba2b769c0b2c8c3907f83d4))
* snapshots ([1fb43ed](https://github.com/Esposter/Esposter/commit/1fb43ede8f60c88b112083c5f01f06c3d8091808))
* snapshots ([881ecb1](https://github.com/Esposter/Esposter/commit/881ecb15f284319aa6867ccb42b7a7269a9cae66))
* snapshots ([c5c64fa](https://github.com/Esposter/Esposter/commit/c5c64fa253d142201bd952b9f7a3a135ba642394))
* snapshots ([1842fc6](https://github.com/Esposter/Esposter/commit/1842fc678909e00dfe32ecaeae3ff373a910321b))
* snapshots ([e55471d](https://github.com/Esposter/Esposter/commit/e55471d43085dd03cc7f0cc8ba7866e09486767c))
* snapshots and options ([e274338](https://github.com/Esposter/Esposter/commit/e2743386cda848caad3377c1b199e7924c2cd0f0))
* snapshots and review wip ([dc3dad0](https://github.com/Esposter/Esposter/commit/dc3dad0c3bb93a3121e82b621a63b2735ff229fc))
* tar exe ([844742b](https://github.com/Esposter/Esposter/commit/844742bf86402f0c95bd30505215e996cc3338a3))
* tests ([97bdc81](https://github.com/Esposter/Esposter/commit/97bdc81353183907175d54eb2e6f7cd2cd863a4f))
* tests and urls ([c857917](https://github.com/Esposter/Esposter/commit/c85791767dbf80fe9c53c25c3b09b567bd44b750))
* update program invites ([3e6f1fe](https://github.com/Esposter/Esposter/commit/3e6f1fe94d0d31eea90fcbbbbd16df84231d1e17))
* wip ([acf6466](https://github.com/Esposter/Esposter/commit/acf6466c3340699b1ef5593a27cd5ac80f1e2049))
* wip ([60a99b8](https://github.com/Esposter/Esposter/commit/60a99b8dde872db6cbc0dd5ac1e006439f3e2881))
* wip ([b02cc3b](https://github.com/Esposter/Esposter/commit/b02cc3b3d3e90cb6215ccbe21d15c9234cadb765))
* wip ([726c18a](https://github.com/Esposter/Esposter/commit/726c18af1b45b2bc4b438d24f255ba1be69c159d))

### Features

* Add process blob deletion handler ([1d66a2c](https://github.com/Esposter/Esposter/commit/1d66a2c6a445de75e285c5ae2629d75d939c13b0))
* Blueprint resource type with deploy and capture ([b70e0d0](https://github.com/Esposter/Esposter/commit/b70e0d07e79068954839dad498513ec265b0030b))
* **db-schema:** add resource favorites, tags, activity log schema ([f7277bf](https://github.com/Esposter/Esposter/commit/f7277bf5db5f78490c5ffd62bab75e6b82c8e2bf))
* **db:** add Note resource_type enum value ([f337b6b](https://github.com/Esposter/Esposter/commit/f337b6b358a02b162d231b1a9369e3686ab0844f))
* **esbabbler:** automod word-filter actions + schema foundation ([1e433fb](https://github.com/Esposter/Esposter/commit/1e433fb42ca71fd0e849020ba37636be863b903a))
* **esbabbler:** consolidate file uploads, add thumbnails, room limits, and files tab ([87acbcf](https://github.com/Esposter/Esposter/commit/87acbcf61dac83023ebe2b98a2e433b2cc1c562a))
* **esbabbler:** thread-follow procedures + auto-follow + reply notifications ([9d5d5c5](https://github.com/Esposter/Esposter/commit/9d5d5c5eeaaefa9348b37b6e6a689876448b1631))
* **infra:** automatic dead-letter replay with attempt cap and quarantine ([4874ab6](https://github.com/Esposter/Esposter/commit/4874ab6677872e4970b54c7c5dfcc2acf5355447))
* **platform:** close the end-to-end survey funnel ([adc0d50](https://github.com/Esposter/Esposter/commit/adc0d50af12103710cbd5a85550d824c38f5deec))
* **platform:** TodoList due reminders ([78089f2](https://github.com/Esposter/Esposter/commit/78089f2475bc87e3070e3db57890d6f4507a282d))
* **resource:** soft delete, favorites, tags, activity log, trigram search ([f741b0f](https://github.com/Esposter/Esposter/commit/f741b0ff4d11082a14be098ab95d3ca9497b06ad))

### Performance Improvements

* **message:** read the create-message gate once instead of rule by rule ([ffa0e59](https://github.com/Esposter/Esposter/commit/ffa0e594d0aa3c7609f51105a4cce7eeade30aab))

# [2.35.0](https://github.com/Esposter/Esposter/compare/v2.34.2...v2.35.0) (2026-07-15)

### Bug Fixes

* add db migrations ([fabe3e0](https://github.com/Esposter/Esposter/commit/fabe3e077cf7c464e278f1870600d6f16b9b8f15))
* db schema ([831c8c1](https://github.com/Esposter/Esposter/commit/831c8c10aeda8a97a6f2b590a523f9edec2515c5))
* dedupe items + fix tests ([e2275f8](https://github.com/Esposter/Esposter/commit/e2275f86a19aa376e6537759cf11bb32f81b67a5))
* docs + skills ([fd274a1](https://github.com/Esposter/Esposter/commit/fd274a1db9f48dc3816a4ab00abe718f377605df))
* enums and arrays ([faa3f2f](https://github.com/Esposter/Esposter/commit/faa3f2fc2d8e7453fead1ba02cb9b0f294b1b70f))
* lint ([b048d55](https://github.com/Esposter/Esposter/commit/b048d55cf7f936c8012587c874607b16caa7f9da))
* lint + sanitize html ([cebc09e](https://github.com/Esposter/Esposter/commit/cebc09e9f1cae9eee5da927ea5b1b49a58455dcb))
* post-merge integration for esbabbler, platform, and posts branches ([a14af16](https://github.com/Esposter/Esposter/commit/a14af16951d55266948f62c378c7490a6854f166))
* snapshot ([1a341c4](https://github.com/Esposter/Esposter/commit/1a341c4e45b737c6550a6c2d1239a6682f0fd0f0))
* snapshots ([9764b23](https://github.com/Esposter/Esposter/commit/9764b23ba8be5cb84229baf997f54ce00c9cef98))
* test bundle size and refactor ([ecd748e](https://github.com/Esposter/Esposter/commit/ecd748e2e964936c9afb3061ae5d57f9bd05547f))
* types and partial lint ([b672a10](https://github.com/Esposter/Esposter/commit/b672a10ba489be55b40c1ef11b6aaef4c7e8f233))
* types and tests ([e4ae90a](https://github.com/Esposter/Esposter/commit/e4ae90a1b0cbd5139b28e9e6ffb53dbd3dea0bdc))
* wip ([cf2c92b](https://github.com/Esposter/Esposter/commit/cf2c92b108efb84bad50e151bb749b9cf3257bf8))

### Features

* dungeons milestone achievements ([4d630a7](https://github.com/Esposter/Esposter/commit/4d630a7a17347d2c1a4f52ef80ed18b25510c925))
* esbabbler mention badges + push-to-talk keybind with release delay ([3cc0602](https://github.com/Esposter/Esposter/commit/3cc060227b201fcac212b11be6d401312a9b5f74))
* **posts:** viewer-scoped likes, feed block filtering, and Hot/New/Top sort options ([72d5932](https://github.com/Esposter/Esposter/commit/72d5932e3f94ea2fd2f43f59b36cf3e830442d18))
* wip ([f7d2acf](https://github.com/Esposter/Esposter/commit/f7d2acf6441b61339c5ba3f099a1ab18e1687166))
* wip ([8789e7b](https://github.com/Esposter/Esposter/commit/8789e7baef6ac9a4730770e6e214f9f48bc997de))
* wip ([d70d22b](https://github.com/Esposter/Esposter/commit/d70d22b1982ce9ed30f1af0fee36f269f8b32312))

## [2.34.2](https://github.com/Esposter/Esposter/compare/v2.34.1...v2.34.2) (2026-07-05)

### Bug Fixes

* tests and types ([67fc659](https://github.com/Esposter/Esposter/commit/67fc6595f40dce01037dee4f1ee5c703b486d26a))

## [2.34.1](https://github.com/Esposter/Esposter/compare/v2.34.0...v2.34.1) (2026-07-04)

**Note:** Version bump only for package @esposter/db-schema

# [2.34.0](https://github.com/Esposter/Esposter/compare/v2.33.0...v2.34.0) (2026-07-04)

**Note:** Version bump only for package @esposter/db-schema

# [2.33.0](https://github.com/Esposter/Esposter/compare/v2.32.1...v2.33.0) (2026-07-03)

### Bug Fixes

* cleanup debug logs ([fa0a35d](https://github.com/Esposter/Esposter/commit/fa0a35daae80aadf3d32745aec9b4e5c165cc614))
* tests and snapshot ([ecf9684](https://github.com/Esposter/Esposter/commit/ecf9684d78fe741545cb785392a5dab40be237c3))

## [2.32.1](https://github.com/Esposter/Esposter/compare/v2.32.0...v2.32.1) (2026-07-01)

**Note:** Version bump only for package @esposter/db-schema

# [2.32.0](https://github.com/Esposter/Esposter/compare/v2.31.1...v2.32.0) (2026-07-01)

**Note:** Version bump only for package @esposter/db-schema

## [2.31.1](https://github.com/Esposter/Esposter/compare/v2.31.0...v2.31.1) (2026-06-25)

**Note:** Version bump only for package @esposter/db-schema

# [2.31.0](https://github.com/Esposter/Esposter/compare/v2.30.0...v2.31.0) (2026-06-25)

**Note:** Version bump only for package @esposter/db-schema

# [2.30.0](https://github.com/Esposter/Esposter/compare/v2.29.0...v2.30.0) (2026-06-24)

### Bug Fixes

* explicit ZodObject annotations for isolated-declaration schemas; self-contained sandbox-runtime bundle ([7bf39bc](https://github.com/Esposter/Esposter/commit/7bf39bcb60235cef870fc1dab9abba66fe313390))

### Features

* Discord-aligned Voice & Video settings + live-call wiring ([6997f2f](https://github.com/Esposter/Esposter/commit/6997f2ffab77643f91827915f5170ecb40601167))
* voice settings polish, screen-share stop + settings buttons ([64c9d23](https://github.com/Esposter/Esposter/commit/64c9d2342aff1bb565c381c53841afe7856597df))

# [2.29.0](https://github.com/Esposter/Esposter/compare/v2.28.0...v2.29.0) (2026-06-21)

### Bug Fixes

* **db-schema:** type roomsInMessage.type select column as RoomType enum ([7691de5](https://github.com/Esposter/Esposter/commit/7691de594eb203388a2261f0b978868da4e154bf))
* tests + remove unnecessary plugin ([420448a](https://github.com/Esposter/Esposter/commit/420448a450ce2056c68566e5da8326dbf1f9b700))
* unifying vitest ([8e3e6bf](https://github.com/Esposter/Esposter/commit/8e3e6bf186a7fecbd3054cf5b9e80e5763d3c8b0))

### Features

* **esbabbler:** DB-backed Discord-style user-settings surface ([b61bf66](https://github.com/Esposter/Esposter/commit/b61bf6649da89c1be1d1c38feef41bfe31c44dda))

# [2.28.0](https://github.com/Esposter/Esposter/compare/v2.27.0...v2.28.0) (2026-06-14)

### Bug Fixes

* cleanup code ([c377566](https://github.com/Esposter/Esposter/commit/c37756616760798a63929f537ae52300a27dbbef))
* code review comments ([3c654a9](https://github.com/Esposter/Esposter/commit/3c654a9376d85ff05d8e69acf372aca775830c6a))
* code review comments ([61cbffd](https://github.com/Esposter/Esposter/commit/61cbffd5767549d1a787bbd3bc0193bfd78733d4))
* lint ([e732b9a](https://github.com/Esposter/Esposter/commit/e732b9a8d6776ad352fc3ebf3b19428fd52f2414))
* lint and types ([dbd2cff](https://github.com/Esposter/Esposter/commit/dbd2cff9011d99d9fd6afa1a855a8a40a56673f7))
* no longer need bigint polyfill ([21c1723](https://github.com/Esposter/Esposter/commit/21c17237a32abe31e1ed30ccf3cca48cf4ac0eed))
* schemas ([f939bcb](https://github.com/Esposter/Esposter/commit/f939bcb5e32119e9cc7f6aebb62780dc61530e3c))
* snapshots and dev env for now ([c774f1c](https://github.com/Esposter/Esposter/commit/c774f1c58f72f5274c74bc97eca204d30bbc09ee))
* snapshots and tests ([9b2a6f2](https://github.com/Esposter/Esposter/commit/9b2a6f2102395a230ef4cd0b1f3a31fe37408c08))
* tests ([3c2a09b](https://github.com/Esposter/Esposter/commit/3c2a09bc8610503f6e2e925c6d4f029e87951c8f))
* tests and cleanup settings ([a0646c4](https://github.com/Esposter/Esposter/commit/a0646c454006cf2c074c5db89ae912e4e3b08876))
* wip ([fb38ad5](https://github.com/Esposter/Esposter/commit/fb38ad5ea5f2bc5fef84aa2fead3df34b262130c))
* wip ([ffb8b3e](https://github.com/Esposter/Esposter/commit/ffb8b3e25832225b6f177e9a8d331ea1bf813f09))

### Features

* Add reminders ([6f5d6b7](https://github.com/Esposter/Esposter/commit/6f5d6b70c233c74140864b5a4cca23df5a186d81))
* consolidate sanitize html to message ([b586502](https://github.com/Esposter/Esposter/commit/b5865027c92744e360110f522b4107df183fece2))
* wip ([4f094da](https://github.com/Esposter/Esposter/commit/4f094da70109cc17533f2e6d70bd995fac477d0d))

# [2.27.0](https://github.com/Esposter/Esposter/compare/v2.26.0...v2.27.0) (2026-06-05)

### Bug Fixes

* cleanup normalize string and add tests ([b5085f6](https://github.com/Esposter/Esposter/commit/b5085f677b00a8a5f705637d43de8dae6c66e4d4))
* code review comments ([f8352e9](https://github.com/Esposter/Esposter/commit/f8352e9303b3c0c224110bfd9b53eafef1c7ed7c))
* lint ([0d26fad](https://github.com/Esposter/Esposter/commit/0d26fadaa55242c04a2848ce2f40aa039a340489))
* refinement ([baa7e90](https://github.com/Esposter/Esposter/commit/baa7e9042946c79f36d562a60dc338affc423347))
* snapshot ([7ae781a](https://github.com/Esposter/Esposter/commit/7ae781a54fdb09bfe998ef544596609ac893c2ee))
* snapshot ([ab17d12](https://github.com/Esposter/Esposter/commit/ab17d1201b2bdee2d46711147b7f1fdb385fe1e8))
* tests + snapshots ([f09b387](https://github.com/Esposter/Esposter/commit/f09b387e51e6b7a6139a4f50189bd4cfcf97302c))
* tests and lint ([59bcf59](https://github.com/Esposter/Esposter/commit/59bcf59310701d7a1b49934bec2217ce3d77fc42))
* types ([cb3ac38](https://github.com/Esposter/Esposter/commit/cb3ac38452ba5c7f0253c4eccfdf9266997e272c))
* types and code review comments ([c01ab87](https://github.com/Esposter/Esposter/commit/c01ab8738a06ae40906b3726052f02e744989799))
* types and migrations ([3cb6145](https://github.com/Esposter/Esposter/commit/3cb6145d43cfb1e046fdf0f589bce9ecad311c3d))

### Features

* Add create unique array schema ([b3787f6](https://github.com/Esposter/Esposter/commit/b3787f68be7b0775fae39da02ca4aa57a60641f5))

# [2.26.0](https://github.com/Esposter/Esposter/compare/v2.25.0...v2.26.0) (2026-06-01)

### Bug Fixes

* add isWindows check ([2b101a5](https://github.com/Esposter/Esposter/commit/2b101a5b8d67bb0751d1c7ef01b0253e6aef8190))
* cleanup packages ([157c130](https://github.com/Esposter/Esposter/commit/157c13093d0967636982c33e2097b76cc18a353f))
* cleanup vitest config to also be shared package ([8c9e5c6](https://github.com/Esposter/Esposter/commit/8c9e5c6a9e2573485c899db3ccaf3b71f0320fe1))
* delete if exists mock ([7515580](https://github.com/Esposter/Esposter/commit/751558025e548c9b63b7fa1279f64a96445209c5))
* format + perms ([5231b9a](https://github.com/Esposter/Esposter/commit/5231b9a3ec19477ee70573477273d7ba312d3659))
* lint and test snapshots to include linux ([2389fbc](https://github.com/Esposter/Esposter/commit/2389fbc9f692c65fcff37f5e4e766af6b3e3f722))
* migrations + types ([444c5e4](https://github.com/Esposter/Esposter/commit/444c5e42213ab207348e07cc5f845f477c50caf2))
* tests ([1f10236](https://github.com/Esposter/Esposter/commit/1f10236637acb9c78de2d2b876534e6474c2f743))
* tests ([f6db3be](https://github.com/Esposter/Esposter/commit/f6db3bec16323874196b7354f2611f7b146edac5))
* types ([a2fa725](https://github.com/Esposter/Esposter/commit/a2fa7257dc13b80c2ce16056b5e561410dada691))
* vitest config ts ([204792c](https://github.com/Esposter/Esposter/commit/204792cec21bf26495477d793f106dbd99f84ce6))
* wip tests ([87dcb4d](https://github.com/Esposter/Esposter/commit/87dcb4db2a8b0b2d3de7d9eca87d6daab9a47056))

### Features

* Add bundle tests + fix up mocking ([b6db055](https://github.com/Esposter/Esposter/commit/b6db055d8d087fc7cc61e3226939d41d8817f730))
* Add create/delete group dms ([649ea22](https://github.com/Esposter/Esposter/commit/649ea2285c47909ce365c5f38b8a1e5fe21cc344))
* Add dts bundle size tests ([dfc255a](https://github.com/Esposter/Esposter/commit/dfc255a50259cc6364b6edd97dcd5403c775aa1d))

# [2.25.0](https://github.com/Esposter/Esposter/compare/v2.24.0...v2.25.0) (2026-05-21)

**Note:** Version bump only for package @esposter/db-schema

# [2.24.0](https://github.com/Esposter/Esposter/compare/v2.23.0...v2.24.0) (2026-05-15)

### Bug Fixes

* calls and cleanup things ([37e883e](https://github.com/Esposter/Esposter/commit/37e883ed639746dd92874586ece2bd2c4686bcef))
* code review comments ([bd48985](https://github.com/Esposter/Esposter/commit/bd48985d5b7be7b293ffacbde1ae72c73bb7b6ef))
* code review comments ([5e9378c](https://github.com/Esposter/Esposter/commit/5e9378c1e7829e24b0bcd522a102834025eff67a))
* code review comments ([67911c7](https://github.com/Esposter/Esposter/commit/67911c7d9edc28d080151799faccaaa53a949ebc))
* lint ([6acddc6](https://github.com/Esposter/Esposter/commit/6acddc6ef48c5d63d2c3ba93e078491fa79dcfc4))
* lint ([32ba662](https://github.com/Esposter/Esposter/commit/32ba662e213f7f784ada82b2badeebed294d4cbe))
* lint ([21f7754](https://github.com/Esposter/Esposter/commit/21f775451c6975f87c6cd7a244053a34abba0f05))
* remove redundant primary keys ([cc08d6d](https://github.com/Esposter/Esposter/commit/cc08d6d31c6ac36f9bc32155e7d65437e9f491b3))
* tests ([ef2fa28](https://github.com/Esposter/Esposter/commit/ef2fa288910a7e5b53651e92a368b411fbbdfe82))
* typechecking and code review comments ([2a85e3f](https://github.com/Esposter/Esposter/commit/2a85e3fe2652b11a563b91e1749a6f1ce38be6dc))

### Features

* add nickname ([074449a](https://github.com/Esposter/Esposter/commit/074449a3d2a8ee58bcd32edb361abde4c19e0fc4))

# [2.23.0](https://github.com/Esposter/Esposter/compare/v2.22.0...v2.23.0) (2026-05-07)

### Bug Fixes

* also make table names camel case, now all namings are aligned ([c504b0e](https://github.com/Esposter/Esposter/commit/c504b0e68c6b5247ef34cb763c86aabd15a1bf64))
* code comment issues ([52e4bfb](https://github.com/Esposter/Esposter/commit/52e4bfb58fa542500f56552f7a1a658a7077d0f6))
* nitpicks ([5f25d3a](https://github.com/Esposter/Esposter/commit/5f25d3af3fe585fd91472320d50ddb5253875ab9))
* regex lint ([c8d3ead](https://github.com/Esposter/Esposter/commit/c8d3eadad12fe7b292fd0f10a864c742d0b65edd))
* relations ([22defa7](https://github.com/Esposter/Esposter/commit/22defa7c4cc42b64c4138b660345657e3c64f36b))
* remaining migrations ([14c864f](https://github.com/Esposter/Esposter/commit/14c864f5b31a0c61544e07bd34ea18bbd9df1af2))
* remove unnecessary bookmarks feature ([cf27594](https://github.com/Esposter/Esposter/commit/cf275943c727cc6f63baa90d7aa8070ebc5f063d))
* slowmode checks etc ([9da9054](https://github.com/Esposter/Esposter/commit/9da905406baf74b2e9670cb78f34e57c1a49b4d6))
* test and migration ([ce03487](https://github.com/Esposter/Esposter/commit/ce03487ae2a7bad1c986876780dcd92e826526d3))
* transforms + types + align skills md ([7da475a](https://github.com/Esposter/Esposter/commit/7da475a6634d312ae299b13960688b61e6494191))
* types ([7c17571](https://github.com/Esposter/Esposter/commit/7c1757190737bd9984e7d3de9f8f963cb247cceb))
* types ([80728a1](https://github.com/Esposter/Esposter/commit/80728a16da11440d4ad4583040a98dd45cb2a7a7))

### Features

* add topic/drafts features ([0818c28](https://github.com/Esposter/Esposter/commit/0818c281d530e4a6fce3eb6e32b2d33d3659b81b))
* upgrade drizzle ([17b9f41](https://github.com/Esposter/Esposter/commit/17b9f41b180ba109382d34e9507ead13cbbb95b2))
* wip ([16aab97](https://github.com/Esposter/Esposter/commit/16aab97be86dead24d438cb654f16e73117e6304))

# [2.22.0](https://github.com/Esposter/Esposter/compare/v2.21.0...v2.22.0) (2026-04-28)

### Bug Fixes

* add back junction table relations ([2631f2d](https://github.com/Esposter/Esposter/commit/2631f2dfbe6d35541b0ae8e7d0e6731a2a5b7633))

* also migrate db checks ([43dfd26](https://github.com/Esposter/Esposter/commit/43dfd26ef51d53f4e3e9f06c9c9c1c983d616c47))

* batch room ids ([e8fc438](https://github.com/Esposter/Esposter/commit/e8fc438c41f3f4d9caeb2c5da0b4ab401837dc2b))

* code review comments ([346b7f9](https://github.com/Esposter/Esposter/commit/346b7f947c18f6a1dc753b530f22be69e74db5b7))

* code review comments ([bc643c3](https://github.com/Esposter/Esposter/commit/bc643c377fee97f8a68ee71c66d7bbd3c9dbdf8d))

* code review comments ([c655535](https://github.com/Esposter/Esposter/commit/c65553551e8cb9561f2b46fa21af2a50827a82cf))

* code review comments ([144d33c](https://github.com/Esposter/Esposter/commit/144d33c40c6a9f643ede58a9922c5defb8742342))

* index names ([bd355d6](https://github.com/Esposter/Esposter/commit/bd355d62e8afafdbdd667745e8592f45ff2f9461))

* lint ([09df7c8](https://github.com/Esposter/Esposter/commit/09df7c8525373de546369ecaca9f6952e3338021))

* lint and foreign keys ([edc697b](https://github.com/Esposter/Esposter/commit/edc697bbf7d9f89fd1d67f4232e63004da84956e))

* lint and review comments ([df9ad6d](https://github.com/Esposter/Esposter/commit/df9ad6d05530f162021e2e754f94e10f37d57db8))

* migration wip ([73268a8](https://github.com/Esposter/Esposter/commit/73268a856748e134bf1866af4bcfd3faf264862e))

* more type issues ([6a468b6](https://github.com/Esposter/Esposter/commit/6a468b6c2b2b0f3579737dcb1c466f394210cf2e))

* move bigintpolyfill ([ce96d0e](https://github.com/Esposter/Esposter/commit/ce96d0e6395ee0939e4a91475975e668c633f237))

* move create mock db ([b024631](https://github.com/Esposter/Esposter/commit/b0246312f69f77e2db4ace0803688b64b3b16304))

* move create mock db back to node build ([46122a8](https://github.com/Esposter/Esposter/commit/46122a8a2fd1083dc9b8b17a561993bc75b557c7))

* name for direct message is null ([61a7af5](https://github.com/Esposter/Esposter/commit/61a7af5c7a34e90549e98b2b9f0e3c749079da76))

* pg table types ([49e7ca0](https://github.com/Esposter/Esposter/commit/49e7ca035936d289bdad23049b78469ae52c26ac))

* pg table types ([b4972cd](https://github.com/Esposter/Esposter/commit/b4972cd5bffd3501e6ff4469ca888819fcddd027))

* refactor things ([3be1176](https://github.com/Esposter/Esposter/commit/3be11767c8d48da3ff66265a4ec3c066380ef51c))

* refactor to relational api ([dd22cd9](https://github.com/Esposter/Esposter/commit/dd22cd9b86434029b93f95575726ea1c07f3c1bb))

* refactors ([582bbfb](https://github.com/Esposter/Esposter/commit/582bbfbfa973c7f7fc944881259df93ab05cf9d0))

* relations ([b08c6aa](https://github.com/Esposter/Esposter/commit/b08c6aa677dd942658c6e7af366bb6a76f0f8ad2))

* relations ([606f1cb](https://github.com/Esposter/Esposter/commit/606f1cbb9f58106485052673e9808d7d78583620))

* remaining types ([56b8b10](https://github.com/Esposter/Esposter/commit/56b8b102d57f3e9a343fe04f80efe9e95a59a187))

* remove now unnecessary todo ([bf4f72d](https://github.com/Esposter/Esposter/commit/bf4f72d344241eafe8f6f452ec3ce0160825f9af))

* renames ([03a7ec7](https://github.com/Esposter/Esposter/commit/03a7ec76f8e24247bbf658885df8377f1778423f))

* room permissions ([1ceae16](https://github.com/Esposter/Esposter/commit/1ceae1644034f52ca9cd0e4ba5e9ffc2da801c3a))

* some lint issues ([6ac5961](https://github.com/Esposter/Esposter/commit/6ac596184c37d1b4ac79298de564541066f01895))

* types ([8d48f18](https://github.com/Esposter/Esposter/commit/8d48f1819894240c85a5e5b43191a95141a92f34))

* types ([9430781](https://github.com/Esposter/Esposter/commit/94307815f5f35b3bcd8e97f953cc01f9a29d895a))

* types ([caf4700](https://github.com/Esposter/Esposter/commit/caf47007ad6bfaada08adca4c7283361e3995d61))

* types ([82fdfeb](https://github.com/Esposter/Esposter/commit/82fdfeb804d2d780aa94ae411d65d2d0bda8d375))

* wip ([7bcd4ec](https://github.com/Esposter/Esposter/commit/7bcd4ecf53bdd44ad7dee8a2fb5a9ec429718a40))

* wip ([821d331](https://github.com/Esposter/Esposter/commit/821d331f5b0301ec37e0a5b6269e64d66fbb07cb))

* zod schemas ([d9eb27d](https://github.com/Esposter/Esposter/commit/d9eb27d957eb704d5b221c7278ace1c6717dbdab))

### Features

* add back users to rooms relations ([811708c](https://github.com/Esposter/Esposter/commit/811708c54c85cd13c37d0c6c1af6da1c53d7731f))

* Add bio ([9ba1709](https://github.com/Esposter/Esposter/commit/9ba17094fdc4456bbc50705e067274960c083795))

* Add roles ([6374285](https://github.com/Esposter/Esposter/commit/6374285474f5aba65309e59e5270ec1ad1816b06))

* Add search history relations ([07d5f2e](https://github.com/Esposter/Esposter/commit/07d5f2e767d13b987a66f9aeafdf1cc4fc0da9e1))

* Add UI ([b09c23d](https://github.com/Esposter/Esposter/commit/b09c23da94ebd67c6382997e58d8d70d9e2aecdb))

* Add user achievement relations ([8ff1f6e](https://github.com/Esposter/Esposter/commit/8ff1f6e50e9c208a71fce04dec37c8cf2f6a8183))

* migrate accounts ([1c61085](https://github.com/Esposter/Esposter/commit/1c61085a1cf933e9aaaa24c142f18efb6cdca472))

* migrate achievements ([ca343c9](https://github.com/Esposter/Esposter/commit/ca343c92cef4e9e093e16d4d8666af959cbc166c))

* migrate app users ([c7053e4](https://github.com/Esposter/Esposter/commit/c7053e45485601ab9bbc2dbb5a716267e93f1001))

* migrate invites ([a126d6b](https://github.com/Esposter/Esposter/commit/a126d6b5636d4ce0eea67593daf342ea9fb59b82))

* migrate likes ([af6b2ce](https://github.com/Esposter/Esposter/commit/af6b2ce9b5bf38393189a772e55c2648f4df6482))

* migrate posts ([50d6075](https://github.com/Esposter/Esposter/commit/50d607537b525f3ad23f792a21f20c4e5cc45f15))

* migrate push subscriptions ([bcc7f9a](https://github.com/Esposter/Esposter/commit/bcc7f9abfe53ec854f317534a08fb1e8c1f25608))

* migrate search histories ([3cfbdab](https://github.com/Esposter/Esposter/commit/3cfbdabf4fa01c4dfe6b03520f75c14be5aa9683))

* migrate sessions ([cbe93bc](https://github.com/Esposter/Esposter/commit/cbe93bcbe3b974f2f1b739764044a97c9d74c64e))

* migrate surveys ([cd98bcd](https://github.com/Esposter/Esposter/commit/cd98bcd8921f5972cf2dea65c8b0559c328895e9))

* migrate syntax for like,post and achievements ([57eaa25](https://github.com/Esposter/Esposter/commit/57eaa25e4870069e16b55d9233fb74d86ecd3bd0))

* migrate user statuses in message ([ffe3408](https://github.com/Esposter/Esposter/commit/ffe34083300de924820139a4898943c277477f96))

* migrate user to rooms in message ([49ee9f2](https://github.com/Esposter/Esposter/commit/49ee9f2fe536592f2c26a02829773e3aeff40e9b))

* migrate users ([52a6899](https://github.com/Esposter/Esposter/commit/52a6899f504f58f31e24b694d79ad14b1cef0420))

* migrate webhooks ([13db264](https://github.com/Esposter/Esposter/commit/13db2645fde13ae4bac6e77fd12ab54d20a65ab0))

* moderation wip ([c9b5310](https://github.com/Esposter/Esposter/commit/c9b5310d50b22ce68fb27d2975fc36ed20494602))

* pull and add relations ([e5ba7bf](https://github.com/Esposter/Esposter/commit/e5ba7bfa7a55390ed0e0f1c4e46ed29866ebc881))

# [2.21.0](https://github.com/Esposter/Esposter/compare/v2.20.0...v2.21.0) (2026-04-15)

### Bug Fixes

* actually include room categories in schema ([9699eb7](https://github.com/Esposter/Esposter/commit/9699eb77e0962a0f8bfc17076499d8e6a87d2c0e))

* cleanup schemas to be non-negative ([db5d026](https://github.com/Esposter/Esposter/commit/db5d026529d7860a74164ed66e478c70c918e896))

* deps + disable unnecessary type args ([13cc22a](https://github.com/Esposter/Esposter/commit/13cc22a02897aa84b7cb637412a64d37aacbe2bd))

* docs ([404622d](https://github.com/Esposter/Esposter/commit/404622dd7447dda768cfd7f53d3a0ed8b84840a4))

* friend req table ([2dc91c8](https://github.com/Esposter/Esposter/commit/2dc91c8778f85f23cc90cdaea0e75bbf7964a80a))

* lint ([9ead58f](https://github.com/Esposter/Esposter/commit/9ead58f7fa5276723753b4dc9c328061ff342bbf))

* relations ([f6bc608](https://github.com/Esposter/Esposter/commit/f6bc60848404aa400f12b4916f026a78151805ef))

* review comments ([7d73920](https://github.com/Esposter/Esposter/commit/7d739208fff3c295296afda42e3dedce484b25cd))

* review comments ([2396844](https://github.com/Esposter/Esposter/commit/23968440ae923c0fd1d1fce3d178eb69c31485c4))

* types ([ea4a525](https://github.com/Esposter/Esposter/commit/ea4a525ca46f0bbec11e23a1b458a5755e164ace))

* user to rooms table ([a0426de](https://github.com/Esposter/Esposter/commit/a0426dea6ca3df478e17cd00525ad3d288f99e45))

### Features

* Add DMs ([d6315b1](https://github.com/Esposter/Esposter/commit/d6315b1a385e9df8bfcc720394bdd666bd6ffd89))

* add friend request notification ([3bbd448](https://github.com/Esposter/Esposter/commit/3bbd448dcc23330bee926215d8ad196ce0388c94))

* Add friends ([9ff1c3e](https://github.com/Esposter/Esposter/commit/9ff1c3e02c6c016d358189b7fe557d48273e54ef))

* Add slash commands ([89d5ffc](https://github.com/Esposter/Esposter/commit/89d5ffce07f42e847f8d37d534174bcd40461c5f))

* implement features + fix lint ([e62cdd4](https://github.com/Esposter/Esposter/commit/e62cdd42a44775ba52e06d57030da740c61e1a7a))

* wip ([7e5afb7](https://github.com/Esposter/Esposter/commit/7e5afb71132ca4db8a2c55bb15916e583095cfd4))

* wip ([efdfaeb](https://github.com/Esposter/Esposter/commit/efdfaeb3ee1b86edf2083dbc1f02fb3338111663))

# [2.20.0](https://github.com/Esposter/Esposter/compare/v2.19.2...v2.20.0) (2026-03-29)

### Bug Fixes

* extends ([a0490c9](https://github.com/Esposter/Esposter/commit/a0490c9ab0829bd91590aed7a5649eec61525167))

* format + fix up some ignores ([6cd632f](https://github.com/Esposter/Esposter/commit/6cd632ff672ad8e0adee51b42cb6f6925f894b96))

* lint ([e2c4dd5](https://github.com/Esposter/Esposter/commit/e2c4dd52af7b1bbbbd3b7eacec95ff9a201d0b57))

* lint ([5a8028b](https://github.com/Esposter/Esposter/commit/5a8028b6d7320ef1b64a3e9be05437d1f20e2e01))

* lint ([36ee460](https://github.com/Esposter/Esposter/commit/36ee460ee9e2df82331b4fd852e4be5a1878cd6e))

* lint ([62401c8](https://github.com/Esposter/Esposter/commit/62401c8447d5401188f849051a54f8fcdb313cbc))

* merge conflicts ([09e04f7](https://github.com/Esposter/Esposter/commit/09e04f7f3c063bf8cb115e1172ae2c53aa95a8ca))

* satisfies ([aeb7b1f](https://github.com/Esposter/Esposter/commit/aeb7b1f12e6775a98d002ce5d7e263874b7875cc))

* types ([5c87276](https://github.com/Esposter/Esposter/commit/5c872765137f747621af219e2987c5d862728432))

* types ([728e6df](https://github.com/Esposter/Esposter/commit/728e6dfa38d44fa104cba6d29e1e02ae4c74b3ec))

* types ([7ce2839](https://github.com/Esposter/Esposter/commit/7ce28397859a6d943f2959f40be7c15a96368ee9))

### Features

* Add oxlint type aware ([eb40e2d](https://github.com/Esposter/Esposter/commit/eb40e2d7da8c606c66053582284264e0fb3a2592))

* migrate to oxfmt ([e7a0212](https://github.com/Esposter/Esposter/commit/e7a0212f9ec18d7193c96cc6069ac6ecf168e8bb))

* switch to tsgo ([1e504b3](https://github.com/Esposter/Esposter/commit/1e504b3a6ce5144dadbdd9bc543018a35e7b6808))

## [2.19.2](https://github.com/Esposter/Esposter/compare/v2.19.1...v2.19.2) (2026-02-05)

**Note:** Version bump only for package @esposter/db-schema

## [2.19.1](https://github.com/Esposter/Esposter/compare/v2.19.0...v2.19.1) (2026-02-05)

**Note:** Version bump only for package @esposter/db-schema

# [2.19.0](https://github.com/Esposter/Esposter/compare/v2.18.2...v2.19.0) (2026-02-05)

### Bug Fixes

* lint ([8de2c97](https://github.com/Esposter/Esposter/commit/8de2c976c7ead4bb24607b7f28a2d50006ab7202))

* lint ([7ace84b](https://github.com/Esposter/Esposter/commit/7ace84b2f3add94d5f555c17d5f3751864f0427b))

* oxlint ([3df2ec1](https://github.com/Esposter/Esposter/commit/3df2ec1ad17f36d77780656e27d3034cd3ac32de))

### Features

* **test:** add message tests ([3673b8e](https://github.com/Esposter/Esposter/commit/3673b8e6f0923a5761c058a333425617e639414d))

* **test:** Add misc tests ([bcd0a9c](https://github.com/Esposter/Esposter/commit/bcd0a9c847f45a4686e126e2a10d5b8a9a704c10))

* **test:** Add some omit tests ([0a44737](https://github.com/Esposter/Esposter/commit/0a44737e9535ed6de24533d40a670e41cdffdd73))

* **test:** add some text tests ([1e251d1](https://github.com/Esposter/Esposter/commit/1e251d1b31a66127e4fb379bed5bc20274cd26b1))

## [2.18.2](https://github.com/Esposter/Esposter/compare/v2.18.1...v2.18.2) (2025-12-10)

**Note:** Version bump only for package @esposter/db-schema

## [2.18.1](https://github.com/Esposter/Esposter/compare/v2.18.0...v2.18.1) (2025-12-10)

**Note:** Version bump only for package @esposter/db-schema

# [2.18.0](https://github.com/Esposter/Esposter/compare/v2.17.0...v2.18.0) (2025-12-10)

### Bug Fixes

* add achievement definitions + only show achievement snackbar for authed users ([458b26a](https://github.com/Esposter/Esposter/commit/458b26afbcc53a9e391bb5380ecfc9437b7c004f))

* add mathwhiz + fix up recursive get props ([294460d](https://github.com/Esposter/Esposter/commit/294460dde615386683fb7bd0de3c5bf0d8e55b90))

* definitions ([e7d2301](https://github.com/Esposter/Esposter/commit/e7d2301406c39b5cfd58e6537dd4f1786f1ffb3d))

* imports ([f953ac2](https://github.com/Esposter/Esposter/commit/f953ac249d0881c59e6dfaf2dc7f0581cb333c13))

* more fixes ([fe2193a](https://github.com/Esposter/Esposter/commit/fe2193ab7831a3b9bc0eab12003f78175417eea1))

* tests ([be2a1be](https://github.com/Esposter/Esposter/commit/be2a1be6c92da786751c3c58cbbbf4da0a671912))

* types ([977d0d1](https://github.com/Esposter/Esposter/commit/977d0d1b2d77756a24381cb7ede390bbd0a36875))

* types ([aada69f](https://github.com/Esposter/Esposter/commit/aada69f31c3e199bd814e013883462b0b7f7fcd5))

* use esm imports ([e583736](https://github.com/Esposter/Esposter/commit/e5837369bff15c20868d9486d93bf5192c48c58c))

### Features

* Add achievement definitions ([97accb3](https://github.com/Esposter/Esposter/commit/97accb397c869a649855cff7b486b6c6a46de8bc))

* Add achievements ([b77aa1d](https://github.com/Esposter/Esposter/commit/b77aa1d74af96d1e1445b94417f798b69464a1e4))

* add activity plugin ([75aab58](https://github.com/Esposter/Esposter/commit/75aab58238f9a64954c2cff870f3a5ffc1536f01))

* Add endpoints for user room settings ([316ccff](https://github.com/Esposter/Esposter/commit/316ccff0a3fb23f701778b1004a1af0bf0d7de34))

* Add more definitions ([4d8e17d](https://github.com/Esposter/Esposter/commit/4d8e17d00457ffe5efcbf2bea10c8e11946446e5))

* Add more definitions ([59623cf](https://github.com/Esposter/Esposter/commit/59623cf708634b9c9c2b7cda75dafde61bf6142c))

* Add notification settings button ([0f49913](https://github.com/Esposter/Esposter/commit/0f49913a0190ea3784e549a0264ef3711d06338c))

* Add procedure type ([b63f37d](https://github.com/Esposter/Esposter/commit/b63f37d1512c5a85265527e209580379f33eebda))

# [2.17.0](https://github.com/Esposter/Esposter/compare/v2.16.0...v2.17.0) (2025-11-03)

### Bug Fixes

* align webhook schema with discord ([1608774](https://github.com/Esposter/Esposter/commit/160877412cbc2f37977e61ac2b4171c6e2f35f72))

* don't send notif to self ([eb5be0d](https://github.com/Esposter/Esposter/commit/eb5be0dece285943425a09199ac6a5a74f701bfd))

### Features

* Add mock queue client ([079340a](https://github.com/Esposter/Esposter/commit/079340a01b61f47cb0ac753cc811de5676dc0e65))

* Add queue pushing ([5bf052a](https://github.com/Esposter/Esposter/commit/5bf052a89762871279ce4c310d11c6060097cf45))

* migrate to event grid instead of storage queue ([6987115](https://github.com/Esposter/Esposter/commit/69871155a7f1114cb62229173c4c70a7f3ce1d81))

# [2.16.0](https://github.com/Esposter/Esposter/compare/v2.15.1...v2.16.0) (2025-10-19)

### Bug Fixes

* add default so it knows it's serializable ([6b48a76](https://github.com/Esposter/Esposter/commit/6b48a76e6121f7e7c5f3f2dbeda07dbb549abd58))

* add test to db-schema ([a97f2d1](https://github.com/Esposter/Esposter/commit/a97f2d1e9a565c7a48ec6209648090836d6930e8))

* assign property ([319d129](https://github.com/Esposter/Esposter/commit/319d1296ca4fdf8fc2d3c8cb7cb6894438802cc0))

* better split between webhook messages and standard messages ([e73a83c](https://github.com/Esposter/Esposter/commit/e73a83c8abdea17047523594507155149d895923))

* cleanup input to grab from payload better ([4bb8d58](https://github.com/Esposter/Esposter/commit/4bb8d58d57f82f6195461dc5af506e24ef3e3508))

* cleanup packages to have peer deps for db-schema ([b5ffa35](https://github.com/Esposter/Esposter/commit/b5ffa35df2c5d61c7eba8104c911b82cd75a4525))

* constructor ([292e9b5](https://github.com/Esposter/Esposter/commit/292e9b502d5af9e951276bda81f72f1bad65d431))

* instantiate class based on type ([c2ca9f7](https://github.com/Esposter/Esposter/commit/c2ca9f7cb55baab5a1f3d3f37645b613b5a57d46))

* make getting env function so it is always latest ([9b11dd5](https://github.com/Esposter/Esposter/commit/9b11dd5e6ec352913050100bd50da0575c6875a6))

* move shared code to db-schema away from server code ([610c70e](https://github.com/Esposter/Esposter/commit/610c70e1b5bbbb831f622877bf35fd0ddb48fa56))

* put back the environments ([3ea1f39](https://github.com/Esposter/Esposter/commit/3ea1f39fe69d86c3c35fd84ec412079e4b013f60))

* rename folder casing ([1ccbd62](https://github.com/Esposter/Esposter/commit/1ccbd629a418bd496c3d3a658250819827891241))

* try test class ([fdf942a](https://github.com/Esposter/Esposter/commit/fdf942a960f58e5dea0ca1eaf3b855c91c688cc8))

* types ([712b162](https://github.com/Esposter/Esposter/commit/712b162a5faeb15a869596792bb48323e1943890))

* types ([ac3f01c](https://github.com/Esposter/Esposter/commit/ac3f01ca3e4a6bbde3c3af12e0efce9b0ac89262))

* webhook entity constructor ([2981a76](https://github.com/Esposter/Esposter/commit/2981a7698f4235f322d3f909b08961651ad29ac5))

### Features

* Add web pubsub ([bf65e17](https://github.com/Esposter/Esposter/commit/bf65e170039e7307b9ec24792176b883206dbeb8))

* Add web push to azure func ([cda5d52](https://github.com/Esposter/Esposter/commit/cda5d529235d8d317fb9cd615969cfd68443e697))

* Add webhook UI ([68db86b](https://github.com/Esposter/Esposter/commit/68db86b98a9faebc666e1f7e86ee7cdcf0115597))

### Performance Improvements

* externalise common packages to minimize space ([62b4756](https://github.com/Esposter/Esposter/commit/62b475665ee55ec26f6a698c97df8bd60dd31723))

## [2.15.1](https://github.com/Esposter/Esposter/compare/v2.15.0...v2.15.1) (2025-10-10)

### Bug Fixes

* schema ([6869f80](https://github.com/Esposter/Esposter/commit/6869f80e081eb0e3c594c500b81b6d2733d460bc))

* split to db-schema pkg that is browser-friendly ([549fcac](https://github.com/Esposter/Esposter/commit/549fcacfe755039fb2a85e17baaa11f2ddfc6d4f))
