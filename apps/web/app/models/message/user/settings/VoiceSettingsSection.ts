/* eslint-disable perfectionist/sort-enums -- declaration order is the order the sections render */
export enum VoiceSettingsSection {
  Devices = "Devices",
  InputProfile = "Input Profile",
  InputSensitivity = "Input Sensitivity",
  InputMode = "Input Mode",
  JoinSettings = "Join Settings",
}

export const VoiceSettingsSections = Object.values(VoiceSettingsSection);
