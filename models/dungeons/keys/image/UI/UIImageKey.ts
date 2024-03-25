import { ControlsImageKey } from "@/models/dungeons/keys/image/UI/ControlsImageKey";
import { MonsterImageKey } from "@/models/dungeons/keys/image/UI/MonsterImageKey";

export const UIImageKey = {
  ...ControlsImageKey,
  ...MonsterImageKey,
  BlueButton: "BlueButton",
  BlueButtonSelected: "BlueButtonSelected",
  Cursor: "Cursor",
  CursorWhite: "CursorWhite",
  GlassPanel: "GlassPanel",
  GlassPanelGreen: "GlassPanelGreen",
  GlassPanelPurple: "GlassPanelPurple",
  HealthBarBackground: "HealthBarBackground",
  HealthBarLeftCap: "HealthBarLeftCap",
  HealthBarMiddle: "HealthBarMiddle",
  HealthBarRightCap: "HealthBarRightCap",
  HealthBarLeftCapShadow: "HealthBarLeftCapShadow",
  HealthBarMiddleShadow: "HealthBarMiddleShadow",
  HealthBarRightCapShadow: "HealthBarRightCapShadow",
} as const;
