// The settings' tabs, which its side bar lists down the left
export const SettingsTab = {
  Account: "Account",
  Audio: "Audio",
  Controls: "Controls",
  Graphics: "Graphics",
  KeyBindings: "KeyBindings",
  Language: "Language",
  Messages: "Messages",
  Other: "Other",
  Resources: "Resources",
} as const;
export type SettingsTab = (typeof SettingsTab)[keyof typeof SettingsTab];
