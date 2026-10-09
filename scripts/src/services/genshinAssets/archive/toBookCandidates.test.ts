import type { ExcelBooksCodexRow } from "#src/models/genshinAssets/archive/ExcelBooksCodexRow";
import type { ExcelDocumentRow } from "#src/models/genshinAssets/archive/ExcelDocumentRow";

import { toBookCandidates } from "#src/services/genshinAssets/archive/toBookCandidates";
import { describe, expect, test } from "vitest";

describe(toBookCandidates, () => {
  const MATERIAL_ID = 10;
  const BODY_ID = 20;
  const NAME_TEXT_MAP_HASH = 30;
  const materialRows = [{ id: MATERIAL_ID, nameTextMapHash: NAME_TEXT_MAP_HASH }];
  const documentRows: ExcelDocumentRow[] = [{ documentType: "Book", id: MATERIAL_ID, questIDList: [BODY_ID] }];
  const localizationRows = [{ assetType: "LOC_TEXT", id: BODY_ID }];

  test("joins a codex row to its material's name and its document's body, keeping the codex's order", () => {
    expect.hasAssertions();

    const codexRows: ExcelBooksCodexRow[] = [{ id: 1, isDisuse: false, materialId: MATERIAL_ID, sortOrder: 2 }];

    expect(toBookCandidates(codexRows, materialRows, documentRows, localizationRows)).toStrictEqual([
      { bodyId: BODY_ID, id: 1, materialId: MATERIAL_ID, nameTextMapHash: NAME_TEXT_MAP_HASH, sortOrder: 2 },
    ]);
  });

  test("leaves out a disused row, and a row whose body is not a readable text", () => {
    expect.hasAssertions();

    const disusedCodexRows: ExcelBooksCodexRow[] = [{ id: 1, isDisuse: true, materialId: MATERIAL_ID, sortOrder: 2 }];
    const codexRows: ExcelBooksCodexRow[] = [{ id: 1, isDisuse: false, materialId: MATERIAL_ID, sortOrder: 2 }];

    expect(toBookCandidates(disusedCodexRows, materialRows, documentRows, localizationRows)).toStrictEqual([]);
    expect(toBookCandidates(codexRows, materialRows, documentRows, [])).toStrictEqual([]);
  });
});
