import { GamepadButton } from "#src/models/input/GamepadButton";
import { InputAction } from "#src/models/input/InputAction";
import { MouseButton } from "#src/models/input/MouseButton";

// The game's default bindings on a PC and an Xbox pad, as its controls list them: each action's chords, a chord the
// Codes held together with its last the one whose press triggers it, keys by their physical code so a layout does not
// Move them. A pad's back out of a screen is its own button, and its screens with no button of their own are reached
// Through the Paimon menu, as the game's are
export const InputActionBindingMap: Readonly<Record<InputAction, readonly (readonly string[])[]>> = {
  [InputAction.Aim]: [["KeyR"], [GamepadButton.LeftTrigger]],
  [InputAction.Cancel]: [[GamepadButton.FaceBottom]],
  [InputAction.Confirm]: [[GamepadButton.FaceRight]],
  [InputAction.Drop]: [["KeyX"], [GamepadButton.FaceRight]],
  [InputAction.ElementalBurst]: [["KeyQ"], [GamepadButton.FaceTop]],
  [InputAction.ElementalSight]: [[MouseButton.Auxiliary], [GamepadButton.LeftBumper, GamepadButton.DirectionalPadLeft]],
  [InputAction.ElementalSkill]: [["KeyE"], [GamepadButton.RightTrigger]],
  [InputAction.HideInterface]: [["Backslash"]],
  [InputAction.Interact]: [["KeyF"], [GamepadButton.FaceLeft]],
  [InputAction.Jump]: [["Space"], [GamepadButton.FaceBottom]],
  [InputAction.NormalAttack]: [[MouseButton.Primary], [GamepadButton.FaceRight]],
  [InputAction.OpenAdventurerHandbook]: [["F1"]],
  [InputAction.OpenBattlePass]: [["F4"]],
  [InputAction.OpenCharacter]: [["KeyC"]],
  [InputAction.OpenChat]: [["Enter"], [GamepadButton.Back]],
  [InputAction.OpenCoOp]: [["F2"], [GamepadButton.LeftBumper, GamepadButton.DirectionalPadRight]],
  [InputAction.OpenEvents]: [["F5"]],
  [InputAction.OpenFriends]: [["KeyO"]],
  [InputAction.OpenInventory]: [["KeyB"]],
  [InputAction.OpenMap]: [["KeyM"]],
  [InputAction.OpenPaimonMenu]: [["Escape"], [GamepadButton.Start]],
  [InputAction.OpenPartySetup]: [["KeyL"]],
  [InputAction.OpenQuests]: [["KeyJ"]],
  [InputAction.OpenShortcutWheel]: [["Tab"], [GamepadButton.LeftBumper]],
  [InputAction.OpenWish]: [["F3"]],
  [InputAction.QuestNavigation]: [["KeyV"], [GamepadButton.LeftStick]],
  [InputAction.QuickUseGadget]: [["KeyZ"], [GamepadButton.LeftBumper, GamepadButton.FaceRight]],
  [InputAction.ResetCamera]: [[MouseButton.Auxiliary], [GamepadButton.RightStick]],
  [InputAction.ShowCursor]: [["AltLeft"]],
  [InputAction.Sprint]: [["ShiftLeft"], [MouseButton.Secondary], [GamepadButton.RightBumper]],
  [InputAction.SwitchToPartyMember1]: [["Digit1"], [GamepadButton.DirectionalPadUp]],
  [InputAction.SwitchToPartyMember2]: [["Digit2"], [GamepadButton.DirectionalPadRight]],
  [InputAction.SwitchToPartyMember3]: [["Digit3"], [GamepadButton.DirectionalPadLeft]],
  [InputAction.SwitchToPartyMember4]: [["Digit4"], [GamepadButton.DirectionalPadDown]],
  [InputAction.SwitchWalkRun]: [["ControlLeft"]],
};
