import type { Character } from "#src/models/Character";

import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";

export const getRosterLine = ({ birthday, displayElement, displayName, region, title, version }: Character): string =>
  [displayName, title, displayElement, region, birthday, `v${version}`].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
