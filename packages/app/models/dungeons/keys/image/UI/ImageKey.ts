import { ControlsKey } from "@/models/dungeons/keys/image/UI/ControlsKey";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";

enum BaseImageKey {
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
  HealthBarLeftCapShadow = "HealthBarLeftCapShadow",
  HealthBarMiddleShadow = "HealthBarMiddleShadow",
  HealthBarRightCapShadow = "HealthBarRightCapShadow",
}

export const ImageKey = mergeObjectsStrict(BaseImageKey, ControlsKey, MonsterKey);
export type ImageKey = BaseImageKey | ControlsKey | MonsterKey;
