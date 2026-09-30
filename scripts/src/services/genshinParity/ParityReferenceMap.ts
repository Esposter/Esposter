import type { ParityReference } from "#src/models/genshinParity/ParityReference";

// Every screen the console recreates from the game, by the reference it is judged against
export const ParityReferenceMap: Record<string, ParityReference> = {
  "exit-prompt": { screen: "exit-prompt", wikiTitle: "File:Paimon Menu Exit Prompt.png" },
  // The English client's notice, a 597 by 335 screenshot of a 16:9 screen, sharpened, so its geometry is read from it
  // And its ink's colour from the Japanese recording
  "health-notice": { capture: "health-notice-en.png", screen: "HealthNotice", seconds: 0 },
  "loading-region": { screen: "loading-region", wikiTitle: "File:Loading Screen Mondstadt.png" },
  "loading-startup": { screen: "StartupLoading", wikiTitle: "File:Loading Screen Startup.png" },
  // The wiki's four skies are clean captures of the scene at one pose, early in the camera's flight, with no interface
  "login-dawn": {
    props: { isInterfaceHidden: true, timeOfDay: "Dawn" },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Dawn.png",
  },
  "login-day": {
    props: { isInterfaceHidden: true, timeOfDay: "Day" },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Day.png",
  },
  "login-door": { screen: "LoginScreen", wikiTitle: "File:Login Menu Door and Platform.png" },
  "login-dusk": {
    props: { isInterfaceHidden: true, timeOfDay: "Dusk" },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Dusk.png",
  },
  "login-night": {
    props: { isInterfaceHidden: true, timeOfDay: "Night" },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Night.png",
  },
  "paimon-menu": { screen: "pause-menu", wikiTitle: "File:Paimon Menu Version 1.3.png" },
  "paimon-menu-grid": { screen: "pause-menu", wikiTitle: "File:Paimon Menu Version 3.2.png" },
  "publisher-splash": { capture: "session-2.mp4", screen: "PublisherSplash", seconds: 1 },
  settings: { screen: "settings", wikiTitle: "File:Login Menu Settings.png" },
  // The English client's splash, from a public video of its phone build letterboxed in a 1080p frame; scored over the
  // Logo, since the video's own watermark sits in a corner
  "title-splash": {
    capture: "yt-qqcExvp4C0I.mp4",
    crop: { height: 864, width: 1920, x: 0, y: 108 },
    region: { height: 300, width: 800, x: 560, y: 250 },
    screen: "TitleSplash",
    seconds: 13,
  },
};
