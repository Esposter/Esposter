import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The towers' surfaces and shapes: the traced facade, its shades and relief, and what stands out from the walls
export const towersTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "genshin:assets fit login with fitSectionShades on the towers, then compare at every hour; compare with the door and then the towers casting no shadow",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Each tower section shaded by the colour its mesh paints its sides there, as a share of every tower's mean, scores the phone's door frame 0.008 worse and the day and dusk worse too: the gilding reads as bright orange bands where the game's gold is a metal, dark under the diffuse light and bright only in its highlight. The door casts no shadow: at dusk the sun stands low behind it and laid its shadow down the walkway to the camera, where the recording's walkway is lit, and without it the phone's door frame and the dusk score better. A tower's shadow still lies over the wings in front of the door where the recording's are lit, yet the towers drawn without shadows score the door frames and the dusk worse, so it is the dusk sun's direction or that tower's place that is off, not its shadow",
    },
    {
      method:
        "genshin:assets fit login with fitLoginTowerFacades, then rank's second table at every hour with the paint, the recesses, the metal and the bump each left out in turn, and the outer lathes put back",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Each tower unrolled round its axis and traced into band tones, paint, raised faces, recesses at two depths, gilding and openings, on lathes standing on the walls, now carries the game's gold bands, the lantern tower's windows and the fluting where the exports do, by eye. Against the exports it scores a little worse than the bare lathes on most frames (night 0.077 to 0.085) and the day's better (0.140 to 0.128); a blurred difference over the near towers falls from 19.0 to 17.7. The gilding as metal read darker still at every hour, with nothing reflecting the sky into it, and three's bump map over the atlas changed no frame, so both are dropped",
    },
    {
      method:
        "rank's second table with scoreLabelSimilarity at every hour, its stand-in sheet read by eye, then the recesses' occlusion swept",
      outcome: InvestigationOutcome.Found,
      result:
        "Against the exports, the towers' multi-scale structural similarity reads 0.70 on the phone's door frame, 0.60 at dawn, 0.70 by day and 0.71 at night; the walkway's 0.61, 0.45, 0.86 and 0.48, its far end standing at full height in the exports where ours assembles; the bridges' over 0.8 everywhere. Side by side, the near lantern tower's arched windows read dark in the exports and pale orange in ours, but every darker recess (0.8 to 0.6 a unit of depth in place of 0.9) scored the towers worse by both measures",
    },
    {
      method:
        "fitLoginTowerFacades with a per-row wall profile and createLatheStackGeometry with crease-angle normals, then rank's second table at every hour",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Each tower's walls read row by row, a moulding standing out all round lifting its band's wall, simplified within a quarter unit into sloped frustums and drawn with its turns under 50 degrees rounded by their normals: the towers' similarity fell from 0.678 to 0.669 over the four hours and their FLIP rose from 0.262 to 0.266, the near lantern tower's crown reading as stacked rings where the exports' carve capitals and arches. Reverted; read by row alone, a window band's median sank the lathe into its windows and lost them",
    },
    {
      method:
        "The facade's every shade scaled toward the stone by a contrast share swept from none to all, and the gilding left out, in rank's second table at every hour",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Against the exports, the towers' traced facade at its full contrast scored under the bare stone (FLIP 0.258 against 0.249, similarity 0.688 against 0.693 over the four hours); its shades drawn a quarter as far from the stone score best by both, 0.248 and 0.694, and every hour's frame scores better or level. Without the gilding alone the towers scored 0.251 and 0.691: the bright gold is a part of the gap, the painted relief the rest",
    },
    {
      method:
        "A bump map over a blurred height canvas of the facade's layers at strengths 0, 1 and 3, then the door relief's contrast swept from none to all, in rank's second table",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The towers' relief drawn as a height canvas of each layer's depth, blurred over two texels and lit through three's bump map, left the towers level against the exports at its own strength and worse at three times it: the relief the game lights is its geometry's, which a bump over a lathe does not stand in for. The door's painted relief at three fifths of its read contrast scores the door best against the exports on both door frames (FLIP 0.267 to 0.258, similarity 0.638 to 0.648), the recording's door frame a little better and the phone's 0.005 worse",
    },
    {
      method:
        "A relief canvas over the towers' facade atlas with a tangent round each tower's axis, rank login-day-title --witness login at bevels of 2, 6 and 12 units and the sign flipped, compare on every login frame, and compare login-day-title --witness login read beside its stand-in",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The towers' traced recesses drawn as relief, each recess's depth blurred into a bevel and its slopes bending the stone's normal round the tower and up it, move the towers away from their exports at every strength on the day title: similarity 0.8192 with none, 0.8161 at a bevel of 2 units, 0.8178 at 6 and 0.8189 at 12, the sign flipped 0.8152; every frame scores between one and fifteen ten-thousandths worse. Drawn side by side from one view (compare --witness), the exports' carving is geometry: their flutes are facets the light and the haze shade one by one, their windows and arches deep recesses, and an open tower's colonnade stands open where our lathe, following the outer radius, stands it solid. The carving waits on geometry carved from the exports, not on a relief over the lathe",
    },
    {
      method:
        "The facade's cells read band by band at 1024 turns and their harmonics, then each section's ring of 64 shares on the lathe kit at 24 and 64 segments round, outward only, clamped and folded to one repeat, rank --witness login on the day and night titles and the door recording, and the door recording's near tower read beside its exports",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The towers' sections are not round: read at 1024 turns round each axis, a band's radius repeats 8, 16 and 24 times in step on the third tower (eight ribs), 16 times on the fifth, and once or a few times on the second (balconies and what stands built onto it), where the facade's lathe keeps one median wall a band and paints the rest. Each section's radius at 64 turns as a share of its wall (upper medians of the facade's cells) brings the towers nearer their exports on the titles but further on the door recording's near lantern tower: similarity 0.8192 to 0.8320 by day, 0.7210 to 0.7328 by night and 0.7399 to 0.7006 at dusk at 64 segments round (0.8289, 0.7289 and 0.6991 at the lathe's 24, which aliases eight ribs into lumps; 64 segments round alone score 0.7402 at dusk). Its windows sink as two-unit steps and its colonnade as zigzags; outward shares alone score 0.8330, 0.7319 and 0.7056, a balcony's disc still swelling where the exports' tower stands slim; shares clamped within 15% or 30%, or kept to each ring's one repeat round, give up the titles' gain and keep the dusk's loss. Not shipped: the ribs want columns of their own and the windows and colonnade recesses and openings, not one ring a band",
    },
    {
      method:
        "findCellComponents and findCellRectangles over the facade's raised cells, createLoginTowerSlabGeometry merged into each tower's lathe, rank --witness login on the day and night titles and the door recording, compare on every login frame, and the door recording's near tower read beside its exports",
      outcome: InvestigationOutcome.Adopted,
      result:
        "What stands out from the walls built as columns of its own, each run of raised cells of forty or more split row by row into rectangles while a row spans the same columns within half a unit of depth, about 1,900 slabs over the six towers, brings every frame's towers nearer their exports: similarity 0.8192 to 0.8338 by day, 0.7210 to 0.7368 by night and 0.7399 to 0.7494 at dusk, their FLIP against the exports 0.1647 to 0.1590, 0.1837 to 0.1773 and 0.2241 to 0.2185. Against the recordings the frames move a thousandth or two either way (the dawn title 0.3805 to 0.3818, the day 0.4321 to 0.4328, the phone's door frame 0.4647 to 0.4662, the door recording 0.5140 to 0.5142, the night 0.3654 to 0.3641) while their edges' shape scores rise on four. A run's bounding box in place of its rectangles stood the second tower's whole body as one shell, its wall's median lying on its inner core",
    },
    {
      method:
        "The facade's deep cells, then its shallow and deep cells, as sunk slabs with the lathe cut over them, rank --witness login on the day and night titles and the door recording, compare on every login frame, and the day title's left towers read beside their exports",
      outcome: InvestigationOutcome.Adopted,
      result:
        "What sinks four units or more into the walls split the same way into 165 recesses, the lathe cut open over each through the facade's mask and a box standing behind it, leaves the towers level against their exports (similarity 0.8338 to 0.8339 by day, 0.7368 to 0.7354 by night, 0.7494 to 0.7497 at dusk) and the frames level against the recordings (the dawn title 0.3819, the day 0.4326, the phone's door frame 0.4662, the door recording 0.5141, the night 0.3645), opening the windows the left towers show by day. Recessing what sinks a unit or more as well, 1,029 recesses, scored every frame worse (0.8310, 0.7273 and 0.7451): the tall arched panels and the lantern tower's bays sink in under four units and stay painted",
    },
  ],
  openQuestions: [
    "The towers' gilding and windows: their colour per section scores worse painted as diffuse stone, the game's gold being a metal",
  ],
};
