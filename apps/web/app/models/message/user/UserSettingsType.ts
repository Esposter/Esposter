/* eslint-disable perfectionist/sort-objects -- declaration order is the settings nav order */
export const UserSettingsType = {
  Account: "My Account",
  Appearance: "Appearance",
  Voice: "Voice & Video",
  Notifications: "Notifications",
  Keybinds: "Keybinds",
} as const;
export type UserSettingsType = (typeof UserSettingsType)[keyof typeof UserSettingsType];

export const UserSettingsTypes = Object.values(UserSettingsType);
