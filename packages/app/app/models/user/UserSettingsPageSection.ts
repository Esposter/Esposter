/* eslint-disable perfectionist/sort-enums */
// Declared in the order they are rendered in: the scrollspy pairs each section with the next one to decide where
// It ends, and the sidebar lists them the same way
export enum UserSettingsPageSection {
  Profile = "profile",
  LinkedAccounts = "linked-accounts",
  Sessions = "sessions",
}

export const UserSettingsPageSections = Object.values(UserSettingsPageSection);
