# Spawned places

The game's servers spawn chests, Oculi, puzzles and camps, and the client's data does not place them, so the official Teyvat Interactive Map's public points stand in for them (see Open). This page is the built part of the [spawned places](../../../changes/genshin-spawned-places/design.md) proposal: the map's points read into the references folder, its statues and waypoints fitted onto the scene's transport points, and the Oculi published for the [statues of The Seven](../statues-of-the-seven/design.md) page to read (`scripts/src/services/genshinAssets/points/readInteractiveMap.ts`, `scripts/src/services/genshinAssets/oculi/buildOculusPlaces.ts`). The [chests](../chests/design.md), [puzzles](../puzzles/README.md) and [gathering](../gathering/design.md) pages publish their own kinds from the same points.

## How it works

```mermaid
flowchart TD
  API["The official map's API: label tree and point list"] -->|"genshin:assets points"| REF["Interactive map references, outside the repository"]
  REF --> ANCHORS["Statues and waypoints on the ground, in the map's own coordinates"]
  SCENE["The scene's transport points, read from the dump"] --> MATCH
  ANCHORS --> MATCH["One similarity matched from every start, then refined"]
  MATCH --> GATE{"Residual within the bar?"}
  GATE -->|"no"| STOP["An error, and nothing written"]
  GATE -->|"yes"| FILE["fit.json: the transform, the residual and each region's share"]
  FILE --> REPORT["The report: matches, residual and Oculi by region"]
  FILE --> SLICES["One Oculi slice per region, published to the oculi dataset"]
```

The stages are `scripts/src/services/genshinAssets/fit/fitInteractiveMap.ts`, `scripts/src/services/genshinAssets/points/matchSimilarity.ts` and `scripts/src/services/genshinAssets/oculi/buildOculusPlaces.ts`, and the commands are registered as `points`, `points-fit` and `oculi` in `scripts/src/services/genshinAssets/commands/genshinAssetsCommand.ts`.

## The read

`pnpm -C scripts genshin:assets points` fetches the map's label tree and its point list from the map's public API, and writes both as the API gives them to `interactive-map/` under the references folder, where every other reference is kept (`scripts/src/services/genshinAssets/points/constants.ts`, `~/Esposter.noindex/genshin-parity/references/interactive-map/label-tree.json`, `~/Esposter.noindex/genshin-parity/references/interactive-map/points.json`). It also reads each Viewpoint point's info, a few points a request, into `viewpoints.json` there, whose text the [scene group record](../scene-groups/design.md) places the viewpoints by (`~/Esposter.noindex/genshin-parity/references/interactive-map/viewpoints.json`). Each point carries its label, its place in the map's own coordinates, its area and its layer, the layer being zero for the ground and above (`~/Esposter.noindex/genshin-parity/references/interactive-map/points.json`, `z_level`). The point list runs to tens of megabytes, and nothing from it is committed (`scripts/src/services/genshinAssets/points/constants.ts`).

## The fit

`pnpm -C scripts genshin:assets points-fit` fits one similarity to the whole map.

- **The anchors are the statues and waypoints on the ground.** These are the map's labels for the Statue of The Seven and the Teleport Waypoint at layer zero. Its underground points are kept for their own floors and left out of the fit (`scripts/src/services/genshinAssets/points/constants.ts`).
- **The scene side is the scene's transport points.** The dump files a statue and a waypoint as one kind of point, which `readSceneTransportPoints` reads by the kind Windrise's statue holds. The fit reads them from the scene directly, so it does not depend on the region data that [exploring](../exploring/design.md) fits (`scripts/src/services/genshinAssets/world/readSceneTransportPoints.ts`).
- **The match starts from every turn.** A start is taken at each of sixteen turns, each both as drawn and mirrored, at a scale of one, which is the map's own unit, carrying each set's median point onto the other's. The medians are not pulled by the far-off points one set holds and the other does not. Each start is refined over sixty passes. A pass pairs every carried point with its nearest scene point, one to one, within three residuals of the last fit and never closer than the bar, then solves the least-squares similarity on those pairs. The start that matches the most pairs wins, and the smaller residual breaks a tie (`scripts/src/services/genshinAssets/points/constants.ts`, `scripts/src/services/genshinAssets/points/matchSimilarity.ts`).
- **The bar is twenty game units.** A fit whose residual is over it is an error that names the residual, and writes nothing. A clean match sits well under the bar, so a fit near it has matched the wrong points (`scripts/src/services/genshinAssets/points/constants.ts`, `scripts/src/services/genshinAssets/fit/fitInteractiveMap.ts`).

The solved turn is a quarter turn mirrored (a turn of minus ninety degrees, the map's down running against the game's z axis), and the scale comes out within a few hundredths of one: the map's coordinate is one game unit (`~/Esposter.noindex/genshin-parity/references/interactive-map/fit.json`, `transform`: `mirrored` true, `turn` -1.5708 radians, `scale` 1.00017, residual 9.88).

## The checks

Each region is reported in turn, Mondstadt first, with its matched points, the residual of those, and its Oculi counted by its kind's label against the wiki's count. A shortfall or a surplus is printed as it stands (`~/Esposter.noindex/genshin-parity/references/interactive-map/fit.json`, `scripts/src/services/genshinAssets/points/InteractiveMapRegionMap.ts`).

- **Mondstadt** matches about fifty of its statues and waypoints, and its Anemoculi count is the wiki's sixty-six (`~/Esposter.noindex/genshin-parity/references/interactive-map/fit.json`: `matched` 51, `oculusCount` 66; the wiki's 66, see Sources).
- **Liyue, Inazuma, Sumeru and Snezhnaya's Oculi** count as the wiki gives them, Snezhnaya with no point matched (`~/Esposter.noindex/genshin-parity/references/interactive-map/fit.json`: 131, 181, 271 and 140, each equal to its wiki count; Snezhnaya `matched` 0).
- **Fontaine, Natlan and Nod-Krai** count shortfalls against the wiki's figure of 271 for each (`~/Esposter.noindex/genshin-parity/references/interactive-map/fit.json`: 225, 249 and 197). The wiki gives that same figure for each of those three elements (see Sources), so the three shortfalls stand against the wiki's own count.
- **Snezhnaya** matches none of its points. The dump holds no transport points for its areas yet, as [region capitals](../region-buildings/design.md) records, so its residual is reported as none (`~/Esposter.noindex/genshin-parity/references/interactive-map/fit.json`, no `residual` key for snezhnaya; see Open).

## The Oculi

`pnpm -C scripts genshin:assets oculi` publishes each Oculus the official map marks on the ground into its region's slice, as a compact list of places, each with its id (the map's point id), its kind and its position in the game's coordinates. Its kind is the map's own label, one of eight, named as the map labels them: Anemoculus, Geoculus, Electroculus, Dendroculus, Hydroculus, Pyroculus, Lunoculus and Cryoculus (`scripts/src/services/genshinAssets/oculi/OculusKindLabelIdMap.ts`). Each region's area and kind are set in the region map, which the fit's report reads too (`scripts/src/services/genshinAssets/points/InteractiveMapRegionMap.ts`), and the writer keeps only its points on the ground (below) (`scripts/src/services/genshinAssets/oculi/buildOculusPlaces.ts`).

- **Ground only.** Oculi on a layer under the ground stand on floors of their own, which the place does not yet know, so they are counted and left out. Fontaine holds the only ones, which is why its ground count sits below the fit's count of its Oculi (see Open).
- **Not landmarks.** A place is acted on by the statues' rules, so it lives in its own model rather than in `LandmarkKind`, and no kit draws it (`packages/genshin-world/src/models/oculus/OculusPlace.ts`, `packages/genshin-world/src/services/statue/readOculusPlaces.ts`, see Open).
- **No height is published.** An Oculus stands on the ground at its point, its height read where it is stood on, as the [chests](../chests/design.md) page sets out (`packages/genshin-world/src/models/oculus/OculusPlace.ts`).
- **Oculi against the wiki's 271 each.** The official map gives Fontaine 225, Natlan 249 and Nod-Krai 197; the report keeps those shortfalls rather than filling them, and a count in game settles whether the map or the wiki is short (`~/Esposter.noindex/genshin-parity/references/interactive-map/fit.json`).

## Key files

| File                                                                   | Role                                                                       |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/points/readInteractiveMap.ts`      | Fetches the map's label tree, point list and Viewpoint infos as references |
| `scripts/src/services/genshinAssets/fit/fitInteractiveMap.ts`          | Fits the map to the scene, gates the fit on its bar and writes the report  |
| `scripts/src/services/genshinAssets/points/matchSimilarity.ts`         | Matches one similarity from every start and refines each                   |
| `scripts/src/services/genshinAssets/points/solveSimilarity.ts`         | Solves the least-squares similarity over a set of pairs                    |
| `scripts/src/services/genshinAssets/world/readSceneTransportPoints.ts` | Reads the scene's transport points, shared with the region capitals' fit   |
| `scripts/src/services/genshinAssets/points/InteractiveMapRegionMap.ts` | Each region's map area and Oculus kind, with the wiki's count              |
| `scripts/src/services/genshinAssets/oculi/buildOculusPlaces.ts`        | Builds each region's Oculi slice from the points and the fit               |
| `scripts/src/services/genshinAssets/oculi/OculusKindLabelIdMap.ts`     | Each Oculus kind's label on the official map                               |
| `packages/genshin-world/src/models/oculus/OculusPlace.ts`              | A placed Oculus: its id, kind and ground position                          |
| `scripts/src/services/genshinAssets/points/constants.ts`               | The API, the references paths, the bar and the match's passes              |

## Sources

- [Teyvat Interactive Map](https://act.hoyolab.com/ys/app/interactive-map/index.html), HoYoLAB: the official map. Its label tree and point list are the public data the read keeps as references (`~/Esposter.noindex/genshin-parity/references/interactive-map/label-tree.json`, `~/Esposter.noindex/genshin-parity/references/interactive-map/points.json`).
- [Oculus](https://genshin-impact.fandom.com/wiki/Oculus), Genshin Impact Wiki: each region's Oculi, and the counts the checks hold the map to, such as "66 Anemoculi can be found in Mondstadt." and "271 Hydroculi can be found in Fontaine & Sea of Bygone Eras."

## Open

- [ ] **The game's servers spawn chests, Oculi, puzzles and camps, and the client's data does not place them** — no source yet: no check of the dump for chest, Oculus, puzzle or camp placements was run here.
- [ ] **Snezhnaya's transport points are absent from the dump** — no source yet: the dump's transport points for Snezhnaya's areas were not counted, and `~/Esposter.noindex/genshin-parity/references/interactive-map/fit.json` shows only its zero matches.
- [ ] **Fontaine holds the only underground Oculi** — no source yet: no count of Oculi on layers under the ground was made, so the ground count's gap is not traced to them.
- [ ] **No kit draws an Oculus** — no source yet: `packages/genshin-world/src/models/oculus/OculusPlace.ts` is read by `packages/genshin-world/src/services/statue/readOculusPlaces.ts`, the minimap and the HUD, and no kit was checked for a draw of it.
