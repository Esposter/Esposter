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
    {
      method:
        "genshin:parity passes login's inventory measure: each renderer of the exports, its mesh and materials, claimed by the login fixture's families, its stand-ins or the parts it names as not drawn",
      outcome: InvestigationOutcome.Found,
      result:
        "Every renderer is claimed: the towers, bridges, walkway and door by their families, the sky's dome, moon and stars by the scene's sky, and five named as not drawn, the door's two auras on their cones, the aurora and the cloud layer on the one dome, and the galaxy. The cloud emitters, the god rays and halos and the sounds are effects and banks, which the measure does not read yet",
    },
    {
      method:
        "genshin:assets behaviours login with the scanner reading every gradient by its tail first, then each of LoginSceneEnviro's, EnviroSky's and LoginSceneWeather's curves and gradients read at given times (--at)",
      outcome: InvestigationOutcome.Found,
      result:
        "MonoLoginScene's four floats at 0x18c to 0x198 (9.5, 18, 23 and 6) are the login's hours by the clock, the day's, the dusk's, the night's and the dawn's, after its four bounds (4.5, 8, 17 and 19): as shares of a day, 0.396, 0.75, 0.958 and 0.25, exactly where LoginSceneEnviro's gradients hold their keys. So every setting the environment keeps by the time of day reads at each hour with --at 0.25,0.3958,0.75,0.9583. The scripts hold 71, 66 and 81 gradients and some 750 curves, most at Enviro's defaults (white or black, flat)",
    },
    {
      method:
        "behaviours login --at 0.25,0.3958,0.75,0.9583 over the three environment scripts, every curve whose night value is neither none nor one listed, then genshin:parity layer login-door-session (held with the cloud layer's port) with the layer's coverage held at each night value a candidate curve reads, its opacity, tiling and wisps solved around it",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Few curves move with the hour. LoginSceneWeather's 0x6280 and 0x62e8 rise from dawn to day and fall to night (0.32, 0.65, 0.46, 0.27 and 0.38, 1.03, 0.5, 0.35), and its 0x6358 and 0x63c0 run as twelve and three times the time of day; LoginSceneEnviro's 0x48b0 (0.71, 0.54, 0.5, 0.45) and 0x4948 (1.27, 1, 0.33, none) follow its four cloud colour gradients, beside a flat 0.51 at 0x4858. Held at 0.27 the layer's cover stands 0.221 off the night's (gate 0.074) and its clear sky 6.5 ΔE; at 0.45, 34.6 ΔE, its clouds 1.4 times their sky against 7.6; at 0.51 its opacity solves to none and the wisps veil the sky (8.5 ΔE). Each scores far worse than the free solve's 0.16, so none is the coverage as the port reads it; the port's coverage may stand in another range than the curves, or the shader's _ES_ values may be these curves composed with the weather's",
    },
  ],
  openQuestions: [
    "Which field of MonoLoginScene each of its remaining floats and curves is, its two speeds named the title's and the preparing glide's (Camera.reference.ts): the glide's easing, and the walkway's rise against its eye-read sink and distances",
    "Which of EnviroSky's, LoginSceneEnviro's and LoginSceneWeather's gradients and curves is which of the environment's settings, each sampled at an hour against the colour solved off that hour's recording",
    "Whether the login draws any colour grade, its post profile holding none, and MHYBloom_Z's threshold, intensity and tint",
    "Which sound each button's click script names, through the Wwise banks' events",
    "Every effect, clip and sound the exports hold claimed by a part of ours or named as not drawn, as every renderer is: the cloud emitters, the god rays and the halos",
  ],
};
