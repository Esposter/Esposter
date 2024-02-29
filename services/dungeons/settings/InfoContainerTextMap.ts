import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";

export const InfoContainerTextMap = {
  [SettingsOption["Text Speed"]]: "Choose one of three text display speeds.",
  [SettingsOption.Animations]: "Choose to display animations and effects or not.",
  [SettingsOption["Battle Style"]]: "Choose to allow your monster to be recalled between rounds.",
  [SettingsOption.Sound]: "Choose to enable or disable the sound.",
  [SettingsOption.Volume]: "Choose the volume for the music and sound effects of the game.",
  [SettingsOption["Menu Color"]]: "Choose one of the three menu color options.",
  [SettingsOption.Close]: "Save your changes and go back to the main menu.",
} as const satisfies Record<SettingsOption, string>;
