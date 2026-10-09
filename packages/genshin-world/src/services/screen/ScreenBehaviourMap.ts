import type { ScreenBehaviour } from "#src/models/screen/ScreenBehaviour";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { MENU_SCREEN_BEHAVIOUR } from "#src/services/screen/constants";

// What each screen does to the world under it: every menu holds it, as the game's single-player menus pause it, while
// Photo mode and a talk leave the clock running with the HUD hidden, photo mode's camera orbiting the held character and
// Its pointer turning it, and a talk's pointer let go for its replies
export const ScreenBehaviourMap: Readonly<Record<ScreenKind, Readonly<ScreenBehaviour>>> = {
  [ScreenKind.Achievements]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.AdventurerHandbook]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Archive]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.BattlePass]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Character]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.CharacterArchive]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Chat]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.CoOp]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Dialogue]: { isHeld: false, isHudHidden: true, isPointerReleased: true },
  [ScreenKind.Events]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Forge]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Friends]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.GcgDuel]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Inventory]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Mail]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Map]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Notices]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.PaimonMenu]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.PartySetup]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.PhotoMode]: { isHeld: false, isHudHidden: true, isPointerReleased: false },
  [ScreenKind.Quests]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Settings]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Shop]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Time]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.TrainingGuide]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Wish]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.World]: { isHeld: false, isHudHidden: false, isPointerReleased: false },
};
