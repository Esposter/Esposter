# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.9.0](https://github.com/Esposter/Esposter/compare/v3.8.1...v3.9.0) (2026-10-01)

### Bug Fixes

* **genshin-engine:** lay a cloud band out by view depth before each draw, as three sorted its sprites apiece ([e9dddb2](https://github.com/Esposter/Esposter/commit/e9dddb28790d1e119dd6298979faf1dc7eb0f32a))
* **genshin-engine:** paint clouds as smooth soft-edged puffs instead of stepped polygons ([dd8e073](https://github.com/Esposter/Esposter/commit/dd8e073ed7fe0369fdce6ec5f673014a7dad20b8))
* **genshin-parity:** type the stone and sky fits' channels and the cloud band's places ([ad44afb](https://github.com/Esposter/Esposter/commit/ad44afb7c7daacade525cb3641daa7853bc39b27))
* **genshin-world:** drop the login's bridges 5 m so the glide passes over them, and light its stone physically ([5af5380](https://github.com/Esposter/Esposter/commit/5af5380cdade5a8d37c78c6e87b90f22f8d33094))
* **genshin-world:** glide the login under its bridges, not through them, the door rising at the walkway's end ([35e2db7](https://github.com/Esposter/Esposter/commit/35e2db72c788c0bedeb6d9f0b4848fbf858e17cb))
* **genshin-world:** solve the login's camera on the towers behind the door, lowering every far part in its frame ([e669664](https://github.com/Esposter/Esposter/commit/e669664a17288884488e8341cb72f154f3489e8e))
* **genshin-world:** solve the login's dusk sky over the recording's clear sky, its clouds left out ([51ef4a4](https://github.com/Esposter/Esposter/commit/51ef4a45a7ac472474edcae86a9ed8f48d569fb6))
* **genshin-world:** type the login's stone from its fitted data and give the door its glow through the stone material ([0268397](https://github.com/Esposter/Esposter/commit/0268397d2a3276f0794b50bd2e4936b9f669be52))
* main goes green — lint, knip, a skill citation, the dependency graph and genshin size snapshots ([023f459](https://github.com/Esposter/Esposter/commit/023f459c031d28cb5c6976d9268b55c942a4eaba))
* repair main's red lint and coverage after the cloud-colours and login sky commits ([e334e23](https://github.com/Esposter/Esposter/commit/e334e2394a7ef5e399ec1bed83c2b56e582cf1e4))
* repair main's red Lint and Coverage on the login door, paving and fog ([c7076c1](https://github.com/Esposter/Esposter/commit/c7076c1762b6fc5b3e992d185c9dc7fc32f530a0))

### Features

* **genshin-engine:** draw the sky as the game's sky shader does, ported from its decompiled programs ([daf47f9](https://github.com/Esposter/Esposter/commit/daf47f926b6f072e12ebaa04bd08b7d59c7a2a46))
* **genshin-parity:** solve a reference's haze with `fog`, and haze the login's day seven times as thick ([7f07d16](https://github.com/Esposter/Esposter/commit/7f07d168e7dd5c165c3baa162a6c94378e1902a7))
* **genshin-world:** paint the login's door with its panel's raised bands and its feet's gilding ([fc88e9e](https://github.com/Esposter/Esposter/commit/fc88e9e1e4e399cfe197a80877edd3d1ffe27142))

## [3.8.1](https://github.com/Esposter/Esposter/compare/v3.8.0...v3.8.1) (2026-09-30)

**Note:** Version bump only for package genshin-engine

# [3.8.0](https://github.com/Esposter/Esposter/compare/v3.7.0...v3.8.0) (2026-09-30)

### Bug Fixes

* **ci:** the reds on e92e030440 — scripts and genshin-world lint, three size snapshots, the graph and a module-scope constant ([120561f](https://github.com/Esposter/Esposter/commit/120561ff9c35d38c4846d9e685f79e491c3804ca))
* **genshin-engine:** the renderer reads the browser's navigator through window ([5a6b74b](https://github.com/Esposter/Esposter/commit/5a6b74b0ae34f0238f5471bc8d30e59b2e73ca53))
* **genshin:** the door constants test typechecks and scopes its constants, and the size snapshots follow the build ([60d19ac](https://github.com/Esposter/Esposter/commit/60d19ac98860a29cc62a7b7d00c7854464b2adb6))
* **genshin:** the neutral tone mapping on every canvas, and measured sky colours through it ([5a9b82d](https://github.com/Esposter/Esposter/commit/5a9b82d0373fdcbef0b5d3641ad318bfa7ae6a77))
* **genshin:** the walkway meets the door's foot, and the login's first pose is matched on the witness ([3e28d14](https://github.com/Esposter/Esposter/commit/3e28d14324de9e28ac535a9ae1e3ec7f0441f0d2))
* the world's console warnings ([134f462](https://github.com/Esposter/Esposter/commit/134f462d3bda578f41c1a82bbb7d1fb2c974f3a6))

### Features

* **genshin-engine:** a screen point as a direction, and haze that scatters toward the sun ([ebeaed2](https://github.com/Esposter/Esposter/commit/ebeaed263967958421d1c59004bc90848ae97d18))
* **genshin-engine:** painted cloud sprites, a fitted horizon band, and a bounded tone-map inverse ([7269802](https://github.com/Esposter/Esposter/commit/7269802fe265c5f603301de4743174993f3df66b))
* **genshin-world:** the login screen in the opening, a first pass of its scene ([1ee2bc1](https://github.com/Esposter/Esposter/commit/1ee2bc100c72b2d8e89342c50b8775040b015cb8))
* **genshin:** the login scene's bridges and pillars, fitted as silhouettes ([3f5b9e3](https://github.com/Esposter/Esposter/commit/3f5b9e3f8e86c11491506681d6af9e0f509947df))
* **genshin:** the login screen's flight and door, and genshin-ui for the game's interface ([b53f509](https://github.com/Esposter/Esposter/commit/b53f509c9dc04833338c71cd30206704d68f8bc5))
* **genshin:** the scene derivation's first tools, and the login's exports drawn through our own scene ([36d90ed](https://github.com/Esposter/Esposter/commit/36d90ed97a21285bb99411c6ff2c50ea65026c69))

# [3.7.0](https://github.com/Esposter/Esposter/compare/v3.6.0...v3.7.0) (2026-09-29)

**Note:** Version bump only for package genshin-engine

# [3.6.0](https://github.com/Esposter/Esposter/compare/v3.5.1...v3.6.0) (2026-09-29)

### Bug Fixes

* **genshin-engine:** lift the sky test's fixture to module scope, and sort its targets' imports ([185d5e9](https://github.com/Esposter/Esposter/commit/185d5e9bbcc4e228f7a845ad33a7d732981ee8d7))
* **genshin-engine:** name the terrain's boolean callbacks check*, type the streamer test's mocks, and pick the terrain material's options ([bad8680](https://github.com/Esposter/Esposter/commit/bad86806e2829290fc62d8e111f3c29d1051a89a))
* **genshin-engine:** terrain indices widen to 32 bits once a tile's vertices outgrow sixteen ([513c9b0](https://github.com/Esposter/Esposter/commit/513c9b0e1f7a20d6e8c75b1b1035c116987d2c56))
* **genshin-engine:** the height fog takes the level integral for any ray that climbs through no falloff ([ab31e91](https://github.com/Esposter/Esposter/commit/ab31e914f99531236a67065f96de76e9d00c55f4))
* **genshin-engine:** the origin shift reports none when it rounds to none ([232e9a5](https://github.com/Esposter/Esposter/commit/232e9a51b9f193c88a8cc07bacad43973322f742))
* **genshin-engine:** the tile cache keeps drawn ancestors and frees late arrivals the view moved on from ([d1ecee3](https://github.com/Esposter/Esposter/commit/d1ecee3726e27d517fc2e7b968fa1c88858802cd))
* main goes green — four failing tests and one size snapshot ([8d26d11](https://github.com/Esposter/Esposter/commit/8d26d119f9eb237bb926b402cba4dd139ee623a0))
* repair main's lint and coverage reds from the Genshin parity loop ([7f95d3b](https://github.com/Esposter/Esposter/commit/7f95d3baec5218d97b9f98f17f4c6c48cc4d8edd))
* repair main's lint, constant scope and duplicate prose reds ([e8c980a](https://github.com/Esposter/Esposter/commit/e8c980a9e5867d2b0cb66c6ad3b2c19ed389d3bf))
* **web:** keep the terrain worker's message event whole, and sort the water's uniforms ([65eeb39](https://github.com/Esposter/Esposter/commit/65eeb39044981d89c15ec23e9038b0369dbb2be6))

### Features

* **genshin-engine:** a published engine package, and Windrise as the console's world ([fcb70cd](https://github.com/Esposter/Esposter/commit/fcb70cd27592474305a86a0de6dc8b4ecad0c531))
* **genshin-engine:** cascaded shadows, god rays, height fog, a grade and TRAA, and ship the rendering style ([3f625f4](https://github.com/Esposter/Esposter/commit/3f625f4b4d45ec568d2a72b68c6958490d3822bd))
* **genshin-engine:** one wind field and GPU grass in two rings, and ship the vegetation ([ae49966](https://github.com/Esposter/Esposter/commit/ae499660529c6f415746e7c035b4d3a6a8e74122))
* **genshin-engine:** still water graded by depth, with foam, glints, caustics and an underwater fog, and ship it ([c8b64d3](https://github.com/Esposter/Esposter/commit/c8b64d3fef9420887ef0198773160f8441c72117))
* **genshin-engine:** stream the ground on a CDLOD quadtree with a floating origin, and ship the terrain ([e003511](https://github.com/Esposter/Esposter/commit/e0035112efca5daeb7c6ee0a2616b42da8636b04))
* **genshin-engine:** the game's day under a painted sky, and ship sky and time ([6cbc939](https://github.com/Esposter/Esposter/commit/6cbc9395a5bef7fe8f238c2613853687c813f07f))
* **web:** the world map's catalogue and region data loaded by reach, and ship the world map ([a883b28](https://github.com/Esposter/Esposter/commit/a883b28c471e56f990fd8dd17e39d1ab8be5dfb1))
