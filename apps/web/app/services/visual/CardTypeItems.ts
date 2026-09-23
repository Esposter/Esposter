import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { CardType } from "@/models/visual/CardType";

export const CardTypeItems: UiMenuItem<CardType>[] = Object.values(CardType).map((cardType) => ({
  title: cardType,
  value: cardType,
}));
