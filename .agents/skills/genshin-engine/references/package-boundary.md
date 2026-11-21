# Package boundary

Read when code is placed in the engine, the world package or the app, or a world component is handed a prop by the app.

The one-line rule is in `SKILL.md`; this page is its reasoning.

`genshin-engine` is the renderer and the generators, and knows no region by name. `genshin-world` is the game's world on it: the catalogue, the regions' data, and the TresJS layer — components and composables such as `usePostPipeline` — that creates the engine's modules. The world's screen (`WorldScreen`) owns its canvas. The app keeps the opening (`components/Genshin/Index.client.vue`), its stores, `components/Genshin/World.vue`, which mounts the screen and wires it to the app's session and bundler, and the developer surface under `components/Genshin/Dev/`, which a production build strips. The seams the world takes as props are the terrain worker's factory, the URL region data is fetched from, the tuning panel's visibility, and the developer registry the surface hands up. The developer surface stays in the app because its panels import the app's models, constants and local storage keys, which the package may not import, so moving it would be a rewrite rather than a move (`openspec/changes/archive/2026-11-08-genshin-playtest-tools`).
