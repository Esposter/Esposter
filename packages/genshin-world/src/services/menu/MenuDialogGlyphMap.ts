import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";

import { MenuDialogIcon } from "#src/models/menu/MenuDialogIcon";

// Each dialog icon, traced at scale 2 from the English PC client's World Level dialog at 3840 wide (a public recording,
// `world-level-dialog-2025.mkv` at 8 seconds) and divided down to the game's 1080 high pixels, its box placed from the
// Dialog frame's top left as the 1080 recording (`world-level-dialog-2024.mkv` at 5 seconds) measures it
export const MenuDialogGlyphMap: Readonly<Record<MenuDialogIcon, MenuIconGlyph>> = {
  // The cross's ink spans x 1414 to 1447 and y 211 to 244 of the 1080 frame, the frame's top left at (421, 182)
  [MenuDialogIcon.Close]: {
    height: 42,
    paths: [
      "M5.38 4.25h2.75l.25.25q1.18-.31 1.5.25h2.25l.25.25.5-.25q.25.5 1.25.25l.37.38q.46.54.25 1.75l-.5.75v.5l2.13 2.87q.97.16 1.37.88l.25.75 3.13 3.12h1.5l1-1h.37v-.37l1.25-1.25v-.38l.75-.37q-.19-.57.38-.38l.87-.87v-.38q.67.28.5-.37l1.5-2v-1.25l-.25-.25v-1.5l.63-.63.75-.25h3.25l.25-.25q1.18.31 1.5-.25h2.5l.87.63.25.5v2.25l-.25.25v1.5l-.25.25q.31 1.18-.25 1.5v2l-.25.75-.62.62h-.75l-1.5-.75-1.25.5-1.75 1.75q-1.35.28-1.88 1.38l-2 2.25v.37q-.72-.12-1 .63l-.25 1.25 5.38 5.12q1.62.63 2.5 2h.75q.46-.91 1.75-1l.62.25.25.63v.75l.25.25v3.25l.25.25v2.75q.44.18.25 1l-.25.75-.62.62-3.5-.25-.25-.25h-2l-.25-.25h-1.75l-1.38-.87.25-3-.25-.75-1.12-1.13-.63-.37-.5-1-2.37-2.38-1.75-1.5h-1.25l-3.38 2.88-1.87 2.12-1.13.88-.75 1.25v1l.75 1.25v.75l-.87.87-1.25.25q-.32-.56-1.5-.25l-.25.25h-1.75l-.25.25h-1.75l-.75.25q-.19-.44-1-.25l-.88-.87-.25-1 .25-.25q-.31-1.19.25-1.5l.25-4.5.5-1.5.63-.63q1.17.21 1.75 1h.75q.7-1.04 2-1.5l2.75-2.75 1-.75h.37v-.37l1.75-2v-1.25q-1.65-.85-2.75-2.25l-1.12-1.38q-2-1-3.25-2.75l-1.25-.25-1.25.75h-.75l-.63-.62v-.75l-.5-1v-1.75l-.25-.25v-4.25l-.25-.75.63-.88z",
    ],
    width: 44,
    x: 988,
    y: 24,
  },
  // The top left ornament, its bright gold over x 415 to 443 and y 175 to 203, standing out of the frame's corner
  [MenuDialogIcon.Corner]: {
    height: 40,
    paths: [
      "M8.63 4.75h22.5l1.25.5h1l1.62 1.38.25 1.25-.62.62q-.82-.19-1 .25h-1.5l-2.25 1.5-3 .25-.88.63-.37.62h-1l-2.75 1.75q-1.32-.31-1.63.38-.19 1.18.63 1.37l.5.25h3l1.5-.75 2-.25 1.5-1h1.75q.75.38.37 1.88l-1 1.75-.25 1.5-1 2.25q.19.81-.25 1v2l.25.25v1l.75 1.75.25 1.5q1 .5 1.25 1.75l-.62.87-3-.75-1.5-1h-1l-.75.25-.25-.25q-1.19.31-1.5-.25h-1.75l-1.25.5h-1.25l-.75.25-1.75 1.25-1.5.25q-.72-.4-.88-1.37l.75-1.5v-1.75l.5-.5.5-1.5v-4q-.44-.19-.25-1l-.37-.38q-1-.12-1.13.63l-.5.75-.5 2-.75 1.5v1.37h-.37l-.88.88-.5 2-.5.5q.19.81-.25 1v2.25l-.75 2.12h-1.37l-1.13-.5v-.37l-1-1q.25-1-.25-1.25v-4.25l-.25-.25v-17.5l.75-1.75.25-1.5.63-.63.75-.25h1.25l.25-.25z",
    ],
    width: 40,
    x: -11.5,
    y: -12,
  },
};
