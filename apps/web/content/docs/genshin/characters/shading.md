---
title: Lumine's shading
description: How the game's Character_Base_Uber material lights Lumine's body, as equations read from the program that draws it, each tagged Exact or Provisional, with the inputs a player's pack can supply and the defaults for the rest.
---

# Lumine's shading

Lumine (the game's "PlayerGirl") is drawn by the game's own "Character_Base_Uber" shader, the same shader for all four of her materials. This page gives the body's shading as equations, read from the programs that draw it. Each equation is tagged:

- **Exact:** read from a program, its register and constant use, or its keyword set. The program is named where it matters.
- **Provisional:** the structure is read, but a name, a binding or a fitted number is not yet confirmed, and the reason is given.

Hair and face are written in their sections. The open items are at the end.

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

The model draws five LOD0 meshes under its root "Avatar_Girl_Sword_PlayerGirl_Model" in the Partner prefab's tree: "Body" (12,022 vertices in three submeshes, Hair 2,305 triangles, Body 11,166 and Dress 1,166, 14,637 in all), "Face" (877), "Face_Eye" (1,113, the eye sockets the face leaves open), "Brow" (52) and "EyeStar" (90), with "Body_LOD1" to "Body_LOD3" beside them in the same block (Exact on the counts and on the root). Each mesh is the one its renderer's pointer names, through the renderer's CAB's externals: "Body", "Face_Eye", "Brow" and "EyeStar" match the dump of "cab-3bec6b44" alone by vertex count, and that CAB's "Body" has 114 bind poses for its renderer's 114 bones. "Face" (877 vertices) matches "cab-3bec6b44" and "cab-2891f49d" alike, and both have 3 bind poses, so which CAB it is stays Provisional until its renderer's pointer is read. Each mesh's bind poses equal its renderer's bones, which the writer asserts: "Face" has 3, "Face_Eye" 1, "Brow" 1 and "EyeStar" 2 (Exact). "Face", "Face_Eye", "Brow" and "EyeStar" draw the one material "Avatar_Girl_Sword_PlayerGirl_Mat_Face", so they share one shading and one face threshold. "EyeStar"'s UVs sit at 0 to 0.03, so it samples the face material's "_MainTex" at its corner. "EffectMesh" (110 vertices) draws the generic "miHoYoDiffuse" material, which the dump gives no textures for, so it is left out: the effect shell (an untextured placeholder material) is not drawn; the effects that fill it are not built. Whether the game draws "Face_Eye" and "Brow" through a stencil pass, so the brows show through the hair, is not yet read from a program and is not built. Which LOD the game draws up close is Provisional: the prefab's root carries no LODGroup, and the renderer that binds each LOD is not yet identified. The textures are 1024 with a full 11-mip chain, and no other block holds a higher mip (Exact).

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
- **A pack's light area and band width are derived, not fitted.** A pack's toon is drawn for MMD's lookup, which reads it down its whole column at `0.5 + 0.5 * (N . L)`. Under the flat lightmap the threshold runs linearly in `N . L` from `z(-1)` to `z(1)`, so the defaults take the light area `W = z(1) = (0.5 + 0.5 + 0.4975) / 2` and the band width `w = 0.4975 / W`, and the column is then MMD's exactly, the clamp never reached. A pack is drawn as its own toon was authored, and no material value is copied.
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
- `Lm`: "_LightMapTex". Its red is the specular's weight (Exact: the specular term multiplies by it) and the source of the metal mask (Provisional, see the metal gate), its green the toon threshold only, its blue the specular's gate, and its alpha the region. The green is not read by the emission (Exact).
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

`z` is the toon threshold, with its three branches read from the program's compare chain (Exact on the form, Provisional on the vertex input "v1.x" as the vertex colour's AO). The sun term `N_v` is a half Lambert with a scale just under a half (Exact): the body's program takes it per pixel from its shading normal and the light's direction, and the vertex programs that hand it to the hair's write the same form:

```
N_v = 0.4975 * (N . L) + 0.5
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
E    = ("_MainTexAlphaUse" == 2 and a_M > 0.01) ? a_M : 0
C0   = lerp(Lit, Em, E)
Spec = step(1 - Lm.b, pow(max(N . H, 1e-5), "_Shininess")) * Lm.r * "_SpecularColor" * "_SpecMulti"
C    = (C0 + "_SpecualrInShaow" * Spec * brightness) * "_LightColor0".rgb
```

The emission's factor `E` is the main texture's alpha, gated, and not the lightmap's green. The program adds a dissolve term to it, which is zero while "_DissolveValue" is zero, and the body's values set "_MainTexAlphaUse" to two (Exact on the gate and the factor's form; Provisional on whether a pack's diffuse alpha ever holds the emission). A material whose alpha use is not two has no emission at all, so a pack that does not set it draws its lit colour alone.

`H` is the half vector of the view and the light, and `N` is "v7" (Exact on its form). The specular's own weight is "_SpecualrInShaow", added, not an attenuation of the specular. The light factor `f` is "min(2 * _LightColor0.w, 1)" where "mhy_AvatarLightDir.w" exceeds 0.5, and 1 otherwise, and it scales the specular and the lit colour in the branch that tests it (Provisional on its meaning). The main light's colour scales the lit colour and the specular, and not the emission (Provisional on the order; the material leaves `f` out, since the world's light carries no strength beside its colour). The rim and hit terms ("_ElementRimColor", "_HitColor") are added after this (Provisional on the order). The outputs use `C` through the desaturation below.

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

## The face

The face is not shaded on the body's ramp. Its shadow is its face map compared with a threshold that turns with the light, and both the threshold and the flip of the face map are set once a frame on the CPU from the light and the face's root bone. The shadow colour is set per pixel, and its equations are below.

### The light's angle to the root bone

Let `L` be the main light's direction, the same the body is lit by, and let `A` and `B` be the root bone's local Y and Z axes in world space, the root bone's world rotation applied to the unit vectors `(0, 1, 0)` and `(0, 0, 1)`. Then with `a = L · A` and `b = L · B`:

```
angle = -atan2(b, a)                       in degrees, when a ≠ 0
angle = +90 if b < 0, otherwise -90        when a = 0
t     = |angle| / 180
```

### The threshold

With `lo = max(_FaceMapRotateOffset, 0)` and `hi = min(_FaceMapRotateOffset + 1, 1)`:

```
s         = saturate((t - lo) / (hi - lo))
threshold = clamp(s * s * (3 - 2s), 1e-4, 0.9999)
```

A light straight along the root's Y axis gives the minimum, `1e-4`, and a light from the opposite side gives the maximum, `0.9999`. The threshold stands where the page's depth term stood, and is what the face map's texel is compared against.

### The flip

`flip = angle > 0`, unless `_FaceFlipFactor` decides it: above one half the flip is on, below minus one half it is off. The face map is then sampled at the raw UV, with its u mirrored where the flip is on:

```
uv = (flip ? 1 - uv.x : uv.x, uv.y)
```

### The shadow's lookup

With the face map's texel `T` at that UV, which is its alpha, not its red (Exact: the program samples "t2" into a destination's `.w`), the softness window `s = max(_FaceMapSoftness, 1e-6)`, and the threshold above:

```
lo = clamp(threshold - s, 1e-4, 0.9989)
hi = min(threshold + s, 0.9999)
F  = smoothstep(0, 1, saturate((T - lo) / (hi - lo)))
```

A face with no face map is lit, so `F` is one.

The face map holds the nose's two flanks at its two ends, one always in shadow and the other always lit, so the nose shows a small mark at every light angle: a dark one in front light, as the character screen draws it ([Hydro Lumine on the character screen](https://www.youtube.com/watch?v=KPlvZW6udfk), 0:18), and a light one with the light behind, where the rest of the face is in shadow. A pale dot on the nose of a back-lit face is that lit flank, not a fault in the lookup.

### The shadow colour

The face's colour is the material colour blended toward white by the lookup, over the face's shadow colour. With `Cm` the material colour on the main texture and `F` the lookup above (Exact, from the pixel program):

```
C = Cm * mix(S, 1, F)
```

`S` is the pixel's region's first shadow colour, read from the lightmap's alpha as the body's region is: `_FirstShadowMultColor` for region one and `_FirstShadowMultColor2` to `5` for regions two to five. Where `_UseCoolShadowColorOrTex` is set, `S` is mixed toward the cool shadow colour of the same region, `_CoolShadowMultColor` (and `2` to `5`), by the colour tone:

```
S = mix(S, S_cool, tone)    where _UseCoolShadowColorOrTex is set
```

A face in shadow therefore takes its shadow colour and is never black. The tone is the body's cool tone, which the avatar does not yet drive, so the cool colour weighs nothing until it is set.

## The outline

The outline is the face's "OUTLINE" pass, whose base programs are vertex 958 (DXBC) and pixel 885 (DXIL). The width is set in the vertex program and the colour in the pixel program.

### The width (vertex 958)

The vertex program moves each vertex in view space, before the projection: along its ray from the eye by an offset, then along its screen normal by a width `W`. The depth term `D` picks one of three knots of "_OutlineWidthAdjustZs", and the scale is read from the matching knots of "_OutlineWidthAdjustScales" (Exact on the operators and the knot selection):

```
k  = 2.414 / cb2[7].y                       (the projection's y scale)
D  = -k * z                                 (z the view-space depth)
(Z0, Z1, S0, S1) = (Zs.x, Zs.y, Sc.x, Sc.y) if D < Zs.y, else (Zs.y, Zs.z, Sc.y, Sc.z)
t  = saturate((D - Z0) / max(Z1 - Z0, 0.001))
s  = t * (S1 - S0) + S0
W  = T_w * s * "_OutlineWidth" * "_OutlineCorrectionWidth" * v1.w * 0.41425
V.xy += normalize(vec3(T_view.xy, 0.01)).xy * W     (V the view-space position, T_view the view-space tangent)
```

The push is along the vertex's tangent, not its normal (Exact on the input): the program carries its NORMAL input only to the lit normal it hands on, and its TANGENT, skinned and taken to view space by the object and view matrices, is the direction it pushes along. The game keeps each vertex's outline direction in its tangent.

`T_w` is the blue channel of texture "t0" sampled at the vertex's second texture coordinate, at lod 0 (Exact on the channel and the lod; Provisional on the texture's name, which the slot table does not yet give). The GPU-skinned variants, which read their bone palette from "t0" by the vertex's bone indices ("_VSSKinningParam"), read no width texture and have no `T_w` (Exact); both kinds push along the tangent. `v1.w` is the vertex's colour alpha, so a vertex with none is not pushed out at all.

The offset comes first, along the ray from the eye, not along the normal (Exact):

```
f = (_OutlineOffsetBlockBChannel < 0.5) ? (v1.z - 0.5) : 1
V += normalize(V) * "_MaxOutlineZOffset" * 0.01 * f
```

A flag of zero with a blue of a half offsets nothing, so a face vertex is not pushed out by it. "_OutLineZOffset" (cb0[31].x) biases the clip depth where a facing test is negative; it is not built, and the outline's depth is the projection's.

The code (`createGameOutlineMaterial`, `getGameOutlineOffset`, `createAvatarShadingInputs`) takes the knots, the vertex weight, the offset and the flag from the game, in the program's view-space form: the push is the skinned tangent carried to view space by the model view matrix, since three's view normal and tangent turn inward on the back side the outline draws, the offset is the pure equation `getGameOutlineOffset`, and the width is `"_OutlineWidth" * 0.41425` weighted by the alpha, with no `T_w`, as the GPU-skinned variants draw it, and "_OutlineCorrectionWidth" taken as 1 where a material holds none. The pack's outline is the world's own, unchanged, in clip space.

### The colour (pixel 885)

The outline's colour is the material's colour times the outline colour, then mixed toward a shade colour by a mask (Exact on the first product and the mix's form; Provisional on the shade colour's source and on the mask):

```
Oc = "_Color" * "_OutlineColor"                  (the default region's branch)
Sh = 0.2 * T_s                                   (T_s the rgb of texture "t1" at the pixel's coordinates)
C  = Oc + m * (Sh - Oc)                          (m the region's mask, read from the layout as a per-region value)
```

The output colour uses the same tone form as the body's "o1": `O1 = 0.5 + (C_d - 0.5) * (1 + K)` with `C_d` the desaturation of `C`, where "_DesaturateScale" and "_ContrastScale" are read from the same registers as the body's (Exact).

The code takes `Oc` as the outline colour for every pixel, tone-mapped as the body's is, and does not yet read the shade texture, the mask, or the regions' "_OutlineColor2" to "5": the mix toward the shade is not built, so an outline here is one flat colour.

Nothing in the outline's equations has been fitted to a rendered outline, so no number is claimed for its width or colour.

## The deferred lighting pass's character branch

The pass is "Hidden/Internal-DeferredShading", in the block "00/00612967.blk", exported raw as one shader with 765 programs. The parser reads all of them, its pass trailer being one word or two. Its character programs are the 34 pixel programs keyed by "HAS_CHARACTER_LIGHT". None of them carries "DEFERRED_TOON_ON", so that keyword marks no character program and does not pair with the character set.

Program 394 (keywords "ELEMENT_VIEW_ON", "HAS_CHARACTER_LIGHT", "MHY_SHADER_HIGH", DXBC) is the chosen base: the first of the fewest-keyword character sets.

- The material byte is G-buffer channel t7.x, times 255, plus 0.5, as unsigned, with bit 6 cleared (Exact on the arithmetic). Which target that channel is bound to is Provisional, since the binding is set by the game's C#.
- The character gate tests that byte against 20, 12 and 5 (Exact on the comparisons). A low nibble of channel t9 is tested against 15 separately. Which material each value names is Provisional.
- The lit term the gate selects is C_branch = r6 * T10 * cb0[158].x + r14, where T10 is texture t10 at the pixel and r16 is r2 scaled by r3.w when the byte is not 20 (Exact on the arithmetic, Provisional on what r6 and r14 represent).
- Not read: the light loops over the t23 index list (lines 641 to 928 and 933 to 1275), the shadow samples from t21 and t22, and the final output (lines 1292 to 1516), which is not yet traced to C_branch. So the sun, ramp and ambient sum for a character pixel is not written.

## Inputs, and where each comes from

| Input                                                   | Lumine's value, from the game                                                              | What a player's MMD pack supplies in production                                                           | Default when the pack does not supply it                                                     |
| :------------------------------------------------------ | :----------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| Main texture "_MainTex"                                 | "Body_Diffuse", 1024 x 1024                                                                | The pack's diffuse texture for the material                                                               | The material's "_Color"                                                                      |
| Lightmap "_LightMapTex" (metal, shadow, region)         | "Body_Lightmap", 1024 x 1024                                                               | Nothing. A PMX file has no lightmap channel                                                               | A proposed flat lightmap, red 0 (never metal), green 0.5, alpha 0 (region 1), not yet fitted |
| Metal map "_MTMap" and its colours                      | The body's "_MTMap", and "_MTMapLightColor", "_MTMapDarkColor" from `inventory-values.txt` | Nothing directly. The pack's sphere map is the nearest stand-in and is not the same input                 | The grey metal map, and the body's colours from the inventory                                |
| Packed shadow ramp "_PackedShadowRampTex"               | "Body_Shadow_Ramp", 256 x 20                                                               | The pack's toon texture, read up its one column as the ramp's row (Provisional: one row for every region) | The world's shared toon ramp ("toon01" to "toon10")                                          |
| Specular "_SpecularColor", "_Shininess", "_SpecMulti"   | The body's values from `inventory-values.txt`                                              | The pack's specular colour and power                                                                      | The body's values from the inventory                                                         |
| Outline "_OutlineColor", "_OutlineWidth"                | The body's values from `inventory-values.txt`                                              | The pack's edge colour and size; an official release sets none, so the world's outline                    | The body's values from the inventory                                                         |
| Region colours "_Color2" to "_Color5" and their toggles | The body's values from `inventory-values.txt`                                              | Nothing. A PMX file has one diffuse per material                                                          | The body's values from the inventory, with the region toggles off                            |
| Keywords                                                | The four sets above                                                                        | Fixed by the material's type, not by the pack                                                             | The body's set                                                                               |

The values in the Lumine column are the game's own, read from its material bytes. They are not committed here as numbers; `inventory-values.txt` is the extracted record. A player's pack supplies only what its own file holds, so for a production pack the regions and the lightmap take their defaults.

In development the Traveler's model reads these from the game's own values in `avatar.json`, not from a pack: the main texture, lightmap, metal map, packed shadow ramp and face map by their slots; the colours `_Color` and `_Color2` to `_Color5`, the metal colours and `_SpecularColor`; the floats `_Shininess`, `_SpecMulti`, `_LightArea`, `_ShadowRampWidth` and `_FaceMapSoftness`; the three `_UseLightMapColorAO`, `_UseVertexColorAO` and `_UseVertexRampWidth` switches; and the region toggles `_UseMaterial2` to `_UseMaterial5`. A value a material does not hold keeps its default, and a toggle it does not hold is off. The outline reads the game's own edge colour, width, width knots and offset, as "The outline" section sets out; its region colours are not yet read.

### Brightness, fog and tone (read off the body's program)

The body's program is "Shader#0" of the layout's shader export, with 693 compiled variants (Exact on the counts; the register is the variant's header and its instructions).

- **The brightness is a plain multiply, Exact.** 240 of the 693 variants read "_ES_CharacterMainLightBrightness" (`cb0[269].x` in each header), each as a single `mul` on the lit colour and on the specular term (the first `mul` into `r11` and the `mul` on `cb0[269].x` before the `movc`). The value is not on the material: the body's saved properties hold no "_ES_CharacterMainLightBrightness", and no extracted dump carries it (Exact on the absence). Its value is the game's own and is not read, so the world takes 1 (Provisional: a game-set value below 1 would be missing from the lit colour).
- **No fog reaches the body's program, Exact.** None of the 693 variants reads a fog constant. The shader's properties declare "_FogStart", "_FogEnd", "_FogDensity" and "_FogColor", but no compiled variant reads them, so the game's body draws without fog. The world's height fog is a depth pass in the post pipeline (`createHeightFogNode`, `createPostPipeline`), applied to every scene pixel with depth below 1, the avatar's included. Whether the game's own post pass fogs characters is not read (Provisional).
- **The haze at the close-up is zero, Exact on the form.** The fog's integral starts at the world's start distance, so a pixel nearer than that gets no haze. At 3 m the factor is 0.0000% for every setting that sets a density: Windrise (start 60 m, density 0.0024, falloff 0.02) and the login's sky states (start 10 m, densities 818 to 339400, falloffs 0.12 to 1.16), both level and tilted 10 degrees up. The evaluation is of the form `createHeightFogNode` writes, at the eye's height of 1.5 m, with the world's unit taken as the metre (the ground tiles are 1024 metres, Provisional on the unit). So the fog does not reach a close-up.
- **The tone curve is the game's, Exact on the code path.** Both canvases pass the renderer's `GENSHIN_TONE_MAPPING`, which is `NoToneMapping`, and the post pipeline ends every pixel on `toneMapGenshinNode`, the avatar's included. Three's ACES Filmic is the canvas's default only where a canvas omits the prop, and none does. Against three's ACES Filmic, per channel on a grey, the game's curve gives 0.179 against 0.032 at scene 0.05, 0.335 against 0.213 at 0.18, 0.535 against 0.558 at 0.5, 0.702 against 0.763 at 1 (white, the sides differ by 0.061), and 0.968 against 0.952 at 4. The two cross near scene 0.5, so the shadows of the game's curve are lighter and its highlights darker than ACES. The game's own curve on characters is not read (Provisional).

### The colour space of each texture, per slot (Derived, Provisional)

A texture decodes as sRGB only where the shading multiplies the colour in the space the colour lives in. The game's bundle carries no colour-space field (the Texture2D exports hold no such field in any of the thirteen avatar textures, and their formats are BC7 or RGB24, which name no sRGB variant), so the rule comes from how the program uses each sample, and both pipelines the game could be built on give the same answer:

- **A gamma-space project** ignores the sRGB flag, and the program computes `main_g x ramp_g`. In linear terms that is `main_lin x ramp_lin`.
- **A linear project** gives a colour texture the default sRGB import, so the same product comes out as `main_lin x ramp_lin`.

The only case where a ramp stays raw is an artist painting it in linear values, and nothing in the data points to that. So the colour slots decode as sRGB: "_MainTex", "_PackedShadowRampTex", "_MTMap" (the metal map's matcap colour) and any ramp. The data slots are read as they are stored: "_LightMapTex", "_FaceMapTex", the face shadow, the masks and the noise, whose values are thresholds, distances or channels. Each slot's entry in `AVATAR_TEXTURE_SLOTS` carries this flag. Provisional until a game frame confirms the ramps.

## Open

- **The colour space of each texture** is settled by the per-slot rule above, Provisional until a frame confirms it.
- **The shade term's `z` and `w`.** Their expressions are read; their fitted values are not.
- **The lit colour `C`.** The sum of the main colour, the ramp, the sun, the sky ambient, the specular and the rim is not yet assembled into one expression.
- **Hair constants.** The hair equations are written; the face's threshold and flip are read from the game's own light and root bone.
- **The deferred pass's character branch.** The gate and C_branch are written; the light loops, the shadow terms and the final output are not traced, so the light sum is not written. The byte's target is Provisional.
- **The metal gate.** The body variant read for the emission and the specular uses no metal constant, so the "Lm.r > 0.9" gate and the matcap are not confirmed by it; they stay Provisional until a variant that reads "_MTMap" is traced.
- **The register-to-texture binding.** The order the parameter table lists the textures is used for the bindings above; a check against a rendered frame is still to be made.

Related: [drawing a character](/docs/genshin/characters/drawing), [derived assets](/docs/genshin/derived-assets), [game data formats](/docs/genshin/game-data-formats).
