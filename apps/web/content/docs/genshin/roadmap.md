---
title: Roadmap
description: Open work for Genshin's opening, biggest gap first — the login towers' carving and gold, the clouds' cover and kind, each hour's light through the game's deferred pass and its sky, where the parts stand, the door's and the walkway's surfaces, the login's music's lowest band, and the references and measures the rest waits on.
---

# Roadmap

Open work only, the biggest gap to the game first. What was decided against is in [deferred](/docs/genshin/deferred); read it before adding an item. Each item names the measure that says it is done: the login's stand-ins are judged against the game's own exports drawn beside them (`genshin:parity rank`'s second table), the towers' carving by their structural similarity there as well as their FLIP, its clouds by their statistics (`genshin:parity clouds`), and everything else by `compare` against its reference, checked by eye ([parity](/docs/genshin/parity)).

## Next

- [ ] **The login towers' carving, as the game carves it.** The towers carry their traced surfaces ([login screen](/docs/genshin/login-screen)): each band's tone, the paint, the recesses, the gilding and the open colonnades. What a lathe still cannot show:
  - [ ] The lantern tower's crown stands as an open colonnade of columns and arches over an inner wall; ours is a solid drum painted with them.
  - [ ] Relief that tilts the light along a recess's edge: neither three's bump map over the atlas nor over a blurred height canvas of the layers' depths moved the towers against the exports, and the traced colours score best drawn a quarter as far from the stone, so the relief the game lights is its geometry's: carved geometry of our own, the crown's colonnade first.
  - [ ] The stone's grain: the exports' diffuse noise reads as a fine texture on every face, ours as flat paint. A procedural grain of our own, fitted to its scale and contrast.
  - [ ] Gilding as metal: drawn as metal it read dark at every hour, since nothing reflects the sky into it. It waits on an environment map of the login's sky.
- [ ] **The clouds' kind.** The dawn's and the dusk's cover is solved on their frames (`genshin:parity cover`); the day's and the night's waits on their clouds' kind, since more of them scored those frames worse.
  - [ ] The day's clouds read grey where the recording's are white, about twice their clear sky's brightness against two and a half, and the colour solve (`genshin:parity clouds`) scored the day worse; the night's read dark against the recording's pale ones. Their colours, then their cover.
  - [ ] The day's horizon: the recording's sky is cloud within 8 degrees of it, ours about three fifths, its haze washing our low clouds into the clear sky; the dawn's overhead holds twice the recording's cover however few top clouds it draws, the cloud sea's nearest billows standing up past 25 degrees.
  - [ ] A cloud's inside: the recordings paint a lit crown grading into a pale shade, with cirrus wisps between; ours fill with two flat colours.
- [ ] **Each hour's light, through the game's own deferred pass.** The stone's shader only writes the G-buffer, and `Hidden/Internal-DeferredShading` lights it ([game data formats](/docs/genshin/game-data-formats)): the sun's colour through a toon ramp at a half plus half the facing to the sun by the shadow raised to a fifth, the sky's spherical harmonics graded by the occlusion, the reflection cube on upward smooth faces and a GGX highlight. Solving our lights' strengths ran away because that model has none of it, haze or ramp. The pass is ported into the witness first, then its run-time inputs — the ramp, the harmonics, the sun — are solved per hour as linear unknowns over the witness's G-buffer, then our stone is lit the same way; the rim glow's pixels, which the pass lights as shading model 13, are read in the same port.
- [ ] **Each hour's sky, solved with its clouds.** A clear sky solved alone stands darker than the recordings' sky reads as a whole, which is mostly cloud, and scored the night worse. The cloud mask now fits each sky's clear sky under its clouds (`fitClearSky`), the clear pixels a solve of the sky reads.
- [ ] **Where the parts stand.** The silhouettes' placement and pose is a large term on every frame. `place` on edges runs a row metres up, so the row's offset and each tower's place need a measure on the sky's outline against each part's instead.
- [ ] **The door's surface at rest.** On the phone's door frame the door is the largest stand-in gap against its exports: its panel's relief is painted, at three fifths of its read contrast where painting scores best over both door frames together and this frame alone 0.005 worse, and the game's is carved and lit.

- [ ] **The login's music, by its score.** The login plays its music ([music](/docs/genshin/music)): its notes agree with the game's on most frames, and its octave bands sit under ten decibels off, the second piece's lowest band furthest and short, then the first piece's 2 kHz band. The next pass is whatever fills the lowest band, a bass the transcription leaves out or a level, taken when `listen`'s signed bias confirms it moves it.

## Later

- [ ] **The health notice's face.** Signika's letters are proportioned apart from the game's, which is its whole remaining gap; no size or spacing moved it. An open face nearer the game's, measured as Signika was chosen.
- [ ] **A current mainland recording.** Mainland China's title splash and age rating are judged on an older build's launch, drawn on full white where the current PC client's white is a step under it; a current recording settles both.
- [ ] **The day frame's letterbox.** Its recording masks its top and bottom rows, read as a mask over a full frame; a recording of the day at its full height confirms that against a window of that shape.
