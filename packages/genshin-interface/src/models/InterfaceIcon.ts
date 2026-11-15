// The glyphs the game's round buttons wear, each traced from its login screen
export const InterfaceIcon = {
  Exit: "Exit",
  Notice: "Notice",
  Power: "Power",
  Repair: "Repair",
  Settings: "Settings",
} as const;
export type InterfaceIcon = (typeof InterfaceIcon)[keyof typeof InterfaceIcon];

export const InterfaceIcons: readonly InterfaceIcon[] = Object.values(InterfaceIcon);
