# The world package build

Read when the world package's build, or the Tres tags its templates compile to, is in question.

- **The world package is published and builds through `getTsdownConfigurationVue(templateCompilerOptions)`**, so its templates' `Tres*` tags compile as the renderer's elements. It reaches Vue's own APIs through auto-imports and names TresJS's and VueUse's imports. Its terrain worker is its own entry (`genshin-world/terrainTileWorker`), which the app bundles with `?worker`, and everything on the worker's path imports the engine through `genshin-engine/terrainWorker`, never its barrel, since a worker loading the barrel loads the whole renderer before its first tile; `terrainTile.worker.test.ts` scans the worker's graph and fails on any package past three.
