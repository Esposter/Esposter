import { ControlsImageKey } from "@/models/dungeons/keys/image/UI/ControlsImageKey";
import { MonsterImageKey } from "@/models/dungeons/keys/image/UI/MonsterImageKey";
import type { MergeNonConflictingKeys } from "@/util/types/MergeNonConflictingKeys";

const BaseUIImageKey = {
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

export const UIImageKey = {
  ...BaseUIImageKey,
  ...ControlsImageKey,
  ...MonsterImageKey,
} as const satisfies MergeNonConflictingKeys<[typeof BaseUIImageKey, typeof ControlsImageKey, typeof MonsterImageKey]>;
