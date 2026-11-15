/* eslint-disable perfectionist/sort-objects -- declaration order is the order the sections render */
export const AccountSettingsSection = { Profile: "Profile", LinkedAccounts: "Linked Accounts" } as const;
export type AccountSettingsSection = (typeof AccountSettingsSection)[keyof typeof AccountSettingsSection];

export const AccountSettingsSections = Object.values(AccountSettingsSection);
