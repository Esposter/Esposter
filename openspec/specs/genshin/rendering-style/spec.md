## Purpose

Genshin's anime environment look on three's WebGPU renderer. Light falls on a painted ramp rather than a physical curve, shade is the sky's colour, a rim catches the lit edges, and outlines run around every object but the ground, thinning with distance. The sun casts through fading cascades. After the scene, screen-space occlusion darkens creases where a scene asks for it, god rays march through a shadow of their own, a height fog hazes the far and the low in the sky's colour, bloom lifts the brightest light, and a colour grade and temporal anti-aliasing finish the frame. Development has a tuning panel over all of it.

## Requirements

### Requirement: Surfaces step between lit and shade in a narrow band

The world's surfaces SHALL step from lit to shade across a narrow painted band rather than falling off along a physical curve.

#### Scenario: A surface turning from the sun steps into shade

- **GIVEN** a surface is lit by the sun
- **WHEN** it turns away from the sun
- **THEN** it passes from lit to shade across a narrow band
- **AND** the shade is not a smooth gradient toward black

### Requirement: Shadow is coloured by the sky and the ground

Shadowed surfaces SHALL take the colour of the sky above and the ground below rather than darkening toward black.

#### Scenario: A shaded face reads as sky above and ground below

- **GIVEN** a face lies in the sun's shadow
- **WHEN** the frame is shown
- **THEN** the face reads in the sky's blue
- **AND** its lower part picks up the ground's green

### Requirement: Lit silhouette edges catch a sky rim

Silhouettes SHALL catch a rim of sky light along the edge the sun lights.

#### Scenario: A silhouette's sunlit edge gains a rim

- **GIVEN** a silhouette stands against the sky with its edge facing the sun
- **WHEN** the scene is shown
- **THEN** the sunlit edge shows a rim tinted by the sky
- **AND** the rim's colour and strength change through the day with the sky

### Requirement: Outlines hug every object but the ground

Every object except the ground SHALL be drawn with an ink outline whose width thins with distance.

#### Scenario: A near object keeps its outline

- **GIVEN** an object stands near the viewer
- **WHEN** the frame is shown
- **THEN** the object has a full outline around its silhouette

#### Scenario: A distant object keeps a fine line instead of ink

- **GIVEN** an object lies far from the viewer
- **WHEN** the frame is shown
- **THEN** its outline thins with distance
- **AND** it keeps a fine line rather than turning to a heavy ink mass

#### Scenario: The ground has no outline

- **GIVEN** the ground is in view
- **WHEN** the frame is shown
- **THEN** no outline is drawn around the terrain

### Requirement: The sun casts crisp near shadows and soft far shadows

The sun SHALL cast shadows that are crisp near the viewer and softer far away, with no visible seam where neighbouring bands of shadow meet.

#### Scenario: Near shadows are crisp and far shadows soft

- **GIVEN** the sun lights a scene with objects both near and far
- **WHEN** the viewer looks at their shadows
- **THEN** the shadows near the viewer have sharp edges
- **AND** the shadows far away have soft edges

#### Scenario: Neighbouring shadow bands blend without a seam

- **GIVEN** two bands of shadow meet at a distance
- **WHEN** the frame is shown
- **THEN** the meeting between the bands is blended rather than a hard line

#### Scenario: A shadow follows a moving enemy

- **GIVEN** an enemy stands in the sun
- **WHEN** the enemy walks a short way
- **THEN** its shadow moves with it

### Requirement: Terrain casts shadows only within the shadows' reach

Terrain SHALL cast shadows only within the reach of the sun's shadows, so that a hill shades the slope behind it when the sun is low.

#### Scenario: A hill shades the slope behind it at low sun

- **GIVEN** the sun is low in the sky
- **WHEN** a hill stands between the sun and a slope
- **THEN** the slope behind the hill lies in shadow

#### Scenario: Terrain beyond the shadows' reach casts no shadow

- **GIVEN** terrain lies past the reach of the sun's shadows
- **WHEN** the frame is shown
- **THEN** that terrain is lit by the sun
- **AND** it casts no shadow

### Requirement: Screen-space occlusion darkens creases on the highest tier only

A scene that asks for screen-space occlusion SHALL darken creases, recesses and the foot of walls on the highest quality tier, and SHALL darken nothing on the lower tiers.

#### Scenario: Creases darken on the highest tier

- **GIVEN** a scene asks for occlusion
- **AND** the highest quality tier is selected
- **WHEN** the frame is shown
- **THEN** creases, recesses and the foot of walls take less light

#### Scenario: Lower tiers draw no occlusion

- **GIVEN** a scene asks for occlusion
- **AND** a lower quality tier is selected
- **WHEN** the frame is shown
- **THEN** no darkening from occlusion appears

### Requirement: God rays show light shafts only where a scene asks for them

A scene that asks for god rays SHALL show light shafts through the air where the sun lights it, on every tier except the lowest.

#### Scenario: Light shafts show through the air

- **GIVEN** a scene asks for god rays
- **AND** a tier above the lowest is selected
- **WHEN** the sun lights the air between the viewer and the scene
- **THEN** light shafts show through that air in the sun's colour

#### Scenario: The lowest tier draws no god rays

- **GIVEN** a scene asks for god rays
- **AND** the lowest quality tier is selected
- **WHEN** the frame is shown
- **THEN** no light shafts appear

#### Scenario: A scene that does not ask for god rays shows none

- **GIVEN** a scene does not ask for god rays
- **WHEN** the frame is shown
- **THEN** no light shafts appear

### Requirement: Height fog hazes the far and the low in the sky's colour

Distant and low ground SHALL fade toward the sky's colour while the peaks stand clear of the haze, and the sky itself SHALL NOT be hazed.

#### Scenario: Far ground fades toward the sky's colour

- **GIVEN** a surface lies far from the viewer
- **WHEN** the frame is shown
- **THEN** the surface fades toward the sky's colour

#### Scenario: Low ground thickens while the peaks rise out of it

- **GIVEN** the viewer looks across a valley toward peaks
- **WHEN** the frame is shown
- **THEN** the low ground is hazed thick
- **AND** the peaks rise clear of the haze

#### Scenario: The sky is not hazed

- **GIVEN** fog is on in the scene
- **WHEN** the sky is shown behind the scene
- **THEN** the sky keeps its own colours unchanged

### Requirement: Bloom glows only the brightest light and only where asked

Bloom SHALL add a glow only to light brighter than nearly white, and only in a scene that asks for it.

#### Scenario: The sun glows in a scene that asks for bloom

- **GIVEN** a scene asks for bloom
- **WHEN** the sun or elemental light is in view
- **THEN** that light glows

#### Scenario: Ordinary lit surfaces do not glow

- **GIVEN** a scene asks for bloom
- **WHEN** an ordinary lit surface is shown
- **THEN** the surface does not glow

#### Scenario: A scene without bloom shows no glow

- **GIVEN** a scene does not ask for bloom
- **WHEN** the sun is in view
- **THEN** no glow appears around it

### Requirement: The frame ends on the game's tone curve and measured colours show as measured

The frame SHALL end on the game's own tone curve, and a sky colour measured off a reference SHALL show as that measurement.

#### Scenario: A measured sky colour shows as measured

- **GIVEN** a sky colour was measured off a reference screenshot
- **WHEN** the sky is shown at the moment of that reference
- **THEN** the colour on screen matches the measurement

#### Scenario: Deep night keeps its reds visible

- **GIVEN** it is night and a red stone stands in the light
- **WHEN** the frame is shown
- **THEN** the red still shows rather than crushing to black

### Requirement: Each region's colour grade shifts its contrast, saturation and tints

Each region SHALL apply its own colour grade after tone mapping, shifting its contrast, saturation and its tints of shadow and highlight.

#### Scenario: Windrise's shade reads cool and its light reads warm

- **GIVEN** the world is set in Windrise
- **WHEN** a shaded area and a sunlit area are shown side by side
- **THEN** the shaded area reads cool
- **AND** the sunlit area reads warm

#### Scenario: A region without a grade shows the frame ungraded

- **GIVEN** a region sets no grade
- **WHEN** the frame is shown
- **THEN** the frame reaches the screen with no colour shift added

### Requirement: Edges stay steady on the higher tiers

Edges SHALL be smoothed on every tier, and on the higher tiers thin outlines and leaf edges SHALL hold steady while the camera moves.

#### Scenario: Thin outlines hold steady on a higher tier

- **GIVEN** a tier that pays for temporal anti-aliasing is selected
- **WHEN** the camera moves across thin outlines and leaf edges
- **THEN** those edges do not shimmer

#### Scenario: A lower tier smooths edges one frame at a time

- **GIVEN** a lower quality tier is selected
- **WHEN** the frame is shown
- **THEN** its edges are smoothed within each frame alone

### Requirement: Quality steps down in detail and never removes the style

Lowering the quality tier SHALL reduce detail and cost, and SHALL NOT remove the banded lighting, the rim or the outlines.

#### Scenario: The lowest tier keeps the style

- **GIVEN** the lowest quality tier is selected
- **WHEN** the world is shown
- **THEN** the banded lighting, the sky rim and the outlines still show

#### Scenario: A tier change applies when the scene next loads

- **GIVEN** a scene is already mounted
- **WHEN** the quality tier is changed
- **THEN** the change takes effect the next time the scene mounts

### Requirement: Development offers a live tuning panel and production shows none

In a development build the look SHALL be tunable live from a panel, and a production build SHALL show no tuning panel.

#### Scenario: A developer tunes a value live

- **GIVEN** a development build is running
- **WHEN** the developer moves a look slider
- **THEN** the frame changes at once

#### Scenario: Tuned values are not kept across a reload

- **GIVEN** the developer has tuned the look
- **WHEN** the page reloads
- **THEN** the look returns to the values the scene defines

#### Scenario: A production build shows no tuning panel

- **GIVEN** a production build is running
- **WHEN** the world opens
- **THEN** no tuning panel appears

#### Scenario: An automated browser run shows no panel over the frame

- **GIVEN** a browser driven by automation loads the world
- **WHEN** the frame is captured
- **THEN** no inspector panel covers the frame
