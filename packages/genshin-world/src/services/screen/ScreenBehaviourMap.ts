import type { ScreenBehaviour } from "#src/models/screen/ScreenBehaviour";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { MENU_SCREEN_BEHAVIOUR } from "#src/services/screen/constants";

// What each screen does to the world under it: every menu holds it, as the game's single-player menus pause it, and
// Photo mode alone leaves the clock running and the camera flying, the pointer still turning it, with the HUD hidden
export const ScreenBehaviourMap: Readonly<Record<ScreenKind, Readonly<ScreenBehaviour>>> = {
  [ScreenKind.Achievements]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.AdventurerHandbook]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Archive]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.BattlePass]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Character]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.CharacterArchive]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Chat]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.CoOp]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Events]: MENU_SCREEN_BEHAVIOUR,
  [ScreenKind.Friends]: MENU_SCREEN_BEHAVIOUR,
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
