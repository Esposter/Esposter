import type { ComponentReference } from "#src/models/reference/ComponentReference";

import { GameSourceKind } from "#src/models/reference/GameSourceKind";

// The round button's sources in the game's data, what every search over them found, and what is still open
export const reference: ComponentReference = {
  findings: [
    {
      found:
        "Every icon's sprite is trimmed to its ink and centred in its own box, so the game centres each glyph on its button; the traces were up to 2.6 units off, set by their crops, and are centred on their ink's box by InterfaceIconCentreMap",
      search: "Why the spanner, the calendar and the exit glyph sat off the button's middle",
    },
    {
      found:
        "UI_BtnFrame_W52 is the disc (80 by 80 with a 78 unit ink), with UI_BtnFrame_W52_Outline and UI_BtnFrame_W52_Shadow (100 by 100) its rim and shadow",
      search: "Which sprites draw the round button",
    },
  ],
  open: [
    "Each glyph re-traced from its sprite, enlarged, in place of the recording's crop",
    "The disc, rim and shadow's colours and sizes checked against their sprites",
    "The hover and pressed states, from the recordings and the button's sprites",
  ],
  sources: {
    disc: { block: "00/11790361.blk", kind: GameSourceKind.Texture, name: "UI_BtnFrame_W52", role: "The white disc" },
    exitIcon: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Texture,
      name: "UI_IconSmall_Login",
      role: "The door's exit glyph, 64 by 55",
    },
    noticeIcon: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Texture,
      name: "UI_IconSmall_Notice",
      role: "The notices' calendar glyph, 60 by 53",
    },
    outline: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Texture,
      name: "UI_BtnFrame_W52_Outline",
      role: "The disc's rim",
    },
    powerIcon: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Texture,
      name: "UI_IconSmall_Quit",
      role: "The quit glyph, 60 by 62",
    },
    recording: {
      block: "login-interface at 1440 high",
      kind: GameSourceKind.Capture,
      name: "The user's recording of the current build's login",
      role: "The glyphs as traced, eight times enlarged",
    },
    repairIcon: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Texture,
      name: "UI_IconSmall_Repair",
      role: "The repair spanner, 60 by 60",
    },
    settingsIcon: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Texture,
      name: "UI_IconSmall_Settings",
      role: "The settings gear, 62 by 60",
    },
    shadow: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Texture,
      name: "UI_BtnFrame_W52_Shadow",
      role: "The disc's shadow",
    },
  },
};
