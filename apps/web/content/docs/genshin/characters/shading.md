---
title: Lumine's shading
description: What the game's Character_Base_Uber material takes for Lumine's four materials, the keywords each one sets and the textures each names, and what remains to derive before her shading can be ported.
---

# Lumine's shading

Lumine (the game's `PlayerGirl`) is drawn by the game's own `Character_Base_Uber` shader, the same shader for all four of her materials. This page records what that material takes and which of its variants her materials select. It does not yet give the shading equations: the program that lights her is not yet identified.

## What her materials select

Each material sets a different set of keywords on the shader. These are read from the material's own bytes, so they are exact.

| Material | Keywords set                                                                          |
| :------- | :------------------------------------------------------------------------------------ |
| Body     | `METAL_MAT`, `SHADOW_RAMP_ON`, `TOON_LIGHTMAP_ON`, `TOON_SPECULAR_ON`                 |
| Dress    | `BACK_FACE_ON`, `METAL_MAT`, `SHADOW_RAMP_ON`, `TOON_LIGHTMAP_ON`, `TOON_SPECULAR_ON` |
| Face     | `FACE_MAP_NEW_ON`, `TOON_LIGHTMAP_ON`, `TOON_SPECULAR_ON`                             |
| Hair     | `SHADOW_RAMP_ON`, `TOON_LIGHTMAP_ON`, `TOON_SPECULAR_ON`                              |

- **The keywords pick the variant.** Every variant of the shader is one program per combination of keywords, and each material's variant is the one its keyword set names. The uber shader's program set is carved from its shader export and disassembled per program.
- **Each material names its own texture slots.** The Body names `_MainTex`, `_LightMapTex`, `_MTMap`, `_PackedShadowRampTex`, `_NyxStateOutlineColorRamp`, `_NyxStateOutlineNoise` and `_TempNyxStatePaintMaskTex`. Which file fills each slot is not yet read, so the bindings are open. The other materials' slot sets are in the inventory, not yet on this page.

## What a material needs from its pack

A character's material takes its inputs from the pack that holds it. For a player's MMD pack in production, only the pack's own textures and fitted numbers can be supplied, with the numbers hosted like region data. Defaults for any input the pack does not supply are not yet fitted.

- **Textures.** The diffuse, lightmap, metal map and shadow ramp slots of each material, read from the pack.
- **Keywords.** The four sets above, fixed by the material's type rather than by the pack.
- **Fitted numbers.** None are fitted yet.

## What is open

- **The shading equations.** The program that lights a character is the deferred pass's character branch, which is not yet identified. Until it is, no equation on this page is derived and none is tagged Exact or Provisional.
- **The slot bindings.** The file each texture slot names is not yet read from the material.
- **The deferred pass's variant for Lumine.** The deferred pass's vertex and pixel programs are not yet mapped to passes and keywords.

Related: [drawing a character](/docs/genshin/characters/drawing), [derived assets](/docs/genshin/derived-assets), [game data formats](/docs/genshin/game-data-formats).
