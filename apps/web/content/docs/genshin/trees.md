---
title: Trees
description: Genshin's trees as species, each one set of the tree kit's parameters a placed tree names, and each drawn as its mesh near the eye and as an impostor far from it. A tree's wood is its trunk, its limbs and its surface roots, each swept as a tube along a spline traced off its export's own bark. The impostor is baked once from the tree's own mesh, its colour and its normal, and drawn on one card turned about the trunk to face the eye and toon-lit through the hour; the two cross over by a dither across a band some ten of the tree's heights out.
---

# Trees

A forest of the game's is a handful of species placed many times, so a tree here is a species, one set of the [tree kit's](/docs/genshin/vegetation) parameters, and a placed tree names its species rather than carrying parameters of its own. Near the eye a tree is its mesh, wood and leaf cards; far from it, where its cards would cost the same and show a few pixels, it is an impostor: one card carrying a picture of the mesh baked from its side.

## How it works

```mermaid
flowchart TD
  LM["A placed tree: its species, place and turn"] --> SP["The species' parameters"]
  SP --> MESH["The tree kit's mesh: trunk, limbs, surface roots and leaf cards"]
  MESH -->|first frame the renderer draws| BAKE["Baked from its side: colour, and normal, each unlit"]
  BAKE --> CARD["One card, turned about the trunk to face the eye"]
  EYE["The eye's distance from the tree"] --> FADE{"Past ten of its heights?"}
  FADE -->|near| M["The mesh draws"]
  FADE -->|across the band| D["Dither: the card draws the pixels the mesh does not"]
  FADE -->|far| I["The card draws, lit by its baked normal"]
  CARD --> I
  MESH --> M
```

- **A species is a set of parameters.** `TreeSpecies` names each species and `createTreeSpeciesOptionsMap` builds its parameters, once as Windrise opens, so a species placed a thousand times is fitted once. A tree landmark names its species in its region's data. Windrise's great oak is the first: its leaf clusters, the leaf each holds, its leaves' normal field, its trunk and limbs and its surface roots are read off the game's own export into the `windrise/oak` record, which the world's screen reads from the [hosted game data](/docs/genshin/hosted-game-data) before it opens. Its bark and leaves are coloured by their parts of the `windrise/surfaces` record, which the impostor is baked in too.
- **The wood is swept tubes.** A tube is the points its centreline runs through, each with its radius there: the trunk's from its foot, and a limb's or a surface root's from where it leaves the trunk or the limb or root it grows from, each to its tip. The kit runs a centripetal Catmull-Rom spline through them, which neither loops nor cusps where the points are spaced unevenly, cuts it into sections well under a metre long, and sweeps a ring along it, the radius running straight from point to point and each ring turned by parallel transport so the tube never twists (`computeTreeTubes`). A tube's rings have as many sides as keep each side about a metre round its widest, a few for a root and dozens for a trunk metres wide, so every tube is as round in outline as the next. The trunk, the limbs and the roots are one geometry, drawn in the bark's shared material in one draw and baked into the impostor together. A tube's start is left open, since it stands on the ground or inside what it grows from, and a point of no radius closes its tip.
- **The impostor is baked from the tree's own mesh.** On the first frame the renderer can draw, an orthographic camera standing off the trunk's axis renders the wood and the leaf cards twice into small targets (`bakeImpostor`): once in each part's own colour, unlit, and once in its normal as the camera sees it, the leaf cards cut to their shape as the crown's are. The target frames the mesh from its axis out to its widest on either side and from its foot to its crown.
- **The card turns about the trunk.** The impostor is one quad of that width and height, turned in the vertex stage about its upright axis to face the eye (`createImpostorMaterial`), so a tree stays standing however the eye looks at it, from the ground or from above. In a shadow pass it turns to the light instead, so it casts the shape the sun sees.
- **It is lit as the mesh is.** The card takes the baked colour, darkened when wet as every surface is, and the baked normal turned with the card as its own, through the toon ramp, so its crown shades as the mesh's does through the hour rather than a picture lit at bake time. It draws no outline, as the ground draws none.
- **The two cross over by a dither.** A tree hands its mesh to its impostor some ten of its own heights from the eye (`IMPOSTOR_SWITCH_HEIGHTS`), so a larger tree keeps its mesh further, across a band a tenth of that distance wide. Across the band a fixed noise over the screen picks which pixels each draws (`createDitherFadeNode`): the impostor's share is how far it has faded in and the mesh draws every pixel the impostor does not, so a pixel is never drawn twice nor left empty. Outside the band only one of the two is drawn at all.

A tree's surface roots reach the kit from its export's bark through the fit, and the kit sweeps them as it builds the wood:

```mermaid
flowchart TD
  BARK["The export's trunk or root submesh"] --> PIECE["Each piece it splits into"]
  PIECE --> START{"Where does the piece start?"}
  START -->|"the trunk, standing lowest"| FOOT["Its foot: its vertices within a step of its lowest"]
  START -->|"a limb or a root"| END["Its widest open loop, where it leaves what it grows from"]
  START -->|"no open loop"| NEAR["Its vertex nearest the axis"]
  FOOT --> HOLES["Every other open loop filled from its centroid as a hole in the bark"]
  END --> HOLES
  NEAR --> HOLES
  HOLES --> CUT["Cut at every step of distance along its edges"]
  CUT --> LOOPS{"How many loops does the cut cross?"}
  LOOPS -->|one| POINT["One point: the loop's centroid and mean radius"]
  LOOPS -->|"two or more"| FORK["The farthest-reaching child keeps the path, each other starts a tube at the fork"]
  FORK --> POINT
  POINT -->|"past the last cut"| TIP["Its farthest vertex, of no radius"]
  TIP --> SIMPLIFY["Points kept within the tolerance"]
  SIMPLIFY --> RECORD["The oak's record"]
  RECORD --> SPLINE["A centripetal Catmull-Rom spline through each tube's points"]
  SPLINE --> TUBE["Rings swept along it, merged into the wood"]
```

## What it costs to run

- **A tree's wood is built once, with its mesh.** Its cost follows its tubes' sections and sides, and the oak's hundred or so tubes make a few tens of thousands of vertices (`computeTreeTubes.bench.md`).
- **One bake a tree, two small renders, once.** The targets are a few hundred texels on their longer side.
- **A far tree is two triangles.** Its card's cost is a few texture reads a pixel; its mesh is not drawn at all past the band.
- **A tree decides its detail from one distance a frame**, on the main thread.

## Key files

| File                                                                       | Role                                                                                                   |
| :------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/models/world/TreeSpecies.ts`                   | The species the game's trees are rebuilt as                                                            |
| `packages/genshin-world/src/services/world/createTreeSpeciesOptionsMap.ts` | Each species' tree kit parameters, the great oak's first                                               |
| `packages/genshin-world/src/models/windrise/WindriseOak.ts`                | The great oak's leaf clusters with the leaf each holds, its normal field, its trunk, limbs and roots   |
| `scripts/src/services/genshinAssets/fit/fitWindriseOak.ts`                 | The fit that clusters the leaf mesh's cards with their kept leaf and traces the bark's two submeshes   |
| `scripts/src/services/genshinAssets/fit/traceTubeCentrelines.ts`           | A mesh of tubes traced from each piece's start into the centrelines and radii it is swept along        |
| `packages/genshin-engine/src/kits/tree/computeTreeTubes.ts`                | The trunk, each limb and each surface root swept as a tube along its spline                            |
| `packages/genshin-engine/src/models/kits/tree/TreeTube.ts`                 | A tube of the wood as the points its spline runs through, each with its radius                         |
| `packages/genshin-world/src/components/World/Landmark/Tree/Index.vue`      | A placed tree: its mesh, its impostor, and the cross-over between                                      |
| `packages/genshin-world/src/components/World/Plants/Index.vue`             | Windrise's placed plants, one instanced draw per prefab: the oak's impostor for trees, domes otherwise |
| `packages/genshin-world/src/services/world/bakeTreeImpostor.ts`            | The impostor baked from a tree's bark and leaf meshes, shared by a placed tree and a plant             |
| `packages/genshin-engine/src/vegetation/bakeImpostor.ts`                   | A mesh's colour and normal baked from its side                                                         |
| `packages/genshin-engine/src/nodes/createImpostorMaterial.ts`              | The card turned to the eye and lit by its baked normal                                                 |
| `packages/genshin-engine/src/nodes/createDitherFadeNode.ts`                | Which pixels each of two cross-fading details draws                                                    |
| `packages/genshin-engine/src/nodes/createLeafShapeNode.ts`                 | A leaf card's cut, shared by the crown and its bake                                                    |
| `packages/genshin-engine/src/vegetation/constants.ts`                      | The impostor's resolution and where it takes over, provisional                                         |

## Notes

- **The great oak's leaf clusters are fitted to its export's leaves.** Each cluster's centre and reach are the k-means of the leaf mesh's card centres, 1280 of them, about five cards a cluster, and each holds the leaf its cards keep, a card's area times the share of its texture the material's cutoff keeps. The kit grows as many cards in a cluster as keep three times that leaf (`leafAreaScale`): our solid pointed ovals draw the crown as opaque as the export's cut cards at about twice its leaf, and the shape pass's envelope reads nearest at three times, so the canopy is the export's layout rather than a species' random one.
- **The great oak's wood is traced off its export's bark.** Its surface roots are the bark mesh's second submesh, the one its second bark material draws: a few dozen closed tubes, each open only where it leaves the trunk or the root it forks from. Its trunk and limbs are the first: the trunk standing on a capped foot, off the oak's axis and leaning, with a few holes in its bark, and a few dozen limbs, each a piece of its own open where it is pushed into the trunk or the limb it grows from. The fit traces each piece by its vertices' distance along its edges from its start (`traceTubeCentrelines`), cuts it at every step of that distance (`OAK_TUBE_LEVEL_STEP`, a fraction of a metre) into the loops the cut crosses it in, takes each loop's centroid and mean radius as a point, closes it on its farthest vertex, and keeps the points within a few centimetres (`OAK_TUBE_TOLERANCE`), its radius weighed as its place is. Where the loops part, the path keeps to the child leading farthest on and each other child starts a tube of its own at the fork. The roots stand at the export's own heights round the oak's foot, so where our ground stands higher than the game's terrain it buries them, which half a metre's lift does not mend ([scene derivation](/docs/genshin/scene-derivation), Decisions). The switch is provisional, read off a recording walking away from one of the game's trees ([trees and scatter](/docs/proposals/genshin/trees-and-scatter)), and the oak's shape is judged by the outline, depth and normal of the shape pass.
- **The trunk starts at its foot and its holes are filled.** A trunk's open loops are holes in its bark rather than its end: traced from them, its cuts would grow round every hole at once and meet in spans across the trunk that no limb has. So the piece standing lowest starts at its foot, every open loop of it is a hole filled by a fan from its centroid, and a limb open at its tip as well as its base starts at its widest loop with the other filled. A root has one open loop, so its trace is unchanged.
- **A junction is the export's own.** The export's limbs are pieces of their own pushed into the trunk, not grown out of it, so a limb's tube starting inside its parent draws a junction the way the game's mesh does, and no fillet is blended over it.
- **The placed plants are one instanced draw per prefab.** Windrise's plants from its streams (the `windrise/plants` record) stand as stand-ins in `World/Plants`: a tree prefab as the oak's impostor, the baked card shared by every place, and any other plant as a low dome of the ground's green. Each prefab is one draw, so 2,200 places cost fifteen draws. The oak's own mesh is left to its landmark. Species for the placed trees, and culling their instances on the GPU, wait for the layout pass's next rows ([trees and scatter](/docs/proposals/genshin/trees-and-scatter)).
- **The impostor is baked from one side.** Seen from straight above, its card stands edge-on and a far tree all but vanishes; one view holds for the near-horizontal views a walk and a glide take of a far tree, and views from above are baked only if a reference from above needs them.
