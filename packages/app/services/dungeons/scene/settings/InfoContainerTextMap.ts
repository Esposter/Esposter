import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";

export const InfoContainerTextMap = {
  [SettingsOption["Text Speed"]]: "Select one of three text display speeds.",
  [SettingsOption.Animations]: "Select to display animations and effects or not.",
  [SettingsOption["Battle Style"]]: "Select to allow your monster to be recalled between rounds.",
  [SettingsOption.Sound]: "Select to enable or disable the sound.",
  [SettingsOption.VolumePercentage]: "Select the volume for the music and sound effects of the game.",
  [SettingsOption["Theme Mode"]]: "Select one of the three theme modes.",
  [SettingsOption.Close]: "Save your changes and go back to the main menu.",
} as const satisfies Record<SettingsOption, string>;
