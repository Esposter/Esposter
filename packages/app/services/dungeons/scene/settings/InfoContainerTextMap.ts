import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";

export const InfoContainerTextMap = {
  [SettingsOption.Animations]: "Select to display animations and effects or not.",
  [SettingsOption.Close]: "Save your changes and go back to the main menu.",
  [SettingsOption.Sound]: "Select to enable or disable the sound.",
  [SettingsOption.VolumePercentage]: "Select the volume for the music and sound effects of the game.",
  [SettingsOption["Battle Style"]]: "Select to allow your monster to be recalled between rounds.",
  [SettingsOption["Text Speed"]]: "Select one of three text display speeds.",
  [SettingsOption["Theme Mode"]]: "Select one of the three theme modes.",
} as const satisfies Record<SettingsOption, string>;
