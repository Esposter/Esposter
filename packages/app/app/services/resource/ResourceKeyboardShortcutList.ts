import type { KeyboardShortcutCategory } from "@/models/shared/KeyboardShortcutCategory";

export const ResourceKeyboardShortcutList = [
  {
    category: "Search",
    items: [
      { description: "Open the command palette", keys: ["Ctrl", "K"] },
      { description: "Focus search", keys: ["G", "/"] },
    ],
  },
  {
    category: "Navigation",
    items: [
      { description: "Go to All resources", keys: ["G", "A"] },
      { description: "Open notifications", keys: ["G", "N"] },
    ],
  },
  {
    category: "General",
    items: [
      { description: "Keyboard shortcuts", keys: ["Shift", "?"] },
      { description: "Dismiss / close", keys: ["Escape"] },
    ],
  },
] as const satisfies readonly KeyboardShortcutCategory[];
