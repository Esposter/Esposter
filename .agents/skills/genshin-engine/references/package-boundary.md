# Package boundary

Read when code is placed in the engine, the world package or the app, or a world component is handed a prop by the app.

The one-line rule is in `SKILL.md`; this page is its reasoning.

`genshin-engine` is the renderer and the generators, and knows no region by name. `genshin-world` is the game's world on it: the catalogue, the regions' data, and the TresJS layer — components and composables such as `usePostPipeline` — that creates the engine's modules. The world's screen (`WorldScreen`) owns its canvas; the app keeps only the opening (`components/Genshin/Index.vue`), its stores, and the bundler's seams, which the world takes as props: the terrain worker's factory, the URL region data is fetched from, and the tuning panel's visibility.
