import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The follow camera behind the character: its pivot, field of view, pitch limits, the wheel's range and how it eases
export const cameraTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The AnimeGameData repository's BinOutput searched for a camera config, by its directory listings and its tree, and ConfigGlobalValues, ConfigGlobalCombat and the PC graphics settings read for a field of view or a pitch",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "The dump holds the first-person camera of a co-op talk (ConfigGlobalValues' camFOV per body), the side-scroller's, the music game's, a scene look's and every scripted shot's path under Data/Camera, but no follow camera: its config is an asset, not a BinOutput table",
    },
    {
      method: "The asset index searched for camera names, then the community's 2.6 index for their paths and types",
      outcome: InvestigationOutcome.Found,
      result:
        "CameraProfile is a MonoBehaviour in 00/13980307.blk, the 2.6 index's Data/Camera/CameraProfile of type MoleMole.CameraProfile. The MainCamera prefab's block holds no Camera component, so the field of view is set at run time",
    },
    {
      method:
        "The profile exported raw and its words named by the il2cpp dummy scripts of a 2022 build (github.com/fengjixuchui/WorldReverse: CameraProfile, PipelineCameraModuleConfig, PipelineCameraGlobalConfig and CameraModuleType), each field's place checked by its neighbours' shapes",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The profile is a count, the camera module each config serves (Initialize, FollowRotate, Zoom and the rest by CameraModuleType's numbers), a config per module of one size, and the global config last. The global config keeps the 2022 order with twelve fields added, its K and B pairs falling on pairs and every flag on a 0 or a 1: MIN_ELEVATION_ANGLE -89 and MAX_ELEVATION_ANGLE 89 degrees, MIN_CAMERA_ZOOM_RADIUS 1 m, MAX_RADIUS_MOVING 6 m (climbing 8, flying 6, combat 8), SETTING_RADIUS_ADJUST_MIN_PC 0.5 and MAX_PC 2, a span of 1.5 m as the Settings wiki's default distance of 4.5 to 6.0 spans, whose top is MAX_RADIUS_MOVING, so the setting is metres of the arm. `genshin:assets camera` reads it and throws once a flag reads anything but 0 or 1",
    },
    {
      method:
        "The module configs aligned to the 2022 names the same way, word by word from their first field until a flag falls on another value",
      outcome: InvestigationOutcome.Found,
      result:
        "Each keeps the 2022 order through the Kalman filters, the radius's lerp-back ratios, the per-body look-at height adjustments and the slope's limits (70 and -70 degrees), then breaks where the build added fields. What the game computes from each lives in code that no dump holds",
    },
    {
      method:
        "Published field-of-view tools read for the value they recognise as the world camera's (github.com/lanylow/genshin-utility, its set_fieldOfView hook)",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The tool takes the game's own call setting 45 as the world camera's, so the follow camera's vertical field of view is 45 degrees",
    },
    {
      method:
        "Frames of the follow camera with the character standing on its feet, the screen's centre row read against the top of the head and the soles: session-2.mp4 at its 153rd second (Xilonen, a tall female body, the camera about 3.5 degrees down by the lean of a pillar's edges at the frame's side), world-pickup.mkv at its 3rd and 21st (Chongyun, a medium male body, the camera looking further down)",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The centre row stands at 0.69 of Xilonen's height above her soles, and at 0.70 and 0.66 of Chongyun's, which a camera 20 to 30 degrees down foreshortens low by 0.02 to 0.04: the pivot stands at 0.70 of the body's height, within 0.02",
    },
  ],
  openQuestions: [
    "How far a notch moves the camera: DELTA_TO_ZOOM_RATIO is 3 and the Zoom module eases a velocity, so the notch's metres are read off a recording zoomed a notch at a time (follow-camera.mkv)",
    "How fast the eye eases back out once a wall it was pulled in by clears, off the same recording",
    "The elevation a reset swings the camera to: the global config's first five words hold the default elevations and the anchor's distance in order with one added field (6.5, 0, 11.5, 15 and 8), so a reset facing a flat horizon tells whether it levels or looks 6.5 degrees down",
    "Whether the arm lengthens as the camera looks down, by ADD_RADIUS_DURING_MAX_ELEVATION's 1.5 m, off the same recording's tilt from level to straight down",
    "The default distance setting's own default, off the Settings screen's Controls tab in the interface export",
  ],
};
