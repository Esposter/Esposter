import { PlayerSettingsOption } from "@/models/dungeons/settings/PlayerSettingsOption";

export const InfoContainerTextMap = {
  [PlayerSettingsOption["Text Speed"]]: "Choose one of three text display speeds.",
  [PlayerSettingsOption.Animations]: "Choose to display animations and effects or not.",
  [PlayerSettingsOption["Battle Style"]]: "'Choose to allow your monster to be recalled between rounds.",
  [PlayerSettingsOption.Sound]: "Choose to enable or disable the sound.",
  [PlayerSettingsOption.Volume]: "Choose the volume for the music and sound effects of the game.",
  [PlayerSettingsOption["Menu Color"]]: "Choose one of the three menu color options.",
  [PlayerSettingsOption.Close]: "Save your changes and go back to the main menu.",
} as const satisfies Record<PlayerSettingsOption, string>;
