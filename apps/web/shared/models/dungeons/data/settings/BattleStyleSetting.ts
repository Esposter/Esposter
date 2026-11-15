import { z } from "zod";

export const BattleStyleSetting = { Set: "Set", Shift: "Shift" } as const;
export type BattleStyleSetting = (typeof BattleStyleSetting)[keyof typeof BattleStyleSetting];

export const battleStyleSettingSchema = z.enum(BattleStyleSetting) satisfies z.ZodType<BattleStyleSetting>;
