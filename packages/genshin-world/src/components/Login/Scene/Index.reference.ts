import type { ComponentReference } from "#src/models/reference/ComponentReference";

import { GameSourceKind } from "#src/models/reference/GameSourceKind";

// The login scene's sources in the game's data, what every search over them found, and what is still open
export const reference: ComponentReference = {
  findings: [
    {
      found:
        "A pose facing nothing: a reference's clouds are most of its edges, and a flat frame's noise read as edges",
      search: "The four skies' camera by edge distance over the stage",
    },
    { found: "Only a little nearer than the derived pose", search: "The same with an edge floor" },
    { found: "Too weak a signal on its own", search: "A landmark solve from hand-read tower tops" },
    {
      found: "Build_All's towers are too large and too spread; the stage's are the recording's kinds",
      search: "A contact sheet of both arrangements at eight headings from each end of the walkway",
    },
    {
      found: "A pose into the tower forest with no walkway: more towers always find a nearer line",
      search: "Dawn, dusk and night by the towers' long vertical lines over Build_All",
    },
    {
      found: "A pose at the end of the range searched, still not the reference",
      search: "The same over the stage, constrained to the walkway facing the door",
    },
    { found: "Towers on the reference's sides, the walkway still wrong", search: "The stage mirrored across its axis" },
    {
      found: "The door stands mid-walkway: the walkway's root is dumped at the origin, its parent in a block not read",
      search: "The door's placement against the walkway's",
    },
    {
      found: "The recording's composition: the walkway straight to the door on its dais, towers either side",
      search: "The walkway moved along the stage's axis so its far end meets the door",
    },
    { found: "Dawn, dusk and night share one pose; the day sky is another", search: "Which references share a pose" },
    {
      found: "Not a clip: the flight is the MonoLoginScene script's, so its path is solved from the captures",
      search: "A clip for the flight down the walkway",
    },
  ],
  open: [
    "The walkway's exact offset along the stage's axis, and the door's heading, solved on the door reference",
    "The dawn, dusk and night pose with the walkway moved, on the towers' lines; then the day's",
  ],
  sources: {
    atmosphereShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#0",
      pathId: "-5017021742717319217",
      role: "The sky dome: its gradient, top and bottom colours front and back of the sun, halos, stars and scattering",
    },
    cloudParticleShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#10",
      pathId: "7325196393018652092",
      role: "The three cloud emitters' particles: atlas, curl, age dissolve, light and dark colours, rim",
    },
    cloudLayerShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Enviro_Cloud_Layer_Mat's shader",
      pathId: "5100823853164162496",
      role: "The cloud layer",
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
      role: "The walkway, 20 metres wide, a root dumped at the origin: its place is solved from the door",
    },
  },
};
