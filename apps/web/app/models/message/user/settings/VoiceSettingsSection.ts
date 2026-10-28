export enum VoiceSettingsSection {
  Devices = "Devices",
  InputMode = "Input Mode",
  InputProfile = "Input Profile",
  InputSensitivity = "Input Sensitivity",
  JoinSettings = "Join Settings",
}

// The sections in the order the settings render them, which the enum's own order no longer carries
export const VoiceSettingsSections = [
  VoiceSettingsSection.Devices,
  VoiceSettingsSection.InputProfile,
  VoiceSettingsSection.InputSensitivity,
  VoiceSettingsSection.InputMode,
  VoiceSettingsSection.JoinSettings,
];
