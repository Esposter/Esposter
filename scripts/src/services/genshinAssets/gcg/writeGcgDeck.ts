import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";
import type { ExcelGcgCharRow } from "#src/models/genshinAssets/gcg/ExcelGcgCharRow";
import type { ExcelGcgCostRow } from "#src/models/genshinAssets/gcg/ExcelGcgCostRow";
import type { ExcelGcgDeckRow } from "#src/models/genshinAssets/gcg/ExcelGcgDeckRow";
import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";

import { GCG_GENERATED_DIRECTORY } from "#src/services/genshinAssets/gcg/constants";
import { toGcgDeck } from "#src/services/genshinAssets/gcg/toGcgDeck";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { gcgDeckSchema } from "genshin-world";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// One deck's slice, read from the dump's deck, character, skill, card and cost tables, checked against its schema and
// Written beside the standard rule's slice as deck<id>.json. The dump's obfuscated keys are not read: the fields are the
// Plain names the rows carry
export const writeGcgDeck = (deckId: number, createdCardIds: number[]): void => {
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
  mkdirSync(GCG_GENERATED_DIRECTORY, { recursive: true });
  writeJsonFile(join(GCG_GENERATED_DIRECTORY, `deck${deckId}.json`), deckSlice);
};
