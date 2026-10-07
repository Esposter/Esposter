import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The walkway's surface: its carving as relief, the paving's plan, and its tops' levels
export const walkwayTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "zoom on the recording's paving at full size, the walkway's mask and normal textures read channel by channel, fitLoginPaving's tilt plan, then compare and rank login-door-recording",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The recording's dark carving on the walkway is relief, not paint: at the recording's full size its strokes are thin lines down one side of each raised band and along each brick, the side turned from the sun, and the stone's mask holds no metal. Its normal map read over the paving's plan carves each pocket's rim as a bevel of median slope 1.5 about a centimetre wide, leaning into the pocket, so the pockets are sunk, and each joint between two bricks as a shallower groove of slope 0.59, split from the flat stone by Otsu's threshold under the rims'. Drawn as relief on the walkway's tops from the pockets' and the grooves' loops, lit by the scene's own lights, the door recording's shared edges rise from 0.411 to 0.438 and its FLIP falls from 0.6095 to 0.6089, the dawn's, the day's and the phone's door frames level and the night's 0.003 worse; against the exports the walkway's similarity falls from 0.65 to 0.56, our rims wider and darker than theirs at the ranking's size and the exports' middle lane a paler stone than ours",
    },
    {
      method:
        "genshin:parity plan login-door-recording --family Walkway at 50 and 150 pixels a metre, genshin:assets fit login with fitLoginPaving and fitLoginDoor's relief, then compare at every hour",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The witness smeared every texture whose coordinates run past 0 and 1 into streaks, the walkway's bricks among them, since three clamps a texture's edges where Unity tiles it; tiled, the witness's walkway shows the recording's bricks. A plan of the walkway's tops drawn through their own coordinates, on the CPU and by the witness from straight above alike, lays out its paving in metres: a middle lane of bricks 0.25 metres a course between two light strips, side lanes and wings set with pockets, and a curb, which the recording shows as dark joints and rims. Traced and drawn as lines the paving scores within a thousandth of the bare stone at every hour, as the door's traced relief does, the phone's door frame a little better: the lines are the game's own, kept for the eye",
    },
    {
      method:
        "rank's second table with the witness walkway sunk, then the paving's lines and pockets swept against the exports",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The exports' walkway now assembles as ours does in the stand-in table, each piece sunk by its middle's distance ahead with the seed of our piece standing where it does (sinkLoginWitnessWalkway), so its far end no longer stands built out to the horizon: the walkway's similarity rose from 0.48 to 0.56 at night. Side by side, our paving's dark lines were the rest of its gap: the exports' plan reads its pockets as stone about 0.83 of its lane with paler rims and no dark line, and every darkness of the brick joints and the pockets' rims drawn as lines scored the walkway worse. Filled pockets a twentieth darker than the lane and no lines take the walkway from 0.280 to 0.208 of FLIP and from 0.63 to 0.80 of similarity against the exports over the four hours, and every hour's frame but the day's, level, scores better",
    },
    {
      method:
        "The walkway's faces binned by tilt and height per piece, its tops read from above, then the walkway fitted with its levels and flat at its stone, compare on every login frame and rank's second table on login-door and login-night-title",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The walkway's pieces are boxes with no bevel, their tops at three levels: the stone at 0, its lanes' borders 9 millimetres over it and its curbs 3 centimetres over that. Each piece drawn up to its highest vertex stood its whole top at its curbs, so the middle lane's pieces, which carry none, stood 2 centimetres under their neighbours, and their sides read as dark steps across the walkway. Built with its borders and curbs as levels of their own, the walkway nears its exports on the phone's door frame (FLIP 0.481 to 0.445, similarity 0.44 to 0.61), but the day's title scores 0.4309 against 0.4304 and the night's 0.3657 against 0.3651; every piece flat at its stone scores the dawn 0.3849 against 0.3858, the phone's door frame 0.4688 against 0.4698 and the rest level, so it ships",
    },
    {
      method:
        "genshin:parity passes login's shape measure at login-door-session's camera: our parts drawn into the witness's part, depth and normal targets at 1280 wide beside the exports'",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The walkway's outline stands 3.12 pixels from the exports' on average, its depth within 0.6 hundredths and its normals 9.9 degrees, so its pieces stand where the exports' do and are cut a little differently at their edges",
    },
    {
      method:
        "The shape pass's image of login-door-session, the walkway's near corner zoomed, then each piece's tops read from above on the centimetre grid and what stands 5 millimetres or more over its stone traced as loops at its own height (fitLoginWalkway's raised), extruded over the piece, in the shape pass",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The 3.12 pixels were the curbs: near the camera the exports' curb tops widen the walkway's outline and their inner faces stand as a dark stripe, where ours stood flat at the stone. Each piece's curbs (3 centimetres) and lanes' borders (9 millimetres) drawn as raised loops over it, the walkway's outline stands 0.49 pixels from the exports', its depth 0.05 hundredths and its normals 6.2 degrees, and the shape holds; the frames' scores that had flattened them weighed the light and the haze along with the shape",
    },
    {
      method:
        "genshin:parity passes login's surface measure on login-door-session and its lightness drawn apart; the tops' plan read as tones by k-means in CIELab (fitPlanTones) over the whole copy at three tones, then folded onto the repeat its colour differs least at (rows shifted by quarter metres up to 8, its red channel's mean difference) at two centimetres a side (foldPlanRepeats) at three and five tones",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The stone of one tone with its pockets a twentieth darker stood 2.34 ΔE from the exports' mean colour and 0.124 in structure against a gate of 0.011: the exports paint the middle lane's bricks paler, with a darker brick about every 0.8 metres, and a pale strip along each lane's border. The copy's colour differs least from itself 8 metres along, 0.017 against about 0.03 at every other shift but 2 and 4 metres (0.024 and 0.027), so its pattern repeats as its wings stand. Three tones over the whole copy read 0.41 ΔE and 0.072 at 216 kilobytes; folded onto the repeat, 0.49 ΔE and 0.082 at 45; five tones folded read 0.090, finer tones adding edges the exports' soft paint does not have. Adopted at three folded tones: the colour holds, the structure does not, and more tones move it away",
    },
    {
      method:
        "genshin:parity passes login's surface measure with each family's structure read scale by scale (scoreLabelSimilarity), then the walkway's faces that read no plan, its sides, curbs and underside, painted the mean colour their textures paint them, read at four points of each face weighted by its area",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The walkway loses structure at every scale, 0.895, 0.891, 0.910, 0.939 and 0.972 finest first against its exports' own 0.964 to 0.999 a pixel across, so its layout stands off as well as its detail. Its sides' textures paint them 0.99 to 1.01 of the stone, the stone they already read, and moved the structure from 0.0820 to 0.0815: the sides are not the gap",
    },
    {
      method:
        "The surface pass's structure image over the walkway, then genshin:parity plan login-door-session --family=Walkway at 100 and at 10 pixels a metre, each column's lightness and red over blue read, and every face standing up at the walkway's top read at its texel (a scratch probe)",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The walkway's finest structure is lost along its lanes' borders, which the exports draw at the door session's camera as thin gold lines and ours as darker strips. From above at a centimetre a pixel the borders are 10 centimetre strips a little darker than the stone (138 to 142 against 147) with no gold, and no face standing up at the top is gold either (red over blue 1.01 to 1.08): at 10 centimetres a pixel the same strips read 1.25. The gold is the texture's coarse levels, its border texels averaged with the gilded trim beside them in the atlas, which the game's sampling shows wherever the walkway lies far enough off; our paint is drawn over the plan, where a border lies beside stone, so no level of ours can turn gold",
    },
    {
      method:
        "A what-if: the two borders painted as one more tone of the walkway's paint at the gold the coarse plan reads (1.22, 1.14 and 0.97 of the stone), in the surface pass at login-door-session",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The walkway's colour fell from 0.49 to 0.05 ΔE, so the frame does read it that warm on the whole, but its structure rose from 0.082 to 0.121, every scale but the finest worse: near the camera the borders are the darker strips and only far off the gold, so one colour at every distance is wrong at most of them",
    },
    {
      method:
        "A what-if built whole: each level of the paint's canvas drawn from the tones k-means reads off its textures' own levels, averaged in linear light, at the level the game samples over that level's pixels by the texels each material lays over a metre (510 to 980), its cells 2 to 64 centimetres, then the surface pass at login-door-session with the witness sampling as it did and as below",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The coarse levels do read the borders gold (1.19, 1.16 and 1.09 of the stone at 4 centimetres a cell), yet the levels moved the walkway's colour from 0.49 to 0.47 ΔE and its structure from 0.082 to 0.083; against the anisotropic witness below they read 0.136 ΔE and 0.0881 where the first level alone reads 0.146 and 0.0880. A sampler reading along a grazing line of sight, ours and the game's, reaches those levels only where a border is a pixel wide, so the tool was deleted at 54 kilobytes of paint against 45",
    },
    {
      method:
        "The door session's recording and the older day recording beside the witness's exports, then the witness's textures sampled with eight samples along a grazing line of sight, as our shade canvases are (SCENE_TEXTURE_ANISOTROPY), in every pass's measure",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Both recordings show the walkway's brick joints and its pockets' rims sharp down to the door and no gold along its borders. The witness took one sample a pixel, so along the walkway it read each texture a level or more coarser than its width across, where the borders average with the gilded trim beside them in the atlas: the gold lines were the witness's. Sampled as the game samples, the exports draw the bricks, joints and rims the recordings show; the walkway's colour falls from 0.49 to 0.15 ΔE and its gate rises from 0.011 to 0.017 (the towers' 0.020 to 0.023, the bridges' 0.021 to 0.023, the door's 0.083 to 0.089), its structure reading 0.088, finest scale 0.845 against the exports' own 0.929. The shapes' normals move by a tenth of a degree or two and hold",
    },
    {
      method:
        "fitLoginPaving's paint read over one-centimetre cells rather than two (PAINT_BLOCK_CELLS 1), at three tones and at five, in the surface pass at login-door-session against the anisotropic witness",
      outcome: InvestigationOutcome.Found,
      result:
        "Three tones over a centimetre take the walkway's structure from 0.088 to 0.073 (finest scale 0.845 to 0.873) and its colour from 0.15 to 0.30 ΔE, the pockets' pale rims now drawn, at 102 kilobytes of paint against 45; five tones read 0.075 and 0.11 ΔE at 162. The joints and rims are barely painted at all (the joints 1.05, 1.03 and 1.02 of the stone, the rims 0.99, the flat lanes 1.06, 1.08 and 1.06), so what the finer cell gains is where the tones' edges lie; held uncommitted for the bundle's cost, since it leaves the walkway four times its gate",
    },
  ],
  openQuestions: [
    "What the walkway's structure loses to its exports: 0.088 against a gate of 0.017, most at the finest scale (0.845 against 0.929), along the bricks' joints, the pockets' rims, the lanes' borders and the curbs' edges, which the exports' albedo draws sharp and our three soft tones over two centimetres do not, and where the far end meets the dais. Tones over a centimetre close a sixth of it and more tones none, so the next tool is one that says which of the plan's features the loss lies on: each pixel's term carried back onto the walkway's plan through the witness's depth and camera and summed per cell",
    "What MonoBlockController does to each walkway piece: the rise is read by eye off the recording's far end; its raw bytes (genshin:assets behaviours login --script ^MonoBlockController$) hold its own curve",
  ],
};
