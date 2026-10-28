import type { KeyBinding } from "@/models/pageBuilder/KeyBinding";

import { KeyAction } from "@/models/pageBuilder/KeyAction";
import { KeyScope } from "@/models/pageBuilder/KeyScope";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { checkIsElementTarget } from "@/util/dom/checkIsElementTarget";

// Every key the page builder takes: the canvas's own keys in its frame, and for the editor, Alt with an arrow to move the node,
// Ctrl or Cmd with C, X or V for the clipboard, Enter to edit a text node, and Delete or Backspace to delete the node
const KEY_BINDINGS: KeyBinding[] = [
  { action: KeyAction.NextNode, alt: false, command: false, key: "ArrowDown", scope: KeyScope.Canvas },
  { action: KeyAction.PreviousNode, alt: false, command: false, key: "ArrowUp", scope: KeyScope.Canvas },
  { action: KeyAction.ParentNode, alt: false, command: false, key: "Escape", scope: KeyScope.Canvas },
  { action: KeyAction.Copy, command: true, key: "c", scope: KeyScope.Editor },
  { action: KeyAction.Cut, command: true, key: "x", scope: KeyScope.Editor },
  { action: KeyAction.Paste, command: true, key: "v", scope: KeyScope.Editor },
  { action: KeyAction.StartTextEdit, key: "Enter", scope: KeyScope.Editor, skipOnControl: true },
  { action: KeyAction.MoveDown, alt: true, key: "ArrowDown", scope: KeyScope.Editor },
  { action: KeyAction.MoveLeft, alt: true, key: "ArrowLeft", scope: KeyScope.Editor },
  { action: KeyAction.MoveRight, alt: true, key: "ArrowRight", scope: KeyScope.Editor },
  { action: KeyAction.MoveUp, alt: true, key: "ArrowUp", scope: KeyScope.Editor },
  { action: KeyAction.Delete, alt: false, key: "Delete", scope: KeyScope.Editor },
  { action: KeyAction.Delete, alt: false, key: "Backspace", scope: KeyScope.Editor },
];
// A focused button or link takes Enter as its own activation rather than a text edit
const checkIsControlTarget = (target: EventTarget | null) =>
  checkIsElementTarget(target) && target.closest("button, a[href]") !== null;
const checkMatchesModifier = (required: boolean | undefined, held: boolean) =>
  required === undefined || required === held;
// The action the key pressed takes in the scope's handler, or none when the key is not one the handler takes. Keys inside a
// Text field are never taken, so Delete and the arrows keep their own meaning there
export const getKeyAction = (event: KeyboardEvent, scope: KeyScope): KeyAction | undefined => {
  if (checkIsEditableTarget(event.target)) return undefined;

  const key = event.key.toLowerCase();
  const isCommandHeld = event.ctrlKey || event.metaKey;
  return KEY_BINDINGS.find(
    (binding) =>
      binding.scope === scope &&
      binding.key.toLowerCase() === key &&
      checkMatchesModifier(binding.alt, event.altKey) &&
      checkMatchesModifier(binding.command, isCommandHeld) &&
      !(binding.skipOnControl && checkIsControlTarget(event.target)),
  )?.action;
};
