# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
