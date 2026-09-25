import { COMMAND_PALETTE_SHORTCUT } from "@/services/app/constants";
import { useHotkey } from "@vuetify/v0";
// The palette binds its own key rather than offering itself, and in a field too, since no typing holds Ctrl
export const useCommandPaletteShortcut = (toggle: () => void) => {
  useHotkey(COMMAND_PALETTE_SHORTCUT, toggle, { inputs: true });
};
