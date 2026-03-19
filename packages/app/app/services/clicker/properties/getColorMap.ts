import type { Color } from "vuetify/lib/util/colorUtils.mjs";

import { ClickerType } from "#shared/models/clicker/data/ClickerType";

export const getColorMap = ({ error, info, primary }: { error: Color | undefined; info: Color | undefined; primary: Color | undefined }) =>
  ({
    [ClickerType.Default]: primary,
    [ClickerType.Magical]: info,
    [ClickerType.Physical]: error,
  }) as const satisfies Record<ClickerType, Color | undefined>;
