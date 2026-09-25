/* eslint-disable perfectionist/sort-enums -- declaration order is the settings nav order */
export enum UserSettingsType {
  Account = "My Account",
  Appearance = "Appearance",
  Voice = "Voice & Video",
  Notifications = "Notifications",
  Keybinds = "Keybinds",
}

export const UserSettingsTypes = Object.values(UserSettingsType);
