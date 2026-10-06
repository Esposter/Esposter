import type { ComponentReference } from "#src/models/reference/ComponentReference";

import { spritesTopic } from "#src/components/RoundButton/Sprites.reference";
import { GameSourceKind } from "#src/models/reference/GameSourceKind";

// The round button's sources in the game's data, and its one topic, its sprites, with what every investigation
// Found and what is still open
export const reference: ComponentReference = {
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
      capture: "session-2.mp4",
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
  topics: { sprites: spritesTopic },
};
