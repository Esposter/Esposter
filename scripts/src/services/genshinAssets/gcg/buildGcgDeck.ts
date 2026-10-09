import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";
import type { ExcelGcgCharRow } from "#src/models/genshinAssets/gcg/ExcelGcgCharRow";
import type { ExcelGcgCostRow } from "#src/models/genshinAssets/gcg/ExcelGcgCostRow";
import type { ExcelGcgDeckRow } from "#src/models/genshinAssets/gcg/ExcelGcgDeckRow";
import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";
import type { GcgDeckSlice } from "#src/models/genshinAssets/gcg/GcgDeckSlice";

import { toGcgDeck } from "#src/services/genshinAssets/gcg/toGcgDeck";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset, gcgDeckSchema } from "genshin-world";

// One deck's slice, read from the dump's deck, character, skill, card and cost tables, checked against its schema and
// Published as `gcg/deck<id>`. The dump's obfuscated keys are not read: the fields are the plain names the rows carry
export const buildGcgDeck = (deckId: number, createdCardIds: number[]): Record<string, GcgDeckSlice> => {
  const deckRow = readExcelTable<ExcelGcgDeckRow>("GCGDeckExcelConfigData").find(({ id }) => id === deckId);
  if (!deckRow) throw new InvalidOperationError(Operation.Read, "deck", `the deck table holds no deck ${deckId}`);
  const deckSlice = gcgDeckSchema.parse(
    toGcgDeck(
      deckRow,
      readExcelTable<ExcelGcgCharRow>("GCGCharExcelConfigData"),
      readExcelTable<ExcelGcgSkillRow>("GCGSkillExcelConfigData"),
      readExcelTable<ExcelGcgCardRow>("GCGCardExcelConfigData"),
      createdCardIds,
      readExcelTable<ExcelGcgCostRow>("GCGCostExcelConfigData"),
    ),
  );
  return { [`${GameDataset.Gcg}/deck${deckId}`]: deckSlice };
};
