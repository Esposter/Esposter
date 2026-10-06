# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
