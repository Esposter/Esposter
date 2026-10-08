import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";

import { MenuPromptIcon } from "#src/models/menu/MenuPromptIcon";

// Each quit prompt icon, traced from the English PC client's prompt, its box at its own offset from its button's top
// Left in the reference's pixels, so each sits on its button's disc
export const MenuPromptGlyphMap: Readonly<Record<MenuPromptIcon, MenuIconGlyph>> = {
  [MenuPromptIcon.ContinueGame]: {
    height: 32,
    paths: [
      "M 10.83 2.67 L 12.17 3 L 18.17 7.67 L 20.17 9.67 L 21.5 10.33 L 26.67 14.5 Q 27.33 15.33 27 17.17 L 25.5 19 L 22.5 21 L 11.83 29.67 L 10.5 29.67 L 9.67 28.83 L 9.67 3.83 L 10 3 L 10.83 2.67 Z",
    ],
    width: 32,
    x: 26,
    y: 26,
  },
  [MenuPromptIcon.ExitToDesktop]: {
    height: 32,
    paths: [
      "M 13.33 0 L 18.33 0 L 18.33 9.83 L 18 10.83 L 16.83 12 L 15.5 12.33 L 14 11.5 L 13.33 10.5 L 13.33 0 Z M 6.5 1.67 L 7.83 1.67 Q 8.17 2.5 9 2.33 L 9.33 3.17 L 9.33 4.83 L 8.5 6 L 6 8.17 L 5 9.5 L 3.33 13.5 L 3.33 18.5 L 5 22.83 L 7.83 26 L 12.17 28.33 Q 13.5 28 13.83 28.67 L 17.83 28.67 L 21.83 27.33 L 26 23.5 L 28 19.83 Q 27.58 18.25 28.33 17.83 L 28.33 14.17 Q 27.67 13.83 28 12.5 L 26.67 9.83 L 23.83 6.33 L 22.33 5.17 L 22 3.5 L 23.17 2 Q 23.78 1.44 25.17 1.67 Q 27.94 3.06 29.67 5.5 L 31 7.5 L 31.33 8.67 L 32 8.83 L 32 23.67 Q 31.11 23.29 31.33 24.17 L 29.67 26.83 L 26.5 30 L 23.5 32 L 7.67 32 Q 8.04 31.11 7.17 31.33 Q 4.32 29.85 2.33 27.5 L 0.5 24.67 L 0 24.5 L 0 7.67 L 1 7.17 L 1.33 6.17 L 2.83 4.33 L 5.17 2.33 L 6.5 1.67 Z",
    ],
    width: 32,
    x: 26,
    y: 26,
  },
  [MenuPromptIcon.ExitToLoginInterface]: {
    height: 32,
    paths: [
      "M 6.67 0 L 28.5 0 Q 28.79 -0.04 28.67 1.17 L 29 1.5 L 29 30.83 Q 28.42 31.14 28.67 32 L 6.83 32 L 6.67 31.83 L 6.67 29.17 L 7.5 28.33 L 10 28.33 L 10.33 29.67 L 11.17 30 L 24.5 30 L 25.33 28.83 L 25.33 3.17 L 24.5 2.33 L 11.17 2.33 L 10.33 2.67 L 10 4 L 7.5 4 L 6.67 3.67 L 6.67 0 Z M 9.17 7.67 L 10 8 Q 9.75 8.86 10.33 9.17 L 10.33 13.17 L 10.83 13.67 L 18.5 13.67 L 20 14.5 Q 20.67 15.33 20.33 17.17 L 19.5 18.33 L 18.5 18.67 L 11.17 18.67 L 10.33 19.5 L 10.33 23.17 Q 9.75 23.47 10 24.33 L 8.5 24.67 L 1 17.5 L 1 17 L 0 17 L 0 15.33 Q 1 15.58 1.33 14.83 L 3.17 12.67 L 4.33 11.83 L 4.83 11 Q 5.58 11.25 5.33 10.5 L 6.33 10 L 6.83 9 L 9.17 7.67 Z",
    ],
    width: 32,
    x: 24,
    y: 26,
  },
};
