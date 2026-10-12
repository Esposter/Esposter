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

### The base programs

Each program is named by its index in the uber's named list: pass, then stage, then record order, the same index as its `NNNNN.dxbc` and its `programs.tsv` line. Each material's base variant is one keyword set with a vertex and a pixel program, chosen by the rule in the Decisions below. The variant's two programs are:

| Material | Pass      | Stage  | Program index | Container   |
| :------- | :-------- | :----- | ------------: | :---------- |
| Body     | "BODY"    | Pixel  |           460 | DXBC (SHEX) |
| Body     | "BODY"    | Vertex |           795 | DXIL        |
| Hair     | "BODY"    | Pixel  |           272 | DXBC (SHEX) |
| Hair     | "BODY"    | Vertex |           753 | DXIL        |
| Face     | "BODY"    | Pixel  |           432 | DXBC (SHEX) |
| Face     | "BODY"    | Vertex |           788 | DXIL        |
| Face     | "OUTLINE" | Pixel  |           885 | DXIL        |
| Face     | "OUTLINE" | Vertex |           958 | DXBC (SHEX) |

Candidates before the choice: body 124 pixel and 41 vertex, hair 60 and 5, face 68 and 30, the face's outline 16 and 24 (Exact).

## Decisions

- **The base variant.** A material matches many candidate programs, because engine-wide keywords (shadows, fog, light probes and the like) are runtime state the material does not set. A candidate carrying another Lumine material's own keyword is not a candidate for it: "BACK_FACE_ON" and "FACE_MAP_NEW_ON" exclude the body, for instance. The base variant is the keyword set, among those with both a vertex and a pixel program, with the fewest keywords beyond the material's own set. Two sets tied on that count go to the one whose two programs are both DXBC (SHEX) over a DXIL one, and a tie past that goes to the lowest index. The equations are read from the base variant's pixel program, and its vertex program gives the outline's width and the vertex stage.
- **An engine-wide keyword's addition is noted only where it touches the shade**, as one line under the equation it changes, such as a shadow keyword's attenuation factor. The equation itself is written once, never a second copy per keyword.

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
- `Lm`: "_LightMapTex". Its red is a metal mask and the specular's weight, its green a shadow threshold, its blue the specular's gate, and its alpha the region. Exact on the channel uses (the blue is read in the specular's comparison, the non-metal branch).
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

The ramp is sampled at a column `u` and a row `v`, read from the program's sampling sites (Exact):

```
W  = "_LightArea"
x  = clamp((W - z) / W / w, 0, 1)
u  = 1 - x          (0 where the program's "v8.w" exceeds 1e-5)
S  = "_PackedShadowRampTex".sample(u, 1 - v_row(r)).rgb
```

`z` is the toon threshold, with its three branches read from the program's compare chain (Exact on the form, Provisional on the vertex inputs "v1.x" as the vertex colour's AO and "v9.w" as the sun term):

```
L  = (_UseLightMapColorAO > 0.001) ? Lm.g : 0.5
Q  = 2 * (L - 0.5) * |L - 0.5| + 0.5
Q' = (_UseVertexColorAO != 0) ? Q * AO_v : Q
z  = 0 if Q' < 0.05;  1 if Q' > 0.95;  else (Q' + N_v) / 2
```

`w` is "_ShadowRampWidth", scaled by the vertex's ramp weight when "_UseVertexRampWidth" is set (Exact):

```
w = (_UseVertexRampWidth != 0) ? max(2 * v1.y, 0.01) * "_ShadowRampWidth" : "_ShadowRampWidth"
```

Where the cool shadow is on ("_CoolShadowColorOrTex"), the row is read twice, at the first and second row, and mixed by "_ES_CharacterColorTone" (Exact on the mix; the rows are the two equations above).

The shade term is not yet fitted to a numeric value, so no number is claimed for `z` or `w`.

### The lit colour (partly open)

The non-metal branch builds the lit colour from these terms, in the order the program applies them (Exact on each term and its operator, Provisional on the light factor and the hit terms):

```
Mc   = M.rgb * tint                        (tint: "_Color" for region 1, "_Color2" to "_Color5" for the others)
Lit  = Mc * S * "_ES_CharacterMainLightBrightness"
Em   = Mc * "_EmissionColor_MHY" * "_EmissionScaler"   (the region's own colour and scaler)
C0   = lerp(Lit, Em, Lm.g)
Spec = step(1 - Lm.b, pow(max(N . H, 1e-5), "_Shininess")) * Lm.r * "_SpecularColor" * "_SpecMulti"
C    = C0 + "_SpecualrInShaow" * Spec * brightness
```

`H` is the half vector of the view and the light, and `N` is "v7" (Exact on its form). The specular's own weight is "_SpecualrInShaow", added, not an attenuation of the specular. The light factor `f` is "min(2 * _LightColor0.w, 1)" where "mhy_AvatarLightDir.w" exceeds 0.5, and 1 otherwise, and it scales the specular and the lit colour in the branch that tests it (Provisional on its meaning). The rim and hit terms ("_ElementRimColor", "_HitColor") are added after this (Provisional on the order). The outputs use `C` through the desaturation below.

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

## The hair

The hair's base pixel program is 272 (DXBC), in the "BODY" pass. It has no metal branch, so its shade is the ramp path alone (Exact, read from the program's branch structure).

### The hair's specular (pixel 272)

The specular is the body's form, with the same gate and the same lightmap channels (Exact on the operators, and on the channel each term reads):

```
H    = normalize(V + L)                         (the half vector, as the body's)
Spec = step(1 - Lm.b, pow(max(N . H, 1e-4), "_Shininess"))
C_s  = Spec * Lm.r * "_SpecMulti" * "_SpecularColor" * tint * brightness
```

`Lm` is the "Hair_Lightmap" (the hair's program reads its red as the metal-free specular weight). Where the region is 1 the program takes "_Shininess", "_SpecMulti" and "_SpecularColor" from the base block (cb0[222] and cb0[220]); other regions take their own block. The hair's specular is added to the colour as `"_SpecualrInShaow" * C_s` (Exact).

### The hair's ramp row

The ramp row is the body's: `v_row(r) = 0.05 + 0.1 * (r - 1)`, and the second row `0.55 + 0.1 * (r - 1)` where the cool shadow is on (Exact on the constants, from the program's `mad` pairs). The hair's packed ramp is sampled from texture slot "t3" in this program, where the body's is "t4", so the slot order differs between programs (Exact on the slot number here). Its column is `1 - x` as the body's, which is not traced in this program (Provisional).

Hair's equations are not fitted to a rendered frame, so no number is claimed.

## The outline

The outline is the face's "OUTLINE" pass, whose base programs are vertex 958 (DXBC) and pixel 885 (DXIL). The width is set in the vertex program and the colour in the pixel program.

### The width (vertex 958)

The vertex program pushes each vertex out along its screen-space normal by a width `W`. The depth term `D` picks one of three knots of "_OutlineWidthAdjustZs", and the scale is read from the matching knots of "_OutlineWidthAdjustScales" (Exact on the operators and the knot selection):

```
k  = 2.414 / cb2[7].y                       (the projection's y scale)
D  = -k * z                                 (z the view-space depth)
(Z0, Z1, S0, S1) = (Zs.x, Zs.y, Sc.x, Sc.y) if D < Zs.y, else (Zs.y, Zs.z, Sc.y, Sc.z)
t  = saturate((D - Z0) / max(Z1 - Z0, 0.001))
s  = t * (S1 - S0) + S0
W  = T_w * s * "_OutlineWidth" * "_OutlineCorrectionWidth" * v1.w * 0.41425
p.xy += W * N_screen                        (N_screen the normal projected to the screen)
```

`T_w` is the red channel of texture "t0" sampled at the vertex's second texture coordinate, at lod 0 (Exact on the channel and the lod; Provisional on the texture's name, which the slot table does not yet give). `v1.w` is the vertex's own width weight. The offset along the view-space normal, "_MaxOutlineZOffset" times 0.01, is scaled by "_OutlineOffsetBlockBChannel" as well: it is `v1.z - 0.5` where that flag is set, and 1 where it is not (Exact on the form, Provisional on the blue channel's meaning).

### The colour (pixel 885)

The outline's colour is the material's colour times the outline colour, then mixed toward a shade colour by a mask (Exact on the first product and the mix's form; Provisional on the shade colour's source and on the mask):

```
Oc = "_Color" * "_OutlineColor"                  (the default region's branch)
Sh = 0.2 * T_s                                   (T_s the rgb of texture "t1" at the pixel's coordinates)
C  = Oc + m * (Sh - Oc)                          (m the region's mask, read from the layout as a per-region value)
```

The output colour uses the same tone form as the body's "o1": `O1 = 0.5 + (C_d - 0.5) * (1 + K)` with `C_d` the desaturation of `C`, where "_DesaturateScale" and "_ContrastScale" are read from the same registers as the body's (Exact).

Nothing in the outline's equations has been fitted to a rendered outline, so no number is claimed for its width or colour.

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
