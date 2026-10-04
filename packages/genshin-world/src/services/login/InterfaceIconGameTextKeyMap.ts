import { InterfaceIcon } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// What each of the login's round buttons does, in the game's own words, which a screen reader says in place of its
// Glyph
export const InterfaceIconGameTextKeyMap: Record<InterfaceIcon, GameTextKey> = {
  [InterfaceIcon.Exit]: GameTextKey.LoginLogOut,
  [InterfaceIcon.Notice]: GameTextKey.LoginNotices,
  [InterfaceIcon.Power]: GameTextKey.LoginQuit,
  [InterfaceIcon.Repair]: GameTextKey.LoginRepair,
  [InterfaceIcon.Settings]: GameTextKey.LoginSettings,
};
