import { ControlsKey } from "@/models/dungeons/keys/image/UI/ControlsKey";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";

export const ImageKey = mergeObjectsStrict(
  {
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
  } as const,
  ControlsKey,
  MonsterKey,
);
export type ImageKey = keyof typeof ImageKey;
