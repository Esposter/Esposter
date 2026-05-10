export const KeyboardShortcutList = [
  { category: "Navigation", items: [{ description: "Open room search / command palette", keys: ["Ctrl", "K"] }] },
  {
    category: "Messaging",
    items: [
      { description: "Send message", keys: ["Enter"] },
      { description: "New line", keys: ["Shift", "Enter"] },
      { description: "Open slash commands", keys: ["/"] },
      { description: "Mention a user", keys: ["@"] },
    ],
  },
  {
    category: "Editing",
    items: [
      { description: "Save edit", keys: ["Enter"] },
      { description: "Cancel edit", keys: ["Escape"] },
    ],
  },
  {
    category: "General",
    items: [
      { description: "Dismiss / close", keys: ["Escape"] },
      { description: "Open link in new tab", keys: ["Ctrl", "Click"] },
      { description: "Keyboard shortcuts", keys: ["Shift", "?"] },
    ],
  },
] as const;
