import type { ComponentReference } from "genshin-interface";

import { arrangementTopic } from "#src/components/Login/Scene/Arrangement.reference";
import { cameraTopic } from "#src/components/Login/Scene/Camera.reference";
import { displayTopic } from "#src/components/Login/Scene/Display.reference";
import { doorTopic } from "#src/components/Login/Scene/Door.reference";
import { inventoryTopic } from "#src/components/Login/Scene/Inventory.reference";
import { lightTopic } from "#src/components/Login/Scene/Light.reference";
import { scoringTopic } from "#src/components/Login/Scene/Scoring.reference";
import { skyTopic } from "#src/components/Login/Scene/Sky.reference";
import { towersTopic } from "#src/components/Login/Scene/Towers.reference";
import { walkwayTopic } from "#src/components/Login/Scene/Walkway.reference";
import { GameSourceKind } from "genshin-interface";

// The login scene's sources in the game's data, and its topics, each with what every investigation found and what
// Is still open. Poses are in three's axes (metres) with the heading, pitch and field of view in degrees; distances in
// Pixels at 480 wide
export const reference: ComponentReference = {
  sources: {
    atmosphereShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#0",
      pathId: "-5017021742717319217",
      role: "The sky dome: its gradient, top and bottom colours front and back of the sun, halos, stars and scattering, ported to createSkyNode from its decompiled vertex and pixel programs",
    },
    bloomShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#90",
      role: "The bloom: the threshold prefilter, the downsamples and blurs, the four levels composed and the last pass mixing it in",
    },
    cloudLayerShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#8",
      pathId: "5100823853164162496",
      role: "The cloud layer Enviro_Cloud_Layer_Mat draws over the sky on Cloud_LOD0, a dome 0.94 across and 1.35 high: a weather map, a scrolled Voronoi density bent by curl, a normal map lighting each cloud between its light and dark colours, and cirrus wisps, its coverage, opacity and colours set at run time",
    },
    cloudParticleShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#10",
      pathId: "7325196393018652092",
      role: "The three cloud emitters' particles: atlas, curl, age dissolve, light and dark colours, rim",
    },
    dawnTitle: {
      capture: "yt-sQNqMfmfkZU.mp4",
      kind: GameSourceKind.Capture,
      name: "Genshin Impact - Login Background. Morning. [noOST], a 2023 PC recording idling on the title with no interface",
      parityReference: "login-dawn-title",
      role: "The dawn sky over the title, at the camera the door recording solves",
    },
    dayTitle: {
      capture: "yt-7kK6HqVfASk.mp4",
      kind: GameSourceKind.Capture,
      name: "Starting Celestia Door (Day), a 2022 PC recording idling on the title with no interface, its top and bottom 50 rows masked",
      parityReference: "login-day-title",
      role: "The day sky over the title, at the camera the door recording solves",
    },
    deferredShadingShader: {
      block: "00/00612967.blk",
      kind: GameSourceKind.Shader,
      name: "Hidden/Internal-DeferredShading",
      role: "The deferred lighting every stone's G-buffer is lit by: the sun through the toon ramp, the sky's spherical harmonics, the reflection cube and a GGX highlight, exported unparsed (Shader:Export)",
    },
    door: {
      block: "00/04803507.blk",
      kind: GameSourceKind.Transform,
      name: "LoginScene_Door01_Vo",
      role: "The door, under the stage at 0.4 scale, 32 metres along its axis",
    },
    doorCapture: {
      kind: GameSourceKind.Capture,
      name: "File:Login Menu Door and Platform.png",
      parityReference: "login-door",
      role: "The flight's last pose: the door on its dais filling most of the frame",
    },
    doorRecording: {
      capture: "yt-rBnfA4pXw6U.mp4",
      kind: GameSourceKind.Capture,
      name: "The English recording's last pose of an older build",
      parityReference: "login-door-recording",
      role: "The flight's last pose at 16:9, with the door's and the walkway's widths the arrangement is checked by",
    },
    doorRise: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_LogginScene_Door01_Liftting",
      role: "The door assembling itself at the flight's end, its pieces rising into place over 1.33 s",
    },
    doorSession: {
      capture: "session-2.mp4",
      kind: GameSourceKind.Capture,
      name: "This machine's recording of the current build (7.1) at 21.5:9, from the splash to the door at night",
      parityReference: "login-door-session",
      role: "The current build's camera and arrangement: the door a moment before its rest, the towers at the session's phase",
    },
    environment: {
      block: "00/11790361.blk",
      kind: GameSourceKind.MonoBehaviour,
      name: "EnviroSky",
      role: "The environment by the time of day, beside LoginSceneEnviro and LoginSceneWeather in the same block: gradients, curves and colours for the sky, the clouds, the light and the haze, pointing at the sun, moon, cloud layer and emitters",
    },
    flight: {
      block: "00/16000354.blk",
      kind: GameSourceKind.MonoBehaviour,
      name: "MonoLoginScene",
      role: "The flight down the walkway: its rows' prefabs, counts and lengths, two speeds and easing curves, the walkway's rise and the hours' god rays and halos, in raw bytes whose fields are read by their shapes",
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
      role: "Each walkway block lifted 50 units, 5 metres at the walkway's tenth, over a second on its own animator as it rises into place",
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
      capture: "yt-PnqNza4qWzs.mp4",
      kind: GameSourceKind.Capture,
      name: "Starting Celestia Door (Night), a 2022 PC recording idling on the title with no interface",
      parityReference: "login-night-title",
      role: "The night sky over the title, at the camera the door recording solves",
    },
    postProfile: {
      block: "00/11790361.blk",
      kind: GameSourceKind.MonoBehaviour,
      name: "SceneCamera(Clone) Profile",
      role: "The login's post-processing: MHYBloom_Z, MotionBlur, WaterRipple, ToonLightBuffer, FrameTransition and ElementView, with no colour grading",
    },
    recording: {
      capture: "yt-rBnfA4pXw6U.mp4",
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
      role: "The stone, miHoYo/Scene/Login Base: AnimeStudio's parser refuses it, so its programs come from its unparsed raw export (Shader:Export); its material's properties are a physically based set, specular and rim-lit with no outline, fitted per family (fitLoginStone) into createStoneMaterial",
    },
    uberShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#88",
      role: "The frame after the scene: the bloom added, the white balance, the bloom's tone curve and the sRGB encode, with the 3D table only on the wide-range path",
    },
    walkway: {
      block: "00/04803507.blk",
      kind: GameSourceKind.Transform,
      name: "LoginScene_Bridge01_Vo",
      role: "The walkway, 20 metres wide at its own scale, a root dumped at the origin: it hangs at the door's 0.4 scale, 8 metres wide",
    },
  },
  topics: {
    arrangement: arrangementTopic,
    camera: cameraTopic,
    display: displayTopic,
    door: doorTopic,
    inventory: inventoryTopic,
    light: lightTopic,
    scoring: scoringTopic,
    sky: skyTopic,
    towers: towersTopic,
    walkway: walkwayTopic,
  },
};
