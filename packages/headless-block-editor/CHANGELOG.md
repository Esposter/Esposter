# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.4.0](https://github.com/Esposter/Esposter/compare/v4.3.3...v4.4.0) (2026-10-30)

### Bug Fixes

* **headless-block-editor:** the document schema's input type carries the document, so a save's body is typed ([f5e1431](https://github.com/Esposter/Esposter/commit/f5e1431b34e5e775282ddd62ede09792b67d1146))
* **lint:** the findings the eight lint buckets could fix, with the rest left for their own decisions ([360085e](https://github.com/Esposter/Esposter/commit/360085e05db2e249b54851ffdba67556be107ebd))
* **lint:** the oxlint autofix gives void-returning arrows block bodies, and the formatter lays them out ([9103811](https://github.com/Esposter/Esposter/commit/910381177c6a9906b3283661d4f85ec66c77c785))
* **lint:** the scripts, functions and shared packages' findings are fixed, or kept with the constraint that holds ([def559c](https://github.com/Esposter/Esposter/commit/def559c12d5dfe372710fce37138f4d50da71b4b))
* **lint:** the shared, package and test sources satisfy the oxlint rules ([689d2e5](https://github.com/Esposter/Esposter/commit/689d2e55a3eee18570d0bbc2108ecbfce53f8171))
* **page-builder:** every string and array in the email and webpage inputs is bounded ([617b16c](https://github.com/Esposter/Esposter/commit/617b16c09b51e96acb0fbe9d0ea3ed1a7210ad7b))

## [4.3.3](https://github.com/Esposter/Esposter/compare/v4.3.2...v4.3.3) (2026-10-22)

**Note:** Version bump only for package headless-block-editor

## [4.3.2](https://github.com/Esposter/Esposter/compare/v4.3.1...v4.3.2) (2026-10-21)

**Note:** Version bump only for package headless-block-editor

## [4.3.1](https://github.com/Esposter/Esposter/compare/v4.3.0...v4.3.1) (2026-10-21)

**Note:** Version bump only for package headless-block-editor

# [4.3.0](https://github.com/Esposter/Esposter/compare/v4.2.0...v4.3.0) (2026-10-21)

### Bug Fixes

* **headless-block-editor:** a move lands after its removal, and slot lookups ignore inherited keys ([91c3ede](https://github.com/Esposter/Esposter/commit/91c3edee2da7fc95ee2281f72853e09493940db2))
* **headless-block-editor:** a pointer past the end of its slot names no focus target ([c34ca65](https://github.com/Esposter/Esposter/commit/c34ca651dcbf62731ddc84da16016bf000f6eefb))
* **headless-block-editor:** a refusal names the accepted types in the order given, as the record keeps them ([c602571](https://github.com/Esposter/Esposter/commit/c60257178c616327122e8c93e71c0a7422f99841))
* **headless-block-editor:** default a registry's definitions to its node type ([467c229](https://github.com/Esposter/Esposter/commit/467c229c4c5bff1bd7e7d5cf853c57695d7180ef))
* **headless-block-editor:** enforce a type's own refinements on its props ([62229b1](https://github.com/Esposter/Esposter/commit/62229b123d4b371ebd184ed369ff60360c515870))
* **headless-block-editor:** gate a type's refinements on a clean shape ([d90c1a1](https://github.com/Esposter/Esposter/commit/d90c1a14d9bc2f27cf13e5946f3789ad10d14abe))
* **headless-block-editor:** refuse a slot that accepts a type the registry lacks ([7420329](https://github.com/Esposter/Esposter/commit/74203299285c4cd34d5e190a57661717df2f4af4))
* **headless-block-editor:** restore the per-registry schema cache across parses ([3665bcb](https://github.com/Esposter/Esposter/commit/3665bcb0351f0e797502778dcb060cf897e1837d))
* **headless-block-editor:** the block slots are a Record and the comments' capitalization reads as one sentence ([829fa44](https://github.com/Esposter/Esposter/commit/829fa44cb2534076c18f9ca9ecc11d712a18ee8a))
* **headless-block-editor:** the paste suite pins the id it mints, and the render helper moves to module scope ([31df373](https://github.com/Esposter/Esposter/commit/31df37363a0b9429d2252368d3825c5e23bb49b1))
* **headless-block-editor:** the type bench is an entry point for the unused-files check, and its two imports from one module are one import ([14f7395](https://github.com/Esposter/Esposter/commit/14f73955f911c4a432e6d6debfee7212c1c691b2))
* **packages:** the absorbed packages typecheck and lint clean ([7483a70](https://github.com/Esposter/Esposter/commit/7483a70c65b614ed0a8c43f2e3180215c9c246e2))
* the lint errors, the math test's parse cost and the tree-read timeouts ([1128416](https://github.com/Esposter/Esposter/commit/1128416ea43b6f26793d7b72778700f836e73a00))

### Features

* **headless-block-editor:** a parsed document's root props carry the root schema's type ([43e2da7](https://github.com/Esposter/Esposter/commit/43e2da7d71d5c816285c04a22166290bf20b25b4))
* **headless-block-editor:** a registry declares its root, a paste checks its copies as the slot's children, and documents fold from their leaves up ([0f34206](https://github.com/Esposter/Esposter/commit/0f342062c56e4b84a39343f20f55eb844abd2f06))
* **headless-block-editor:** a typed block tree with the commands, navigation and history that edit it ([b94e010](https://github.com/Esposter/Esposter/commit/b94e010f94d73bc50c0895dba298edebe6ecd8f2))
* **headless-block-editor:** document order, the layer rows, Move to's targets, the move out and duplicate ([678fd6c](https://github.com/Esposter/Esposter/commit/678fd6c00a8cfdb389a8d18c7cb311f2e7641dc6))
* **headless-block-editor:** type each node's child slots and refuse nested children a slot does not accept ([908eca4](https://github.com/Esposter/Esposter/commit/908eca49e5c1286fc99f5eaf401c4976dc5b70d7))

### Performance Improvements

* **headless-block-editor:** BlockSlots is a mapped type again, which the type bench counts cheaper over the node union ([37f2543](https://github.com/Esposter/Esposter/commit/37f2543e6bfd952c0149ba160a8e41d6590e779d))
