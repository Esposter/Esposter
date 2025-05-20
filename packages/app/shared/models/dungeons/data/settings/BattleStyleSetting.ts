import { z } from "zod/v4";

export enum BattleStyleSetting {
  Set = "Set",
  Shift = "Shift",
}

export const battleStyleSettingSchema = z.enum(BattleStyleSetting) satisfies z.ZodType<BattleStyleSetting>;
