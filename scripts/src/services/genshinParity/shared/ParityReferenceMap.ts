import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// Every screen the console recreates from the game, by the reference it is judged against
export const ParityReferenceMap: Record<string, ParityReference> = {
  // The English PC client's Adventurer Handbook open at its experience, the wiki's screenshot, against which the
  // Book's tabs are placed while its pages wait on what they track
  "handbook-experience": { screen: "HandbookScreen", wikiTitle: "File:Adventurer Handbook Experience.png" },
  // The English PC client's notice, from the 2023 recording of its launch at 1080p, in the current build's wording
  "health-notice": { capture: "yt-sQNqMfmfkZU.mp4", screen: "SplashHealthNotice", seconds: 8 },
  // Mainland China's notice in its own words, from the public recording of an older build's launch its splash is taken
  // From, held from about 7 to 12 seconds
  "health-notice-mainland": {
    capture: "bili-av532052219.mp4",
    props: { language: "ChineseSimplified" },
    screen: "SplashHealthNotice",
    seconds: 9.5,
  },
  // The weapons' tab of the bag at 1080 high, from a public account tour's recording of the English PC client, its frame
  // At 30 seconds into the clip, drawn behind the bag so only the bag can differ. The streamer's camera at the top left
  // And the recording's UID at the bottom right sit outside the region
  "inventory-weapons": {
    capture: "yt-_agTJviXj7s-bag.mp4",
    isBackdrop: true,
    region: { height: 1048, width: 1270, x: 650, y: 0 },
    screen: "InventoryScreen",
    seconds: 30,
  },
  "loading-startup": { screen: "LoadingStartup", wikiTitle: "File:Loading Screen Startup.png" },
  // The title at dawn, day and night: frames of public recordings of older builds of the PC client idling on it with no
  // Interface, drawn at the current build's camera, each at the moment of the glide's loop its towers and walkway stand at
  "login-dawn-title": {
    capture: "yt-sQNqMfmfkZU.mp4",
    component: DerivedAssetComponent.Login,
    isOtherBuild: true,
    props: { heldScrolled: 132, isInterfaceHidden: true, stage: "Title", timeOfDay: "Dawn" },
    screen: "LoginScreen",
    seconds: 18,
  },
  // Its recording masks the frame's top and bottom 50 rows black, so only the rows between are scored
  "login-day-title": {
    capture: "yt-7kK6HqVfASk.mp4",
    component: DerivedAssetComponent.Login,
    isOtherBuild: true,
    props: { heldScrolled: 118, isInterfaceHidden: true, stage: "Title", timeOfDay: "Day" },
    region: { height: 980, width: 1920, x: 0, y: 50 },
    screen: "LoginScreen",
    seconds: 8,
  },
  // The door from the flight's last pose, on the phone build at 4:3 under the day sky, scored over the door and its
  // Dais alone, since its interface and its narrower frame differ from the computer's, and drawn at a phone's tier
  "login-door": {
    component: DerivedAssetComponent.Login,
    isOtherBuild: true,
    props: { isInterfaceHidden: true, qualityTier: "Medium", stage: "Door", timeOfDay: "Day" },
    region: { height: 760, width: 700, x: 690, y: 440 },
    screen: "LoginScreen",
    wikiTitle: "File:Login Menu Door and Platform.png",
  },
  // The door from the flight's last pose on an older build's PC client at 16:9, the English recording's frame at the
  // Door, scored over the scene above the prompt and clear of the corner buttons
  "login-door-recording": {
    capture: "yt-rBnfA4pXw6U.mp4",
    component: DerivedAssetComponent.Login,
    isOtherBuild: true,
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
  // The door at night on the current build (7.1) at 21.5:9, this machine's own recording of the client, its last frame
  // Before the prompt, the camera still easing toward its rest; scored clear of the corner buttons and the build string
  "login-door-session": {
    capture: "session-2.mp4",
    component: DerivedAssetComponent.Login,
    // Read off the frame: the arch's apex and the dais's front feet on the walkway's top
    landmarks: { doorApex: [1717, 575], doorFootLeft: [1585, 1028], doorFootRight: [1855, 1028] },
    props: { heldScrolled: 320, isInterfaceHidden: true, stage: "Door", timeOfDay: "Night" },
    region: { height: 1300, width: 3100, x: 0, y: 0 },
    screen: "LoginScreen",
    seconds: 35.9,
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
  // Mainland China's interface over its launch recording's own frame at 1080 high, the door not yet formed, scored over
  // Its age rating alone: the recording is of an older build, whose build string sits apart from the current one's
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
    component: DerivedAssetComponent.Login,
    isOtherBuild: true,
    props: { heldScrolled: 135, isInterfaceHidden: true, stage: "Title", timeOfDay: "Night" },
    screen: "LoginScreen",
    seconds: 12,
  },
  // The English PC client's map on M over Jueyun Karst, the wiki's full-screen 1080p screenshot: the drawing, the area
  // Names, the player's pointer, the zoom and the region tag, against the terrain the game paints
  "map-overlay-jueyun": { screen: "MapOverlay", wikiTitle: "File:Map Stardust in Jueyun.png" },
  // The English PC client's Paimon menu at 2560 wide, from the 1.3 build's screenshot, the menu over the world and
  // Its Paimon drawn to the panel's right, which the world draws; scored over the side bar and the panel above their
  // Translucent feet, where the world shows through
  "paimon-menu": {
    isOtherBuild: true,
    region: { height: 1030, width: 1024, x: 0, y: 0 },
    screen: "MenuPaimon",
    wikiTitle: "File:Paimon Menu Version 1.3.png",
  },
  // The English PC client's settings on its Graphics tab at 1680 wide, from the wiki's screenshot, scored over its header
  // Band alone: its rows are drawn over the blurred world, which the page has no copy of, and the Audio tab is not built
  "settings-graphics": {
    region: { height: 82, width: 1680, x: 0, y: 0 },
    screen: "MenuSettings",
    wikiTitle: "File:Login Menu Settings.png",
  },
  "publisher-splash": { capture: "session-2.mp4", screen: "SplashPublisher", seconds: 1 },
  // The English PC client's quest screen listing every quest in progress, the wiki's screenshot of it at 1080 high
  "quest-screen": { screen: "QuestScreen", wikiTitle: "File:Quest Screen.png" },
  // The English PC client's splash, from the 2023 recording of its launch at 1080p, held from 4.5 to 5.75 seconds
  "title-splash": { capture: "yt-sQNqMfmfkZU.mp4", screen: "SplashTitle", seconds: 5 },
  // Mainland China's splash, its 原神 logo with its licence under it, from a public recording of an older build's launch
  // At 1080p, drawn on full white where the current PC client's white is a step under it
  "title-splash-mainland": {
    capture: "bili-av532052219.mp4",
    props: { language: "ChineseSimplified" },
    screen: "SplashTitle",
    seconds: 5,
  },
  // The statue under the oak by day, from the 2026 recording's fixed camera east of it, a game minute a real second
  // From about six in the morning, an hour still to be read off its sun; its camera is solved from its landmarks and
  // Refined on the statue's outline
  "windrise-statue-day": {
    capture: "yt-zPDi6WBJW9Y.mp4",
    component: DerivedAssetComponent.Windrise,
    landmarks: {
      dishBrimLeft: [785, 617],
      dishBrimRight: [899, 617],
      plinthRimLeft: [800, 758],
      plinthRimRight: [887, 758],
      statueDish: [841, 612],
      statueTop: [840, 497],
      trunkAxis: [643, 580],
    },
    props: {
      cameraPose: { fov: 58.365, heading: 64.614, pitch: 8.047, position: [70.818, -4.053, 8.283] },
      heldMinutes: 720,
    },
    screen: "WorldScreen",
    seconds: 360,
  },
};
