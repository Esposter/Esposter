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
    {
      method:
        "genshin:parity passes login's shape measure at login-door-session's camera: our parts drawn into the witness's part, depth and normal targets at 1280 wide beside the exports'",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The towers fail every gate: their outlines stand 1.28 pixels apart on average against the gate's 1, their depth 1.7 hundredths off and their normals 19 degrees, the lathe's smooth rings against the exports' carving. The bridges and pillars hold (0.58 pixels, 0.6 hundredths, 9.1 degrees), as does the door (0.11 pixels, 7.5 degrees)",
    },
    {
      method:
        "The shape pass's image of login-door-session (the exports' normals, ours, and the angle between them), the near towers cropped side by side, then each tower placement's scale read off the exports beside the fit's",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Our near towers' storeys stood lower than the exports' the higher they rose, their feet level: fitLoginTowers kept each scale to the centimetre as a length, so a tower at 0.1028 stood at 0.1, a 92 metre tower's crown 2.6 metres low. Kept to five decimals, the towers' outlines stand 0.53 pixels apart, their depth 0.63 hundredths off and their normals 11.8 degrees: the outline and the depth hold, and most of the 19 degrees was the misplaced mouldings, not the lathe",
    },
    {
      method:
        "Each tower's wall read row by row, half a unit of its mesh, as the median radius the row's cells stand at and simplified within a quarter unit into sloped frustums (TOWER_PROFILE_TOLERANCE), against the two-unit bands, both at the true scale, in the shape pass at login-door-session; then the tolerance at a tenth and a half",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Against the exports the rows read the towers' normals at 11.8 degrees where the bands read 15.2, the outline 0.53 pixels against 0.58 and the depth 0.63 hundredths against 0.71: a moulding's roll and a cornice's overhang turn up the profile as sloped runs where the bands stood them as steps. A tenth of a unit reads 11.6 degrees over 758 sections and a half 12.0 over 528, against 641 at a quarter, so the tolerance is not where the rest lies. The image's reds left lie on the window storey's arches and pilasters, the crown's ornaments and the slabs' edges",
    },
    {
      method:
        "createLatheStackGeometry with a crease angle: where two sections meet at one radius and their sides turn by less than it, the ring they share takes the normal between them, at 30 and 60 degrees in the shape pass at login-door-session",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The towers' normals read 12.9 degrees at 30 and 15.6 at 60, against 11.8 with every meeting a hard edge: a frustum's normal is drawn between its two rings over its whole height, so a ring averaged with a short ledge tilts a tall wall's normal through all of it. Reverted",
    },
    {
      method:
        "The facade's depths read against the wall the lathe draws at each row (its simplified profile at the row's middle) in place of each two-unit band's median, then in the shape pass at login-door-session: the deep recess at 2 and 1 units, columns from half a unit out, runs of 10 cells kept, and the lathe at 32 and 48 sides",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Read against the lathe's own wall, a moulding the lathe already turns is no longer a column too, and each slab stands on the wall drawn under it: the towers' normals fall from 11.82 to 11.55 degrees and the outline from 0.53 to 0.50 pixels, with 89 recesses where the bands found 165. None of the sweeps moves the normals: recesses from 2 units read 12.03 degrees and from 1 unit 12.42, as their frames' scores had found; columns from half a unit 11.52, runs of 10 cells 11.55; 32 sides 11.81 and 48 sides 11.83 against 24's 11.82, the outline and depth a few hundredths better, and the game's towers stand on 27 to 64 sides each. Left: the colonnades' columns, round in the exports and boxes in ours before a solid drum, and the crowns' ornaments",
    },
    {
      method:
        "Each standing slab's face normals bent round its width as a round column's would be, at 45 and 17 degrees at its ends, in the shape pass at login-door-session",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The towers' normals read 12.79 degrees bent 45 and 11.73 bent 17, against 11.55 flat: the exports' ribs and pilasters are flat-faced, so a round face misses more of them than it gains on the colonnades' columns. Reverted",
    },
    {
      method:
        "The facade unrolled on cells of a quarter and an eighth of a unit in place of a half, in the shape pass at login-door-session, its paint read again on half units (sampleFacadeGrid) and each slab written as six numbers",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Every carved edge had been read to half a unit, 5 centimetres at the towers' scale and 2 to 3 pixels where the login sees them nearest, which is the misregistration the shape image's red edges show. On quarter units the towers' normals read 10.43 degrees and on eighths 9.88, the outline 0.48 pixels and the depth 0.58 hundredths, and the shape pass holds for every family. The finer profile showed each section's height rounded on its own running the crowns 9 centimetres off, so a height is now the gap between its two ends rounded. The paint loops, which only colour the atlas, stay on half units (154 thousand characters where the eighths traced 341 thousand), and a slab is written as a tuple, so the towers' data stands at 442 thousand characters minified, from 352",
    },
    {
      method:
        "genshin:parity passes login's surface measure on login-door-session, each family's structure read scale by scale (scoreLabelSimilarity); the facade's shades at a quarter of their traced contrast and at all of it, then its recesses with and without the light their depth keeps out",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Drawn unlit beside the exports, the towers at a quarter of their traced contrast lost structure about evenly at every scale (0.86 to 0.89 against the exports' own 0.91 to 1 a pixel across), as a pattern drawn too faint does: 0.131 against a gate of 0.020. At their full contrast they read 0.092 and with no recess darkened by its depth 0.087, colour 1.52 ΔE against 2.3, the coarsest scales gaining most. Supersedes the quarter, read off lit frames where the light across the game's carving stood in for the paint. What is left still runs through every scale, 0.04 to 0.08 under the exports' own (0.871 to 0.950 against 0.913 to 0.998), so the towers' layout of tones, not their grain alone, stands off",
    },
    {
      method:
        "The surface pass's structure image (surfaces/login-door-session-structure.png) and its lightness image over the near towers, each region's mean and spread read in both, then the towers refitted with every shade over the stone all the towers share (fitAlbedo over their diffuse textures) in place of each tower's own mean",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The near lantern tower's body matched the exports' mean to a byte where its grain spread three times as far, but the near left tower stood about 8 bytes lighter all over: each tower's shades over its own mean drew every tower at the one stone colour the scene multiplies them by, where the game's towers stand from nine tenths to about one of it. Over the shared stone the towers' colour falls from 1.52 to 0.37 ΔE and their structure from 0.087 to 0.081, the coarsest scales gaining most (0.950 to 0.964). The refit also carried the paint grid rounded up to the seam and the crown (sampleFacadeGrid), which towers.json had not been fitted with since, a band merged and the loops run on half a unit to the seam: alone it moved the colour by a ten-thousandth",
    },
    {
      method:
        "The structure image's slender far column found by genshin:parity parts login-door-session --family Towers as LoginScene_Build05_01_Lod2, the inventory's materials read level by level, then readLevelOfDetailParts making a level drawn with other materials than its part's finest a part of its own, the towers and the hulls refitted, in the passes at login-door-session",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The game stands some towers and bridges far off at their coarsest level alone, and every tower's coarsest (and most bridges' and pillars') is drawn with LoginScene_Ground01 only, about the towers' stone with no band, where our lathe painted every placement with its finest level's bands, the far Build05 dark and blue at its mouldings. Fitted from their own meshes, three towers' coarsest levels stand four placements: the towers' structure falls from 0.081 to 0.071 and their colour from 0.37 to 0.27 ΔE, their normals from 9.88 to 9.57 degrees and their outline from 0.48 to 0.46 pixels; five coarse hulls stand eleven bridges and pillars, their outline from 0.48 to 0.40 pixels and their normals from 9.20 to 9.02 degrees. Build05's middle level keeps its finest's materials and so its facade, which would have added about its finest's 238 thousand characters where the coarsest levels add 64 thousand",
    },
    {
      method:
        "The shape pass at login-door-session held at heldScrolled 320, its towers' normals named by exported part (the shape notes), the worst read side by side in its image, then each tower's Lod0 footprint middle read whole and band by band",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Held where its towers stand, the towers' normals read 10.62 degrees against the gate's 10, a tenth of the angle on one slender column right of the walkway, LoginScene_Build02_02 at 38.6 degrees over 10 thousand pixels where every other part reads 9 to 12. Ours stood doubled there, a second run of rings beside the shaft: fitLatheProfile took the axis as the middle of the whole footprint, and Build02_02's and Build02_03's brackets, standing out to one side at a few heights, drew it 4.7 units off the shaft, where every band's own middle stands at none. The lathe turned about that point, and the facade read about half the wall round it as slabs standing out (539 and 588 of them). Taken as the median of the bands' middles, the axis lands on the shaft; the two towers keep 121 and 118 slabs, the data falls from 505 to 479 thousand characters minified, and the towers' normals read 9.24 degrees, their outline 0.48 pixels and their depth 0.33 hundredths, every shape gate holding",
    },
    {
      method:
        "genshin:assets fit login --only towers rerun on the current fit, its facades' band tones and heights compared with the committed towers.json, then passes login's surface measure on login-door-session",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "The rerun moves LoginScene_Build02_02's band tones at heights 110 and 112 by a hundredth and one corner of its hole by half a cell, and no other tower or section. The towers' structure reads 0.1012 before and after, against its gate of 0.0257, its scale by scale 0.865 to 0.921 against the exports' 0.891 to 0.999, so the coarse and middle losses need a change to the fit's band rule, not a rerun",
    },
    {
      method:
        "Each paint layer's shade as its colour over the tone of the band its cells sit in, rather than over the tower's whole mean: fitLoginTowerFacades' layers taken over each band's run, createLoginTowerFacade filling each layer within its band at the product of the two, then genshin:parity passes login --pass Surface on login-door-session",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The towers' colour falls from 0.1170 to 0.1015 ΔE, but their structure rises from 0.1012 to 0.1145 against a gate of 0.0257, every scale losing ground (finest 0.865 to 0.854, coarsest 0.921 to 0.911 against the exports' 0.999). With the change in, the surface image's row profile still runs ours lighter by four to five at rows 40 to 64 and darker by three to five at 128 to 176, so the rows' tone moved less than the structure's loss, which sits at every scale. Reverted, the layers back over each tower's whole mean",
    },
  ],
  openQuestions: [
    "The towers' gilding and windows: their colour per section scores worse painted as diffuse stone, the game's gold being a metal",
  ],
};
