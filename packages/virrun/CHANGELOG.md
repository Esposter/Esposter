# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.39.0](https://github.com/Esposter/Esposter/compare/v2.38.1...v2.39.0) (2026-09-04)

### Bug Fixes

* **ci:** unbreak the function deploy pnpm 12 broke, and pin the rule ([6c874d2](https://github.com/Esposter/Esposter/commit/6c874d274abeab8072e782838c709f9db86bff7f))
* rewrap the comment lines capitalized-comments renamed an identifier on ([10c74e6](https://github.com/Esposter/Esposter/commit/10c74e6eed1706782c4851615d9f7a30cbd2653f))
* **scripts:** target devEngines.runtime rather than its first sibling ([17598de](https://github.com/Esposter/Esposter/commit/17598de1d775a274b311c6c500f29e3b0ca232bf)), closes [#1126](https://github.com/Esposter/Esposter/issues/1126)
* **use-mutation:** superseding a key drops its joinable read too ([385ed67](https://github.com/Esposter/Esposter/commit/385ed67910687a9155dfbbf20a0a702f33cbee28))
* **virrun:** a cold WSL distro is not a host that cannot sandbox ([47a7033](https://github.com/Esposter/Esposter/commit/47a70335f26738cd2c3fa4b7ac3d984113c7d037))
* **virrun:** isSnapshotLowerPath is a field, so it keeps its `is*` ([02554e7](https://github.com/Esposter/Esposter/commit/02554e74026ed401fdbe39be7304d0af4636fafc))

### Performance Improvements

* **ci:** install pnpm and node from GitHub releases via pnpm/setup ([60cd635](https://github.com/Esposter/Esposter/commit/60cd6359cb01ce321529629ed06f92e954a06209))
* **platform:** the build generates its own barrel, and skips it when it can ([696835c](https://github.com/Esposter/Esposter/commit/696835c457837d8737b8cd09b940dc97577cfc24))

## [2.38.1](https://github.com/Esposter/Esposter/compare/v2.38.0...v2.38.1) (2026-08-23)

**Note:** Version bump only for package virrun

# [2.38.0](https://github.com/Esposter/Esposter/compare/v2.37.2...v2.38.0) (2026-08-23)

### Bug Fixes

* answer the docs review, and correct three claims it caught ([934d624](https://github.com/Esposter/Esposter/commit/934d624f43ef339ea14f2b8e0b29867611c3f8ba))

### Features

* **emoji:** tone-sensitive reactions, a reaction hover card and the Reactions dialog ([6ae1cbf](https://github.com/Esposter/Esposter/commit/6ae1cbfbde31b955572f2d9eb8c0119620fd3f07))
* **lint:** ban try/catch and .then, and stop restating what oxlint enforces ([5263dd3](https://github.com/Esposter/Esposter/commit/5263dd373647adeb3dc1c03290bf24b731db31fd))

## [2.37.2](https://github.com/Esposter/Esposter/compare/v2.37.1...v2.37.2) (2026-08-14)

**Note:** Version bump only for package virrun

## [2.37.1](https://github.com/Esposter/Esposter/compare/v2.37.0...v2.37.1) (2026-08-14)

**Note:** Version bump only for package virrun

# [2.37.0](https://github.com/Esposter/Esposter/compare/v2.36.0...v2.37.0) (2026-08-14)

### Bug Fixes

* address CodeRabbit review findings ([61fc14a](https://github.com/Esposter/Esposter/commit/61fc14a766d3f46c5f141f3e3e9cf3846ca40198))
* **build:** stop the shared build preset from squatting on configuration's own build config ([7926319](https://github.com/Esposter/Esposter/commit/792631944592810a2a60eb24184fdd0c3de45555))
* close the review findings in the mirror excludes and the review workflow ([fa4d878](https://github.com/Esposter/Esposter/commit/fa4d878d4ab302ae9fd487d9c3c59dfdfa647a02))
* close the review findings on the drained release window ([f9290fe](https://github.com/Esposter/Esposter/commit/f9290fe9406f62b9a73858e6e96f542e944abbb7))
* code review comments ([813b854](https://github.com/Esposter/Esposter/commit/813b854939772e4f8600b85116a22dfbe6374d2b))
* derive worktree excludes from git's recorded facts ([f3f1c65](https://github.com/Esposter/Esposter/commit/f3f1c65e0c37f1528f9cc3da2d114bba04527178))
* keep a ..-prefixed worktree directory nested ([efb0c51](https://github.com/Esposter/Esposter/commit/efb0c51550ce11361d4ad7a2f47ffa8a194f316a))
* lint ([7a9e825](https://github.com/Esposter/Esposter/commit/7a9e825b34ed00c6adfcec467d01a2f34b188e40))
* lint ([8ea0a30](https://github.com/Esposter/Esposter/commit/8ea0a305c5acc01dbd0d53a1bf79ee9277108ae7))
* parse virrun's machine JSON without the date reviver ([68a2d24](https://github.com/Esposter/Esposter/commit/68a2d24949a1d5d4f6252ab163bb1978feeb370a))
* remove disabling necessary rules ([17369c1](https://github.com/Esposter/Esposter/commit/17369c1a6e09bfcb3391539dfb803bb9abfe9f3a))
* resolve the mirror excludes once from the run's environment ([6b687cc](https://github.com/Esposter/Esposter/commit/6b687cc16931fa233f61634973aa54079f87736c))
* **review:** address the open CodeRabbit findings ([68a3331](https://github.com/Esposter/Esposter/commit/68a333188408d4fdb3ef1c559c86247cb5a13a72))
* **review:** address the second round of CodeRabbit findings ([f8d62ad](https://github.com/Esposter/Esposter/commit/f8d62adef4e085c173530816c463ff814d73e2c8))
* **review:** close the backfill race and the stale-binding window ([51f2a99](https://github.com/Esposter/Esposter/commit/51f2a99aa7963b6ee78a027ed889e49aacc3b732))
* snapshot ([74cce8f](https://github.com/Esposter/Esposter/commit/74cce8fac939bc372ab413fbd8a8be1864c61941))
* test renames ([c106891](https://github.com/Esposter/Esposter/commit/c1068915c3c9e9f277332641a328e010ea7abe33))
* virrun ghost paths ([4ab9236](https://github.com/Esposter/Esposter/commit/4ab923680fd64aa3e2dc59c960403f1f8290768a))
* **virrun:** neutralize an ambient NO_COLOR in the failure-role format test ([022f6cd](https://github.com/Esposter/Esposter/commit/022f6cdbeb7fbd046b62c109381c028bf11d058f))

# [2.36.0](https://github.com/Esposter/Esposter/compare/v2.35.0...v2.36.0) (2026-07-30)

### Bug Fixes

* add best effort fn ([4435dd0](https://github.com/Esposter/Esposter/commit/4435dd05a738f1e6263d660795f510c2efbe9450))
* add docs + modifications ([e3b82f1](https://github.com/Esposter/Esposter/commit/e3b82f1284e96089b6376467a155fad28fa1d6dc))
* add missing regression tests ([a5c0040](https://github.com/Esposter/Esposter/commit/a5c0040443bc57a5423f71cb3d93147f50f64668))
* address CodeRabbit review comments ([6cfc481](https://github.com/Esposter/Esposter/commit/6cfc481ee2fccc922a6310db363916d8d97683d5))
* anchor the asset url, attribute the automod log, age-gate the reaper ([aac93e1](https://github.com/Esposter/Esposter/commit/aac93e17e85221d9e964c27ba3a9bfb176072238))
* CI failures, CodeRabbit findings, and Basic-tier reminder dedupe ([96fd87a](https://github.com/Esposter/Esposter/commit/96fd87a1af102dd0314d60b040d3199e546848aa))
* CI virrun shim + stale bundle-size snapshots ([b64c9a6](https://github.com/Esposter/Esposter/commit/b64c9a67704629c00780afaaee26b7745d2529cc))
* clear the remaining confirmed findings from the seam review ([8709cd8](https://github.com/Esposter/Esposter/commit/8709cd8b0687e32fdbec8320bfc0d661c916d043))
* close the CodeRabbit items the earlier rounds left open ([7288f94](https://github.com/Esposter/Esposter/commit/7288f9446b264c53260f0e27ef62f127df18e04f))
* close the critical send-path and publish-repair findings ([ff65685](https://github.com/Esposter/Esposter/commit/ff65685d4cfbeb60754f0d15841cb0b39cb4c846))
* close the defects the develop-to-main review found ([494120b](https://github.com/Esposter/Esposter/commit/494120bf742e6946cc347867187f66e91e2d7a91)), closes [#1029](https://github.com/Esposter/Esposter/issues/1029)
* close the defects the previous fix round introduced ([d7676dc](https://github.com/Esposter/Esposter/commit/d7676dcd3604ee36b014f3daec203f28ba8e02d9))
* close the develop -> main review findings ([5e0046b](https://github.com/Esposter/Esposter/commit/5e0046b1d0170a85ac8537ba9696666300c27e69))
* close the develop-to-main review findings ([3f29155](https://github.com/Esposter/Esposter/commit/3f29155a720cebf09405c443aa1f5e0ffbb4f04e))
* close the second CodeRabbit round on the develop -> main PR ([df4b09b](https://github.com/Esposter/Esposter/commit/df4b09ba3423f96d6e60a77805f44e42ed87771a))
* code review comments ([a739015](https://github.com/Esposter/Esposter/commit/a739015af42462afb2890c6532220a86b974b1c9))
* code review comments ([96cf103](https://github.com/Esposter/Esposter/commit/96cf103f7fa17f79a8227235ca1017be6aec8785))
* comments and snapshots ([2bd05d9](https://github.com/Esposter/Esposter/commit/2bd05d9ac2e6be0304bf06fb569663578fced448))
* decode truncated odd-length utf16le stderr + stale comment ([e1aa94d](https://github.com/Esposter/Esposter/commit/e1aa94df0d03f33ce6ddd2c0fc0356ebcd4563e5))
* docs ([f7ae114](https://github.com/Esposter/Esposter/commit/f7ae114e45ec268afb6e23f1219812ed6433c275))
* docs & test ([558dfa3](https://github.com/Esposter/Esposter/commit/558dfa3f044d160ba4c632f8450479bfc2035933))
* docs and workflow ([2b61c7d](https://github.com/Esposter/Esposter/commit/2b61c7d3aad0614799638864a5662f458befc176))
* have clear timeout error messages ([8ab229d](https://github.com/Esposter/Esposter/commit/8ab229d0b99531bb7fff12593da86473f02a35e8))
* lint ([74247e1](https://github.com/Esposter/Esposter/commit/74247e1655fb52772163ca2ac62e96dc279a1932))
* lint ([35d371f](https://github.com/Esposter/Esposter/commit/35d371f0b3654eec75212f387a7e03bffd7f41fa))
* lint and snapshot ([25e27fd](https://github.com/Esposter/Esposter/commit/25e27fdc7818d37b389c6a7f0c8e0f80c49eddd9))
* lint and snapshot ([93ce821](https://github.com/Esposter/Esposter/commit/93ce82156ccf2f20ee21977df02592927119ad10))
* preserve error name in getWslNativeCacheRoot probe ([bbd05e5](https://github.com/Esposter/Esposter/commit/bbd05e54a5711457de210408684ce1d841e07648))
* re-enable no-shadow and rename all shadowing variables ([0faab46](https://github.com/Esposter/Esposter/commit/0faab46e00078013464161144498ad94d1ac866e))
* record the facts these fixes kept guessing at ([376dbb0](https://github.com/Esposter/Esposter/commit/376dbb0c56b264b4128e3da56377e6d9be5928b1))
* remaining tests ([7315b02](https://github.com/Esposter/Esposter/commit/7315b0219dbae103cb0461618ae7549e868b7976))
* remove unnecessary lints ([0db3054](https://github.com/Esposter/Esposter/commit/0db3054ddc6808b7cb09912820f66b27d4858450))
* restore lint suppressions as oxlint-disable directives ([4085893](https://github.com/Esposter/Esposter/commit/4085893e4972dd5deb290524a3b05930a45a8d78))
* say plainly that the mirror marker publish is host-side ([1aea945](https://github.com/Esposter/Esposter/commit/1aea9453c3101719aa4db16fbd2ac942f3bbbe1c))
* search the end marker after the begin marker, and scope typedoc entrypoints ([d5b0991](https://github.com/Esposter/Esposter/commit/d5b0991def5b4e32717805ac45369e60945b7740))
* snapshots ([9e7a603](https://github.com/Esposter/Esposter/commit/9e7a60383e4f2441af13b0283f47faed66cdb39a))
* snapshots ([7e6429c](https://github.com/Esposter/Esposter/commit/7e6429c68b51eb9e6cbf064fab938eee349d87c2))
* snapshots ([2fefad0](https://github.com/Esposter/Esposter/commit/2fefad023c9fd772c268f592a38a97b2d3df3efd))
* snapshots ([100c3c0](https://github.com/Esposter/Esposter/commit/100c3c05787c63682b32cabd4dd896cda20fd425))
* snapshots ([1842fc6](https://github.com/Esposter/Esposter/commit/1842fc678909e00dfe32ecaeae3ff373a910321b))
* stdout ([3d6d889](https://github.com/Esposter/Esposter/commit/3d6d889090a9a9a1cf92256820a394e146b4140a))
* tar exe ([844742b](https://github.com/Esposter/Esposter/commit/844742bf86402f0c95bd30505215e996cc3338a3))
* tests ([97bdc81](https://github.com/Esposter/Esposter/commit/97bdc81353183907175d54eb2e6f7cd2cd863a4f))
* tests and urls ([c857917](https://github.com/Esposter/Esposter/commit/c85791767dbf80fe9c53c25c3b09b567bd44b750))
* tests and virrun ([eef931f](https://github.com/Esposter/Esposter/commit/eef931f4af59f56934391cf81d63bfa88b092044))
* types and tests ([e866d77](https://github.com/Esposter/Esposter/commit/e866d772c57ad1f320603b053674729c11713fb8))
* update docs ([e470990](https://github.com/Esposter/Esposter/commit/e4709909ea211579bef7ae631a05b3e562e7458b))
* update snapshots ([ba935c5](https://github.com/Esposter/Esposter/commit/ba935c539d05bee6423cc71fa3fcab21a3278708))
* **virrun:** tolerate a source path that vanishes mid-archive ([331224a](https://github.com/Esposter/Esposter/commit/331224a188f32360e913b294902f8cdf772b2f59))
* wip ([acf6466](https://github.com/Esposter/Esposter/commit/acf6466c3340699b1ef5593a27cd5ac80f1e2049))
* wip ([c79a454](https://github.com/Esposter/Esposter/commit/c79a454e14ba9c3cf08836f41a1dac6f7fb24a9a))
* wip ([60a99b8](https://github.com/Esposter/Esposter/commit/60a99b8dde872db6cbc0dd5ac1e006439f3e2881))
* wip ([b02cc3b](https://github.com/Esposter/Esposter/commit/b02cc3b3d3e90cb6215ccbe21d15c9234cadb765))
* wip ([efe6f55](https://github.com/Esposter/Esposter/commit/efe6f553039e9e05c48ed7600073748038a75f6d))

### Features

* Add process blob deletion handler ([1d66a2c](https://github.com/Esposter/Esposter/commit/1d66a2c6a445de75e285c5ae2629d75d939c13b0))
* **virrun:** age-prune the task cache and report its payload size ([54955a7](https://github.com/Esposter/Esposter/commit/54955a7df4a5e2bc07be21d291437bcd5ab3b8b9))

### Performance Improvements

* **program:** batch participant inserts into one transaction per 100 ([67f5c86](https://github.com/Esposter/Esposter/commit/67f5c865e40c3cc65590ddcffa9380338a9647a2))

# [2.35.0](https://github.com/Esposter/Esposter/compare/v2.34.2...v2.35.0) (2026-07-15)

### Bug Fixes

* cleanup configs and CI ([4e1b370](https://github.com/Esposter/Esposter/commit/4e1b370bb32f13483d8aeb63d2f307a2a06e9f10))
* code review comments ([a54c05f](https://github.com/Esposter/Esposter/commit/a54c05fa837998275ca4c7d7236efbbb4bd26819))
* docs + skills ([fd274a1](https://github.com/Esposter/Esposter/commit/fd274a1db9f48dc3816a4ab00abe718f377605df))
* harden virrun orphan sweep against killing live runs ([535e076](https://github.com/Esposter/Esposter/commit/535e076ba7c5a5d6b1f37161c1cdb28a5bfb8fd7))
* indicator ([713f7fc](https://github.com/Esposter/Esposter/commit/713f7fc14e2e159707e08ae0427511bd216260e1))
* lint ([b048d55](https://github.com/Esposter/Esposter/commit/b048d55cf7f936c8012587c874607b16caa7f9da))
* lint and update deps ([4a7e50b](https://github.com/Esposter/Esposter/commit/4a7e50b2969f545175866d7079d5f1347f281947))
* rsync => tar for best performance ([32e82ac](https://github.com/Esposter/Esposter/commit/32e82ac83ce01fe99423bc57de8fbfa30d950827))
* snapshots ([9764b23](https://github.com/Esposter/Esposter/commit/9764b23ba8be5cb84229baf997f54ce00c9cef98))
* symlinks for tar + lint ([247d74b](https://github.com/Esposter/Esposter/commit/247d74b53693f4a697832f67ceefaa81fbf15f59))
* tighten zod schemas ([2676108](https://github.com/Esposter/Esposter/commit/2676108ab50ca99ccb56d4e1db00ac749fc084f3))
* update virrun bundle size snapshots ([75c4b3e](https://github.com/Esposter/Esposter/commit/75c4b3e919cc2ae14d212ac2e7f1a1cb0bbb5ef0))
* use global crypto.randomUUID in remaining packages ([0c0a671](https://github.com/Esposter/Esposter/commit/0c0a671afa7908bd28785247b5ddc2171d46498b))
* virrun to use tar ([83d8b87](https://github.com/Esposter/Esposter/commit/83d8b8716ec092a1227d148ab19569bc2b274af2))
* wip ([7166dbf](https://github.com/Esposter/Esposter/commit/7166dbfe79082fff53ac921bb75602aa90afeeee))

## [2.34.2](https://github.com/Esposter/Esposter/compare/v2.34.1...v2.34.2) (2026-07-05)

### Bug Fixes

* lint and skip test for now ([3558dca](https://github.com/Esposter/Esposter/commit/3558dcaf3084b13b8c05cb7857f983bcf781329e))
* lint and snapshot ([f97bf86](https://github.com/Esposter/Esposter/commit/f97bf867b5e420c861754bfb0cd9c2a48e9ee1cc))
* snapshots ([5a04f18](https://github.com/Esposter/Esposter/commit/5a04f18c732cd3e7028e901823b515aff6c3cb7a))

## [2.34.1](https://github.com/Esposter/Esposter/compare/v2.34.0...v2.34.1) (2026-07-04)

### Bug Fixes

* cleanup docs ([3f0fb42](https://github.com/Esposter/Esposter/commit/3f0fb4283953b0c3e26242b00356e469430b3a77))
* code review comments ([d226957](https://github.com/Esposter/Esposter/commit/d2269573a334b1d12f2cddb7995e74e3a1caa48e))
* code review comments ([e848577](https://github.com/Esposter/Esposter/commit/e8485770ad3ccafe723073613d82bf31a17f4d59))
* lint warnings ([0f5ba91](https://github.com/Esposter/Esposter/commit/0f5ba91bab503102af6772f53cf19eeb6efe3315))

### Performance Improvements

* improve windows mirror ops ([19b13e9](https://github.com/Esposter/Esposter/commit/19b13e90cf9b3c76e2df271bcf8c56ab07abd1ed))

# [2.34.0](https://github.com/Esposter/Esposter/compare/v2.33.0...v2.34.0) (2026-07-04)

### Bug Fixes

* bench ([05f2348](https://github.com/Esposter/Esposter/commit/05f234875094d96648e5d013f23702eaa0a52c06))
* lint ([b9ef894](https://github.com/Esposter/Esposter/commit/b9ef8944146b4c0aa22205cec36492a927207995))
* lint and snapshot ([f22e19e](https://github.com/Esposter/Esposter/commit/f22e19efc0ac1daf3e48609a555de2ee07e1464f))
* network errors + bench ([885ba8e](https://github.com/Esposter/Esposter/commit/885ba8eda8718504c47b8d395034adb692757d8d))
* tests and network ([a975df3](https://github.com/Esposter/Esposter/commit/a975df3b351679db8df08e9daa1dd2e669c1d25a))

### Features

* Add bench files ([358cfce](https://github.com/Esposter/Esposter/commit/358cfcee65291515d50a0e5a7399ec3545625be8))

### Performance Improvements

* optimize CI don't need to re-install ([abecda6](https://github.com/Esposter/Esposter/commit/abecda6756ed6d1bba6384008728ecea3058a6f7))

# [2.33.0](https://github.com/Esposter/Esposter/compare/v2.32.1...v2.33.0) (2026-07-03)

### Bug Fixes

* add wsl env cache ([1632818](https://github.com/Esposter/Esposter/commit/1632818acd99c9c4a209a201abc88ec9ce48abf8))
* atomic sync ([01311f2](https://github.com/Esposter/Esposter/commit/01311f29cc1fa6a799948a9837ee99b0f7ab6678))
* cleanup debug logs ([fa0a35d](https://github.com/Esposter/Esposter/commit/fa0a35daae80aadf3d32745aec9b4e5c165cc614))
* cleanup docs and equivalence test ([3e6de6e](https://github.com/Esposter/Esposter/commit/3e6de6e85b5422de66330497e5a967992eb2cfb2))
* code review comments ([a84595d](https://github.com/Esposter/Esposter/commit/a84595d857e48e4183f07932d9aef13b574d0bf3))
* code review comments ([d57fc88](https://github.com/Esposter/Esposter/commit/d57fc88b237310982bb2dce7f2ea0046cd69de6a))
* colorize remaining console lines ([63b44c8](https://github.com/Esposter/Esposter/commit/63b44c8b12614941cba5d7fff5a98c21058625f7))
* comments etc and cross-ws ver ([dc8b3f7](https://github.com/Esposter/Esposter/commit/dc8b3f74fcd577d6400d8de9238b64fe8b552657))
* get color from child process ([b11a2ca](https://github.com/Esposter/Esposter/commit/b11a2ca63728448c321b0802a73ec86ef65d8085))
* improve errors and remove unnecessary imports ([60d654a](https://github.com/Esposter/Esposter/commit/60d654ab47e84c67020048e9dedcf5b3706f8047))
* issues ([18668f3](https://github.com/Esposter/Esposter/commit/18668f3fc99c0f44b38629d7e8be972e702d423d))
* lint ([af35ae4](https://github.com/Esposter/Esposter/commit/af35ae44f91d4047fdf8c9d1ef5945e7f8486dea))
* lint ([32b7fd2](https://github.com/Esposter/Esposter/commit/32b7fd2cffb75b7c8c0abc5cd11a4487ad511705))
* lint ([c55e9cc](https://github.com/Esposter/Esposter/commit/c55e9cc2a78e2c8fa12c80ce7c312c201386a940))
* lint ([a3d2a6c](https://github.com/Esposter/Esposter/commit/a3d2a6c85a3f5e190f5d80ea3a3525cfc9a1f6f1))
* parse id ([7a87678](https://github.com/Esposter/Esposter/commit/7a87678f97bc2f3fcc5455f9757f42bb6f1b241f))
* prepare outputs for artifacts from nuxt env ([ee633ab](https://github.com/Esposter/Esposter/commit/ee633ab6613d403116447bc889eca63425c1a3bc))
* prepend path ([31df33c](https://github.com/Esposter/Esposter/commit/31df33c96ed5287e3c0c536b9acfd7f762bdcaae))
* reclaim mirror ([668a50f](https://github.com/Esposter/Esposter/commit/668a50f4f4fbde2d216176dbce89f7644a1ccfc5))
* remaining snapshots ([630ff68](https://github.com/Esposter/Esposter/commit/630ff68bd1e30a248195e8baf803ac9a9113600e))
* snapshot ([343491d](https://github.com/Esposter/Esposter/commit/343491dba3911b3f4f2abae5d1a91609177a29cb))
* snapshot semantic ver ([612b60d](https://github.com/Esposter/Esposter/commit/612b60d9a5ed035f5067024b502db52c2fe0cced))
* specs and snapshot ([a1050ad](https://github.com/Esposter/Esposter/commit/a1050ad67c4d3a7115ce41a7c2b4cab2a1d63c8f))
* test lint ([1f7b1d9](https://github.com/Esposter/Esposter/commit/1f7b1d9a19485939d60ebb3db7fc5b49dd4eb4c0))
* tests ([73c4fec](https://github.com/Esposter/Esposter/commit/73c4fec2ae6189dd46bd015d5e0d58a9eda6508a))
* tests ([57d63ef](https://github.com/Esposter/Esposter/commit/57d63ef9c15ae3381966ecb5cfbd0b6cc34bedc0))
* tests + add equivalent test ([dce460c](https://github.com/Esposter/Esposter/commit/dce460ced931f719d7b3dbd15ce7cfb2d48500d1))
* tests wip ([9a1883c](https://github.com/Esposter/Esposter/commit/9a1883c1abaf9d5f3395f983400b3ca5f4cb8be0))
* tests wip ([a2f80a8](https://github.com/Esposter/Esposter/commit/a2f80a8ab51913ffc9c4a2f75f18c26ec2311553))
* things ([3cc03fd](https://github.com/Esposter/Esposter/commit/3cc03fda727d544ab339bcd10e40e798c7cb05b7))
* wip ([16e20c7](https://github.com/Esposter/Esposter/commit/16e20c79f68f85fdbd615b603af105357bb94452))

### Features

* Add cleanup wip ([36131e2](https://github.com/Esposter/Esposter/commit/36131e2daeb57dd804d36a8875cab2995d36dc20))
* Add colors ([4767963](https://github.com/Esposter/Esposter/commit/47679632bad4c534624e875ae94d16729849630b))
* Add remaining concurrent code ([15d8624](https://github.com/Esposter/Esposter/commit/15d86240afbad69ecac186a14db14c7a773c28e3))
* Add wsl ext4 ([2d5a779](https://github.com/Esposter/Esposter/commit/2d5a779c805cdd389c38eb57f5b8e9b97dd8704d))
* make things concurrent-safe wip ([98acabd](https://github.com/Esposter/Esposter/commit/98acabdda91a21e09798fb13058356ad1f8a43f0))

## [2.32.1](https://github.com/Esposter/Esposter/compare/v2.32.0...v2.32.1) (2026-07-01)

### Bug Fixes

* nested runs ([896771e](https://github.com/Esposter/Esposter/commit/896771e71a71cac06cb4b053ad3a37703536941d))

# [2.32.0](https://github.com/Esposter/Esposter/compare/v2.31.1...v2.32.0) (2026-07-01)

### Bug Fixes

* add describe ([579719b](https://github.com/Esposter/Esposter/commit/579719bed627f0bd92593f762dd370284ce099b2))
* add files ([12b0e05](https://github.com/Esposter/Esposter/commit/12b0e05068ad6f8cc1954b9131465b2f310d11ca))
* add prune and regenerate ([d0b1472](https://github.com/Esposter/Esposter/commit/d0b147265486c9dccf06bb6d185b229b146bf10c))
* address code review on virrun snapshot + coverage ([64173a8](https://github.com/Esposter/Esposter/commit/64173a84ac87c6e6ab7ea79be91f87caadd82212))
* address virrun cli review nitpicks ([003a01c](https://github.com/Esposter/Esposter/commit/003a01cc1fa82f687f60c97426cc211f13a7505f))
* auto-detect shell ([f3b8f9d](https://github.com/Esposter/Esposter/commit/f3b8f9dff8fb212e9ed8e9439c0507755fdf6ce1))
* backend support ([58581d3](https://github.com/Esposter/Esposter/commit/58581d3bd80ad223e0d962d4dcc572ea05a14729))
* bench ([df1cea3](https://github.com/Esposter/Esposter/commit/df1cea31ab6dc1b44d2ab89d2c2487bbad6e9e41))
* bench ([b23a8c1](https://github.com/Esposter/Esposter/commit/b23a8c1b287e519bbbca5c27e2fb921ea33dec65))
* benching ([99b4ff0](https://github.com/Esposter/Esposter/commit/99b4ff0944402f3eda7b74d4cd9ac5d22539e26e))
* bundle size ([ee2b371](https://github.com/Esposter/Esposter/commit/ee2b371b11d14d5672c7f6c722a2cb4aff097026))
* bundle size snapshot ([c3e7061](https://github.com/Esposter/Esposter/commit/c3e7061f0f02eaac8acafaab9f1dbfedb1bf5a57))
* cache wip ([937ea95](https://github.com/Esposter/Esposter/commit/937ea95d38b5fd38e7cde27125f24f0ba1781221))
* cleanup ([6dc81d4](https://github.com/Esposter/Esposter/commit/6dc81d4e826671d0b7383c3f41f85dc9637a159a))
* cleanup unnecessary benches ([2e487c0](https://github.com/Esposter/Esposter/commit/2e487c0b79e96bde9d8607e1e2b763de739801dd))
* code review comments ([26ee165](https://github.com/Esposter/Esposter/commit/26ee16544417279ea345c0b52f095eb4f22434a4))
* code review comments ([f929c26](https://github.com/Esposter/Esposter/commit/f929c26dc85833bb18943f2f2f8375f36b58c2ac))
* code review comments ([160f002](https://github.com/Esposter/Esposter/commit/160f002f25e54f561caba179a0ef27d9a668f683))
* code review comments ([68cb482](https://github.com/Esposter/Esposter/commit/68cb4824910b37ede919350e49a7a1b7388e521b))
* code review comments ([6dff351](https://github.com/Esposter/Esposter/commit/6dff351dd99cd9c482ad51b92cf239998097cda9))
* code review comments ([fe709fc](https://github.com/Esposter/Esposter/commit/fe709fc07dd73a15c8eb2afc5347c0586eeaf0e1))
* code review comments + implement slice for layer 5 ([357abfc](https://github.com/Esposter/Esposter/commit/357abfca3da89421383c46176c064262930407aa))
* code review comments + implement slice for layer 5 ([708d5c0](https://github.com/Esposter/Esposter/commit/708d5c0f2bfd27d46ad689cca6cb95aa68c4faa3))
* continue adding ([1e335a1](https://github.com/Esposter/Esposter/commit/1e335a1a540ab79ca61a6c9efdeed6f8ff781aeb))
* describe todo ([93fe7ca](https://github.com/Esposter/Esposter/commit/93fe7ca64b38cf1cd8925be4ede3d52b40b569db))
* finally fix up comments ([8de290a](https://github.com/Esposter/Esposter/commit/8de290abfaa3a3d49b97092a82a67f35658f4c5e))
* flushing ([9d91c72](https://github.com/Esposter/Esposter/commit/9d91c725bb9ecc4c0f57b8f8fac2f57217b11d3c))
* forward terminating signals ([66fb6db](https://github.com/Esposter/Esposter/commit/66fb6db4de5aa30b56cd2aae92df786da1a36533))
* guard snapshot dir creation inside teardown path ([dddbf28](https://github.com/Esposter/Esposter/commit/dddbf28f5d1d8d6ef0d2583ea1ccd44adc1e98d2))
* imports ([20ca208](https://github.com/Esposter/Esposter/commit/20ca208c921682f61175cba0cdfacdd2fcbecdda))
* lint ([75b0599](https://github.com/Esposter/Esposter/commit/75b05991910dec1038957d79a86c14b32734f741))
* lint ([83e5759](https://github.com/Esposter/Esposter/commit/83e5759b84a6ca62a081337fbb7d4de72052922d))
* lint ([374638c](https://github.com/Esposter/Esposter/commit/374638c20cd265089944255566578b6ed7a6e02d))
* lint ([663b5cf](https://github.com/Esposter/Esposter/commit/663b5cf50cdf05b4f0c1724c9619993a513161d8))
* lint ([0457d73](https://github.com/Esposter/Esposter/commit/0457d73603cacb2306072acea3ec311767748ab8))
* lint ([49b1104](https://github.com/Esposter/Esposter/commit/49b110406c90766f466a3c3a6ab6986d3811bf45))
* lint ([87496d9](https://github.com/Esposter/Esposter/commit/87496d9c47e5628b679a91daffe499cb4cd98f12))
* lint ([f6b8d98](https://github.com/Esposter/Esposter/commit/f6b8d98bfcf2fad77d5155be4249373bc718b199))
* lint and snapshot ([b30f1d9](https://github.com/Esposter/Esposter/commit/b30f1d9589c1951a3280b7fc77cdb5e86cc7e6d4))
* lint and snapshot ([17f5df1](https://github.com/Esposter/Esposter/commit/17f5df19718fddd7ba514eb26409e67c426d8bc7))
* move things to out of scope ([8cdea89](https://github.com/Esposter/Esposter/commit/8cdea8970029504ab1c2d88bdf03ef3e6a344500))
* platform benching ([d92d6b2](https://github.com/Esposter/Esposter/commit/d92d6b2be10264b732aea0eac1cd7dddd2b75959))
* remove snapshot ([516b807](https://github.com/Esposter/Esposter/commit/516b807e6d6ebccc75fed2f77b9c2cd2a10177b5))
* remove unnecessary cast ([24855c7](https://github.com/Esposter/Esposter/commit/24855c71d1c6b64e1d39d9abc6cab1c5b8c3f914))
* snapshot ([46123d7](https://github.com/Esposter/Esposter/commit/46123d730c8267aade5924b44f0029ba9ae7aa24))
* snapshot and explicitly set options ([d92c1af](https://github.com/Esposter/Esposter/commit/d92c1af2509cd59b8ed366ab5fb5546a2abe9ce4))
* snapshot size ([36993db](https://github.com/Esposter/Esposter/commit/36993dbfea849005e0655dfd5684e069cdf35f50))
* snapshot size ([e589748](https://github.com/Esposter/Esposter/commit/e589748d539eb92d477b52cab31b39a9505bcdc6))
* test command ([0cb437a](https://github.com/Esposter/Esposter/commit/0cb437ace0525d623fae67cfd069aba0bacbc254))
* test snapshot ([d8372b2](https://github.com/Esposter/Esposter/commit/d8372b2020c45b2a5ca8d0e4ff1a72f527189a20))
* tests ([bdfdc90](https://github.com/Esposter/Esposter/commit/bdfdc9033b8449828fdf733be921f9cb4a5ea55d))
* tests ([c08666a](https://github.com/Esposter/Esposter/commit/c08666a98712707cf2269ed64d7412b9432adac2))
* tests ([001ef41](https://github.com/Esposter/Esposter/commit/001ef41dbcfc0e05f2684ba67b9410d8b46faaf1))
* tests and snapshot ([2498fa5](https://github.com/Esposter/Esposter/commit/2498fa577fd62636ff8d02960968469f84961556))
* types ([efb3521](https://github.com/Esposter/Esposter/commit/efb352153b606158c8367213205a4db95920234f))
* **virrun:** use PNPM_CONFIG_* env vars for shared package store ([3089bb9](https://github.com/Esposter/Esposter/commit/3089bb9636fa06ac45bfb73c538782ba59b56302))
* wip ([23eaf03](https://github.com/Esposter/Esposter/commit/23eaf033c7e55a4a01d3c33afc361df17d68d8f1))
* wip ([d2b7259](https://github.com/Esposter/Esposter/commit/d2b7259dd72576f983253372a5a74d1ebce756f1))
* wip ([4d49334](https://github.com/Esposter/Esposter/commit/4d49334ab99a1dabef0b5687b19f75db4fb58f36))
* wip ([75eab24](https://github.com/Esposter/Esposter/commit/75eab24e660f5b20486c10b6bbb06503074fd044))
* wip ([c1762c8](https://github.com/Esposter/Esposter/commit/c1762c8bdc2b9c225ff9f9642ca14916b933651c))
* wip ([917ac67](https://github.com/Esposter/Esposter/commit/917ac67267ed46a389430f20d7dc2b80e40c30d0))
* wip ([ce57c8d](https://github.com/Esposter/Esposter/commit/ce57c8d6be8659437f41a9b4341529d8055f3ebf))

### Features

* Add base flush ([8351ecf](https://github.com/Esposter/Esposter/commit/8351ecf6a5657ab844c6494181653d14985be4b9))
* Add citty cli ([6b81696](https://github.com/Esposter/Esposter/commit/6b81696752e704a0ee88306ab93c8bea813fcb4a))
* Add differential test + tighten docs ([e1c28c0](https://github.com/Esposter/Esposter/commit/e1c28c0c6e8117488ce91e5488816406fb7d9d3a))
* add doctor ([bf41c6a](https://github.com/Esposter/Esposter/commit/bf41c6a7f230e8e9455381312f212c0b39038679))
* Add live stderr ([ab1580d](https://github.com/Esposter/Esposter/commit/ab1580d8cb2ce1d6ed3fd85e2687a1b72cd7b375))
* Add metadata info to cli ([3335b40](https://github.com/Esposter/Esposter/commit/3335b40af07266c394d2deb8bc8542d80270e146))
* Add virrun env ([7aa9a50](https://github.com/Esposter/Esposter/commit/7aa9a50a62329db4ccd0579e0e21a0bb95651ce9))
* Add warm snapshot ([c68e553](https://github.com/Esposter/Esposter/commit/c68e553c70d86ef6505337a495424c5d2650bae9))
* Add wsl backend ([518b045](https://github.com/Esposter/Esposter/commit/518b04533cd761b5ab2dbc72af7d6323e051b486))
* cache wip ([206bf5b](https://github.com/Esposter/Esposter/commit/206bf5bde32a63db5505b1c2ae4785b2f6eeea36))
* fixed-iteration benchmark runner for machine-stable results ([6be4473](https://github.com/Esposter/Esposter/commit/6be4473066c634fd57ab854c59175316d24f9dde))
* migrate to using virrun for dogfeeding ([0a15bae](https://github.com/Esposter/Esposter/commit/0a15baecb4dcee28b7507d7e57ae74a3753e2618))
* **virrun:** capture warm snapshot + fork an isolated run ([496ad22](https://github.com/Esposter/Esposter/commit/496ad224ff531aa7ed78657f787263fe214efc51))
* **virrun:** config allowlist routing (adoption level 3) ([893c924](https://github.com/Esposter/Esposter/commit/893c9242c30eb807845e8f446bbf05c7e582a7c1))
* **virrun:** forkSnapshot + cold-vs-warm bench ([4970046](https://github.com/Esposter/Esposter/commit/4970046521e0280c091f2649d2692efa2093b6bc))
* **virrun:** shared package store for os backend; drop overlayDirs ([b8e1154](https://github.com/Esposter/Esposter/commit/b8e1154efb8d9a857a511cd0d412094dd0beaeb2))
* **virrun:** snapshot FS-overlay foundation ([78ad120](https://github.com/Esposter/Esposter/commit/78ad120c74e0087580dbafa7189b8350eebd7bb4))
* **virrun:** transparent fork() on the createVirrun orchestrator ([ff4827b](https://github.com/Esposter/Esposter/commit/ff4827bebf3ab73e51815de4d82ad699b6d9b832))
* wip ([80269f0](https://github.com/Esposter/Esposter/commit/80269f0fb19c4bef6b372350052f78e2a9989759))
* wip ([1f90eee](https://github.com/Esposter/Esposter/commit/1f90eee7f35ef6e6c848ef1130cc879bd23fe39e))

### Performance Improvements

* don't re-install, just prune and grab from under source files ([04785cd](https://github.com/Esposter/Esposter/commit/04785cd569cd358f315da50697f238f4acdf7c18))
* memoization ([54eaf3d](https://github.com/Esposter/Esposter/commit/54eaf3dbfd2ae63411886605983f6b047a28eb01))
* optimize tests ([99e402f](https://github.com/Esposter/Esposter/commit/99e402f72b5fcce7011d7495c64dfd2c934dd995))

## [2.31.1](https://github.com/Esposter/Esposter/compare/v2.31.0...v2.31.1) (2026-06-25)

**Note:** Version bump only for package virrun

# [2.31.0](https://github.com/Esposter/Esposter/compare/v2.30.0...v2.31.0) (2026-06-25)

### Bug Fixes

* forward virrun cli command as argv array to preserve arg boundaries ([e46dfa3](https://github.com/Esposter/Esposter/commit/e46dfa3a4f226b76b6e0ae69753cadc7236084b4))

### Features

* add CodSpeed hosted benchmarking dashboard ([28efb0e](https://github.com/Esposter/Esposter/commit/28efb0e92eeb7865be9a54f52e25049dc08510fd))

# [2.30.0](https://github.com/Esposter/Esposter/compare/v2.29.0...v2.30.0) (2026-06-24)

### Bug Fixes

* emit oxfmt-aligned bench tables and guard empty bench samples ([640154c](https://github.com/Esposter/Esposter/commit/640154c2fba53330bb82259f40d9696c177112d1))
* explicit ZodObject annotations for isolated-declaration schemas; self-contained sandbox-runtime bundle ([7bf39bc](https://github.com/Esposter/Esposter/commit/7bf39bcb60235cef870fc1dab9abba66fe313390))
* lint ([d3f4f0c](https://github.com/Esposter/Esposter/commit/d3f4f0c40fb00cea162eef682eb35a113564eebe))
* reject empty file token in node <file> parse ([5f62563](https://github.com/Esposter/Esposter/commit/5f6256330068f3489cc24bb4e97e4c298e36c914))
* remove unnecessary casts ([656366d](https://github.com/Esposter/Esposter/commit/656366d3919b788661541e37f5f94e9e8f7ec76e))
* sandbox-runtime cleanup leaks + fair bench baseline ([24cc456](https://github.com/Esposter/Esposter/commit/24cc456cbb3649a9d836833554b107bb97a848fc))
* sandbox-runtime vfs test lint + try-ban compliance ([4b7f60e](https://github.com/Esposter/Esposter/commit/4b7f60e400f0a1d6210e503bb592872fb4f826f3))
* signal-aware exit codes + argv/shell-false hardening in sandbox exec ([ae71dae](https://github.com/Esposter/Esposter/commit/ae71daee733ade73305d2fcd23cf408601f50a0b))
* snapshot ([5a063b6](https://github.com/Esposter/Esposter/commit/5a063b683bb11f3de926924ba16c363095728401))
* snapshot ([b092c49](https://github.com/Esposter/Esposter/commit/b092c49c84b6da9a36149cbc6b2ff8cc54e59021))
* wip ([b0aa40f](https://github.com/Esposter/Esposter/commit/b0aa40fc4865554a7ed6f3cb6b172409dcc0bfc8))

### Features

* Add network and overlay dirs support ([060042f](https://github.com/Esposter/Esposter/commit/060042f229c13001e23b5eb93a94c93fef089794))
* root recursive bench script + vs-base multiplier in bench report ([ebb4afe](https://github.com/Esposter/Esposter/commit/ebb4afe18df064792017dffce39e0910082ebd08))
* sandbox-runtime bench foundation (committed results + metadata), defer CI gate ([ee9689b](https://github.com/Esposter/Esposter/commit/ee9689b138130850d879ffbf25f4f78d64d57266))
* sandbox-runtime MVP — ExecBackend seam, native backend, CLI, gate harnesses ([4a98e6d](https://github.com/Esposter/Esposter/commit/4a98e6dc8f75fe697ef31a55bc366d764a247a5d))
* sandbox-runtime os backend MVP (bwrap RAM-overlay exec, Linux core) ([8741186](https://github.com/Esposter/Esposter/commit/8741186212042fcb03ba962b88eb438a6d875843))
* sandbox-runtime source loaders + package lint/error wiring ([1db61d0](https://github.com/Esposter/Esposter/commit/1db61d0c8a6b97754ff7fceeb283e8eaffa700dd))
* sandbox-runtime vfs FS layer (@platformatic/vfs adapter + swap shim) ([5e78d33](https://github.com/Esposter/Esposter/commit/5e78d337a8a5b8f235e64ce732f3e05ca90f9f49))
* sandbox-runtime vfs in-process exec backend (Step B1) ([f7b0fa5](https://github.com/Esposter/Esposter/commit/f7b0fa5bb77cf7b82c18edf9e565119321228527))
* sandbox-runtime vfs Step B2 — overlay mount + node <file> (both gates) ([8fa5cb2](https://github.com/Esposter/Esposter/commit/8fa5cb21e1ba242b2d67c5108b7ff323967320f6))
* shared-node bench reporter + migrate benches to vitest bench ([0e39cf7](https://github.com/Esposter/Esposter/commit/0e39cf713eea30d36d50879ba4d56a6bf00fe73e))
