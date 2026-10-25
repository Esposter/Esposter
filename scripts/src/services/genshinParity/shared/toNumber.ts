import type { Token } from "#src/models/genshinParity/shared/Token";

import { SvgPathTokenType } from "#src/models/genshinParity/shared/SvgPathTokenType";
import { formatNumber } from "#src/services/genshinParity/shared/formatNumber";

export const toNumber = (value: number, scale: number): Token => ({
  text: formatNumber(value, scale),
  type: SvgPathTokenType.Number,
});
