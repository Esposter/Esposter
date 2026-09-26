// How a key in Vuetify 0's hotkey syntax reads on a key cap, for the keys whose name is not their label
export const UiKeyLabelMap: Record<string, string> = {
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  // Vuetify 0 reads it as Meta on a Mac and Ctrl everywhere else
  cmd: "Ctrl/⌘",
  escape: "Esc",
  // A bare "/" is a combination separator in the hotkey syntax, so the key is spelled by its alias
  slash: "/",
};
