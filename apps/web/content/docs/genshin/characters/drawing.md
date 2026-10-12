---
title: Drawing a character
description: A character's parsed model becomes one skinned mesh, each material lit on the toon ramp its file names, with its sphere map, specular, rim and edge, and stands at its holder's origin.
---

# Drawing a character

The model [read from a pack](/docs/genshin/characters/pmx-reader) becomes one skinned mesh, lit on the world's own toon ramp, so a character is lit as the rest of the world is lit.

- **One skinned mesh.** `createPmxMesh` builds one geometry with a group for each material's run of triangles, in the file's order, which is the order MMD draws them in. Each bone is nested under its parent and placed from it, bound by the step back from where it stands, since the rest pose turns no bone. MMD's unit is scaled into the world's metres by `PMX_UNIT_METRES`.
- **Each material as its file sets it.** `createCharacterMaterial` lights a material with three's toon lighting on the ramp its file names, its colour the material's diffuse under its texture. A shared toon, `toon01` to `toon10`, is one of ten ramps the world generates in its own tones (`getSharedToonRamp`, shades in `SHARED_TOON_RAMP_SHADES`), never MMD's own files. A toon the model's list names is the pack's texture, read through the same reader as the diffuse textures, and a material naming none lights on the world's ramp. The sphere map multiplies its colour for `.sph` and adds to it for `.spa`, read by the view's normal as MMD reads it, and a sub-texture (`AdditionalUv`) is read through the vertex's first extra vector. The ambient is the material's full colour where its file names no texture, and a fifth of it under one, as the MMD loader draws it. The specularity raises a Blinn-Phong highlight in the specular colour, lit only where the sun reaches. The sky's rim sits on the lit silhouette as every surface takes it.
- **Posed from the body's state.** Nothing in the file drives the skeleton, so `createCharacterPoser` poses its standard bones by MMD's Japanese names, found in the skeleton and skipped where a model lacks one. Each frame `computeCharacterPose` turns them from the controller's state: the arms come down from the T, the chest and shoulders breathe, a walk, run or sprint swings the legs and arms opposite each other, a jump, a fall or a glide holds a fixed stance, and a state's pose cross-fades from the one before. A gait's stride is `advanceStridePhase`, a full turn for each stride the state's speed covers, so the feet keep pace with the ground they cross. Its angles are provisional, not yet measured against a still or a capture, and the stance and cycles are procedural rather than the game's clips.
- **The outline in the material's edge.** The outline pass picks a material by its toon flag, so only a material whose edge the file sets is outlined. Its edge's colour and alpha are the outline's, and its size multiplies the scene's outline width. A material outlined this way gets one outline material per distinct edge, built once and shared, as the scene's outline is.
- **Blended in the model's own order.** A material the file leaves wholly opaque writes its depth, as MMD draws one. A partly transparent one is blended and writes no depth where it is clear, and is drawn from both faces, so a texel it leaves clear shows what the materials before it drew. A material set to draw both faces is drawn from behind as well.
- **Textures as the model samples them.** `createPmxTexture` decodes a texture unpremultiplied and unconverted, leaving the blend and the colour space to three, and unflipped, since a PMX model's texture coordinates run from the image's top left. Past its edges it repeats. A toon texture is the exception: it is read flipped, so the ramp's bottom row lights the shade, as the MMD loader reads it.
- **It faces where its holder faces.** `CharacterModel` stands the model at the origin of whatever holds it, turned half round to face -z, as a yaw of none does. The [character controller](/docs/genshin/character-controller)'s body faces the same way, so whatever moves the body moves the model by holding it.
- **The Traveler rides the controller's body.** The world plays the Traveler (`TRAVELER_CHARACTER_ID`), drawn on the character controller's body from where Windrise starts, from whichever pack it has, else as the body's capsule. A witness render draws no character.

## Notes

- **The game's characters do not darken in the rain.** A character's material takes none of the wetness the environment's toon material reads ([weather](/docs/genshin/weather)).
- **A toon or sphere texture is read only where a material draws with it.** A model's shared toon ramps are generated, never read, so a release without any toon texture ships no file beyond its model and textures.
- **The pose is procedural.** The game's own locomotion clips are not retargeted onto the MMD skeleton, so the Traveler's stance and cycles are the poser's own rather than the game's animation. Retargeting those clips is the roadmap's fidelity step ([roadmap](/docs/genshin/roadmap)).
- **MMD's unit is reckoned, not measured.** Eight centimetres is the community's reckoning from a model's height. The scale the game draws a character at is measured from its own models, as the [proposal](/docs/proposals/genshin/characters) lists.

- **Where the drawing departs from MMD's loader, on purpose.** The oracle for these rules is three-stdlib's `MMDLoader`, since three's own examples no longer ship one. A pack does not carry MMD's shared toon bmps, so the world's ten ramps stand in for them. The oracle reads a material's colours as linear, where the drawing decodes the file's sRGB colours, and the oracle draws no specular highlight and ignores the sphere map, where the drawing keeps both. The rim light is the sky's and is not in the oracle. A sub-texture multiplies here and the oracle draws none, so that choice is unchecked against MMD. On the Traveler the drawing is still darker than the oracle on most materials; the gap is not yet traced.

## Key files

| File                                                                    | Role                                                                                        |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `packages/genshin-engine/src/character/createPmxMesh.ts`                | The skinned mesh: the geometry's groups, the skeleton, and the scale to metres              |
| `packages/genshin-engine/src/character/createPmxSkeleton.ts`            | Each bone nested and placed from its parent, and bound where it stands                      |
| `packages/genshin-engine/src/character/pose/computeCharacterPose.ts`    | The standard bones' rotations for a state, a pure function                                  |
| `packages/genshin-engine/src/character/pose/createCharacterPoser.ts`    | Drives the model's bones each frame, cross-fading between states                            |
| `packages/genshin-engine/src/character/createCharacterMaterial.ts`      | Each material's ramp, sphere map, ambient and specular, rim, and the edge its outline takes |
| `packages/genshin-engine/src/character/getSharedToonRamp.ts`            | MMD's ten shared toon ramps, generated once in the world's own tones                        |
| `packages/genshin-engine/src/character/createSpecularNode.ts`           | The Blinn-Phong highlight a material's specular colour and specularity light                |
| `packages/genshin-engine/src/models/nodes/SharedToonOutlinePassNode.ts` | The outline pass, one shared material and one per distinct material edge                    |
| `packages/genshin-engine/src/character/createPmxTexture.ts`             | A texture decoded as the model samples it                                                   |
| `packages/genshin-world/src/services/character/readCharacterMesh.ts`    | A pack's model and its textures into one mesh through its reader, as a Result               |
| `packages/genshin-world/src/components/Character/Model/Index.vue`       | Draws a character's model at its holder's origin, and releases it                           |
| `packages/genshin-world/src/components/World/Windrise/Index.vue`        | Stands the Traveler at Windrise's start point, drawn from the pack it is handed a reader of |

## Sources

- [1 MMD unit in real world units](https://hogarth-mmd.deviantart.com/journal/1-MMD-unit-in-real-world-units-685870002), Hogarth-MMD: MMD's unit reckoned at about eight centimetres from a model's height.
