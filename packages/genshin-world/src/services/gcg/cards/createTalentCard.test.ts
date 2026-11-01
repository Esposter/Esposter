import type { GcgCard } from "#src/models/gcg/GcgCard";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { describe } from "vitest";

export const createTalentCard = (): GcgCard => ({
  costs: [],
  descriptionTextId: 1,
  effects: [],
  id: 211_031,
  isLocation: false,
  kind: GcgCardKind.Talent,
  nameTextId: 1,
});

describe.todo("createTalentCard");
