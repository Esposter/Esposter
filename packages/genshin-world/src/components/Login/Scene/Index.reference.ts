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
  ],
  open: [
    "Which object Ani_Login_Lift's animator is: its root's path hashes to the animator itself",
    "Which prefab MonoLoginScene spawns into SceneBeginNode, BridgeBeginNode and DoorNode, from the pointers in its raw serialized bytes, and so the towers' arrangement round the walkway",
    "The day sky's pose, by the same perspective reading",
  ],
  sources: {
    atmosphereShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#0",
      pathId: "-5017021742717319217",
      role: "The sky dome: its gradient, top and bottom colours front and back of the sun, halos, stars and scattering",
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
