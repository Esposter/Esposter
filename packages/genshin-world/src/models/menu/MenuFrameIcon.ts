// The Paimon menu's frame icons: the side bar's, Back, and the profile card's
export const MenuFrameIcon = {
  Back: "Back",
  Close: "Close",
  Copy: "Copy",
  Edit: "Edit",
  ExpBadge: "ExpBadge",
  Info: "Info",
  Mail: "Mail",
  Notices: "Notices",
  PhotoMode: "PhotoMode",
  Quit: "Quit",
  Settings: "Settings",
  SettingsGear: "SettingsGear",
  Time: "Time",
} as const;
export type MenuFrameIcon = (typeof MenuFrameIcon)[keyof typeof MenuFrameIcon];
