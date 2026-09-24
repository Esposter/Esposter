// How a key in Vuetify's hotkey syntax reads on a key cap, for the keys whose name is not their label
export const UiKeyLabelMap: Record<string, string> = {
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  // Vuetify reads it as Meta on a Mac and Ctrl everywhere else
  cmd: "Ctrl/⌘",
  escape: "Esc",
};
