# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.17.0](https://github.com/Esposter/Esposter/compare/v4.16.0...v4.17.0) (2026-11-25)

### Bug Fixes

* **build:** type-fest and vite list in dependencies where a published declaration names them ([ce870e0](https://github.com/Esposter/Esposter/commit/ce870e0ab8e7c8cc8e3ed6f88e2184928a9f3a00))
* **ci:** the precache extensions carry their type, the jobs Worker binds the hosted bucket, and the node floors test holds no module constant ([49c0164](https://github.com/Esposter/Esposter/commit/49c01644647f59d43c7f4e3371512c4a5253b1d4))
* **pwa:** the precache holds the app's images and fonts, and leaves the game engines' files out ([7461fca](https://github.com/Esposter/Esposter/commit/7461fca5031d798c46e18afd691ac58290b752ae))
* **pwa:** the precache leaves out the build's app manifest, which a superseded build's worker cannot fetch ([b0cd436](https://github.com/Esposter/Esposter/commit/b0cd43689196d524096d214b84d12c8bf922759d))
* **unplugin-pwa-nuxt:** the manifest transform and navigation routes read an empty route and method by truthiness ([be013bc](https://github.com/Esposter/Esposter/commit/be013bc7e58fc4b39454dfbc46c61df301d78229))
* **unplugin-pwa:** the build-meta prefix is joined inside the manifest transform, and the pwa tests restore what they spy ([f7638be](https://github.com/Esposter/Esposter/commit/f7638bef9432a43ffc262786435671c8d49ac44d))

### Features

* **oxlint:** the selector-ban lists move to TypeScript, each scoped to its own paths and discovered by the plugin ([d5054e3](https://github.com/Esposter/Esposter/commit/d5054e30e21912f7341c1ce25b50578c51d372e8))

# [4.16.0](https://github.com/Esposter/Esposter/compare/v4.15.0...v4.16.0) (2026-11-22)

**Note:** Version bump only for package unplugin-pwa-nuxt

# [4.15.0](https://github.com/Esposter/Esposter/compare/v4.14.0...v4.15.0) (2026-11-22)

**Note:** Version bump only for package unplugin-pwa-nuxt

# [4.14.0](https://github.com/Esposter/Esposter/compare/v4.13.0...v4.14.0) (2026-11-21)

**Note:** Version bump only for package unplugin-pwa-nuxt

# [4.13.0](https://github.com/Esposter/Esposter/compare/v4.12.0...v4.13.0) (2026-11-19)

**Note:** Version bump only for package unplugin-pwa-nuxt

# [4.12.0](https://github.com/Esposter/Esposter/compare/v4.11.0...v4.12.0) (2026-11-16)

**Note:** Version bump only for package unplugin-pwa-nuxt

# [4.11.0](https://github.com/Esposter/Esposter/compare/v4.10.1...v4.11.0) (2026-11-14)

**Note:** Version bump only for package unplugin-pwa-nuxt

## [4.10.1](https://github.com/Esposter/Esposter/compare/v4.10.0...v4.10.1) (2026-11-13)

### Bug Fixes

* **web:** the service worker answers a navigation network-first and precaches no page of its own ([219d010](https://github.com/Esposter/Esposter/commit/219d0108c62a2a9ac6fb3d5fde926814c8e9357b))

# [4.10.0](https://github.com/Esposter/Esposter/compare/v4.9.0...v4.10.0) (2026-11-12)

**Note:** Version bump only for package unplugin-pwa-nuxt

# [4.9.0](https://github.com/Esposter/Esposter/compare/v4.8.0...v4.9.0) (2026-11-11)

### Features

* every published package names what it is, what it plugs into and what it solves in five to ten keywords, a test holds their shape and the links the generator writes, and the generator no longer seeds typescript ([ca3fcd3](https://github.com/Esposter/Esposter/commit/ca3fcd3aeb7a16cfb97ef7e4b16cf4d03ec6a333))

# [4.8.0](https://github.com/Esposter/Esposter/compare/v4.7.0...v4.8.0) (2026-11-10)

**Note:** Version bump only for package unplugin-pwa-nuxt

# [4.7.0](https://github.com/Esposter/Esposter/compare/v4.6.0...v4.7.0) (2026-11-08)

**Note:** Version bump only for package unplugin-pwa-nuxt

# [4.6.0](https://github.com/Esposter/Esposter/compare/v4.5.0...v4.6.0) (2026-11-07)

### Bug Fixes

* **unplugin-pwa-nuxt:** the module leaves the service worker scope to the base it is given ([adcd4d3](https://github.com/Esposter/Esposter/commit/adcd4d326221058dc6285605d07413ea5cdbb226))

# [4.5.0](https://github.com/Esposter/Esposter/compare/v4.4.0...v4.5.0) (2026-11-05)

### Bug Fixes

* **ci:** knip traces the pwa fixture and the unused dependencies leave ([f222f39](https://github.com/Esposter/Esposter/commit/f222f398836e9928a85730405f811f980536167f))
* **ci:** the app build precaches around its one large chunk and reads the manifest icons from Nuxt's public folder ([8472e85](https://github.com/Esposter/Esposter/commit/8472e854c115933c29227fc5a14ce6276da12995))

### Features

* scaffold the unplugin-pwa-nuxt package, and centre the root README's header ([269645e](https://github.com/Esposter/Esposter/commit/269645edf35fac6affd875030e75c0e84bf2636d))
* unplugin-pwa-nuxt, the Nuxt 5 PWA module on @unplugin-pwa/vite, replaces @vite-pwa/nuxt in apps/web ([258ab5c](https://github.com/Esposter/Esposter/commit/258ab5c31a2e8bd6e5bbe2e24fc9095697bdf4cf))
