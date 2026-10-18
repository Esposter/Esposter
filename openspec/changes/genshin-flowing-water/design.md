# Flowing water

The shapes and the flow are built: see [flowing water](../../specs/genshin/flowing-water/design.md). This page keeps what the game must still supply.

## Decisions

- **A river's course is the game's.** The water surfaces the game places along a river are read in the region's layout pass, and a river's ribbon is fitted to them: its course, width and level. Its shape is gated as any shape is, by its outline and depth against the exports drawn at each reference's camera.
- **Its flow is read before it is measured.** The direction and speed its ripples and foam move at come from the game's own water material and its texture coordinates where the export holds them; what it holds without fields is measured off a recording of the river in the motion pass. Foam collects at rocks and bends ([flowing water](../../specs/genshin/flowing-water/design.md)).
- **Waterfalls are objects the game places.** Each sheet stands where its record sets it, a mesh with scrolling streaks fitted to the game's own in an object pass. The mist and foam pool at its foot are particles, so they are judged by their statistics against a recording, their spread, density and colour, never pixel for pixel.

- **A waterfall's sheet is read off its mesh in the witness.** The capitals' witness exports already place the game's falls, meshes named `Eff_Model_WaterFall_*` (about five in Mondstadt's, about thirty-five in Liyue's), in our scene's axes round the world's origin. A sheet's lip is the centre of its mesh's highest edge, `across` the direction of that edge on the ground, its width the edge's length and its drop the mesh's height, each read after the placement's own scale and turn. The `Eff_Stages_WaterFallSplash_*` and `WaterfallRipple` meshes at a fall's foot are the foam pool's references, not sheets.

- **The draw rule for the sheets is the [flowing water](../../specs/genshin/flowing-water/design.md) page's.** The fit keeps every record as the game places it, and the world decides what to draw. A sheet with no drop lies flat on the ground, so its streaks would paint a strip the game does not show as a fall, and one with no width has no area. The Mondstadt and Liyue records with either are dropped at draw time, and the region data keeps them. The placements the witness repeats at one lip, across, drop and width are drawn once, by the renderer rather than merged in the fit, so the data stays a copy of the game's placements.
- **A region whose witness export stands in draws its own falls.** Where the game's exports for a region are in the scene, the world leaves that region's sheets out, as it leaves out the landmarks the exports draw.
- **A river's course is read off its water surface's centreline.** The witness places each water surface (`Area_Ly_Water_*`, three in Liyue, none in another region) in three's axes, and the fit turns each mesh's vertices into three's axes before its placement, as the falls are. The course slices the surface one metre along its long axis, each slice a point at the middle of its width with its mean level. Four values are provisional until a recording of the river checks the ribbon: the metre slice, the pond rule (a surface no longer than twice its width has no course, which takes Liyue's flat `Qunyuge_01` pond), the four-metre hole that breaks a course (Liyue's `Slums_02` has one of nineteen metres, which a ribbon would otherwise draw across), and the downhill direction, since a river runs from its higher level to its lower and the game's own flow direction is not read yet.
- **Two surfaces over the same ground are each a river.** Liyue's `Slums_01` and `Slums_02` lie over the same place at different heights. Each is fitted as its own courses. The drawing draws every course the fit holds, so the two overlap in the world where their courses do; whether that shows as doubled water is for the eye-check at integration, and a rule to pick one is not fitted yet (provisional).
- **A river is drawn as a ribbon in the water's material, beside the still water.** Each course is one ribbon, its bend foam read from the vertices the ribbon writes (`createRiverMaterial`), mounted with the still water and the falls (`World/Rivers`). A region whose game export stands in leaves its rivers out, as it leaves its falls out, so the shared filter is `getOwnRegionData`. The river draws still until its flow is read, since the water material takes one flow for the whole surface and a river's direction changes along its course.

## Still to build

1. **The rivers' flow**: a river's ribbon draws still. Its direction and speed come from the game's water material where the export holds them, or are measured off a recording of the river in the motion pass. The material takes one flow per surface, so a per-course flow needs the material to read it per vertex first.

## Deferred compute

- No other region's witness holds a water surface, so the rivers outside Liyue are not fitted. The falls outside the capitals' witnesses are not fitted either, though their meshes are exported: Inazuma, Sumeru and Natlan hold 58, 49 and 2 fall placements, and their region files exist, so their wait is a fit entry for each region (task 2.2), not the export.
- The mist and foam pool particles are not built: their emitter and their statistics are judged against a recording of the game's falls.
- How tight a bend gathers full foam on its outer bank is provisional, fitted to a recording of a bending river once its course is placed.

## Notes

- **Swimming is play.** Moving through the water, with its stamina, waits for the phase-three character controller.
