import { TextSpeedSetting } from "#shared/models/dungeons/data/settings/TextSpeedSetting";

export const TextSpeedDelayMap = {
  [TextSpeedSetting.Fast]: 50,
  [TextSpeedSetting.Mid]: 30,
  [TextSpeedSetting.Slow]: 15,
} as const satisfies Record<TextSpeedSetting, number>;
