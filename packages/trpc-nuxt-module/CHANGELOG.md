# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.5.0](https://github.com/Esposter/Esposter/compare/v4.4.0...v4.5.0) (2026-11-05)

### Bug Fixes

* **ci:** tRPC 11.23 types the WebSocket server and socket, so the adapters become subsets of the ws types ([bc46987](https://github.com/Esposter/Esposter/commit/bc4698703aa0eb59f594e8064b93d36c6543da28))
* **lint:** the oxlint autofix is applied over the tree, so its fixable errors stop reddening the Lint job ([cf8d057](https://github.com/Esposter/Esposter/commit/cf8d057edf1afad9821b04c23d5084b3b5add11e))
* **trpc-nuxt-module:** a mutate resolves with its own call's result ([79ae58c](https://github.com/Esposter/Esposter/commit/79ae58c340c073c3caf52dc9e4ab6562a857e8d8))
* **trpc-nuxt-module:** a mutate resolves with its transformed and picked result ([d3ba0fb](https://github.com/Esposter/Esposter/commit/d3ba0fb28f3b35b51dc436731e3dc6a67ed67352))
* **trpc-nuxt-module:** a WebSocket context that fails takes no hook and leaks no rejection ([39d2b3c](https://github.com/Esposter/Esposter/commit/39d2b3c40335f107545a214337f72d52a0a0a108))
* **trpc-nuxt-module:** the event handler's comment states where h3 merges a procedure's headers ([ac668ef](https://github.com/Esposter/Esposter/commit/ac668efe43d8d025c76beeb7cb2479db126d15d4))
* **trpc-nuxt-module:** the websocket callbacks return a Promise without async, and the test shadows nothing ([ab3791c](https://github.com/Esposter/Esposter/commit/ab3791c7e1aebb10c07dc852e31bd16b3070bcb5))

# [4.4.0](https://github.com/Esposter/Esposter/compare/v4.3.3...v4.4.0) (2026-10-30)

### Bug Fixes

* **ci:** the perfectionist sort fixes CI's Lint job failed on, in four packages ([b6c2e75](https://github.com/Esposter/Esposter/commit/b6c2e75a2aadc22847ec3d6946d0dabc7162a6e1))
* **trpc-nuxt-module:** the generated handler's import needs its export arm back ([9c09fb0](https://github.com/Esposter/Esposter/commit/9c09fb071ff1bf1432f725addf3b882776c71184))
* **trpc-nuxt-module:** the README's handler subpath returns to the exports map, and the Nuxt-module factory takes its own excludes ([5b07f04](https://github.com/Esposter/Esposter/commit/5b07f04707d5dd1720a7e8cdb52db1824017cf01))
* **trpc-nuxt-module:** the websocket handler template names its subpath as a literal ([266b5fa](https://github.com/Esposter/Esposter/commit/266b5fa9a7c29c84a166c0882272c36c38405453))
* **trpc-nuxt-module:** the WebSocket handler's arm is out of the excludes, so the generated import resolves ([6629ff7](https://github.com/Esposter/Esposter/commit/6629ff746039a4ccb8fb6cd6dafad3252b5ff650))

## [4.3.3](https://github.com/Esposter/Esposter/compare/v4.3.2...v4.3.3) (2026-10-22)

**Note:** Version bump only for package trpc-nuxt-module

## [4.3.2](https://github.com/Esposter/Esposter/compare/v4.3.1...v4.3.2) (2026-10-21)

**Note:** Version bump only for package trpc-nuxt-module

## [4.3.1](https://github.com/Esposter/Esposter/compare/v4.3.0...v4.3.1) (2026-10-21)

**Note:** Version bump only for package trpc-nuxt-module

# [4.3.0](https://github.com/Esposter/Esposter/compare/v4.2.0...v4.3.0) (2026-10-21)

### Bug Fixes

* **trpc-nuxt-module:** a server-rendered tRPC call with no app on its request event goes to the request's own origin ([107b52d](https://github.com/Esposter/Esposter/commit/107b52dc18b789c79cbdccdc7ecdb32c967a700c))
* **trpc-nuxt-module:** a server-rendered tRPC call with no app on its request event runs the Nitro app in-process ([631d94b](https://github.com/Esposter/Esposter/commit/631d94b99272e88df17a8f0ff158b7201ad85c8c))
* **trpc-nuxt-module:** the in-process fetch loads Nitro's app behind import.meta.server, not a server plugin ([7071973](https://github.com/Esposter/Esposter/commit/7071973845459177d36a0e8c730ca21db29cdbf2))

# [4.2.0](https://github.com/Esposter/Esposter/compare/v4.1.2...v4.2.0) (2026-10-14)

**Note:** Version bump only for package trpc-nuxt-module

## [4.1.2](https://github.com/Esposter/Esposter/compare/v4.1.1...v4.1.2) (2026-10-14)

**Note:** Version bump only for package trpc-nuxt-module

## [4.1.1](https://github.com/Esposter/Esposter/compare/v4.1.0...v4.1.1) (2026-10-14)

**Note:** Version bump only for package trpc-nuxt-module

# [4.1.0](https://github.com/Esposter/Esposter/compare/v4.0.0...v4.1.0) (2026-10-13)

### Bug Fixes

* **nuxt-security-module:** module.ts loads natively without an enum, so Nuxt stops falling back to jiti ([6d0f07e](https://github.com/Esposter/Esposter/commit/6d0f07e2b193ea8ebd4c0c15cb52a25845609c81))

# [4.0.0](https://github.com/Esposter/Esposter/compare/v3.9.0...v4.0.0) (2026-10-06)

* feat(trpc-nuxt-module)!: serve through Nitro 3 and h3 2.x ([92ae0e9](https://github.com/Esposter/Esposter/commit/92ae0e90ddc507dc682fc5904cc59fb09b6337e9)), closes [#227](https://github.com/Esposter/Esposter/issues/227) [#175](https://github.com/Esposter/Esposter/issues/175)

### Bug Fixes

* **main:** regenerate the artifacts a red head left stale ([c9de917](https://github.com/Esposter/Esposter/commit/c9de9176b1871a83a67b16389f866f5e3e3db66d))
* repair main's red — land the app's half of the Nuxt 5 migration ([5b7eb78](https://github.com/Esposter/Esposter/commit/5b7eb78387292e4a3e36520fd13f8fe9a9fcadef)), closes [#1423](https://github.com/Esposter/Esposter/issues/1423)
* **trpc-nuxt-module:** answer a staged bodyless status without tRPC's body ([5ca289f](https://github.com/Esposter/Esposter/commit/5ca289f3048f9c2027655d917a5a7db84c5c55bb))
* **trpc-nuxt-module:** drop the body's length with a staged bodyless status ([c7a4b46](https://github.com/Esposter/Esposter/commit/c7a4b46192e8c5272c128a8db32c0e97e4d569f8))

### BREAKING CHANGES

* the module requires Nuxt 5 (Nitro 3, h3 2.x); its
  `meta.compatibility` is `>=5.0.0-0` and `h3` is no longer a peer.

# [3.9.0](https://github.com/Esposter/Esposter/compare/v3.8.1...v3.9.0) (2026-10-01)

**Note:** Version bump only for package trpc-nuxt-module

## [3.8.1](https://github.com/Esposter/Esposter/compare/v3.8.0...v3.8.1) (2026-09-30)

**Note:** Version bump only for package trpc-nuxt-module

# [3.8.0](https://github.com/Esposter/Esposter/compare/v3.7.0...v3.8.0) (2026-09-30)

**Note:** Version bump only for package trpc-nuxt-module

# [3.7.0](https://github.com/Esposter/Esposter/compare/v3.6.0...v3.7.0) (2026-09-29)

**Note:** Version bump only for package trpc-nuxt-module

# [3.6.0](https://github.com/Esposter/Esposter/compare/v3.5.1...v3.6.0) (2026-09-29)

### Bug Fixes

* repair main after the trpc-nuxt-module absorption ([701d765](https://github.com/Esposter/Esposter/commit/701d765e3bacc4fb2448d257920dfd80481bb21d))
* **trpc-nuxt-module:** import the WebSocket hook names in the generated handler, clear CodeQL js/bad-code-sanitization ([09f3186](https://github.com/Esposter/Esposter/commit/09f3186da07f45233a509b61f69a0ad9193d40c0)), closes [#9](https://github.com/Esposter/Esposter/issues/9) [#10](https://github.com/Esposter/Esposter/issues/10)
* **trpc-nuxt-module:** interpolate the WebSocket hook names as literals, clear js/bad-code-sanitization ([ab3648e](https://github.com/Esposter/Esposter/commit/ab3648e763f983e7e9394d640208525ab96edb43))

### Features

* **trpc-nuxt-module:** absorb trpc-nuxt into a Nuxt module of our own ([650946d](https://github.com/Esposter/Esposter/commit/650946d223498994fa23e1dda6458a525264f37b)), closes [#221](https://github.com/Esposter/Esposter/issues/221) [#191](https://github.com/Esposter/Esposter/issues/191) [#239](https://github.com/Esposter/Esposter/issues/239) [#224](https://github.com/Esposter/Esposter/issues/224) [#175](https://github.com/Esposter/Esposter/issues/175) [#106](https://github.com/Esposter/Esposter/issues/106) [#253](https://github.com/Esposter/Esposter/issues/253) [#234](https://github.com/Esposter/Esposter/issues/234) [#227](https://github.com/Esposter/Esposter/issues/227) [#221](https://github.com/Esposter/Esposter/issues/221) [#191](https://github.com/Esposter/Esposter/issues/191) [#215](https://github.com/Esposter/Esposter/issues/215) [#191](https://github.com/Esposter/Esposter/issues/191)
