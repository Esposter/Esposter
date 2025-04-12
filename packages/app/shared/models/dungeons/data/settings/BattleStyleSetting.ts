import type { Type } from "arktype";

import { type } from "arktype";

export enum BattleStyleSetting {
  Set = "Set",
  Shift = "Shift",
}

export const battleStyleSettingSchema = type.valueOf(BattleStyleSetting) satisfies Type<BattleStyleSetting>;
