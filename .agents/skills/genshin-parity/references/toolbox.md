# The toolbox

Read before any pass on a Genshin screen or scene, and whenever its loop stalls: which tool answers each unknown. This is the parity domain's toolbox page in the `recreation-tooling` skill's sense: a row with no tool built is a gap, and a stalled loop on that unknown means building the proposed tool (`apps/web/content/docs/proposals/genshin/scene-toolbox.md`, the section named) before another pass. When a proposed tool ships, its row moves to the built column in the same commit, and the tool it supersedes is deleted.

## The interface

| Unknown                       | Built                                                   |
| :---------------------------- | :------------------------------------------------------ |
| A piece's place and anchoring | `genshin:assets interface`: the RectTransform tree      |
| A piece's motion              | `genshin:assets clips`: the decoded clip curves         |
| A mark's shape                | `trace`, or the vector on Commons                       |
| A colour, a size, a place     | `measure`, `zoom`, `polar`                              |
| A timing                      | `frames`, `luma`                                        |
| Whether the piece matches     | `compare` over the reference's own frame (`isBackdrop`) |

## A scene

| Unknown                                 | Built                                                | Proposed                  |
| :-------------------------------------- | :--------------------------------------------------- | :------------------------ |
| Which assets a scene draws              | `extract`: the closure of its roots by file, path ID |                           |
| The scene's hierarchy, and what it lost | `genshin:assets tree`: flags anchors, lost fathers   |                           |
| A script's settings                     | `behaviours`: raw bytes scanned for shapes           |                           |
| What a script spawns, and where         | `behaviours`, set as `spawns` at their anchors       |                           |
| A spawned prefab's place and scale      | `composeWorldMatrices`, through the anchor           |                           |
| Whether the arrangement is right        | `genshin:assets arrangement`: cross-ratios, drift    |                           |
| The camera's pose                       | `genshin:parity pose`: landmarks, refined on edges   |                           |
| The camera's path over a flight         | `genshin:parity track`: the pose at each frame       |                           |
| A render that settles in one frame      | the witness: SMAA, its clock held, one frame         |                           |
| Depth, normal, albedo, part per pixel   | `genshin:parity gbuffer`                             |                           |
| Where each part lands on the reference  | `genshin:parity overlay`: boundaries, edge distance  |                           |
| Which layer a score's loss is in        | `attribute`, over the whole frame                    | Scores by layer           |
| One approval number                     | shape and tone                                       | The perceptual score      |
| The grade, the fog, the light           | none: measured over regions, or searched             | Calibration by regression |
| What a shader computes                  | `shaders`: the disassembly, constants annotated      | Shader reading            |
| Each stand-in's cost                    | `attribute`: the loss table                          | Scores by layer           |
