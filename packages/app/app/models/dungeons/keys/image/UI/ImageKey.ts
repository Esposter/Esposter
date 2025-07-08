import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { BallKey } from "@/models/dungeons/keys/image/UI/BallKey";
import { ControlsKey } from "@/models/dungeons/keys/image/UI/ControlsKey";
import { mergeObjectsStrict } from "@esposter/shared";

enum BaseImageKey {
  BarLeftCapShadow = "BarLeftCapShadow",
  BarMiddleShadow = "BarMiddleShadow",
  BarRightCapShadow = "BarRightCapShadow",
  BlueButton = "BlueButton",
  BlueButtonSelected = "BlueButtonSelected",
  Cursor = "Cursor",
  CursorWhite = "CursorWhite",
  ExperienceBarLeftCap = "ExperienceBarLeftCap",
  ExperienceBarMiddle = "ExperienceBarMiddle",
  ExperienceBarRightCap = "ExperienceBarRightCap",
  GlassPanel = "GlassPanel",
  GlassPanelGreen = "GlassPanelGreen",
  GlassPanelPurple = "GlassPanelPurple",
  HealthBarBackground = "HealthBarBackground",
  HealthBarLeftCap = "HealthBarLeftCap",
  HealthBarMiddle = "HealthBarMiddle",
  HealthBarRightCap = "HealthBarRightCap",
}

export const ImageKey = mergeObjectsStrict(BallKey, BaseImageKey, ControlsKey, MonsterKey);
export type ImageKey = BallKey | BaseImageKey | ControlsKey | MonsterKey;
