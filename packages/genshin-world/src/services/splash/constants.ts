import type { SplashTiming } from "#src/models/splash/SplashTiming";

// Measured from a 60-frame recording of the game's window from its first frame, each fade read as a curve over the
// Logo's or the notice's region (`luma`). The recording opens on the publisher's logo already shown, so its fade in
// Is taken as its fade out mirrored and its hold is the least the recording shows. The white between the two logos is
// The game loading, which took about 4 seconds on the recording's machine; ours loads behind the splashes, so the white
// Holds half that, a pause rather than a load
export const PUBLISHER_SPLASH_TIMING: SplashTiming = {
  fadeInEasing: "linear",
  fadeInMs: 800,
  fadeOutEasing: "linear",
  fadeOutMs: 800,
  holdMs: 1733,
  whiteAfterMs: 2000,
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
