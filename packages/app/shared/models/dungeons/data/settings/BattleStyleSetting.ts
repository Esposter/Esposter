import { z } from "zod";

export enum BattleStyleSetting {
  Set = "Set",
  Shift = "Shift",
}

export const battleStyleSettingSchema = z.nativeEnum(
  BattleStyleSetting,
) as const satisfies z.ZodType<BattleStyleSetting>;
