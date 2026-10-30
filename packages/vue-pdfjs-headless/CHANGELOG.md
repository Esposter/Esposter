# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.4.0](https://github.com/Esposter/Esposter/compare/v4.3.3...v4.4.0) (2026-10-30)

### Bug Fixes

* **lint:** the oxlint autofix gives void-returning arrows block bodies, and the formatter lays them out ([9103811](https://github.com/Esposter/Esposter/commit/910381177c6a9906b3283661d4f85ec66c77c785))
* **lint:** the scripts, functions and shared packages' findings are fixed, or kept with the constraint that holds ([def559c](https://github.com/Esposter/Esposter/commit/def559c12d5dfe372710fce37138f4d50da71b4b))
* **lint:** usePdfViewer reports a followBookmark rejection as its siblings do, and the persona speech loop types its status ([8ebcf04](https://github.com/Esposter/Esposter/commit/8ebcf0424a7e1907acc4e259f6355b8f3269a8a9))
* **vue-pdfjs-headless:** XFDF drops the control characters XML cannot hold ([a479aea](https://github.com/Esposter/Esposter/commit/a479aea0c95636ccac36544752ef26eeaebfc0f4))

### Features

* **vue-pdfjs-headless:** annotations — forms kept on save, drawn annotations reported, comments listed, XFDF free texts, edited and watermarked download ([c072154](https://github.com/Esposter/Esposter/commit/c0721547fee730d5ea2c27827b9b7c1a97351da5))

## [4.3.3](https://github.com/Esposter/Esposter/compare/v4.3.2...v4.3.3) (2026-10-22)

**Note:** Version bump only for package vue-pdfjs-headless

## [4.3.2](https://github.com/Esposter/Esposter/compare/v4.3.1...v4.3.2) (2026-10-21)

**Note:** Version bump only for package vue-pdfjs-headless

## [4.3.1](https://github.com/Esposter/Esposter/compare/v4.3.0...v4.3.1) (2026-10-21)

**Note:** Version bump only for package vue-pdfjs-headless

# [4.3.0](https://github.com/Esposter/Esposter/compare/v4.2.0...v4.3.0) (2026-10-21)

### Bug Fixes

* **packages:** the absorbed packages typecheck and lint clean ([7483a70](https://github.com/Esposter/Esposter/commit/7483a70c65b614ed0a8c43f2e3180215c9c246e2))
* **vue-pdfjs-headless:** a canvas removed mid-draw cancels its draw ([363e9ed](https://github.com/Esposter/Esposter/commit/363e9ede5d7e7f3f402e32bdb1b7fff25dd86cf5))
* **vue-pdfjs-headless:** a canvas swapped in at the same width is drawn, and the viewer's own listeners go with it ([bae1073](https://github.com/Esposter/Esposter/commit/bae1073e4899ff6529154662c334bfd556234865))
* **vue-pdfjs-headless:** a document opens fitted once its pages exist, and the find controller is handed over once ([7cde191](https://github.com/Esposter/Esposter/commit/7cde1914d9a9feb220902286d503f2cc02336f34))
* **vue-pdfjs-headless:** a password request from a released load is ignored, and a failed load's task is destroyed ([207be41](https://github.com/Esposter/Esposter/commit/207be415d84eab4884577c850f63b009ef9917ee))
* **web:** a PDF viewer whose own module fails to load says so, rather than showing an empty toolbar ([6f0f373](https://github.com/Esposter/Esposter/commit/6f0f373dcf1fd55a50e7e79f977bfed78f2926ab))
* **workspace:** a required peer is listed once, and a test holds every manifest to it ([8823f95](https://github.com/Esposter/Esposter/commit/8823f95e44a66baaafc7684fb1a277b85c759e17))

### Features

* **vue-pdfjs-headless:** add the headless package with the document composable ([94ddcd6](https://github.com/Esposter/Esposter/commit/94ddcd6c19e58422b443ff20aeed56da81e0f98e))
* **vue-pdfjs-headless:** move the PDF viewer's page and view state into the package ([58754d5](https://github.com/Esposter/Esposter/commit/58754d5b3a7d319b5566247e8832ea283fbc2f58))
* **vue-pdfjs-headless:** the viewer's overlays, zoom, terms, bookmarks, thumbnails and fullscreen are state ([e01805c](https://github.com/Esposter/Esposter/commit/e01805c3b4cc7be5f5c8563cd2e3afcfeb22fcfd))
