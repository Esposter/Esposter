import { ScreenKind } from "#src/models/screen/ScreenKind";
import { InputAction } from "genshin-engine";

// The screen each shortcut opens from the world, and closes again when it is the one open
export const InputActionScreenKindMap: Readonly<Partial<Record<InputAction, ScreenKind>>> = {
  [InputAction.OpenAdventurerHandbook]: ScreenKind.AdventurerHandbook,
  [InputAction.OpenBattlePass]: ScreenKind.BattlePass,
  [InputAction.OpenCharacter]: ScreenKind.Character,
  [InputAction.OpenChat]: ScreenKind.Chat,
  [InputAction.OpenCoOp]: ScreenKind.CoOp,
  [InputAction.OpenEvents]: ScreenKind.Events,
  [InputAction.OpenFriends]: ScreenKind.Friends,
  [InputAction.OpenInventory]: ScreenKind.Inventory,
  [InputAction.OpenMap]: ScreenKind.Map,
  [InputAction.OpenPaimonMenu]: ScreenKind.PaimonMenu,
  [InputAction.OpenPartySetup]: ScreenKind.PartySetup,
  [InputAction.OpenQuests]: ScreenKind.Quests,
  [InputAction.OpenWish]: ScreenKind.Wish,
};
