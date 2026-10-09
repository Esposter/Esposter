import type { ArchiveBook } from "#src/models/archive/ArchiveBook";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openArchiveBook } from "#src/services/archive/openArchiveBook";
import { describe, expect, test } from "vitest";

describe(openArchiveBook, () => {
  const MATERIAL_ID = 10;
  const BOOK_ID = 1;
  const books: ArchiveBook[] = [{ bodyId: 2, id: BOOK_ID, materialId: MATERIAL_ID, nameTextId: "3" }];
  const emptyProgress: ArchiveProgress = new Map();

  test("opens the volume whose material was picked up in the Books section", () => {
    expect.hasAssertions();

    expect(openArchiveBook(emptyProgress, books, MATERIAL_ID)).toStrictEqual(
      new Map([[ArchiveSection.Books, new Set([BOOK_ID])]]),
    );
  });

  test("leaves the progress as it was for an item that is no volume's material", () => {
    expect.hasAssertions();

    expect(openArchiveBook(emptyProgress, books, MATERIAL_ID + 1)).toBe(emptyProgress);
  });
});
