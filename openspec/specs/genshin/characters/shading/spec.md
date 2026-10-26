## Purpose

How the game's Character_Base_Uber material lights Lumine's body, as equations read from the program that draws it, each tagged Exact or Provisional, with the inputs a player's pack can supply and the defaults for the rest.

## Requirements

### Requirement: Lumine's body

Lumine's body SHALL draw each part in the colours of the region its lightmap alpha selects, with that region's own colour and emission.

#### Scenario: A part in a region whose toggle is on takes that region's colours

- **GIVEN** the second region's toggle is on for Lumine's material
- **WHEN** the body is drawn where its lightmap alpha is at least 0.8 (`packages/genshin-engine/src/character/shading/constants.ts`, `REGION_FLOORS`, two at 0.8)
- **THEN** the body takes the second region's colour and emission
- **AND** a part in a region whose toggle is off keeps the first region's colours

#### Scenario: A material with no region toggle on draws in the first region only

- **GIVEN** no region toggle is on for Lumine's material
- **WHEN** the body is drawn anywhere on its surface
- **THEN** every part of the body takes the first region's colour and emission

### Requirement: A player's pack

A player's pack SHALL shade the body along its own toon column, with no value copied from the game's material.

#### Scenario: A pack with a toon and no lightmap shades the body with the flat default lightmap

- **GIVEN** a player's pack supplies a toon texture and no lightmap
- **WHEN** the body is drawn
- **THEN** the toon is read down its one column as the shade's lookup
- **AND** the flat default lightmap sets the threshold (`packages/genshin-engine/src/character/shading/constants.ts`, `NEUTRAL_LIGHT_MAP_GREEN`)

#### Scenario: The default light area and band width read the toon's whole column

- **GIVEN** the pack sets no light area and no band width (`packages/genshin-engine/src/character/shading/constants.ts`, `DEFAULT_LIGHT_AREA` and `DEFAULT_RAMP_WIDTH`)
- **WHEN** the shade lookup runs across the full range of the light
- **THEN** the lookup reaches the end of the column without clamping

### Requirement: Lumine's body (2)

Lumine's body SHALL draw without fog, so a close-up keeps its colour.

#### Scenario: A close-up of the body shows no haze in any sky state

- **GIVEN** the body is viewed from 3 metres away
- **WHEN** the sky is in any of the settings that set a fog density
- **THEN** no haze is added to the body

### Requirement: Lumine's face

Lumine's face SHALL turn its shadow with the light's angle to her head, and a face with no face map SHALL stay lit (`packages/genshin-engine/src/character/shading/updateFaceDraw.ts`, `packages/genshin-engine/src/character/shading/createFaceShadeNode.ts`).

#### Scenario: The face's shadow edge moves as the light turns around the head

- **GIVEN** Lumine's face has its face map
- **WHEN** the light turns from in front of her head to behind it
- **THEN** the face's shadow edge moves across the face
- **AND** the nose keeps a small mark at every light angle

#### Scenario: A face with no face map is lit in full

- **GIVEN** a face has no face map
- **WHEN** the face is drawn under any light
- **THEN** the face is lit in full

### Requirement: Lumine's outline

Lumine's outline SHALL be drawn in her region's colour, toned as her body is (`packages/genshin-engine/src/character/shading/createOutlineColorNode.ts`).

#### Scenario: An outline with no region toggle on draws in the outline colour

- **GIVEN** no region toggle is on
- **WHEN** the outline is drawn
- **THEN** the outline takes the outline colour

#### Scenario: An outline in a region with a toggle on is drawn toward the main texture

- **GIVEN** a region's toggle is on
- **WHEN** the outline is drawn in that region
- **THEN** its colour is drawn toward a fifth of the main texture, by the region's own intensity

### Requirement: Where a player's pack supplies no value, the body

Where a player's pack supplies no value, the body SHALL take the game's own value for it, and a region toggle it lacks SHALL stay off.

#### Scenario: A pack that sets no region colours leaves the region toggles off

- **GIVEN** a player's pack sets no region colours
- **WHEN** the body is drawn
- **THEN** the region toggles stay off
- **AND** the body's values from the game's inventory apply

#### Scenario: A material that holds no value for a field keeps its default

- **GIVEN** a material holds no value for a field
- **WHEN** the body is drawn
- **THEN** that field takes its default (`packages/genshin-engine/src/character/createCharacterShadingInputs.ts`, which fills each default in)

## Open

- [ ] **Lumine's body draws without fog** — no source yet: `packages/genshin-engine/src/post/createPostPipeline.ts` applies the height fog to every pixel with depth below 1, the avatar's included (the design's own account), so no code path excludes the body and the requirement is not built as written.
- [ ] **A close-up of the body shows no haze in any sky state, at 3 metres** — no source yet: the evaluation of `createHeightFogNode` at the Windrise and login settings, which no test or script commits.
- [ ] **The nose keeps a small mark at every light angle** — no source yet: the face map's two flank texels at its two ends are not read from the texture.
- [ ] **A face with no face map is lit in full** — no source yet: the no-map branch of `createFaceShadeNode.ts` is not traced.
- [ ] **The outline's colour is drawn toward a fifth of the main texture, by the region's intensity** — no source yet: no 0.2 literal in `createOutlineColorNode.ts` or `shading/constants.ts`, and pixel 885's use of it is not traced.
- [ ] **A pack's toon is read down its one column as the lookup, with the flat default lightmap as the threshold** — no source yet: the pack path through `createCharacterShadingNode.ts` is not traced.
- [ ] **The default light area and band width keep the lookup from clamping across the light's full range** — no source yet: a computed trace at the defaults; no test asserts it.
- [ ] **A pack's region toggles stay off, and its values come from the game's inventory** — no source yet: the code path that fills a pack's material from the inventory record is not traced, and `createCharacterShadingInputs.ts`'s own defaults (brightness 1, contrast and desaturate 0) are not the inventory's values.
- [ ] **A pack without a lightmap takes the flat default lightmap of red 0, green 0.5 and alpha 0** — no source yet: the flat lightmap's red and alpha are not traced to a constant.
