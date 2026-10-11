---
title: Drawing a character
description: A character's parsed model becomes one skinned mesh, lit by the world's toon ramp and rim and outlined where its file sets an edge, and stands at its holder's origin.
---

# Drawing a character

The model [read from a pack](/docs/genshin/characters/pmx-reader) becomes one skinned mesh, lit on the world's own toon ramp, so a character is lit as the rest of the world is lit.

- **One skinned mesh.** `createPmxMesh` builds one geometry with a group for each material's run of triangles, in the file's order, which is the order MMD draws them in. Each bone is nested under its parent and placed from it, bound by the step back from where it stands, since the rest pose turns no bone. MMD's unit is scaled into the world's metres by `PMX_UNIT_METRES`.
- **The toon ramp, the rim and the outline.** `createCharacterMaterial` lights each material with three's toon lighting over the world's ramp, its colour the material's diffuse under its texture, with the sky's rim on its lit silhouette as every surface takes it. The outline pass picks a material by its toon flag, so only a material whose edge the file sets is outlined, as MMD draws an edge.
- **Blended in the model's own order.** Every material is blended and writes its depth, as MMD draws one, so a texel the texture leaves clear shows what the materials before it drew. A material set to draw both faces is drawn from behind as well.
- **Textures as the model samples them.** `createPmxTexture` decodes a texture unpremultiplied and unconverted, leaving the blend and the colour space to three, and unflipped, since a PMX model's texture coordinates run from the image's top left. Past its edges it repeats.
- **It faces where its holder faces.** `CharacterModel` stands the model at the origin of whatever holds it, turned half round to face -z, as a yaw of none does. The [character controller](/docs/genshin/character-controller)'s body faces the same way, so whatever moves the body moves the model by holding it.
- **The Traveler rides the controller's body.** The world plays the Traveler (`TRAVELER_CHARACTER_ID`), drawn on the character controller's body from where Windrise starts, from whichever pack it has, else as the body's capsule. A witness render draws no character.

## Notes

- **The game's characters do not darken in the rain.** A character's material takes none of the wetness the environment's toon material reads ([weather](/docs/genshin/weather)).
- **The world's ramp replaces the model's toon ramp, and sphere maps are not drawn.** The toon and sphere references are read so a later pass can draw them, and are never fetched.
- **MMD's unit is reckoned, not measured.** Eight centimetres is the community's reckoning from a model's height. The scale the game draws a character at is measured from its own models, as the [proposal](/docs/proposals/genshin/characters) lists.

## Key files

| File                                                                 | Role                                                                                        |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `packages/genshin-engine/src/character/createPmxMesh.ts`             | The skinned mesh: the geometry's groups, the skeleton, and the scale to metres              |
| `packages/genshin-engine/src/character/createPmxSkeleton.ts`         | Each bone nested and placed from its parent, and bound where it stands                      |
| `packages/genshin-engine/src/character/createCharacterMaterial.ts`   | The toon ramp, the rim and the outline where the edge is set                                |
| `packages/genshin-engine/src/character/createPmxTexture.ts`          | A texture decoded as the model samples it                                                   |
| `packages/genshin-world/src/services/character/readCharacterMesh.ts` | A pack's model and its textures into one mesh through its reader, as a Result               |
| `packages/genshin-world/src/components/Character/Model/Index.vue`    | Draws a character's model at its holder's origin, and releases it                           |
| `packages/genshin-world/src/components/World/Windrise/Index.vue`     | Stands the Traveler at Windrise's start point, drawn from the pack it is handed a reader of |

## Sources

- [1 MMD unit in real world units](https://hogarth-mmd.deviantart.com/journal/1-MMD-unit-in-real-world-units-685870002), Hogarth-MMD: MMD's unit reckoned at about eight centimetres from a model's height.
