export const KeybindsSettingsSection = { Shortcuts: "Shortcuts" } as const;
export type KeybindsSettingsSection = (typeof KeybindsSettingsSection)[keyof typeof KeybindsSettingsSection];

export const KeybindsSettingsSections = Object.values(KeybindsSettingsSection);
