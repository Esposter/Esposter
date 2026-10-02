import type { ComponentReference } from "genshin-interface";

import { GameSourceKind } from "genshin-interface";

// The login scene's sources in the game's data, what every search over them found, and what is still open. Poses are
// In three's axes (metres) with the heading, pitch and field of view in degrees; distances in pixels at 480 wide
export const reference: ComponentReference = {
  findings: [
    {
      found: "Shape 0.318, the same as our kits': the camera, not the kits, is the first loss",
      search:
        "The exports drawn from the scene's derived pose (0, 15.2, 105, heading 0, pitch -3.37, fov 45) against login-day",
    },
    {
      found:
        "5.23 px at (-5.35, 2.83, 81.07), heading 140.7, pitch -2.0, fov 46.1: facing almost nothing. Rejected: the reference's clouds are most of its edges, and a flat frame's noise read as edges; the edge floor was added",
      search:
        "solve-camera login-day, edge distance, stage and walkway at the origin: x -8 to 8 by 4, y 2 to 14 by 4, z -60 to 140 by 20, heading 0 to 330 by 30 (2640 poses), then the simplex from the best three",
    },
    {
      found:
        "9.27 px at (3, 6, 100), heading 10, pitch -3, against 11.23 px at the derived pose: the walkway fills the frame's foot where the reference's is narrow. Rejected",
      search:
        "The same with the edge floor: x -6 to 6 by 3, y 2 to 14 by 4, z 20 to 160 by 20, heading -30 to 30 by 10 (1120 poses)",
    },
    {
      found:
        "Stage: cost 5.62 at (-0.17, 17.37, 207.69), heading -2.5, pitch 10.4, fov 60.9; Build_All: 9.13. Its render matched neither: too weak a signal on its own",
      search:
        "A landmark solve from six hand-read tower positions, widths and tops and the walkway's edges at the frame's foot, 400000 random poses then a local refinement, no rendering",
    },
    {
      found:
        "Build_All's towers are several hundred metres tall, spread far and cut off above the cloud sea; the stage's towers are the recording's kinds",
      search:
        "A contact sheet: both arrangements from each end of the walkway (z 75 and -75), 5 metres up, pitch 3, at eight headings",
    },
    {
      found:
        "7.74 px at (-4.56, 13.35, -0.87), heading 219.6, pitch 3.2, fov 45.4: into the tower forest with no walkway. Rejected: more towers always find a nearer line",
      search:
        "solve-camera login-dawn, login-dusk, login-night by the towers' long vertical lines, Build_All with the walkway: x -8 to 8 by 4, y 1 to 13 by 4, z -90 to 150 by 30, heading 0 to 340 by 20 (3240 poses)",
    },
    {
      found: "14.22 px: the walkway lines up, the towers float cut off above the cloud sea and crowd the frame",
      search: "Build_All from (0, 12.5, -110), heading 180, pitch 3",
    },
    {
      found:
        "8.71 px at (3.99, 8.98, 20.06), heading 5.0, pitch 3.0, fov 45.0: at the end of the range searched, with the towers on the wrong sides. Rejected",
      search:
        "The same three skies by lines over the stage, on the walkway facing the door: x -4 to 4 by 4, y 8 to 16 by 4, z 20 to 160 by 20, heading -20 to 20 by 5 (648 poses)",
    },
    {
      found: "12.39 px: almost no towers that way; the forest lies toward -z",
      search: "The stage from z -20 facing +z (heading 180)",
    },
    {
      found:
        "13.48 px but a gothic tower near the left and a column and arched bridge on the right, as the reference; the walkway still wrong. Its search (729 poses) was stopped once the walkway's place was found wrong",
      search: "The stage's placements mirrored across its axis, from (-4, 9, 20), heading -5",
    },
    {
      found:
        "The door is under the stage at (0, -5, 32.3), 0.4 scale, 8 by 13.5 metres; the walkway's root is dumped at the origin spanning z -75 to 72, so the door stood mid-walkway: the walkway's own parent is in a block not read",
      search: "The door's placement against the walkway's",
    },
    {
      found:
        "12.22 px, and the recording's composition: the walkway straight to the door on its dais, towers either side, arched bridges to the right",
      search: "The walkway moved 107.3 metres along +z so its far end meets the door, from (0, 12, 170), heading 0",
    },
    {
      found: "Dawn, dusk and night share one; the day sky is another",
      search: "Which references share a pose, by their towers' lines",
    },
    {
      found:
        "None: Start and End hold a constant 50-metre lift, Ani_Login_Lift moves between them; the flight is the MonoLoginScene script's",
      search: "A clip for the flight down the walkway",
    },
    {
      found:
        "Rows within noise of each other: a loss table priced at a pose that fits nothing means nothing, so it waits on the pose",
      search: "genshin:parity attribute over dawn, dusk and night at (0, 5, 75), heading 0, pitch 3, Build_All witness",
    },
    {
      found:
        "Ani_LogginScene_Door01_Liftting is the door assembling itself over 1.33 s at the flight's end, its pieces rising about 60 metres from below into place; Ani_Login_Lift raises its animator's root 50 metres over a second, easing in and overshooting to 52.5 before settling",
      search: "genshin:assets clips login: what the scene's clips move",
    },
    {
      found:
        "The click lights the door from its middle while the camera pushes toward it, the door growing about 1.7 times in a third of a second and gathering speed, under the white",
      search: "The recording's last second at 15 frames a second (13.6 s to 15.2 s)",
    },
    {
      found:
        "The walkway's top stood 0.33 metres up and the door's foot 5 metres down, so 5.3 of the door's 13.5 metres sank into the walkway and it read short: the walkway's lost parent took its height as well as its place, and the walkway moves 5.33 metres down to meet the door's foot",
      search: "Why the door read short against the walkway",
    },
    {
      found:
        "The walkway 5.33 metres down and 112.3 along did not fix it: the door's width over the walkway's is 0.9 in the recording's last pose and 0.4 in ours, a ratio no camera changes, so the walkway was 2.5 times too large",
      search: "Why the door still read short with the walkway at its foot",
    },
    {
      found:
        "LoginScene holds BridgeBeginNode, DoorNode, SceneBeginNode and ModelCamera at one scale, with LightShaft, MainLight, Moon, Sun, Clouds and Atmosphere: the login hangs the walkway and the door at one scale, so the walkway's lost parent is the door's, 0.4 scale 5 metres down, which brings its end to the door with no shift along its axis",
      search: "The placements under the roots LoginScene, LoginCamera and Eff_SceneCamera_Cloud_Login",
    },
    {
      found:
        "Every door-stage solve scored the scene's own camera: the scene's bindings rewrite its camera on each frame the stage animates, so the pose set was lost before the shot; the witness now freezes the camera's matrix and refuses a pose the drawn matrix does not hold",
      search: "Why two door renders at poses 90 metres apart came out identical",
    },
    {
      found:
        "Door end: 45.3 metres short of the door, 3.94 over the walkway, pitched 6.9 up, a 51.2 degree field of view; dawn: 72.1 short, 3.98 over, 5.6 up, 44.6. From the crossbars' and the door's pixel widths (focal length and distance) and the rows they stand at (eye height); the witness render at each lines the walkway, crossbars and door up on the capture",
      search:
        "The flight's first and last poses by perspective from the walkway's known widths, in place of the line-distance search",
    },
    {
      found:
        "12.67 to 12.75 px from heights 10 metres apart, and every one scored the scene's own camera: the line distance does not pin height and was never checked against a render",
      search:
        "solve-camera login-door by vertical and horizontal lines: y -4 to 10 by 2, z 45 to 105 by 15, pitch -3 to 6 by 3, fov 42.76 and 55 (320 poses)",
    },
    {
      found:
        "SceneObj is in 00/11790361.blk at a tenth of LoginScene's scale, and its five children are in the same file: Atmosphere, ModelCamera, and SceneBeginNode, BridgeBeginNode and DoorNode, empty anchors with no children and no renderer, SceneBeginNode turned a quarter about y. No block is missing: the login's towers are a prefab MonoLoginScene spawns into SceneBeginNode at run time, and the walkway and the door into their own nodes",
      search: "SceneObj's children in the login block's Transform and GameObject dumps, by their path IDs",
    },
    {
      found:
        "Its raw bytes (genshin:assets behaviours) point at the five anchors SceneBeginNode, BridgeBeginNode, DoorNode, CloudEffect and LightShaft, then at three records of a prefab, an integer and a float: LoginScene_Build_All in 16000354 (3, 200), LoginScene_Bridge01_Vo in 16000354 (3, 16) and Eff_SeaOfCloud_Login (2, 300), then at LoginScene_Door01_Vo, the door prefab's root in 11790361. Two curves sit before them at 0x70 (1 falling to 0.02 over a second) and 0xa4 (0.2 rising to 1 over half a second), and two runs of four hours at 0x178 (4.5, 8, 17, 19) and 0x18c (9.5, 18, 23, 6)",
      search: "What MonoLoginScene spawns into its anchors, from the pointers in its raw serialized bytes",
    },
    {
      found:
        "Set as the component's spawns, the tree shows the login as it draws: LoginScene_Build_All's towers, bridges and pillars under SceneBeginNode (237, -180, -533 in SceneObj's units, a quarter turn about y), the walkway's 23 pieces under BridgeBeginNode at SceneObj's origin, and the door prefab under DoorNode (-262, 341, 700), all at SceneObj's tenth. Every walkway piece carries a MonoBlockController, a script of its own, so the walkway's blocks are moved at run time",
      search: "genshin:assets tree login --root SceneObj with the three spawns applied",
    },
    {
      found:
        "The door's dais over the walkway at its foot, left to right along that row: 852, 861, 1058 and 1069 pixels, a cross-ratio of 1.0023, which the stage's fitted data holds (1.0000). Fitted over the spawned arrangement it reads -171: the door's anchor stands 70 metres out and 34 up from the walkway, which spans 16 metres at its anchor, so in the static layout the two never meet and the flight's arrangement is a run-time one. The re-fit was not committed. Bridges and the door fit their exports to the centimetre; the towers' fitted feet sit 6.5 metres from their objects' origins on average",
      search: "genshin:assets arrangement login, before and after a fit over the spawned arrangement",
    },
    {
      found:
        "The door alone: its dais's front feet (852, 777 and 1069, 777) and its arch's apex (959, 416), the field of view held at 51.2 from the widths, solve to 0.76 pixels root mean square, and five simplex steps on the door's part boundaries bring them from 0.66 to 0.25 pixels of the recording's edges at 480 wide: the eye at (-25.66, 36.71, -59.32), heading 3.16, pitch -2.04, 10.9 metres in front of the door and 2.6 above its foot. The walkway, the towers and the bridges draw no boundary from there, so in the static layout nothing else is in view of the door; track holds that pose across 13.5 to 14 seconds within a few centimetres",
      search:
        "genshin:parity pose login-door-recording --witness login --hold fov --refine 80 --families Door, then track",
    },
    {
      found:
        "The door's pitch was its three points' weak axis: the walkway's wings (the tops of their outer faces' ends) and its converging edges put the horizon near row 675, the camera 6 degrees up, and the door fits as well at that pitch (0.23 pixels of edge). With the door's heading and pitch held to the walkway's, the two poses place the door on the walkway's top, centred, 3.1 metres beyond the near wings' outer faces. The walkway's two pairs of wings look alike, so the solve could not tell its ends apart; ModelCamera's half turn about y says the camera looks along +z, which brings the door to the walkway's far end (its centre at 7.61 of 8). Set as the door spawn's position, one eye (-0.06, 1.27, -3.07), heading 180.5, pitch 5.29, field of view 51.2 lands both families' silhouettes at 0.81 pixels of the recording's edges at 480 wide, and the seven landmarks reproject at 5.9 pixels root mean square at 1920, the hand-read corners' own error. Scored on part boundaries the walkway read 3 to 4 pixels: its 23 blocks meet along its painted cracks",
      search:
        "genshin:parity pose login-door-recording --witness login, the wings then the door with --hold pitch,fov, then both families together on their silhouettes",
    },
    {
      found:
        "The idle title and the loading are one glide: the recording's wing pairs keep coming at the camera and passing out of frame while its walkway's far end holds the same rows (730 to 745 of 1080) for all 14 seconds, its far blocks stacked at several heights as they rise into place. The camera does not move: from every start along two wing periods, its frame at 0.6 seconds refines to the door frame's height, pitch and field of view (1.1 to 1.3 metres, 5.3 degrees, 51.0 to 51.4), so the spawn records are each row's copies and length, laid end to end and scrolled past it, the walkway's 16 its own length",
      search:
        "Slit scans of yt-rBnfA4pXw6U and yt-q2pwx24TOgA across the title and the door, then genshin:parity's refine on the walkway's edges below row 760 from z -21 to -5 over the copied witness",
    },
    {
      found:
        "At the camera's pose each ground row is a distance, so the paving's column 6.3 to 9.5 metres ahead resampled into metres and correlated frame to frame reads the glide: 3.03 metres a second, steady to 0.06 over the title's 2.4 seconds, about 3.7 once preparing (3.5 to 3.9 between 9.75 and 11), then slowing by 0.55 a second each second, a line through its last three seconds, 1.9 by 13.75 seconds, before the click rushes on at 14.4. At 44.6 degrees the same frames read anything from 1.1 to 4 metres a second, so the title shares the door's field of view. The recording stalls from 2.7 to 9 seconds as the game loads, the frames held then jumping, so only the spans around it are read",
      search:
        "genshin:parity glide login-door-recording over 0 to 2.5 and 9 to 14.5 seconds, the eye 1.24 metres up, pitched 5.29 under 51.2, its held frames picking the spans that do not stall",
    },
    {
      found:
        "The glide's path at the eye passes through the exports' own bridges and pillars at one place a loop, a pier of LoginScene_Bridge04's 0.4 metres deep 57 metres ahead of the towers' home; every arch and every space under a deck it crosses is open. Our bridges as one side's outline extruded through their depth filled those, and the camera glided into solid stone; as visual hulls they leave them open. A local refinement of the row's height on edges alone read it 0.43 metres too high from the towers' home, which the row's true phase at the door (below) undid",
      search: "genshin:assets clearance login, then genshin:parity view and film --witness at the stretch beside ours",
    },
    {
      found:
        "The towers do glide toward the camera with the walkway, a near tower growing about 1.8 times from 9 to 14 seconds, and the door frames of recordings idle for different times show them alike: the door comes to rest with the towers' row 144 metres along its loop, nine of the walkway's copies, the 2.23-scale lantern tower close to the door's right and the colonnade low behind it. Moved as one with the camera held, from where the lantern tower's bearing puts it, the row lands on login-door-recording's edges 145.8 metres along and on login-door's 144.4, the other axes scattering either way; laid at home instead, the door frame shows thin far towers and a colonnade standing high. The English recording's glide from the title to the door's rest is about 49 metres, so the title opens that far short of it",
      search:
        "genshin:parity parts login-door-recording and login-door --family Towers, view --offsets at the lantern tower's phase, then place --start=0,0,-150 on both",
    },
    {
      found:
        "The bridges and pillars stand 5 metres under where the blocks lay them. At the door frame's pose, solved on the door and the walkway's wings, the colonnade behind the door stood some 50 pixels over the recording's, and the bridge whose deck crosses the glide's path, laid where the blocks lay it, stood its deck 2.3 metres over the eye, so the glide drove into it every loop where the game's passes over it however long the title idles. Lowered 5 metres, the colonnade lands on the recording's rows and that deck passes under the walkway. A camera solved on the towers behind the door as well (0.98 metres up, 11.3 short, 6.2 degrees, 48.3, at 7.2 pixels) traded its own height and pitch for the bridges' height and stood them higher still in the glide, so the door frame's pose stands",
      search:
        "genshin:parity view --offsets on the bridges at 0, 5, 10, 14 and 18 metres beside login-door-recording, zoom --grid on the colonnade's rail, film over a whole minute of the title, and pose with doorPillarTop, doorTowerTop and doorLeftTowerTop added",
    },
    {
      found:
        "The towers stand 5 metres low with their bridges, and their row 2.47 metres toward -x and 8.94 nearer at the door. Pinned on the lantern tower's two silhouette edges at the recording's row 460 and the crowned column's top behind the door with the row's height held, no rigid move fitted, which read as each tower moving on its own; seen beside the recording, the lantern tower stood a ring too high, so its edges were pinned at the wrong height. Lowered with the bridges and moved on the edges alone, its window band, gold rings and edges land on the recording's, the crowned column within 20 pixels and the colonnade where it stood, and every hour's frame scores better. The frame's far-left tower is still another of the row's",
      search:
        "genshin:parity parts login-door-recording --family Towers, place --landmarks columnCrown,towerRightInner,towerRightOuter with --axes z, x,z and x,y,z through the door frame's pose, then view --offsets lowering the towers 5 metres beside the recording, and compare at every hour",
    },
    {
      found:
        "Every login stone material holds _ReceiveShadow 0, yet the references show the towers' shadows across the walkway, so the game shadows its stone otherwise. Drawn without the sun's shadow, the door frame's near faces solve to a sun near three times stronger and a sky light five times weaker (genshin:parity light, converged in four steps), but the door, day and night stills all score worse without the shadow, and with it back that light scores worse than the scene's; the sun's direction is not settled by the faces' shading either, every heading and elevation fitting the recording's near faces within a hundredth of the best",
      search:
        "genshin:assets material values for every LoginScene_ material, then genshin:parity light and haze login-door-recording with and without the light's shadow, and compare at every hour",
    },
    {
      found:
        "The witness smeared every texture whose coordinates run past 0 and 1 into streaks, the walkway's bricks among them, since three clamps a texture's edges where Unity tiles it; tiled, the witness's walkway shows the recording's bricks. A plan of the walkway's tops drawn through their own coordinates, on the CPU and by the witness from straight above alike, lays out its paving in metres: a middle lane of bricks 0.25 metres a course between two light strips, side lanes and wings set with pockets, and a curb, which the recording shows as dark joints and rims. Traced and drawn as lines the paving scores within a thousandth of the bare stone at every hour, as the door's traced relief does, the phone's door frame a little better: the lines are the game's own, kept for the eye",
      search:
        "genshin:parity plan login-door-recording --family Walkway at 50 and 150 pixels a metre, genshin:assets fit login with fitLoginPaving and fitLoginDoor's relief, then compare at every hour",
    },
    {
      found:
        "Each tower section shaded by the colour its mesh paints its sides there, as a share of every tower's mean, scores the phone's door frame 0.008 worse and the day and dusk worse too: the gilding reads as bright orange bands where the game's gold is a metal, dark under the diffuse light and bright only in its highlight. The door casts no shadow: at dusk the sun stands low behind it and laid its shadow down the walkway to the camera, where the recording's walkway is lit, and without it the phone's door frame and the dusk score better. A tower's shadow still lies over the wings in front of the door where the recording's are lit, yet the towers drawn without shadows score the door frames and the dusk worse, so it is the dusk sun's direction or that tower's place that is off, not its shadow",
      search:
        "genshin:assets fit login with fitSectionShades on the towers, then compare at every hour; compare with the door and then the towers casting no shadow",
    },
    {
      found:
        "The door rises at the walkway's far end as its last blocks settle, about 12 seconds in, nothing built past it, and the glide then brakes it to its pose",
      search: "genshin:parity frames yt-rBnfA4pXw6U at 2 a second over 0 to 15 seconds",
    },
    {
      found:
        "The wiki stills fit no centred camera, so they are replaced. Public recordings of the PC client idling on the title with no interface show the hours at the glide's camera: dawn (yt-sQNqMfmfkZU, 2023), day (yt-7kK6HqVfASk, 2022, its top and bottom 50 rows masked) and night (yt-PnqNza4qWzs, 2022) stand the walkway's far end on the door recording's rows, where the 2021 recordings stand it some 30 rows lower, another camera. Each frame is held at the glide's moment its towers stand at (heldScrolled): night 135 metres and dawn 132, where the lantern tower and the ringed tower frame the walkway as in the frame, peaking the shape score at 0.412 and 0.421; the day's score runs flat under its dense haze, so its 118 is where genshin:parity parts lands the exports' lantern tower and the near tower left of the walkway on its own, scoring 0.394",
      search:
        "yt-dlp searches for the login at each hour, the far end's rows across builds, then genshin:parity view of ours beside the exports at every 4 metres of the loop and compare at every metre from 120 to 142 (the day's from 100), each frame held",
    },
    {
      found:
        "Night's sky solved over the frame's clear pixels (zenith and horizon away from the sun #141a53 and #182f76, nothing toward it) scores the frame 0.042 of FLIP worse: the trim reads the bright cloud and haze low over the horizon as clouds and solves the clear sky darker than the frame's sky reads as a whole, so the night's colours stand",
      search:
        "genshin:parity sky login-night-title, set as the night's back and front colours with its shape, then compare",
    },
    {
      found:
        "On the title frames: the exposure scaled dawn and day down a quarter and night up threefold, scoring every hour better (night 0.492 to 0.460); a second step at night, nearer the median, scored worse. The day's haze from 0.04 to 0.195 moves its frame and the phone's door frame by under 0.01 either way, so the washed day is our towers' flat light, not the haze; the light's solve runs away on every hour (a sun 7700 times as blue at dawn), its lit and shaded faces read off stand-ins whose faces are not the game's",
      search:
        "genshin:parity exposure, light and fog on login-dawn-title, login-day-title and login-night-title, then compare at each step and at the day haze's densities",
    },
  ],
  open: [
    "Which object Ani_Login_Lift's animator is: its root's path hashes to the animator itself",
    "How the script brings the door from its anchor to the walkway: the place is measured (the door spawn's position), the motion is not",
    "Whether the towers' row tiles at its 200 metres: their fitted field spans about 300 along the glide",
    "The sky's own colours at each hour but the dusk's, which genshin:parity sky solves over the door recording's clear sky: the game's environment system sets its sky shader's _ES_ colours, top and bottom toward the sun and away, the halo, the sun's halo and the moon's glow, at run time from no asset the export holds, so they are measured; one frame's sky by least squares (genshin:parity sky) leaves its shape and its colours unsettled, the sun's direction itself measured and most of the sky under clouds and haze",
    "How the game brings the towers to the door's phase after a long idle: every recording found idles a few seconds, so the title's phase is read off its glide's length, not a rule of the script's",
    "What MonoBlockController does to each walkway piece: the rise is read by eye off the recording's far end; its raw bytes (genshin:assets behaviours login --script ^MonoBlockController$) hold its own curve",
    "Which of the towers' row stands at the door frame's left edge: the recording's is thin and dark with many rings, the exports' nearest there wide and arched",
    "The night's, the dawn's and the day's light apart from their exposure: the night frame shows the walkway's top moonlit and the towers' faces dark, and dawn takes nothing from the dusk's solved light; their title frames now stand at the solved camera, so genshin:parity light can read their faces",
    "The clouds over the door recording's towers, 13 to 25 degrees up: every band raised there scored the wiki stills worse, whose camera was not the recording's, so it waits on a score over the title frames",
    "The dusk sun's direction against its shadows: a tower's shadow falls over the wings in front of the door where the recording's are lit, and the faces' shading cannot settle the direction, so the shadows' own edges are the measure left",
    "The dusk sky low on the frame's left: the recording's clear sky there is almost all cloud, so the sky solved over its clear pixels draws a dark red-brown band where the recording glows gold",
    "The upper clouds' cover: the recording's sky holds about six times ours above the horizon, but a score comparing pixels prices every cloud standing elsewhere than its own, so the cover waits on a measure of its own, its spread by height",
    "The towers' gilding and windows: their colour per section scores worse painted as diffuse stone, the game's gold being a metal",
    "The dusk's light and haze together: genshin:parity fog --light on the door recording solves a sun 2.5 times as strong, a sky light a third as strong and a haze dense, dark away from the sun and bright toward it, which scores the recording 0.03 better and the dusk still 0.05 worse; drawn, both frames turn to a flat orange wall with the towers' silhouettes, where the references keep their towers lit and edged, so the bins' medians by depth, angle and facing still reward a haze that washes our towers to the frame's mean, our towers lacking the lit structure the references' carry",
    "Where the glide comes to rest: the recording's door frame was still slowing at 1.6 metres a second when the click came, so the rest stands a little nearer the door than its pose",
  ],
  sources: {
    atmosphereShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#0",
      pathId: "-5017021742717319217",
      role: "The sky dome: its gradient, top and bottom colours front and back of the sun, halos, stars and scattering, ported to createSkyNode from its decompiled vertex and pixel programs",
    },
    cloudLayerShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Enviro_Cloud_Layer_Mat's shader",
      pathId: "5100823853164162496",
      role: "The cloud layer",
    },
    cloudParticleShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#10",
      pathId: "7325196393018652092",
      role: "The three cloud emitters' particles: atlas, curl, age dissolve, light and dark colours, rim",
    },
    dawnTitle: {
      block: "yt-sQNqMfmfkZU.mp4 at 18 s (login-dawn-title)",
      kind: GameSourceKind.Capture,
      name: "Genshin Impact - Login Background. Morning. [noOST], a 2023 PC recording idling on the title with no interface",
      role: "The dawn sky over the title, at the camera the door recording solves",
    },
    dayTitle: {
      block: "yt-7kK6HqVfASk.mp4 at 8 s (login-day-title)",
      kind: GameSourceKind.Capture,
      name: "Starting Celestia Door (Day), a 2022 PC recording idling on the title with no interface, its top and bottom 50 rows masked",
      role: "The day sky over the title, at the camera the door recording solves",
    },
    door: {
      block: "00/04803507.blk",
      kind: GameSourceKind.Transform,
      name: "LoginScene_Door01_Vo",
      role: "The door, under the stage at 0.4 scale, 32 metres along its axis",
    },
    doorCapture: {
      block: "login-door",
      kind: GameSourceKind.Capture,
      name: "File:Login Menu Door and Platform.png",
      role: "The flight's last pose: the door on its dais filling most of the frame",
    },
    doorRecording: {
      block: "yt-rBnfA4pXw6U.mp4 at 14 s (login-door-recording)",
      kind: GameSourceKind.Capture,
      name: "The English recording's last pose of the current build",
      role: "The flight's last pose at 16:9, with the door's and the walkway's widths the arrangement is checked by",
    },
    doorRise: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_LogginScene_Door01_Liftting",
      role: "The door assembling itself at the flight's end, its pieces rising into place over 1.33 s",
    },
    flight: {
      block: "00/16000354.blk",
      kind: GameSourceKind.MonoBehaviour,
      name: "MonoLoginScene",
      role: "The flight down the walkway: fieldless, so its path is solved from the captures",
    },
    gradingTables: {
      block: "00/00035183.blk",
      kind: GameSourceKind.Texture,
      name: "Stages_*_LUT",
      role: "The game's grading tables; which one the login uses is its fieldless post-processing profile's",
    },
    lift: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_Login_Lift",
      role: "One root lifted 50 metres over a second at the login's end, between the Start and End clips",
    },
    loginScene: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Transform,
      name: "LoginScene",
      role: "The login's own root: its walkway's and door's nodes at one scale, its camera, sun, moon and sky",
    },
    meshes: {
      block: "00/02842276.blk",
      kind: GameSourceKind.Mesh,
      name: "LoginScene_*",
      role: "The towers, bridges, pillars, walkway and door, and their Diffuse, Normal, SMBE and Height textures",
    },
    nightTitle: {
      block: "yt-PnqNza4qWzs.mp4 at 12 s (login-night-title)",
      kind: GameSourceKind.Capture,
      name: "Starting Celestia Door (Night), a 2022 PC recording idling on the title with no interface",
      role: "The night sky over the title, at the camera the door recording solves",
    },
    recording: {
      block: "yt-rBnfA4pXw6U.mp4",
      kind: GameSourceKind.Capture,
      name: "GENSHIN IMPACT | CELESTIA DOOR | LOADING SCREEN",
      role: "The whole flight at 1080 high, an older build: the walkway straight to the door, towers either side",
    },
    stage: {
      block: "00/04803507.blk",
      kind: GameSourceKind.Transform,
      name: "CharacterSelectSceneNew",
      role: "The login's arrangement of towers, bridges, pillars and door at 0.4 scale",
    },
    stoneShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "LoginScene_* materials' shader",
      pathId: "-8796901447730824398",
      role: "The stone: does not parse; its material's properties are a physically based set, specular and rim-lit with no outline, fitted per family (fitLoginStone) into createStoneMaterial",
    },
    uberShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#82",
      role: "The frame after the scene: bloom, grading, distortion, and the final pass through a 3D table",
    },
    walkway: {
      block: "00/04803507.blk",
      kind: GameSourceKind.Transform,
      name: "LoginScene_Bridge01_Vo",
      role: "The walkway, 20 metres wide at its own scale, a root dumped at the origin: it hangs at the door's 0.4 scale, 8 metres wide",
    },
  },
};
