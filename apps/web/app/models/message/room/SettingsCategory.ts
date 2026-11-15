// Discord Server Settings sidebar categories — the General category renders the room name as its title
export const SettingsCategory = {
  General: "General",
  Integrations: "Integrations",
  Moderation: "Moderation",
  UserManagement: "User Management",
} as const;
export type SettingsCategory = (typeof SettingsCategory)[keyof typeof SettingsCategory];

export const SettingsCategories = Object.values(SettingsCategory);
