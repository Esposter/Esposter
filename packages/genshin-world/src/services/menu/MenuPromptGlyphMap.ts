import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";

import { MenuPromptIcon } from "#src/models/menu/MenuPromptIcon";

// Each prompt button's icon, traced from the English PC client's prompt, its box at its own offset from its button's top
// Left in the reference's pixels, so each sits on its button's disc
export const MenuPromptGlyphMap: Readonly<Record<MenuPromptIcon, MenuIconGlyph>> = {
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
