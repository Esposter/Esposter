import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";
import { getCharacterScreenPlate } from "#src/services/genshinParity/shared/getCharacterScreenPlate";

// The two settings entries are scored from the same recording, against the same mean-difference bar, over a backdrop
const MENU_SETTINGS_REFERENCE = {
  approval: { bar: 2, measure: ParityApprovalMeasure.MeanDifference },
  isBackdrop: true,
} as const;
// The settings backdrop's header rows and the first two rows of its menu, which both entries draw over the same place
const MENU_SETTINGS_TOP_PLATE = [
  { height: 112, width: 1920, x: 0, y: 0 },
  { height: 44, width: 186, x: 108, y: 130 },
  { height: 50, width: 254, x: 108, y: 200 },
];

// The interface the overview clip's frame draws over its world and the still does not show: the minimap and the icons
// Along the top, the party down the right, the chat, the health bar and the skill, each filled from the world round it
const QUEST_SCREEN_BACKDROP_PLATE = [
  { height: 240, width: 290, x: 0, y: 0 },
  { height: 110, width: 520, x: 1400, y: 0 },
  { height: 470, width: 350, x: 1570, y: 200 },
  { height: 220, width: 470, x: 0, y: 860 },
  { height: 45, width: 400, x: 730, y: 990 },
  { height: 200, width: 280, x: 1640, y: 880 },
];

// A character screen's tab column, its words and diamonds clear of the scene's light, scored by the five tab entries
const CHARACTER_TABS_REGION = { height: 800, width: 900, x: 120, y: 180 };
// A weapon screen's whole frame above the recorder's UID, scored by the three weapon entries
const WEAPON_SCREEN_REGION = { height: 838, width: 1920, x: 0, y: 0 };
// A forge's Queues tab in full above the recorder's UID, scored by its two Queues entries
const FORGE_QUEUES_REGION = { height: 860, width: 1920, x: 0, y: 0 };
// The Queues tab's pieces filled from round them, so the blurred scene behind is scored and the game's own pieces are not: the title,
// The foot's coins and close, the tabs, the queue rows, the ring and its item, the figure and bar, the Materials box, the Obtain
// Button and the recorder's UID
const FORGE_QUEUES_PLATE = [
  { height: 75, width: 300, x: 120, y: 10 },
  { height: 70, width: 300, x: 1495, y: 15 },
  { height: 60, width: 615, x: 110, y: 125 },
  { height: 440, width: 620, x: 110, y: 205 },
  { height: 370, width: 620, x: 990, y: 90 },
  { height: 75, width: 620, x: 1000, y: 450 },
  { height: 236, width: 934, x: 838, y: 536 },
  { height: 70, width: 945, x: 830, y: 785 },
  { height: 28, width: 275, x: 1645, y: 858 },
];
// The quit prompt's dialog panel, scored by its rest, hover and pressed entries
const MENU_EXIT_PANEL_REGION = { height: 590, width: 930, x: 495, y: 245 };
// The reasons a screen has no reference yet, each shared by every screen or variant it is pending for
const NO_SCREEN_SCREENSHOT = "no screenshot of the screen yet";
const NO_VARIANT_SCREENSHOT = "no screenshot of this variant yet";
const RECORDING_NOT_ON_DISK = "its recording is not on disk";

// Every screen the console recreates from the game, by the reference it is judged against
export const ParityReferenceMap: Record<string, ParityReference> = {
  // The English PC client's Archive on its Equipment section's Weapons grid at 1080 high, from the public recording at 19.5 seconds: the
  // First five rows of the weapons with the first one selected and the cursor resting on the fifth of the first row, forty entries
  // Open. Its sword, the tiles' art and the unlocked "New" badges (a state the entries do not hold) are plated and not scored, as are
  // The words the page does not draw yet (the count, the filter, the description), so the scored pixels are the name bands, the title,
  // The filter bar and the selected name. The recorder's UID sits bottom right, below the region scored
  "archive-screen": {
    isBackdrop: true,
    mask: [
      { height: 29, width: 115, x: 140, y: 237 },
      { height: 29, width: 115, x: 270, y: 237 },
      { height: 29, width: 115, x: 399, y: 237 },
      { height: 29, width: 115, x: 529, y: 237 },
      { height: 29, width: 115, x: 658, y: 237 },
      { height: 29, width: 115, x: 140, y: 397 },
      { height: 29, width: 115, x: 270, y: 397 },
      { height: 29, width: 115, x: 399, y: 397 },
      { height: 29, width: 115, x: 529, y: 397 },
      { height: 29, width: 115, x: 658, y: 397 },
      { height: 29, width: 115, x: 140, y: 559 },
      { height: 29, width: 115, x: 270, y: 559 },
      { height: 29, width: 115, x: 399, y: 559 },
      { height: 29, width: 115, x: 529, y: 559 },
      { height: 29, width: 115, x: 658, y: 559 },
      { height: 29, width: 115, x: 140, y: 720 },
      { height: 29, width: 115, x: 270, y: 720 },
      { height: 29, width: 115, x: 399, y: 720 },
      { height: 29, width: 115, x: 529, y: 720 },
      { height: 29, width: 115, x: 658, y: 720 },
      { height: 29, width: 115, x: 140, y: 881 },
      { height: 29, width: 115, x: 270, y: 881 },
      { height: 29, width: 115, x: 399, y: 881 },
      { height: 29, width: 115, x: 529, y: 881 },
      { height: 29, width: 115, x: 658, y: 881 },
      { height: 36, width: 272, x: 144, y: 30 },
      { height: 49, width: 18, x: 140, y: 995 },
      { height: 49, width: 466, x: 262, y: 995 },
      { height: 44, width: 203, x: 1600, y: 842 },
    ],
    plate: [
      { height: 66, width: 62, x: 46, y: 16 },
      { height: 44, width: 290, x: 138, y: 26 },
      { height: 92, width: 200, x: 860, y: 10 },
      { height: 40, width: 330, x: 1455, y: 28 },
      { height: 788, width: 410, x: 1160, y: 262 },
      { height: 150, width: 486, x: 1386, y: 836 },
    ],
    pointer: [776, 197],
    region: { height: 1050, width: 1920, x: 0, y: 0 },
    screen: "ArchiveScreen",
    source: "archive-screen.mkv at 19.5s",
  },
  // The English PC client's character screen on the Artifacts tab at 21:9, the same recording at 157.5 seconds, the tab settled, scored over its own scene with the interface it shows filled from round it
  "character-artifacts": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Artifacts"),
    props: { initialTab: "Artifacts" },
    screen: "CharacterScreen",
    source: "session-2.mp4 at 157.5s",
    variant: "artifacts",
  },
  // The same frame's tab column, its words and their diamonds, clear of the scene's light, with the Artifacts tab open
  "character-artifacts-tabs": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Artifacts"),
    props: { initialTab: "Artifacts" },
    region: CHARACTER_TABS_REGION,
    screen: "CharacterScreen",
    source: "session-2.mp4 at 157.5s",
  },
  // The English PC client's character screen on Xilonen's Attributes tab at 21:9, from the user's own recording of the
  // Current build (session-2.mp4 at 155 seconds, the interface settled: at 154.4 its closed tabs are still fading in)
  "character-attributes": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Attributes"),
    screen: "CharacterScreen",
    source: "session-2.mp4 at 155s",
  },
  // The frame's panel down the right: the name, the level, the bar and the five base rows
  "character-attributes-panel": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Attributes"),
    region: { height: 620, width: 640, x: 2800, y: 180 },
    screen: "CharacterScreen",
    source: "session-2.mp4 at 155s",
  },
  // The frame's tab column, its words and their diamonds, clear of the scene's light
  "character-attributes-tabs": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Attributes"),
    region: CHARACTER_TABS_REGION,
    screen: "CharacterScreen",
    source: "session-2.mp4 at 155s",
  },
  // The same frame's band across the top, the name, the portraits and the Geo emblem, clear of the scene
  "character-attributes-top": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Attributes"),
    region: { height: 135, width: 3440, x: 0, y: 0 },
    screen: "CharacterScreen",
    source: "session-2.mp4 at 155s",
  },
  // The English PC client's character screen on the Constellation tab at 21:9, the same recording at 158.3 seconds, the tab settled (158 seconds still fades its node list in), scored over its own scene with the interface it shows filled from round it
  "character-constellation": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Constellation"),
    props: { initialTab: "Constellation" },
    screen: "CharacterScreen",
    source: "session-2.mp4 at 158.3s",
    variant: "constellation",
  },
  // The same frame's tab column, its words and their diamonds, clear of the scene's light, with the Constellation tab open
  "character-constellation-tabs": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Constellation"),
    props: { initialTab: "Constellation" },
    region: CHARACTER_TABS_REGION,
    screen: "CharacterScreen",
    source: "session-2.mp4 at 158.3s",
  },
  // The English PC client's character screen on the Talents tab at 21:9, the same recording at 159 seconds, the tab settled, scored over its own scene with the interface it shows filled from round it
  "character-talents": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Talents"),
    props: { initialTab: "Talents" },
    screen: "CharacterScreen",
    source: "session-2.mp4 at 159s",
    variant: "talents",
  },
  // The same frame's tab column, its words and their diamonds, clear of the scene's light, with the Talents tab open
  "character-talents-tabs": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Talents"),
    props: { initialTab: "Talents" },
    region: CHARACTER_TABS_REGION,
    screen: "CharacterScreen",
    source: "session-2.mp4 at 159s",
  },
  // The English PC client's character screen on the Weapons tab at 21:9, the same recording at 156 seconds, the tab settled, scored over its own scene with the interface it shows filled from round it
  "character-weapons": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Weapons"),
    props: { initialTab: "Weapons" },
    screen: "CharacterScreen",
    source: "session-2.mp4 at 156s",
    variant: "weapons",
  },
  // The same frame's tab column, its words and their diamonds, clear of the scene's light, with the Weapons tab open
  "character-weapons-tabs": {
    isBackdrop: true,
    plate: getCharacterScreenPlate("Weapons"),
    props: { initialTab: "Weapons" },
    region: CHARACTER_TABS_REGION,
    screen: "CharacterScreen",
    source: "session-2.mp4 at 156s",
  },
  // The English PC client's cooking arc at 720 high from a public recording, about 110 seconds in: the pot over its fire, the arc
  // With its zones and the spatula pointer, and the Stop button, over the blurred kitchen behind it. The plate is the interface's
  // Own pieces, filled from round them. The recorder's UID sits bottom right, outside the region scored
  "cooking-screen": {
    isBackdrop: true,
    plate: [
      { height: 56, width: 125, x: 30, y: 6 },
      { height: 56, width: 56, x: 1197, y: 4 },
      { height: 172, width: 342, x: 468, y: 195 },
      { height: 240, width: 150, x: 565, y: 360 },
      { height: 104, width: 600, x: 340, y: 462 },
      { height: 104, width: 90, x: 595, y: 586 },
    ],
    region: { height: 690, width: 1280, x: 0, y: 0 },
    screen: "CookingScreen",
    source: "yt-fEbf_tOV1t4-cooking-sticky-honey-roast.mp4 at 110s",
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
  "crafting-strongbox": { pending: NO_SCREEN_SCREENSHOT, screen: "CraftingStrongbox" },
  // The crafting table's Craft screen at 1080 high from a public video (yt-qQILsaJKlsI), about 40 seconds in: Condensed
  // Resin picked, Crafting Performed 1 and Diluc as the crafter. No frame shows the spot with the screen closed, so no
  // Plate: the mask scores the opaque panels (the recipe grid, the title and the details, the materials band and the
  // Close), clear of the scene's glass and the streamer's overlay in the corner
  "crafting-table": {
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
    pending: RECORDING_NOT_ON_DISK,
    screen: "CraftingScreen",
  },
  // The English PC client's dialogue at 720 high from the public recording, about 19 seconds in: Sara's line with the
  // Traveler's two replies on offer, scored apart as the speaker's name, the line and the replies. Each is drawn over the
  // Frame's clean plate, its scored region filled from its surroundings (`getCleanPlatePath`)
  "dialogue-choices-line": {
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "ah-finally" } },
    region: { height: 28, width: 320, x: 480, y: 586 },
    screen: "DialogueTalk",
    source: "yt-nWBqOXWZuFg.mp4 at 19s",
  },
  "dialogue-choices-replies": {
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "ah-finally" } },
    region: { height: 74, width: 250, x: 850, y: 463 },
    screen: "DialogueTalk",
    source: "yt-nWBqOXWZuFg.mp4 at 19s",
  },
  "dialogue-choices-speaker": {
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "ah-finally" } },
    region: { height: 24, width: 80, x: 600, y: 546 },
    screen: "DialogueTalk",
    source: "yt-nWBqOXWZuFg.mp4 at 19s",
  },
  // The same talk's line with no replies on offer, about 23 seconds in, its speaker's role line under the name left out
  "dialogue-line": {
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "knights-of-favonius" } },
    region: { height: 50, width: 800, x: 240, y: 586 },
    screen: "DialogueTalk",
    source: "yt-nWBqOXWZuFg.mp4 at 23s",
  },
  // Paimon's line about 29 seconds in, from the same recording
  "dialogue-paimon-line": {
    isBackdrop: true,
    props: { startProgress: { isRevealed: true, lineId: "so-it-is-jean" } },
    region: { height: 30, width: 420, x: 430, y: 582 },
    screen: "DialogueTalk",
    source: "yt-nWBqOXWZuFg.mp4 at 29s",
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
  // The quit prompt at rest at 1080 high from the public clip, 26.75 seconds in, once the dialog has opened and before the pointer
  // Reaches a button: neither Cancel nor Confirm is lit. The same recording and scale as the hover and pressed entries, whose panel it
  // Shares, so the three states are scored over the one region
  "exit-prompt": {
    region: MENU_EXIT_PANEL_REGION,
    screen: "MenuExit",
    source: "yt-kIDee7nyD0w-menu-quit-prompt.mp4 at 26.75s",
  },
  // The expedition screen at 1080 high from the public clip (yt-fxIjhlV3vUA), 26 seconds in: Mondstadt's map with six
  // Places pinned and Wolvendom picked, its Expedition Limit across the head, its rewards and durations down the right.
  // Scored over the screen above the recorder's UID, which the clip draws at its bottom right corner. The reward panel and
  // Its action button are drawn opaque by the page over the backdrop, so the reference's pixels under them are covered
  "expedition-screen": {
    isBackdrop: true,
    plate: [
      { height: 65, width: 515, x: 50, y: 15 },
      { height: 40, width: 260, x: 1505, y: 30 },
      { height: 62, width: 63, x: 1812, y: 18 },
      { height: 125, width: 280, x: 60, y: 130 },
      { height: 105, width: 90, x: 770, y: 150 },
      { height: 105, width: 90, x: 520, y: 365 },
      { height: 105, width: 90, x: 1008, y: 293 },
      { height: 105, width: 90, x: 1073, y: 410 },
      { height: 130, width: 126, x: 680, y: 470 },
      { height: 105, width: 90, x: 1130, y: 615 },
    ],
    region: { height: 1050, width: 1920, x: 0, y: 0 },
    screen: "ExpeditionScreen",
    source: "yt-fxIjhlV3vUA-expedition-screen.mp4 at 26s",
  },
  // The English PC client's fishing reel at 1080 high from the recording, 52.5 seconds in: a hooked fish pulling, with the
  // Reel bar across the top of the frame and its tension held inside the zone. The bar and the ring under it are filled
  // from round them, so the page draws the reel's own pieces and the rest of the frame is scored as the game draws it,
  // above the recorder's UID at the bottom right corner
  "fishing-screen": {
    isBackdrop: true,
    plate: [
      { height: 32, width: 520, x: 700, y: 120 },
      { height: 58, width: 64, x: 928, y: 162 },
    ],
    region: { height: 1050, width: 1920, x: 0, y: 0 },
    screen: "FishingScreen",
    source: "fishing-reel.mkv at 52.5s",
  },
  // The English PC client's forge on the Materials tab with an Enhancement Ore at amount five, at 32 seconds of the public
  // Recording of the forge, letterboxed to its 886 high frame: scored whole over its blurred scene, the game's own pieces
  // (the tabs, the recipe list, the item and its amount, the Materials box, the foot) filled from round them
  "forge-screen": {
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
    source: "yt-AVnbm8fESr0-forge-screen.mp4 at 32s",
  },
  // The forge's Queues tab from the same clip at 50.5 seconds: the order completed, Forged 5 of 5 and Obtain shown. The recorder's UID
  // Sits bottom right, below the region scored
  "forge-screen-ores-done": {
    isBackdrop: true,
    plate: FORGE_QUEUES_PLATE,
    region: FORGE_QUEUES_REGION,
    screen: "ForgeScreen",
    source: "yt-AVnbm8fESr0-forge-screen.mp4 at 50.5s",
    variant: "oresDone",
  },
  // The forge's Queues tab at 1920 by 886 from the public clip, 48 seconds in: an Enhancement Ore order forging, four ready, Forged
  // 4 of 5. The fixture's count differs (a five-unit order here), so the compare differs at the figures until its props follow
  "forge-screen-queues": {
    isBackdrop: true,
    plate: FORGE_QUEUES_PLATE,
    region: FORGE_QUEUES_REGION,
    screen: "ForgeScreen",
    source: "yt-AVnbm8fESr0-forge-screen.mp4 at 48s",
    variant: "queues",
  },
  "forge-screen-refused": { pending: NO_VARIANT_SCREENSHOT, screen: "ForgeScreen", variant: "refused" },
  "forge-screen-weapons-done": { pending: NO_VARIANT_SCREENSHOT, screen: "ForgeScreen", variant: "weaponsDone" },
  // The public frame of the card game's duel board at 1080 high from the English PC client, cut from 400 seconds of a
  // Walkthrough, the frame at 407 seconds in the Action Phase: both sides' characters, the dice column and the hand. A
  // Video's frame, so its art is not drawn and only its tints, words and places are scored
  "gcg-duel-board": { screen: "GcgScreen", source: "gcg-yt-tvboQ_ZWO_I-400-410.mp4 at 7s" },
  // The English PC client's Adventurer Handbook open at its experience, the wiki's screenshot, against which the
  // Book's tabs are placed while its pages wait on what they track
  "handbook-experience": { screen: "HandbookScreen", wikiTitle: "File:Adventurer Handbook Experience.png" },
  // The English PC client's notice, from the 2023 recording of its launch at 1080p, in the current build's wording
  "health-notice": { screen: "SplashHealthNotice", source: "yt-sQNqMfmfkZU.mp4 at 8s" },
  // The Japanese PC client's notice whole at 3440 by 1440 from a 21:9 capture of its launch, 12.5 seconds in, static from 11.5 to
  // 12.5. The recording has no watermark or recorder icons; the text spans x 290 to 3150 and y 480 to 965, so the region covers it
  "health-notice-japanese": {
    props: { language: "Japanese" },
    region: { height: 565, width: 2940, x: 250, y: 440 },
    screen: "SplashHealthNotice",
    source: "session-2.mp4 at 12.5s",
  },
  // Mainland China's notice in its own words, from the public recording of an older build's launch its splash is taken
  // From, held from about 7 to 12 seconds
  "health-notice-mainland": {
    props: { language: "ChineseSimplified" },
    screen: "SplashHealthNotice",
    source: "bili-av532052219.mp4 at 9.5s",
  },
  // The English PC client's Paimon button at 1080 high, from the same public recording at 20 seconds, its emblem's place
  // And fill measured over the corner. The minimap's disc takes the emblem's right half, so only the rectangles left of
  // And above it are scored, and the rest of that frame's HUD is left out of the region
  // Its plate is the emblem's own box, so the backdrop around it is the recording's own pixels, not a fill
  "hud-paimon-button": {
    isBackdrop: true,
    mask: [
      { height: 100, width: 66, x: 0, y: 0 },
      { height: 32, width: 44, x: 66, y: 0 },
    ],
    plate: [{ height: 82, width: 70, x: 25, y: 9 }],
    props: { isTouch: false },
    region: { height: 100, width: 110, x: 0, y: 0 },
    screen: "HudScreen",
    source: "world-pickup.mkv at 20s",
  },
  // The English PC client's stamina meter at 1080 high, from a public tutorial's climb at 48 seconds (this clip's 30),
  // Three tenths of a pool of about 214 left in yellow under its drained track, which the pool's two cuts cross, on the
  // White rock clear of the character. The meter is drawn round the pivot, so the frame's pivot is the circle its arc
  // Was fitted to (978.3, 501.3), and only the meter's looks are scored, the rest of that player's HUD left out of the
  // Region
  // Its plate is the meter's own arc, so the sky around it is the recording's own pixels, not a fill
  "hud-stamina-climb": {
    isBackdrop: true,
    plate: [{ height: 105, width: 28, x: 1064, y: 449 }],
    props: { frame: { pivotX: 0.5095, pivotY: 0.4642, seconds: 0, stamina: 64 }, isTouch: false, maxStamina: 214 },
    region: { height: 140, width: 65, x: 1040, y: 430 },
    screen: "HudScreen",
    source: "yt-hRR2yoP3uY0-world-stamina.mp4 at 30s",
  },
  // The English PC client's skill and burst at 1080 high, from the same public recording at 20 seconds, before it moves
  // To the phone: Chongyun on the field with his burst charged, scored over the keys' corner clear of the gadget above
  // And the UID below. Only the field member's figures change, so the rest of the frame's HUD is left out of the region
  // Its plate is the keys' discs and caps, so the scene around them is the recording's own pixels, not a fill
  "hud-world-keys": {
    isBackdrop: true,
    plate: [
      { height: 75, width: 75, x: 14, y: 46 },
      { height: 113, width: 112, x: 123, y: 9 },
      { height: 27, width: 31, x: 36, y: 121 },
      { height: 27, width: 31, x: 163, y: 121 },
    ],
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
    source: "world-pickup.mkv at 20s",
  },
  // The English mobile client's world HUD from the public recording of a session at 70 seconds, played on a phone, its
  // Black letterbox bars cropped away and its subtitles left out of the region scored. The HUD is drawn over the
  // Recording's own frame, so a piece the HUD drops reads as the game's own (the screen is shot bare too, `isBackdrop`
  // Only shows the overlay)
  // Its plate is the HUD's pieces alone, so the scene between them is the recording's own pixels
  "hud-world-pickup": {
    isBackdrop: true,
    plate: [
      { height: 240, width: 300, x: 100, y: 10 },
      { height: 85, width: 280, x: 120, y: 255 },
      { height: 80, width: 560, x: 1240, y: 10 },
      { height: 30, width: 140, x: 1700, y: 85 },
      { height: 300, width: 330, x: 1500, y: 150 },
      { height: 235, width: 340, x: 1100, y: 350 },
      { height: 320, width: 340, x: 1450, y: 540 },
      { height: 75, width: 75, x: 1280, y: 660 },
      { height: 65, width: 65, x: 115, y: 820 },
      { height: 100, width: 560, x: 590, y: 780 },
      { height: 80, width: 90, x: 1180, y: 800 },
    ],
    region: { height: 880, width: 1920, x: 0, y: 0 },
    screen: "HudScreen",
    source: "world-pickup.mkv at 70s, cropped to 1920x935 from 0,72",
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
    source: "yt-UBNImta_dWs-prompt-scroll.mp4 at 23s",
  },
  // The English PC client's pickup at 1080 high: three drops in reach, the first row selected with its F cap, from a public
  // Tutorial's recording at 9 seconds with no caption over it, the cap held on that row from 7 to 13 seconds. Drawn behind the
  // Prompt list, the plate fills the cap and the three pills, so the scene round them is the game's own and only the list's own
  // Pieces can differ; the recording's camera moves after the pickup, so no clean frame of the scene exists for the pills'
  // Glass, which is scored as drawn. The streamer's camera sits outside the region
  "interaction-prompts-pickup": {
    isBackdrop: true,
    plate: [
      { height: 38, width: 58, x: 1096, y: 448 },
      { height: 68, width: 341, x: 1154, y: 433 },
      { height: 68, width: 341, x: 1154, y: 505 },
      { height: 68, width: 341, x: 1154, y: 577 },
    ],
    region: { height: 220, width: 370, x: 1095, y: 430 },
    screen: "InteractionPromptList",
    source: "world-pickup.mkv at 9s",
  },
  // The food tab of the bag, from the same account tour's recording of the English PC client 58 seconds in: the foot's
  // Primogems and Mora where the sort's dropdown stands on an equipment tab, drawn behind the bag so only its foot can differ
  "inventory-food": {
    isBackdrop: true,
    props: {
      initialCategory: "Food",
      wallet: {
        AcquaintFate: 0,
        GenesisCrystal: 0,
        IntertwinedFate: 0,
        MasterlessStardust: 0,
        MasterlessStarglitter: 0,
        Mora: 6_031_059,
        Primogem: 1399,
      },
    },
    region: { height: 120, width: 700, x: 0, y: 960 },
    screen: "InventoryScreen",
    source: "yt-_agTJviXj7s-bag.mp4 at 58s",
  },
  // The weapons' tab of the bag at 1080 high, from a public account tour's recording of the English PC client, its frame
  // At 30 seconds into the clip, drawn behind the bag so only the bag can differ. The streamer's camera at the top left
  // And the recording's UID at the bottom right sit outside the region
  "inventory-weapons": {
    isBackdrop: true,
    region: { height: 1048, width: 1270, x: 650, y: 0 },
    screen: "InventoryScreen",
    source: "yt-_agTJviXj7s-bag.mp4 at 30s",
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
    component: DerivedAssetComponent.Login,
    isOtherBuild: true,
    props: { heldScrolled: 132, isInterfaceHidden: true, stage: "Title", timeOfDay: "Dawn" },
    screen: "LoginScreen",
    source: "yt-sQNqMfmfkZU.mp4 at 18s",
    variant: "dawn",
  },
  // Its recording masks the frame's top and bottom 50 rows black, so only the rows between are scored
  "login-day-title": {
    component: DerivedAssetComponent.Login,
    isOtherBuild: true,
    props: { heldScrolled: 118, isInterfaceHidden: true, stage: "Title", timeOfDay: "Day" },
    region: { height: 980, width: 1920, x: 0, y: 50 },
    screen: "LoginScreen",
    source: "yt-7kK6HqVfASk.mp4 at 8s",
    variant: "day",
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
    source: "yt-rBnfA4pXw6U.mp4 at 14s",
  },
  // The door at night on the current build (7.1) at 21.5:9, this machine's own recording of the client, its last frame
  // Before the prompt, the camera still easing toward its rest; scored clear of the corner buttons and the build string
  "login-door-session": {
    component: DerivedAssetComponent.Login,
    // Read off the frame: the arch's apex and the dais's front feet on the walkway's top
    landmarks: { doorApex: [1717, 575], doorFootLeft: [1585, 1028], doorFootRight: [1855, 1028] },
    props: { heldScrolled: 320, isInterfaceHidden: true, stage: "Door", timeOfDay: "Night" },
    region: { height: 1300, width: 3100, x: 0, y: 0 },
    screen: "LoginScreen",
    source: "session-2.mp4 at 35.9s",
  },
  "login-interface-arriving": { pending: NO_VARIANT_SCREENSHOT, screen: "LoginInterface", variant: "arriving" },
  // The login screen's interface over the English recording's own frames of it, at 1080 high: its title, its status as
  // Data loads, and its prompt at the door. The recording is of an older build, whose title shows a repair button and
  // Whose build string differs, so those two stay apart from ours, which are the current build's
  "login-interface-door": {
    isBackdrop: true,
    props: { isWelcomeShown: false, stage: "Door" },
    screen: "LoginInterface",
    source: "yt-rBnfA4pXw6U.mp4 at 14s",
    variant: "door",
  },
  // Mainland China's interface at the door with its prompt, over the launch recording's own frame at 15.5 seconds, the
  // First frame the prompt stands whole on the 12 to 17 second stills, scored over the whole frame, its rating included
  "login-interface-door-mainland": {
    isBackdrop: true,
    props: { isWelcomeShown: false, language: "ChineseSimplified", stage: "Door" },
    screen: "LoginInterface",
    source: "bili-av532052219.mp4 at 15.5s",
  },
  "login-interface-loading": {
    isBackdrop: true,
    props: { isWelcomeShown: false, progress: 0.2797, stage: "Preparing", statusStep: "LoadingData" },
    screen: "LoginInterface",
    source: "yt-rBnfA4pXw6U.mp4 at 5s",
    variant: "loadingData",
  },
  "login-interface-loading-game": { pending: NO_VARIANT_SCREENSHOT, screen: "LoginInterface", variant: "loadingGame" },
  // Mainland China's interface over its launch recording's own frame at 1080 high, the door not yet formed, scored over
  // Its age rating alone: the recording is of an older build, whose build string sits apart from the current one's
  "login-interface-mainland-rating": {
    isBackdrop: true,
    props: { isDoorWaiting: true, isWelcomeShown: false, language: "ChineseSimplified", stage: "Door" },
    region: { height: 150, width: 150, x: 1740, y: 30 },
    screen: "LoginInterface",
    source: "bili-av532052219.mp4 at 12.5s",
    variant: "mainland",
  },
  "login-interface-title": {
    isBackdrop: true,
    props: { isWelcomeShown: false, playerName: "br****nd@gmail.com", stage: "Title" },
    screen: "LoginInterface",
    source: "yt-rBnfA4pXw6U.mp4 at 0.5s",
  },
  "login-night-title": {
    component: DerivedAssetComponent.Login,
    isOtherBuild: true,
    props: { heldScrolled: 135, isInterfaceHidden: true, stage: "Title", timeOfDay: "Night" },
    screen: "LoginScreen",
    source: "yt-PnqNza4qWzs.mp4 at 12s",
  },
  // The English PC client's title scene at dusk at 1080 high, 3 seconds in, settled (the same frame as the public dusk clip at 3
  // Seconds). The power button, the publisher's icon and the build string sit at the corners
  "login-screen-dusk": { screen: "LoginScreen", source: "login-dusk.mkv at 3s", variant: "dusk" },
  // The English PC client's map zoomed out over Galesong Hill at 99% (yt-kgW2IgWKukg at 4.6 seconds, 1080p and 60 frames a
  // Second, one chest before the area reads 100%). Its label, the name and the progress line under it, scored over the
  // Glyphs' silhouettes alone, the terrain between their strokes left out. The game places a label from map data the
  // Catalogue does not hold, so the camera stands where Galesong Hill's outline puts the label on the still's, and the
  // Area holds one doing at the still's progress; the comparison reads the label's type and its line's place, not where
  // The map writes it
  "map-overlay-galesong": {
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
    silhouettes: [
      { height: 48, ink: [228, 233, 227], width: 136, x: 610, y: 338 },
      { height: 48, ink: [232, 236, 233], width: 102, x: 774, y: 338 },
      { height: 24, ink: [232, 236, 223], width: 290, x: 598, y: 392 },
    ],
    source: "yt-kgW2IgWKukg-exploration-steps.mp4 at 4.6s",
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
  // The quit prompt at 1080 high from the public clip, 29 seconds in: Confirm lit under the pointer, Cancel not. The dialog's whole panel
  // Is scored; the UID at the bottom right lies outside it
  "menu-exit-hover": {
    region: MENU_EXIT_PANEL_REGION,
    screen: "MenuExit",
    source: "yt-kIDee7nyD0w-menu-quit-prompt.mp4 at 29s",
    variant: "hover",
  },
  // The same prompt 1.6 seconds later with Confirm pressed: a pale fill with a gold label, held for about 0.2 seconds before the
  // White fade
  "menu-exit-pressed": {
    region: MENU_EXIT_PANEL_REGION,
    screen: "MenuExit",
    source: "yt-kIDee7nyD0w-menu-quit-prompt.mp4 at 30.6s",
    variant: "pressed",
  },
  "menu-paimon-disabled": { pending: NO_VARIANT_SCREENSHOT, screen: "MenuPaimon", variant: "disabled" },
  "menu-paimon-hover": { pending: NO_VARIANT_SCREENSHOT, screen: "MenuPaimon", variant: "hover" },
  "menu-paimon-pressed": { pending: NO_VARIANT_SCREENSHOT, screen: "MenuPaimon", variant: "pressed" },
  // The English PC client's Time screen at 1080 high from a public recording (yt-a4_J84iMqR0), ten seconds in: the clock
  // At 03:52 and the dial turned to 18:00 Today, drawn over the world it dims. The fixture's hand rests half an hour on, so
  // The compare differs at the hand and the target hour until the screen takes a dialled advance
  "menu-time": {
    isBackdrop: true,
    props: { clockMinutes: 232 },
    screen: "MenuTime",
    source: "yt-a4_J84iMqR0-time.mp4 at 10s",
  },
  "menu-world-level-prompt": { pending: NO_SCREEN_SCREENSHOT, screen: "MenuWorldLevelPrompt" },
  "menu-world-level-prompt-hover": { pending: NO_VARIANT_SCREENSHOT, screen: "MenuWorldLevelPrompt", variant: "hover" },
  "menu-world-level-prompt-pressed": {
    pending: NO_VARIANT_SCREENSHOT,
    screen: "MenuWorldLevelPrompt",
    variant: "pressed",
  },
  "menu-world-level-prompt-revert": {
    pending: NO_VARIANT_SCREENSHOT,
    screen: "MenuWorldLevelPrompt",
    variant: "revert",
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
  // The English PC client's Paimon menu on the current build, from a 2026 recording (`yt-jHr2bERjkYc`, 25 seconds in), cut
  // at 1920 by 1080 with the recording's pillarbox around the game window and no screen open. The logo and the UID at the
  // Frame's bottom right lie outside the region; the panel's own UID, name and avatar lie inside it. The account is at
  // Adventure Rank 2, and every tile the frame draws reads open. Scored over the side bar and the panel, their translucent
  // Feet where the world shows through included. The game window is the 1620 pixels between the pillarbox, so the menu stands
  // At its left edge, 150 in.
  // The five side bar icons above Quit, each centre's y in the frame's pixels (the window is 1080 high, so a unit is a pixel),
  // measured on the frame: Photo Mode 284, Notices 395 (its glyph with the ring it hangs from), Mail 512, Time 627, Settings 740.
  // The 16:9 map places them at 412, 524, 638, 754 and 868 when drawn at the menu's 0.79 reference pixel, so the 3:2 window
  // stands each 126 to 129 pixels higher. Quit's centre is 1024 in the frame, 55 above the bottom edge: the map has it 70 of
  // the 1440 high still's pixels from the bottom, which is the same 55 at 0.79, so Quit anchors to the bottom while the five
  // are not, and the menu draws Quit from the bottom edge at that distance. How the game anchors the five is not known: the
  // install's extraction did not find this menu's prefab, so the menu draws them where the 16:9 map has them
  "paimon-menu": {
    region: { height: 1080, width: 810, x: 150, y: 0 },
    screen: "MenuPaimon",
    source: "yt-jHr2bERjkYc-logout-tech4gamers.mp4 at 25s",
    windowLeft: 150,
  },
  // The English PC client's Party Setup at 1080 high from a public recording (yt-greLeGJE-Jg-party-setup.mp4), about 38 seconds
  // In: Party 1 deployed with Venti, Xiangling, Raiden Shogun and Alhaitham, each at Lv. 90. The members stand in the game's own
  // Scene, so the sky is the frame's and the members, their icons, the title, the step dots, the Elemental Resonance pill, the
  // Close and the arrows are filled from round them. The subtitle band and the foot's buttons lie below the region
  "party-screen": {
    isBackdrop: true,
    plate: [
      { height: 60, width: 240, x: 50, y: 20 },
      { height: 40, width: 150, x: 880, y: 25 },
      { height: 60, width: 360, x: 1420, y: 18 },
      { height: 68, width: 66, x: 1808, y: 14 },
      { height: 60, width: 50, x: 50, y: 510 },
      { height: 60, width: 50, x: 1826, y: 510 },
      { height: 690, width: 340, x: 255, y: 250 },
      { height: 550, width: 240, x: 675, y: 330 },
      { height: 560, width: 190, x: 1020, y: 290 },
      { height: 730, width: 330, x: 1240, y: 205 },
    ],
    region: { height: 940, width: 1920, x: 0, y: 0 },
    screen: "PartyScreen",
    source: "yt-greLeGJE-Jg-party-setup.mp4 at 38s",
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
  "publisher-splash": { screen: "SplashPublisher", source: "session-2.mp4 at 1s" },
  // The English PC client's quest screen listing every quest in progress, the wiki's screenshot of it at 1080 high. The
  // World behind it is the overview clip's frame at 0.9 seconds, drawn as the recording shows it: the plate draws no
  // Blur, so none is fitted to the still's blurred world
  "quest-screen": {
    isBackdrop: true,
    plate: QUEST_SCREEN_BACKDROP_PLATE,
    plateSource: "yt-2_e7S_J9yAA-quest-overview.mp4 at 0.9s",
    screen: "QuestScreen",
    wikiTitle: "File:Quest Screen.png",
  },
  // The same still's details column on the right, the title, journal, objective and description, clear of the rewards
  "quest-screen-details": {
    isBackdrop: true,
    plateSource: "yt-2_e7S_J9yAA-quest-overview.mp4 at 0.9s",
    region: { height: 680, width: 899, x: 877, y: 100 },
    screen: "QuestScreen",
    wikiTitle: "File:Quest Screen.png",
  },
  // The same still's band across the top, the tabs, the banner and the close button, clear of the blurred world
  "quest-screen-header": {
    isBackdrop: true,
    plate: QUEST_SCREEN_BACKDROP_PLATE,
    plateSource: "yt-2_e7S_J9yAA-quest-overview.mp4 at 0.9s",
    region: { height: 95, width: 1920, x: 0, y: 0 },
    screen: "QuestScreen",
    wikiTitle: "File:Quest Screen.png",
  },
  // The same still's list down the left, its quest rows and series panels, the translucent glass scored as drawn over the
  // Same world frame the whole screen is scored over
  "quest-screen-list": {
    isBackdrop: true,
    plate: QUEST_SCREEN_BACKDROP_PLATE,
    plateSource: "yt-2_e7S_J9yAA-quest-overview.mp4 at 0.9s",
    region: { height: 850, width: 666, x: 150, y: 105 },
    screen: "QuestScreen",
    wikiTitle: "File:Quest Screen.png",
  },
  // The City Reputation's reward page of Mondstadt at 1080 high from the public City Reputation Guide, 18 seconds in: the
  // Level list down the right at level 3, the levels' rewards and each one's achieved mark, clear of the clip's own
  // Recording timer and its UID. Scored over the list's panel only, since the nation's art on the left is not drawn yet
  "reputation-screen": {
    region: { height: 872, width: 1220, x: 652, y: 145 },
    screen: "ReputationScreen",
    source: "yt-1SqmdXbIhLs-reputation-guide.mp4 at 18s",
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
    source: "yt-5EmJX_RyuY8-menu-settings.mp4 at 178s",
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
    source: "yt-5EmJX_RyuY8-menu-settings.mp4 at 144.5s",
  },
  // The English PC client's Benediction screen at 1080 high from the public clip, 3 seconds in: Floor 1 Chamber 1 with its hint and
  // Three cards, the middle one lit at rest with the pointer on its last line. The game's own UID line sits at the bottom right
  "spiral-abyss-benediction": {
    isBackdrop: true,
    plate: [
      { height: 52, width: 420, x: 750, y: 68 },
      { height: 16, width: 1744, x: 88, y: 140 },
      { height: 76, width: 1428, x: 246, y: 256 },
      { height: 428, width: 276, x: 822, y: 322 },
      { height: 406, width: 248, x: 524, y: 333 },
      { height: 406, width: 248, x: 1148, y: 333 },
      { height: 18, width: 1744, x: 88, y: 895 },
    ],
    region: { height: 1040, width: 1920, x: 0, y: 0 },
    screen: "SpiralAbyssBenediction",
    source: "yt-Osaylns8nyk-spiral-abyss-chamber.mp4 at 3s",
  },
  "spiral-abyss-entry": { pending: NO_SCREEN_SCREENSHOT, screen: "SpiralAbyssEntry" },
  "splash-title-chinese-traditional": {
    pending: NO_VARIANT_SCREENSHOT,
    screen: "SplashTitle",
    variant: "chineseTraditional",
  },
  // The Japanese PC client's logo screen at 3440 by 1440 from a 21:9 capture of its launch, 7.5 seconds in, settled: the Japanese
  // Logo with its Genshin line, whole on white and with no licence line
  "splash-title-japanese": { screen: "SplashTitle", source: "session-2.mp4 at 7.5s", variant: "japanese" },
  "splash-title-korean": { pending: NO_VARIANT_SCREENSHOT, screen: "SplashTitle", variant: "korean" },
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
  "title-splash": { screen: "SplashTitle", source: "yt-sQNqMfmfkZU.mp4 at 5s" },
  // Mainland China's splash, its 原神 logo with its licence under it, from a public recording of an older build's launch
  // At 1080p, drawn on full white where the current PC client's white is a step under it
  "title-splash-mainland": {
    props: { language: "ChineseSimplified" },
    screen: "SplashTitle",
    source: "bili-av532052219.mp4 at 5s",
    variant: "chineseSimplified",
  },
  // The English PC client's Weapon screen on the Enhance tab at 1920 by 864 from a recording of levelling a five-star sword, 1.9
  // Seconds in: Lv. 1, nothing in the enhancement slots. The recorder's UID sits bottom right, below the region scored
  "weapon-screen": {
    isBackdrop: true,
    plate: [
      { height: 66, width: 62, x: 120, y: 16 },
      { height: 40, width: 262, x: 212, y: 28 },
      { height: 46, width: 244, x: 1278, y: 24 },
      { height: 46, width: 166, x: 1538, y: 24 },
      { height: 66, width: 66, x: 1738, y: 16 },
      { height: 180, width: 300, x: 126, y: 136 },
      { height: 66, width: 706, x: 1098, y: 110 },
      { height: 116, width: 706, x: 1098, y: 212 },
      { height: 14, width: 738, x: 1086, y: 186 },
      { height: 34, width: 524, x: 1190, y: 484 },
      { height: 56, width: 466, x: 1100, y: 524 },
      { height: 56, width: 224, x: 1580, y: 524 },
      { height: 132, width: 722, x: 1100, y: 596 },
      { height: 38, width: 200, x: 1100, y: 786 },
      { height: 12, width: 738, x: 1086, y: 736 },
      { height: 72, width: 72, x: 1420, y: 768 },
      { height: 72, width: 296, x: 1508, y: 768 },
      { height: 96, width: 48, x: 784, y: 174 },
      { height: 170, width: 190, x: 612, y: 262 },
      { height: 92, width: 75, x: 600, y: 410 },
      { height: 102, width: 80, x: 530, y: 500 },
      { height: 102, width: 80, x: 460, y: 600 },
      { height: 72, width: 75, x: 400, y: 700 },
      { height: 96, width: 110, x: 402, y: 768 },
    ],
    region: WEAPON_SCREEN_REGION,
    screen: "WeaponScreen",
    source: "weapon-levelling.mkv at 1.93s",
  },
  // The Ascend tab from the same recording at 12.9 seconds: Lv. 20 of 20 to 20 of 40 with the ascension materials and the button lit. The
  // Required line shows a struck-through 5000 the recording applies, so the compare differs there
  "weapon-screen-ascend": {
    isBackdrop: true,
    plate: [
      { height: 66, width: 62, x: 120, y: 16 },
      { height: 40, width: 262, x: 212, y: 28 },
      { height: 46, width: 244, x: 1278, y: 24 },
      { height: 46, width: 166, x: 1538, y: 24 },
      { height: 66, width: 66, x: 1738, y: 16 },
      { height: 180, width: 300, x: 126, y: 136 },
      { height: 40, width: 470, x: 1230, y: 150 },
      { height: 36, width: 552, x: 1186, y: 102 },
      { height: 110, width: 706, x: 1098, y: 222 },
      { height: 14, width: 738, x: 1086, y: 198 },
      { height: 34, width: 360, x: 1270, y: 548 },
      { height: 130, width: 350, x: 1278, y: 594 },
      { height: 38, width: 330, x: 1100, y: 786 },
      { height: 12, width: 738, x: 1086, y: 736 },
      { height: 72, width: 296, x: 1508, y: 768 },
      { height: 100, width: 52, x: 432, y: 148 },
      { height: 166, width: 170, x: 478, y: 262 },
      { height: 130, width: 130, x: 560, y: 420 },
      { height: 130, width: 120, x: 640, y: 520 },
      { height: 120, width: 110, x: 700, y: 630 },
      { height: 134, width: 90, x: 716, y: 730 },
    ],
    region: WEAPON_SCREEN_REGION,
    screen: "WeaponScreen",
    source: "weapon-levelling.mkv at 12.9s",
    variant: "ascend",
  },
  "weapon-screen-at-cap": {
    pending: "the recording zooms over the state, so no whole-screen frame shows it",
    screen: "WeaponScreen",
    variant: "atCap",
  },
  "weapon-screen-rank-five": { pending: NO_VARIANT_SCREENSHOT, screen: "WeaponScreen", variant: "rankFive" },
  // The Refine tab from the same recording at 91 seconds: Rank 1 with the four refinement slots empty. The tab shows no level, so the
  // Fixture's level is not on the screen
  "weapon-screen-refine": {
    isBackdrop: true,
    plate: [
      { height: 66, width: 62, x: 120, y: 16 },
      { height: 40, width: 262, x: 212, y: 28 },
      { height: 46, width: 244, x: 1278, y: 24 },
      { height: 46, width: 166, x: 1538, y: 24 },
      { height: 66, width: 66, x: 1738, y: 16 },
      { height: 180, width: 300, x: 126, y: 136 },
      { height: 44, width: 250, x: 1330, y: 96 },
      { height: 30, width: 290, x: 1306, y: 146 },
      { height: 14, width: 738, x: 1086, y: 178 },
      { height: 32, width: 388, x: 1258, y: 204 },
      { height: 200, width: 704, x: 1100, y: 248 },
      { height: 34, width: 366, x: 1100, y: 548 },
      { height: 58, width: 224, x: 1580, y: 534 },
      { height: 130, width: 472, x: 1218, y: 600 },
      { height: 38, width: 200, x: 1100, y: 786 },
      { height: 12, width: 738, x: 1086, y: 736 },
      { height: 72, width: 296, x: 1508, y: 768 },
      { height: 80, width: 36, x: 566, y: 192 },
      { height: 110, width: 50, x: 572, y: 262 },
      { height: 130, width: 50, x: 604, y: 370 },
      { height: 150, width: 50, x: 626, y: 500 },
      { height: 140, width: 50, x: 652, y: 640 },
      { height: 94, width: 40, x: 672, y: 770 },
    ],
    region: WEAPON_SCREEN_REGION,
    screen: "WeaponScreen",
    source: "weapon-levelling.mkv at 91s",
    variant: "refine",
  },
  "weapon-screen-two-star": { pending: NO_VARIANT_SCREENSHOT, screen: "WeaponScreen", variant: "twoStar" },
  // The statue under the oak by day, from the 2026 recording's fixed camera east of it, whose game clock runs a minute a
  // Real second from about six in the morning; the entry holds the clock at 720 minutes, an hour still to be read off its
  // Sun; its camera is solved from its landmarks and refined on the statue's outline
  "windrise-statue-day": {
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
    source: "yt-zPDi6WBJW9Y.mp4 at 360s",
  },
  // The English PC client's wish screen on the Character Event banner, Born of Ocean Swell open, at 78 seconds of the public
  // 1080p recording, once its banner has settled: scored whole over its sky, the game's pieces (the tab row, the currency,
  // The banner card, the Shop, Details and History row and the wish buttons) filled from round them
  "wish-screen": {
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
    source: "yt-uhCW3MZTgL8.mp4 at 78s",
  },
  // The English PC client's World Level dialog at 1080 high from a public tutorial's recording, its frame at 5 seconds,
  // The dialog open over the dimmed menu. Scored over the dialog's frame, which is opaque. The recording is an older
  // Build's, whose help text reads World Level 5 and "reduce" where the current text map reads 3 and "decrease"
  "world-level-dialog": {
    region: { height: 716, width: 1078, x: 421, y: 182 },
    screen: "MenuWorldLevelDialog",
    source: "world-level-dialog-2024.mkv at 5s",
  },
  "world-realm-placement-editor": { pending: NO_SCREEN_SCREENSHOT, screen: "WorldRealmPlacementEditor" },
  "world-realm-placement-editor-at-load": {
    pending: NO_VARIANT_SCREENSHOT,
    screen: "WorldRealmPlacementEditor",
    variant: "atLoad",
  },
};
