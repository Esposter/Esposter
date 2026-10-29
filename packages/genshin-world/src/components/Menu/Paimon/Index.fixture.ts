import { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { InteractionState } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The menu with every screen built, so each entry is drawn as the game draws it, the world's own unbuilt ones disabled
// Being a state of their own
// The account is at Adventure Rank 2 with 385 of its 500 Adventure EXP, a World Level of 0 and no birthday set, as the
// Reference reads; the one rank gate its entries reach, Friends at rank 2, is open
// The red dots are the frame's: on Achievements, the Community, Version Highlights and Survey links, the notices and mail
// Icons, and the profile's pencil
export const props = {
  adventureExpProgress: 0.77,
  adventureRank: 2,
  alertedIcons: [
    MenuEntryIcon.Achievements,
    MenuEntryIcon.Community,
    MenuEntryIcon.VersionHighlights,
    MenuEntryIcon.Survey,
    MenuFrameIcon.Notices,
    MenuFrameIcon.Mail,
    MenuFrameIcon.Edit,
  ],
  checkIsBuilt: () => true,
  finishedMainQuestIds: new Set<number>(),
  gameText: ENGLISH_GAME_TEXT,
  isWorldLevelAdjustable: false,
  isWorldLevelLowered: false,
  namecardItemId: 0,
  namecards: [],
  worldLevel: 0,
};
export const variants = {
  disabled: { checkIsBuilt: () => false },
  hover: { interactionState: InteractionState.Hover },
  pressed: { interactionState: InteractionState.Pressed },
};
