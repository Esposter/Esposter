export const AppearanceSettingsSection = { MessageDisplay: "Message Display" } as const;
export type AppearanceSettingsSection = (typeof AppearanceSettingsSection)[keyof typeof AppearanceSettingsSection];

export const AppearanceSettingsSections = Object.values(AppearanceSettingsSection);
