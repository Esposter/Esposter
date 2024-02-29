import { PlayerSettingsMenuOption } from "@/models/dungeons/settings/menu/PlayerSettingsMenuOption";

export const InfoContainerTextMap = {
  [PlayerSettingsMenuOption["Text Speed"]]: "Choose one of three text display speeds.",
  [PlayerSettingsMenuOption.Animations]: "Choose to display animations and effects or not.",
  [PlayerSettingsMenuOption["Battle Style"]]: "'Choose to allow your monster to be recalled between rounds.",
  [PlayerSettingsMenuOption.Sound]: "Choose to enable or disable the sound.",
  [PlayerSettingsMenuOption.Volume]: "Choose the volume for the music and sound effects of the game.",
  [PlayerSettingsMenuOption["Menu Color"]]: "Choose one of the three menu color options.",
  [PlayerSettingsMenuOption.Close]: "Save your changes and go back to the main menu.",
} as const satisfies Record<PlayerSettingsMenuOption, string>;
