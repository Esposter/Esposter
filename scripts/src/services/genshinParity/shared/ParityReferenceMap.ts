import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";
import { getCharacterScreenPlate } from "#src/services/genshinParity/shared/getCharacterScreenPlate";

// The two settings entries are scored from the same recording, against the same mean-difference bar, over a backdrop
const MENU_SETTINGS_REFERENCE = {
  approval: { bar: 2, measure: ParityApprovalMeasure.MeanDifference },
  capture: "yt-5EmJX_RyuY8-menu-settings.mp4",
  isBackdrop: true,
} as const;
// The settings backdrop's header rows and the first two rows of its menu, which both entries draw over the same place
const MENU_SETTINGS_TOP_PLATE = [
  { height: 112, width: 1920, x: 0, y: 0 },
  { height: 44, width: 186, x: 108, y: 130 },
  { height: 50, width: 254, x: 108, y: 200 },
];

// Every screen the console recreates from the game, by the reference it is judged against
export const ParityReferenceMap: Record<string, ParityReference> = {
  // The English PC client's character screen on the Artifacts tab at 21:9, the same recording at 157.5 seconds, the tab settled, scored over its own scene with the interface it shows filled from round it
  "character-artifacts": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Artifacts"),
    props: { initialTab: "Artifacts" },
    screen: "CharacterScreen",
    seconds: 157.5,
  },
  // The same frame's tab column, its words and their diamonds, clear of the scene's light, with the Artifacts tab open
  "character-artifacts-tabs": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Artifacts"),
    props: { initialTab: "Artifacts" },
    region: { height: 800, width: 900, x: 120, y: 180 },
    screen: "CharacterScreen",
    seconds: 157.5,
  },
  // The English PC client's character screen on Xilonen's Attributes tab at 21:9, from the user's own recording of the
  // Current build (session-2.mp4 at 155 seconds, the interface settled: at 154.4 its closed tabs are still fading in)
  "character-attributes": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Attributes"),
    screen: "CharacterScreen",
    seconds: 155,
  },
  // The frame's panel down the right: the name, the level, the bar and the five base rows
  "character-attributes-panel": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Attributes"),
    region: { height: 620, width: 640, x: 2800, y: 180 },
    screen: "CharacterScreen",
    seconds: 155,
  },
  // The frame's tab column, its words and their diamonds, clear of the scene's light
  "character-attributes-tabs": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Attributes"),
    region: { height: 800, width: 900, x: 120, y: 180 },
    screen: "CharacterScreen",
    seconds: 155,
  },
  // The same frame's band across the top, the name, the portraits and the Geo emblem, clear of the scene
  "character-attributes-top": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Attributes"),
    region: { height: 135, width: 3440, x: 0, y: 0 },
    screen: "CharacterScreen",
    seconds: 155,
  },
  // The English PC client's character screen on the Constellation tab at 21:9, the same recording at 158.3 seconds, the tab settled (158 seconds still fades its node list in), scored over its own scene with the interface it shows filled from round it
  "character-constellation": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Constellation"),
    props: { initialTab: "Constellation" },
    screen: "CharacterScreen",
    seconds: 158.3,
  },
  // The same frame's tab column, its words and their diamonds, clear of the scene's light, with the Constellation tab open
  "character-constellation-tabs": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Constellation"),
    props: { initialTab: "Constellation" },
    region: { height: 800, width: 900, x: 120, y: 180 },
    screen: "CharacterScreen",
    seconds: 158.3,
  },
  // The English PC client's character screen on the Talents tab at 21:9, the same recording at 159 seconds, the tab settled, scored over its own scene with the interface it shows filled from round it
  "character-talents": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Talents"),
    props: { initialTab: "Talents" },
    screen: "CharacterScreen",
    seconds: 159,
  },
  // The same frame's tab column, its words and their diamonds, clear of the scene's light, with the Talents tab open
  "character-talents-tabs": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Talents"),
    props: { initialTab: "Talents" },
    region: { height: 800, width: 900, x: 120, y: 180 },
    screen: "CharacterScreen",
    seconds: 159,
  },
  // The English PC client's character screen on the Weapons tab at 21:9, the same recording at 156 seconds, the tab settled, scored over its own scene with the interface it shows filled from round it
  "character-weapons": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Weapons"),
    props: { initialTab: "Weapons" },
    screen: "CharacterScreen",
    seconds: 156,
  },
  // The same frame's tab column, its words and their diamonds, clear of the scene's light, with the Weapons tab open
  "character-weapons-tabs": {
    capture: "session-2.mp4",
    isBackdrop: true,
    plate: getCharacterScreenPlate("Weapons"),
    props: { initialTab: "Weapons" },
    region: { height: 800, width: 900, x: 120, y: 180 },
    screen: "CharacterScreen",
    seconds: 156,
  },
  // The Court of Fontaine from the wiki's location image at 4K, by day with the sun high. Its landmarks are rigid stone
  // And steel read off 4x crops: the arch's two feet, the bridge's two springs and the drum tower's roof corners
  "court-of-fontaine-location": {
    component: DerivedAssetComponent.Fontaine,
    // Provisional noon until the shadows pass solves the sun's minute
    landmarks: {
      archFootLeft: [1745, 1567],
      archFootRight: [1800, 1566],
      bridgeSpringLeft: [2517, 957],
      bridgeSpringRight: [2700, 951],
      towerRightRoofLeft: [2144, 1165],
      towerRightRoofRight: [2371, 1190],
    },
    props: { heldMinutes: 720 },
    screen: "WorldScreen",
    wikiTitle: "File:Court of Fontaine.png",
  },
  // The crafting table's Craft screen at 1080 high from a public video (yt-qQILsaJKlsI), about 40 seconds in: Condensed
  // Resin picked, Crafting Performed 1 and Diluc as the crafter. No frame shows the spot with the screen closed, so no
  // Plate: the mask scores the opaque panels (the recipe grid, the title and the details, the materials band and the
  // Close), clear of the scene's glass and the streamer's overlay in the corner
  "crafting-table": {
    capture: "yt-qQILsaJKlsI-crafting-table.mp4",
    mask: [
      { height: 850, width: 585, x: 60, y: 115 },
      { height: 90, width: 310, x: 1150, y: 115 },
      { height: 110, width: 570, x: 1020, y: 620 },
      { height: 215, width: 1145, x: 735, y: 745 },
      { height: 70, width: 70, x: 1820, y: 14 },
      { height: 40, width: 110, x: 130, y: 25 },
      { height: 40, width: 170, x: 1615, y: 25 },
      { height: 75, width: 250, x: 820, y: 20 },
    ],
    screen: "CraftingScreen",
    seconds: 39.5,
  },
  // The English PC client's dialogue at 720 high from the public recording, about 19 seconds in: Sara's line with the
  // Traveler's two replies on offer, scored apart as the speaker's name, the line and the replies. Each is drawn over the
  // Frame's clean plate, its scored region filled from its surroundings (`getCleanPlatePath`)
  "dialogue-choices-line": {
    capture: "yt-nWBqOXWZuFg.mp4",
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "ah-finally" } },
    region: { height: 28, width: 320, x: 480, y: 586 },
    screen: "DialogueTalk",
    seconds: 19,
  },
  "dialogue-choices-replies": {
    capture: "yt-nWBqOXWZuFg.mp4",
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "ah-finally" } },
    region: { height: 74, width: 250, x: 850, y: 463 },
    screen: "DialogueTalk",
    seconds: 19,
  },
  "dialogue-choices-speaker": {
    capture: "yt-nWBqOXWZuFg.mp4",
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "ah-finally" } },
    region: { height: 24, width: 80, x: 600, y: 546 },
    screen: "DialogueTalk",
    seconds: 19,
  },
  // The same talk's line with no replies on offer, about 23 seconds in, its speaker's role line under the name left out
  "dialogue-line": {
    capture: "yt-nWBqOXWZuFg.mp4",
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "knights-of-favonius" } },
    region: { height: 50, width: 800, x: 240, y: 586 },
    screen: "DialogueTalk",
    seconds: 23,
  },
  // Paimon's line about 29 seconds in, from the same recording
  "dialogue-paimon-line": {
    capture: "yt-nWBqOXWZuFg.mp4",
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "so-it-is-jean" } },
    region: { height: 30, width: 420, x: 430, y: 582 },
    screen: "DialogueTalk",
    seconds: 29,
  },
  // Everfrozen Earth from the wiki's location image at 1080 high: Snezhnograd on its plateau seen from a railway
  // Viaduct, at night under the stars, its spires read by eye at the reference's pixels. The Genshin logo in the
  // Corner is left out of the region scored
  "everfrozen-earth-location": {
    component: DerivedAssetComponent.Snezhnaya,
    landmarks: {
      centreTowerApex: [983, 488],
      leftTowerTop: [712, 466],
      rightSpireLeft: [1231, 482],
      rightSpireRight: [1242, 482],
      spireBaseLeft: [909, 448],
      spireBaseRight: [947, 448],
      spireTip: [927, 398],
    },
    // Provisional: midnight, the night frame's held minute, as it has no sun whose shadows could solve it
    props: { heldMinutes: 0 },
    region: { height: 920, width: 1920, x: 0, y: 0 },
    screen: "WorldScreen",
    wikiTitle: "File:Everfrozen Earth.png",
  },
  // The English PC client's quit prompt on the current build at 1080 high, from a 2026 recording (`yt-jHr2bERjkYc`, 30
  // Seconds in), the dialog over the dimmed menu: "Are you sure you want to quit?" with Cancel and Confirm. Scored over
  // The dialog's whole panel, 960 by 606 from (480, 237) in that frame. The tutorial's red arrow lies inside the panel above
  // Confirm, an overlay the game does not draw, so the score counts its pixels as a difference
  "exit-prompt": {
    capture: "yt-jHr2bERjkYc-logout-tech4gamers.mp4",
    region: { height: 606, width: 960, x: 480, y: 237 },
    screen: "MenuExit",
    seconds: 30,
  },
  // The expedition screen at 1080 high from the public clip (yt-fxIjhlV3vUA), 26 seconds in: Mondstadt's map with six
  // Places pinned and Wolvendom picked, its Expedition Limit across the head, its rewards and durations down the right.
  // Scored over the screen above the recorder's UID, which the clip draws at its bottom right corner
  "expedition-screen": {
    capture: "yt-fxIjhlV3vUA-expedition-screen.mp4",
    region: { height: 1050, width: 1920, x: 0, y: 0 },
    screen: "ExpeditionScreen",
    seconds: 26,
  },
  // The English PC client's forge on the Materials tab with an Enhancement Ore at amount five, at 32 seconds of the public
  // Recording of the forge, letterboxed to its 886 high frame: scored whole over its blurred scene, the game's own pieces
  // (the tabs, the recipe list, the item and its amount, the Materials box, the foot) filled from round them
  "forge-screen": {
    capture: "yt-AVnbm8fESr0-forge-screen.mp4",
    isBackdrop: true,
    plate: [
      { height: 75, width: 300, x: 120, y: 10 },
      { height: 70, width: 300, x: 1495, y: 15 },
      { height: 60, width: 615, x: 110, y: 125 },
      { height: 560, width: 620, x: 110, y: 205 },
      { height: 36, width: 270, x: 1170, y: 118 },
      { height: 178, width: 146, x: 1232, y: 215 },
      { height: 70, width: 600, x: 1000, y: 450 },
      { height: 236, width: 934, x: 838, y: 536 },
      { height: 70, width: 945, x: 830, y: 785 },
      { height: 60, width: 590, x: 125, y: 790 },
      { height: 28, width: 275, x: 1645, y: 858 },
    ],
    screen: "ForgeScreen",
    seconds: 32,
  },
  // The public frame of the card game's duel board at 1080 high from the English PC client, cut from 400 seconds of a
  // Walkthrough, the frame at 407 seconds in the Action Phase: both sides' characters, the dice column and the hand. A
  // Video's frame, so its art is not drawn and only its tints, words and places are scored
  "gcg-duel-board": { capture: "gcg-yt-tvboQ_ZWO_I-400-410.mp4", screen: "GcgScreen", seconds: 7 },
  // The English PC client's Adventurer Handbook open at its experience, the wiki's screenshot, against which the
  // Book's tabs are placed while its pages wait on what they track
  "handbook-experience": { screen: "HandbookScreen", wikiTitle: "File:Adventurer Handbook Experience.png" },
  // The English PC client's notice, from the 2023 recording of its launch at 1080p, in the current build's wording
  "health-notice": { capture: "yt-sQNqMfmfkZU.mp4", screen: "SplashHealthNotice", seconds: 8 },
  // The Japanese PC client's notice whole at 30 seconds of the public recording of its launch (the PC watermark top left and the
  // Recorder's icons bottom right sit outside the region scored)
  "health-notice-japanese": {
    capture: "yt-57d2PwbOdr0-opening-japanese.mp4",
    props: { language: "Japanese" },
    region: { height: 480, width: 1520, x: 200, y: 300 },
    screen: "SplashHealthNotice",
    seconds: 30,
  },
  // Mainland China's notice in its own words, from the public recording of an older build's launch its splash is taken
  // From, held from about 7 to 12 seconds
  "health-notice-mainland": {
    capture: "bili-av532052219.mp4",
    props: { language: "ChineseSimplified" },
    screen: "SplashHealthNotice",
    seconds: 9.5,
  },
  // The English PC client's Paimon button at 1080 high, from the same public recording at 20 seconds, its emblem's place
  // And fill measured over the corner. The minimap's disc takes the emblem's right half, so only the rectangles left of
  // And above it are scored, and the rest of that frame's HUD is left out of the region
  "hud-paimon-button": {
    capture: "world-pickup.mkv",
    isBackdrop: true,
    mask: [
      { height: 100, width: 66, x: 0, y: 0 },
      { height: 32, width: 44, x: 66, y: 0 },
    ],
    props: { isTouch: false },
    region: { height: 100, width: 110, x: 0, y: 0 },
    screen: "HudScreen",
    seconds: 20,
  },
  // The English PC client's stamina meter at 1080 high, from a public tutorial's climb at 48 seconds (this clip's 30),
  // Three tenths of a pool of about 214 left in yellow under its drained track, which the pool's two cuts cross, on the
  // White rock clear of the character. The meter is drawn round the pivot, so the frame's pivot is the circle its arc
  // Was fitted to (978.3, 501.3), and only the meter's looks are scored, the rest of that player's HUD left out of the
  // Region
  "hud-stamina-climb": {
    capture: "yt-hRR2yoP3uY0-world-stamina.mp4",
    isBackdrop: true,
    props: { frame: { pivotX: 0.5095, pivotY: 0.4642, seconds: 0, stamina: 64 }, isTouch: false, maxStamina: 214 },
    region: { height: 140, width: 65, x: 1040, y: 430 },
    screen: "HudScreen",
    seconds: 30,
  },
  // The English PC client's skill and burst at 1080 high, from the same public recording at 20 seconds, before it moves
  // To the phone: Chongyun on the field with his burst charged, scored over the keys' corner clear of the gadget above
  // And the UID below. Only the field member's figures change, so the rest of the frame's HUD is left out of the region
  "hud-world-keys": {
    capture: "world-pickup.mkv",
    isBackdrop: true,
    props: {
      isTouch: false,
      member: {
        burstCooldown: 0,
        burstCooldownSeconds: 0,
        characterId: 10_000_036,
        element: "Ice",
        energy: 40,
        energyCost: 40,
        health: 13_056,
        level: 80,
        maxHealth: 17_065,
        skillCooldown: 0,
        skillCooldownSeconds: 0,
        weaponType: "WEAPON_CLAYMORE",
      },
    },
    region: { height: 148, width: 250, x: 1640, y: 905 },
    screen: "HudScreen",
    seconds: 20,
  },
  // The English mobile client's world HUD from the public recording of a session at 70 seconds, played on a phone, its
  // Black letterbox bars cropped away and its subtitles left out of the region scored. The HUD is drawn over the
  // Recording's own frame, so a piece the HUD drops reads as the game's own (the screen is shot bare too, `isBackdrop`
  // Only shows the overlay)
  "hud-world-pickup": {
    capture: "world-pickup.mkv",
    crop: { height: 935, width: 1920, x: 0, y: 72 },
    isBackdrop: true,
    region: { height: 880, width: 1920, x: 0, y: 0 },
    screen: "HudScreen",
    seconds: 70,
  },
  // Inazuma City from the wiki's 4K location image, a daytime haze with its sun's minute unread (noon provisionally).
  // Its build is not stated, so it is read as current and a red camera pass reopens it. Its landmarks are rigid
  // Architecture picked off 4x crops: the keep's eaves and its second tier's ledge, the paved platform's corners, a
  // House's base, the pavilion's eaves and a house's roof edge
  "inazuma-city-location": {
    component: DerivedAssetComponent.Inazuma,
    landmarks: {
      houseFrontLeft: [1631, 1145],
      houseFrontRight: [1684, 1145],
      houseRoofLeft: [3168, 1623],
      keepEaveLeft: [1374, 160],
      keepEaveRight: [1531, 164],
      keepLedgeLeft: [1383, 203],
      keepLedgeRight: [1524, 203],
      pavilionEaveLeft: [2904, 1478],
      pavilionEaveRight: [2994, 1478],
      platformBackLeft: [1601, 1101],
      platformFrontLeft: [1571, 1157],
    },
    // Provisional: noon until `shadows` solves the sun's minute from the image's own shadows
    props: { heldMinutes: 720 },
    screen: "WorldScreen",
    wikiTitle: "File:Inazuma City.png",
  },
  // The English PC client's pickup at 1080 high over plain grass, three Jueyun Chili rows with the third selected, from a
  // Public recording at 23 seconds, within the half second the selection rests on that row before the pickup. The pills'
  // Right ends fade out over the grass clear of the scene, where `interaction-prompts-pickup`'s run onto a rock. Its
  // Plate fills the cap and each pill from the grass around it, so the grass between them stays the frame's own and only
  // The list's pieces can differ
  "interaction-prompts-jueyun-chili": {
    capture: "yt-UBNImta_dWs-prompt-scroll.mp4",
    isBackdrop: true,
    plate: [
      { height: 38, width: 58, x: 1096, y: 592 },
      { height: 68, width: 341, x: 1154, y: 433 },
      { height: 68, width: 341, x: 1154, y: 505 },
      { height: 68, width: 341, x: 1154, y: 577 },
    ],
    props: {
      interactionPrompts: {
        interactables: ["0", "1", "2"].map((id) => ({
          id,
          kind: "PickUp",
          name: "Jueyun Chili",
          position: { x: 0, y: 0, z: 0 },
        })),
        selectedId: "2",
        windowStart: 0,
      },
    },
    region: { height: 220, width: 400, x: 1095, y: 430 },
    screen: "InteractionPromptList",
    seconds: 23,
  },
  // The English PC client's pickup at 1080 high: three drops in reach, the first row selected with its F cap, from a public
  // Tutorial's recording at 9 seconds with no caption over it, the cap held on that row from 7 to 13 seconds. Drawn behind the prompt list, so only the list's own
  // Pieces can differ, and the scene the list's pills show through is the game's own; the streamer's camera sits outside
  // The region
  "interaction-prompts-pickup": {
    capture: "world-pickup.mkv",
    isBackdrop: true,
    region: { height: 220, width: 370, x: 1095, y: 430 },
    screen: "InteractionPromptList",
    seconds: 9,
  },
  // The food tab of the bag, from the same account tour's recording of the English PC client 58 seconds in: the foot's
  // Primogems and Mora where the sort's dropdown stands on an equipment tab, drawn behind the bag so only its foot can differ
  "inventory-food": {
    capture: "yt-_agTJviXj7s-bag.mp4",
    isBackdrop: true,
    props: {
      initialCategory: "Food",
      wallet: {
        AcquaintFate: 0,
        GenesisCrystal: 0,
        IntertwinedFate: 0,
        MasterlessStardust: 0,
        MasterlessStarglitter: 0,
        Mora: 6031059,
        Primogem: 1399,
      },
    },
    region: { height: 120, width: 700, x: 0, y: 960 },
    screen: "InventoryScreen",
    seconds: 58,
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
  // The wiki's 4096 by 2304 location image of Liyue Harbor, a daytime view of the harbour's stepped quay under the sea of
  // Clouds. Its landmarks are rigid architecture read by eye at the image's pixels off 4x crops: the plinth corners of the
  // Arch gate over the quay and of the stone-based tower on the water to its left
  "liyue-harbor-location": {
    component: DerivedAssetComponent.Liyue,
    landmarks: {
      gatePlinthLeft: [3115, 1640],
      gatePlinthOuter: [3425, 1660],
      gatePlinthRight: [3328, 1641],
      towerPlinthFront: [1895, 1271],
      towerPlinthLeft: [1796, 1246],
      towerPlinthRight: [1960, 1243],
    },
    // Provisional: noon, until `shadows` reads the sun's minute off the buildings' shadows
    props: { heldMinutes: 720 },
    screen: "WorldScreen",
    wikiTitle: "File:Liyue Harbor.png",
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
  // Mainland China's interface at the door with its prompt, over the launch recording's own frame at 15.5 seconds, the
  // First frame the prompt stands whole on the 12 to 17 second stills, scored over the whole frame, its rating included
  "login-interface-door-mainland": {
    capture: "bili-av532052219.mp4",
    isBackdrop: true,
    props: { isWelcomeShown: false, language: "ChineseSimplified", stage: "Door" },
    screen: "LoginInterface",
    seconds: 15.5,
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
  // The English PC client's map zoomed out over Galesong Hill at 99% (yt-kgW2IgWKukg at 4.6 seconds, 1080p and 60 frames a
  // Second, one chest before the area reads 100%). Its label, the name and the progress line under it, scored over the
  // Glyphs' silhouettes alone, the terrain between their strokes left out. The game places a label from map data the
  // Catalogue does not hold, so the camera stands where Galesong Hill's outline puts the label on the still's, and the
  // Area holds one doing at the still's progress; the comparison reads the label's type and its line's place, not where
  // The map writes it
  "map-overlay-galesong": {
    capture: "yt-kgW2IgWKukg-exploration-steps.mp4",
    props: {
      camera: { x: -99.42, yaw: 0, z: 636.36 },
      explorationAreas: [
        { areaId: "galesong-hill", doings: [{ id: "galesong-hill", kind: "Waypoint", weight: 99 }], total: 100 },
      ],
      landmarks: [
        {
          areaId: "galesong-hill",
          heightOffset: 0.79,
          id: "windrise-statue-of-the-seven",
          kind: "StatueOfTheSeven",
          position: { x: 44.38, z: -0.51 },
          rotation: -1.5708,
        },
      ],
    },
    region: { height: 84, width: 296, x: 596, y: 336 },
    screen: "MapOverlay",
    seconds: 4.6,
    silhouettes: [
      { height: 48, ink: [228, 233, 227], width: 136, x: 610, y: 338 },
      { height: 48, ink: [232, 236, 233], width: 102, x: 774, y: 338 },
      { height: 24, ink: [232, 236, 223], width: 290, x: 598, y: 392 },
    ],
  },
  // The English PC client's map on M over Jueyun Karst, the wiki's full-screen 1080p screenshot. Scored over its interface
  // Layer alone, the terrain the game paints masked out: the pointer, the close button and the zoom slider whole, and the
  // Area names over their glyphs' silhouettes, since a name's box holds the terrain between its strokes; the region tag,
  // The top bar and the domains toggle wait on their text ids and are left out
  "map-overlay-jueyun": {
    mask: [
      { height: 70, width: 70, x: 970, y: 555 },
      { height: 68, width: 68, x: 1808, y: 15 },
      { height: 262, width: 34, x: 12, y: 410 },
    ],
    screen: "MapOverlay",
    silhouettes: [
      { height: 58, ink: [210, 226, 228], width: 236, x: 780, y: 160 },
      { height: 54, ink: [234, 251, 252], width: 492, x: 476, y: 390 },
      { height: 54, ink: [245, 255, 255], width: 296, x: 796, y: 490 },
      { height: 55, ink: [232, 251, 252], width: 280, x: 1170, y: 590 },
      { height: 50, ink: [232, 247, 248], width: 192, x: 456, y: 618 },
      { height: 48, ink: [208, 219, 221], width: 262, x: 606, y: 950 },
      { height: 48, ink: [168, 169, 169], width: 270, x: 1568, y: 918 },
    ],
    wikiTitle: "File:Map Stardust in Jueyun.png",
  },
  // The English PC client's Time screen at 1080 high from a public recording (yt-a4_J84iMqR0), ten seconds in: the clock
  // At 03:52 and the dial turned to 18:00 Today, drawn over the world it dims. The fixture's hand rests half an hour on, so
  // The compare differs at the hand and the target hour until the screen takes a dialled advance
  "menu-time": {
    capture: "yt-a4_J84iMqR0-time.mp4",
    isBackdrop: true,
    props: { clockMinutes: 232 },
    screen: "MenuTime",
    seconds: 10,
  },
  // The English PC client's Mondstadt city from the wiki's 4K location image of 2024, in daylight (short shadows, a clear
  // Sky; the sun's minute waits on its shadows' edges). Its six landmarks are the corners of the two west and east towers'
  // Parapets and the gate tower's front corners, read by eye at 4x crops of the image's pixels
  "mondstadt-city-location": {
    component: DerivedAssetComponent.Mondstadt,
    landmarks: {
      eastTowerTopLeft: [2867, 1106],
      eastTowerTopRight: [2959, 1104],
      gateTowerFrontLeft: [2219, 1329],
      gateTowerFrontRight: [2312, 1328],
      westTowerTopLeft: [1077, 1044],
      westTowerTopRight: [1162, 1058],
    },
    // Provisional: noon until the shadows' solve reads the sun's minute off the wall's shadow edges
    props: { heldMinutes: 720 },
    screen: "WorldScreen",
    wikiTitle: "File:Mondstadt City.png",
  },
  // The wiki's 2560 by 1440 location image of Nasha Town, a daytime view of the capital's plaza under its central tower.
  // Its landmarks are rigid architecture read by eye at the image's pixels off 4x crops: the plinth's front corners, the
  // Struts under the tower's pod ledge, and the tower's collar and column edges
  "nasha-town-location": {
    component: DerivedAssetComponent.NodKrai,
    landmarks: {
      ledgeStrutLeft: [1098, 788],
      ledgeStrutRight: [1204, 787],
      plinthFrontLeft: [1077, 1184],
      plinthFrontRight: [1207, 1195],
      stackCollarLeft: [1155, 352],
      stackLeftEdge: [1152, 422],
      stackRightEdge: [1234, 455],
    },
    // Provisional: noon, until `shadows` reads the sun's minute off the buildings' shadows
    props: { heldMinutes: 720 },
    screen: "WorldScreen",
    wikiTitle: "File:Nasha Town.png",
  },
  // The English PC client's Paimon menu on the current build at 1080 high, from a 2026 recording (`yt-jHr2bERjkYc`, 25
  // Seconds in) with no screen open, its account at Adventure Rank 2. Scored over the side bar and the panel above their
  // Translucent feet, where the world shows through; the recording's pillarbox, logo and UID lie outside the region
  "paimon-menu": {
    capture: "yt-jHr2bERjkYc-logout-tech4gamers.mp4",
    region: { height: 1080, width: 810, x: 150, y: 0 },
    screen: "MenuPaimon",
    seconds: 25,
  },
  // The People of the Springs from the wiki's location image at 2560 wide, a daytime view of the Natlan capital's hall,
  // Spire and walkway, whose build is not stated (a 2024 upload). Its landmarks are rigid architecture read by eye off
  // 4x crops: the spire's apex and cap, the hall's two roof tips and its platform's corner, a terrace's stair top and a
  // Walkway post's foot
  "people-of-the-springs-location": {
    component: DerivedAssetComponent.Natlan,
    landmarks: {
      hallPlatformCorner: [1137, 871],
      hallRoofLeft: [1316, 545],
      hallRoofRight: [2055, 654],
      spireApex: [891, 592],
      spireCap: [911, 654],
      terraceStairTop: [1828, 1063],
      walkwayPostFoot: [419, 1137],
    },
    // Provisional: noon, until `shadows` reads the sun's minute off the buildings' shadows
    props: { heldMinutes: 720 },
    screen: "WorldScreen",
    wikiTitle: 'File:"People of the Springs".png',
  },
  "publisher-splash": { capture: "session-2.mp4", screen: "SplashPublisher", seconds: 1 },
  // The English PC client's quest screen listing every quest in progress, the wiki's screenshot of it at 1080 high
  "quest-screen": { screen: "QuestScreen", wikiTitle: "File:Quest Screen.png" },
  // The same still's details column on the right, the title, journal, objective and description, clear of the rewards
  "quest-screen-details": {
    region: { height: 680, width: 899, x: 877, y: 100 },
    screen: "QuestScreen",
    wikiTitle: "File:Quest Screen.png",
  },
  // The same still's band across the top, the tabs, the banner and the close button, clear of the blurred world
  "quest-screen-header": {
    region: { height: 95, width: 1920, x: 0, y: 0 },
    screen: "QuestScreen",
    wikiTitle: "File:Quest Screen.png",
  },
  // The same still's list down the left, its quest rows and series panels, the translucent glass scored as drawn
  "quest-screen-list": {
    region: { height: 850, width: 666, x: 150, y: 105 },
    screen: "QuestScreen",
    wikiTitle: "File:Quest Screen.png",
  },
  // The City Reputation's reward page of Mondstadt at 1080 high from the public City Reputation Guide, 18 seconds in: the
  // Level list down the right at level 3, the levels' rewards and each one's achieved mark, clear of the clip's own
  // Recording timer and its UID. Scored over the list's panel only, since the nation's art on the left is not drawn yet
  "reputation-screen": {
    capture: "yt-1SqmdXbIhLs-reputation-guide.mp4",
    region: { height: 872, width: 1220, x: 652, y: 145 },
    screen: "ReputationScreen",
    seconds: 18,
  },
  // The English PC client's settings opened in the world at 1920 wide, on the Audio tab, its four volumes and its other
  // Settings, scored whole like the Graphics tab's below. The pointer rests on Output Settings, lit under it, while
  // Dynamic Range keeps the rim of the row last pressed, which the page does not draw since its control is not backed.
  // Approved by its mean difference as the Graphics tab is: with the rows' rims and shadow drawn, what FLIP still sees is
  // The game's typeface, which Signika stands in for along every label's edge
  "settings-audio-rows": {
    ...MENU_SETTINGS_REFERENCE,
    plate: [
      ...MENU_SETTINGS_TOP_PLATE,
      { height: 52, width: 190, x: 108, y: 270 },
      { height: 62, width: 350, x: 100, y: 332 },
      { height: 48, width: 197, x: 108, y: 410 },
      { height: 50, width: 196, x: 108, y: 480 },
      { height: 44, width: 180, x: 108, y: 550 },
      { height: 44, width: 215, x: 108, y: 619 },
      { height: 44, width: 142, x: 108, y: 688 },
      { height: 46, width: 226, x: 472, y: 130 },
      { height: 40, width: 222, x: 472, y: 255 },
      { height: 46, width: 228, x: 472, y: 515 },
      { height: 63, width: 1324, x: 478, y: 180 },
      { height: 64, width: 1324, x: 478, y: 304 },
      { height: 64, width: 1324, x: 478, y: 371 },
      { height: 63, width: 1324, x: 478, y: 439 },
      { height: 68, width: 1324, x: 478, y: 562 },
      { height: 67, width: 1324, x: 478, y: 629 },
      { height: 64, width: 1324, x: 478, y: 698 },
    ],
    pointer: [1000, 663],
    props: { tab: "Audio" },
    screen: "MenuSettings",
    seconds: 178,
  },
  // The English PC client's settings on its Graphics tab at 1680 wide, from the wiki's screenshot of the login's, scored
  // Over its header band alone, whose veil is drawn over the band filled from the blurred backdrop below it; the login's
  // Settings list two tabs and its rows lie over a backdrop the band's fill does not reach
  "settings-graphics": {
    isBackdrop: true,
    plate: [{ height: 100, width: 1680, x: 0, y: 0 }],
    region: { height: 82, width: 1680, x: 0, y: 0 },
    screen: "MenuSettings",
    wikiTitle: "File:Login Menu Settings.png",
  },
  // The same settings opened in the world at 1920 wide, on the Graphics tab at its top, scored whole: the header, each
  // Tab's words, the two headings, the twelve rows in sight and the scroll bar are filled from the blurred world around
  // Them, which the page draws them over, so only what the page draws can differ
  "settings-graphics-rows": {
    ...MENU_SETTINGS_REFERENCE,
    plate: [
      ...MENU_SETTINGS_TOP_PLATE,
      { height: 62, width: 350, x: 100, y: 262 },
      { height: 44, width: 136, x: 108, y: 339 },
      { height: 48, width: 197, x: 108, y: 410 },
      { height: 50, width: 196, x: 108, y: 480 },
      { height: 44, width: 180, x: 108, y: 550 },
      { height: 44, width: 215, x: 108, y: 619 },
      { height: 44, width: 142, x: 108, y: 688 },
      { height: 46, width: 146, x: 472, y: 130 },
      { height: 38, width: 126, x: 472, y: 390 },
      { height: 63, width: 1324, x: 478, y: 180 },
      { height: 64, width: 1324, x: 478, y: 247 },
      { height: 63, width: 1324, x: 478, y: 315 },
      { height: 63, width: 1324, x: 478, y: 439 },
      { height: 64, width: 1324, x: 478, y: 506 },
      { height: 63, width: 1324, x: 478, y: 574 },
      { height: 64, width: 1324, x: 478, y: 641 },
      { height: 63, width: 1324, x: 478, y: 709 },
      { height: 64, width: 1324, x: 478, y: 776 },
      { height: 63, width: 1324, x: 478, y: 844 },
      { height: 64, width: 1324, x: 478, y: 911 },
      { height: 63, width: 1324, x: 478, y: 979 },
      { height: 914, width: 22, x: 1810, y: 114 },
    ],
    screen: "MenuSettings",
    seconds: 144.5,
  },
  // Sumeru City from the wiki's location image of 2022, the only Sumeru City shot found: daylight with a clear sky and
  // Short shadows, so a provisional noon until the shadows solve reads its sun. Its landmarks are the terrace's spire
  // And the green-domed minaret's rigid edges, read at the image's pixels; its build is checked against the export once
  // The capital's witness has one, since the upload is older than the current client
  "sumeru-city-location": {
    component: DerivedAssetComponent.Sumeru,
    landmarks: {
      minaretCollarLeft: [795, 930],
      minaretCollarRight: [869, 929],
      minaretDomeLeft: [811, 778],
      minaretDomeRight: [858, 784],
      minaretFinial: [835, 746],
      spireBaseLeft: [1191, 436],
      spireTip: [1214, 314],
      spireWingLeft: [1188, 357],
      spireWingRight: [1245, 347],
    },
    // Provisional: noon, until the shadows solve reads the held minute off this image's sun
    props: { heldMinutes: 720 },
    screen: "WorldScreen",
    wikiTitle: "File:Sumeru City.png",
  },
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
    // Its rigid landmarks cluster at the statue, and the far pedestals cannot be named from the tile data, so no landmark
    // Pins the camera's far field: the pose holds at about 7 px where the camera pass keeps its 2 px gate, so its misfit
    // Shows there
    poseBar: 7.5,
    props: {
      cameraPose: { fov: 58.365, heading: 65.402, pitch: 2.856, position: [70.935, -1.584, 7.956] },
      heldMinutes: 720,
    },
    screen: "WorldScreen",
    seconds: 360,
  },
  // The English PC client's wish screen on the Character Event banner, Born of Ocean Swell open, at 78 seconds of the public
  // 1080p recording, once its banner has settled: scored whole over its sky, the game's pieces (the tab row, the currency,
  // The banner card, the Shop, Details and History row and the wish buttons) filled from round them
  "wish-screen": {
    capture: "yt-uhCW3MZTgL8.mp4",
    isBackdrop: true,
    plate: [
      { height: 95, width: 560, x: 675, y: 0 },
      { height: 50, width: 300, x: 1480, y: 20 },
      { height: 60, width: 60, x: 1805, y: 12 },
      { height: 50, width: 160, x: 45, y: 20 },
      { height: 680, width: 1300, x: 315, y: 210 },
      { height: 35, width: 230, x: 60, y: 955 },
      { height: 40, width: 570, x: 60, y: 1012 },
      { height: 80, width: 345, x: 1145, y: 972 },
      { height: 80, width: 345, x: 1520, y: 972 },
      { height: 30, width: 215, x: 1645, y: 1050 },
      { height: 95, width: 200, x: 0, y: 0 },
    ],
    screen: "WishScreen",
    seconds: 78,
  },
  // The English PC client's World Level dialog at 1080 high from a public tutorial's recording, its frame at 5 seconds,
  // The dialog open over the dimmed menu. Scored over the dialog's frame, which is opaque. The recording is an older
  // Build's, whose help text reads World Level 5 and "reduce" where the current text map reads 3 and "decrease"
  "world-level-dialog": {
    capture: "world-level-dialog-2024.mkv",
    region: { height: 716, width: 1078, x: 421, y: 182 },
    screen: "MenuWorldLevelDialog",
    seconds: 5,
  },
};
