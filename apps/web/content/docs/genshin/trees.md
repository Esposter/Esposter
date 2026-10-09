---
title: Trees
description: Genshin's trees as species, each one set of the tree kit's parameters a placed tree names, and each drawn as its mesh near the eye and as an impostor far from it. A tree's wood is its trunk, its branches and its surface roots, the roots swept as tubes along splines fitted to its export's own. The impostor is baked once from the tree's own mesh, its colour and its normal, and drawn on one card turned about the trunk to face the eye and toon-lit through the hour; the two cross over by a dither across a band some ten of the tree's heights out.
---

# Trees

A forest of the game's is a handful of species placed many times, so a tree here is a species, one set of the [tree kit's](/docs/genshin/vegetation) parameters, and a placed tree names its species rather than carrying parameters of its own. Near the eye a tree is its mesh, wood and leaf cards; far from it, where its cards would cost the same and show a few pixels, it is an impostor: one card carrying a picture of the mesh baked from its side.

## How it works

```mermaid
flowchart TD
  LM["A placed tree: its species, place and turn"] --> SP["The species' parameters"]
  SP --> MESH["The tree kit's mesh: trunk, branches, surface roots and leaf cards"]
  MESH -->|first frame the renderer draws| BAKE["Baked from its side: colour, and normal, each unlit"]
  BAKE --> CARD["One card, turned about the trunk to face the eye"]
  EYE["The eye's distance from the tree"] --> FADE{"Past ten of its heights?"}
  FADE -->|near| M["The mesh draws"]
  FADE -->|across the band| D["Dither: the card draws the pixels the mesh does not"]
  FADE -->|far| I["The card draws, lit by its baked normal"]
  CARD --> I
  MESH --> M
```

- **A species is a set of parameters.** `TreeSpecies` names each species and `createTreeSpeciesOptionsMap` builds its parameters, once as Windrise opens, so a species placed a thousand times is fitted once. A tree landmark names its species in its region's data. Windrise's great oak is the first: its leaf clusters, the leaf each holds, its leaves' normal field, its trunk's taper and its surface roots are read off the game's own export into the `windrise/oak` record, which the world's screen reads from the [hosted game data](/docs/genshin/hosted-game-data) before it opens, its branches still the ones set against its reference screenshots. Its bark and leaves are coloured by their parts of the `windrise/surfaces` record, which the impostor is baked in too.
- **Surface roots are swept tubes.** A root is the points its centreline runs through, each with the root's radius there, from where it leaves the trunk or the root it forks from to its tip. The kit runs a centripetal Catmull-Rom spline through them, which neither loops nor cusps where the points are spaced unevenly, cuts it into sections well under a metre long, and sweeps a ring of a few sides along it, the radius running straight from point to point and each ring turned by parallel transport so the tube never twists (`computeRootTubes`). The tubes are merged into the wood's one geometry, so the roots draw in the bark's shared material in the same draw as the trunk, and are baked into the impostor with it. A root's start is left open, since it stands inside the trunk or its parent root, and a point of no radius closes its tip.
- **The impostor is baked from the tree's own mesh.** On the first frame the renderer can draw, an orthographic camera standing off the trunk's axis renders the wood and the leaf cards twice into small targets (`bakeImpostor`): once in each part's own colour, unlit, and once in its normal as the camera sees it, the leaf cards cut to their shape as the crown's are. The target frames the mesh from its axis out to its widest on either side and from its foot to its crown.
- **The card turns about the trunk.** The impostor is one quad of that width and height, turned in the vertex stage about its upright axis to face the eye (`createImpostorMaterial`), so a tree stays standing however the eye looks at it, from the ground or from above. In a shadow pass it turns to the light instead, so it casts the shape the sun sees.
- **It is lit as the mesh is.** The card takes the baked colour, darkened when wet as every surface is, and the baked normal turned with the card as its own, through the toon ramp, so its crown shades as the mesh's does through the hour rather than a picture lit at bake time. It draws no outline, as the ground draws none.
- **The two cross over by a dither.** A tree hands its mesh to its impostor some ten of its own heights from the eye (`IMPOSTOR_SWITCH_HEIGHTS`), so a larger tree keeps its mesh further, across a band a tenth of that distance wide. Across the band a fixed noise over the screen picks which pixels each draws (`createDitherFadeNode`): the impostor's share is how far it has faded in and the mesh draws every pixel the impostor does not, so a pixel is never drawn twice nor left empty. Outside the band only one of the two is drawn at all.

A tree's surface roots reach the kit from its export's bark through the fit, and the kit sweeps them as it builds the wood:

```mermaid
flowchart TD
  BARK["The export's root submesh"] --> PIECE["Each piece, from its open end"]
  PIECE --> CUT["Cut at every step of distance along its edges"]
  CUT --> LOOPS{"How many loops does the cut cross?"}
  LOOPS -->|one| POINT["One point: the loop's centroid and mean radius"]
  LOOPS -->|"two or more"| FORK["The farthest-reaching child keeps the path, each other starts a root at the fork"]
  FORK --> POINT
  POINT -->|"past the last cut"| TIP["Its farthest vertex, of no radius"]
  TIP --> SIMPLIFY["Points kept within the tolerance"]
  SIMPLIFY --> RECORD["The oak's record"]
  RECORD --> SPLINE["A centripetal Catmull-Rom spline through each root's points"]
  SPLINE --> TUBE["Rings swept along it, merged into the wood"]
```

## What it costs to run

- **A tree's roots are built once, with its mesh.** Their cost follows their sections, and the oak's few dozen roots add a few thousand vertices to its wood (`computeRootTubes.bench.md`).
- **One bake a tree, two small renders, once.** The targets are a few hundred texels on their longer side.
- **A far tree is two triangles.** Its card's cost is a few texture reads a pixel; its mesh is not drawn at all past the band.
- **A tree decides its detail from one distance a frame**, on the main thread.

## Key files

| File                                                                       | Role                                                                                                   |
| :------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/models/world/TreeSpecies.ts`                   | The species the game's trees are rebuilt as                                                            |
| `packages/genshin-world/src/services/world/createTreeSpeciesOptionsMap.ts` | Each species' tree kit parameters, the great oak's first, its branches provisional                     |
| `packages/genshin-world/src/models/windrise/WindriseOak.ts`                | The great oak's leaf clusters with the leaf each holds, its normal field, its roots and trunk taper    |
| `scripts/src/services/genshinAssets/fit/fitWindriseOak.ts`                 | The fit that clusters the leaf mesh's cards with their kept leaf and reads the bark's taper and roots  |
| `scripts/src/services/genshinAssets/fit/traceRootCentrelines.ts`           | A mesh of tubes traced from each piece's open end into the centrelines and radii it is swept along     |
| `packages/genshin-engine/src/kits/tree/computeRootTubes.ts`                | Each surface root swept as a tube along its spline                                                     |
| `packages/genshin-engine/src/models/kits/tree/TreeRoot.ts`                 | A surface root as the points its spline runs through, each with its radius                             |
| `packages/genshin-world/src/components/World/Landmark/Tree/Index.vue`      | A placed tree: its mesh, its impostor, and the cross-over between                                      |
| `packages/genshin-world/src/components/World/Plants/Index.vue`             | Windrise's placed plants, one instanced draw per prefab: the oak's impostor for trees, domes otherwise |
| `packages/genshin-world/src/services/world/bakeTreeImpostor.ts`            | The impostor baked from a tree's bark and leaf meshes, shared by a placed tree and a plant             |
| `packages/genshin-engine/src/vegetation/bakeImpostor.ts`                   | A mesh's colour and normal baked from its side                                                         |
| `packages/genshin-engine/src/nodes/createImpostorMaterial.ts`              | The card turned to the eye and lit by its baked normal                                                 |
| `packages/genshin-engine/src/nodes/createDitherFadeNode.ts`                | Which pixels each of two cross-fading details draws                                                    |
| `packages/genshin-engine/src/nodes/createLeafShapeNode.ts`                 | A leaf card's cut, shared by the crown and its bake                                                    |
| `packages/genshin-engine/src/vegetation/constants.ts`                      | The impostor's resolution and where it takes over, provisional                                         |

## Notes

- **The great oak's leaf clusters are fitted to its export's leaves.** Each cluster's centre and reach are the k-means of the leaf mesh's card centres, 1280 of them, about five cards a cluster, and each holds the leaf its cards keep, a card's area times the share of its texture the material's cutoff keeps. The kit grows as many cards in a cluster as keep three times that leaf (`leafAreaScale`): our solid pointed ovals draw the crown as opaque as the export's cut cards at about twice its leaf, and the shape pass's envelope reads nearest at three times. Its trunk's radius steps down the bark's own taper, so the canopy is the export's layout rather than a species' random one.
- **The great oak's surface roots are traced off its export's bark.** They are the bark mesh's second submesh, the one its second bark material draws: a few dozen closed tubes, each open only where it leaves the trunk or the root it forks from. The fit traces each from that open end by its vertices' distance along its edges, cuts it at every step of that distance (`OAK_ROOT_LEVEL_STEP`, a fraction of a metre) into the loops the cut crosses it in, takes each loop's centroid and mean radius as a point, closes it on its farthest vertex, and keeps the points within a few centimetres (`OAK_ROOT_TOLERANCE`), its radius weighed as its place is (`traceRootCentrelines`). Where the loops part, the path keeps to the child leading farthest on and each other child starts a root of its own at the fork. The roots stand at the export's own heights round the oak's foot, so where our ground stands higher than the game's terrain it buries them, which half a metre's lift does not mend ([scene derivation](/docs/genshin/scene-derivation), Decisions). Its branches and the switch are provisional: the switch is read off a recording walking away from one of the game's trees ([trees and scatter](/docs/proposals/genshin/trees-and-scatter)), and the oak's shape is judged by the outline, depth and normal of the shape pass.
- **The placed plants are one instanced draw per prefab.** Windrise's plants from its streams (the `windrise/plants` record) stand as stand-ins in `World/Plants`: a tree prefab as the oak's impostor, the baked card shared by every place, and any other plant as a low dome of the ground's green. Each prefab is one draw, so 2,200 places cost fifteen draws. The oak's own mesh is left to its landmark. Species for the placed trees, and culling their instances on the GPU, wait for the layout pass's next rows ([trees and scatter](/docs/proposals/genshin/trees-and-scatter)).
- **The impostor is baked from one side.** Seen from straight above, its card stands edge-on and a far tree all but vanishes; one view holds for the near-horizontal views a walk and a glide take of a far tree, and views from above are baked only if a reference from above needs them.
