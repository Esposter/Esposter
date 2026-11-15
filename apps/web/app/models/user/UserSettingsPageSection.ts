/* eslint-disable perfectionist/sort-objects -- declaration order is the order the sections render */
// Declared in the order they are rendered in: the scrollspy pairs each section with the next one to decide where
// It ends, and the sidebar lists them the same way
export const UserSettingsPageSection = {
  Profile: "profile",
  LinkedAccounts: "linked-accounts",
  Sessions: "sessions",
  ApiKeys: "api-keys",
  DataExport: "data-export",
  DeleteAccount: "delete-account",
} as const;
export type UserSettingsPageSection = (typeof UserSettingsPageSection)[keyof typeof UserSettingsPageSection];

export const UserSettingsPageSections = Object.values(UserSettingsPageSection);
