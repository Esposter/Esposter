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
        "The door frame's camera, solved on the door and the walkway's wings alone, all within a dozen metres, traded the eye's height against its pitch and its distance against its field of view: it read 1.24 metres up, 10.68 short, 5.3 degrees and 51.2, near parts landing within a few pixels while every far tower and the colonnade stood too high, the colonnade some 50 pixels. With the thin pillar right of the door and two towers behind it, at the row's phase there, the ten landmarks solve to 0.98 metres over the walkway, 11.3 short of the door, 6.2 degrees up and 48.3, at 7.2 pixels root mean square, the corners' own error, and the laid-out row lands within a few pixels of the towers. At that pose the glide reads 3.45 metres a second on the title, about 4.3 once preparing, slowing by 0.66, and the walkway's settling rows stand 15 and 22 metres ahead",
      search:
        "genshin:parity parts at the door frame, zoom --grid on the recording, pose login-door-recording with doorPillarTop, doorTowerTop and doorLeftTowerTop added, place --landmarks at the solved pose, then glide again at it",
    },
    {
      found:
        "The door rises at the walkway's far end as its last blocks settle, about 12 seconds in, nothing built past it, and the glide then brakes it to its pose",
      search: "genshin:parity frames yt-rBnfA4pXw6U at 2 a second over 0 to 15 seconds",
    },
  ],
  open: [
    "Which object Ani_Login_Lift's animator is: its root's path hashes to the animator itself",
    "How the script brings the door from its anchor to the walkway: the place is measured (the door spawn's position), the motion is not",
    "Whether the towers' row tiles at its 200 metres: their fitted field spans about 300 along the glide",
    "The sky's own colours at each hour: the game's environment system sets its sky shader's _ES_ colours, top and bottom toward the sun and away, the halo, the sun's halo and the moon's glow, at run time from no asset the export holds, so they are measured; one frame's sky by least squares (genshin:parity sky) leaves its shape and its colours unsettled, the sun's direction itself measured and most of the sky under clouds and haze",
    "How the game brings the towers to the door's phase after a long idle: every recording found idles a few seconds, so the title's phase is read off its glide's length, not a rule of the script's",
    "What MonoBlockController does to each walkway piece: the rise is read by eye off the recording's far end; its raw bytes (genshin:assets behaviours login --script ^MonoBlockController$) hold its own curve",
    "Where the glide comes to rest: the recording's door frame was still slowing at 1.6 metres a second when the click came, so the rest stands a little nearer the door than its pose",
    "The day sky's pose, by the same perspective reading",
    "The wiki stills' pose: held to the glide's height, pitch and field of view, the dawn frame's near wings cannot be fitted at any depth (their 1582 pixels across put them 5.5 metres out at 51.2 degrees, their rows 6.7 at 1.24 metres and 5.29), so the stills stand lower, about a metre up, or pitched about 3 degrees; four corners on one plane leave the field of view free to run away, so the stills need landmarks at another depth. Scored at the glide's pose the four stills read 0.02 to 0.04 of FLIP worse than at the old perspective reading's (44.6 degrees, 5.6 up), while the door frames read better; both recordings glide at 51.2 (the English one's title paces steadily only there, and the user's current build agrees), so the stills' camera is theirs to solve, not the scene's",
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
    dawnDuskNightSkies: {
      block: "login-dawn, login-dusk, login-night",
      kind: GameSourceKind.Capture,
      name: "File:Login Menu Dawn.png, File:Login Menu Dusk.png, File:Login Menu Night.png",
      role: "The flight's first pose under three skies, which share it",
    },
    daySky: {
      block: "login-day",
      kind: GameSourceKind.Capture,
      name: "File:Login Menu Day.png",
      role: "The day sky, at a pose of its own",
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
      role: "The stone: does not parse; its material's properties are a physically based set",
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
