export const SettingsOption = {
  Animations: "Animations",
  "Battle Style": "Battle Style",
  Close: "Close",
  Sound: "Sound",
  "Text Speed": "Text Speed",
  "Theme Mode": "Theme Mode",
  VolumePercentage: "Volume",
} as const;
export type SettingsOption = (typeof SettingsOption)[keyof typeof SettingsOption];
