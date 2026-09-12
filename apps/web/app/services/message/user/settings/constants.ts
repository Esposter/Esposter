import type { KeybindShortcut } from "@/models/message/user/settings/KeybindShortcut";

// Read-only reference for now; rebinding is a future enhancement (the PTT keybind is editable under Voice & Video).
export const KEYBIND_SHORTCUTS: KeybindShortcut[] = [
  { keys: "Ctrl + K", title: "Open command palette" },
  { keys: "↑", title: "Edit your last message" },
  { keys: "Esc", title: "Cancel editing / close" },
];
