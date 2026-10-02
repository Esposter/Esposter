# The toolbox

Read before any pass on a Genshin screen or scene, and whenever its loop stalls: which tool answers each unknown. This is the parity domain's toolbox page in the `recreation-tooling` skill's sense: an unknown with no row is a gap, and a stalled loop on it means building its tool, with its test, by that skill's protocol before another pass. A tool that ships adds or moves its row in the same commit, and the tool it supersedes is deleted.

## The interface

| Unknown                       | Tool                                                    |
| :---------------------------- | :------------------------------------------------------ |
| A piece's place and anchoring | `genshin:assets interface`: the RectTransform tree      |
| A piece's motion              | `genshin:assets clips`: the decoded clip curves         |
| A mark's shape                | `trace`, or the vector on Commons                       |
| A colour, a size, a place     | `measure`, `zoom`, `polar`                              |
| A timing                      | `frames`, `luma`                                        |
| Whether the piece matches     | `compare` over the reference's own frame (`isBackdrop`) |

## A scene

| Unknown                                 | Tool                                                                 |
| :-------------------------------------- | :------------------------------------------------------------------- |
| Which assets a scene draws              | `extract`: the closure of its roots by file, path ID                 |
| The scene's hierarchy, and what it lost | `genshin:assets tree`: flags anchors, lost fathers                   |
| A script's settings                     | `behaviours`: raw bytes scanned for shapes                           |
| What a script spawns, and where         | `behaviours`, set as `spawns` at their anchors                       |
| A spawned prefab's place and scale      | `composeWorldMatrices`, through the anchor                           |
| A row a script scrolls                  | the spawn's `copies`, laid out by `copySpawns` for the witness       |
| Whether the arrangement is right        | `genshin:assets arrangement`: cross-ratios, drift                    |
| The camera's pose                       | `genshin:parity pose`: landmarks, refined on edges                   |
| The camera's path over a flight         | `genshin:parity track`: the pose at each frame, `--top-row` clear    |
| A world's pace past a still camera      | `genshin:parity glide`: the ground resampled into metres, per frame  |
| Our scene's motion at exact moments     | `genshin:parity film`: a faked clock, stages set at moments          |
| A scene's frame cost, and what it is    | `genshin:parity bench`: frame time, draw calls, objects by kind      |
| A scrolled row's phase on a reference   | `view` held (`heldScrolled`) along the loop, `parts`, then `compare` |
| A row or a camera on far landmarks      | `place --landmarks`, and `pose` with landmarks that pick an instance |
| Where a row of parts stands, held cam   | `genshin:parity place`: one offset refined on edges both ways        |
| A point read off an image               | `zoom --grid`: lines every so many pixels, labelled                  |
| Whether a stand-in blocks a path        | `genshin:assets clearance`, held by the hulls' test                  |
| A stand-in seen where no reference is   | `genshin:parity view`: any camera, ours beside the exports           |
| One region across frames, or ours       | `zoom --with`: the region of each image stacked                      |
| A render that settles in one frame      | the witness: SMAA, its clock held, one frame                         |
| Which term to work on next              | `genshin:parity rank`: every term's ceiling, largest first           |
| How far a stand-in falls short          | `rank`'s second table: FLIP and similarity against the exports       |
| Depth, normal, albedo, part per pixel   | `genshin:parity gbuffer`                                             |
| A family's surface laid out in metres   | `genshin:parity plan`: its unlit albedo from straight above          |
| Where each part lands on the reference  | `genshin:parity overlay`: boundaries, edge distance                  |
| Which layer a score's loss is in        | `scoreLayers`: `compare --witness`, `attribute`                      |
| One approval number                     | FLIP (`scoreFlip`), in every `compare`                               |
| Sun against ambient light               | `genshin:parity light`: up and shaded faces under each light alone   |
| The clouds' lit and shaded colours      | `genshin:parity clouds`: ours and theirs matched by colour spread    |
| Fog against distance                    | `genshin:parity haze`: depth bands, ours with and without fog        |
| The fog's density and colours           | `genshin:parity fog`: bins by depth and sun angle, solved            |
| A light's strength under its references | `genshin:parity exposure`: the parts' luminance, ours against theirs |
| The grade, the fog, the light           | `genshin:parity calibrate`: least squares over masks                 |
| What a shader computes                  | `shaders`: the annotated disassembly, and HLSL where it decompiles   |
| Each stand-in's cost                    | `attribute`: FLIP loss per layer                                     |
