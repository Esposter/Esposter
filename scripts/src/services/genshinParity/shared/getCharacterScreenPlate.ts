import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// Each tab's row down the character screen's 3440 by 1440 recording (`session-2.mp4`, 155 to 159 seconds), in the order
// The game lists them: its words' centre on a 92.8-pixel pitch from 204, and how far its word reaches right while its
// Tab is closed, Profile's alert with it
const TAB_ROWS = [
  { centre: 204, tab: "Attributes", wordEnd: 517 },
  { centre: 296.8, tab: "Weapons", wordEnd: 489 },
  { centre: 389.6, tab: "Artifacts", wordEnd: 489 },
  { centre: 482.4, tab: "Constellation", wordEnd: 584 },
  { centre: 575.2, tab: "Talents", wordEnd: 455 },
  { centre: 668, tab: "Profile", wordEnd: 489 },
];

// The pieces every tab's frame draws in the same place: the band across the top with the element's emblem below its
// Edge, the W and S keys, the arrows to the characters either side, and the foot's buttons left and right, the UID's
// Line under the right
const FRAME_PLATE: ImageRegion[] = [
  { height: 136, width: 3440, x: 0, y: 0 },
  { height: 140, width: 150, x: 124, y: 0 },
  { height: 124, width: 92, x: 152, y: 156 },
  { height: 80, width: 66, x: 162, y: 680 },
  { height: 80, width: 66, x: 3212, y: 680 },
  { height: 118, width: 437, x: 143, y: 1285 },
  { height: 171, width: 590, x: 2680, y: 1269 },
];

// Each tab's own pieces: its panel down the right, and the Artifacts tab's four slots either side of the character
const TAB_PLATE: Record<string, ImageRegion[]> = {
  Artifacts: [
    { height: 1250, width: 560, x: 2685, y: 140 },
    { height: 180, width: 225, x: 1020, y: 660 },
    { height: 290, width: 225, x: 1055, y: 890 },
    { height: 190, width: 230, x: 2225, y: 660 },
    { height: 295, width: 285, x: 2100, y: 905 },
  ],
  Attributes: [{ height: 875, width: 495, x: 2700, y: 145 }],
  Constellation: [{ height: 925, width: 590, x: 2695, y: 275 }],
  Talents: [{ height: 875, width: 600, x: 2600, y: 140 }],
  Weapons: [{ height: 1230, width: 660, x: 2620, y: 160 }],
};

// The interface's pieces a character screen reference's clean plate fills, in its recording's own pixels, with the tab
// Named open: the frame's own, each closed tab's diamond and word, the open one's diamond, word and the light streaked
// Behind it, and the open tab's own pieces
export const getCharacterScreenPlate = (openTab: string): ImageRegion[] => [
  ...FRAME_PLATE,
  ...TAB_ROWS.map(({ centre, tab, wordEnd }) =>
    tab === openTab
      ? { height: 96, width: 490, x: 215, y: Math.round(centre - 46) }
      : { height: 64, width: wordEnd - 236, x: 240, y: Math.round(centre - 28) },
  ),
  ...(TAB_PLATE[openTab] ?? []),
];
