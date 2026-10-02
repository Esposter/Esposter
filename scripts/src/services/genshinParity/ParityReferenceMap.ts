import type { ParityReference } from "#src/models/genshinParity/ParityReference";

// Every screen the console recreates from the game, by the reference it is judged against
export const ParityReferenceMap: Record<string, ParityReference> = {
  // The English client's notice, a 597 by 335 screenshot of a 16:9 screen, sharpened, so its geometry is read from it
  // And its ink's colour from the Japanese recording
  "health-notice": { capture: "health-notice-en.png", screen: "SplashHealthNotice", seconds: 0 },
  "loading-startup": { screen: "LoadingStartup", wikiTitle: "File:Loading Screen Startup.png" },
  // The title at dawn, day and night: frames of public recordings of the PC client idling on it with no interface, at
  // The camera the door recording solves, each at the moment of the glide's loop its towers and walkway stand at
  "login-dawn-title": {
    capture: "yt-sQNqMfmfkZU.mp4",
    props: { heldScrolled: 132, isInterfaceHidden: true, stage: "Title", timeOfDay: "Dawn" },
    screen: "LoginScreen",
    seconds: 18,
  },
  // Its recording masks the frame's top and bottom 50 rows black, so only the rows between are scored
  "login-day-title": {
    capture: "yt-7kK6HqVfASk.mp4",
    props: { heldScrolled: 118, isInterfaceHidden: true, stage: "Title", timeOfDay: "Day" },
    region: { height: 980, width: 1920, x: 0, y: 50 },
    screen: "LoginScreen",
    seconds: 8,
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
  // Mainland China's interface over its launch recording's own frame at 1080 high, the door not yet formed, scored over its
  // Age rating alone: the recording is of an older build, whose build string sits apart from the current one's
  "login-interface-mainland-rating": {
    capture: "bili-av532052219.mp4",
    isBackdrop: true,
    props: { isDoorWaiting: true, isWelcomeShown: false, language: "ChineseSimplified", stage: "Door" },
    region: { height: 150, width: 150, x: 1740, y: 30 },
    screen: "LoginInterface",
    seconds: 12.5,
  },
  "login-interface-title": {
    capture: "yt-rBnfA4pXw6U.mp4",
    isBackdrop: true,
    props: { isWelcomeShown: false, playerName: "br****nd@gmail.com", stage: "Title" },
    screen: "LoginInterface",
    seconds: 0.5,
  },
  "login-night-title": {
    capture: "yt-PnqNza4qWzs.mp4",
    props: { heldScrolled: 135, isInterfaceHidden: true, stage: "Title", timeOfDay: "Night" },
    screen: "LoginScreen",
    seconds: 12,
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
  // Mainland China's splash, its 原神 logo with its licence under it, from a public recording of its launch at 1080p
  "title-splash-mainland": {
    capture: "bili-av532052219.mp4",
    props: { language: "ChineseSimplified" },
    screen: "SplashTitle",
    seconds: 5,
  },
};
