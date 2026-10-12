---
title: Lumine's shading
description: How the game's Character_Base_Uber material lights Lumine's body, as equations read from the program that draws it, each tagged Exact or Provisional, with the inputs a player's pack can supply and the defaults for the rest.
---

# Lumine's shading

Lumine (the game's "PlayerGirl") is drawn by the game's own "Character_Base_Uber" shader, the same shader for all four of her materials. This page gives the body's shading as equations, read from the programs that draw it. Each equation is tagged:

- **Exact:** read from a program, its register and constant use, or its keyword set. The program is named where it matters.
- **Provisional:** the structure is read, but a name, a binding or a fitted number is not yet confirmed, and the reason is given.

Hair and face are not derived yet. The open items are at the end.

## What her materials select

Each material sets a different set of keywords on the shader. These are read from the material's own bytes, so they are exact.

| Material | Keywords set                                                                          |
| :------- | :------------------------------------------------------------------------------------ |
| Body     | "METAL_MAT", "SHADOW_RAMP_ON", "TOON_LIGHTMAP_ON", "TOON_SPECULAR_ON"                 |
| Dress    | "BACK_FACE_ON", "METAL_MAT", "SHADOW_RAMP_ON", "TOON_LIGHTMAP_ON", "TOON_SPECULAR_ON" |
| Face     | "FACE_MAP_NEW_ON", "TOON_LIGHTMAP_ON", "TOON_SPECULAR_ON"                             |
| Hair     | "SHADOW_RAMP_ON", "TOON_LIGHTMAP_ON", "TOON_SPECULAR_ON"                              |

- **"TOON_SPECULAR_ON" is not a keyword the shader defines.** None of the uber's variants lists it, so no program is selected by it. The specular is gated by the material's own floats instead ("_UseSpecular", "_Shininess", "_SpecMulti").
- **The program is picked by the keywords that do exist.** The uber's programs are named by pass, stage and keyword set (`readShaderPrograms`). A body's variant is one whose material keywords are exactly "METAL_MAT", "SHADOW_RAMP_ON" and "TOON_LIGHTMAP_ON", and no program has only those: every candidate also carries engine-wide keywords ("LOD_FADE_CROSSFADE", "MHY_SKINMESH_ENABLE_VSSKINNING", "ENABLE_PACK_NORMAL_ON" and the like). The candidates fall into 76 engine-wide sets. Exact on the material match; Provisional on which engine-wide set the game draws Lumine with, since it is set at runtime and is not in the program's bytes.
- **The body's four texture slots** are "_MainTex", "_LightMapTex", "_MTMap" and "_PackedShadowRampTex". The variant also samples "_MTSpecularRamp" and "_EyeMask". Provisional: the register each slot is bound to is taken from the order the program's own parameter table lists the textures, which matches the sampling sites but is not yet checked against a binding.

The close view's mesh is the body's LOD0 "Body" in block "04161624", 10,406 vertices in two submeshes (1,491 and 8,915), 12,660 triangles, with "Body_LOD1" to "Body_LOD3" beside it in the same block (Exact on the counts). Which LOD the game draws up close is Provisional: the prefab's root carries no LODGroup, and the renderer that binds each LOD is not yet identified. The textures are 1024 with a full 11-mip chain, and no other block holds a higher mip (Exact).

### Which programs the sets select

Each program is named by its index in the uber's named list: pass, then stage, then record order, the same index as its `NNNNN.dxbc` and its `programs.tsv` line. A material's program is one of the candidates below, each carrying that material's set and some engine-wide set (see the bullet above). The ranges are the candidates, not one choice.

| Material | Pass      | Stage  | Candidates | Program indices                                                                                                                                                              |
| :------- | :-------- | :----- | ---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Body     | "BODY"    | Pixel  |        124 | 194-225, 274-277, 282-285, 290-313, 440-443, 458-461, 476-479, 484-487, 536-543, 1291-1302, 1311-1326, 1373-1374, 1377-1378, 1393-1396                                       |
| Body     | "BODY"    | Vertex |         41 | 736-749, 754-761, 791-792, 794-795, 818-821, 1499-1507, 1518-1519                                                                                                            |
| Hair     | "BODY"    | Pixel  |         60 | 266-273, 278-281, 286-289, 318-321, 326-329, 338-341, 350-353, 446-447, 450-451, 464-465, 468-469, 488-495, 1329-1330, 1333-1334, 1345-1346, 1357-1358, 1375-1376, 1379-1380 |
| Hair     | "BODY"    | Vertex |          5 | 750-753, 1508                                                                                                                                                                |
| Face     | "BODY"    | Pixel  |         68 | 426-433, 528-535, 546-553, 576-583, 600-607, 614-621, 1389-1392, 1399-1402, 1413-1416, 1429-1432, 1435-1438                                                                  |
| Face     | "BODY"    | Vertex |         30 | 783-788, 812-817, 824-829, 834-837, 1515-1517, 1522-1524, 1526-1527                                                                                                          |
| Face     | "OUTLINE" | Pixel  |         16 | 882-885, 902-909, 920-923                                                                                                                                                    |
| Face     | "OUTLINE" | Vertex |         24 | 952-959, 970-977, 984-991                                                                                                                                                    |

The hair and face candidates sit in the same "BODY" pass as the body's, since the material keywords alone tell the three apart; the face also has candidates in "OUTLINE", the outline drawn over the face. No single program is named per material yet: that choice needs the engine-wide set, and until it is made no candidate is disassembled, so no DXIL program has been run through `vkd3d-compiler`.

## The pass classes

The uber's 1,553 compiled programs, by their own output signatures (Exact):

| Class               | Signature                                             | Programs |
| :------------------ | :---------------------------------------------------- | -------: |
| Deferred (G-buffer) | pixel program, 6 colour targets                       |      678 |
| Deferred (G-buffer) | pixel program, 7 colour targets (the 7th is RGBA)     |      336 |
| Single target       | pixel program, one RGBA target (forward or meta)      |      149 |
| No colour           | programs with no colour target (vertex-only or depth) |      390 |
| MotionVectors       | a two-channel target                                  |        0 |

Of the 1,553, 693 are DXBC and 860 are DXIL. The DXIL programs are read by the same compiler in "d3d-asm" mode, which the DXBC ones use in "dxbc-tpf" mode.

## The body's Deferred pass

The body's pixel program writes six targets, and the lit colour is built from the lightmap, the main texture and the packed ramp.

### Inputs (per pixel)

- `N`: the interpolated normal, flipped by the front-face flag. Exact.
- `Lm`: "_LightMapTex". Its red is a metal mask, its green a shadow threshold, its blue unused by the body, and its alpha the region. Exact on the channel uses; Provisional on the blue channel being unused, which is read from the absence of a use.
- `M`: "_MainTex", with alpha `a_M`.

### The region

The lightmap's alpha selects one of five regions. Exact, with the thresholds and toggles read from the program:

```
region(A) = 2  if A >= 0.8 and _UseMaterial2 != 0
          = 5  if 0.6 <= A < 0.8 and _UseMaterial5 != 0
          = 3  if 0.4 <= A < 0.6 and _UseMaterial3 != 0
          = 4  if 0.2 <= A < 0.4 and _UseMaterial4 != 0
          = 1  otherwise
```

Each region past 1 takes its own colour, emission and specular values from its material block ("_Color2" to "_Color5", "_EmissionColor_MHY2" to "_EmissionColor_MHY5", "_SpecularColor2" to "_SpecularColor5", and the rest of each block). Exact on the selection; the block names are the uber's own.

### The metal gate

```
metal = (Lm.r > 0.9)
```

Exact on the threshold. Where `metal` holds, the colour is a matcap read of "_MTMap" at the view-space normal, mixed between "_MTMapDarkColor" and "_MTMapLightColor" (Provisional on the matcap's coordinate derivation, which is read from the sampling site but not yet checked against a rendered metal).

### The ramp row

Outside the metal gate the colour is shaded on the packed ramp. The ramp's rows are per region:

```
v_row(r) = 0.05 + 0.1 * (r - 1)      (first row, Exact)
v_row2(r) = 0.55 + 0.1 * (r - 1)     (second row, used where _CoolShadowColorOrTex is set, Exact)
```

Both are sampled at `1 - v`, so a region's row is read from the ramp's own bottom-up layout (Exact on the coordinate, Provisional on the ramp's row order, which is the Body_Shadow_Ramp's 20 rows as the texture reports them).

### The shade term

```
W  = _LightArea
x  = clamp((W - z) / W / w, 0, 1)
S  = _PackedShadowRampTex.sample((1 - x), (1 - v_row(r))).rgb
```

Exact on the form of `x` as a fraction of "_LightArea" and on the sample's coordinate given `x` and `v_row`. Provisional on `z` and `w`: `z` is a toon threshold built from the lightmap's green channel, the vertex-colour AO and the normal's dot with the sun, and `w` is "_ShadowRampWidth", scaled by "_UseVertexRampWidth". Their exact expressions are read but not yet fitted, so no numeric value is claimed.

### The lit colour (partly open)

The program combines the main colour, the ramp, the sun, the sky ambient, the specular and the rim into the lit colour `C`. What is read so far:

- The region's tint multiplies the main texture where the region's "_UseMaterial" toggle is set (Exact on the toggle's use, Provisional on the blend's mode, which "_MainTexTintBlendMode" selects).
- The specular term is "_SpecularColor" times "_SpecMulti" times a Blinn-style term with exponent "_Shininess", attenuated in shadow by "_SpecualrInShaow" (Exact on the terms and their names; Provisional on the attenuation's form).
- `C` is not assembled into one expression yet. The final assembly is the open item below.

### The outputs (Exact)

```
o0.xyz = 0.5 * N + 0.5                      (N as above)
o0.w   = 1/3 when region == 2, else 0       (the float bits of 0.333)
o1.xyz = 0.5 + (C_d - 0.5) * (1 + K)        (the tone-adjusted lit colour)
C_d    = lerp(C, dot(C, (0.0397, 0.4580, 0.0061)), D)
o2     = a second tone-adjusted colour, the same form as o1 (Provisional on its meaning)
o3.x   = q / 255, with q in {4, 21}         (region-dependent, Exact on the values)
o4.x   = a flag in {0, 1}                   (Provisional on its meaning)
o5.x   = (floor(F) & 15) / 255              (the material's nibble, Exact on the mask)
```

`D` is "_DesaturateScale", read from the body's constant layout at byte 640, which is register 40's `x` (Exact by offset). `K` is "_ContrastScale", at byte 652, register 40's `w` (Exact by offset). `F` is the register 261 `x` field, which the layout names "_FlareType" (Exact on the value, Provisional on the name, since a "_FlareType" on a body would be unusual).

## The deferred lighting pass's character branch

The pass is "Hidden/Internal-DeferredShading", in the block "00/00612967.blk", exported raw as one shader with 758 programs. Its character-keyed pixel programs ("DEFERRED_TOON_ON" with the character keywords) read a material byte from the G-buffer and branch on it.

- The byte is read from one G-buffer channel, multiplied by 255, rounded, and its bit 6 cleared before it is compared (Exact on the arithmetic). Provisional on which target that channel belongs to, since the render-target binding is set by the game's C#, not by the shader.
- The comparisons seen in one such program are against the sets {0, 1, 11, 13}, {6, 8, 13, 14}, {16, 18, 19, 24} and {23}, with a second test that the G-buffer's other channel lies in (0.45, 0.51) for the first set (Exact on the values, Provisional on which program a body pixel reaches).
- If the body's "o0.w" is the channel the pass reads, region 2 arrives as "85" before the bit-6 clear, which gives "21". The sets above do not contain "21", so that mapping is not yet settled.
- The pass's sun, ramp and ambient sum for a character pixel is not yet read, so no lit-colour equation for the deferred pass is claimed.

## Inputs, and where each comes from

| Input                                                   | Lumine's value, from the game                                                              | What a player's MMD pack supplies in production                                               | Default when the pack does not supply it                                                     |
| :------------------------------------------------------ | :----------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| Main texture "_MainTex"                                 | "Body_Diffuse", 1024 x 1024                                                                | The pack's diffuse texture for the material                                                   | The material's "_Color"                                                                      |
| Lightmap "_LightMapTex" (metal, shadow, region)         | "Body_Lightmap", 1024 x 1024                                                               | Nothing. A PMX file has no lightmap channel                                                   | A proposed flat lightmap, red 0 (never metal), green 0.5, alpha 0 (region 1), not yet fitted |
| Metal map "_MTMap" and its colours                      | The body's "_MTMap", and "_MTMapLightColor", "_MTMapDarkColor" from `inventory-values.txt` | Nothing directly. The pack's sphere map is the nearest stand-in and is not the same input     | The grey metal map, and the body's colours from the inventory                                |
| Packed shadow ramp "_PackedShadowRampTex"               | "Body_Shadow_Ramp", 256 x 20                                                               | The pack's toon texture for the material, read as a ramp (Provisional: the row count differs) | The world's shared toon ramp ("toon01" to "toon10")                                          |
| Specular "_SpecularColor", "_Shininess", "_SpecMulti"   | The body's values from `inventory-values.txt`                                              | The pack's specular colour and power                                                          | The body's values from the inventory                                                         |
| Outline "_OutlineColor", "_OutlineWidth"                | The body's values from `inventory-values.txt`                                              | The pack's edge colour and size                                                               | The body's values from the inventory                                                         |
| Region colours "_Color2" to "_Color5" and their toggles | The body's values from `inventory-values.txt`                                              | Nothing. A PMX file has one diffuse per material                                              | The body's values from the inventory, with the region toggles off                            |
| Keywords                                                | The four sets above                                                                        | Fixed by the material's type, not by the pack                                                 | The body's set                                                                               |

The values in the Lumine column are the game's own, read from its material bytes. They are not committed here as numbers; `inventory-values.txt` is the extracted record. A player's pack supplies only what its own file holds, so for a production pack the regions and the lightmap take their defaults.

## Open

- **The shade term's `z` and `w`.** Their expressions are read; their fitted values are not.
- **The lit colour `C`.** The sum of the main colour, the ramp, the sun, the sky ambient, the specular and the rim is not yet assembled into one expression.
- **Hair and face.** Hair uses the same ramp path without the metal gate; face uses "FACE_MAP_NEW_ON" and the face SDF. Neither is derived.
- **The deferred pass's character branch.** The byte's target, and the mapping from the body's writes to the branch's sets, are not settled. The pass's light sum for a character pixel is not read.
- **The register-to-texture binding.** The order the parameter table lists the textures is used for the bindings above; a check against a rendered frame is still to be made.

Related: [drawing a character](/docs/genshin/characters/drawing), [derived assets](/docs/genshin/derived-assets), [game data formats](/docs/genshin/game-data-formats).
