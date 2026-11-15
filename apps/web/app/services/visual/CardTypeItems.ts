import type { UiMenuItem } from "#src/models/ui/UiMenuItem";

import { CardType } from "#src/models/visual/CardType";

export const CardTypeItems: UiMenuItem<CardType>[] = Object.values(CardType).map((cardType) => ({
  title: cardType,
  value: cardType,
}));
