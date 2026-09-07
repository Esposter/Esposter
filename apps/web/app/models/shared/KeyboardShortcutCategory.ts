import type { KeyboardShortcut } from "@/models/shared/KeyboardShortcut";

export interface KeyboardShortcutCategory {
  category: string;
  items: readonly KeyboardShortcut[];
}
