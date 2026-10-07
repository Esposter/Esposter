import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// Where the login's parts stand: the scene's roots, what its script spawns into its anchors, and each row's place
export const arrangementTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "A contact sheet: both arrangements from each end of the walkway (z 75 and -75), 5 metres up, pitch 3, at eight headings",
      outcome: InvestigationOutcome.Found,
      result:
        "Build_All's towers are several hundred metres tall, spread far and cut off above the cloud sea; the stage's towers are the recording's kinds",
    },
    {
      method: "The door's placement against the walkway's",
      outcome: InvestigationOutcome.Found,
      result:
        "The door is under the stage at (0, -5, 32.3), 0.4 scale, 8 by 13.5 metres; the walkway's root is dumped at the origin spanning z -75 to 72, so the door stood mid-walkway: the walkway's own parent is in a block not read",
    },
    {
      method: "The walkway moved 107.3 metres along +z so its far end meets the door, from (0, 12, 170), heading 0",
      outcome: InvestigationOutcome.Superseded,
      result:
        "12.22 px, and the recording's composition: the walkway straight to the door on its dais, towers either side, arched bridges to the right",
    },
    {
      method: "Why the door read short against the walkway",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The walkway's top stood 0.33 metres up and the door's foot 5 metres down, so 5.3 of the door's 13.5 metres sank into the walkway and it read short: the walkway's lost parent took its height as well as its place, and the walkway moves 5.33 metres down to meet the door's foot",
    },
    {
      method: "Why the door still read short with the walkway at its foot",
      outcome: InvestigationOutcome.Found,
      result:
        "The walkway 5.33 metres down and 112.3 along did not fix it: the door's width over the walkway's is 0.9 in the recording's last pose and 0.4 in ours, a ratio no camera changes, so the walkway was 2.5 times too large",
    },
    {
      method: "The placements under the roots LoginScene, LoginCamera and Eff_SceneCamera_Cloud_Login",
      outcome: InvestigationOutcome.Found,
      result:
        "LoginScene holds BridgeBeginNode, DoorNode, SceneBeginNode and ModelCamera at one scale, with LightShaft, MainLight, Moon, Sun, Clouds and Atmosphere: the login hangs the walkway and the door at one scale, so the walkway's lost parent is the door's, 0.4 scale 5 metres down, which brings its end to the door with no shift along its axis",
    },
    {
      method: "SceneObj's children in the login block's Transform and GameObject dumps, by their path IDs",
      outcome: InvestigationOutcome.Found,
      result:
        "SceneObj is in 00/11790361.blk at a tenth of LoginScene's scale, and its five children are in the same file: Atmosphere, ModelCamera, and SceneBeginNode, BridgeBeginNode and DoorNode, empty anchors with no children and no renderer, SceneBeginNode turned a quarter about y. No block is missing: the login's towers are a prefab MonoLoginScene spawns into SceneBeginNode at run time, and the walkway and the door into their own nodes",
    },
    {
      method: "What MonoLoginScene spawns into its anchors, from the pointers in its raw serialized bytes",
      outcome: InvestigationOutcome.Found,
      result:
        "Its raw bytes (genshin:assets behaviours) point at the five anchors SceneBeginNode, BridgeBeginNode, DoorNode, CloudEffect and LightShaft, then at three records of a prefab, an integer and a float: LoginScene_Build_All in 16000354 (3, 200), LoginScene_Bridge01_Vo in 16000354 (3, 16) and Eff_SeaOfCloud_Login (2, 300), then at LoginScene_Door01_Vo, the door prefab's root in 11790361. Two curves sit before them at 0x70 (1 falling to 0.02 over a second) and 0xa4 (0.2 rising to 1 over half a second), and two runs of four hours at 0x178 (4.5, 8, 17, 19) and 0x18c (9.5, 18, 23, 6)",
    },
    {
      method: "genshin:assets tree login --root SceneObj with the three spawns applied",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Set as the component's spawns, the tree shows the login as it draws: LoginScene_Build_All's towers, bridges and pillars under SceneBeginNode (237, -180, -533 in SceneObj's units, a quarter turn about y), the walkway's 23 pieces under BridgeBeginNode at SceneObj's origin, and the door prefab under DoorNode (-262, 341, 700), all at SceneObj's tenth. Every walkway piece carries a MonoBlockController, a script of its own, so the walkway's blocks are moved at run time",
    },
    {
      method: "genshin:assets arrangement login, before and after a fit over the spawned arrangement",
      outcome: InvestigationOutcome.Found,
      result:
        "The door's dais over the walkway at its foot, left to right along that row: 852, 861, 1058 and 1069 pixels, a cross-ratio of 1.0023, which the stage's fitted data holds (1.0000). Fitted over the spawned arrangement it reads -171: the door's anchor stands 70 metres out and 34 up from the walkway, which spans 16 metres at its anchor, so in the static layout the two never meet and the flight's arrangement is a run-time one. The re-fit was not committed. Bridges and the door fit their exports to the centimetre; the towers' fitted feet sit 6.5 metres from their objects' origins on average",
    },
    {
      method: "genshin:assets clearance login, then genshin:parity view and film --witness at the stretch beside ours",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The glide's path at the eye passes through the exports' own bridges and pillars at one place a loop, a pier of LoginScene_Bridge04's 0.4 metres deep 57 metres ahead of the towers' home; every arch and every space under a deck it crosses is open. Our bridges as one side's outline extruded through their depth filled those, and the camera glided into solid stone; as visual hulls they leave them open. A local refinement of the row's height on edges alone read it 0.43 metres too high from the towers' home, which the row's true phase at the door (below) undid",
    },
    {
      method:
        "genshin:parity parts login-door-recording and login-door --family Towers, view --offsets at the lantern tower's phase, then place --start=0,0,-150 on both",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The towers do glide toward the camera with the walkway, a near tower growing about 1.8 times from 9 to 14 seconds, and the door frames of recordings idle for different times show them alike: the door comes to rest with the towers' row 144 metres along its loop, nine of the walkway's copies, the 2.23-scale lantern tower close to the door's right and the colonnade low behind it. Moved as one with the camera held, from where the lantern tower's bearing puts it, the row lands on login-door-recording's edges 145.8 metres along and on login-door's 144.4, the other axes scattering either way; laid at home instead, the door frame shows thin far towers and a colonnade standing high. The English recording's glide from the title to the door's rest is about 49 metres, so the title opens that far short of it",
    },
    {
      method:
        "genshin:parity view --offsets on the bridges at 0, 5, 10, 14 and 18 metres beside login-door-recording, zoom --grid on the colonnade's rail, film over a whole minute of the title, and pose with doorPillarTop, doorTowerTop and doorLeftTowerTop added",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The bridges and pillars stand 5 metres under where the blocks lay them. At the door frame's pose, solved on the door and the walkway's wings, the colonnade behind the door stood some 50 pixels over the recording's, and the bridge whose deck crosses the glide's path, laid where the blocks lay it, stood its deck 2.3 metres over the eye, so the glide drove into it every loop where the game's passes over it however long the title idles. Lowered 5 metres, the colonnade lands on the recording's rows and that deck passes under the walkway. A camera solved on the towers behind the door as well (0.98 metres up, 11.3 short, 6.2 degrees, 48.3, at 7.2 pixels) traded its own height and pitch for the bridges' height and stood them higher still in the glide, so the door frame's pose stands",
    },
    {
      method:
        "genshin:parity parts login-door-recording --family Towers, place --landmarks columnCrown,towerRightInner,towerRightOuter with --axes z, x,z and x,y,z through the door frame's pose, then view --offsets lowering the towers 5 metres beside the recording, and compare at every hour",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The towers stand 5 metres low with their bridges, and their row 2.47 metres toward -x and 8.94 nearer at the door. Pinned on the lantern tower's two silhouette edges at the recording's row 460 and the crowned column's top behind the door with the row's height held, no rigid move fitted, which read as each tower moving on its own; seen beside the recording, the lantern tower stood a ring too high, so its edges were pinned at the wrong height. Lowered with the bridges and moved on the edges alone, its window band, gold rings and edges land on the recording's, the crowned column within 20 pixels and the colonnade where it stood, and every hour's frame scores better. The frame's far-left tower is still another of the row's",
    },
    {
      method:
        "genshin:parity place login-day-title --families Towers,Bridges --witness login --scan z:-100:100:2 and --scan x:-20:20:1, then compare at heldScrolled 32, 38 and 31.6 and the frame at 32 read beside the recording",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The day title's two big towers top left are the exports' own at the day's moment of the loop, drawn so by the witness too, where the recording shows one thin tower. Scanned along the whole 200 metre loop the row's edges fit within 10 to 12 pixels nearly everywhere under the day's haze, their least 86 metres along (heldScrolled 32), where a bridge's deck crosses the frame the recording shows open and the title scores 0.4528 against 118's 0.4321; 38 and 31.6 score 0.4438 and 0.4617. Scanned across from 20 metres left to 20 right, offsets of 4, 6 and 13 metres all fit within a pixel of one another. The edges cannot place the day's towers, so its moment stays at 118: the recording is the 2022 client's, which may lay the row out apart from the current build's",
    },
    {
      method:
        "genshin:parity passes login's layout measure: the arrangement's cross-ratio, each fitted family's parts against the exports' objects composed as the family stands them (a tower at its lathe's foot), and each witness family's run-time offset across and up past what the exports explain, gated at 2 centimetres",
      outcome: InvestigationOutcome.Found,
      result:
        "Matched by the objects' names, the towers read 124.56 metres off at most: the exports name a duplicated object with a numbered suffix, LoginScene_Build04_01_Lod2 (1), which the pattern refused, and a tower's fit stands it at its lathe's foot, up to 0.47 metres from its object. Matched by mesh and composed through the fit, every tower stands where the exports put it, the bridges and pillars within 0.0061 metres and the door within 0.002, and the door over the walkway holds (0.0023 against 0.01). The towers' row and its bridges stand 5 metres down, exactly Ani_Login_Lift's settled 50 units at the blocks' tenth, and 2.47 metres toward -x, which nothing in the exports explains: the layout pass's one red",
    },
    {
      method:
        "LOGIN_TOWERS_ROW_OFFSET's 2.47 metres across set to 0 for one run, then genshin:parity pose login-door-recording --witness login from the shipped pose with heading, pitch and field of view held, x freed and then held",
      outcome: InvestigationOutcome.Superseded,
      result:
        "Freed, the eye moves 0.015 metres across and the lantern tower's two landmarks stay 80 to 88 pixels off (42.4 pixels root mean square), so no camera lands the towers and the walkway together with the row unshifted: the 2.47 metres is the towers standing across from the walkway, not the eye standing off it. MonoLoginScene holds a 25 at 0x224, 2.5 metres at the scene's tenth, among what read as light and haze settings, and SceneBeginNode stands 25 units short of DoorNode's 262 across; neither is named yet, so neither is adopted",
    },
    {
      method:
        "login-door-session, the current build's door frame, at the eye solved on the door's landmarks (0, 0.997, -5.433, ModelCamera's turn, 45 degrees): genshin:parity overlay with the row shipped and with its across offset set to 0, then the towers' and bridges' edges scanned across from -4 to 4 metres with their height held at the lift and their phase at the frame's",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The edges are least 0.03 metres across from where the exports lay the row, 7.61 pixels against 8.5 to 10.8 on either side, so on the current build the towers stand exactly where SceneBeginNode lays them: the 2.47 metres was the older build's frame solved through a camera 0.22 metres high and wide by its field of view, the error landing in the row. The row's offset across is 0 and the layout pass holds. A refinement on the edges with the height free ran the row 1.7 to 4.4 metres up, as edges do",
    },
    {
      method:
        "genshin:parity passes login's layout measure with each tower read by both ends of its lathe's axis, its foot and its crown composed through the exports' own transform, against the fitted data's foot and its crown at the fitted scale",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The towers' feet had been checked against the fit's own feet, which hold whatever the fit does to a scale: read at the crowns the towers stood up to 2.57 metres off, every scale kept to the centimetre (0.1028 as 0.1). Kept to five decimals, the furthest crown stands 0.0063 metres off and the layout holds",
    },
    {
      method:
        "genshin:parity scroll login-door-session --witness login --scan=-100,100,2: the towers and bridges moved together along the glide at its camera, priced on their boundaries' distance to the frame's edges, the best offsets shot beside the frame; then the frame held at heldScrolled 320 and the passes run",
      outcome: InvestigationOutcome.Found,
      result:
        "The edges price two shallow basins, 20 to 24 and 62 to 78 metres ahead (7.3 and 7.1 px against 8.75 at none); shot beside the frame, 24 ahead stands the ringed towers left of the walkway and the near column right of it where the frame does, so the current build's door rests with the row 120 metres along its loop, on a walkway's copy (heldScrolled 320, twenty of the walkway's copies). Held there the scene stands its towers as the frame does, but the shape pass then reads our door nowhere in its targets (its outline 29 px, its depth none) while the plain shot draws it, so the hold waits on that",
    },
    {
      method:
        "genshin:parity passes login --pass Shape with login-door-session held at heldScrolled 320, on a parity page started fresh with no source edited under it",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Our door reads as it does unheld (outline 0.107 px, depth 0.0001, normal 7.5 degrees): the hold changes nothing the door stands on, the walkway's phase at 320 being the door's rest's at 144, and getStartGlide holding the door ahead at none either way. The door lost earlier was not reproduced; no source the scene reads changed between the two runs, so it was the page's state and not the hold's. The page's log shows Vite swapping the scene's component in place when data it reads is rewritten, rather than reloading the page, and a scene set up again under a tool's held clock never lifts its door past the start of its rise, which would leave ours off where the exports' stands. Held there, the towers' normals read 10.62 degrees against the gate's 10, a near column standing doubled (Towers.reference.ts), and with its axis fixed every shape gate holds, so the frame is held at 320. The passes then stop at the surface as before, its structure read over other towers: the bridges 0.049 against 0.033, the towers 0.101 against 0.026 and the walkway 0.083 against 0.017",
    },
  ],
  openQuestions: [
    "Whether the towers' row tiles at its 200 metres: their fitted field spans about 300 along the glide",
    "Which of the towers' row stands at the door frame's left edge: the recording's is thin and dark with many rings, the exports' nearest there wide and arched",
  ],
};
