// What a player's buttons ask of the game, each bound to the game's default keys, mouse buttons and gamepad buttons
// By `InputActionBindingMap`. A move or a look is an axis rather than an action, read off the keys and sticks apart
export enum InputAction {
  Aim = "Aim",
  // A gamepad's back out of a screen, which a keyboard leaves to Escape
  Cancel = "Cancel",
  Confirm = "Confirm",
  // Letting go of a wall while climbing
  Drop = "Drop",
  ElementalBurst = "ElementalBurst",
  // Held on a mouse and toggled on a gamepad
  ElementalSight = "ElementalSight",
  ElementalSkill = "ElementalSkill",
  HideInterface = "HideInterface",
  Interact = "Interact",
  Jump = "Jump",
  NormalAttack = "NormalAttack",
  OpenAdventurerHandbook = "OpenAdventurerHandbook",
  OpenBattlePass = "OpenBattlePass",
  OpenCharacter = "OpenCharacter",
  OpenChat = "OpenChat",
  OpenCoOp = "OpenCoOp",
  OpenEvents = "OpenEvents",
  OpenFriends = "OpenFriends",
  OpenInventory = "OpenInventory",
  OpenMap = "OpenMap",
  OpenPaimonMenu = "OpenPaimonMenu",
  OpenPartySetup = "OpenPartySetup",
  OpenQuests = "OpenQuests",
  OpenShortcutWheel = "OpenShortcutWheel",
  OpenWish = "OpenWish",
  QuestNavigation = "QuestNavigation",
  QuickUseGadget = "QuickUseGadget",
  ResetCamera = "ResetCamera",
  ShowCursor = "ShowCursor",
  Sprint = "Sprint",
  SwitchToPartyMember1 = "SwitchToPartyMember1",
  SwitchToPartyMember2 = "SwitchToPartyMember2",
  SwitchToPartyMember3 = "SwitchToPartyMember3",
  SwitchToPartyMember4 = "SwitchToPartyMember4",
  // Between walking and running, as the game's left Control switches
  SwitchWalkRun = "SwitchWalkRun",
}

export const InputActions: readonly InputAction[] = Object.values(InputAction);
