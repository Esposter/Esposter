import type { KeybindsSettingsSection } from "@/models/message/user/settings/KeybindsSettingsSection";
import type { NotificationsSettingsSection } from "@/models/message/user/settings/NotificationsSettingsSection";
import type { VoiceSettingsSection } from "@/models/message/user/settings/VoiceSettingsSection";

export type SettingsSection = KeybindsSettingsSection | NotificationsSettingsSection | VoiceSettingsSection;
