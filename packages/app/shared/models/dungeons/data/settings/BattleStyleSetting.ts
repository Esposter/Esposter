import { z } from "zod";

export enum BattleStyleSetting {
  Set = "Set",
  Shift = "Shift",
}

export const battleStyleSettingSchema = z.enum(BattleStyleSetting) satisfies z.ZodType<BattleStyleSetting>;
