# The toolbox

Read before any pass or round on a Genshin screen or scene, and whenever its loop stalls: which tool answers each unknown, grouped by the pass it belongs to. This is the parity domain's toolbox page in the `recreation-tooling` skill's sense: an unknown with no row is a gap, and a stalled loop on it means building its tool, with its test, by that skill's protocol before another round. A tool that ships adds or moves its row in the same commit, and the tool it supersedes is deleted.

## The interface

| Unknown                       | Tool                                                                                                                      |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| A piece's place and anchoring | `genshin:assets interface`, then `fit`'s rects by path                                                                    |
| A piece's motion              | `genshin:assets clips`: the decoded clip curves                                                                           |
| A mark's shape                | `trace`, or the vector on Commons                                                                                         |
| A colour, a size, a place     | `measure`, `zoom`, `polar`                                                                                                |
| A timing                      | `frames`, `luma`                                                                                                          |
| Whether the piece matches     | `compare` over the reference's clean plate (`isBackdrop`)                                                                 |
| The game's words              | `genshin:text decode`, the install's text maps                                                                            |
| A recording's own blur        | `getCaptureSoftness`: its Gaussian sigma off the frame's interface edges, applied to our shot by `compare` (see Softness) |
| A published video's section   | `genshin:parity clip <url> --from <s> --to <s>`: the section at 1080p into `captures`, its path printed                   |
| A frame of a capture          | `genshin:parity frame <capture> --at <s>`: one PNG into `references/<name>/`, beside a `SOURCE.txt` naming it             |

## Softness

A recording softens what it shows: its compression and scaling blur every edge, where the game draws its text and borders crisp. So a component is drawn crisp, as the game draws it, and the softness is put on our shot in the comparison. `getCaptureSoftness` measures a capture's blur once per file, as the Gaussian sigma of its sharpest interface edges (`measureFrameSoftness`, the 10% to 90% spread of each edge over its own rise, `estimateEdgeSigma`), caches it beside the references under the file's hash, and `compare` blurs our screenshot by that sigma before scoring. Every reference taken from a recording gets its capture's sigma; a still shot in the game gets none, since nothing softened it.

It lives in the comparison and not the component because a component blurred to match one recording is wrong for the game, and a blur on the text is still a blur on the reader's screen. A component that is softened to score well has been fitted to the video's compression rather than to the game.

## A scene, pass by pass

### Every pass

What each pass's tools stand on, and the runner that checks them in order.

| Unknown                                                   | Tool                                                                                                                                                                                                                                                                                                                                                                   |
| :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A render that settles in one frame                        | the witness: SMAA, its clock held, one frame                                                                                                                                                                                                                                                                                                                           |
| Which layer a score's loss is in                          | `scoreLayers`: every `compare` of a scene, each family's colour, tone and FLIP against the reference in the report's layers table; `compare --witness` over the exports                                                                                                                                                                                                |
| A scene's frame stalls, and how many programs it compiles | `genshin:parity stalls <screen> [--size WxH] [--scale n] [--trace]`: the cold orbit, a second orbit and a 20 s walk, with worst frame, frames over 50 and 250 ms, and programs before and after; `--trace` names each slow frame by its WebGPU calls, its CPU samples and, where the adapter has timestamp queries, the GPU's time on each pass and how long it queued |
| A scene's frame cost, and what it is                      | `genshin:parity bench`: frame time, draw calls, objects by kind                                                                                                                                                                                                                                                                                                        |
| One region across frames, or ours                         | `zoom --with`: the region of each image stacked                                                                                                                                                                                                                                                                                                                        |
| A point read off an image                                 | `zoom --grid`: lines every so many pixels, labelled                                                                                                                                                                                                                                                                                                                    |
| Which pass is red, and its measure                        | `genshin:parity passes`: each pass's measure against its gate in order, `ParityPasses.snapshot.md`                                                                                                                                                                                                                                                                     |
| Every reference's score in one run                        | `compare --all`: a missing input prints `not measured`, a throw prints `failed`, and the run goes on keeping both rows; a named `compare` still fails                                                                                                                                                                                                                  |

### Inventory

| Unknown                                      | Tool                                                                                                        |
| :------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| Which assets a scene draws                   | `extract`: the closure of its roots by file, path ID                                                        |
| The scene's hierarchy, and what it lost      | `genshin:assets tree`: flags anchors, lost fathers                                                          |
| A script's, a camera's or a light's settings | `behaviours`: raw bytes scanned for shapes, built-ins past their header                                     |
| A setting by the time of day at each hour    | `behaviours --at`: each curve and gradient read at the times given (the login's hours as shares of a day)   |
| Which object a clip's `(the animator)` moves | `behaviours`: each animator printed on its game object                                                      |
| What a script spawns, and where              | `behaviours`, set as `spawns` at their anchors                                                              |
| What a shader computes                       | `shaders`: the annotated disassembly, and HLSL where it decompiles                                          |
| Where the open world places an object        | `parseStreamingPlacements` over its tile's or area's StreamGen blob                                         |
| A placement's prefab                         | its 64-bit path hash looked up in the game's asset index, past 2.6 hashed from its folder's candidate paths |
| Whether every renderer is accounted for      | `passes`' inventory: the fixture's families, stand-ins and undrawn parts                                    |

### Layout

| Unknown                                | Tool                                                                                                                                                                               |
| :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A spawned prefab's place and scale     | `composeWorldMatrices`, through the anchor                                                                                                                                         |
| A row a script scrolls                 | the spawn's `copies`, laid out by `copySpawns` for the witness                                                                                                                     |
| A scrolled row's phase on a reference  | `genshin:parity scroll`: the rows moved along the glide, priced on edges; then `heldScrolled`                                                                                      |
| A camera on far landmarks              | `pose` with landmarks that pick an instance                                                                                                                                        |
| Where each part lands on the reference | `genshin:parity overlay`: boundaries, edge distance                                                                                                                                |
| Whether a stand-in blocks a path       | `genshin:assets clearance`, held by the hulls' test                                                                                                                                |
| A tile's ground                        | `parseTerrainHeights` over its TerrainData                                                                                                                                         |
| Our ground drawn as the game's         | `fitGaussianHills`: hills fitted to the tiles round the origin, error printed                                                                                                      |
| Our families against the exports'      | `passes`' layout: each family's furthest part in metres, the cross-ratios                                                                                                          |
| A row shifted at run time              | `passes`' layout: each witness family's offset past what the exports explain                                                                                                       |
| Our transforms in projected pixels     | `passes`' layout: each fitted part and its nearest export carried as the scene carries their family, projected at each current build's reference, the furthest apart in its pixels |

### Camera

| Unknown                            | Tool                                                                                                                                        |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| The camera's pose                  | `genshin:parity pose`: landmarks, refined on edges                                                                                          |
| The camera's path over a flight    | `genshin:parity track`: the pose at each frame, `--top-row` clear                                                                           |
| Whether our camera is the game's   | `passes`' camera: landmarks from the scene's own camera, solved along the glide alone, each held to its reference's pose bar (`getPoseBar`) |
| The play camera's limits and radii | `genshin:assets camera`: the camera profile's global config, each word named by the 2022 dummy scripts, before any solve off a recording    |

### Shape and surface

| Unknown                                                            | Tool                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| How far a stand-in falls short                                     | `rank`'s second table: FLIP and similarity against the exports                                                                                                                                                                                                                                                                                                                                                                  |
| Depth, normal, albedo, part per pixel                              | `genshin:parity gbuffer`                                                                                                                                                                                                                                                                                                                                                                                                        |
| A family's surface laid out in metres                              | `genshin:parity plan`: its unlit albedo from straight above                                                                                                                                                                                                                                                                                                                                                                     |
| How a surface reads far off                                        | `genshin:parity plan` at a lower `--resolution`: the same albedo through its textures' coarse levels, as a camera that far off and facing it samples them; a grazing view reads finer, the witness sampling anisotropically                                                                                                                                                                                                     |
| A stand-in seen where no reference is                              | `genshin:parity view`: any camera, ours beside the exports                                                                                                                                                                                                                                                                                                                                                                      |
| Which term next, inside a pass                                     | `genshin:parity rank`: every term's ceiling, largest first, ordering that pass's items                                                                                                                                                                                                                                                                                                                                          |
| A landmark's shape as its export's meshes, piece by piece          | `genshin:assets fit windrise --only statue`: each piece its triangles join into an upright stack or blades along their own lengths, whichever lies nearer its surface, each stack vertex coloured by its piece's texture where it stands                                                                                                                                                                                        |
| A tree's canopy, trunk and roots as its export's leaves and bark   | `genshin:assets fit windrise --only oak`: the leaf's card centres clustered, the bark's radius at each trunk station, its roots traced into the centrelines and radii their tubes are swept along (`traceRootCentrelines`)                                                                                                                                                                                                      |
| Ours against the exports, channel by channel                       | `passes`' shape: our parts drawn into the witness's targets, outline, depth and normal per family                                                                                                                                                                                                                                                                                                                               |
| Where on the frame a shape misses                                  | `passes`' shape image, `shapes/<reference>.png`: the normals' angle green to red, outlines apart white and blue                                                                                                                                                                                                                                                                                                                 |
| How far a family's own normal maps bend its normals                | `passes`' shape notes: the exports' normal against the normal their geometry carries (`geometryNormal`), on average and over two halves of blocks, the least a stand-in drawn without the maps reads                                                                                                                                                                                                                            |
| Which parts a family's normals miss on                             | `passes`' shape notes: a family over its normal gate, its exported parts carrying most of the angle, each its share, mean and pixels                                                                                                                                                                                                                                                                                            |
| Our unlit colour against the exports'                              | `passes`' surface: the same targets' albedo where both draw a family, its mean colour apart and its structure                                                                                                                                                                                                                                                                                                                   |
| Where on the frame a surface misses                                | `passes`' surface image, `surfaces/<reference>.png`: the lightness apart where both draw a family, red where ours is lighter and blue where darker                                                                                                                                                                                                                                                                              |
| A surface's structure, in distribution                             | `passes`' surface: each family's luminance variance and octave-band detail energies over its pixels, ours against the exports' as a root mean square relative error (`computeSurfaceStatistics` on the parity page's GPU, combined by `computeStructureError`), gated at the exports' own two block halves. Matched in distribution because the exports' textures are never shipped, so a pixel-aligned structure cannot be met |
| Which scale a surface's structure is lost at                       | `passes`' surface notes, marked pixel-aligned and diagnostic: each family's structure scale by scale, finest first, beside its exports' own a pixel across. Not gated, since no shipped texture can match the exports' pixels                                                                                                                                                                                                   |
| Where on the frame a structure is lost                             | `passes`' structure image, `surfaces/<reference>-structure.png`: each scale's similarity term per pixel, finest first, red as it is lost                                                                                                                                                                                                                                                                                        |
| Which feature of a plan a structure is lost on                     | `genshin:parity lost`: the surface pass's loss carried onto the family's plan, each band's share of it against its share of the pixels                                                                                                                                                                                                                                                                                          |
| A surface's paint from its texture                                 | `fitPlanTones`: its texture's colours past their speckle as k-means tones in CIELab, traced as loops over a plan                                                                                                                                                                                                                                                                                                                |
| The plants the streams place round the oak, by their prefab's name | `genshin:assets fit windrise --only plants`: each plant prefab named by `checkIsPlantName` and its places within the ground's radius, as the `windrise/plants` record                                                                                                                                                                                                                                                           |
| A family's colour and palette from its export's textures           | `fitSurfaceColours` (`genshin:assets fit windrise --only surfaces`): each face read through its submesh's diffuse texture at points spread over its UV triangle, weighted by world area and alpha coverage; each mesh of the family is also a part with its own colour and palette                                                                                                                                              |
| Where a ground's layers lie, and each layer's colour               | `fitGroundLayerField` and `computeGroundLayerColours` (`genshin:assets fit windrise --only surfaces`): every base-map texel classed to its nearest palette tone in Lab, each layer's shares splatted onto a grid as `windrise/ground-layers` and each layer's colour its class's mean in `windrise/surfaces`; never a slope rule, which the game's layers do not follow                                                         |

### Motion

| Unknown                                | Tool                                                                                                                           |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| A skinned part's pieces and their path | `fitRigidPieces`: the mesh's JSON skin, each bone posed through its clip                                                       |
| A world's pace past a still camera     | `genshin:parity glide`: a layout's edges crossing one row's columns, each timed against its own a repeat later, any pose       |
| Our scene's motion at exact moments    | `genshin:parity film`: a faked clock, stages set at moments                                                                    |
| A part's track against its clip        | `passes`' motion: our pieces read frame by frame on the faked clock, each frame's moment refined along the clip, path and pace |

### Display

| Unknown                                          | Tool                                                                                                                                                                                   |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The transform's form                             | exact: the bloom's and the uber pass's programs, read with their constant layouts (the login's `Display.reference.ts`)                                                                 |
| The tone curve's contrast                        | `passes`' display: each pixel's light, back through the curve over its albedo, flattest on a sun and a sky's plane                                                                     |
| The bloom's fields                               | gap: which MHYBloom value is the threshold, the scaler and the intensity, measured where the bloom alone moves                                                                         |
| How much of a frame lies under the curve's black | `genshin:parity black`: each reference's share of pixels with a channel under the curve's black at none, each channel's apart; `compare` prints ours beside it                         |
| The night's black                                | `genshin:parity balance`: `_WhiteBalanceMat`'s temperature and tint where the stone's light lies flattest, no export holding it; `calibrate` solves the stone's light under the page's |

### Light

| Unknown                                 | Tool                                                                                                                                                                         |
| :-------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The stone's light at an hour            | `genshin:parity calibrate`: ramp, sky and height fade, none below none, by NNLS                                                                                              |
| Whether the stone's light holds         | `passes --pass Light`: each bin's shown colour against the light's, in ΔE, gated at our own render under it                                                                  |
| Our glow against the game's frame       | `passes --pass Light`: each family's pixels the exports' glow lies on, as `apps/web/content/docs/genshin/parity.md` gives its gates                                          |
| Whether a light solve models the render | `calibrate --self`: our render solved, its light handed back                                                                                                                 |
| Whether a height's error is light, haze | `rank`'s height bands by depth: one ratio a light, a growing one haze                                                                                                        |
| Where a light's error lies on the frame | `rank`'s light map: the exports' light over the reference's, smoothed                                                                                                        |
| The sun's direction                     | `genshin:parity shadows`: the exports' shadows cast from each direction tried against the reference's edges over flat receivers; `passes --pass Light` reads the scene's own |

### Atmosphere

| Unknown                                 | Tool                                                                                                          |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| How the haze thins with height, an hour | `calibrate --haze`: an hour's references at once, under a light free per part, read as the display encodes it |
| The fog's density and colours           | `genshin:parity fog`: bins by depth and sun angle, solved                                                     |
| The sky's colours and its shape         | `genshin:parity sky`: least squares over an hour's references' clear sky, none negative, by the curve's slope |
| Whether the scene draws the sky solved  | `sky`'s drawn line: ours with no cloud against the reference's clear                                          |
| The clouds' lit and shaded colours      | `genshin:parity layer` with `lit` and `shade` solved, on the pass's statistics                                |
| How much of each cloud band an hour has | `genshin:parity cover`: each band's share on the cover by height                                              |
| The heights each cloud band stands at   | `cover --heights`: every hour's references at once, shares by turns                                           |
| Whether the sky holds, and what is off  | `passes --pass Atmosphere`: the sky's statistics at the camera, held within its halves' spread                |
| The cloud layer's settings              | `genshin:parity layer`: the game's textures or ours (`--ours`), settings by simplex on the pass's statistics  |
| Textures of ours for the game's         | `fitSpectralNoiseChannel`: spectrum and quantiles, drawn back by `synthesizeSpectralNoise`                    |

### Acceptance

| Unknown             | Tool                                   |
| :------------------ | :------------------------------------- |
| One approval number | FLIP (`scoreFlip`), in every `compare` |

## Audio

### Music

| Unknown                                              | Tool                                                                                                                      |
| :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| Which music sound a recording plays                  | `genshin:assets music`: pitch classes matched window by window                                                            |
| What plays a piece, and when                         | `genshin:assets playlist`: its segments in order, its sources decoded                                                     |
| A piece's notes                                      | `readMusicSourceNotes`: pitch-transcription over a decoded source                                                         |
| Which transcribed notes the game's sound holds       | `genshin:parity notes`: each note's fundamental against our render with it silenced, a sixth at a time, and written       |
| Each voice's instrument and tuning                   | `fitInstrument`: measured at its clear notes, in the fit's report                                                         |
| Each voice's noise                                   | `fitVoiceNoises`: each noise-like band, solved over every frame                                                           |
| Which recorded instrument and level plays each voice | `genshin:parity instruments`: pitch-keeping candidates layered over the synthesizer, each mix scored under its expression |
| Whether a recorded instrument keeps a voice's pitch  | `genshin:parity solos`: each instrument alone against the notes' own pitch classes, beside pure tones, with its best lag  |
| What a band of the game's music holds                | `genshin:parity bands`: share, flatness, attack weight, on partials                                                       |
| Whether our noise plays what it ships                | `genshin:parity noise`: the solve read back from our render and the game's                                                |
| How close our music sounds                           | `genshin:parity listen`: pitch agreement, each band's gap and its sign                                                    |
| Each segment's swells and fades                      | `genshin:parity expression`: one gain a window over every band, refitted against our render and written                   |
| Whether ours rings longer than the game's            | `genshin:parity decay`: each band's signed gap by the time since the last note began                                      |
| Whether ours strikes notes the game holds            | `genshin:parity attacks`: each band's share of frames that jump, ours against the game's                                  |

### Sound effects

| Unknown                                       | Tool                                                                                                                                                                     |
| :-------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which game sounds a recording plays, and when | `genshin:assets sounds`: every sound scored by its bands' levels, the best set of each size with its residual                                                            |
| A sound effect's levels over time             | `fitSoundEffect`: three noises a band every 25 ms, from the matched sounds' mix in both channels                                                                         |
| How near our sound effect plays the game's    | `passes --pass Audio`: both channels every 5 ms in the effect's bands against the game's, gated at a second take of our own noise; each band's bias, the channels' width |
