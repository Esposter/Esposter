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
      outcome: InvestigationOutcome.Rejected,
      result:
        "The walkway's pieces are boxes with no bevel, their tops at three levels: the stone at 0, its lanes' borders 9 millimetres over it and its curbs 3 centimetres over that. Each piece drawn up to its highest vertex stood its whole top at its curbs, so the middle lane's pieces, which carry none, stood 2 centimetres under their neighbours, and their sides read as dark steps across the walkway. Built with its borders and curbs as levels of their own, the walkway nears its exports on the phone's door frame (FLIP 0.481 to 0.445, similarity 0.44 to 0.61), but the day's title scores 0.4309 against 0.4304 and the night's 0.3657 against 0.3651; every piece flat at its stone scores the dawn 0.3849 against 0.3858, the phone's door frame 0.4688 against 0.4698 and the rest level, so it ships",
    },
    {
      method:
        "genshin:parity passes login's shape measure at login-door-session's camera: our parts drawn into the witness's part, depth and normal targets at 1280 wide beside the exports'",
      outcome: InvestigationOutcome.Found,
      result:
        "The walkway's outline stands 3.12 pixels from the exports' on average, its depth within 0.6 hundredths and its normals 9.9 degrees, so its pieces stand where the exports' do and are cut a little differently at their edges",
    },
  ],
  openQuestions: [
    "What MonoBlockController does to each walkway piece: the rise is read by eye off the recording's far end; its raw bytes (genshin:assets behaviours login --script ^MonoBlockController$) hold its own curve",
  ],
};
