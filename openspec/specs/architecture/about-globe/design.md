# About globe

The globe is the about page's one interactive visual. It is drawn on three.js alone: the land from a mask, the arcs from curves, and the pulses from rings.

```mermaid
flowchart LR
  GEOJSON["world GeoJSON"] -->|"one-off generator"| MASK["land mask (rows of land runs)"]
  MASK --> DOTS["land dots: rings of latitude, kept where land"]
  DOTS --> MESH["one instanced mesh"]
  ARCS["arc data"] --> CURVE["cubic Bezier per arc"] --> TUBE["tube, draw range animated"]
  TUBE --> PULSE["ring pulse where the arc lands"]
  MESH --> FRAME["frame"]
  PULSE --> FRAME
  FRAME --> WATCH{"frame rate holds?"}
  WATCH -->|"no"| TIER["next quality tier: pixel ratio, dot density"]
  TIER --> DOTS
```

## Decisions

- **Land is dots read off a mask, not tiles built from polygons.** A latitude ring of dots is spaced evenly in arc length and each dot is kept where the mask says land. Rejected: `three-globe`'s hex polygons, which rebuild the tiling from the GeoJSON in the browser on every mount and pull its geometry packages.
- **The mask is generated once and committed.** A generator rasterises the world GeoJSON into rows of land runs at half a degree and writes it under `generated/`, so the browser never reads the polygons. Rejected: sampling a hand-drawn PNG through `getImageData`, which needs the canvas and a second source of truth.
- **Arcs are Bezier tubes with a draw range.** A cubic curve lifts each arc to its altitude, and the tube's draw range grows and shrinks. Rejected: dashed arcs, which draw the whole tube every frame.
- **Quality steps down, never up.** A watcher over the last fifty frames lowers the tier when the mean frame rate is under the target, and the dots are rebuilt at the lower density. Rejected: antialiasing, which the halo shader hides more cheaply.
- **The labels are dropped.** The previous globe named fifty random countries over a note that the browser was not powerful enough to draw them. The countries stay as bare coordinates for the coloured points; the pulses are the arcs' landing rings.
- **The halo fades by alpha.** It reads the same over a light page and a dark one, where an additive glow washes out on a light page.
- **The globe's code loads when the reader nears it.** The globe is the last section of the page and three.js is most of its weight, so the page holds a box of the globe's size and mounts the globe, as a lazy component, once the box is within a screen of the viewport. The data is a few kilobytes and stays in the chunk; the saving is the renderer a reader who never scrolls that far never downloads. Rejected: Nuxt's `hydrate-on-visible`, which hydrates server-rendered markup, and the globe renders nothing on the server; and the `ClientOnly` wrapper alone, which still fetched the chunk on arrival.
- **The arcs share one ring geometry.** Every landing ring is the same shape, so one geometry serves them all and only the material, scale and opacity differ.
- **The globe stands still when it cannot move.** Under reduced motion the arcs are drawn whole and the loop draws one frame; off screen the loop stops.

## Key files

| Path                                                              | Role                                                                          |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `apps/web/app/pages/about.vue`                                    | the sized box that mounts the globe once the reader nears it                  |
| `apps/web/app/components/Visual/Globe.client.vue`                 | the canvas mount, sized by its box                                            |
| `apps/web/app/services/visual/globe/`                             | the pure services: mask decoding, dots, curves, quality tiers, start rotation |
| `apps/web/app/services/visual/GlobeConfiguration.ts`              | the colours and the sizes                                                     |
| `apps/web/app/assets/about/generated/globeLandMask/landMask.json` | the generated mask                                                            |
| `scripts/src/globeLandMask/index.ts`                              | the generator's entrypoint, run as `pnpm globe:gen`                           |
| `scripts/src/globeLandMask/world.json`                            | the world GeoJSON the generator reads, which the app's bundle never holds     |
| `scripts/src/services/globeLandMask/rasterizeLandMask.ts`         | the scanline fill that turns the polygons into land runs                      |
| `apps/web/app/services/visual/globe/createGlobeScene.ts`          | the three.js scene: sphere, halo, dots, points, arc tubes and rings           |
| `apps/web/app/composables/visual/useGlobeScene.ts`                | the loop, the visibility and reduced-motion gates and the teardown            |

## Sources

- [How we built the GitHub globe](https://github.blog/engineering/how-we-built-the-github-globe/), the dots, the Bezier arcs, the rings, the quality tiers and the timezone start.
- [Visualizing GitHub's global community](https://github.blog/2020-12-21-visualizing-githubs-global-community/), the data the arcs stand for.
