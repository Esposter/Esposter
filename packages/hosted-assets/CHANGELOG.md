# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.18.0](https://github.com/Esposter/Esposter/compare/v4.17.0...v4.18.0) (2026-11-27)

**Note:** Version bump only for package hosted-assets

# [4.17.0](https://github.com/Esposter/Esposter/compare/v4.16.0...v4.17.0) (2026-11-25)

### Bug Fixes

* **genshin:** the login's recordings are read through the hosted cache, so the preload holds each one without fetching it again ([3fed6b3](https://github.com/Esposter/Esposter/commit/3fed6b39452c8849b7879515b1a717d5ef4bc221))
* **hosted-assets:** a generated key line over the formatter's width breaks after its colon, so the install's keys pass the formatter unchanged ([75f1990](https://github.com/Esposter/Esposter/commit/75f199036adf8dc5d7dbbb4ae844d0087b9b7fbd))
* **hosted-assets:** a held set is ready before its stale entries are evicted, and an eviction that fails is logged rather than failing the set ([d392fcc](https://github.com/Esposter/Esposter/commit/d392fcc5499c8eb9a25d891a3bcf8590e8c60d7c))
* **hosted-assets:** a lock entry keeps its extension and not its content type, so the two cannot disagree ([48eac72](https://github.com/Esposter/Esposter/commit/48eac72756abaf9d6754e70a85a6083ade31223a))
* **hosted-assets:** an empty key constant is written on one line, so the install's keys pass the formatter unchanged ([7d4ee14](https://github.com/Esposter/Esposter/commit/7d4ee14bb10d5957a14a2c9cf853d56804482bc5))
* **hosted-assets:** the keys mirror's directive is split across two lines, so each line fits the print width ([3bd9674](https://github.com/Esposter/Esposter/commit/3bd9674d97361f1c88f68d31d272a3bfd01d83cd))
* **hosted-assets:** the rewrapped comments state each sentence whole, and the directive reasons stay on their lines ([a25450e](https://github.com/Esposter/Esposter/commit/a25450ecacea7c70a4feef1bded9359acab06c9f))
* **hosted-assets:** the store answers a url the cache holds, so a read the preload overlaps is not fetched again ([1f8485c](https://github.com/Esposter/Esposter/commit/1f8485c53d0f8c92758a09f1a12512bc1fcc10a0))

### Features

* **dungeons:** the textures, sounds, fonts and tilemaps load from their hosted urls through the key map, and the Preloader downloads each object before the game starts ([178c16f](https://github.com/Esposter/Esposter/commit/178c16f21e8cd544a49db152481830a231bfe167))
* **genshin-world:** the download starts on the title's click, and the launch bar shows its line while bytes arrive ([e3dadb7](https://github.com/Esposter/Esposter/commit/e3dadb7f9fc5bc8cadcd48c48f83520a86fabcf6))
* **genshin:** the login's recordings are a scope of the game data lock, published from a working folder, and a records product stores its binary files as their extension's table names ([3bbdf10](https://github.com/Esposter/Esposter/commit/3bbdf104c884603b4048189f4452afca628381c0))
* **hosted-assets:** a product's lock is one schema, and an object entry without its sha256 is refused ([68168c7](https://github.com/Esposter/Esposter/commit/68168c7467e1f8728c5012c508662c4491d66bbc))
* **hosted-assets:** a product's preload is one headless call and one composable, and the Genshin opening uses them ([d7ebc73](https://github.com/Esposter/Esposter/commit/d7ebc73f1ff39f2cc110e21ec66022ef1e4eed94))
* **hosted-assets:** a successful preload evicts the stale entries of its own scope, and a failed one evicts none ([33d0a74](https://github.com/Esposter/Esposter/commit/33d0a741d3ac08a39042e57c3738983380957c27))
* **hosted-assets:** an object's url is its origin, its scope, its sha256 and its extension ([77f095a](https://github.com/Esposter/Esposter/commit/77f095aa5390a4110edfcbd482b0b423b8fafaf0))
* **hosted-assets:** the test setup answers a hosted object from the mirror, under the hosted base and by its extension's content type ([18d782f](https://github.com/Esposter/Esposter/commit/18d782f479833e275471c7eda114a593705f1434))
