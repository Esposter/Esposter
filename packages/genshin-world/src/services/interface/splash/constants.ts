import type { SplashTiming } from "#src/models/interface/splash/SplashTiming";

// Measured from a 60-frame recording of the game's window from its first frame, each fade read as a curve over the
// Logo's or the notice's region (`luma`). The recording opens on the publisher's logo already shown, so its fade in
// Is taken as its fade out mirrored and its hold is the least the recording shows. The white between the two logos is
// The game loading, held as long as it took there
export const PUBLISHER_SPLASH_TIMING: SplashTiming = {
  fadeInEasing: "linear",
  fadeInMs: 800,
  fadeOutEasing: "linear",
  fadeOutMs: 800,
  holdMs: 1733,
  whiteAfterMs: 4033,
};
export const TITLE_SPLASH_TIMING: SplashTiming = {
  fadeInEasing: "linear",
  fadeInMs: 900,
  fadeOutEasing: "ease-in-out",
  fadeOutMs: 333,
  holdMs: 2100,
  whiteAfterMs: 0,
};
export const HEALTH_NOTICE_TIMING: SplashTiming = {
  fadeInEasing: "ease-in-out",
  fadeInMs: 667,
  fadeOutEasing: "ease-out",
  fadeOutMs: 667,
  holdMs: 3350,
  whiteAfterMs: 267,
};
// The English client's notice, word for word
export const HEALTH_NOTICE_TITLE = "WARNING: READ BEFORE PLAYING";
export const HEALTH_NOTICE_PARAGRAPHS: readonly string[] = [
  "A very small percentage of individuals may experience epileptic seizures when exposed to certain visual images, including certain light patterns of flashing lights in video games. Playing video games may induce an epileptic seizure in these individuals. Certain conditions may induce previously undetected epileptic symptoms even in persons who have no prior history of seizures or epilepsy. If you, or anyone in your family, have any history of prior seizures or epilepsy, consult your physician prior to playing. If you experience any of the following symptoms while playing a video game -- eye soreness, altered vision, migraine, muscle twitching, convulsion, blackout, loss of awareness or disorientation, IMMEDIATELY stop playing and consult your physician before resuming play.",
  "In addition to the above symptoms, if you have a headache, dizziness, nausea, similar symptoms of motion sickness, or if you feel a discomfort or pain in any body part whilst playing, IMMEDIATELY stop playing. If the condition persists, seek medical attention.",
];
