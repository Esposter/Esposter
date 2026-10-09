import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";
import type { ExcelGcgCharRow } from "#src/models/genshinAssets/gcg/ExcelGcgCharRow";
import type { ExcelGcgCostRow } from "#src/models/genshinAssets/gcg/ExcelGcgCostRow";
import type { ExcelGcgDeckRow } from "#src/models/genshinAssets/gcg/ExcelGcgDeckRow";
import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";

import {
  GCG_GENERATED_DIRECTORY,
  GCG_TUTORIAL_CREATED_CARD_IDS,
  GCG_TUTORIAL_DECK_ID,
  GCG_TUTORIAL_DECK_PATH,
} from "#src/services/genshinAssets/gcg/constants";
import { toGcgTutorialDeck } from "#src/services/genshinAssets/gcg/toGcgTutorialDeck";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { gcgTutorialDeckSchema } from "genshin-world";
import { mkdirSync, writeFileSync } from "node:fs";

// The tutorial deck's slice, read from the dump's deck, character, skill, card and cost tables, checked against its
// Schema and written beside the Standard rule's slice. The dump's obfuscated keys are not read: the fields are the plain
// Names the rows carry
export const writeGcgTutorialDeck = (): void => {
  const deckRow = readExcelTable<ExcelGcgDeckRow>("GCGDeckExcelConfigData").find(
    ({ id }) => id === GCG_TUTORIAL_DECK_ID,
  );
  if (!deckRow)
    throw new InvalidOperationError(
      Operation.Read,
      "tutorial deck",
      `the deck table holds no deck ${GCG_TUTORIAL_DECK_ID}`,
    );
  const tutorialDeck = gcgTutorialDeckSchema.parse(
    toGcgTutorialDeck(
      deckRow,
      readExcelTable<ExcelGcgCharRow>("GCGCharExcelConfigData"),
      readExcelTable<ExcelGcgSkillRow>("GCGSkillExcelConfigData"),
      readExcelTable<ExcelGcgCardRow>("GCGCardExcelConfigData"),
      GCG_TUTORIAL_CREATED_CARD_IDS,
      readExcelTable<ExcelGcgCostRow>("GCGCostExcelConfigData"),
    ),
  );
  mkdirSync(GCG_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(GCG_TUTORIAL_DECK_PATH, `${JSON.stringify(tutorialDeck, undefined, 2)}\n`);
};
