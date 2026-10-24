import type { KeyAction } from "@/models/pageBuilder/KeyAction";
import type { KeyScope } from "@/models/pageBuilder/KeyScope";

// One key a handler takes. A modifier that is undefined may be held or not, while true requires it held and false requires it not
export interface KeyBinding {
  action: KeyAction;
  alt?: boolean;
  command?: boolean;
  key: string;
  scope: KeyScope;
  // Enter edits a text node only when no control holds focus, since a focused button or link takes Enter as its own activation
  skipOnControl?: boolean;
}
