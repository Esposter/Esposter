import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";

import { MenuPromptIcon } from "#src/models/menu/MenuPromptIcon";

// Each prompt button's icon, traced from the English PC client's prompt, its box at its own offset from its button's top
// Left in the reference's pixels, so each sits on its button's disc
export const MenuPromptGlyphMap: Readonly<Record<MenuPromptIcon, MenuIconGlyph>> = {
  [MenuPromptIcon.ContinueGame]: {
    height: 32,
    paths: [
      "M10.83 2.67l1.34.33 6 4.67 2 2 1.33.66 5.17 4.17q.66.83.33 2.67l-1.5 1.83-3 2-10.67 8.67h-1.33l-.83-.84v-25l.33-.83.83-.33z",
    ],
    width: 32,
    x: 26,
    y: 26,
  },
  [MenuPromptIcon.ExitToDesktop]: {
    height: 32,
    paths: [
      "M13.33 0h5v9.83l-.33 1-1.17 1.17-1.33.33-1.5-.83-.67-1v-10.5zm-6.83 1.67h1.33q.34.83 1.17.66l.33.84v1.66l-.83 1.17-2.5 2.17-1 1.33-1.67 4v5l1.67 4.33 2.83 3.17 4.34 2.33q1.33-.33 1.66.34h4l4-1.34 4.17-3.83 2-3.67q-.42-1.58.33-2v-3.66q-.66-.34-.33-1.67l-1.33-2.67-2.84-3.5-1.5-1.16-.33-1.67 1.17-1.5q.61-.56 2-.33 2.77 1.39 4.5 3.83l1.33 2 .33 1.17.67.16v14.84q-.89-.38-.67.5l-1.66 2.66-3.17 3.17-3 2h-15.83q.37-.89-.5-.67-2.85-1.48-4.84-3.83l-1.83-2.83-.5-.17v-16.83l1-.5.33-1 1.5-1.84 2.34-2 1.33-.66z",
    ],
    width: 32,
    x: 26,
    y: 26,
  },
  [MenuPromptIcon.ExitToLoginInterface]: {
    height: 32,
    paths: [
      "M6.67 0h21.83q.29-.04.17 1.17l.33.33v29.33q-.58.31-.33 1.17h-21.84l-.16-.17v-2.66l.83-.84h2.5l.33 1.34.84.33h13.33l.83-1.17v-25.66l-.83-.84h-13.33l-.84.34-.33 1.33h-2.5l-.83-.33v-3.67zm2.5 7.67.83.33q-.25.86.33 1.17v4l.5.5h7.67l1.5.83q.67.83.33 2.67l-.83 1.16-1 .34h-7.33l-.84.83v3.67q-.58.3-.33 1.16l-1.5.34-7.5-7.17v-.5h-1v-1.67q1 .25 1.33-.5l1.84-2.16 1.16-.84.5-.83q.75.25.5-.5l1-.5.5-1 2.34-1.33z",
    ],
    width: 32,
    x: 24,
    y: 26,
  },
  // The World Level dialog's red arrow, traced at scale 3 from its 3840 wide recording (`world-level-dialog-2025.mkv` at 8
  // Seconds) and divided down to the game's 1080 high pixels, placed on the disc as the 1080 recording
  // (`world-level-dialog-2024.mkv` at 5 seconds) measures it: ink from y 818 to 839, centred on the disc's x 806
  [MenuPromptIcon.LowerWorldLevel]: {
    height: 26,
    paths: [
      "M12.25 2h3l.17.17 1.58.16q-.08.42.33.59v1q.42.08.34.66l-.17.17.5.5v1l.17.5-.17.17v2.16l.17.17v2.5l.25.25 1 .33h.66l.34.34h.58l.17.41v1l-.42.75q-.55-.18-.42.25l-.58 1.09q-.5-.09-.58.25.08.66-.42.75-.5-.09-.58.25v.33l-.59.58q-.37-.12-.25.25l-.75.75h-.25q.09.48-.41.67-1.11.06-1.59.75l-.41.58q-.5-.08-.59.25l-.25.42-.5.17q-.2-.38-1-.17l-.58-.42q.13-.37-.25-.25l-.75-.58-.42-.58h-.33q-.31-.48-.92-.5v-.25l-1.16-1.34-.17-.66-.25-.25-1.17-.17-.58-.42-.25-.41-.58-.42v-.67l-.42-.75-.92-.33-.16-.42v-.83l.58-.58h2.67l.91-.59.34-.66v-.5l.16-.42.5-.25v-4.83l-.5-1.5.17-.42q.5.21.33-.42l.42-.41h1.33l.17.16h1.83l.67-.33z",
    ],
    width: 25,
    x: 19,
    y: 18,
  },
};
