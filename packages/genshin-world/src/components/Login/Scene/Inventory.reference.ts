import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// What the login's blocks hold that the scene draws, plays or is set by, each piece claimed by the part of ours that
// Stands for it or named as not yet drawn: the inventory pass of the recreation passes
export const inventoryTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "genshin:assets behaviours login, every MonoBehaviour of the login's blocks, grouped by script and counted by field kind, MonoLoginScene, the post profile and a click's script read whole",
      outcome: InvestigationOutcome.Found,
      result:
        "The scene's own settings are in its scripts' bytes, most never read. MonoLoginScene holds, besides the rows' prefabs, counts and lengths, two speeds of 3.5 and 4.5 beside two easing curves, a run of floats (3, 5, 2, 4, 4.5, 8, 17, 19, 9.5, 18, 23, 6) where the walkway's rise was read by eye at 3 metres down and 17.5 ahead, the CloudEffect and LightShaft anchors, Eff_SceneCamera_Cloud_Login, and four god ray and four halo effects, one an hour. EnviroSky, LoginSceneEnviro and LoginSceneWeather hold about 120 gradients, 750 curves and 1900 colours between them, keyed by the time of day, pointing at the sun, the moon, the cloud layer, the three cloud emitters, the cloud shadow plane, the galaxy and the aurora: the environment's settings by hour, where the sky's, the clouds', the light's and the haze's colours have been solved off the recordings. The post profile (SceneCamera(Clone) Profile) chains MHYBloom_Z, MotionBlur, WaterRipple, ToonLightBuffer, FrameTransition and ElementView, with no colour grading among them. The buttons carry MonoAudioPointerClickEvent2D and MonoAudioButtonClickEvent2D, each a few integers naming the sound it plays, beside MonoWwiseAudio and MonoAudioTimeSynchronizer",
    },
  ],
  openQuestions: [
    "Which field of MonoLoginScene each of its floats and curves is: the glide's speeds and easing against the measured 3.03 and 3.7 metres a second, and the walkway's rise against its eye-read sink and distances",
    "Which of EnviroSky's, LoginSceneEnviro's and LoginSceneWeather's gradients and curves is which of the environment's settings, each sampled at an hour against the colour solved off that hour's recording",
    "Whether the login draws any colour grade, its post profile holding none, and MHYBloom_Z's threshold, intensity and tint",
    "Which sound each button's click script names, through the Wwise banks' events",
    "Every mesh, material and effect the exports hold claimed by a part of ours or named as not drawn: Cloud_LOD0, the cloud layer's dome, was not drawn, nor the god rays, halos, galaxy and aurora",
  ],
};
