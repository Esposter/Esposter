import type { Color } from "vuetify/lib/util/colorUtils.mjs";

import { ClickerType } from "#shared/models/clicker/data/ClickerType";

export const getColorMap = ({ error, info, primary }: ReturnType<typeof useColors>) =>
  ({
    [ClickerType.Default]: primary.value,
    [ClickerType.Magical]: info.value,
    [ClickerType.Physical]: error.value,
  }) as const satisfies Record<ClickerType, Color>;
