# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.4.0](https://github.com/Esposter/Esposter/compare/v4.3.3...v4.4.0) (2026-10-30)

### Bug Fixes

* **lint:** the oxlint autofix gives void-returning arrows block bodies, and the formatter lays them out ([9103811](https://github.com/Esposter/Esposter/commit/910381177c6a9906b3283661d4f85ec66c77c785))
* **vue-grid-layout-headless:** the placement subpath returns, its removal was a breaking change outside a major ([62fc0b9](https://github.com/Esposter/Esposter/commit/62fc0b9bf73833469cf84ad57436f3699e362847))

## [4.3.3](https://github.com/Esposter/Esposter/compare/v4.3.2...v4.3.3) (2026-10-22)

**Note:** Version bump only for package vue-grid-layout-headless

## [4.3.2](https://github.com/Esposter/Esposter/compare/v4.3.1...v4.3.2) (2026-10-21)

**Note:** Version bump only for package vue-grid-layout-headless

## [4.3.1](https://github.com/Esposter/Esposter/compare/v4.3.0...v4.3.1) (2026-10-21)

**Note:** Version bump only for package vue-grid-layout-headless

# [4.3.0](https://github.com/Esposter/Esposter/compare/v4.2.0...v4.3.0) (2026-10-21)

### Bug Fixes

* **packages:** the absorbed packages typecheck and lint clean ([7483a70](https://github.com/Esposter/Esposter/commit/7483a70c65b614ed0a8c43f2e3180215c9c246e2))
* **vue-grid-layout-headless:** a cancelled palette press ends its drag, so a later release drops nothing ([08cce53](https://github.com/Esposter/Esposter/commit/08cce537c152ac2f87131416bfd607a67a228b3e))
* **vue-grid-layout-headless:** a drop lands on the column under the pointer, not the nearest one ([7d39d8f](https://github.com/Esposter/Esposter/commit/7d39d8f65f64df636bbcfd14cdfafcd213bb2b53))
* **vue-grid-layout-headless:** a gesture ends when its layout is replaced, and tiles wait for the grid's width ([c0187e2](https://github.com/Esposter/Esposter/commit/c0187e2cc6629fa3fa836224824b8a2942d7629b))
* **vue-grid-layout-headless:** a grid that is not editable refuses a palette drop ([5612fa0](https://github.com/Esposter/Esposter/commit/5612fa068ed27ff9abf01b682a27301c2ab9622d))
* **vue-grid-layout-headless:** a horizontal push rises back along its row, so compacting a layout again changes nothing ([3981dbb](https://github.com/Esposter/Esposter/commit/3981dbb56d7d9d1cd68def5692e3c3da99d1d2ee))
* **vue-grid-layout-headless:** a press on a nested grid's item belongs to that grid, not the grid around it ([82812bf](https://github.com/Esposter/Esposter/commit/82812bfa8b68817046058abcba49b67927f9fd3c))
* **vue-grid-layout-headless:** a refused drop stays in its source, drops route past the dragged tile, and the placement stops overlapping ([761605b](https://github.com/Esposter/Esposter/commit/761605bc908456bfcc67fd96be5e28c5c46512a1))
* **vue-grid-layout-headless:** a swap puts the dropped item where the one it landed on was ([16f4db2](https://github.com/Esposter/Esposter/commit/16f4db216ab86692fb8afafa237a0168ca34416e))
* **vue-grid-layout-headless:** only the primary button starts a gesture or a palette drag ([94ef87b](https://github.com/Esposter/Esposter/commit/94ef87b5dbad292f38d186a6c988352b9bc7ea3b))
* **vue-grid-layout-headless:** the compactLayout comment and comparator name the pair they compare ([50d71fd](https://github.com/Esposter/Esposter/commit/50d71fdb0e9e92e453ba7cd3cff9e8e0b9a2cd31))
* **vue-grid-layout-headless:** the shared dependency returns, because the composable imports checkIsNestedControl from it ([abb1817](https://github.com/Esposter/Esposter/commit/abb181750dfd5b51f7635e82eb30c4af2a3ff693))
* **vue-grid-layout-headless:** the unused @esposter/shared dependency is dropped from the manifest ([7056772](https://github.com/Esposter/Esposter/commit/7056772e61fc6542e0cf676d75f9ffb9a63a3302))
* **vue-grid-layout-headless:** vue is a required peer only, not a dev dependency ([4d7ccb6](https://github.com/Esposter/Esposter/commit/4d7ccb60a16aae4141f8722a7bd781796679a0e4))

### Features

* **vue-grid-layout-headless:** a drop swaps with the one item it lands on, or is refused ([1d798ba](https://github.com/Esposter/Esposter/commit/1d798bab0b97bb8ab80a48888b5ed659f68f2037))
* **vue-grid-layout-headless:** a resize pulls from any edge or corner ([f3a7360](https://github.com/Esposter/Esposter/commit/f3a7360617cc4e8475681a25d7b0dbee955c238c))
* **vue-grid-layout-headless:** an auto-height item grows to hold the content it reports ([cdbaf1a](https://github.com/Esposter/Esposter/commit/cdbaf1adb8761442453645692ab9f5d1fe1cd7c2))
* **vue-grid-layout-headless:** an item dropped from another grid or a palette lands where the pointer releases it ([434a05e](https://github.com/Esposter/Esposter/commit/434a05e092a9b123d0641217c683e0bcac55fb63))
* **vue-grid-layout-headless:** move the placement functions into the headless package ([8f09443](https://github.com/Esposter/Esposter/commit/8f0944345f150360a1b8f161222060e17cab3239))
* **vue-grid-layout-headless:** the gesture state moves into useGridLayout, and the dashboard grid renders its tiles ([dd07112](https://github.com/Esposter/Esposter/commit/dd07112c7e87118a172d25774011a65297e301af))
* **vue-grid-layout-headless:** the grid compacts vertically, horizontally, or not at all ([55bcd50](https://github.com/Esposter/Esposter/commit/55bcd503e56b0117c88bd527b6b2614690938e6c))
