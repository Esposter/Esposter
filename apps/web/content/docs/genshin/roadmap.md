---
title: Roadmap
description: Open work for Genshin's opening, biggest gap first — the login towers' carving and gold, the clouds' cover and kind, each hour's light and sky, where the parts stand, the door's and the walkway's surfaces, and the references and measures the rest waits on.
---

# Roadmap

Open work only, the biggest gap to the game first. What was decided against is in [deferred](/docs/genshin/deferred); read it before adding an item. Each item names the measure that says it is done: the login's stand-ins are judged against the game's own exports drawn beside them (`genshin:parity rank`'s second table), the towers' carving by their structural similarity there as well as their FLIP, its clouds by their statistics (`genshin:parity clouds`), and everything else by `compare` against its reference, checked by eye ([parity](/docs/genshin/parity)).

## Next

- [ ] **The login towers' carving, as the game carves it.** The towers carry their traced surfaces ([login screen](/docs/genshin/login-screen)): each band's tone, the paint, the recesses, the gilding and the open colonnades. What a lathe still cannot show:
  - [ ] The lantern tower's crown stands as an open colonnade of columns and arches over an inner wall; ours is a solid drum painted with them.
  - [ ] Relief that tilts the light along a recess's edge: three's bump map over the atlas changed no frame, so the relief needs a height the bump map can differentiate, or a normal map of our own drawn from the loops.
  - [ ] The stone's grain: the exports' diffuse noise reads as a fine texture on every face, ours as flat paint. A procedural grain of our own, fitted to its scale and contrast.
  - [ ] Gilding as metal: drawn as metal it read dark at every hour, since nothing reflects the sky into it. It waits on an environment map of the login's sky.
- [ ] **The clouds' kind.** The dawn's and the dusk's cover is solved on their frames (`genshin:parity cover`); the day's and the night's waits on their clouds' kind, since more of them scored those frames worse.
  - [ ] The day's clouds read grey where the recording's are white, about twice their clear sky's brightness against two and a half, and the colour solve (`genshin:parity clouds`) scored the day worse; the night's read dark against the recording's pale ones. Their colours, then their cover.
  - [ ] The day's horizon: the recording's sky is cloud within 8 degrees of it, ours about three fifths, its haze washing our low clouds into the clear sky; the dawn's overhead holds twice the recording's cover however few top clouds it draws, the cloud sea's nearest billows standing up past 25 degrees.
  - [ ] A cloud's inside: the recordings paint a lit crown grading into a pale shade, with cirrus wisps between; ours fill with two flat colours.
- [ ] **Each hour's light, solved rather than stepped.** `genshin:parity light` runs away on the title frames (a sun many thousand times as blue at dawn): its least squares per channel has no haze in its model. Drawing the haze rather than modelling it does not settle it either: matching the faces' medians on whole rendered frames converged and scored four of five frames worse, the medians paying for the haze's own colour and depth. The haze by depth is the unknown under it; the day's and the dusk's exposure steps scored the phone's door frame worse until then.
- [ ] **Each hour's sky, solved with its clouds.** A clear sky solved alone stands darker than the recordings' sky reads as a whole, which is mostly cloud, and scored the night worse. The cloud mask now fits each sky's clear sky under its clouds (`fitClearSky`), the clear pixels a solve of the sky reads.
- [ ] **Where the parts stand.** The silhouettes' placement and pose is a large term on every frame. `place` on edges runs a row metres up, so the row's offset and each tower's place need a measure on the sky's outline against each part's instead.
- [ ] **The door's surface at rest.** On the phone's door frame the door is the largest stand-in gap against its exports: its panel's relief is painted, the game's is carved and lit.
- [ ] **The walkway's far end.** The exports' walkway runs on at full height where ours assembles itself, so its far blocks read as a gap against them; a witness that sinks its far pieces as ours do measures the rest.

## Later

- [ ] **The health notice's face.** Signika's letters are proportioned apart from the game's, which is its whole remaining gap; no size or spacing moved it. An open face nearer the game's, measured as Signika was chosen.
- [ ] **A current mainland recording.** Mainland China's title splash and age rating are judged on an older build's launch, drawn on full white where the current PC client's white is a step under it; a current recording settles both.
- [ ] **The day frame's letterbox.** Its recording masks its top and bottom rows, read as a mask over a full frame; a recording of the day at its full height confirms that against a window of that shape.
