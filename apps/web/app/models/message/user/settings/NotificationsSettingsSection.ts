export const NotificationsSettingsSection = { IdleTimeout: "Idle Timeout" } as const;
export type NotificationsSettingsSection =
  (typeof NotificationsSettingsSection)[keyof typeof NotificationsSettingsSection];

export const NotificationsSettingsSections = Object.values(NotificationsSettingsSection);
