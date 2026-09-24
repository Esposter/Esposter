import type { UiCommand } from "@/models/ui/UiCommand";

const MESSAGES_GROUP = "Messages";

// The composer's own keys, which it handles itself: registered while it is mounted so the shortcuts dialog lists them,
// And read by the keybinds settings, where the composer is not
export const MessageInputCommands = [
  { group: MESSAGES_GROUP, id: "send-message", shortcut: "enter", title: "Send message" },
  { group: MESSAGES_GROUP, id: "new-line", shortcut: "shift+enter", title: "New line" },
  { group: MESSAGES_GROUP, id: "open-slash-commands", shortcut: "/", title: "Open slash commands" },
  { group: MESSAGES_GROUP, id: "mention-user", shortcut: "@", title: "Mention a user" },
  { group: MESSAGES_GROUP, id: "edit-last-message", shortcut: "arrowup", title: "Edit your last message" },
  { group: MESSAGES_GROUP, id: "save-edit", shortcut: "enter", title: "Save edit" },
  { group: MESSAGES_GROUP, id: "cancel-edit", shortcut: "escape", title: "Cancel edit" },
  { group: MESSAGES_GROUP, id: "open-link-in-new-tab", shortcut: "ctrl+click", title: "Open link in new tab" },
] as const satisfies readonly UiCommand[];
