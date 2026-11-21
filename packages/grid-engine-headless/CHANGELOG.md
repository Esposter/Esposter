# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.14.0](https://github.com/Esposter/Esposter/compare/v4.13.0...v4.14.0) (2026-11-21)

### Bug Fixes

* **grid-engine-headless:** a position off a whole tile is refused as outside the grid ([ccc2455](https://github.com/Esposter/Esposter/commit/ccc2455e7b35a9cebad8a793413ef1356074d811))
* **grid-engine-headless:** a step's excess carries into the next step in its direction, so a run covers the same tiles at any update rate ([#419](https://github.com/Esposter/Esposter/issues/419)) ([918ed14](https://github.com/Esposter/Esposter/commit/918ed1436fbb2b97219fba2f95c2a98c62122f64))

### Features

* **grid-engine-headless:** a step and a turn take the default speed, a blocked move turns, and a diagonal move fails ([ec8fda4](https://github.com/Esposter/Esposter/commit/ec8fda4efc90fe6dfdc179139fa6386cf166d647))
* **grid-engine-headless:** create the package with neverthrow as its only runtime dependency ([c175bda](https://github.com/Esposter/Esposter/commit/c175bda6b63580226936a7ae028bd8c74fc73675))
* **grid-engine-headless:** readCharacter reads a character's tile, facing and step progress ([c8d60bb](https://github.com/Esposter/Esposter/commit/c8d60bbfc3cf833d9ce458eb354166a5b639925c))
* **grid-engine-headless:** the collision rule blocks a blocking, absent, outside or occupied tile ([39ed02f](https://github.com/Esposter/Esposter/commit/39ed02fe281595019c164aaae47988737c019f1d))
* **grid-engine-headless:** the engine emits its events, teleports a character, and refuses a grid, speed or position it cannot hold ([613d16f](https://github.com/Esposter/Esposter/commit/613d16fcb931c210bb496b71d2bb7f56d3210963))
