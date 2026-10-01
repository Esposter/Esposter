import type { ParityReference } from "#src/models/genshinParity/ParityReference";

// Every screen the console recreates from the game, by the reference it is judged against
export const ParityReferenceMap: Record<string, ParityReference> = {
  // The English client's notice, a 597 by 335 screenshot of a 16:9 screen, sharpened, so its geometry is read from it
  // And its ink's colour from the Japanese recording
  "health-notice": { capture: "health-notice-en.png", screen: "SplashHealthNotice", seconds: 0 },
  "loading-startup": { screen: "LoadingStartup", wikiTitle: "File:Loading Screen Startup.png" },
  // The wiki's four skies are clean captures of the scene at one pose, early in the camera's flight, with no interface
  "login-dawn": {
    // Read off the capture at its full size: the walkway's near wings at the top of their outer faces, and the far
    // Wings' outer faces, still rising there, at their distance across alone
    landmarks: {
      wingFarLeftEdge: [1698, 1650],
      wingFarRightEdge: [2390, 1670],
      wingNearLeftBack: [1398, 1801],
      wingNearLeftFront: [1255, 1857],
      wingNearRightBack: [2695, 1801],
      wingNearRightFront: [2837, 1860],
    },
    props: { isInterfaceHidden: true, timeOfDay: "Dawn" },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Dawn.png",
  },
  "login-day": {
    props: { isInterfaceHidden: true, timeOfDay: "Day" },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Day.png",
  },
  // The door from the flight's last pose, on the phone build at 4:3 under the day sky, scored over the door and its
  // Dais alone, since its interface and its narrower frame differ from the computer's
  "login-door": {
    props: { isInterfaceHidden: true, stage: "Door", timeOfDay: "Day" },
    region: { height: 760, width: 700, x: 690, y: 440 },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Door and Platform.png",
  },
  // The door from the flight's last pose on the current build's PC client at 16:9, the English recording's frame at the
  // Door, scored over the scene above the prompt and clear of the corner buttons
  "login-door-recording": {
    capture: "yt-rBnfA4pXw6U.mp4",
    // Read off the recording: the dais's front feet on the walkway's top, the arch's apex, and the walkway's wings at
    // The top of their outer faces
    landmarks: {
      columnCrown: [1083, 296],
      doorApex: [959, 416],
      doorFootLeft: [852, 777],
      doorFootRight: [1069, 777],
      towerRightInner: [1455, 460],
      towerRightOuter: [1830, 460],
      wingLeftBack: [710, 803],
      wingLeftFront: [689, 817],
      wingRightBack: [1193, 803],
      wingRightFront: [1229, 817],
    },
    props: { isInterfaceHidden: true, stage: "Door", timeOfDay: "Dusk" },
    region: { height: 960, width: 1560, x: 180, y: 0 },
    screen: "LoginScreen",
    seconds: 14,
  },
  "login-dusk": {
    props: { isInterfaceHidden: true, timeOfDay: "Dusk" },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Dusk.png",
  },
  // The login screen's interface over the English recording's own frames of it, at 1080 high: its title, its status as
  // Data loads, and its prompt at the door. The recording is of an older build, whose title shows a repair button and
  // Whose build string differs, so those two stay apart from ours, which are the current build's
  "login-interface-door": {
    capture: "yt-rBnfA4pXw6U.mp4",
    isBackdrop: true,
    props: { isWelcomeShown: false, stage: "Door" },
    screen: "LoginInterface",
    seconds: 14,
  },
  "login-interface-loading": {
    capture: "yt-rBnfA4pXw6U.mp4",
    isBackdrop: true,
    props: { isWelcomeShown: false, progress: 0.2797, stage: "Preparing", statusStep: "LoadingData" },
    screen: "LoginInterface",
    seconds: 5,
  },
  "login-interface-title": {
    capture: "yt-rBnfA4pXw6U.mp4",
    isBackdrop: true,
    props: { isWelcomeShown: false, playerName: "br****nd@gmail.com", stage: "Title" },
    screen: "LoginInterface",
    seconds: 0.5,
  },
  "login-night": {
    props: { isInterfaceHidden: true, timeOfDay: "Night" },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Night.png",
  },
  "publisher-splash": { capture: "session-2.mp4", screen: "SplashPublisher", seconds: 1 },
  // The English client's splash, from a public video of its phone build letterboxed in a 1080p frame; scored over the
  // Logo, since the video's own watermark sits in a corner
  "title-splash": {
    capture: "yt-qqcExvp4C0I.mp4",
    crop: { height: 864, width: 1920, x: 0, y: 108 },
    region: { height: 300, width: 800, x: 560, y: 250 },
    screen: "SplashTitle",
    seconds: 13,
  },
};
